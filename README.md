<div align="center">

# Forevue

**The Enterprise AI Intelligence Layer for Higher Education ERP**

*The ERP remains the System of Record. Forevue is the System of Intelligence.*

</div>

---

> **Repository status: Phase 0 — Foundation.**
> This repository is the **new production repository** for Forevue. It currently
> contains the engineering foundation only (governance docs, conventions, and
> repository configuration). No application code has been migrated yet. The
> previous prototype (`AI-ERP-Copilot`) is **legacy reference only** — see
> [`docs/engineering/MIGRATION_PLAN.md`](docs/engineering/MIGRATION_PLAN.md).

## What Forevue is

Colleges and universities already run an ERP/SIS (ERPNext, Fedena, MasterSoft,
TCS iON, spreadsheets, LMS, biometric, payments…). Those systems are excellent
systems of **record** but poor systems of **intelligence**: the data is
fragmented, the questions leaders actually ask ("which third-year CSE students
are slipping, and why?") cross every silo, and the answers require a data team.

Forevue sits **on top of** the existing ERP as a governed intelligence layer:

- **Unified data layer** — a canonical, tenant-isolated source of truth built
  from messy multi-source exports via a medallion (raw → staging → canonical)
  ingestion pipeline with entity resolution.
- **Deterministic Student Success Engine** — explainable, auditable risk tiers
  and findings (never an LLM verdict) that watch every student continuously.
- **Governed AI workspace** — natural-language questions answered against a
  governed semantic layer, grounded in real numbers, with citations — the LLM
  narrates, it never invents figures or writes SQL.
- **Role copilots** — purpose-built experiences for Director, Academic Head,
  HOD, Faculty, Placement Cell, and Student (see the RSDDs).

The product's non-negotiables — tenant isolation, explainability, no
NL-to-raw-SQL, no silent data loss, human-in-the-loop adjudication — are
defined in the **Architecture Bible** and treated as binding here.

## Architecture at a glance

Forevue is a **modular monolith with clean seams** (Bible `AD-2.1`): one
deployable backend application internally partitioned along bounded contexts,
with the heavy seams (ingestion workers, AI orchestration) pre-drawn for future
extraction under load. Pooled multi-tenancy with **defense-in-depth isolation**
(Postgres Row-Level Security + application scoping, `AD-6.1`).

| Layer | Technology | Decision |
|---|---|---|
| Backend | Python 3.12 · FastAPI | `TDR-1` |
| ORM / migrations | SQLAlchemy 2.x (typed) · Alembic | `TDR-2` |
| System of record | PostgreSQL (+ pgvector) | `TDR-3`, `TDR-6` |
| Isolation floor | Postgres Row-Level Security | `TDR-4` |
| Cache / rate limit / token denylist | Redis | `TDR-5` |
| AI access | Vendor-agnostic AI Gateway · governed tool-calling | `TDR-7`, `TDR-8` |
| Adjudication | Deterministic rules (ML-ready interface) | `TDR-9` |
| API | REST + OpenAPI · contract-first → generated TS client | `TDR-10`, `TDR-11` |
| Frontend | React · TypeScript · Vite · React Router · TanStack Query | `TDR-13`, `TDR-14` |
| Auth | JWT (stateless) + Argon2 | `TDR-15` |
| Deploy | Managed container/PaaS (not k8s at v1) | `TDR-16` |

A navigable summary lives in
[`docs/engineering/ARCHITECTURE_OVERVIEW.md`](docs/engineering/ARCHITECTURE_OVERVIEW.md);
the authoritative source is the Architecture Bible under `docs/architecture-bible/`.

## Repository layout

```
forevue/
├── apps/        # deployable apps: api (FastAPI monolith), web (React)
├── packages/    # shared: api-client (generated), design-system, config
├── services/    # RESERVED — future extracted services (AD-2.1)
├── infra/       # docker, compose, deploy manifests
├── docs/        # architecture bible, RSDDs, product, engineering, audits
├── design/      # brand, design-system source, final designs
├── scripts/     # seed data, codegen, dev/ops scripts
├── tests/       # cross-cutting e2e / contract tests
└── .github/     # workflows, templates, CODEOWNERS
```

Full detail and ownership rules:
[`docs/engineering/REPOSITORY_STRUCTURE.md`](docs/engineering/REPOSITORY_STRUCTURE.md).

## Getting started

Full instructions (prerequisites, install, env, running, testing) are in
[`docs/engineering/DEVELOPMENT_SETUP.md`](docs/engineering/DEVELOPMENT_SETUP.md).
At a high level, once application code lands:

```bash
git clone https://github.com/abhay04yadav/Forevue.git
cd Forevue
cp .env.example .env        # fill in local values; never commit .env
# install workspace deps, run the api + web apps (see DEVELOPMENT_SETUP.md)
```

> During Phase 0 there is no runnable application yet — this section documents
> the intended workflow that the foundation is being prepared for.

## Documentation index

| Document | Purpose |
|---|---|
| [`ARCHITECTURE_OVERVIEW.md`](docs/engineering/ARCHITECTURE_OVERVIEW.md) | Distilled, navigable architecture summary. |
| [`REPOSITORY_STRUCTURE.md`](docs/engineering/REPOSITORY_STRUCTURE.md) | Canonical directory tree + ownership. |
| [`REPOSITORY_RESTRUCTURE_PLAN.md`](docs/engineering/REPOSITORY_RESTRUCTURE_PLAN.md) | How existing assets map into this repo. |
| [`ENGINEERING_FOUNDATION_PLAN.md`](docs/engineering/ENGINEERING_FOUNDATION_PLAN.md) | Branching, commits, PRs, CI gates, tooling. |
| [`DEVELOPMENT_SETUP.md`](docs/engineering/DEVELOPMENT_SETUP.md) | Local environment setup. |
| [`MIGRATION_PLAN.md`](docs/engineering/MIGRATION_PLAN.md) | Phased plan from the legacy prototype. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute. |
| [`SECURITY.md`](SECURITY.md) | Security policy & posture. |

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first. In short: GitHub Flow with
short-lived branches, **Conventional Commits**, scoped **Change Orders**, PR
review by CODEOWNERS, and green CI before squash-merge to `main`.

## Security

Never commit secrets. Report vulnerabilities per [`SECURITY.md`](SECURITY.md).
The frozen architecture is the security authority — RLS isolation, server-side
tenant/role resolution, append-only audit, and no NL-to-raw-SQL are invariants,
not preferences.

## License & status

Proprietary — © Forevue Technologies. All rights reserved. Internal repository;
not for public distribution.
=======
# Forevue

