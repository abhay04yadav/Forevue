# AI ERP Copilot — Architecture Bible

## Chapter 13 — Technology Decision Records (ADRs)

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** A single, browsable catalog of every technology selection made across this Bible — what was chosen, what was genuinely considered and rejected, and why — independent of which architecture chapter the decision happened to be argued in.
**Depends on:** Every preceding chapter. This chapter does not re-argue any decision from scratch; it catalogs decisions already ruled on, each with a citation back to the chapter carrying the full reasoning, comparison, and trade-off discussion.
**Relationship to the rest of the Bible — restated from Chapter 12 §9, not re-derived here.** Chapter 12 established that this Bible's standard ADR format is the inline, chapter-prefixed `Ruling-X.X` pattern used throughout Chapters 1–12 — decision and rationale co-located with the architecture they belong to. This chapter is the **one deliberate exception** to that pattern, because technology-selection decisions are inherently cross-cutting: a reader asking "why PostgreSQL and not MongoDB" shouldn't need to know which chapter happens to own data architecture to find the answer. This chapter exists *for that reader* — a single index, not a duplicate source of truth.

---

### 0. How to read this chapter

Each entry below is a compact ADR: **Context** (the problem), **Decision** (what was chosen), **Alternatives Considered** (rejected, with their real trade-off, not a strawman), **Consequences** (what this costs and what it buys), and a **Revisit Trigger** where the decision is explicitly conditional on future scale or circumstance rather than permanent. Every entry cites the chapter ruling it summarizes — this chapter is the index card; the cited chapter is the full file.

> **A note on completeness.** Not every dependency in the codebase gets its own ADR — a technology earns an entry here when a real alternative existed and was weighed, not merely because it appears in a `package.json`. Incidental libraries (a date-formatting utility, a CSS reset) are implementation detail, not architecture decisions, and cluttering this catalog with them would bury the decisions that actually matter.

---

### 1. ADR catalog at a glance

| ADR | Decision | Status | Revisit trigger |
|---|---|---|---|
| TDR-1 | Python + FastAPI for the backend | Accepted | — |
| TDR-2 | SQLAlchemy 2.x (typed) + Alembic for ORM/migrations | Accepted | — |
| TDR-3 | PostgreSQL as the single system of record | Accepted | — |
| TDR-4 | Postgres Row-Level Security as the isolation floor | Accepted | — |
| TDR-5 | Redis for caching, rate limits, token revocation | Accepted | — |
| TDR-6 | pgvector (in primary Postgres) for embeddings | Accepted | Embedding volume/query latency at scale |
| TDR-7 | External LLM via a vendor-agnostic AI Gateway | Accepted | — |
| TDR-8 | Tool calling over governed semantic selections (never raw SQL) | Accepted | — |
| TDR-9 | Deterministic rules over LLM for adjudication | Accepted | A future ML evaluator, behind the same interface |
| TDR-10 | REST + OpenAPI over GraphQL | Accepted | — |
| TDR-11 | Contract-first via Pydantic → OpenAPI → generated TS client | Accepted | — |
| TDR-12 | A minimal custom `Connector` ABC over a generic ETL framework | Accepted | — |
| TDR-13 | React + TypeScript + Vite + React Router for the frontend | Accepted | — |
| TDR-14 | TanStack Query for server-state management | Accepted | — |
| TDR-15 | JWT (stateless) + Argon2 for auth | Accepted | — |
| TDR-16 | Managed container/PaaS, not Kubernetes, for v1 | Accepted | Service extraction (Ch2 AD-2.1) |
| TDR-17 | In-process background tasks, not Celery/Kafka, for the pipeline | Accepted | Service extraction (Ch2 AD-2.1) |
| TDR-18 | No dedicated API gateway product at v1 | Accepted | Service extraction (Ch2 AD-2.1) |
| TDR-19 | OpenTelemetry for distributed tracing (when built) | Accepted | — |
| TDR-20 | ruff + mypy for lint/type-checking | Accepted | mypy backlog clearing (Ch10 DEVOPS-3.1) |
| TDR-21 | pytest + testcontainers for backend testing | Accepted | — |
| TDR-22 | Modular monolith, not microservices, for v1 decomposition | Accepted | Service extraction (Ch2 AD-2.1) |

---

### 2. The ADR template

```
  ADR <N> — <Technology / pattern>
  Status: Accepted | Superseded by ADR <N>
  Context:        the problem this choice solves, in this platform's
                   specific terms — not a generic statement of the
                   technology's general purpose
  Decision:        what was chosen, stated plainly
  Alternatives:    genuinely considered options, each with its real
                   trade-off (not a strawman included just to lose)
  Consequences:    what this choice costs and what it buys, stated
                   together — every decision has both
  Revisit trigger: the specific future condition that would reopen this
                   decision, if one exists — "never" is a valid answer
                   for decisions tied to a hard constraint (e.g. RLS),
                   but most v1-scoped decisions DO have one
  Full reasoning:  <chapter citation>
```

---

### 3. Backend platform

#### ADR-1 — Python + FastAPI for the backend

**Context.** The platform needs a backend language/framework ecosystem that fits a data- and ML-adjacent product (the risk engine, the eventual AI orchestration layer) and supports the contract-first API discipline (Ch7 §5) without a separate documentation toolchain.

**Decision.** Python 3.12+, FastAPI.

**Alternatives considered.** *Node.js/TypeScript end-to-end* — would unify the language across frontend and backend, a real ergonomic benefit, but Python's ecosystem dominance for the ML/data-science-adjacent work this platform's risk engine and future AI tooling depend on was judged more valuable than language unification alone. *Java/Spring or Go* — both production-grade and performant, but neither offers FastAPI's specific advantage: Pydantic-model-driven request validation that *is* the same artifact the OpenAPI spec and the generated frontend client are built from (Ch7 §5) — a capability that would need to be assembled from separate pieces in either ecosystem.

**Consequences.** Python's dynamic typing requires explicit discipline (Ch12 §3's "full type hints on every function," `mypy` enforcement) to get static-typing-grade guarantees — a cost the project has paid deliberately rather than accepted Python's looser defaults. In return: FastAPI's automatic OpenAPI generation directly enables the contract-drift-by-construction property Chapter 7 relies on.

**Revisit trigger.** None named — this is a foundational platform choice, not a v1-scoped placeholder.

**Full reasoning.** Ch7 §5 (API-5.1); Ch12 §3.

#### ADR-2 — SQLAlchemy 2.x (typed) + Alembic for ORM/migrations

**Context.** The canonical model (Ch6 §3) needs an ORM expressive enough for RLS-aware, mixin-composed, natural-key-upserting tables, and a migration tool disciplined enough to make the additive-by-default, RLS-on-every-table checklist (Ch6 §10) enforceable rather than aspirational.

**Decision.** SQLAlchemy 2.x with typed `Mapped[...]` declarative models; Alembic for migrations.

**Alternatives considered.** *A lighter query builder (e.g. raw SQL with a thin wrapper)* — would avoid ORM overhead, but loses the typed-model discipline Chapter 12 §3 requires, and would make the mixin composition pattern (Ch6 §3.2's four reusable mixins) significantly more repetitive to express consistently across roughly twenty canonical tables. *Django's ORM* — mature and capable, but pulls in Django's broader framework assumptions where only the ORM is wanted, and is less naturally typed than SQLAlchemy 2.x's `Mapped[...]` style.

**Consequences.** SQLAlchemy's flexibility comes with real subtlety (Chapter 8 §7's actor-attribution bug — a context variable not propagating across the framework's copied execution contexts — was specifically a SQLAlchemy-session-lifecycle issue) that the team has had to understand deeply rather than treat as a black box. In return: the mixin-based canonical model (Ch6 §3.2) and the generic, reusable audit-hook registrar (Ch8 §7) are both directly enabled by SQLAlchemy's declarative, event-driven design.

**Revisit trigger.** None named.

**Full reasoning.** Ch6 §3.2; Ch8 §7.

---

### 4. Data layer

#### ADR-3 — PostgreSQL as the single system of record

**Context.** The platform needs one consistent store for raw/staging/canonical medallion data (Ch6 §4), with relational guarantees (foreign keys, unique constraints, transactions) strong enough to enforce idempotency and isolation at the database level rather than by application discipline alone.

**Decision.** A single PostgreSQL database (per-tenant pooled, Ch2 AD-6.1) for all structured and semi-structured platform data, using JSONB columns where genuine schema flexibility is needed.

**Alternatives considered.** *Polyglot persistence* (a document store for raw/flexible data, a relational store for canonical, a graph store for entity relationships) — each additional store would be a second place tenant isolation must be independently proven, directly working against driver #1. *A NoSQL/document store as primary* — better fit for raw's flexibility, worse fit for canonical relationships, RLS-based isolation, and natural-key upsert guarantees, all of which depend on relational primitives a document store either lacks or implements as a weaker convention.

**Consequences.** Postgres must do double duty as both the transactional system of record and (via JSONB) the home for genuinely variable raw data — a deliberate trade of "two specialized stores done excellently" for "one general store done well, with one isolation surface to secure." Given driver #1's priority, that trade is correct for this platform's risk profile.

**Revisit trigger.** None — this is treated as a permanent architectural choice, not a v1 placeholder (Ch1 §8 MR-3 explicitly excludes Postgres from the vendor-independence ruling that applies to the LLM provider).

**Full reasoning.** Ch6 §5 (DATA-5.1).

#### ADR-4 — Postgres Row-Level Security as the isolation floor

**Context.** Tenant isolation (driver #1) needs a mechanism that holds even if every application-layer check is somehow bypassed or buggy — a floor, not just a convention.

**Decision.** Forced RLS (`ENABLE` + `FORCE ROW LEVEL SECURITY`) on every tenant-owned table, enforced against a non-superuser application database role, with tenant context set server-side from the verified JWT only.

**Alternatives considered.** *Application-layer scoping alone (no RLS)* — relies entirely on every developer remembering an explicit tenant filter on every query, forever; one omission leaks. *A separate database per tenant (silo)* — strongest isolation conceptually, but doesn't scale economically to a thousand tenants and forfeits the shared canonical substrate the product's benchmarking horizon depends on (Ch1 §1.3).

**Consequences.** RLS adds a layer of database-level complexity (every migration must include the policy block, Ch6 §10's checklist) and a small but real query-planning consideration (the policy predicate is evaluated on every row access). In return: a misconfiguration fails toward zero rows, never toward all rows — the single most important safety property in the entire architecture.

**Revisit trigger.** None — this is a hard constraint (Ch1 §4.1), not a scalable-away decision.

**Full reasoning.** Ch8 §4 (SEC-4.1).

#### ADR-5 — Redis for caching, rate limits, token revocation

**Context.** The AI Gateway's response cache and per-tenant rate-limit counters (Ch3 §3) need sub-millisecond, high-churn key-value access that a relational query is the wrong tool for, shared consistently across multiple application instances.

**Decision.** Redis, introduced specifically for the AI Gateway cache, rate-limit/quota counters, and the refresh-token denylist — never as a system of record.

**Alternatives considered.** *Cache in PostgreSQL (a table with TTL + cleanup job)* — reuses existing infrastructure, but adds write load to the primary for a workload relational engines handle least efficiently, and needs a cleanup job Redis's native TTL provides for free. *An in-process (per-instance) cache* — zero new infrastructure, but useless the moment more than one application instance runs, which is true even at one college once any redundancy exists.

**Consequences.** A second datastore to operate, but one explicitly designed to hold nothing irreplaceable — every Redis-resident value is reconstructable from Postgres, so its operational risk profile is "degraded performance if lost," never "data loss if lost."

**Revisit trigger.** None named.

**Full reasoning.** Ch6 §6 (DATA-6.1).

#### ADR-6 — pgvector (in primary Postgres) for embeddings

**Context.** The RAG/Accreditation Assistant (Ch3 §6) needs vector similarity search over governed documents, tenant-filtered before the similarity search runs.

**Decision.** pgvector as an extension inside the primary PostgreSQL database, not a dedicated vector database.

**Alternatives considered.** *A dedicated external vector database* — better at very large embedding volume and very high query throughput, but a second store that must independently re-prove tenant isolation, be backed up separately, and stay consistent with the canonical data it describes — exactly the cost ADR-3's polyglot-persistence rejection generalizes from.

**Consequences.** Retrieval tenant-isolation is inherited "for free" from the same RLS mechanism (ADR-4) protecting every other table — a direct, compounding benefit of ADR-3's single-store decision. The cost is a ceiling on embedding-workload-specific scaling that a dedicated vector store would not have.

**Revisit trigger.** **Named explicitly, unlike most data-layer ADRs:** if embedding volume or query latency outgrows what pgvector handles well, a dedicated vector tier is introduced behind the same retrieval interface — a capacity-driven move, not a redesign.

**Full reasoning.** Ch3 §6 (AI-6.1); Ch6 §7.

---

### 5. AI / LLM

#### ADR-7 — External LLM via a vendor-agnostic AI Gateway

**Context.** The platform depends on a frontier LLM provider for language tasks, but that dependency is the fastest-moving, most commercially volatile piece of the entire stack — pricing, capability, and even provider viability can shift faster than any other technology choice in this Bible.

**Decision.** All model access is mediated by a single AI Gateway component; no service calls a provider SDK directly; the Gateway is the one seam where the provider can be swapped, downgraded for cost, or mixed across tiers.

**Alternatives considered.** *Direct SDK calls per service* — simplest to start, but scatters API keys, defeats vendor independence, and gives no single point for egress PII minimization or cost-tiering logic. *A thin shared client library* — better than direct calls, but in-process and per-service, unable to do cross-request rate limiting or centralized failover.

**Consequences.** The Gateway is an additional architectural layer to build and operate, but it is also explicitly named (Ch2 AD-2.1) as one of the first two candidates for extraction into its own service once load justifies it — the cost is paid once, deliberately, specifically because this is the one dependency the platform most needs the freedom to change.

**Revisit trigger.** None for the pattern itself; the *provider* behind the Gateway is, by design, expected to change over time — that's the point.

**Full reasoning.** Ch3 §3 (AI-3.1); Ch1 §8 (MR-3).

#### ADR-8 — Tool calling over governed semantic selections (never raw SQL)

**Context.** Natural-language queries must become safe, scoped database reads without ever trusting the model to generate or execute SQL.

**Decision.** The model returns a structured tool call — a semantic-layer selection (metric, filters, dimensions, grain) — which deterministic platform code validates and executes as a parameterized, allow-listed, read-only query through tenant-scoped views.

**Alternatives considered.** *The model writes SQL directly* — rejected outright; unsafe, unauditable, non-deterministic, and a direct violation of the no-raw-SQL hard constraint regardless of how much validation wraps it. *Slot-filling a fixed query template* — safer than raw SQL, but brittle (every question shape needs a new template) and still vulnerable to unsafe values smuggled into slots.

**Consequences.** Every new question shape the platform should answer requires a corresponding governed metric/dimension to exist in the semantic layer first — a real constraint on flexibility, accepted deliberately because it is the only way to make "no NL-to-raw-SQL" actually true rather than aspirational.

**Revisit trigger.** None — this is a hard constraint (Ch1 §4.3), not a v1 placeholder.

**Full reasoning.** Ch3 §5 (AI-5.1).

#### ADR-9 — Deterministic rules over LLM for adjudication

**Context.** Risk tiers and eligibility verdicts must be auditable, byte-identical for identical inputs, and explainable with cited evidence — properties an LLM's probabilistic output cannot reliably guarantee.

**Decision.** The Student Success Engine and eligibility logic are deterministic rule evaluators, not LLM calls; the model may narrate their already-computed results but never produces them.

**Alternatives considered.** *An LLM-based scoring/eligibility engine* — would be more flexible to extend with new criteria conversationally, but sacrifices the explainability and determinism Chapter 1's driver #2 ranks above almost everything else, and would make "no score without findings" unenforceable as a hard invariant rather than a usual case.

**Consequences.** Adding a new risk signal or eligibility criterion requires writing an explicit rule, not just describing the desired behavior to a model — more upfront engineering effort, in exchange for an assessment that is provably reproducible and explainable on demand.

**Revisit trigger.** **Named explicitly:** the evaluator sits behind a `RiskEvaluator` interface specifically so a future ML-based evaluator is a drop-in replacement with zero changes to callers, storage, or API — should the product ever want one, with the same explainability bar applied to its design at that time.

**Full reasoning.** Ch1 §8 (MR-4); Ch3 §1.

---

### 6. API & integration

#### ADR-10 — REST + OpenAPI over GraphQL

**Context.** The platform needs an API style that supports versioning (Ch7 §4), a uniform error contract (Ch7 §6), and — critically — auto-generated, always-in-sync client types for the frontend (Ch7 §5).

**Decision.** REST, with FastAPI's auto-generated OpenAPI spec as the contract source.

**Alternatives considered.** *GraphQL* — offers genuine client-side query flexibility (a client requests exactly the fields it needs) and a strong typed-schema culture of its own, but introduces its own versioning philosophy (schema evolution via deprecation rather than URI versions) that doesn't map cleanly onto Chapter 7's URI-versioning ruling, and its flexible query shape is in tension with the platform's governed-surface philosophy (Ch3 §5's allow-listed, schema-checked queries) — a GraphQL API that let clients construct arbitrary nested queries would need the same allow-listing discipline reinvented at the GraphQL layer rather than inherited from REST's simpler one-endpoint-one-contract shape.

**Consequences.** REST's per-endpoint contracts mean a screen needing data from multiple resources makes multiple requests (or the backend grows a purpose-built aggregating endpoint) rather than a single flexible query — a real ergonomic cost for complex screens, accepted because the contract-generation pipeline (ADR-11) and the governed-query philosophy both fit REST's shape more naturally for this platform's specific safety requirements.

**Revisit trigger.** None named.

**Full reasoning.** Ch7 §5 (API-5.1).

#### ADR-11 — Contract-first via Pydantic → OpenAPI → generated TypeScript client

**Context.** Frontend/backend contract drift is a structural certainty whenever two independently-maintained descriptions of the same API shape exist — the question is how to make drift *impossible* rather than merely *discouraged*.

**Decision.** Pydantic models are the single source of truth; the OpenAPI spec is generated from them; the frontend's TypeScript client types are generated from that spec (`openapi-typescript`) — nothing hand-maintained at either layer.

**Alternatives considered.** *Hand-written API documentation + hand-written frontend types* — the traditional default, and the one this Bible explicitly argues against: two independently-maintained artifacts describing the same thing *will* drift, not as a risk but as a near-certainty over enough changes.

**Consequences.** A backend schema change requires regenerating the frontend client as an explicit build step — an extra step compared to "just change the type by hand," but one that fails loudly (a compile error) rather than silently (a runtime mismatch discovered by a user). This is also the direct cause of Chapter 9 §3's named CHANGELOG/lockfile discrepancy and Chapter 10 §3's cold-install conflict — both are real costs of depending on a generation toolchain, weighed against the much larger cost of silent contract drift this same toolchain prevents.

**Revisit trigger.** None named.

**Full reasoning.** Ch7 §5 (API-5.1); Ch9 §10 (FE-10.1).

#### ADR-12 — A minimal custom `Connector` ABC over a generic ETL framework

**Context.** The platform must ingest from sources ranging from open APIs to spreadsheet uploads to closed systems with no public API at all (Ch5 §3), and the abstraction connecting them to the pipeline needs to be uniform regardless of tier.

**Decision.** A small, purpose-built `Connector` interface (`discover` + `read_rows`), with every source-specific quirk isolated entirely inside that connector's own implementation.

**Alternatives considered.** *A generic ETL platform/framework (a visual pipeline tool or similar)* — attractive for "many connectors" in the abstract, but a new heavyweight dependency at v1 scale whose generic assumptions don't match this product's specific non-negotiables: three-confidence-band entity resolution, quarantine-not-drop validation, the three-transaction-boundary loading discipline. Adopting one would mean fighting the framework's defaults to re-implement exactly the behavior the custom ABC already provides directly.

**Consequences.** Every new connector is hand-written rather than configured through a framework's UI or DSL — more code per connector, but each connector inherits the platform's exact safety guarantees (idempotency, quarantine, resolution confidence bands) by construction rather than by careful framework configuration that could be gotten subtly wrong.

**Revisit trigger.** None named — the interface is intentionally minimal enough that it isn't expected to need replacing as connector count grows.

**Full reasoning.** Ch5 §3 (INT-3.2).

---

### 7. Frontend

#### ADR-13 — React + TypeScript + Vite + React Router for the frontend

**Context.** The frontend needs a component model fit for a dense, data-heavy console (Ch9 §1), fast iteration during a product-definition phase where screens change frequently, and a routing layer that supports role-aware navigation (Ch9 §5).

**Decision.** React, TypeScript, Vite, React Router.

**Alternatives considered.** *Vue or Svelte* — both capable, smaller-footprint alternatives, but React's ecosystem maturity and the team's evident fluency with it (visible throughout the actual implementation) weighed more heavily than a marginal bundle-size or boilerplate advantage either alternative might offer. *Create React App or Webpack-based tooling* — superseded by Vite's materially faster dev-server iteration loop, a genuine productivity factor during active screen design.

**Consequences.** A version-tracking discipline is now required to keep React/Router/TypeScript/Vite's resolved versions and the project's own documentation in sync — the exact discipline Chapter 9 §3 found lapsing (the CHANGELOG/lockfile mismatch named there as FE-3.1) is a direct, real cost of choosing a fast-moving ecosystem with frequent major versions, not a one-off oversight.

**Revisit trigger.** None named for the stack itself; FE-3.1's documentation correction (Ch9, Ch10 DEVOPS-3.x family) is a process fix, not a technology reconsideration.

**Full reasoning.** Ch9 §3 (FE-3.1).

#### ADR-14 — TanStack Query for server-state management

**Context.** The frontend's primary job, architecturally, is displaying server state (Ch9 §0) — caching, invalidating, and retrying API reads — not managing complex client-only state.

**Decision.** TanStack Query for all server-state caching/fetching; plain React state for genuinely client-local UI state.

**Alternatives considered.** *A general state-management library (Redux, Zustand) for everything, server and client state alike* — would require hand-building the caching, invalidation, retry, and staleness logic TanStack Query provides natively, for no benefit given that almost all of this frontend's "state" is, in fact, server state being displayed.

**Consequences.** Two different state mechanisms exist in the codebase (TanStack Query for server data, React state for local UI state) rather than one unified store — a small conceptual overhead, justified because the two kinds of state genuinely have different correctness needs (server state needs cache invalidation semantics; local UI state doesn't).

**Revisit trigger.** None named.

**Full reasoning.** Ch9 §3.

#### ADR-15 — JWT (stateless) + Argon2 for authentication

**Context.** Authentication needs to scale to multiple application instances and, eventually, multiple extracted services (Ch2 AD-2.1) without a shared session store becoming a new architectural dependency, while password storage needs to resist GPU-based cracking at rest.

**Decision.** Stateless JWT access/refresh tokens; Argon2 for password hashing.

**Alternatives considered.** *Server-side session store (Redis-backed)* — centralizes revocation cleanly, but adds a stateful dependency every request must consult, and complicates the path to extracting services later (every extracted service would need access to the shared session store) — a direct tension with Chapter 2's extraction-friendly design goal. *bcrypt or PBKDF2 for password hashing* — both acceptable, but Argon2's tunable memory-hardness is current best practice specifically because it resists GPU/ASIC-based cracking better at equivalent CPU cost.

**Consequences.** Token revocation requires either short expiry windows or an explicit denylist (Ch6 §6's Redis-backed refresh-token denylist) rather than instant server-side invalidation — accepted and mitigated, not eliminated, by short access-token lifetimes.

**Revisit trigger.** None named.

**Full reasoning.** Ch4 §2 (IAM-2.1).

---

### 8. Infrastructure & deployment

#### ADR-16 — Managed container/PaaS, not Kubernetes, for v1

**Context.** The v1 deployment topology is one application plus a database plus a cache (Ch2 AD-2.1) — the question is what orchestrates that, not whether it needs orchestrating at all.

**Decision.** A managed container/PaaS platform (an App Runner/Cloud Run/Container Apps-class service) for the application tier; managed Postgres and managed Redis rather than self-hosted instances of either.

**Alternatives considered.** *Kubernetes from the start* — best-in-class for orchestrating *many* independently-scaled services, but a real, immediate operational-skillset and cluster-management tax for a topology that currently has one service to orchestrate. *Raw VMs with manual orchestration* — strictly worse than the managed-PaaS option on every axis that matters (scaling, deploy safety, health management) for no offsetting benefit.

**Consequences.** The platform forgoes Kubernetes' fine-grained per-service autoscaling and service-mesh-grade routing — capabilities it doesn't currently need, because it doesn't currently have multiple independently-scaled services to route between.

**Revisit trigger.** **Named explicitly:** Kubernetes (or an equivalent orchestrator) is adopted at the exact moment ingestion workers or AI orchestration are genuinely extracted as independent services (Ch2 AD-2.1's trigger condition) — the same trigger that reopens ADR-17 and ADR-18 below.

**Full reasoning.** Ch10 §6 (DEVOPS-6.1); Ch7 §3 (API-3.1)'s identical reasoning applied a second time.

#### ADR-17 — In-process background tasks, not Celery/Kafka, for the ingestion pipeline

**Context.** Ingestion is asynchronous and bursty (Ch5 §2), but at v1 scale there is exactly one consumer of that asynchrony — the platform's own background-task runtime — not a multi-consumer event-streaming need.

**Decision.** The ingestion pipeline runs as an in-process FastAPI background task, behind a stage interface deliberately designed to be swappable for a real queue/stream later without changing stage logic.

**Alternatives considered.** *Kafka, Celery, or another dedicated queue/stream from the start* — genuinely the right tool once ingestion workers are extracted as an independent, independently-scaled service, but premature infrastructure for a single-process pipeline with no other consumer.

**Consequences.** The pipeline cannot currently be scaled independently of the application tier it runs inside — accepted, because nothing currently demands that independence, and the stage-interface design means the eventual swap is additive, not a rewrite.

**Revisit trigger.** **Named explicitly, identical to ADR-16:** the same Ch2 AD-2.1 service-extraction trigger.

**Full reasoning.** Ch1 §8 (MR-2); Ch5 §11.

#### ADR-18 — No dedicated API gateway product at v1

**Context.** "API gateway" responsibilities (auth enforcement, rate limiting, a single client-facing contract) are currently needed for exactly one backend, not multiple backends that need routing between them.

**Decision.** The FastAPI application itself enforces auth, validation, and the error contract at v1; no separate gateway product sits in front of it.

**Alternatives considered.** *A dedicated API gateway product now* — adds a network hop and an operational component with nothing to route *between* yet. *Never introducing one, permanently* — breaks the moment services are actually extracted, at which point something needs to route between them and enforce auth once rather than per-service.

**Consequences.** Today's "gateway" logic lives inside application code (dependencies, exception handlers) rather than a separate infrastructure layer — appropriate now, but the auth/validation logic is written so it can be lifted into a dedicated gateway later without changing the *client-facing contract* this decision is actually about preserving.

**Revisit trigger.** **Named explicitly, the same Ch2 AD-2.1 trigger as ADR-16 and ADR-17** — all three "not yet" infrastructure decisions share one trigger condition, which is itself worth noticing: the platform's growth path adds exactly one piece of new infrastructure complexity (real service boundaries) and that single event, not three separate ones, is what justifies a gateway, an orchestrator, and a real queue all at once.

**Full reasoning.** Ch7 §3 (API-3.1).

#### ADR-19 — OpenTelemetry for distributed tracing (when built)

**Context.** Distributed tracing is not yet built (Ch11 §5), but when it is, the AI request lifecycle's multi-step, multi-module shape (Ch3 §9) is specifically the kind of problem logging alone cannot diagnose.

**Decision.** OpenTelemetry instrumentation, extending the existing request-id context-propagation pattern (Ch11 §3) with trace/span context.

**Alternatives considered.** *A proprietary/vendor-specific tracing SDK* — might integrate slightly more smoothly with one specific observability backend, but couples the *means of capturing* a trace to *where it's visualized* — the same vendor-lock-in shape Chapter 1's MR-3 ruling already rejected for the LLM provider, applied here to observability tooling for the same underlying reason.

**Consequences.** None yet realized, since this is a forward decision — named here so that when tracing is built, it's built once, to this standard, rather than retrofitted to a vendor-specific choice made under time pressure.

**Revisit trigger.** None — this is the standard *for when tracing is built*, not a placeholder pending its own reconsideration.

**Full reasoning.** Ch11 §5 (OBS-5.1).

---

### 9. Tooling

#### ADR-20 — ruff + mypy for lint/type-checking

**Context.** The codebase needs fast linting and meaningful type-checking, introduced after a substantial amount of code already existed untyped-by-convention.

**Decision.** `ruff` (E/F/I/B/UP rule sets) as a hard CI gate; `mypy` (`disallow_untyped_defs`, `check_untyped_defs`) as an advisory gate until its pre-existing error backlog clears.

**Alternatives considered.** *flake8 + black + isort separately* — the traditional multi-tool Python combination ruff explicitly consolidates and outperforms on speed; choosing three slower tools over one fast one with equivalent rule coverage had no offsetting benefit. *Making mypy immediately blocking* — rejected specifically because it would have halted all unrelated work behind a large, separately-scoped backlog (Ch10 DEVOPS-3.1's reasoning).

**Consequences.** mypy's advisory status is a deliberately temporary, tracked state — a real, present gap (some type errors currently ship) accepted in exchange for not freezing development behind a backlog unrelated to the work at hand.

**Revisit trigger.** **Named explicitly:** mypy becomes a hard gate the moment its tracked pre-existing backlog reaches zero (Ch10 DEVOPS-3.1).

**Full reasoning.** Ch10 §3 (DEVOPS-3.1); Ch12 §4 (ENG-4.1).

#### ADR-21 — pytest + testcontainers for backend testing

**Context.** Tests that exercise RLS, tenant isolation, and real Postgres behavior (Ch8 §10's release-blocking isolation tests) need a *real* database, not a mock — RLS policies cannot be meaningfully tested against an in-memory or mocked store.

**Decision.** pytest as the test runner; testcontainers to provision real, ephemeral Postgres instances for tests that need genuine database behavior.

**Alternatives considered.** *Mocking the database layer* — faster test execution, but cannot validate RLS policies, real constraint behavior, or actual query plans — exactly the properties this platform's most important tests (isolation, idempotency) need to verify for real, not approximate.

**Consequences.** Test suite execution requires Docker availability (satisfied natively by GitHub-hosted CI runners, Ch10 §3) — a real environmental dependency, accepted because the alternative (mocked tests that can't catch an RLS misconfiguration) would undermine the exact guarantee Chapter 8 §10 treats as release-blocking.

**Revisit trigger.** None named.

**Full reasoning.** Ch8 §10 (SEC-10.1); Ch10 §3.

#### ADR-22 — Modular monolith, not microservices, for v1 decomposition

**Context.** The platform must serve one college today and a thousand colleges with millions of users eventually (Ch1 §5) — a range that tempts an immediate microservices design, but doesn't justify one yet.

**Decision.** A single deployable application, internally partitioned along bounded-context lines (Ch2 §2), with strict layering and explicit module interfaces — a modular monolith, not a microservices estate.

**Alternatives considered.** *Microservices from day one* — matches the eventual end-state and provides genuine independent scaling, but pays the full distributed-systems tax (network failures, partial failures, eventual-consistency bugs, a tenfold operational burden) before there is any load to amortize it against, and actively works against the canonical data model's need to be one consistent store. *A boundary-less monolith* — fastest to build, but the seams rot before scale demands a split, turning a future extraction into a rewrite rather than a planned move.

**Consequences.** The whole application currently shares one blast radius (a crash in one module can, in principle, affect the whole process) until the first service is actually extracted — accepted because the bounded-context seams (Ch2 §2) are real and tested, not aspirational, so the eventual split (Ch2 AD-2.1) is a planned extraction along an existing line, not an emergency rewrite.

**Revisit trigger.** **Named explicitly, and shared with ADR-16/17/18:** ingestion workers and AI orchestration are the two named candidates for the first services extracted, once their load specifically justifies the operational cost of separating them.

**Full reasoning.** Ch2 §3 (AD-2.1).

---

### 10. Revisit triggers, collected in one place

A genuinely useful property of cataloging every technology decision together: the shared revisit conditions become visible as a *pattern*, not just isolated footnotes scattered across chapters.

```
  ONE TRIGGER, THREE DECISIONS — "service extraction" (Ch2 AD-2.1)
  reopens ADR-16 (orchestration platform), ADR-17 (pipeline runtime),
  and ADR-18 (API gateway) SIMULTANEOUSLY. This is not a coincidence:
  all three are infrastructure-complexity decisions deferred for the
  identical reason (Ch1 §5 — don't orchestrate/queue/gateway "many
  things" when there is currently one thing), so they share the
  identical condition that would reverse that reasoning. A future
  architecture review revisiting one of these three should
  automatically revisit all three together.

  ONE TRACKED BACKLOG — "mypy backlog clears" (Ch10 DEVOPS-3.1)
  reopens ADR-20's gate status. This is a process milestone, not an
  architectural reconsideration — the decision (ruff+mypy) doesn't
  change, only its enforcement strictness does.

  ONE CAPACITY THRESHOLD — "embedding volume/query latency at scale"
  reopens ADR-6 (pgvector) specifically, independent of the other
  triggers above — vector storage scales on a different axis
  (embedding count, query throughput) than the service-extraction
  trigger that governs ADR-16/17/18.

  ONE INTERFACE-PRESERVING SWAP — "a future ML evaluator"
  reopens ADR-9's *implementation* without reopening its *interface* —
  the RiskEvaluator abstraction means this revisit, if it ever happens,
  changes what's behind the interface, not the interface itself or
  the explainability bar applied to it.
```

> **Ruling TDR-10.1 — Revisit triggers are tracked explicitly per ADR and, where multiple ADRs share an identical trigger (the Ch2 AD-2.1 service-extraction condition), they are revisited together rather than independently, since the underlying reasoning that deferred them was identical.** *Basis: Ch1 §5; consistency of reasoning across related decisions.*

---

### 11. How this chapter relates to the rest of the Bible

This chapter does not introduce new architecture — every decision cataloged here was already ruled on, with its full comparison and trade-off discussion, in the chapter cited at the end of each entry. This chapter's only job is to make those decisions **findable by technology** rather than only **findable by architectural concern** — a genuinely different access pattern that the inline-ruling format (Ch12 §9) doesn't serve well on its own.

- **Chapter 1's MR-3 ruling** (vendor independence pursued for the LLM, not the database) is the reasoning ADR-7, ADR-19, and ADR-3's "we don't abstract Postgres away" stance all trace back to — three different technology decisions, one shared principle.
- **Chapter 2's AD-2.1 ruling** is the single most-cited basis in this chapter (ADR-16, ADR-17, ADR-18, ADR-22 all trace to it) — confirming §10's observation that several "not yet" infrastructure decisions share one root cause and one revisit condition.
- **Chapter 12's ENG-9.1 ruling** is what licenses this chapter to exist as a standalone catalog at all, rather than this Bible defaulting to inline-only rulings everywhere.

New technology decisions, as they're made in future chapters or future architecture reviews, are added to this catalog (§1's table, plus a new dated entry) rather than left to live only in whichever chapter happened to need them.

---

### 12. Decision ledger (this chapter — meta-decisions about the catalog itself)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **TDR-0.1** | Catalog scope | Only decisions with a genuine weighed alternative get an entry; incidental libraries don't | Cataloging every dependency in package manifests | Signal-to-noise; Ch12 §9 |
| **TDR-0.2** | Catalog format | Compact ADR (Context/Decision/Alternatives/Consequences/Revisit/Citation) per entry, grouped by layer | A flat alphabetical list with no grouping | Browsability matching how engineers actually think about the stack |
| **TDR-10.1** | Shared revisit triggers | Tracked and cross-referenced explicitly where multiple ADRs share one trigger | Treating each ADR's revisit condition as independent | Consistency of underlying reasoning |

---

### 13. Sign-off

This chapter is normative once ratified as a catalog; amending any individual ADR's *decision* (not just its catalog entry) requires the same Architecture Review Board approval the originating chapter's ruling requires — this chapter records decisions, it does not independently re-authorize changing them.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Cloud Architect | | ☐ Approve ☐ Revise | |
| Principal API Architect | | ☐ Approve ☐ Revise | |

---

*End of Chapter 13 — Technology Decision Records (ADRs).*
