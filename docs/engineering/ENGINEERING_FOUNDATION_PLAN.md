# Engineering Foundation Plan

**Status:** Phase 0 — the binding engineering standards for Forevue.
**Authority:** Architecture Bible Ch10 (DevOps), Ch12 (Engineering Standards),
Ch13 (Technology Decision Records). This document **operationalizes** those
frozen rulings; it does not re-decide them. Where a generic best-practice tool
was considered and the Bible already ruled differently, the Bible wins and the
deviation is noted.

> **Phase 0 scope:** This is the plan. CI workflows, Docker, and tooling configs
> are **described here but not created in Phase 0** (except `.gitignore` and
> `.env.example`, which are repository-foundation files). They are built in
> later, separately-approved phases.

---

## 1. Branching strategy — GitHub Flow (trunk-based)

`main` is protected, always green, always deployable. Work happens on
short-lived branches merged by PR.

- **Branches:** `feat/*`, `fix/*`, `refactor/*`, `docs/*`, `chore/*`, `test/*`.
- **Merge method: squash-merge**, with a Conventional-Commit title. This is how
  **one-commit-per-change** (`DEVOPS-4.1`) is honored on `main`: one PR = one
  logical change = one commit on the trunk.
- **Why not GitFlow:** the platform promotes a single artifact through
  environments by configuration (Ch10 §5) and ships additive, low-risk
  migrations continuously (Ch10 §9). GitFlow's long-lived `develop`/`release`
  branches add ceremony with no payoff for that model.

### Branch protection (repo-admin action — not a file)

Configure on `main`:

- [ ] Require a pull request before merging.
- [ ] Require **1+ approving review from CODEOWNERS**.
- [ ] Require status checks to pass: `backend-ci`, `frontend-ci` (once they exist).
- [ ] Require branches to be up to date before merging.
- [ ] Require linear history; require conversation resolution.
- [ ] Block force-pushes and deletions of `main`.

---

## 2. Commit conventions — Conventional Commits

Format: `type(scope): subject`. Types: `feat`, `fix`, `docs`, `refactor`,
`test`, `chore`, `build`, `ci`, `perf`, `revert`.

- Enforced by **commitlint** (dev-only; configured in a later phase).
- The squash-merge title is the message that lands on `main`, so PR titles are
  held to the same grammar.
- **`CHANGELOG.md` stays curated and reasoned** (`ENG-10.1`) — organized by
  phase around (a) decisions made where a spec was silent and (b) named bug
  fixes. It is **not** auto-generated from commits. Auto-generated GitHub Release
  notes are supplementary.

---

## 3. Pull-request conventions

- One logical change per PR; small and single-purpose.
- PR body carries the **Change Order** (`ENG-6.1`): why, bounded scope,
  acceptance criteria, and a ⚠️ confirmation checkbox for risk-bearing items
  (new dependency, destructive migration, out-of-scope files).
- Links its issue; all CI gates green; CODEOWNER approval; conversations resolved.
- A `PULL_REQUEST_TEMPLATE.md` encoding the above is added when `.github/` is
  populated (later phase).

---

## 4. Versioning & release strategy

- **API versioning:** URI-based `/v1` (Bible Ch7) — the contract surface clients
  depend on.
- **Packages (`packages/*`):** Semantic Versioning.
- **Deployed application:** continuously deployed; releases are git tags, not a
  marketed SemVer. The **same built artifact** is promoted dev → staging → prod
  by environment configuration only (Ch10 §5) — no per-environment builds.
- **Migrations ship with the code that needs them** as a release-blocking step
  (Ch10 §9); additive-by-default makes automated promotion low-risk, with a
  manual gate for the rare destructive migration.

---

## 5. Issue labels

| Group | Labels |
|---|---|
| `type:` | `feature`, `bug`, `debt`, `docs`, `security`, `chore` |
| `area:` | `api`, `web`, `data`, `ai`, `infra`, `design`, `docs` |
| `priority:` | `p0` (drop-everything), `p1`, `p2`, `p3` |
| `status:` | `triage`, `ready`, `in-progress`, `blocked`, `in-review` |
| special | `good-first-issue`, `needs-arb` (touches a frozen doc), `breaking` |

---

## 6. Milestones & GitHub Projects

- **Milestones** track the Architecture Bible **Ch15 Implementation Roadmap**
  phases (and the "close the named gaps" milestone from `DEVOPS-3.1/3.2/3.3`).
- **GitHub Projects** board columns: `Triage → Ready → In progress → In review →
  Done`. Every issue carries `type:`, `area:`, and `priority:` labels for board
  filtering. (Project + label creation is a repo-admin action, not a file.)

---

## 7. CI/CD gates (planned — built in a later phase)

Mirror the Bible's `DEVOPS-3.1/3.2` rulings exactly:

**`backend-ci.yml`** (triggers on `apps/api/**`):

| Step | Gate | Basis |
|---|---|---|
| `ruff check` | **hard** | `TDR-20`, `ENG-4.1` |
| `ruff format --check` | **hard** | Ruff-only formatting (`ADR-20`) |
| `mypy` | **advisory** until backlog = 0, then hard | `DEVOPS-3.1` |
| `pytest` (testcontainers) | **hard** | `TDR-21`; RLS/isolation tests are release-blocking |

**`frontend-ci.yml`** (triggers on `apps/web/**`) — closes the `DEVOPS-3.2` gap:

| Step | Gate | Basis |
|---|---|---|
| `oxlint` | **hard** | `DEVOPS-3.2` (oxlint, **not** ESLint) |
| `prettier --check` | **hard** | formatting |
| `tsc --noEmit` against generated API types | **hard** | `FE-10.1` (contract conformance) |
| Playwright suite | **hard** | `DEVOPS-3.2` |

**Security/quality (planned):** CodeQL, `pip-audit` / `npm audit`, secret
scanning + push protection.

---

## 8. Engineering tooling — decisions & rationale

| Tool | Status | Rationale / Bible alignment |
|---|---|---|
| **Ruff** (lint **and** `ruff format`) | Adopt | `TDR-20`/`ENG-4.1`. Consolidates flake8+isort+black; selects `E,F,I,B,UP`; `B008` ignored (FastAPI DI pattern). |
| **Black** | **Not adopted** | `ADR-20` explicitly rejects black/isort/flake8 in favor of Ruff; adding it also violates `ENG-5.1`. `ruff format` covers formatting. |
| **Mypy** | Adopt | `TDR-20`; `disallow_untyped_defs`, `check_untyped_defs`; advisory→blocking per `DEVOPS-3.1`. |
| **Pytest + testcontainers** | Adopt | `TDR-21`; real ephemeral Postgres so RLS/isolation tests are meaningful. |
| **TypeScript** | Adopt | `TDR-13`; `tsc --noEmit` is a release gate (`FE-10.1`). |
| **Oxlint** | Adopt | The frozen FE lint gate (`DEVOPS-3.2`); already used by the design system's adherence config. |
| **ESLint** | **Not adopted** | Superseded by oxlint per `DEVOPS-3.2`. Avoids two overlapping linters. |
| **Prettier** | Adopt | Formatting only; the Bible names no FE formatter, so this is additive and non-conflicting. |
| **Husky + lint-staged** | Adopt (dev-only) | Pre-commit: run ruff/oxlint/format on staged files — a fast local mirror of CI. New dev deps → confirmed here per `ENG-5.1`. |
| **Commitlint** | Adopt (dev-only) | Enforces Conventional Commits feeding release notes + `DEVOPS-4.1`. New dev dep → confirmed per `ENG-5.1`. |
| **Renovate** | Adopt | Automated dependency updates with monorepo grouping/scheduling; directly mitigates the `DEVOPS-3.3` peer-dependency class of failure. |
| **Dependabot** | Security alerts only | Run alongside Renovate purely for CVE alerting; version bumps are Renovate's job to avoid duplicate PRs. |
| **Conventional Commits** | Adopt | Commit grammar (see §2). |

> **Dependency discipline (`ENG-5.1`):** every dependency above that is *new*
> relative to the prototype (husky, lint-staged, commitlint, renovate config) is
> named and confirmed here. Runtime vs dev groups stay separate; production
> never ships dev tooling.

---

## 9. Workspace & package management

- **One workspace** at the repo root managing `apps/web` and `packages/*` (npm
  or pnpm workspaces; pnpm preferred for stricter, faster, disk-efficient
  installs). `apps/api` uses its own `pyproject.toml` (uv/pip).
- **Lockfiles committed.** The `openapi-typescript` ↔ TypeScript peer-dependency
  conflict (`DEVOPS-3.3`) is resolved with an explicit, code-commented npm
  override forcing the working version — never by downgrading TypeScript and
  never by waiting on upstream.

---

## 10. The five-layer documentation hierarchy (`ENG-10.1`)

```
Architecture Bible   durable WHY — principles & rulings           [frozen]
Phase / impl specs   WHAT a phase builds
Change Orders        HOW a specific change is scoped (ENG-6.1)
CHANGELOG.md         RECORD of decisions & named bug fixes
Code docstrings      POINTER from a function to its governing spec
```

Layers never collapse into each other; docstrings cite the spec section they
implement.

---

## 11. Phase 0 acceptance criteria

- [x] `.gitignore` covers Python/Node/React/Next/Vite/Docker/IDE/OS/logs/caches/
      build/coverage/env/secrets/temp.
- [x] `.env.example` present; no real `.env` or secret committed.
- [x] Root docs: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`.
- [x] Engineering docs under `docs/engineering/`.
- [x] Tooling decisions aligned to the frozen Bible (Ruff-only, Oxlint+Prettier,
      Renovate + Dependabot alerts).
- [ ] *(Later phases)* CI workflows, Docker, app/package skeleton, module
      migration — each separately approved.
