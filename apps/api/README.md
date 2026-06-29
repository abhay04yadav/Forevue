# Forevue API (`apps/api`)

**Status:** Phase 6 — hardening (token revocation, request tracing, user/scope management).

The FastAPI **modular monolith** (Bible `AD-2.1`). Current surface:

| Area | Status |
|---|---|
| `app/core/` | config, db, security, RLS, audit, logging, exceptions, storage, middleware |
| `app/core/kv.py` | Redis or in-memory ephemeral store (denylist, rate limits) |
| `app/core/refresh_tokens.py` | Refresh rotation + reuse detection |
| `app/models/` | tenants, users, audit, ingestion, canonical, identity, conflict, risk |
| `app/repositories/` | tenant, user, risk, faculty_scope |
| `app/services/` | auth (rotation/logout), ingestion, risk, user provisioning |
| `app/api/routes/` | `/health`, `/auth/*`, `/users/*`, ingestion, students, `/risk/*` |
| `migrations/` | Phase 0–2 |

**Release gate:** `pytest` — RLS + ingestion + risk + hardening tests.

Run locally: see [`docs/engineering/DEVELOPMENT_SETUP.md`](../../docs/engineering/DEVELOPMENT_SETUP.md).

AI plane lands in Phase 7+ per [`MIGRATION_PLAN.md`](../../docs/engineering/MIGRATION_PLAN.md).
