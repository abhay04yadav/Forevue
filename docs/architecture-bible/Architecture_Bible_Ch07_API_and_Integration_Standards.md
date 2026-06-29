# AI ERP Copilot — Architecture Bible

## Chapter 7 — API & Integration Standards

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The contract layer between every client (the web frontend, the AI plane, future mobile/partner integrations) and the platform — the API gateway's role at v1, versioning strategy, request/response conventions, contract-first development, internal service communication, and idempotency/rate-limiting at the API boundary.
**Depends on:** Chapter 1 (API-First principle, Ch1 §3 Group C), Chapter 2 (the two-path request model §5, AD-2.1's extraction seams), Chapter 3 (the AI Gateway's own internal contract, which this chapter's standards also bind), Chapter 4 (the JWT/auth contract every route enforces, the 404-not-403 rule), Chapter 5 (the `/sources`, `/mappings`, `/imports` surface), Chapter 6 (the data this API exposes, never raw/staging directly).
**Relationship to the existing build:** The error contract, the auth dependency chain, and the OpenAPI-generated frontend type pipeline described here are **already implemented.** API versioning is **not yet implemented** — this chapter treats that honestly as an open decision the platform must make before its first breaking change, not as a settled fact.

---

### 0. How this chapter builds on Chapters 1–6

Three commitments become concrete contract rules here:

1. **"Every capability is an API before it is a screen"** (Ch1 §3 Group C, API-First) — this chapter is where that principle gets teeth: a single, versioned, documented contract that every client (including the AI plane, per Chapter 3) consumes identically, rather than the frontend enjoying privileged, undocumented access.
2. **The two decoupled request paths** (Ch2 §5: synchronous read/ask vs. asynchronous ingest/compute) are, at the API surface, two different *response shapes* — a fast endpoint that returns a result, and a fire-and-poll endpoint that returns a handle to check later. This chapter fixes which is which and how a client tells them apart.
3. **404-not-403, server-side scope, no raw SQL exposure** (Ch1 §4.1/§4.3, Ch4 §5) are, from the API's perspective, *response contract rules* — this chapter is where they become binding for every route, not just a security aspiration.

The organizing idea:

> **The API is the only door.** Nothing — not the frontend, not the AI plane's tool calls, not a future partner integration — reaches platform data through any path that bypasses this chapter's contract. If a capability exists, it exists as a documented, versioned, schema-validated endpoint; there is no backstage entrance.

---

### 1. API architecture at a glance

```
  CLIENTS                          API SURFACE (this chapter)         BACKEND
  ───────                          ───────────────────────────         ───────
  Web frontend (Ch9) ──┐
  AI plane tool calls   ├──HTTPS──► single FastAPI application  ──►  service layer
  (Ch3 Tool Calling)     │          (the v1 "gateway" — §3)           (Ch2 §3)
  Future: mobile,        │          • JWT auth on every route
  partner integrations ──┘          • Pydantic request/response
                                      validation (contract-first, §5)
                                    • uniform error contract (§6)
                                    • OpenAPI spec auto-generated
                                      from the same code (§5, §11)
                                              │
                                              ▼
                                    frontend types generated FROM
                                    that OpenAPI spec (§5) — contract
                                    drift is structurally impossible
```

Every client in the diagram — including the AI plane, which is otherwise treated as an untrusted component (Ch3 §2) — talks to the platform through this *same* API surface, under the *same* auth and validation rules. There is no special internal API that skips contract enforcement for "trusted" callers; trust is established per-request via identity (Ch4), not via which client is asking.

---

### 2. Design tenets specific to the API layer

- **Contract-first, not documentation-after.** The Pydantic schemas that validate requests and responses *are* the contract — the OpenAPI spec is generated from them, not written separately and hoped to match. A schema and its documentation cannot drift, because they are the same artifact viewed two ways.
- **The error contract is part of the API, not an implementation detail.** A client should never need to parse a stack trace or guess at error shape; every error response follows one of two fixed shapes (§6), always.
- **Versioning is a promise about the future, made before it's needed.** A breaking change made without a versioning strategy already in place is a breaking change with no good options left. This chapter would rather adopt a versioning discipline one release early than one release late.
- **Internal callers follow the same rules as external ones.** The AI plane's tool calls, the ingestion pipeline's writes, and a future mobile client's reads are all, from this chapter's perspective, "a request to the API" — none gets a shortcut around validation, auth, or the error contract.
- **Idempotency and rate-limiting are contract properties, not afterthoughts bolted on per-endpoint.** A client should be able to know, from the contract alone, whether retrying a request is safe and what happens if they call too often.

---

### 3. The API Gateway — what it is at v1, and what it will become

**The honest v1 answer.** Today the platform's "gateway" is a single FastAPI application — there is no separate, dedicated API-gateway product (no Kong, no AWS API Gateway, no custom edge service) sitting in front of it. Every route lives in one process, behind a reverse proxy that terminates TLS. This is consistent with the modular-monolith decomposition Chapter 2 ruled on (AD-2.1): at v1 scale, a dedicated gateway product solves problems (multi-service routing, per-service rate limiting, centralized auth across many backends) that don't exist yet, because there is only one backend.

**What the v1 application already does that a gateway would otherwise own.** Authentication (JWT verification, Ch4), request validation (Pydantic, §5), tenant-context establishment (Ch4 §3), and a uniform error contract (§6) — all of it inside the FastAPI app itself, via dependencies and exception handlers, not via a separate edge layer. This is not a gap; it is the correct location for these concerns at the current scale, and it is exactly what Chapter 2's "peel off services under load, not before" philosophy recommends.

**Comparison — when would a dedicated gateway product earn its place?**

- *Option A — introduce a dedicated API gateway now, in front of the single FastAPI app.* Adds a network hop and an operational component for no current benefit — there is nothing to route *between* yet. Rejected for v1 as premature scaling (Ch1 §5).
- *Option B — never introduce one; keep all routing logic in the application forever.* Works as long as the platform stays a single deployable unit. Breaks the moment the ingestion workers or the AI orchestration layer are extracted as separate services (Ch2 AD-2.1) — at that point, *something* needs to route a request to the right service, enforce auth once rather than per-service, and aggregate observability across services. Rejected as a permanent stance.
- *Option C — single application as the gateway today; introduce a dedicated gateway (or an API-aggregation layer) at the same moment the first service is extracted (RECOMMENDED).* The extraction event (Ch2 §9's scale progression) is precisely the point where a gateway's value (centralized auth, unified rate limiting across now-multiple backends, a single client-facing contract spanning multiple services) becomes real rather than theoretical. Until then, the FastAPI application *is* the gateway, and is built so that the auth/validation/error-contract logic it owns can be lifted into a dedicated gateway layer later without the *client contract* (this chapter's actual subject) changing at all.

> **Ruling API-3.1 — No dedicated API gateway product at v1; the application itself enforces auth, validation, and the error contract. A dedicated gateway is introduced at the same time the first service is extracted from the monolith (Ch2 AD-2.1), not before.** *Basis: Ch1 §5 (avoid premature scaling); Ch2 AD-2.1.*

**Why this matters even though it sounds like "nothing changes."** Stating this explicitly prevents two failure modes: building gateway infrastructure nobody needs yet (wasted effort), and assuming forever that no gateway will ever be needed (a surprise rewrite later). Naming the trigger condition (service extraction) means the decision is revisited on schedule, not by accident.

---

### 4. Versioning strategy — a decision the platform must make, stated honestly

**The current state.** Routes today carry no version segment (`/students/{id}`, not `/v1/students/{id}`). This was a reasonable place to start — there has been no breaking change yet to version *against* — but it is an open decision, not a settled architecture, and this chapter exists specifically to settle it before the absence of a strategy becomes a real problem.

**Why this can't wait for the first breaking change.** Introducing versioning *retroactively*, after clients already depend on unversioned routes, means every existing client (the frontend, any future partner integration) must migrate at the same moment the platform needs to ship a breaking change — the worst possible timing. Introducing it *before* it's needed costs almost nothing (one path prefix) and means the first real breaking change has somewhere safe to land.

**Comparison.**

- *Option A — URI versioning (`/v1/students/{id}`, `/v2/students/{id}`).* Explicit, visible in every log line and every client config, trivially routable (including by a future dedicated gateway, §3) without inspecting headers. The cost is some URL churn when a version increments. **RECOMMENDED.**
- *Option B — header-based versioning (`Accept: application/vnd.aierp.v2+json` or a custom version header).* Keeps URLs stable across versions, which API purists prefer, but is invisible in casual debugging (you can't tell a request's version from its URL alone), harder to route at a gateway/proxy layer without header inspection, and easy for a client to omit by accident and silently get a default version they didn't intend.
- *Option C — no versioning; evolve in place, additive-only forever.* Workable as long as every change can be made additively (new optional fields, new endpoints) — and Chapter 6's schema-evolution discipline (§10, additive-by-default) shows this is the *common* case. But "common" is not "always": a genuine breaking change (renaming a field the frontend depends on, changing an enum's values) will eventually be necessary, and Option C has no answer for that day.

> **Ruling API-4.1 — Adopt URI versioning (`/v1/...`) starting now, before any breaking change is made. The entire current API surface is retroactively the `v1` namespace. A `v2` namespace is introduced only for genuinely breaking changes; additive changes (Ch6 §10's discipline) never require a version bump.** *Basis: Ch1 driver #4 (maintainability); avoiding a forced simultaneous migration later.*

**Deprecation policy, stated now so it exists before it's needed.** When a `v2` route supersedes a `v1` route, the `v1` route remains live for a published deprecation window (a fixed minimum notice period, e.g. two release cycles), is marked deprecated in the OpenAPI spec (visible to every consumer of the generated client, §5), and is removed only after that window closes — never silently.

---

### 5. Contract-first development — one source of truth, two generated artifacts

**The mechanism, already built and worth specifying as a standard rather than an accident.** Every request and response shape is a Pydantic model. FastAPI generates the OpenAPI specification *from those models*, not from separately maintained documentation. The frontend's TypeScript types are then generated *from that OpenAPI spec* (`schema.d.ts`, via `openapi-typescript`) — not hand-written, not manually kept in sync.

```
  Pydantic models (the ONE source of truth)
        │
        ├──► OpenAPI spec (auto-generated by FastAPI)
        │            │
        │            └──► frontend/src/api/schema.d.ts (auto-generated)
        │
        └──► request/response validation at runtime (the same models)
```

**Why this is an architectural decision, not a tooling footnote.** The alternative — a hand-maintained API documentation page, or hand-written frontend types — *will* drift from the actual implementation; it is not a question of discipline, it is a structural certainty once two artifacts describe the same thing independently. This pipeline makes drift **impossible by construction**: if a backend Pydantic model changes, regenerating the frontend types is a build step, not a remembered chore, and a frontend build using stale types fails to compile against a changed schema rather than failing silently at runtime.

> **Ruling API-5.1 — Pydantic models are the single source of truth for every request/response contract; the OpenAPI spec and the frontend's TypeScript client types are both generated artifacts, never hand-maintained.** *Basis: Ch1 §3 Group C (API-First); eliminates an entire class of integration bugs by construction.*

**What this buys Chapter 9 (Frontend) for free.** The frontend never guesses a field name or a response shape — `tsc --noEmit` against the generated types is itself a contract-conformance test, catching a frontend/backend mismatch at compile time rather than in a user's browser.

---

### 6. Request/response conventions

**Authentication.** Every route except `/auth/*` and `/health*` requires a valid Bearer JWT (Ch4 §2) and runs inside a tenant-scoped session (Ch4 §3) established before the route handler executes. This is enforced once, as a dependency every protected route shares — not re-implemented per route.

**The error contract — exactly two shapes, never a third.**

```
  APPLICATION ERRORS (AppException and its subclasses):
    { "error": "<human-readable detail>" }
    status codes: 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict
    (a small, closed hierarchy — UnauthorizedException, ForbiddenException,
     NotFoundException, ConflictException — each with a fixed status code
     and a default detail message, overridable per raise site)

  VALIDATION ERRORS (request shape doesn't match the Pydantic contract):
    FastAPI's native 422 response: { "detail": [ {loc, msg, type}, ... ] }
    — the framework's own shape, used as-is rather than wrapped, because
    re-wrapping it would break the auto-generated client types (§5) for
    no benefit.
```

A client written against this contract never needs a third branch: either it's a `{"error": ...}` application-level rejection, or it's FastAPI's standard `{"detail": [...]}` shape for "your request didn't match the schema." Nothing in the platform invents a third error shape.

> **Ruling API-6.1 — Exactly two error response shapes exist platform-wide: the `{"error": detail}` application-exception contract, and FastAPI's native 422 validation-error contract. No endpoint introduces a bespoke error shape.** *Basis: client simplicity; Ch1 §3 Group C (SOLID — a small, closed exception hierarchy, open only via subclassing).*

**404-not-403, as an API-contract rule, restated precisely.** Chapter 4 established *why* (existence-hiding, least privilege); this chapter fixes *how* it's expressed in every response: a request for an out-of-scope resource returns `NotFoundException` → 404 `{"error": "Resource not found."}` — identical in shape to a request for a resource that genuinely doesn't exist. `ForbiddenException` → 403 is reserved for the narrower case where the *caller's role itself* lacks the capability outright (a capability denial, Ch4 §5's RBAC gate), not a scope mismatch on a specific record. This distinction is binding on every route author, not a stylistic preference.

**Naming and shape conventions.**

- Routes are resource-oriented and pluralized for collections (`/imports`, `/sources`), singular with a path parameter for a specific resource (`/imports/{import_batch_id}`).
- Mutating actions that aren't pure CRUD use a clear verb suffix on the resource (`/risk/interventions/{id}/outcome`), never a verb-first route.
- List endpoints accept filter query parameters (`?status=`, `?tier=`) rather than requiring a request body for reads — reads stay cacheable and bookmarkable in principle, even where caching isn't yet applied.
- Every response model is named for what it *is*, not for the route that produces it (`Student360Response`, not `GetStudentResponse`) — the same model is reusable if a second route ever needs the same shape.

---

### 7. Internal communication — synchronous today, with a seam for tomorrow

**Today: one process, direct calls.** Inside the v1 modular monolith (Ch2 AD-2.1), "internal communication" mostly means a route handler calling a service function calling a repository — in-process, synchronous, no network hop, no serialization cost. This is simple and correct at v1 scale, and this chapter does not manufacture network calls between modules that don't need them yet.

**The one async internal boundary that already exists.** Ingestion runs as a FastAPI background task (Ch2 §4.2, Ch5 §7) — the `/imports` endpoint returns immediately with a batch handle, and the actual pipeline work happens asynchronously, with status polled via `GET /imports/{id}`. This is the platform's only current instance of "fire-and-poll" as an API pattern, and it is deliberate: ingestion is slow and bursty (Ch5 §2), so its API contract reflects that honestly rather than holding a client connection open.

**The seam for service extraction.** When ingestion workers or the AI orchestration layer are extracted as separate services (Ch2 AD-2.1, Ch1 §8 MR-2), internal communication for those specific boundaries becomes a real network call — and the design already in place (stage interfaces with well-defined data shapes, Ch5 §11) is what makes that change additive rather than a rewrite. This chapter's contribution is to fix *which* communication pattern that extraction should use, decided once rather than per-service:

```
  Synchronous internal call (the read/ask path, Ch2 §5)
        → stays synchronous even after extraction: a request-scoped REST/
          RPC call to the extracted service, because the caller is waiting
          and needs an answer now.

  Asynchronous internal call (the ingest/compute path, Ch2 §5)
        → becomes a real message queue/event stream after extraction
          (the MR-2 swap), because no caller is waiting and durability/
          retry semantics matter more than latency.
```

This is the same two-path split Chapter 2 drew at the macro level (§5), now fixed as the rule for *which* internal communication mechanism each path uses once it's no longer in-process — synchronous paths get synchronous RPC, asynchronous paths get a queue, and neither path is forced into the other's mechanism for the sake of uniformity.

> **Ruling API-7.1 — Internal service-to-service communication, once services are extracted, follows the same sync/async split as the macro request model: synchronous RPC for read/ask paths, message queue/event stream for ingest/compute paths. No internal communication mechanism is chosen for uniformity over fitness.** *Basis: Ch2 §5; Ch1 §8 MR-2.*

---

### 8. The AI plane's API surface

Chapter 3 specified the AI Gateway's *internal* responsibilities (routing, caching, egress minimization); this chapter fixes how the **AI plane is reached as an API**, because — per §0's prime directive — it is reached through the same contract as everything else, not a side channel.

- **Copilot-to-AI-plane calls are ordinary, versioned, validated API routes** (e.g., an NL-query endpoint accepting a question and returning a grounded answer payload) — Pydantic request/response models, the same error contract (§6), the same auth dependency (Ch4).
- **Tool calls (Ch3 §5) are internal, not externally addressable.** The model's tool-call mechanism is part of the AI Gateway's internals; no external client calls a "tool" directly — they call the copilot-facing NL endpoint, and the AI plane's internal orchestration (Chapter 3) decides which governed tools to invoke. This keeps the *external* contract simple (one endpoint, one grounded-answer shape) regardless of how many internal tool calls a given question requires.
- **Long-running AI tasks (e.g., an accreditation draft) follow the same fire-and-poll pattern as ingestion (§7)** — a request returns a handle, status is polled — rather than holding a connection open for a generative task that may take longer than a typical request timeout.

---

### 9. Idempotency at the API boundary

**Reads are naturally idempotent; not every write is — and the contract should say so per-endpoint, not leave it implicit.** GET requests are idempotent by definition. POST requests that create a resource are the risk: a client retry after a timed-out request (did the create succeed before the timeout, or not?) must not silently double-create.

- **Where natural-key upserts already provide idempotency (Ch6 §3.1's canonical writes via ingestion)**, retrying an import is already safe — this is inherited, not a new API-layer mechanism.
- **Where a write has no natural key to upsert against (e.g., creating an intervention, §6's `POST /risk/interventions`)**, the contract relies on the client not blindly retrying without checking state first via the corresponding GET — acceptable at v1 scale, but named here as a real gap: a future **idempotency-key** convention (client-supplied request id, deduplicated server-side for a bounded window) is the standard pattern this chapter recommends adopting for any write endpoint where blind-retry-driven duplication would have a real cost (e.g., duplicate parent-contact interventions for a minor). This is flagged as a near-term improvement, not yet built.

> **Ruling API-9.1 — Writes with a natural-key upsert path (ingestion) are idempotent by inheritance from Chapter 6; writes without one are not yet idempotency-key protected — this is a named, open improvement, not a silent gap.** *Basis: honesty about current coverage; Ch1 §4.7's spirit applied to the API layer.*

---

### 10. Rate limiting & quotas at the API boundary

Chapter 3 (§3) named per-tenant quotas as an AI Gateway responsibility; Chapter 6 (§6) named Redis as the store for the counters. This chapter fixes where in the request lifecycle the check happens: **at the API boundary, before a request reaches the AI plane or any expensive operation**, using the tenant id already resolved by Chapter 4's auth dependency — the same tenant context every other per-tenant check in this Bible uses, not a separately derived value.

- **AI-plane calls** are rate-limited per-tenant specifically to prevent one college's usage from degrading another's AI response latency or cost budget (Ch2 AD-6.1's noisy-neighbor concern, applied to the AI plane specifically).
- **General API calls** carry a generous default ceiling (protecting platform stability from a misbehaving client or script) well above normal usage, distinct from the tighter AI-specific quota.
- **A rate-limited request returns a distinct, documented status** (429, with a `Retry-After` hint) — not folded into the generic `{"error": ...}` shape silently; a client should be able to distinguish "you asked for something invalid" from "you asked too often."

---

### 11. Documentation & discoverability

Because the OpenAPI spec is generated from the same Pydantic models that validate every request (§5), the platform's interactive API documentation (FastAPI's built-in Swagger/ReDoc UI) is **never stale by construction** — it reflects exactly what the running application accepts and returns, including the error shapes (§6) and the deprecation markers a `v1`→`v2` transition would carry (§4). This is named here as a standard, not a convenience: any new endpoint is documented the moment it exists, with zero additional authoring effort, because the documentation *is* the code's own contract surfaced.

---

### 12. Failure & degradation (API-layer specific)

| Failure | Behaviour | Why |
|---|---|---|
| **Request fails Pydantic validation** | 422 with FastAPI's native field-level detail; rejected before any service/repository code runs. | Fail fast, before touching data (Ch1 driver #1's spirit — nothing happens on bad input). |
| **Caller authenticated but lacks the capability** | 403 `{"error": ...}` — a true capability denial (Ch4 §5 RBAC). | Distinguished from scope mismatches (404), per §6. |
| **Caller authenticated but the specific resource is out of scope** | 404 `{"error": "Resource not found."}` — existence hidden. | Ch1 §3 Group A; §6. |
| **A retried write without an idempotency key creates a near-duplicate** | Currently possible for non-upsert writes (§9); mitigated by client-side caution, not yet by a server-side guarantee. | Named honestly as an open gap, not hidden. |
| **AI-plane quota exceeded for a tenant** | 429 with `Retry-After`; the rest of the platform (dashboards, non-AI reads) remains fully available for that tenant. | Ch2 §8 — failures/limits contained to their plane; a quota is not a platform-wide outage. |
| **A future service extraction changes the internal call path** | The external API contract (this chapter) is unchanged; only the internal communication mechanism (§7) changes. | The entire point of fixing the external contract independently of internal topology. |

---

### 13. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **API-3.1** | Gateway | Single application as gateway at v1; dedicated gateway introduced at first service extraction | Dedicated gateway now; never introducing one | Ch1 §5; Ch2 AD-2.1 |
| **API-4.1** | Versioning | URI versioning (`/v1/...`) adopted now, retroactively covering the current surface | Header versioning; no versioning | Ch1 driver #4; avoiding forced simultaneous migration |
| **API-5.1** | Contract source of truth | Pydantic models generate both the OpenAPI spec and the frontend TS client; nothing hand-maintained | Hand-written docs/types | Ch1 §3 Group C; eliminates drift by construction |
| **API-6.1** | Error contract | Exactly two shapes: `{"error":...}` app exceptions, native 422 validation errors | Per-endpoint bespoke error shapes | Client simplicity |
| **API-7.1** | Internal communication post-extraction | Sync RPC for read/ask paths, queue/event stream for ingest/compute paths — matches the macro split | One uniform internal mechanism | Ch2 §5; Ch1 §8 MR-2 |
| **API-9.1** | Write idempotency | Inherited via upsert for ingestion; idempotency-key protection for other writes named as open, not built | Claiming full idempotency coverage | Honesty about current state |

---

### 14. How this chapter governs the rest of the Bible

- **Chapter 6 (Data Architecture)** is exposed exclusively through the contracts this chapter defines — no route ever serializes a raw or staging table directly (Ch6 §4's layer boundary, enforced here at the API surface).
- **Chapter 8 (Security Architecture)** builds rate-limiting enforcement, webhook signature verification at the `/sources`-adjacent ingress routes, and the full audit trail around every request this chapter's contract describes.
- **Chapter 9 (Frontend)** consumes the generated TypeScript client (§5) as its only means of talking to the backend — never a hand-written fetch against an assumed shape.
- **Chapter 10 (DevOps)** operationalizes the eventual dedicated gateway (§3) at the moment service extraction makes it necessary, and owns the rate-limiting infrastructure's deployment.
- **Chapter 13 (ADRs)** should formally record API-3.1 and API-4.1 as standalone ADRs, given their consequence and the explicit "decide now, before it's forced" framing of §3–4.
- **Chapter 14 (Testing)** owns contract tests verifying the OpenAPI spec matches runtime behavior, and the 404-vs-403 conformance suite across every route.

New API-layer tensions are added to this ledger (§13) by amendment.

---

### 15. Sign-off

This chapter is normative once ratified. Amendments to the error contract (§6) or the versioning scheme (§4) require Architecture Review Board approval, since both are breaking-change-sensitive by nature.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal API Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal UX Architect | | ☐ Approve ☐ Revise | |

---

*End of Chapter 7 — API & Integration Standards.*
