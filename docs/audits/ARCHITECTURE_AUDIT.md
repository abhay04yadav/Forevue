# ARCHITECTURE AUDIT — Forevue / AI College Copilot

**Prepared by:** Lead Software Architect
**Scope:** Full repository audit (read-only). No code was modified.
**Audited tree:** `D:\ERP AI Layer\` (primary codebase under `AI-ERP-Copilot/`)
**Method:** Static read of backend, frontend, migrations, tests, CI, docs, and design artifacts.

> **Scale at a glance**
> - Backend app: **~4,426 LOC** Python (`backend/app`), **~2,262 LOC** tests (14 test files)
> - Frontend: **~4,694 LOC** TypeScript/TSX/CSS (`frontend/src`)
> - 5 Alembic migrations (Phase 0 → Phase 2 + 2 hardening)
> - Phases delivered: **Phase 0 (foundation)**, **Phase 1 (ingestion)**, **Phase 2 (Student Success Engine)**; Phase 3 (frontend) in progress.

---

## 1. Current Architecture

### 1.1 Topology

A **two-tier monorepo** (no shared runtime package), multi-tenant SaaS:

```
AI-ERP-Copilot/
├── backend/                # FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL
│   ├── app/
│   │   ├── api/routes/     # auth, health, sources, mappings, imports, students, risk
│   │   ├── api/deps.py     # auth + tenant-scoped session dependency injection
│   │   ├── core/           # config, db, security, rls, audit, logging, exceptions, storage
│   │   ├── models/         # tenant, user, canonical (SoT), ingestion, identity, risk, audit, conflict
│   │   ├── repositories/   # tenant-scoped data access (defense-in-depth)
│   │   ├── schemas/        # Pydantic request/response models
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── ingestion/  # connectors, mapping, cleaning, resolution, loading, reconciliation
│   │       └── risk/       # signals, rules, evaluator, scoring, engine, interventions, alerts, scoping
│   ├── migrations/         # Alembic (RLS bootstrap + schema)
│   ├── tests/              # pytest + testcontainers (incl. RLS isolation/coverage)
│   └── scripts/            # seed_demo.py + sample_data
├── frontend/               # React 19 + Vite + React Router 7 + TanStack Query + axios
│   └── src/{api,auth,design,hooks,layout,pages}
├── Docs/                   # Implementation specs + change orders (Phase 0–3)
├── .github/workflows/      # backend-ci.yml (lint + test)
├── Backend code repository shared/   # ⚠ MISNAMED: holds design HTML + screenshots, not code
└── CHANGELOG.md            # Detailed, spec-traceable decision log
```

### 1.2 Backend

- **Framework:** FastAPI 0.115, Uvicorn, Pydantic 2.10 / pydantic-settings.
- **Persistence:** SQLAlchemy 2.0 ORM (typed `Mapped[]`), PostgreSQL via `psycopg` 3, Alembic 1.14.
- **Layering** is clean and consistently applied: `routes → services → repositories → models`, with `core/` cross-cutting concerns. Services never import routes; the risk module imports nothing from the ingestion pipeline (one-directional hook only — `pipeline.py::_phase_risk_recompute`).
- **Multi-tenancy** is the architectural spine, implemented in depth:
  - **Postgres Row-Level Security**: every tenant table runs `ENABLE` + `FORCE ROW LEVEL SECURITY` with a `tenant_isolation` policy keyed on `current_setting('app.current_tenant')` (`migrations/versions/*`).
  - The app connects as a **non-superuser `app_user`** role (RLS is not bypassable), while migrations use a separate privileged role (`MIGRATIONS_DATABASE_URL`).
  - Tenant context is set **only from the verified JWT**, never from headers/params, inside the transaction via `set_config(..., is_local=true)` with a bound parameter (`core/rls.py`, `api/deps.py::get_tenant_session`).
  - **Defense-in-depth**: `repositories/base.py::TenantRepository` *also* filters `tenant_id` in application SQL on top of RLS.
- **Auditability:** append-only `audit_log` written via SQLAlchemy **mapper events** (`core/audit.py`), wired per-model in `models/__init__.py`. Actor attribution uses `session.info` rather than contextvars (a documented fix for Starlette threadpool context-copy behavior).
- **Observability:** structured logging with `request_id`/`tenant_id` log context (`core/logging.py`).

### 1.3 Frontend

- **Stack:** React 19, Vite 8, React Router 7, TanStack Query 5, axios, plain CSS with a token system (`design/tokens.ts`, `design/global.css`).
- **Auth flow:** JWT access/refresh in `localStorage` (`auth/tokenStorage.ts`), axios interceptors attach the bearer token and perform **single-flight refresh-on-401** with retry (`api/client.ts`). Role-gating via decoded JWT for nav/route visibility only (server remains the security boundary).
- **Routing:** declarative guards `RequireAuth` / `RequirePrivileged` / `RequireAdmin` (`App.tsx`, `auth/RequireAuth.tsx`).
- **Pages:** Login, RiskBoard, Student detail, Dashboard, RiskConfig, Imports (343 LOC student page is the largest).
- **Typed contract:** `api/schema.d.ts` generated via `openapi-typescript` from the backend's OpenAPI.

### 1.4 The "AI" modules (important clarification)

The **"AI"/Student Success Engine is a deterministic, explainable rules engine — not ML/LLM.** `model_type = "rules"`, `model_version = "rules-v1"` (`services/risk/evaluator/rules_evaluator.py`). It is well-designed for an eventual ML swap:

- **Signals** (`services/risk/signals/`): bulk aggregate reads for attendance / academic / fee per batch (fixed query count regardless of student count).
- **Rules** (`services/risk/rules/`): pure functions, no I/O, returning typed `RiskFinding`s with evidence; registered in `rules/registry.py`.
- **Scoring/Tiering** (`services/risk/scoring.py`): score = clamped sum of finding weights; tier from configurable cutoffs.
- **Config** (`services/risk/config.py`): per-tenant, **versioned**, no magic numbers; new config = new version (history preserved).
- **Engine** (`services/risk/engine.py`): idempotent recompute (identical inputs → no new row), per-student SAVEPOINT isolation, alert generation on material tier transitions.
- **Forward-compat for ML** already exists: `MODEL_TYPES = ("rules", "ml")`, `signals_snapshot` JSONB persisted per assessment, and `intervention_outcomes` framed as "future ML labels."

The fuzzy **identity resolver** (`services/ingestion/resolution/resolver.py`) uses `rapidfuzz` for name/dob/contact scoring — algorithmic, not ML.

### 1.5 Integrations

- **Inbound data:** CSV/Excel file upload only (`services/ingestion/connectors/csv_excel.py`). No live ERP/SIS API connectors yet (connector base class exists for extension).
- **File storage:** pluggable `StorageBackend` (`core/storage.py`); current impl stores bytes in Postgres `bytea`, with a documented S3 swap point.
- **Outbound notifications:** in-app alerts only; email/SMS/WhatsApp are **stubbed no-ops** by design (Phase 2).

---

## 2. Existing Reusable Modules

These are genuine assets — well-factored, tested, and reusable as-is:

| Module | Path | Why reusable |
|---|---|---|
| Tenant RLS primitive | `core/rls.py` | Single, safe entry point for tenant scoping. |
| Tenant session DI | `api/deps.py::get_tenant_session` | Correct, well-documented session+RLS+audit wiring. |
| Generic audit hooks | `core/audit.py::register_audit_hooks` | Drop-in per-model audit; reused across Phase 0/1/2. |
| Base model mixins | `models/base.py` (`PKMixin`, `TenantMixin`, `TimestampMixin`, `SoftDeleteMixin`, `ProvenanceMixin`) | Consistent table shape. |
| Tenant repository | `repositories/base.py` | Defense-in-depth base for all data access. |
| Pluggable storage | `core/storage.py` | Clean S3/blob abstraction. |
| Ingestion pipeline framework | `services/ingestion/pipeline.py` | Reusable state machine + per-row quarantine philosophy. |
| Risk rule framework | `services/risk/rules/*`, `evaluator/base.py` | Pure-function rules + registry; trivially extensible. |
| RBAC scoping | `services/risk/scoping.py` | Role + FacultyScope visibility resolution (both directions). |
| Exception → HTTP mapping | `core/exceptions.py` | Consistent error contract. |
| Frontend API client | `frontend/src/api/client.ts` | Reusable axios instance w/ refresh handling. |
| Frontend design tokens | `frontend/src/design/` | Colour-vision-safe tier system (shape + colour + label). |

---

## 3. What Should Be Preserved

- **The multi-tenant security model** — forced RLS + non-superuser role + JWT-derived context + defense-in-depth repository filtering. This is the strongest part of the system and should be the non-negotiable pattern for every new table/feature.
- **Append-only audit logging** via mapper events.
- **Explainability invariants** of the risk engine (non-low tier must carry findings; score must reconcile exactly with finding weights — asserted in `engine.py::_persist_one`). Preserve when ML is introduced (keep findings/evidence).
- **Config versioning** (never mutate historical config; old assessments resolve to the config that produced them).
- **Idempotency** everywhere: content-hash dedupe on upload, natural-key upserts, no-op recompute on unchanged inputs.
- **DPDP/minor-protection gates** (`engine.py::compute_subject_minor_status`, `interventions.py` parent_contact consent gate, `alerts.py` recipient gating). These are correctly centralized and documented.
- **Per-row quarantine** ingestion philosophy (one bad row never aborts the batch; canonical write still atomic).
- **The CHANGELOG/spec discipline** — decisions are traceable to spec sections. Keep this practice.
- **Backend test depth**, especially `test_rls_isolation.py` / `test_rls_coverage.py`.

---

## 4. What Should Be Refactored

1. **Fuzzy resolver scalability (high priority).** `resolver.py::_best_fuzzy_candidate` loads **all** tenant students into memory and scores them per incoming row → **O(students × incoming rows)**. Fine for demos, quadratic for real colleges. Refactor to a blocking/indexing strategy (e.g., pg_trgm GIN index, candidate pre-filter by roll/dob/email, or a dedicated match index).
2. **Ingestion + recompute should move off in-process `BackgroundTasks`.** Today both run inside the web process (`imports.py` → `run_pipeline`; recompute synchronous for tenant scope). This won't survive restarts, has no retry/backoff, no visibility queue, and blocks horizontal scaling. Introduce a job queue/worker (arq/Celery/RQ) — the `triggered_by = "scheduled"` enum already anticipates this.
3. **Token lifecycle.** Logout is client-side only (`clearTokens`); there is **no server-side refresh-token revocation/rotation/blacklist**, so a stolen refresh token is valid for 7 days. Add rotation + a revocation store (jti/denylist) and short-lived refresh reuse detection.
4. **`request_id` logging is dead.** `request_id_ctx` is defined but no middleware sets it, so logs always show `request_id=-`. Add an ASGI middleware to generate/propagate a request id (and ideally `X-Request-ID`).
5. **Pay down the 75 pre-existing mypy errors** and flip `mypy` from `continue-on-error: true` to a hard gate (tracked in CI comments / CHANGELOG).
6. **Consolidate design artifacts.** Design lives in: `Backend code repository shared/` (misnamed), `Forevue Design System Guide/`, `Forevue Final Designs/`, and loose `forevue-brand-*` files at the workspace root. Rename/relocate into a single `design/` (or move out of the code repo entirely).
7. **CORS** uses `allow_methods=["*"]`, `allow_headers=["*"]`. Tighten to the actual surface for production.
8. **Frontend `StudentPage.tsx` (343 LOC)** is doing a lot; consider extracting view-model/data hooks for testability.

---

## 5. What Should Be Removed (from the code repository)

> None of the *application code* is dead and should be removed — but several **artifacts that should never live in a code repo** are present in the working tree:

- **Build/tool caches & virtualenv**: `backend/.venv/`, `.mypy_cache/`, `.pytest_cache/`, `.ruff_cache/`, `*.egg-info/`, `__pycache__/`. These dominate the directory count (~1,400 dirs) and must not be tracked. (They are listed in `.gitignore`, but the repo isn't under git yet — see §8.)
- **Committed secrets file `backend/.env`** containing a real `JWT_SECRET_KEY`, `APP_DB_PASSWORD`, and DB credentials. Remove from the tree, rotate the secrets, and replace with `.env.example`. (See Risks §8.)
- **Misnamed `Backend code repository shared/`** — it contains `*.dc.html` design comps, `support.js`, and `screenshots/`, not backend code. Relocate to `design/` and delete the folder name.
- **Forward-compat stub tables** (`Hostel`, `Placement`, `ResearchPublication`, and unwired `SemesterResult`/`Faculty`) are *intentional* per spec §6 — **keep**, but track them as "schema present, not wired" so they aren't mistaken for working features.

---

## 6. Technical Debt

| # | Debt | Location | Severity |
|---|---|---|---|
| D1 | Repository **not under version control** (no `.git`) | workspace root | **Critical** |
| D2 | **Secrets committed** in working tree (`.env` with real JWT/DB creds) | `backend/.env` | **Critical** |
| D3 | In-process background tasks (no queue/retry/durability) | `pipeline.py`, `imports.py` | High |
| D4 | Quadratic fuzzy resolver | `resolution/resolver.py` | High |
| D5 | No refresh-token revocation/rotation | `core/security.py`, FE `client.ts` | High |
| D6 | 75 unresolved mypy errors; mypy advisory-only in CI | repo-wide / `backend-ci.yml` | Medium |
| D7 | `request_id` never populated | `core/logging.py` | Medium |
| D8 | No deployment artifacts (Docker/compose/IaC) | repo-wide | High |
| D9 | No frontend tests (Playwright dep present, 0 test files) | `frontend/` | Medium |
| D10 | No API versioning (`/v1`) | `app/main.py` routers | Medium |
| D11 | No rate limiting / brute-force protection on `/auth/*` | `routes/auth.py` | High (security) |
| D12 | CORS wildcards for methods/headers | `app/main.py` | Low |
| D13 | Risk summaries computed on every read (no caching) | `repositories/risk_repository.py` | Low/Medium |
| D14 | FE↔BE contract sync (`schema.d.ts`) not enforced in CI | `frontend/`, CI | Medium |
| D15 | Scattered/duplicated design assets, misleading folder names | repo root | Low |

---

## 7. Missing Modules / Capabilities

**Platform / DevOps**
- Containerization (`Dockerfile`, `docker-compose`) and Infrastructure-as-Code.
- Secrets management (Vault/SSM/Doppler) and per-environment config strategy.
- CI **deploy** pipeline + automated DB migration step (current CI only lints + tests backend; **no frontend CI**).
- Observability: metrics (Prometheus/OpenTelemetry), tracing, error tracking (e.g., Sentry), and richer health/readiness probes.

**Backend / product**
- **Background job queue + scheduler** (for durable ingestion and scheduled risk recompute; the `"scheduled"` enum is unused).
- **User & access management**: `/auth/register` only creates a tenant + first admin. There is **no API/UI to invite/create additional users, assign roles, or manage `FacultyScope` rows** — yet faculty visibility depends entirely on those rows. This is a functional gap.
- **Password reset / email verification / MFA**.
- **Notification delivery** (email/SMS/WhatsApp) — currently stubbed.
- **Live ERP/SIS connectors** (API-based ingestion beyond CSV/Excel).
- **The actual ML model** (the product is "AI", currently rules-only). The scaffolding (`signals_snapshot`, `intervention_outcomes`, `model_type="ml"`) exists; the model does not.
- **Merge-review resolution UI/API** — `MergeReviewItem`s are created by the resolver but there's no surfaced workflow to action them.
- **Reporting/export** (accreditation reports, CSV export, IQAC dashboards beyond the current summary).
- **Data retention / deletion (DPDP "right to erasure")** workflow.

**Frontend**
- Test suite (unit/integration/E2E), error boundaries, and a shared component library beyond the `design/` primitives.

**Shared**
- A genuinely **shared package** for cross-cutting types/constants (currently the only contract is a generated `schema.d.ts`; enums like roles/tiers are re-declared in both FE and BE).

---

## 8. Risks

### 8.1 Critical
- **R1 — No version control.** There is no `.git` repository. All history, review, rollback, and collaboration safety is absent. **Single greatest risk.** A single bad change or disk loss is unrecoverable.
- **R2 — Live secrets in the tree.** `backend/.env` exposes a real `JWT_SECRET_KEY`, DB password, and `APP_DB_PASSWORD`. Anyone with the secret can forge tenant-crossing JWTs (the secret *is* the entire auth boundary). **Rotate immediately; never commit once git is introduced (it is already in `.gitignore`).**

### 8.2 High
- **R3 — Auth abuse:** no rate limiting/lockout on login/refresh → credential stuffing / brute force.
- **R4 — Token theft window:** JWT in `localStorage` (XSS-exfiltratable) + no refresh revocation → up to 7-day exposure after compromise.
- **R5 — Operational durability:** in-process ingestion/recompute means restarts/deploys lose in-flight work; no retry.
- **R6 — Scaling cliff:** the O(n²) resolver and full-tenant synchronous recompute degrade sharply as tenants grow.
- **R7 — No deployment story:** absence of containerization/IaC risks environment drift and unreproducible prod.

### 8.3 Medium
- **R8 — Contract drift:** `schema.d.ts` can silently diverge from the API (not regenerated/checked in CI).
- **R9 — Type-safety erosion:** 75 ignored mypy errors can mask real defects.
- **R10 — Compliance exposure:** DPDP gates exist for minors, but there is no data-retention/erasure capability — a gap for a system holding minors' academic records.

### 8.4 Low
- **R11 — Maintainability friction** from scattered/misnamed design folders and committed caches.

---

## 9. Migration / Remediation Strategy

A phased, low-risk sequence. Each stage is independently shippable.

### Stage 0 — Stabilize the foundation (days, do first)
1. **Initialize git**, add a root `.gitignore` (verify `.venv`, caches, `.env` excluded), make a clean initial commit, push to a remote. Establish branch protection + PR review.
2. **Rotate all secrets** in `backend/.env`; replace with `.env.example`; move real values to a secret manager / CI secrets.
3. **Purge caches/venv** from the tree; confirm `.gitignore` coverage.
4. Relocate design artifacts into a single `design/`; rename the misleading `Backend code repository shared/`.

### Stage 1 — Production readiness (1–2 sprints)
5. Add **Dockerfiles** (backend, frontend) + `docker-compose` for local Postgres; document run/migrate commands.
6. Add **frontend CI** and a **migration step** to the pipeline; add a `schema.d.ts` **drift check** (regenerate + fail on diff).
7. Add **observability**: request-id middleware (fix R7-adjacent logging), `/health/ready`, error tracking, basic metrics.
8. **Auth hardening**: rate limiting on `/auth/*`, refresh-token rotation + revocation store, account lockout.

### Stage 2 — Durability & scale (2–3 sprints)
9. Introduce a **job queue/worker** (arq/Celery). Move `run_pipeline` and `recompute_*` off `BackgroundTasks`; add retries, dead-letter, and the **scheduled recompute** the schema already anticipates.
10. **Refactor the resolver** to an indexed/blocking strategy (pg_trgm + candidate pre-filter); add a load test.
11. Pay down **mypy** debt; flip mypy to a hard CI gate.

### Stage 3 — Product gaps (parallelizable)
12. **User/role/scope management** API + admin UI (invite users, assign `FacultyScope`), and a **merge-review** workflow UI for `MergeReviewItem`.
13. **Notification delivery** (email first), behind the existing alert abstraction.
14. **Password reset / verification / MFA**.
15. **DPDP data-retention & erasure** workflow.
16. Frontend test suite + error boundaries.

### Stage 4 — The actual AI (when data volume justifies it)
17. Stand up an **ML model module** behind the existing `RiskEvaluator` interface (`model_type="ml"`), trained on `signals_snapshot` + `intervention_outcomes` labels. **Keep the rules engine** as a baseline/fallback and to preserve explainability (findings/evidence) — the architecture already supports running it alongside or ahead of ML.
18. Add **live ERP/SIS connectors** via the existing connector base.

### Cross-cutting
- Introduce **API versioning** (`/v1`) before external consumers appear.
- Extract a **shared contract package** (roles, tiers, enums) consumed by both FE and BE to end duplication.

---

## Appendix A — Notable strengths (for the record)

This codebase is **well above typical early-stage quality**: the security model is rigorous, the risk engine is genuinely explainable and idempotent, the ingestion pipeline's transactional boundaries are deliberate and documented, and the `CHANGELOG.md` ties nearly every non-obvious decision back to a spec clause. The debt items above are overwhelmingly **operational/DevOps and scale** concerns, not architectural defects in the application core. The single most urgent action is non-technical-feeling but critical: **get this under version control and rotate the exposed secrets.**

## Appendix B — Files reviewed (representative)

- Backend core: `main.py`, `core/{config,db,security,rls,audit,logging,exceptions,storage}.py`, `api/deps.py`
- Auth: `services/auth_service.py`, `routes/auth.py`
- Ingestion: `services/ingestion/pipeline.py`, `resolution/resolver.py`
- Risk engine: `services/risk/{engine,scoring,config,alerts,interventions,scoping}.py`, `evaluator/rules_evaluator.py`, `rules/attendance_rules.py`
- Models: `models/{__init__,canonical,risk}.py`
- Migrations: RLS bootstrap across `7c901e329671`, `864cf5488d33`, `572f080f3daa`
- Frontend: `main.tsx`, `App.tsx`, `api/client.ts`, `auth/{AuthContext,tokenStorage}.tsx/ts`, `design/tokens.ts`
- Config/CI: `pyproject.toml`, `alembic.ini`, `.github/workflows/backend-ci.yml`, `frontend/package.json`
