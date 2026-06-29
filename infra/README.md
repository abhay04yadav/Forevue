# Infrastructure (`infra/`)

**Status:** Skeleton — no Docker or deploy manifests yet (later phase).

| Subdirectory | Purpose |
|---|---|
| `docker/` | `Dockerfile.api`, `Dockerfile.web` (multi-stage) |
| `compose/` | Local dev: Postgres + Redis + app (`DEVOPS-6.1`) |
| `deploy/` | Managed-PaaS manifests / IaC |

The same built artifact is promoted dev → staging → prod by configuration only
(Ch10 §5).
