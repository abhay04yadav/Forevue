# AI ERP Copilot — Architecture Bible

## Chapter 6 — Data Architecture

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The platform's data stores and the model that gives them meaning — the canonical entity model, the medallion (raw→staging→canonical) storage layers, PostgreSQL as the system of record, the caching layer (Redis), vector storage for retrieval, the serving/read path, and data lifecycle (retention, soft-delete, schema evolution).
**Depends on:** Chapter 1 (hard constraint §4.7 no-silent-data-destruction, the moat thesis §1.2), Chapter 2 (the data plane §1, the serving/replica split AD-5.1), Chapter 3 (pgvector ruling AI-6.1, the AI Gateway's caching needs §3), Chapter 4 (RLS-ready tenant scoping every table inherits), Chapter 5 (the pipeline that writes into this chapter's tables, and the provenance contract — `source_system_id`/`source_record_id`/`import_batch_id` — this chapter stores as first-class fields).
**Relationship to the existing build:** The canonical schema, the medallion tables, and the RLS-on-every-tenant-table policy described here are **already implemented and migration-verified.** This chapter documents and justifies that schema, extends it where the mandate asks for components not yet built (Redis, a dedicated vector tier), and is explicit about which parts are deliberately minimal placeholders rather than finished design.

---

### 0. How this chapter builds on Chapters 1–5

Three commitments become concrete schema and storage decisions here:

1. **"The hardest, least glamorous layers must be built first and built well"** (Ch1 §1.2) — the canonical model *is* that layer. Every table in §3 exists because some future feature (the risk engine, NL query, accreditation evidence) needs clean, typed, resolved data to stand on, and Chapter 5's entity resolution is only valuable if what it resolves *into* is equally disciplined.
2. **No silent data destruction; raw is immutable; conflicts are flagged, not overwritten** (Ch1 §4.7) — this chapter is where that constraint becomes literal DDL: which tables are append-only, which carry soft-delete, and what a `data_conflicts` row actually contains.
3. **The serving layer sits between the AI plane and the canonical store as a hard boundary** (Ch2 §1, AD-5.1) — this chapter specifies what that boundary is built *from*: a read replica plus a governed semantic layer, not just a policy statement.

The organizing idea:

> **One well-modeled relational store, deliberately extended — not a polyglot persistence sprawl.** Every additional datastore in this chapter (Redis, pgvector) earns its place by solving a specific, named problem the canonical Postgres store cannot solve well; nothing is added because it is fashionable, and nothing is added before its problem actually exists.

---

### 1. Data architecture at a glance

```
  INGESTION (Ch5) writes forward, never backward, through three layers:

  ┌─────────────────────────────────────────────────────────────────────┐
  │ RAW           raw_files, raw_records                                 │
  │ (immutable,   byte-for-byte original content; SELECT+INSERT only,    │
  │  append-only) never UPDATE, never DELETE                             │
  ├─────────────────────────────────────────────────────────────────────┤
  │ STAGING       staging_records (cleaned_payload, validation_status,   │
  │ (mutable,      validation_errors, resolved_entity_id)                │
  │  no hard del.) entity_identity_map · merge_review_items · data_conflicts │
  ├─────────────────────────────────────────────────────────────────────┤
  │ CANONICAL     students · faculty · departments · programmes ·        │
  │ (the SoT;      courses · enrollment · attendance · internal_marks ·  │
  │  soft-delete)  semester_results · fees  (+ forward-compat stubs:      │
  │                hostel · placement · research_publication)            │
  └─────────────────────────────────────────────────────────────────────┘
                          │                              │
              ┌───────────┴──────────┐      ┌────────────┴────────────┐
              ▼                       ▼      ▼                         ▼
     SERVING / READ PATH        CACHE (Redis)              VECTOR STORE (pgvector)
     read replica +             tenant-partitioned          tenant-filtered embeddings
     semantic/metrics layer     query & AI-Gateway cache,   for RAG evidence retrieval
     (Ch2 AD-5.1)               rate-limit counters,        (Ch3 AI-6.1)
                                refresh-token denylist
```

Every table in the canonical layer carries the same four mixins, applied uniformly rather than per-table: a tenant column (for RLS), timestamps, soft-delete, and provenance. This uniformity is itself an architectural decision — it means a new canonical entity is "DDL plus four mixins," not a bespoke design exercise each time.

---

### 2. Design tenets specific to data architecture

- **Forward-only flow, no exceptions.** Data moves RAW → STAGING → CANONICAL and never backward. A canonical correction does not rewrite history in staging or raw; it is a new canonical state with its own provenance, layered on top of an unchanged record of what arrived.
- **Immutability where the data is evidence; mutability where the data is a working record.** Raw is what was *received* — it must never change, because it is the ground truth a dispute or an audit returns to. Staging and canonical are what the platform currently *believes* — they evolve as resolution improves and corrections arrive, but even there, nothing is hard-deleted (§9).
- **One relational store earns trust through one set of guarantees.** Foreign keys, unique constraints, and transactions are not friction to be designed around — they are exactly the mechanism that makes "no duplicates" and "no inconsistency" (Ch1 §4.7) enforceable by the database itself, not by application discipline alone.
- **Every additional datastore answers one specific question the canonical store answers poorly.** Redis answers "what did we just compute and don't want to recompute" and "how many requests has this tenant made this minute" — questions Postgres can technically answer but not at the latency or throughput those use cases need. pgvector answers "which documents are semantically similar" — a question relational tables cannot answer at all. Neither is added for its own sake.
- **Honesty about placeholders.** Where the specification names a table but not its columns, or names a future module without populating it yet, this is recorded explicitly as a minimal, flagged invention — never silently presented as finished design. (See §3, the `semester_results` and `Faculty` notes, and §12.)

---

### 3. The canonical model

#### 3.1 The entities and their natural keys

The canonical layer is the single source of truth the rest of the platform reads from. Its tables, and — critically — the **natural keys** that make every load idempotent:

| Entity | Natural key (UNIQUE constraint) | Why this key |
|---|---|---|
| `students` | `(tenant_id, canonical_roll_no)` | The roll number is the one identifier every Indian college ERP assigns and every source system reports — the deterministic-match anchor for entity resolution (Ch5 §6). |
| `attendance` | `(tenant_id, student_id, course_id, class_date, session_no)` | A specific student's specific session, re-importable without duplication even if multiple sources report the same class. |
| `internal_marks` | `(tenant_id, student_id, course_id, assessment_type, attempt)` | Distinguishes re-attempts explicitly rather than overwriting a retake's marks. |
| `fees` | `(tenant_id, student_id, term, fee_head)` | One row per fee head per term per student — supports partial payment tracking without ambiguity. |
| `enrollment` | `(tenant_id, student_id, course_id, academic_year)` | One enrollment record per student-course-year, the join surface attendance/marks/fees all reference. |
| `departments` / `programmes` / `courses` | `(tenant_id, code)` | The conventional ERP reference-data pattern — a tenant-scoped code is the natural key for "standard reference" entities, applied consistently even though no individual spec dictated it for each. |
| `faculty` | `(tenant_id, employee_code)` | Same reasoning as above; **DDL exists, but this entity is not yet wired into the ingestion connector** — a deliberate, flagged gap (§12), not an oversight. |

**Why natural keys, not surrogate-key deduplication logic.** Every table above has a real-world identifier that *should* be unique within a tenant. Encoding that as a database `UNIQUE` constraint and upserting with `ON CONFLICT DO UPDATE` means **idempotency is enforced by the database engine itself**, not by application code remembering to check first. This is the literal mechanism behind Chapter 5's "import the same file twice → identical row counts, zero duplicates" guarantee — it isn't a property of the pipeline's care, it's a property of the schema.

> **Ruling DATA-3.1 — Every canonical entity has an explicit natural key as a UNIQUE constraint; all canonical writes are upserts (ON CONFLICT DO UPDATE) against that key, never blind inserts.** *Basis: Ch1 §4.7 (no duplicates); Ch5 §7 (idempotent re-import).*

#### 3.2 The uniform mixins

Every canonical (and most staging) table carries the same four concerns, applied as composable mixins rather than repeated per-table DDL:

```
  PKMixin          id UUID PRIMARY KEY
  TenantMixin      tenant_id UUID NOT NULL (+ index)  ← the column RLS keys on
  TimestampMixin   created_at, updated_at
  SoftDeleteMixin  is_deleted BOOLEAN, deleted_at      ← §9: no hard delete
  ProvenanceMixin  source_system_id, source_record_id,
                   import_batch_id, ingested_at        ← Ch5 §9's receipt
```

This composability is why adding a new canonical entity is cheap and uniform: the four mixins are inherited, not reinvented, and a new table is automatically RLS-ready, soft-deletable, and provenance-bearing the moment it's declared — there is no path to a canonical table that accidentally skips one of these properties.

#### 3.3 Forward-compatibility stubs — named, empty, honest

`hostel`, `placement`, and `research_publication` exist today as **DDL-only stub tables** — identity columns and tenant scoping, nothing else — created specifically so that a future module's migration *adds columns to an existing table* rather than introducing a table a prior migration should have anticipated. They are not populated, not wired into any connector, and not pretended to be more than placeholders. This is the schema-level expression of Chapter 1's forward-compatibility obligation (§1.3): the canonical model is a future shared substrate, so its shape is sketched ahead of need where the cost of sketching is this low.

#### 3.4 Where the spec was silent — recorded, not guessed

Two honest gaps, named so they are never mistaken for finished design:

- **`semester_results`** is referenced by name in the governing specification but its columns were never defined anywhere. The schema in place (`academic_year`, `semester`, `attempt`, `grade`, `result_status`, with a natural key spanning all of them) is a **minimal, explicitly flagged invention** — DDL exists, but it is **not wired into the Phase-1 ingestion pipeline**. No feature should assume this table is currently populated.
- **`Faculty`** has the same status: DDL exists per the "create standard reference tables" instruction, but no connector `entity_type` populates it yet. The Faculty AI Assistant's RSDD already names this exact gap (the faculty entity being "DDL-only and unwired from ingestion") as an open dependency — this chapter is the data-architecture record of *why* that's true, not a new problem.

> **Ruling DATA-3.2 — Specification gaps are filled with a minimal, explicitly documented schema rather than left unbuilt or silently over-engineered; every such gap is cross-referenced in the relevant RSDD as an open dependency, not presented as complete.** *Basis: traceability; avoiding the appearance of finished design where none exists.*

---

### 4. The medallion model in storage terms

Chapter 5 introduced the medallion flow as a pipeline concept; this section specifies what each layer actually *is* in storage, because the storage properties are what make the pipeline's guarantees real rather than aspirational.

**RAW — `raw_files`, `raw_records`.** **Append-only by database policy, not just convention**: these tables permit `SELECT` and `INSERT`, and the migration that creates them never grants `UPDATE` or `DELETE` to the application role. `raw_files` retains the original uploaded content byte-for-byte; `raw_records` holds one row per source row, exactly as the connector yielded it (Ch5 §3.2), before any mapping is applied. This is the layer a dispute, an audit, or a "why does this say what it says" question ultimately resolves against.

**STAGING — `staging_records` + the resolution/conflict tables.** Mutable (cleaning and resolution are iterative processes), but still **never hard-deleted** — a quarantined row's status can change (e.g., after a mapping fix and re-run) but the row itself persists as a record that *something* arrived in that shape. Three tables here do specific, named jobs:

- **`entity_identity_map`** — the durable record of "this source's record X is canonical entity Y," keyed `(tenant_id, entity_type, source_system_id, source_id)`. This table is *why* re-imports are idempotent: a re-processed row finds its prior mapping and reuses the same canonical id rather than re-resolving from scratch.
- **`merge_review_items`** — every medium-confidence entity match (Ch5 §6) lands here, never auto-merged, holding the candidate canonical id, the incoming payload, and the confidence score for a human to adjudicate.
- **`data_conflicts`** — when an upsert would change an existing canonical value and a source-precedence policy doesn't clearly resolve it, the *existing* value is kept, the *incoming* value is recorded alongside it with both sources' identities, and the row is flagged unresolved. This is the storage-level proof of "conflicts are flagged, never silently overwritten" (Ch1 §4.7) — the disagreement itself is a queryable fact, not a discarded one.

**CANONICAL — the SoT tables of §3.** Soft-deleted, never hard-deleted (§9); every row upserted against its natural key (§3.1); every row provenance-tagged (Ch5 §9). This is the only layer the AI plane, the risk engine, and every copilot are permitted to read from directly — raw and staging are integration-layer internals, invisible above the canonical boundary.

**Source precedence is configurable, not hardcoded.** Conflict resolution (§4, `data_conflicts`) applies a per-tenant precedence policy (e.g., "ERP > Sheets > CSV upload" as a sensible default) — a college that trusts its biometric system more than its registrar's spreadsheet can say so, and that preference is itself stored configuration, not a code change.

---

### 5. PostgreSQL as the system of record — why one relational store

**The decision.** A single PostgreSQL database (per the pooled-tenancy model, Ch2 AD-6.1) is the system of record for every structured table in this chapter — raw, staging, canonical, identity/conflict bookkeeping, and (per §8) vector embeddings. This is a deliberate consolidation, not a default arrived at by inertia.

**Comparison.**

- *Option A — polyglot persistence (a document store for flexible/raw data, a relational store for canonical, a separate graph store for entity relationships).* Tempting on paper — raw data *is* schema-flexible, and entity resolution *does* resemble a graph problem — but each additional store is a second place tenant isolation must be independently proven (directly working against driver #1), a second backup/DR story, and a second consistency boundary between "what staging believes" and "what canonical says." Rejected for v1: the isolation and consistency cost outweighs the modeling convenience, and it violates Ch1 §5's avoid-premature-scaling principle — there is no load problem polyglot persistence would currently solve.
- *Option B — a NoSQL/document store as the primary store, with relational structure layered on top.* Better fit for raw's schema-flexibility, worse fit for everything downstream: canonical entity relationships, RLS-based isolation, and the natural-key upsert guarantees (§3.1) all depend on relational primitives (foreign keys, unique constraints, row-level policies) that a document store either lacks or implements as a weaker convention. Rejected.
- *Option C — PostgreSQL as the single relational store for everything, using JSONB columns where genuine schema flexibility is needed (RECOMMENDED, and already built).* `raw_records.raw_payload` and `staging_records.cleaned_payload`/`validation_errors` are JSONB precisely where the data genuinely varies by source — getting the schema-flexibility benefit *without* a second datastore. Everything that needs relational guarantees (canonical entities, natural keys, RLS) gets them natively, in the same engine, inside the same transaction boundaries Chapter 5 already depends on.

> **Ruling DATA-5.1 — PostgreSQL is the single relational system of record for all structured and semi-structured platform data; JSONB columns provide schema flexibility within the relational store rather than justifying a second store.** *Basis: Ch1 driver #1 (isolation surface stays singular); Ch1 §5 (avoid premature scaling); Ch1 §8 MR-3 (the one store we don't abstract away).*

**RLS as a schema-level policy, applied uniformly.** Every table carrying `tenant_id` receives the same RLS policy block (Ch4 §3's mechanism, applied here as a *migration discipline*): `ENABLE`, `FORCE`, and a `tenant_isolation` policy keyed on `current_setting('app.current_tenant')`. This chapter's contribution to that story is procedural: **a new tenant-owned table is not considered complete until its migration includes that block** — it is a checklist item on every schema change, not a one-time setup step. The append-only tables (`raw_files`, `raw_records`) get the same RLS policy as everything else; immutability and tenant isolation are independent properties, both enforced, neither substituting for the other.

---

### 6. Caching — Redis

**The problem Redis solves that PostgreSQL solves poorly.** Two needs, both already named in earlier chapters but not yet given a concrete store: (1) the AI Gateway's **tenant-partitioned cache** of model outputs for identical governed inputs (Ch3 §3) — a cache needs sub-millisecond reads at high request volume, which a relational query, even a fast one, is the wrong tool for; (2) **rate limiting and quota counters** per tenant (Ch3 §3's "one noisy tenant cannot exhaust capacity for others") — a counter that increments on every request needs to be cheap to update far more than it needs to be durable or transactional.

**Comparison.**

- *Option A — cache in PostgreSQL (a `cache_entries` table with a TTL column and a cleanup job).* Works at small scale, reuses the existing store (no new infrastructure), but adds write load to the primary for a workload (ephemeral, high-churn key-value access) that is exactly what a relational engine is least efficient at, and a cleanup job for expiry is an extra moving part that an in-memory store gets for free.
- *Option B — an in-process (per-instance) cache.* Zero new infrastructure, but useless the moment there is more than one application instance — which is true even at one college once the platform is deployed with any redundancy at all — because each instance would cache independently and a cache hit on one instance would be a miss on another.
- *Option C — Redis as a shared, in-memory key-value store (RECOMMENDED).* Purpose-built for exactly this workload: sub-millisecond reads/writes, native TTL expiry, atomic increment for counters, and shared across every application instance so a cache entry written by one request is visible to the next regardless of which instance serves it.

**What Redis is used for, precisely (and what it is not).**

```
  USED FOR:
    • AI Gateway response cache, KEYED WITH A TENANT DIMENSION ALWAYS
      (Ch1 §8 MR-7 — a cache key without a tenant component is a bug,
       restated here as a literal key-naming rule: every Redis key
       touching tenant data is prefixed tenant:<tenant_id>:...)
    • Per-tenant rate-limit / quota counters (AI Gateway, API throttling)
    • Short-lived session-adjacent data: refresh-token denylist entries
      (Ch4 §2/§8 — revoking a token before its natural expiry)
    • Ephemeral computation results that are expensive to derive and
      cheap to recompute if lost (cache, not source of truth)

  NEVER USED FOR:
    • Anything that is the only copy of a fact (Redis is never a system
      of record; every cached value must be reconstructable from
      PostgreSQL)
    • Anything requiring RLS-grade isolation guarantees on its own —
      isolation is achieved by tenant-prefixed keys plus the same
      application-layer scoping discipline as every other tenant-scoped
      access (Ch4 §4 Layer 2), not by a Redis-native policy mechanism
    • Durable audit or compliance data (Ch8 owns that; it lives in
      PostgreSQL's append-only audit log, never in cache)
```

The "never a system of record" rule is the chapter's safeguard against the most common caching failure mode: a cache that quietly becomes load-bearing because nothing re-derives the value anymore. Every Redis-resident value in this platform has a PostgreSQL-resident origin it can be rebuilt from.

> **Ruling DATA-6.1 — Redis is introduced specifically for the AI Gateway cache, rate-limit counters, and token revocation lists; every key is tenant-prefixed; Redis never holds the only copy of any fact.** *Basis: Ch3 §3 (Gateway caching needs); Ch1 §8 MR-7 (tenant-keyed caching); Ch4 §2 (token revocation).*

---

### 7. Vector storage — pgvector, formalized

Chapter 3 already ruled on this (AI-6.1: pgvector in the primary Postgres for v1, a dedicated vector store as a later capacity tier). This chapter's job is to specify what that means in storage terms, not to re-decide it.

**Schema shape.** Embeddings are stored in a dedicated table (or set of tables, one per document/evidence type) with a `vector` column (the `pgvector` extension type), a foreign key or reference back to the canonical/governed document it represents, and — like every other tenant-owned table — `tenant_id` with the same RLS policy block as §5. **Retrieval is tenant-filtered *before* the similarity search runs**, not after: the query plan applies the RLS-enforced tenant predicate as part of the same query that computes vector distance, so a cross-tenant retrieval is structurally the same class of impossible event as a cross-tenant SQL read (Ch4 §4 Layer 1).

**What gets embedded.** Per Chapter 3 §6: governed documents and evidence the Accreditation Assistant and Student 360 narrative draw on — never raw, unvalidated source content, and never anything that would let a number be asserted from a retrieved passage rather than the semantic layer (Ch3 §6's hard distinction between RAG-for-narrative and semantic-layer-for-figures is a *storage* discipline here too: the vector table holds text-for-citation, not data-for-computation).

**Indexing.** An approximate-nearest-neighbor index (HNSW, the current default recommendation for pgvector at this scale) over the embedding column, scoped the same way any other index is — there is nothing exotic about indexing a vector column once it lives inside the same RLS-governed table structure as everything else.

**Why staying inside Postgres remains right even as this gets specified concretely.** The alternative (a dedicated vector database) would mean re-proving tenant isolation in a second system, a second backup/DR target, and a second consistency boundary against the canonical store the embeddings describe — exactly the cost Chapter 3 weighed against and exactly the cost §5's polyglot-persistence rejection generalizes from. The seam for a dedicated tier remains the retrieval *interface*, not a schema change — if embedding volume or query latency ever justifies the move, the AI plane's RAG component (Ch3 §6) calls a different implementation behind the same interface; this chapter's tables are not what changes first.

---

### 8. The serving / analytics read path

Chapter 2 ruled that interactive reads (NL query, dashboards, boards) must not contend with ingestion writes (AD-5.1: read replica plus a semantic/serving layer). This chapter specifies the storage-layer half of that boundary.

**Read replica.** A PostgreSQL streaming replica of the canonical store, serving analytical and NL-query reads. Replication lag is an accepted, bounded cost — the serving layer answers "what is the current state of this tenant's data for analysis," not "did my write that happened one second ago show up instantly," and the canonical primary remains the single authority for transactional correctness.

**The semantic layer sits on top of the replica, not the primary.** Defined metrics, dimensions, and joins (the governed surface Chapter 3's Tool Calling selects against) are modeled as views or a metrics-layer abstraction over the replica's canonical tables — never over raw or staging, which are integration-layer internals invisible above this boundary (§4). This is the concrete storage answer to "no NL-to-raw-SQL": the semantic layer's views are themselves scoped, governed, and the *only* thing a governed query can select from.

**Why a replica and not just more connections to the primary (restated briefly, since Chapter 2 argued the macro case).** A heavy accreditation export or a tenant-wide risk recompute hitting the *same* database as a faculty member's NL query would mean one tenant's batch work degrades another tenant's interactive experience — a noisy-neighbor problem at exactly the layer driver #5 (performance) cares about. Decoupling reads onto a replica means write-heavy operations (ingestion, recompute) and read-heavy operations (NL, dashboards) physically cannot contend for the same I/O.

---

### 9. Data lifecycle — retention, soft-delete, and the erasure seam

**No hard delete, anywhere, except the one place immutability already forbids even soft-delete.** Every mutable table (staging, canonical, identity/conflict bookkeeping) uses `is_deleted`/`deleted_at` rather than `DELETE` — a "removed" record is a state, not an absence. The append-only raw tables don't need soft-delete because they support no delete operation of any kind (§4) — the two mechanisms (soft-delete and append-only-immutability) cover every table in the system between them, with no table left relying on hard deletion to express "this is gone."

**Why this matters beyond Chapter 1's general principle.** Soft-delete plus immutable raw is specifically what makes **DPDP retention limits and right-to-erasure implementable without a redesign** (Ch1 §4.7, Ch4/Ch8's DPDP obligations) — the seam is deliberately left here, unbuilt as a *feature* but structurally ready: a retention policy can mark records for erasure-on-schedule, and an erasure request can be honored by a defined procedure, because nothing in the storage model assumes permanence is the only state a record can be in.

**What "erasure" will mean when built (not built now — the seam, stated honestly).** A genuine DPDP erasure request on a soft-deleted, provenance-tagged, RLS-isolated canonical record is a real procedure (anonymization or hard purge of specific fields, on a defined schedule, logged) that this chapter does not design in full — that is Chapter 8's compliance-program work, consuming this chapter's soft-delete/provenance primitives as its raw material. Naming the seam here and naming the procedure as Chapter 8's job is itself the discipline this chapter tries to model throughout: say what's built, say what's seamed-for-later, never blur the two.

---

### 10. Schema evolution

**Alembic, additive by default.** Every schema change is a versioned migration; the default posture for a change is **additive** (new nullable column, new table) rather than destructive (dropping or renarrowing a column), because a destructive migration on a multi-tenant canonical store risks every tenant at once. A genuinely breaking change (the `NOT NULL` hardening already applied to `internal_marks.student_id`/`course_id` and `fees.student_id`, once the application layer was confirmed to never construct a row without those values) is made only after the invariant it encodes is proven true in the running application — the constraint formalizes a guarantee the code already provides, rather than hoping the constraint alone will provide it.

**RLS coverage as a migration-time checklist, not a one-time audit.** Every new tenant-owned table's migration includes the RLS block in the same commit that creates the table — there is no follow-up "and now apply RLS" step, because a table that exists for even one deploy cycle without it is exactly the gap Chapter 8's isolation guarantee cannot tolerate (Ch4 §4 Layer 1; Ch8's release-blocking isolation tests verify this, this chapter's discipline is what keeps the tests green by construction rather than by luck).

---

### 11. Performance considerations at the data layer

- **Bulk aggregate queries, never N+1.** The risk engine's signal computation (attendance/marks/fees aggregation across a whole tenant or a whole import batch) is built as a small number of bulk queries against the canonical tables, not one query per student — a direct consequence of Chapter 1's "Scalable AI" principle applied to plain SQL, not just to LLM calls.
- **Indexing follows the access pattern, not the schema's shape.** Every `tenant_id` column is indexed (the column every query filters on first); natural-key unique constraints double as the indexes that make upserts fast; additional indexes are added when a specific query pattern (e.g., the risk board's "rank by score within a faculty's cohort") is shown to need one, not preemptively.
- **The replica absorbs read-heavy growth; the primary stays write-optimized.** As tenant count and data volume grow (Ch2 §9's scale progression), the read replica is the tier that scales first — more replicas, or a sized analytical tier (Ch2 AD-5.1's deferred warehouse option) — before the canonical primary's write path needs anything beyond normal vertical headroom.

---

### 12. Failure & degradation (data-layer specific)

| Failure | Behaviour | Why |
|---|---|---|
| **Read replica lags or becomes unavailable** | Interactive reads fail over to the primary (degraded latency, correct data); writes/ingestion unaffected. | Ch2 §8; correctness over speed when forced to choose. |
| **Redis unavailable** | AI Gateway cache misses on every request (slower, costlier, but correct — falls through to the model/governed query); rate-limit counters fail open or closed per a configured policy, never silently ignored; refresh-token denylist checks fail closed (treat as "cannot confirm not-revoked" → require re-auth) rather than fail open. | Redis is never a system of record (§6); its loss degrades performance, never correctness, except where a fail-open default would itself be a security regression (denylist), which is therefore the one place data-layer failure handling defers to Chapter 8's security posture. |
| **pgvector retrieval returns nothing relevant** | RAG declines to assert evidence it cannot cite (Ch3 §11); the narrative surface says so rather than guessing. | Ch1 §4.4; consistent with Ch3's grounding guardrail. |
| **A migration's RLS block is accidentally omitted for a new table** | Caught by Chapter 8's release-blocking isolation test suite before deploy, not discovered in production. | The checklist (§10) is the prevention; the test suite (Ch8 §10) is the backstop — two layers, neither alone trusted. |
| **A conflicting upsert under ambiguous precedence** | Existing value kept; `data_conflicts` row written; never silently overwritten. | §4; Ch1 §4.7. |

---

### 13. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **DATA-3.1** | Idempotency mechanism | Explicit natural-key UNIQUE constraints + upsert (ON CONFLICT) on every canonical entity | Application-level dedup logic without a DB constraint | Ch1 §4.7; Ch5 §7 |
| **DATA-3.2** | Specification gaps | Minimal, explicitly documented schema invention, cross-referenced in the relevant RSDD | Leaving the table unbuilt; silently over-building beyond what's needed | Traceability |
| **DATA-5.1** | Primary store | Single PostgreSQL system of record; JSONB for schema flexibility within it | Polyglot persistence; NoSQL-primary | Ch1 driver #1; Ch1 §5; Ch1 §8 MR-3 |
| **DATA-6.1** | Caching | Redis for AI Gateway cache, rate limits, token revocation; tenant-prefixed keys; never a system of record | DB-backed cache table; per-instance in-memory cache | Ch3 §3; Ch1 §8 MR-7 |
| **DATA-8.1** | Read scaling | Read replica + semantic-layer views over it, decoupled from the canonical primary | Serving reads from the primary directly | Ch2 AD-5.1 |
| **DATA-9.1** | Deletion model | Soft-delete everywhere mutable; append-only immutability where raw; no hard delete anywhere | Hard delete with cascading cleanup | Ch1 §4.7; DPDP erasure seam |

---

### 14. How this chapter governs the rest of the Bible

- **Chapter 3 (AI Platform)**'s Tool Calling selects exclusively against the semantic-layer views this chapter defines over the read replica (§8); its RAG retrieves exclusively from the pgvector tables this chapter formalizes (§7).
- **Chapter 5 (ERP Integration)**'s pipeline writes into the exact medallion tables and natural-key upsert contract this chapter specifies (§3, §4) — the two chapters describe one pipeline from opposite ends.
- **Chapter 7 (API & Integration Standards)** exposes this chapter's data through governed, versioned contracts — the API surface never exposes raw or staging tables directly.
- **Chapter 8 (Security Architecture)** builds the RLS enforcement floor on every table this chapter declares tenant-owned, and owns the full DPDP erasure procedure this chapter only seams for.
- **Chapter 10 (DevOps)** operationalizes the replica topology, Redis deployment, and backup/DR targets for each store named here.
- **Chapter 14 (Testing)** owns schema-level acceptance tests: idempotent re-import, RLS coverage on every tenant-owned table (including new ones, per §10's checklist), and the no-data-loss/quarantine invariants.

New data-architecture tensions are added to this ledger (§13) by amendment.

---

### 15. Sign-off

This chapter is normative once ratified. Amendments to the canonical natural-key model (§3.1), the single-Postgres ruling (§5), or the deletion model (§9) require Architecture Review Board approval.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |

---

*End of Chapter 6 — Data Architecture.*
