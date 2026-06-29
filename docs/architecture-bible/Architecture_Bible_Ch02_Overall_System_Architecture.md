# AI ERP Copilot — Architecture Bible

## Chapter 2 — Overall System Architecture

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The macro shape of the platform — its layers and planes, the bounded contexts, the deployment topology, and above all the **request lifecycles** that run through it. This chapter is the map; Chapters 3–8 are the territory.
**Depends on:** Chapter 1 (Vision & Design Philosophy) — its north-star invariants (§2), hard constraints (§4), driver ranking (§6), and conflict ledger (§8) are binding inputs here and are cited, not repeated.
**Does not cover:** Role-specific behaviour (finalised in the six RSDDs), nor the internals of any single plane (AI internals → Ch 3; security → Ch 4; integration → Ch 5; data → Ch 6; API → Ch 7; frontend → Ch 8). This chapter draws the boundaries those chapters fill in.

---

### 0. How this chapter builds on Chapter 1

Chapter 1 fixed *what* we are building and the rules it must obey. Chapter 2 fixes the *shape* — the smallest set of structural decisions that everything else inherits. There are exactly four that matter at this level, and the rest of the chapter justifies each:

1. **A layered pipeline, not a flat app** — source systems flow through tiered connectors, ingestion, a canonical store, a governed serving layer, the AI layer, and the copilots, in one direction.
2. **Two request paths, deliberately decoupled** — a fast synchronous *read/ask* path and a slower asynchronous *ingest/compute* path, so heavy data work never contends with a user waiting for an answer.
3. **A modular monolith with clean seams for v1**, designed so the seams that will later become network boundaries are already drawn — not a microservices estate built before there is load to justify it.
4. **Pooled multi-tenancy with isolation enforced in depth** — one logical platform serving many colleges, isolation guaranteed by Row-Level Security plus application scoping, with a defined escape hatch to a dedicated tenant when a marquee customer requires it.

Everything below elaborates these and shows the lifecycles that prove they hang together.

---

### 1. The macro shape — a one-directional pipeline

At the highest level the platform is a vertical pipeline. Data flows up from the college's existing systems toward the user; control and queries flow down. The shape is deliberately simple because the complexity lives *inside* the layers, not in their arrangement.

```
                          USERS (per role: admin · principal · registrar ·
                                 iqac · faculty · hod · placement · student)
                                            ▲
                          ┌─────────────────┴──────────────────┐
   EXPERIENCE PLANE       │   Persona copilots / NL interface   │   responsive web (v1)
                          │   (one client of an API-first core) │   + core mobile alerts
                          └─────────────────┬──────────────────┘
                                            │  natural language · clicks
                          ┌─────────────────┴──────────────────┐
   AI PLANE               │  AI / LLM orchestration (Ch 3)      │   the model is an
   (untrusted component,  │  • NL → governed semantic layer     │   UNTRUSTED component
    treated zero-trust)   │  • Student Success Engine (rules)   │   (Ch1 §2.2): never
                          │  • Accreditation · migration assist │   emits SQL or tenant id,
                          │  • guardrails: grounding · audit    │   never asserts a number
                          └─────────────────┬──────────────────┘
                                            │  governed queries (read-only)
                          ┌─────────────────┴──────────────────┐
   SERVING PLANE          │  Semantic / metrics layer + serving │   governed metrics,
                          │  read replica (decoupled read path) │   dimensions, joins;
                          └─────────────────┬──────────────────┘   analytics-optimised
                                            │
                          ┌─────────────────┴──────────────────┐
   DATA PLANE             │  UNIFIED DATA LAYER — canonical SoT  │   Postgres + RLS;
   (the company's moat,   │  canonical entities · history ·     │   every row carries
    Ch1 §1.2)             │  provenance · append-only audit     │   tenant_id + source
                          └─────────────────┬──────────────────┘
                                            │  three-layer medallion: RAW→STAGING→CANONICAL
                          ┌─────────────────┴──────────────────┐
   INTEGRATION PLANE      │  Ingestion & ETL · entity resolution │   tiered connectors
   (where the moat is     │  (validate · clean · dedupe ·        │   (Ch 5)
    built, Ch1 §1.2)      │   resolve → one canonical student_id)│
                          └─────────────────┬──────────────────┘
                                            ▲
                          SOURCE SYSTEMS (college owns — ERPNext · Fedena ·
                          MasterSoft · TCS iON · Excel/Sheets · LMS · biometric · payments)
```

Two properties of this shape are load-bearing and follow directly from Chapter 1:

- **Data only ever flows forward through the medallion layers** (RAW immutable → STAGING cleaned → CANONICAL truth). Earlier layers are never mutated by later stages. This is what guarantees provenance and no-data-loss (Ch1 §4.7).
- **The serving plane sits between the AI plane and the data plane on purpose.** The AI never reaches the canonical store directly; it reaches a *governed* surface. This is the structural expression of "no NL-to-raw-SQL" (Ch1 §4.3) — it is enforced by topology, not merely by policy.

The **Control Plane** is orthogonal to this stack and threads through every layer: identity and tenancy resolution, RBAC, audit, configuration, and observability. It is drawn separately in §7 because it is a cross-cutting concern of every request rather than a stage in the pipeline.

---

### 2. The logical view — planes and bounded contexts

The pipeline above is the *physical intuition*. The *logical* decomposition is a set of bounded contexts (Ch1 §3, Group C), each owning its model and language:

```
  Identity & Tenancy ─┐
  RBAC & Audit        ├── CONTROL PLANE (cross-cutting; in every request)
  Configuration       │
  Observability      ─┘

  Ingestion & Integration ──→ Canonical Data ──→ Semantic / Serving
        (INTEGRATION)            (DATA)              (SERVING)

  NL Query · Student Success · Accreditation · Notifications ── (AI + APPLICATION)

  Copilot clients ── (EXPERIENCE)
```

These contexts are stable; they are the units around which teams, tests, and (eventually) deployable services are organised. Crucially, **the boundaries between them are the seams** referenced in decision #3 of §0 — the lines along which the monolith would later split.

---

### 3. Decomposition strategy — why a modular monolith for v1

This is the single most consequential macro decision, so it is argued in full. The mandate must serve one college today and a thousand colleges with millions of users later (Ch1 §5). That range tempts an immediate microservices design. The board rejects that for v1 and rules for a **modular monolith with explicit seams**. The three candidates:

**Option A — Microservices from day one.** Each bounded context (ingestion, canonical, serving, AI, notifications) is its own deployable service with its own datastore and network API.
- *For:* independent scaling and deployment; strong physical isolation between contexts; matches the eventual end-state.
- *Against:* distributed-systems tax paid before there is any load to amortise it — network failures, partial failures, distributed transactions, eventual-consistency bugs, and a tenfold operational burden on a small team. It also fights the data architecture: the canonical SoT is one consistent store; splitting it prematurely manufactures the exact data-fragmentation problem the product exists to solve.

**Option B — Single-process monolith with no internal boundaries.** One app, one codebase, modules free to call each other directly.
- *For:* fastest to build; trivial to operate at one college.
- *Against:* the seams rot. By the time scale demands a split, the contexts are entangled and the split becomes a rewrite. Violates Enterprise Maintainability and the forward-compatibility obligations of Ch1 §1.3.

**Option C — Modular monolith with clean seams (RECOMMENDED).** One deployable unit, internally partitioned along the bounded contexts of §2, with strict layering (`api → service → repository → model`) and contexts communicating through explicit interfaces (ports), never by reaching into each other's internals. The async pipeline already runs as an in-process background task behind a stage interface that can be swapped for a queue without changing stage logic.
- *For:* one thing to deploy and operate now; the distributed-systems tax deferred until load justifies it; **the seams are real**, so the first service to peel off (the heavy candidates are ingestion and the AI orchestration) leaves cleanly. Directly honours Clean/Hexagonal/SOLID (Ch1 §3 Group C) and the "event-driven logically, infra deferred" ruling (Ch1 §8, MR-2).
- *Against:* a single process is a single blast radius until the first split; requires discipline to keep seams clean (enforced by the repository's module structure and tests).

> **Ruling AD-2.1 — Modular monolith with seams for v1; peel services off under measured load.** The first candidates to extract are (1) the ingestion/ETL workers (CPU- and I/O-heavy, bursty) and (2) the AI orchestration layer (latency- and cost-sensitive, independently scalable). Until their load justifies the operational cost, they remain in-process modules behind stable interfaces. *Basis: Ch1 driver #4 (maintainability) and §5 (avoid premature scaling).*

---

### 4. Request lifecycles

The chapter title promises the request lifecycle, and this is its core. Four lifecycles cover the platform; each is shown as a text sequence with the cross-cutting controls made explicit, because *where* tenant context, grounding, and audit happen is the architecture.

#### 4.1 The NL query lifecycle (the signature synchronous path)

This is the path the product is named for: a non-technical user asks a question in English and gets a grounded, explainable answer. It is also where every Chapter-1 safety invariant must hold at once. The numbered steps below correspond to the diagram.

```
  USER ──► EXPERIENCE ──► CONTROL ──► AI PLANE ──► SERVING/DATA
 (faculty)    (web)      (identity)  (orchestr.)   (semantic + RLS)

 1  ask: "CSE 3rd-yr attendance trend vs last year?"
 2  EXPERIENCE forwards request with the session token (no tenant id in the body)
 3  CONTROL authenticates, resolves tenant_id + role SERVER-SIDE from the session
        └─ tenant id is never taken from input or model output         [Ch1 §4.1]
 4  CONTROL opens a tenant-scoped DB session (sets app.current_tenant → RLS active)
 5  AI PLANE parses NL → intent + entities (the only place the LLM is trusted: language)
 6  AI PLANE maps intent onto the GOVERNED semantic layer (metrics/dimensions/joins)
        └─ it composes a governed query, never free-form SQL on raw tables [Ch1 §4.3]
 7  SERVING executes read-only against tenant-scoped views on the read replica
        └─ RLS guarantees only this tenant's rows are visible            [Ch1 §4.1]
 8  AI PLANE GROUNDS the answer: every number comes from the result set; the model
        only narrates and interprets — it never generates a figure       [Ch1 §4.4]
 9  CONTROL writes an audit record (who asked, which tenant, which governed query)
10  EXPERIENCE returns: grounded answer + table + chart + "how I read your question"
        └─ if step 6/7 yields nothing answerable: "I can't answer that from your data"
```

Five invariants are satisfied in this single path, and the architecture — not goodwill — is what enforces each: tenant id resolved server-side (step 3), isolation by RLS (steps 4, 7), no raw SQL (step 6), grounding (step 8), and a fallback instead of a hallucinated number (step 10). This is why the serving plane sits between AI and data as a hard topological boundary rather than a coding convention.

**Latency budget.** This path is interactive, so it is optimised for a fast first answer: the semantic resolution and the governed read are the critical path; narration can stream. Heavy work is kept off this path by design (see §5).

#### 4.2 The ingestion lifecycle (the asynchronous write path)

Ingestion turns a college's messy export into canonical truth. It is slow, bursty, and must never lose data — so it is asynchronous and transactional, and it runs **in-process as a background task in v1** behind a stage interface that can be swapped for a queue later without changing stage logic (Ch1 §8, MR-2). The state machine below is the platform's contract, not an illustration.

```
  upload ──► [RECEIVED] ──► [PARSED] ──► [MAPPED] ──► [CLEANED] ──►
             [RESOLVED] ──► [LOADED] ──► [RECONCILED] ──► [COMPLETED]
                                  └─(unrecoverable)──► [FAILED]

  Three transaction boundaries — NOT one — so raw/staging survive a later load failure:
    TX1  parse:      RECEIVED → PARSED      (raw_files, raw_records; append-only, immutable)
    TX2  clean:      MAPPED   → CLEANED     (staging rows marked valid OR quarantined+reasons)
    TX3  load:       RESOLVED → LOADED      (canonical upserts; per-row reference failures
                                             quarantine that row; ANY other error aborts the
                                             whole TX → batch FAILED, canonical untouched)
    TX4  reconcile:  RECONCILED → COMPLETED (persist the data-quality report)
```

The multi-transaction design is the structural expression of Ch1 §4.7 (no silent data destruction): the immutable raw layer and the quarantined-but-kept bad rows must survive even when the canonical load fails atomically. **Entity resolution** happens at RESOLVED — collapsing "Rahul Sharma / 21CS045 / R.Sharma" across systems into one canonical `student_id`; an ambiguous match (similar name + same DOB, no roll number) becomes a human merge-review item, never an auto-merge. This is the moat being built (Ch1 §1.2), and it is deliberately human-in-the-loop at its uncertain edge.

#### 4.3 The continuous-risk lifecycle (event-triggered compute)

The Student Success Engine recomputes when new data lands — this is the "watch every student continuously" promise made concrete. It is event-triggered off the ingestion lifecycle and is itself advisory-only (Ch1 §4.2).

```
  [import COMPLETED] ──► derive affected student_ids from the batch
                    ──► bulk-compute signals (attendance/marks/fees) — NO N+1
                    ──► deterministic RULES evaluator → tier + score + FINDINGS
                            └─ no score without findings; each finding carries its
                               evidence + the threshold crossed                [Ch1 §4.4]
                    ──► idempotent persist: identical inputs ⇒ no new row;
                               changed inputs ⇒ supersede + insert
                    ──► generate in-app alert for a HUMAN (never an auto-action) [Ch1 §4.2]
                            └─ minor/unknown-DOB subjects: NO auto parent-contact;
                               monitoring uses academic signals only            [Ch1 §4.5]
```

Two macro-architecture points: the evaluator sits behind a `RiskEvaluator` interface, so a future ML evaluator is a drop-in with zero changes to callers, storage, or API (the proven seam from Ch1 §3 Group C); and adjudication is **deterministic rules, not the LLM** (Ch1 §8, MR-4) — cheaper, auditable, byte-identical for identical inputs.

#### 4.4 The role-scoped read lifecycle (dashboards and boards)

Not every read is an NL question; the faculty risk board and principal console are direct reads. They share steps 2–4 and 9 of the NL path (server-side tenant resolution, RLS session, audit) but skip the AI plane. The decisive control here is **role scoping on top of tenant scoping**: a faculty member sees only their assigned cohort, and a request for a student outside scope returns **404, not 403** — the platform does not reveal the existence of records the caller may not see (Ch1 §3 Group A, least privilege). Defense in depth: RLS is the floor, the repository adds an explicit tenant + role filter on every query.

---

### 5. The two-path model — why read and write are decoupled

Every lifecycle above is one of two kinds, and separating them is a deliberate macro decision.

```
  SYNCHRONOUS read/ask path          │   ASYNCHRONOUS ingest/compute path
  (NL query, dashboards, boards)     │   (ingestion, risk recompute, accreditation draft)
  • user is waiting → low latency    │   • no user waiting → throughput & safety
  • reads the SERVING layer / replica│   • writes the canonical store transactionally
  • never blocked by heavy ETL       │   • never blocks an interactive read
```

The two paths meet only at the data layer, and even there they are separated: interactive reads hit a **decoupled serving layer / read replica**, while writes go to the canonical primary. This is the structural answer to a hard requirement — NL and reporting must stay fast under exam-week, admissions, and accreditation-season peaks (Ch1 §5) — and it is why "Scalable AI" was defined at the data layer rather than as a token budget (Ch1 §3 Group B).

**Why a read replica rather than serving everything from the primary?** Comparison: (a) *single primary for all reads and writes* — simplest, but a heavy accreditation export or a recompute storm degrades every user's interactive query; rejected. (b) *read replica + serving layer* — interactive reads are isolated from write/compute load and can be scaled independently; the small cost is replication lag, which is acceptable because the read path serves analytics, not transactional consistency, and the canonical primary remains the authority. **Recommended.** (c) *separate analytical warehouse (e.g. columnar)* — strictly better at very large scale but premature at v1; the seam is kept so it can be introduced later without changing the AI or experience planes. *Ruling AD-5.1: replica + semantic/serving layer now; warehouse is a later capacity tier, not a v1 build.*

---

### 6. Multi-tenancy at the macro level

Isolation is driver #1 (Ch1 §6) and the first north-star invariant. The *mechanism* is detailed in Chapter 4; the *macro topology* is decided here. Three models:

**Silo (one stack per tenant).** Strongest isolation, simplest mental model, but cost and operational load scale linearly with tenant count — untenable at 1,000 colleges, and it forfeits the shared canonical substrate that makes future benchmarking possible (Ch1 §1.3.2).

**Bridge (shared app, separate schema/DB per tenant).** Middle ground; better isolation than a pool, but schema sprawl and migration fan-out grow painful at scale and complicate cross-tenant analytics.

**Pool (shared everything; isolation by RLS + app scoping) — RECOMMENDED.** One logical platform; every tenant-owned row carries `tenant_id`; Postgres RLS is the floor and application-layer scoping is the second layer; tenant context is set server-side from the session and protected tables return zero rows when no context is set. This is the only model that reaches a thousand isolated colleges economically while preserving the canonical model as a shared, benchmark-ready substrate.

> **Ruling AD-6.1 — Pooled multi-tenancy with defense-in-depth isolation as the default; a silo is the documented escape hatch for a marquee tenant** with a contractual residency or isolation requirement the pool cannot meet. Because PostgreSQL's RLS is load-bearing for the isolation floor, the platform does **not** abstract the database away (Ch1 §8, MR-3). *Basis: driver #1; Ch1 §5.*

---

### 7. The Control Plane — cross-cutting concerns in every request

Threaded orthogonally through every lifecycle, never a stage of its own:

- **Identity & tenant context.** Resolved server-side from the authenticated session at the start of every request; injected into the DB session so RLS activates. The one rule that admits no exception: tenant id never originates from client input or model output.
- **RBAC.** Tenant scope, then role scope, then field scope; 404-not-403 for out-of-scope existence.
- **Audit.** Append-only; every security-relevant read/write and every AI interaction records actor, tenant, and what governed query ran. This is also the DVV-grade evidence trail accreditation later depends on.
- **Observability.** Structured logs/metrics/traces carry `tenant_id` (and where relevant `student_id`, `model_version`, `config_version`) from day one (Ch1 §3 Group D).
- **Configuration.** Per-tenant config (risk thresholds, academic structure) lives in data, not code — no magic numbers (Ch1 §3 Group B).

---

### 8. Failure and degradation model

A platform for thousands of colleges must degrade gracefully, not fall over. The macro stance, per failure domain:

| Failure | Macro behaviour | Why this is the right degradation |
|---|---|---|
| **LLM/AI plane unavailable** | NL query path returns "AI is temporarily unavailable"; **dashboards, boards, risk data remain fully available** (they don't traverse the AI plane). | The AI is an untrusted, replaceable component (Ch1 §2.2); the data and serving planes are the durable value and must not share its fate. |
| **Read replica lag/outage** | Interactive reads fail over to the primary (degraded performance, correct data); writes/ingestion unaffected. | Correctness over speed (driver ranking); the primary is always authoritative. |
| **A connector/source fails mid-import** | Batch → FAILED; canonical store untouched; raw + quarantined rows retained; safe to re-run (idempotent). | No silent data destruction (Ch1 §4.7); idempotency makes recovery a re-run, not a cleanup. |
| **Canonical primary unavailable** | Platform is read-degraded/unavailable for that tenant; DR (Ch 9) governs RPO/RTO; isolation must survive failover. | Durability of the canonical SoT is the company's asset (Ch1 §1.2); a benchmarking cloud cannot lose a tenant's history. |

The principle underneath the table: **failures are contained to their plane.** The decoupling in §5 and the topological boundaries in §1 exist precisely so that the loss of the fast-moving, expensive, or external component (the LLM, a connector, a replica) never takes down the slow-moving, durable, owned component (the canonical truth).

---

### 9. How the macro architecture scales

Mapping the shape onto Chapter 1's scale envelope (§5), the order in which pieces split out is itself a decision:

```
  1 college     │ modular monolith, in-process pipeline, single primary + replica.
                │ Correctness & trust dominate; scale is not yet felt.
 ───────────────┼──────────────────────────────────────────────────────────────
  100 colleges  │ first pressures: noisy-neighbour isolation under the pool, and
                │ serving-layer read load. Replica scaled up; pool tuned.
 ───────────────┼──────────────────────────────────────────────────────────────
 1,000 colleges │ peel off the two heavy seams (AD-2.1): ingestion workers and
                │ AI orchestration become separate services; queue replaces the
                │ in-process pipeline (MR-2 swap); per-tenant cost engineered down.
 ───────────────┼──────────────────────────────────────────────────────────────
  millions of   │ serving layer becomes a sized read tier (warehouse option AD-5.1
  users         │ may activate); canonical model now a shared benchmark substrate;
                │ DR across tenants is non-negotiable.
```

Nothing in this progression is a rewrite — each step is a planned extraction along a pre-drawn seam or a capacity increase. That is the entire point of choosing the modular monolith with seams over either extreme in §3.

---

### 10. Architecture Decision Ledger (this chapter)

The key macro decisions, recorded once so later chapters cite rather than relitigate:

| ID | Decision | Chosen | Rejected alternatives | Basis |
|---|---|---|---|---|
| **AD-2.1** | Decomposition for v1 | Modular monolith with clean seams; peel ingestion + AI orchestration off under load | Microservices day one; boundary-less monolith | Ch1 driver #4; §5 |
| **AD-5.1** | Read scaling | Read replica + semantic/serving layer now; warehouse as later tier | All reads off primary; warehouse at v1 | Ch1 §5; driver #5 vs #6 |
| **AD-6.1** | Tenancy topology | Pooled, RLS + app scoping in depth; silo as documented escape hatch | Silo-per-tenant; schema-per-tenant bridge | Ch1 driver #1; §5 |
| **AD-4.x** | Request paths | Two decoupled paths (sync read/ask vs async ingest/compute) meeting only at the data layer | Single path for all requests | Ch1 §5; driver #5 |
| **AD-2.2** | Pipeline runtime | In-process background task behind a stage interface in v1; swappable to a queue | Kafka/Celery at v1 | Ch1 §8 MR-2 |

---

### 11. How this chapter governs the rest of the Bible

- **Chapter 3 (AI Platform)** builds the AI plane of §1 and the NL/risk lifecycles of §4.1/§4.3, inside the untrusted-component stance and the grounding/semantic-layer boundaries.
- **Chapter 4 (Security)** implements the Control Plane (§7) and the pooled-isolation ruling (AD-6.1) as the concrete zero-trust design.
- **Chapter 5 (ERP Integration)** and **Chapter 6 (Data Architecture)** realise the integration and data planes and the ingestion lifecycle (§4.2), including the medallion model and the serving/replica split (AD-5.1).
- **Chapter 7 (API Architecture)** defines the contracts at the plane boundaries this chapter drew.
- **Chapter 8 (Frontend)** builds the experience plane as one API-first client.
- **Chapter 9 (DevOps)** operationalises the failure/degradation model (§8) and the scaling progression (§9).
- **Chapter 11 (Roadmap)** sequences the seam extractions of §9 against the product horizon.

New macro tensions discovered later are added to this ledger (§10) by amendment, not resolved silently.

---

### 12. Sign-off

This chapter is normative once ratified. Amendments to the decision ledger (§10) require Architecture Review Board approval.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |
| Principal Cloud / Platform Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |

---

*End of Chapter 2 — Overall System Architecture.*
