# AI ERP Copilot — Architecture Bible

## Chapter 5 — ERP Integration Architecture

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** How the platform gets data **out of** the college's existing systems and **into** the canonical store, without ever becoming a system of record itself — connectors, the adapter abstraction, synchronization models (real-time, scheduled, event-driven), column mapping, entity resolution, and the ingestion pipeline's transactional guarantees.
**Depends on:** Chapter 1 (the integration-first thesis §1.2, hard constraint §4.7 no-silent-data-destruction), Chapter 2 (the integration plane §1, the ingestion lifecycle §4.2, AD-2.1's "ingestion workers are the first seam to extract"), Chapter 4 (tenant-scoped sessions every connector run inherits).
**Does not cover:** The canonical schema itself or the medallion storage model (→ Chapter 6), the semantic layer the AI plane queries (→ Chapter 3/6), or the security mechanism enforcing isolation during ingestion (→ Chapter 8, which builds on the tenant-scoping this chapter assumes).

---

### 0. How this chapter builds on Chapters 1–4

Chapter 1 named the moat: *"the hardest, least glamorous layers must be built first and built well — the integration and entity-resolution layer... because the sellable AI experience rides on top of them and is worthless without them"* (Ch1 §1.2). This chapter is that layer, made concrete. Three commitments already made constrain everything below:

1. **We never become the system of record** (Ch1 §1.1, §7 non-goals). Every connector is a one-directional pull (or push-via-webhook) *into* our canonical store; nothing here ever writes back to a college's ERP.
2. **No silent data destruction** (Ch1 §4.7) — raw is immutable and append-only, bad rows are quarantined with reasons, conflicts are flagged not overwritten. This chapter is where that constraint is operationalized into pipeline mechanics.
3. **Ingestion is the first heavy seam to extract under load** (Ch2 AD-2.1) and **runs in-process today, behind a stage interface, on purpose** (Ch1 §8 MR-2). This chapter designs to that seam from day one rather than discovering it later.

The organizing idea:

> **Sources are not equally open, so the architecture must work for the least open one — without being held hostage by it.** A platform that only ingests from colleges with a clean REST API serves none of the colleges that actually need it. The integration layer's job is to make "how open is your ERP" a tier, not a blocker.

---

### 1. Integration architecture at a glance

```
  SOURCE SYSTEMS (college-owned; we never write to these)
  ERPNext/Fedena (open API) · LMS · payment gateway (webhooks) ·
  Excel/Sheets · biometric logs · MasterSoft/TCS iON (closed)
              │
              ▼
  CONNECTORS (tiered — §3)              SYNCHRONIZATION (§4)
  Tier 1: API pull + webhook            near-real-time (webhook/poll)
  Tier 2: file/sheet, scheduled          scheduled batch (nightly/periodic)
  Tier 3: negotiated export/upload       scheduled, assisted
              │  every connector implements the SAME interface (§3.2)
              ▼
  MAPPING (§5)                          column → canonical field,
                                         versioned, fuzzy-suggested,
                                         human-confirmed, never auto-applied
              │
              ▼
  INGESTION PIPELINE (§7)               RECEIVED→PARSED→MAPPED→CLEANED→
                                         RESOLVED→LOADED→RECONCILED→COMPLETED
              │  entity resolution inside RESOLVED (§6)
              ▼
  PROVENANCE-TAGGED CANONICAL ROWS (§9) → Chapter 6's unified data layer
```

Every box above is tenant-scoped from the moment a request enters the system (Chapter 4's identity layer sets the context before any connector runs); this chapter assumes that scoping rather than re-deriving it.

---

### 2. Design tenets specific to integration

- **Connector-agnostic from day one.** The pipeline never knows which connector produced a row; it consumes a uniform interface. This is what lets Tier 1 API connectors slot in later "with no rework" — a promise that only holds if the abstraction is right from the first connector, not retrofitted.
- **Never gate onboarding on a closed system.** If a college's ERP has no API, that college is *not* blocked — the file/sheet path works for 100% of colleges regardless of which ERP they run. Closedness is handled by tiering down, never by refusing the customer.
- **Confirm, don't assume.** Anywhere a machine makes a probabilistic guess on the integration layer's behalf — a fuzzy column-mapping suggestion, a medium-confidence entity match — a human confirms before it becomes canonical truth. The pipeline never silently commits a guess.
- **Idempotency is not optional.** Every connector run and every pipeline stage must be safely re-runnable. A retried webhook, a re-uploaded file, or a recovery after a crash must never produce a duplicate.
- **Provenance is the moat's receipt.** Every canonical row can answer "which source system, which source record, which import batch made me this way" — not for compliance theater, but because this is the literal data the Accreditation Assistant's evidence trail and Chapter 8's audit model depend on.

---

### 3. The connector abstraction and tiering

#### 3.1 Why tiering, not a single integration strategy

The source landscape is not uniformly open, and pretending otherwise produces an architecture that only works for the easy cases:

| Tier | Reality | Examples | Sync strategy |
|---|---|---|---|
| **Tier 1 — Open API** | Full REST API, often with webhooks | ERPNext/Frappe (open-source, full REST), Fedena (has an API), most LMS, payment gateways | API pull + webhooks → **near-real-time** |
| **Tier 2 — File/sheet** | No integration API, but structured exports exist | Excel/CSV, Google Sheets, biometric export logs | Scheduled sync (nightly/periodic) or upload-triggered |
| **Tier 3 — Closed system** | Locks its data layer or has no public API | MasterSoft (limited/no public API), TCS iON (no public API, template upload only) | Negotiated export / DB access / assisted upload, scheduled |

**This is not a temporary inconvenience to be engineered away — it is a permanent feature of the Indian college ERP market**, and the architecture treats it as a first-class input rather than an edge case. The practical consequence: **the file/sheet (Tier 2) path is built first and kept fully capable**, because it is the only path that works for every college on day one regardless of which ERP they run; Tier 1 API connectors are additive value (lower latency, less manual work) layered on top, never a prerequisite.

> **Ruling INT-3.1 — The file/sheet ingestion path is a permanent, fully-capable tier, not a stopgap superseded by API connectors. No college is ever blocked on integration openness.** *Basis: Ch1 §1.1 (additive, non-threatening positioning); the moat depends on universal coverage.*

#### 3.2 The connector interface — one shape, every tier

Every connector — whatever tier — implements the same minimal contract, and the pipeline stages downstream are written against that contract, never against a specific source:

```
  Connector (abstract)
    discover(content) -> column headers, without reading every row
    read_rows(content) -> one dict per source row: {original_header: raw_value}
```

Two properties of this interface are deliberate and load-bearing:

- **Column mapping happens in a *later* stage, never inside the connector.** The connector's job is purely "get bytes out of the source in a row-shaped form" — it does not know what a canonical `roll_no` is. This separation is what lets the *same* mapping/cleaning/resolution machinery serve a CSV upload today and an ERPNext API pull tomorrow without modification.
- **The first implementation (CSV/Excel) is not a prototype to be thrown away** — it is a permanent Tier 2 citizen of the same interface every future Tier 1 connector will implement. Format detection (CSV vs. Excel) happens once, at the boundary, from the only reliable signal an upload endpoint has (the filename), and everything past that point is connector-agnostic.

> **Ruling INT-3.2 — A single `Connector` interface (discover + read_rows) for every tier; column mapping and all downstream logic are connector-agnostic. New connectors are additions, never modifications to the pipeline.** *Basis: Ch1 §3 Group C (Clean/Hexagonal architecture, ports and adapters); Ch1 §1.2 moat.*

#### 3.3 Why this shape and not the alternatives (comparison)

- *Option A — a bespoke importer per source system.* Fastest to ship one connector, but every new source duplicates parsing, mapping, validation, and resolution logic; the pipeline's correctness guarantees (no data loss, no duplicates) would need to be re-proven per importer. Rejected — it directly undermines the moat (Ch1 §1.2), which depends on the integration/resolution layer being uniformly excellent, not excellent-once.
- *Option B — a generic ETL platform/framework (e.g. a visual pipeline tool) wrapping each source.* Tempting at first glance for "many connectors," but it's a new heavyweight dependency at v1 scale (violates Ch1 §5 avoid-premature-scaling) and a generic tool's assumptions rarely match this product's specific non-negotiables (entity resolution confidence bands, quarantine-not-drop, three-transaction-boundary loading).
- *Option C — a minimal, purpose-built `Connector` ABC behind which every source-specific quirk is isolated (RECOMMENDED, and already built).* Small enough to reason about completely, and the quirks of each source (Excel vs CSV dtype handling, an API's pagination, a webhook's payload shape) are contained entirely inside that one connector's implementation, never leaking into shared pipeline code.

---

### 4. Synchronization models — event-driven where possible, scheduled where necessary

Not every source can push; not every source should be polled at the same cadence. The platform supports three synchronization models, chosen per source by its tier and its capabilities, not by a single platform-wide policy:

```
  REAL-TIME (event-driven)    Tier 1 sources that emit webhooks (payment
                               gateways, ERPNext) — fee/enrolment changes
                               propagate with low latency, because for
                               these specific signals, staleness is costly
                               (e.g. a fee payment should clear a "fee
                               overdue" risk finding promptly, not after
                               a nightly batch).

  NEAR-REAL-TIME (API poll)   Tier 1 sources with an API but no webhook —
                               polled on a schedule tight enough to feel
                               live without hammering the source.

  SCHEDULED BATCH              Tier 2/3 sources (files, sheets, closed-
                               system exports) — nightly or periodic,
                               matching how the source actually produces
                               data (a registrar exports a sheet once a
                               day; polling it hourly would be theater).

  UPLOAD-TRIGGERED              The universal fallback for any source,
                               any tier — a human uploads a file and the
                               pipeline runs on demand. Never the only
                               path for a Tier 1 source, but always
                               available as the path that can never be
                               blocked.
```

**Event-driven integration, scoped honestly.** The mandate's "Event-Driven Architecture" principle (Ch1 §3 Group C, Ch1 §8 MR-2) applies *between* the platform and external sources exactly where those sources actually emit events (webhooks) — this is **real**, not aspirational, for payment gateways and ERPNext today. Internally, the *pipeline's own* stage transitions remain in-process (Ch2 §4.2) per the same MR-2 ruling; this chapter's event-driven claim is about source synchronization, and is not in tension with that internal decision — they are two different boundaries.

**Incremental sync, not full re-pull.** Tier 1 polling and Tier 2 scheduled syncs use change-data-capture signals where available, or an `updated_at`/watermark comparison where not — pulling only what changed since the last successful sync, not the source's entire dataset every time. This keeps sync cost proportional to change volume, not to data volume, which matters once a college has years of history.

**Idempotency is what makes any of this safe to retry.** A webhook can fire twice (most providers guarantee *at-least-once* delivery, never exactly-once); a scheduled poll can overlap a slow previous run; a human can upload the same file twice by accident. Every sync path is designed so that re-processing the same event or the same file produces **zero additional canonical rows** — the identity map (§6) and idempotent upserts are what make retried, duplicated, or overlapping syncs safe rather than catastrophic.

> **Ruling INT-4.1 — Synchronization model is chosen per source by tier and capability (webhook > API poll > scheduled batch > upload fallback); every model is idempotent by construction, never by discipline.** *Basis: Ch1 §3 Group C; reliability under retries.*

---

### 5. The mapping layer — turning a source's columns into canonical fields

A connector yields rows shaped exactly as the source produced them (`{"Stud Name": "Rahul", "Roll#": "21CS045", ...}`); nothing downstream can use that until it is mapped to the canonical vocabulary (`{name: "Rahul", roll_no: "21CS045", ...}`). This is a distinct pipeline concern from both connection (§3) and resolution (§6), and it has its own safety rule.

**Suggested, never auto-applied.** The platform offers a **fuzzy header-to-canonical-field suggestion** — matching a source's idiosyncratic column names ("Stud Name", "Student_Name", "नाम") against the canonical schema — but a suggestion is exactly that: a draft a human reviews and confirms. Nothing is written as a binding mapping without that confirmation. This is the mapping-layer instance of the chapter's "confirm, don't assume" tenet (§2), and it exists because a wrong auto-applied mapping is far more dangerous than a wrong auto-merge — it would silently mislabel an entire column for every row in every future import from that source.

**Mappings are versioned, never overwritten.** Each confirmed mapping for a given source+entity-type is saved as a new version rather than replacing the prior one. This means a past import batch's mapping is always reconstructable — if a college changes their export format next semester, the *new* mapping doesn't retroactively change how last semester's import is understood. This is a direct, mapping-layer expression of Chapter 1's no-silent-data-destruction constraint: history is not just preserved in the raw layer, it's preserved in *how that raw layer was interpreted* at the time.

> **Ruling INT-5.1 — Column mapping suggestions are advisory only; a mapping becomes binding only on explicit human confirmation, and is versioned (additive) rather than mutated.** *Basis: Ch1 §4.7; Ch1 §3 Group A (human approval over automation for consequential, hard-to-reverse decisions).*

---

### 6. Entity resolution — where the moat is actually built

**The problem in one sentence.** The same real student appears across systems as "Rahul Sharma," "21CS045," and "R.Sharma" — three different surface forms with no guaranteed shared key — and the platform must collapse all of them into exactly **one** canonical `student_id`, reliably, automatically, at scale, without ever silently merging two different people.

**Three confidence bands, three different outcomes — never a single threshold.** This is the architectural heart of resolution, and it's worth stating precisely because the *shape* of the decision (three bands, not a binary match/no-match) is what prevents both failure modes at once:

```
  HIGH CONFIDENCE   (e.g. matching roll_no across sources)
        → auto-link to the existing canonical entity, no human step

  MEDIUM CONFIDENCE  (e.g. similar name + same date of birth, no roll_no)
        → queue a merge-review item for a human — NEVER auto-merge

  LOW CONFIDENCE     (e.g. same name, clearly different roll_no/DOB)
        → treated as a distinct entity (a new canonical student), not a match
```

The middle band is the one that matters most architecturally: **resolution is asymmetric on purpose.** A missed auto-link (two records that should have merged but didn't) is an inconvenience, fixable later, visible in a discrepancy report. A wrong auto-merge (two different students collapsed into one) corrupts a real person's academic record, attendance history, and risk profile — and might not be noticed until damage is already visible to a student or a parent. The architecture refuses to make that second error category possible by *automation alone*; it can only happen with a human in the loop, reviewing a specific, presented merge-review item.

> **Ruling INT-6.1 — Entity resolution uses three confidence bands with asymmetric handling: auto-link only at high confidence, human-reviewed merge queue at medium confidence, never an automated merge at medium-or-below.** *Basis: Ch1 §3 Group A (human approval for consequential, hard-to-reverse actions); the cost asymmetry between a missed link and a wrong merge.*

**Resolution runs once per record, against the canonical population, not pairwise across the whole import.** Each incoming row is resolved against existing canonical entities (by exact key where available, by similarity scoring where not); this keeps resolution cost linear in import size rather than quadratic, which matters once a tenant has years of canonical history to resolve against.

**Where this sits in the pipeline.** Entity resolution is a discrete stage (`RESOLVED`, between `CLEANED` and `LOADED` — see §7) precisely so it can be tested, tuned, and reasoned about independently of parsing or loading. The confidence-scoring logic is isolated enough that its thresholds can be tuned per-tenant or improved with better signals later without touching the connectors, the mapping layer, or the loading transaction.

---

### 7. The ingestion pipeline — transactional guarantees, restated for this chapter

Chapter 2 (§4.2) introduced the pipeline's state machine as part of the platform's macro request lifecycles; this chapter owns its *integration-specific* mechanics — what each stage actually does to source data, and why the transaction boundaries are drawn where they are.

```
  RECEIVED → PARSED → MAPPED → CLEANED → RESOLVED → LOADED → RECONCILED → COMPLETED
                                                                    └─(unrecoverable)→ FAILED
```

| Stage | What happens (integration-specific) |
|---|---|
| **RECEIVED → PARSED** | The connector's `read_rows` runs; raw rows are persisted **immutably, append-only** — this is the byte-for-byte retention of the original source content (Ch1 §4.7), committed in its own transaction so it survives everything that happens after. |
| **PARSED → MAPPED** | The confirmed column mapping (§5) for this source+entity-type is applied; source headers become canonical field names. |
| **MAPPED → CLEANED** | Type coercion, validation; rows that fail validation are marked **quarantined with reasons** in the same staging table — never dropped, never silently excluded. `raw count = valid + quarantined`, always, by construction. |
| **CLEANED → RESOLVED** | Entity resolution (§6) runs per row against the canonical population; high-confidence matches link, medium-confidence rows queue for human review, low-confidence rows become new canonical entities. |
| **RESOLVED → LOADED** | Canonical upserts happen in their **own transaction**. A per-row reference failure (e.g. a row references a course code that doesn't exist) is caught and quarantines *that row* without aborting the batch; any other exception aborts the **whole** transaction — the batch goes `FAILED` and canonical tables show no partial writes for it. |
| **RECONCILED → COMPLETED** | A data-quality/reconciliation report is generated and persisted — counts, anomalies, cross-system mismatches — the input to §8's data-quality program. |

**Why three-plus-one transaction boundaries, not one.** A single all-or-nothing transaction across the entire pipeline sounds simpler, but it would mean a failure at the *loading* stage rolls back the *raw, immutable record of what was uploaded* — directly violating "the raw layer is append-only and immutable" (Ch1 §4.7). Splitting parse/clean/load/reconcile into separate transactions means a late-stage failure (loading) never erases early-stage truth (what was actually received): the raw file and the quarantined rows survive a failed load, so recovery is "fix the mapping or the data and re-run," never "re-upload from scratch and hope."

**Idempotent re-import as the recovery story.** Because resolution (§6) and loading both go through the same identity map and upsert pattern, re-running an import — whether to recover from a `FAILED` batch or because a college genuinely re-uploaded the same file — produces **identical canonical row counts**, with **zero duplicates**. This is not a nice-to-have; it is the property that makes "just re-run it" a safe, default answer to almost every integration failure.

---

### 8. Data quality, reconciliation & the anomaly report

Ingestion's job isn't done at `COMPLETED` — it must also tell the truth about how clean the result is.

- **Pre-go-live migration anomaly report.** Before a college's historical data is trusted, the platform surfaces a structured report: duplicate/outlier detection (impossible marks, duplicate fees, attendance gaps), cross-system mismatches, and quarantine summaries — reviewed by an admin, who confirms or fixes flagged anomalies before re-sync. Migration is treated as a scoped, assisted workstream, not a silent background process the college has to trust blindly.
- **The quarantine view is a first-class surface, not a log file.** Every quarantined row is retrievable with its reason, batch by batch — the operational answer to "why didn't my data show up."
- **Conflicting values are resolved by an explicit precedence policy, logged.** When two sources disagree on the same fact about the same entity (e.g. two systems report different fee amounts), the platform does not silently pick one and discard the other — precedence is a declared, auditable policy, and the disagreement itself is recorded.

This is also where the **AI-plane risk** named in Chapter 1 (§3 Group B) — "industry-trends and other external-data features carry the highest hallucination risk" — has its integration-layer mirror: **integration quality risk is the highest *operational* risk in the whole platform**, because every downstream feature (risk engine, NL query, accreditation evidence) inherits whatever the canonical layer believes is true. Reconciliation exists to catch that risk before it propagates.

---

### 9. Provenance — the integration layer's permanent receipt

Every canonical row carries `source_system_id`, `source_record_id`, and `import_batch_id` — not as optional metadata, but as load-bearing fields written at the same moment the row is created. This single design choice serves four different downstream needs at once, which is exactly why it's specified once, here, rather than reinvented per feature:

- **Security & audit (Chapter 8)** — every fact is traceable to where it came from, supporting the accountability model.
- **Accreditation evidence (Chapter 3 §6 RAG, Chapter 6)** — the DVV-grade evidence trail an IQAC needs is *provenance*, not a separate system.
- **Data quality (§8)** — a cross-system mismatch report is only possible if you know which system asserted which value.
- **Debugging in production** — "why does this student's record say this" always has a concrete, queryable answer.

> **Ruling INT-9.1 — Provenance (source system, source record, import batch) is written on every canonical row at creation time, never backfilled or optional.** *Basis: Ch1 §4.7; reused across security, accreditation, and data-quality without redesign.*

---

### 10. Security & tenancy in the integration layer

This chapter does not redefine isolation (Chapter 8 owns that) or identity (Chapter 4 owns that) — it states how integration specifically inherits both:

- **Every connector run executes inside a tenant-scoped session**, set up by the identity layer (Ch4 §3) before the connector ever touches the database; a connector has no code path that operates outside a resolved tenant context.
- **Per-tenant connector credentials.** API keys and webhook secrets for a Tier 1 connector (an ERPNext API token, a payment gateway's webhook signing secret) are stored per-tenant, via the platform's secrets mechanism (Ch8), never shared across colleges and never hardcoded.
- **Webhook authenticity.** Inbound webhooks are verified (signature/HMAC checks per provider) before their payload is trusted enough to enter the pipeline at all — an unverified webhook is not a data source, it's an attack surface.
- **Closed-system (Tier 3) credential handling** — negotiated DB access or scheduled exports for MasterSoft/TCS iON-class systems use the narrowest credential the source allows (read-only where offered) and are scoped to exactly the tenant they serve.

---

### 11. Scale & the extraction path

Per Chapter 2's decomposition ruling (AD-2.1), **ingestion workers are one of the two named candidates for the first service extracted from the v1 modular monolith**, alongside AI orchestration. This chapter's design choices exist specifically so that extraction is a deployment change, not a rewrite:

- The `Connector` interface (§3.2) and the stage-by-stage pipeline (§7) already communicate through well-defined data shapes (raw rows, staging rows, canonical upserts) rather than shared in-process state, so moving stage execution onto a separate worker fleet changes *where* code runs, not *what* it does.
- The pipeline's in-process background-task runtime (Ch1 §8 MR-2) was deliberately built behind a stage interface that can be swapped for a real queue/stream without changing stage logic — this chapter inherits that seam rather than introducing a new one.
- At higher tenant counts, the natural progression (Ch2 §9) is: heavier polling/webhook volume → dedicated ingestion worker pool with per-tenant fairness (so one college's large nightly batch can't starve another's near-real-time webhook processing) → eventually a real event stream replacing the in-process queue.

Nothing here is built ahead of need; everything here is designed so that building it later doesn't require undoing anything built now.

---

### 12. Failure & degradation (integration-specific)

| Failure | Behaviour | Why |
|---|---|---|
| **A connector's source is unreachable (API down, file not delivered)** | That sync is skipped/retried on its own schedule; no impact on other tenants' or other sources' syncs; canonical data simply doesn't update until the source recovers. | Failures are contained per-source (an instance of Ch2 §8's "failures are contained to their plane"). |
| **A webhook fires twice (at-least-once delivery)** | Idempotent upsert produces no duplicate; second delivery is a safe no-op. | §4; the identity map guarantees this. |
| **Malformed/garbage rows in an otherwise-good file** | Those rows quarantine with reasons; the rest of the file proceeds; `raw = valid + quarantined`. | Ch1 §4.7; no data loss for the *file*, even if individual rows are unusable. |
| **A row references an entity that doesn't exist (e.g. unknown course code)** | That row quarantines at the loading stage; the rest of the batch's valid rows still load. | Per-row isolation inside the LOADED transaction (§7). |
| **An unrecoverable error during loading (e.g. a constraint violation outside the per-row guard)** | The whole load transaction aborts; batch → `FAILED`; canonical tables show zero partial writes; raw and staging survive untouched, safe to fix and re-run. | The transaction-boundary design (§7) exists exactly for this case. |
| **A medium-confidence entity match** | Never auto-merged; queued as a `merge_review_item` for a human, regardless of import volume or urgency. | Ch1 §3 Group A; the cost asymmetry in §6. |
| **A closed (Tier 3) source simply can't be reached this cycle** | Falls back to the universal upload path; the college is never blocked on integration. | §3.1's permanent-tier ruling. |

---

### 13. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **INT-3.1** | Tier-2 (file/sheet) path status | Permanent, fully-capable; never superseded by API connectors | Treating file ingestion as a stopgap | Ch1 §1.1; universal coverage |
| **INT-3.2** | Connector abstraction | Single `Connector` interface (discover + read_rows) for every tier; mapping/resolution stay connector-agnostic | Bespoke importer per source; generic ETL framework | Ch1 §3 Group C; Ch1 §1.2 moat |
| **INT-4.1** | Sync model selection | Per-source, by tier/capability (webhook > poll > batch > upload); idempotent by construction | One platform-wide sync strategy | Reliability under retries |
| **INT-5.1** | Column mapping | Fuzzy-suggested, human-confirmed, versioned/additive | Auto-applied mapping; mutable mapping overwrite | Ch1 §4.7; human approval |
| **INT-6.1** | Entity resolution | Three confidence bands; auto-link high only; human review at medium; never auto-merge below high | Single match/no-match threshold; always auto-merge above a cutoff | Ch1 §3 Group A; cost asymmetry |
| **INT-9.1** | Provenance | Written on every canonical row at creation; never backfilled | Optional/best-effort provenance | Ch1 §4.7; reuse across Ch3/Ch6/Ch8 |

---

### 14. How this chapter governs the rest of the Bible

- **Chapter 6 (Data Architecture)** receives provenance-tagged, resolved, canonical rows as its primary input contract and owns the medallion storage model this chapter's pipeline writes into.
- **Chapter 3 (AI Platform)**'s RAG retrieval and Accreditation Assistant consume the provenance (§9) this chapter guarantees as their evidence trail.
- **Chapter 4 (IAM)**'s tenant-scoped sessions are the precondition every connector run assumes (§10); this chapter adds no new identity mechanism.
- **Chapter 7 (API & Integration Standards)** specifies the `/sources`, `/mappings`, `/imports` contracts this chapter's stages expose, and the webhook-receiver contract for Tier 1 sources.
- **Chapter 8 (Security Architecture)** builds connector-credential storage, webhook signature verification, and RLS enforcement around the tenant scoping this chapter assumes.
- **Chapter 10 (DevOps)** operationalizes the extraction path (§11) when ingestion-worker load justifies peeling it off the monolith.
- **Chapter 14 (Testing)** owns the acceptance tests this chapter's guarantees imply: idempotent re-import, entity-resolution confidence bands, no-data-loss on malformed rows, and tenant isolation during ingestion.

New integration tensions are added to this ledger (§13) by amendment.

---

### 15. Sign-off

This chapter is normative once ratified. Amendments to the connector interface (§3.2), the entity-resolution confidence model (§6), or the transaction-boundary design (§7) require Architecture Review Board approval.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Solution Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |

---

*End of Chapter 5 — ERP Integration Architecture.*
