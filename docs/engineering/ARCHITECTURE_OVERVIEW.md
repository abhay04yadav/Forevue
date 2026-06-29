# Architecture Overview

A distilled, navigable summary of the Forevue architecture. **This is a map, not
the territory.** The authoritative source is the frozen **Architecture Bible**
(`docs/architecture-bible/`, Ch01–Ch15); every section below points to the
chapter and ruling that owns the full reasoning. Nothing here re-decides or
overrides the Bible.

---

## 1. What Forevue is, architecturally

The existing college ERP/SIS is the **System of Record**. Forevue is the
**System of Intelligence** layered on top of it: it ingests fragmented
multi-source data into a governed canonical truth, watches every student with a
deterministic risk engine, and answers natural-language questions grounded in
real numbers — without ever letting an LLM touch raw data or invent a figure.

The product's binding invariants (Ch1): tenant isolation, explainability, no
NL-to-raw-SQL, no silent data loss, human-in-the-loop adjudication.

---

## 2. The macro shape — a one-directional pipeline (Ch2 §1)

Data flows up from source systems toward the user; queries flow down.

```
        USERS (Director · Academic Head · HOD · Faculty · Placement · Student)
                                   ▲
   EXPERIENCE PLANE   persona copilots / NL interface  (one API-first client)
                                   ▲
   AI PLANE           LLM orchestration — UNTRUSTED; NL→semantic layer,
   (zero-trust)       Student Success narration, guardrails (never emits SQL/tenant id)
                                   ▲  governed, read-only queries
   SERVING PLANE      semantic / metrics layer + read replica
                                   ▲
   DATA PLANE         UNIFIED DATA LAYER — canonical SoT (Postgres + RLS)   ← the moat
                                   ▲  medallion: RAW → STAGING → CANONICAL
   INTEGRATION PLANE  ingestion & ETL · entity resolution → one canonical student_id
                                   ▲
        SOURCE SYSTEMS (ERPNext · Fedena · MasterSoft · TCS iON · Excel · LMS · …)

   CONTROL PLANE (orthogonal, in every request): identity & tenancy · RBAC ·
                  audit · configuration · observability
```

Two load-bearing properties: data only flows **forward** through the medallion
(provenance + no data loss), and the serving plane sits **between** AI and data
so "no NL-to-raw-SQL" is enforced by topology, not policy.

---

## 3. Decomposition — modular monolith with seams (Ch2 §3, `AD-2.1`)

One deployable application, internally partitioned along bounded contexts with
strict `api → service → repository → model` layering and one-directional module
dependencies. The two heavy seams — **ingestion workers** and **AI
orchestration** — are pre-drawn for extraction into `services/` under measured
load; until then they are in-process modules behind stable interfaces. Not
microservices (premature), not a boundary-less monolith (seams rot).

---

## 4. Multi-tenancy — pooled, isolated in depth (Ch2 §6, `AD-6.1`)

One logical platform serves many colleges. Every tenant-owned row carries
`tenant_id`. **Postgres Row-Level Security is the floor** (`ENABLE` + `FORCE`,
against a non-superuser role); the repository layer adds an explicit tenant
filter on top (defense in depth). Tenant context is set **server-side from the
verified JWT** and a missing context returns **zero rows**, never all rows. A
dedicated silo is the documented escape hatch for a marquee tenant.

---

## 5. Request lifecycles (Ch2 §4)

- **NL query (sync):** authenticate → resolve tenant/role server-side → open
  RLS session → LLM parses language → maps to **governed** semantic selection →
  serving layer executes read-only on tenant-scoped views → answer **grounded**
  in the result set → audit. Fallback ("I can't answer that from your data")
  instead of a hallucinated number.
- **Ingestion (async write):** `RECEIVED → PARSED → MAPPED → CLEANED → RESOLVED
  → LOADED → RECONCILED → COMPLETED` across **three transaction boundaries** so
  raw/staging survive a later load failure; entity resolution collapses
  identities, ambiguous matches become human merge-review items (never
  auto-merge).
- **Continuous risk (event-triggered):** on import COMPLETED → bulk-compute
  signals (no N+1) → deterministic rules → tier + score + **findings** (no score
  without findings) → idempotent persist → in-app alert for a **human** (never
  an auto-action; minors get no auto parent-contact).
- **Role-scoped read:** dashboards/boards — tenant + **role** scoping;
  out-of-scope records return **404, not 403**.

The two paths (fast sync read/ask vs slow async ingest/compute) are decoupled
and meet only at the data layer, where interactive reads hit a **read replica**
(`AD-5.1`).

---

## 6. Technology decisions (Ch13 catalog — `TDR-1…22`)

| Area | Choice | TDR |
|---|---|---|
| Backend | Python 3.12 + FastAPI | 1 |
| ORM / migrations | SQLAlchemy 2.x (typed) + Alembic | 2 |
| System of record | PostgreSQL | 3 |
| Isolation floor | Postgres RLS | 4 |
| Cache / rate limit / token denylist | Redis | 5 |
| Embeddings | pgvector (in primary Postgres) | 6 |
| LLM access | Vendor-agnostic AI Gateway | 7 |
| NL → data | Governed tool-calling, never raw SQL | 8 |
| Adjudication | Deterministic rules (ML-ready interface) | 9 |
| API | REST + OpenAPI | 10 |
| Contract | Pydantic → OpenAPI → generated TS client | 11 |
| Connectors | Minimal custom `Connector` ABC | 12 |
| Frontend | React + TS + Vite + React Router | 13 |
| Server state | TanStack Query | 14 |
| Auth | JWT (stateless) + Argon2 | 15 |
| Orchestration | Managed container/PaaS (not k8s at v1) | 16 |
| Pipeline runtime | In-process background tasks (v1) | 17 |
| API gateway | None dedicated at v1 | 18 |
| Tracing | OpenTelemetry (when built) | 19 |
| Lint/type | Ruff + Mypy | 20 |
| Testing | Pytest + testcontainers | 21 |
| Decomposition | Modular monolith | 22 |

Several "not yet" infrastructure decisions (16, 17, 18, 22) share **one** revisit
trigger: the `AD-2.1` service-extraction point — revisit them together.

---

## 7. Security posture (Ch4, Ch8)

Server-side identity; RLS + app scoping; 404-not-403; JWT + Argon2 with
Redis-backed refresh-token revocation; append-only audit of every
security-relevant action and AI interaction; no NL-to-raw-SQL; India data
residency (multi-AZ, not multi-region) for Indian tenants; DPDP minor
protections. See [`SECURITY.md`](../../SECURITY.md).

---

## 8. DevOps & operations (Ch10, Ch11)

One artifact promoted by configuration through dev → staging → prod; managed
PaaS + managed Postgres/Redis; migrations are a release-blocking, additive-by-
default step; continuous PITR backups for Postgres (no DR for Redis); horizontal
app scaling + read-replica scaling. CI gates: Ruff (hard) + Mypy
(advisory→blocking) + Pytest backend; Oxlint + `tsc --noEmit` + Playwright
frontend. Health checks + structured `tenant_id`-tagged logs feed observability.

---

## 9. Engineering standards (Ch12)

Full typing; determinism in adjudication; no magic numbers (config, not
constants); explainability asserted in code; idempotent, version-stamped writes;
bounded-query batches; defense-in-depth on every new table; per-item error
isolation; strict one-directional layering. Process: scoped **Change Orders**,
one-commit-per-change, inline chapter-prefixed `Ruling-X.X` ADRs (catalog in
Ch13), a curated phase-organized `CHANGELOG`, and docstrings that cite their
spec section.

---

## 10. Scale progression (Ch2 §9)

```
1 college    → modular monolith, in-process pipeline, single primary + replica
100 colleges → scale app replicas + read replica; tune the pool
1,000        → extract ingestion + AI services; queue replaces in-process pipeline;
               adopt an orchestrator (the AD-2.1 trigger fires)
millions     → sized analytical/warehouse tier; cross-tenant DR non-negotiable
```

Every step is a planned extraction along a pre-drawn seam or a capacity
increase — never a rewrite.

---

## 11. How to use this overview

- Need the **why** behind a decision → read the cited Bible chapter/ruling.
- Need the **what** a phase builds → its implementation spec.
- Need the **how** of a specific change → its Change Order.
- Need the **record** of what was decided/fixed → `CHANGELOG.md`.

This overview is updated when the Bible is amended (ARB sign-off) — it never
drifts ahead of the frozen source.
