# Forevue API (`apps/api`)

**Status:** Skeleton — no application code yet.

The FastAPI **modular monolith** (Bible `AD-2.1`). Internal layering:

```
app/api/routes  →  app/services  →  app/repositories  →  app/models
```

Bounded contexts under `app/services/`: ingestion, risk, ai (future).

Migrations live in `migrations/` (Alembic; every tenant table ships RLS).

Application code will be migrated module-by-module per
`docs/engineering/MIGRATION_PLAN.md` — not copied from the legacy prototype.
