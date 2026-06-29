# Repository Structure

**Status:** Phase 0 — canonical target layout for the Forevue monorepo.
**Authority:** Architecture Bible `AD-2.1` (modular monolith with seams),
Ch10 §1 (one GitHub repo), `ENG-3.1` (strict layering).

This document defines the canonical directory tree, the purpose of each
directory, and its ownership rule. It is the contract that
[`REPOSITORY_RESTRUCTURE_PLAN.md`](REPOSITORY_RESTRUCTURE_PLAN.md) moves existing
assets *into*.

> **Phase 0 reality:** only foundation files exist today (the four root docs,
> `.gitignore`, `.env.example`, `CODEOWNERS`, and `docs/engineering/`). The tree
> below is the **target**; directories are created as the work that fills them
> lands, never as empty scaffolding ahead of need.

---

## 1. Why a monorepo

The Bible fixes a **single deployable modular monolith** for v1 (`AD-2.1`) and a
**single GitHub repo** (Ch10 §1). A monorepo keeps the backend, the frontend,
the shared contract (generated API client, `ADR-11`), the design system, and the
infrastructure-as-code in one place with one source of truth, one CI surface,
and atomic cross-cutting changes — while `services/` pre-draws the seam along
which ingestion and AI orchestration will later be extracted (`AD-2.1` trigger),
so that extraction is a move, not a rewrite.

---

## 2. Canonical tree

```
forevue/
├── README.md                       # product + repo entry point                (root)
├── CONTRIBUTING.md                 # binding contribution workflow             (root)
├── SECURITY.md                     # security policy & posture                 (root)
├── CODEOWNERS                      # area → required reviewers                  (root)
├── CHANGELOG.md                    # curated, reasoned decision record (ENG-10.1)
├── .gitignore
├── .env.example
├── .editorconfig                   # (future) cross-editor whitespace baseline
├── renovate.json                   # (future) dependency automation config
│
├── apps/                           # DEPLOYABLE applications
│   ├── api/                        # FastAPI modular monolith (the backend)
│   │   ├── app/
│   │   │   ├── api/                #   routes (api layer)
│   │   │   ├── core/               #   config, db, rls, security, audit, logging
│   │   │   ├── models/             #   SQLAlchemy ORM (typed Mapped[...])
│   │   │   ├── repositories/       #   tenant-scoped data access
│   │   │   ├── schemas/            #   Pydantic DTOs (request/response only)
│   │   │   └── services/           #   bounded-context business logic
│   │   │       ├── ingestion/      #     integration plane (medallion pipeline)
│   │   │       ├── risk/           #     Student Success Engine (rules)
│   │   │       └── ai/             #     (future) AI orchestration / gateway
│   │   ├── migrations/             #   Alembic (RLS bootstrap + schema)
│   │   ├── tests/                  #   pytest + testcontainers (unit/integration)
│   │   └── pyproject.toml
│   └── web/                        # React + Vite experience plane
│       ├── src/
│       │   ├── api/                #   client + generated types usage
│       │   ├── auth/               #   token storage, context, route guards
│       │   ├── design/             #   app-level styling built on the DS
│       │   ├── layout/             #   app shell / dashboard framework
│       │   └── pages/              #   role dashboards / workspaces (per RSDDs)
│       ├── public/
│       └── package.json
│
├── packages/                       # SHARED, versioned libraries
│   ├── api-client/                 # TS types/client generated from OpenAPI (ADR-11)
│   ├── design-system/              # React components implemented FROM design/
│   └── config/                     # shared tsconfig / oxlint / ruff base configs
│
├── services/                       # RESERVED — future extracted services (AD-2.1)
│   └── README.md                   #   explains the seam; empty until the trigger
│
├── infra/                          # INFRASTRUCTURE as code
│   ├── docker/                     #   Dockerfile.api, Dockerfile.web (future)
│   ├── compose/                    #   docker-compose.yml: postgres+redis+app (future)
│   └── deploy/                     #   managed-PaaS manifests / IaC (DEVOPS-6.1)
│
├── docs/                           # DOCUMENTATION (five-layer hierarchy, ENG-10.1)
│   ├── architecture-bible/         #   Ch01–Ch15 (FROZEN)
│   ├── rsdd/                       #   six Role Solution Design Documents (FROZEN)
│   ├── product/                    #   Product Bible, Role Definition & Feature Freeze
│   ├── engineering/                #   THIS file + the other engineering docs
│   │   ├── REPOSITORY_STRUCTURE.md
│   │   ├── REPOSITORY_RESTRUCTURE_PLAN.md
│   │   ├── ENGINEERING_FOUNDATION_PLAN.md
│   │   ├── DEVELOPMENT_SETUP.md
│   │   ├── ARCHITECTURE_OVERVIEW.md
│   │   └── MIGRATION_PLAN.md
│   ├── adr/                        #   technology ADR catalog mirror (Ch13)
│   ├── audits/                     #   legacy ARCHITECTURE_AUDIT.md
│   └── legacy/                     #   legacy specs / change orders (reference only)
│
├── design/                         # DESIGN source artifacts (FROZEN)
│   ├── brand/                      #   logos, lockups, brand guidelines/reference
│   ├── design-system/              #   tokens, component specs, guidelines, templates
│   └── final-designs/              #   App Shell, Dashboard Framework, AI Workspace,
│                                   #   Artifact Workspace, Student Dashboard (.dc.html)
│
├── scripts/                        # dev/ops scripts: seed data, codegen, bootstrap
├── tests/                          # CROSS-CUTTING e2e / contract tests (Playwright)
└── .github/
    ├── workflows/                  # backend-ci.yml, frontend-ci.yml, codeql.yml (future)
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── dependabot.yml              # security updates (Renovate handles version bumps)
```

---

## 3. Directory responsibilities & ownership

| Path | Responsibility | Owner (CODEOWNERS) |
|---|---|---|
| `apps/api/` | The FastAPI modular monolith. Strict `api → service → repository → model` layering; bounded contexts under `services/`. | `@forevue/backend` |
| `apps/api/app/core/` | Security-critical cross-cutting (RLS, auth, audit). | `@forevue/backend` + `@forevue/security` |
| `apps/api/migrations/` | Alembic; every tenant table ships its RLS policy block. | `@forevue/backend` + `@forevue/data` |
| `apps/web/` | The React experience plane; one API-first client of the backend. | `@forevue/frontend` |
| `packages/api-client/` | **Generated** TS contract — not hand-edited; regenerated from OpenAPI. | `@forevue/backend` + `@forevue/frontend` |
| `packages/design-system/` | React components implementing the frozen design system. | `@forevue/design` + `@forevue/frontend` |
| `packages/config/` | Shared tool configs (tsconfig, oxlint, ruff base). | `@forevue/platform` |
| `services/` | Reserved for future extracted services; **no code at v1**. | `@forevue/platform` + `@forevue/architecture` |
| `infra/` | Containerization & deployment IaC. | `@forevue/platform` + `@forevue/security` |
| `docs/architecture-bible/`, `docs/rsdd/` | **Frozen**; changes need ARB sign-off. | `@forevue/architecture` + `@forevue/arb` |
| `docs/engineering/` | Living engineering docs (this set). | `@forevue/architecture` + `@forevue/platform` |
| `design/` | **Frozen** brand + design source. | `@forevue/design` |
| `scripts/` | Repeatable dev/ops automation. | `@forevue/platform` |
| `tests/` | Cross-cutting end-to-end / contract tests. | `@forevue/backend` + `@forevue/frontend` |

---

## 4. Placement rules

- **Tests:** unit/integration tests live *with their app* (`apps/api/tests`,
  `apps/web` test files). `tests/` at the root is only for cross-cutting e2e and
  contract tests that span apps.
- **Generated code** (the API client) is treated as a build artifact of the
  contract pipeline (`ADR-11`); it is committed for convenience but never
  hand-edited — change the Pydantic schema and regenerate.
- **Frozen assets** (`docs/architecture-bible/`, `docs/rsdd/`, `design/`) are
  reference truth. Implementations in `apps/`/`packages/` are built *from* them;
  the frozen sources are not edited to match an implementation shortcut.
- **No empty scaffolding.** A directory is created when the work that belongs in
  it lands. `services/` is the one intentional exception (a `README.md` marks
  the reserved seam).

---

## 5. Relationship to the legacy prototype

The legacy `AI-ERP-Copilot` flat `backend/` + `frontend/` layout is **not**
carried over. Its proven modules are re-homed into this structure per
[`MIGRATION_PLAN.md`](MIGRATION_PLAN.md): the backend monolith into `apps/api/`
(same internal layering, which the prototype already followed well), the
frontend into `apps/web/` rebuilt on the frozen design system, and the design
artifacts into `design/`. No legacy code is migrated during Phase 0.
