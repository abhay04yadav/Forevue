# Development Setup

How to set up a local Forevue development environment. This document is written
for the **target** monorepo so it's ready the moment application code lands.

> **Phase 0 status:** the repository currently contains foundation files only —
> there is no runnable application yet. Sections marked **(once app code lands)**
> describe the intended workflow the foundation is being prepared for; the
> prerequisites, clone, and environment steps apply today.

---

## 1. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Git** | latest | Version control. |
| **Python** | 3.12.x | Backend (`apps/api`) — `TDR-1`. |
| **Node.js** | 20 LTS or 22 LTS | Frontend (`apps/web`), tooling. |
| **pnpm** | 9.x (preferred) | Workspace package manager. |
| **uv** *(or pip + venv)* | latest | Python dependency management. |
| **Docker + Docker Compose** | latest | Local Postgres + Redis (`TDR-3`, `TDR-5`). |
| **PostgreSQL client** *(optional)* | 16.x | `psql` for inspection. |

Recommended: a `.editorconfig`-aware editor with Ruff, Oxlint, and Prettier
extensions. Do **not** install Black or ESLint extensions — the project uses
Ruff and Oxlint (see [`ENGINEERING_FOUNDATION_PLAN.md`](ENGINEERING_FOUNDATION_PLAN.md) §8).

---

## 2. Clone

```bash
git clone https://github.com/abhay04yadav/Forevue.git
cd Forevue
```

---

## 3. Environment variables

```bash
# macOS / Linux
cp .env.example .env
# Windows PowerShell
Copy-Item .env.example .env
```

Then edit `.env` and fill in local values. Key points:

- **`JWT_SECRET_KEY`** — generate a strong random value (never reuse the legacy
  prototype's value, which is considered compromised — see
  [`SECURITY.md`](../../SECURITY.md) §2):
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(48))"
  ```
- **`DATABASE_URL`** uses the non-superuser `app_user` role (RLS applies).
  **`MIGRATIONS_DATABASE_URL`** uses a privileged role for DDL; it may equal
  `DATABASE_URL` locally against a superuser container.
- `.env` is git-ignored — **never commit it.**

---

## 4. Local infrastructure (once app code lands)

Bring up Postgres and Redis via Compose:

```bash
docker compose -f infra/compose/docker-compose.yml up -d
```

This provides dev/prod parity (`Ch10 §5`): the same Postgres/Redis services the
deployed platform uses, configured by environment.

---

## 5. Backend — `apps/api` (once app code lands)

```bash
cd apps/api

# create + activate a virtualenv, then install (runtime + dev groups)
uv venv && source .venv/bin/activate      # or: python -m venv .venv && activate
uv pip install -e ".[dev,test]"            # or: pip install -e ".[dev,test]"

# run database migrations (Alembic; bootstraps app_user role + RLS policies)
alembic upgrade head

# run the API (FastAPI)
uvicorn app.main:app --reload --port 8000
```

API docs (OpenAPI) will be at `http://localhost:8000/docs`.

### Backend quality gates (run before pushing)

```bash
ruff check app tests        # lint (hard gate)
ruff format app tests       # format (Ruff only — no Black)
mypy app                    # type-check (advisory per DEVOPS-3.1)
pytest -q                   # tests on real Postgres via testcontainers
```

> `pytest` requires Docker to be running (testcontainers spins up an ephemeral
> Postgres so RLS/isolation tests run against a real database — `TDR-21`).

---

## 6. Frontend — `apps/web` (once app code lands)

From the repo root (workspace-aware):

```bash
pnpm install                 # installs the whole workspace (web + packages/*)

# generate the typed API client from the backend OpenAPI spec (ADR-11)
pnpm --filter @forevue/api-client generate

# run the web app
pnpm --filter web dev        # Vite dev server on http://localhost:5173
```

Set `VITE_API_BASE_URL=http://localhost:8000` in `apps/web/.env.local`.

### Frontend quality gates (run before pushing)

```bash
pnpm --filter web exec oxlint        # lint (hard gate — no ESLint)
pnpm --filter web exec prettier --check .
pnpm --filter web exec tsc --noEmit  # contract conformance gate (FE-10.1)
pnpm --filter web exec playwright test
```

---

## 7. Contract-first workflow (`ADR-11`)

The frontend's API types are **generated**, never hand-written:

1. Change a Pydantic schema in `apps/api`.
2. The OpenAPI spec updates automatically (FastAPI).
3. Regenerate the client: `pnpm --filter @forevue/api-client generate`.
4. `tsc --noEmit` fails loudly if the frontend now mismatches the contract —
   that compile error *is* the drift protection.

> **Known install note (`DEVOPS-3.3`):** a clean install may surface a peer
> dependency conflict between `openapi-typescript` and TypeScript. It is resolved
> by a committed, code-commented npm override forcing the working version — do
> **not** downgrade TypeScript or use ad-hoc `--legacy-peer-deps`.

---

## 8. Pre-commit hooks

`husky` + `lint-staged` run lint/format on staged files automatically on commit,
and `commitlint` validates the message grammar. They install with the workspace
(`pnpm install`). To run manually:

```bash
pnpm exec lint-staged
```

---

## 9. Common tasks

| Task | Command |
|---|---|
| New backend migration | `cd apps/api && alembic revision -m "..."` (additive-by-default; include RLS policy for new tenant tables) |
| Seed demo data | `cd apps/api && python -m scripts.seed_demo` |
| Regenerate API client | `pnpm --filter @forevue/api-client generate` |
| Run all backend gates | `cd apps/api && ruff check app tests && ruff format --check app tests && mypy app && pytest -q` |

---

## 10. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `pytest` fails to start a container | Docker not running, or the daemon is unreachable. Start Docker Desktop. |
| `npm ci`/`pnpm install` peer-dependency error on TypeScript | The `DEVOPS-3.3` conflict — ensure the committed npm override is present; do not downgrade TypeScript. |
| Backend returns zero rows unexpectedly | RLS tenant context not set — confirm the request authenticated and the tenant-scoped session is in use (this "fails to zero rows" is by design). |
| `tsc --noEmit` errors after a backend change | Regenerate the API client (§7); the contract drifted. |
| Emoji/space in a path breaks a script | Use the ASCII-safe target paths from `REPOSITORY_RESTRUCTURE_PLAN.md`. |

---

## 11. What is intentionally absent in Phase 0

No application code, Docker files, or CI workflows exist yet — they arrive in
later, separately-approved phases. This document is the contract those phases
build toward, so setup is predictable from day one.
