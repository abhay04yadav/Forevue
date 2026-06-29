# Forevue API (`apps/api`)

**Status:** Phase 2 — foundation (auth, RLS, audit).

The FastAPI **modular monolith** (Bible `AD-2.1`). Current surface:

| Area | Status |
|---|---|
| `app/core/` | config, db, security, RLS, audit, logging, exceptions |
| `app/models/` | tenants, users, audit_log |
| `app/repositories/` | tenant + user (defense-in-depth) |
| `app/services/auth_service.py` | register, login, refresh |
| `app/api/routes/` | `/health`, `/auth/*` |
| `migrations/` | Phase 0 foundation (RLS bootstrap) |

**Release gate:** `pytest` — RLS isolation + coverage tests must pass.

Run locally: see [`docs/engineering/DEVELOPMENT_SETUP.md`](../../docs/engineering/DEVELOPMENT_SETUP.md).

Further modules (ingestion, risk, AI) land per [`MIGRATION_PLAN.md`](../../docs/engineering/MIGRATION_PLAN.md).
