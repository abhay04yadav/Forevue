# Forevue API (`apps/api`)

**Status:** Phase 3 — ingestion, canonical data, entity resolution.

The FastAPI **modular monolith** (Bible `AD-2.1`). Current surface:

| Area | Status |
|---|---|
| `app/core/` | config, db, security, RLS, audit, logging, exceptions, storage |
| `app/models/` | tenants, users, audit, ingestion, canonical, identity, conflict |
| `app/repositories/` | tenant + user (defense-in-depth) |
| `app/services/auth_service.py` | register, login, refresh |
| `app/services/ingestion/` | medallion pipeline, connectors, normalizers, resolver |
| `app/api/routes/` | `/health`, `/auth/*`, `/sources`, `/mappings`, `/imports`, `/students` |
| `migrations/` | Phase 0–1 ingestion + canonical schema (risk DDL present; engine in Phase 4) |

**Release gate:** `pytest` — RLS + ingestion idempotency, quarantine, normalizers, resolver tests.

Run locally: see [`docs/engineering/DEVELOPMENT_SETUP.md`](../../docs/engineering/DEVELOPMENT_SETUP.md).

Risk engine routes and recompute hook land in Phase 4 per [`MIGRATION_PLAN.md`](../../docs/engineering/MIGRATION_PLAN.md).
