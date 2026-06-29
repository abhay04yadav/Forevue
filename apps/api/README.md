# Forevue API (`apps/api`)

**Status:** Phase 4 — Student Success Engine (risk scoring, interventions, alerts).

The FastAPI **modular monolith** (Bible `AD-2.1`). Current surface:

| Area | Status |
|---|---|
| `app/core/` | config, db, security, RLS, audit, logging, exceptions, storage |
| `app/models/` | tenants, users, audit, ingestion, canonical, identity, conflict, risk |
| `app/repositories/` | tenant, user, risk (defense-in-depth + role scoping) |
| `app/services/auth_service.py` | register, login, refresh |
| `app/services/ingestion/` | medallion pipeline + post-import risk recompute hook |
| `app/services/risk/` | signals, rules, evaluator, scoring, interventions, alerts |
| `app/api/routes/` | `/health`, `/auth/*`, `/sources`, `/mappings`, `/imports`, `/students`, `/risk/*` |
| `migrations/` | Phase 0–2 (foundation, ingestion, risk engine, canonical hardening) |

**Release gate:** `pytest` — RLS + ingestion + risk explainability/determinism tests.

Run locally: see [`docs/engineering/DEVELOPMENT_SETUP.md`](../../docs/engineering/DEVELOPMENT_SETUP.md).

Frontend rebuild lands in Phase 5 per [`MIGRATION_PLAN.md`](../../docs/engineering/MIGRATION_PLAN.md).
