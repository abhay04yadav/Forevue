# Future extracted services (`services/`)

**Status:** Reserved seam — **no code at v1** (Bible `AD-2.1`).

When ingestion workers or AI orchestration are extracted under measured load,
they land here as independently deployable services. Until the `AD-2.1` trigger,
both run as in-process modules inside `apps/api` behind stable interfaces.

**Do not add application code to this directory until service extraction is
approved.**
