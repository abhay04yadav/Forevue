# Contributing to Forevue

Thank you for working on Forevue. This guide is **binding**: it encodes the
engineering discipline defined in the Architecture Bible (Ch10 DevOps, Ch12
Engineering Standards) so that the architecture does not erode one commit at a
time. When in doubt, the Bible (`docs/architecture-bible/`) is authoritative.

> **Phase 0 note.** Application code has not been migrated yet. Until it lands,
> contributions are limited to foundation, documentation, and configuration.
> The conventions below apply from the first commit onward.

---

## 1. Golden rules

1. **The frozen documents are frozen.** The Architecture Bible, the RSDDs, the
   Design System, and the Brand Guidelines are approved and must not be
   redesigned. Build on top of them. Changes to frozen docs require Architecture
   Review Board (ARB) sign-off, not just a PR approval.
2. **Reason, record, review** (`ENG-7.1`). Where a spec is silent, reason from
   its existing constraints, record the decision (numbered) in `CHANGELOG.md`,
   and surface it for review — never guess silently.
3. **Name the bug, don't silently patch** (`ENG-8.1`). A bug found outside your
   change's scope is fixed *and* explicitly documented as a separate, named
   finding (root cause + why the fix is correct) — never folded invisibly into
   an unrelated diff.
4. **Zero new dependencies by default** (`ENG-5.1`). Adding any dependency —
   even dev-only — requires explicit, named confirmation in the PR *before* it
   merges. Runtime and dev dependencies stay in separate groups.
5. **Defense in depth on every new tenant table** (`ENG-3.1`): RLS enabled *and*
   an explicit repository-layer tenant filter. Tenant/role context is resolved
   server-side from the verified session, never trusted from client input.

---

## 2. Workflow (GitHub Flow)

`main` is always protected, always green, always deployable. All work happens on
short-lived branches merged via pull request.

```
main ──●────────●───────────●──────►   (protected, squash-merged, deployable)
        \        \           /
         feat/…   fix/…   ──┘  (short-lived; PR + review + green CI)
```

### Branch naming

| Prefix | Use for |
|---|---|
| `feat/` | a new capability |
| `fix/` | a bug fix |
| `refactor/` | behavior-preserving restructuring |
| `docs/` | documentation only |
| `chore/` | tooling, deps, config |
| `test/` | tests only |

Example: `feat/risk-board-filters`, `fix/refresh-token-rotation`.

### Steps

1. Open or pick up an issue; confirm scope.
2. Branch off the latest `main`.
3. Make the change as a **Change Order** (§3) — bounded scope, acceptance
   criteria.
4. Keep commits clean (§4). Run lint/type/test locally (§6) before pushing.
5. Open a PR (§5). Ensure CI is green and a CODEOWNER approves.
6. **Squash-merge** with a Conventional-Commit title → one logical change on
   `main` (`DEVOPS-4.1`).

---

## 3. Change Orders (`ENG-6.1`)

Substantive work is planned as a **Change Order**, not an open-ended ticket. A
Change Order is a numbered list of discrete `CHANGE`s, each with:

```
CHANGE N — <short title>
  Why:          the specific problem this change solves
  Scope:        the exact files/modules this change may touch (and, implicitly,
                those it may NOT touch)
  Confirmation: ⚠️ flagged wherever the change is risk-bearing — a new
                dependency, a destructive migration, or touching files outside
                the named scope — and must stop-and-ask before proceeding
  Acceptance:   the specific, checkable tests/conditions that define "done"
```

The PR description should carry the Change Order (or link to it). A reviewer
must be able to verify "this change did what it said, and only what it said."

---

## 4. Commit conventions (Conventional Commits)

Every commit message follows
[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <subject>

<optional body — the WHY, not just the what>

<optional footer — BREAKING CHANGE:, Refs #123>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`,
`perf`, `revert`.

**Examples:**

```
feat(api): add faculty-scope resolution to risk board reads
fix(web): rotate refresh token on 401 retry to prevent reuse window
docs(engineering): add migration plan for legacy risk engine
```

- **One commit per logical change** (`DEVOPS-4.1`). Because PRs are
  squash-merged, a PR should itself be one logical change; its squash title is
  the Conventional-Commit message that lands on `main`.
- `commitlint` enforces the grammar; `husky` + `lint-staged` run lint/format on
  staged files pre-commit (these are dev-only tools — see
  `ENGINEERING_FOUNDATION_PLAN.md`).

> The curated `CHANGELOG.md` is a **reasoned decision record** organized by
> phase (`ENG-10.1`), not an auto-generated commit dump. Add entries for
> spec-silent decisions and named bug fixes; auto-generated GitHub Release notes
> are supplementary, never a replacement.

---

## 5. Pull requests

A PR must:

- Target `main` from a short-lived branch.
- Link its issue and carry its Change Order (scope + acceptance criteria).
- Pass all **hard CI gates** (§6).
- Receive at least one **CODEOWNER** approval.
- Resolve all review conversations; keep linear history.
- Explicitly check the ⚠️ confirmation box if it adds a dependency, includes a
  destructive migration, or touches files outside the stated scope.

Keep PRs small and single-purpose. A PR that needs the reviewer to hold several
unrelated changes in their head is too big.

---

## 6. Local quality gates (run before pushing)

These mirror the CI gates and are the same tools the Bible fixes — do **not**
introduce alternatives (no Black, no ESLint).

**Backend (`apps/api`):**

```bash
ruff check app tests        # lint (hard gate)
ruff format app tests       # format (Ruff only — TDR-20/ADR-20; no Black)
mypy app                    # type-check (advisory until backlog clears, DEVOPS-3.1)
pytest -q                   # tests on real Postgres via testcontainers
```

**Frontend (`apps/web`):**

```bash
npx oxlint                  # lint (hard gate — DEVOPS-3.2; no ESLint)
npx prettier --check .      # format
npx tsc --noEmit            # contract conformance gate (FE-10.1)
npx playwright test         # e2e (where applicable)
```

> CI workflows are **not built in Phase 0**. Until `backend-ci.yml` /
> `frontend-ci.yml` exist, these gates hold by discipline. See
> `ENGINEERING_FOUNDATION_PLAN.md` for the planned CI.

---

## 7. Code standards (`ENG-3.1`, summarized)

- Full type hints on every function; typed `Mapped[...]` SQLAlchemy models.
- Determinism in adjudication paths — no clock/randomness as an input to a score
  or tier.
- **No magic numbers** — thresholds/weights/cutoffs come from per-tenant config,
  not literals in logic.
- Explainability asserted in code (e.g. no non-low risk tier without findings;
  score equals the clamped sum of finding contributions).
- Idempotent, version-stamped writes; bounded query counts in batch operations
  (no N+1).
- Strict layering: `api → service → repository → model`; one-directional module
  dependencies; Pydantic schemas are DTOs, never the ORM layer.
- Per-item error isolation in batch operations (one row/student failing never
  aborts the batch).

---

## 8. Documentation expectations (`ENG-10.1`)

Respect the five-layer hierarchy — don't collapse layers:

```
Architecture Bible   → durable WHY (principles, rulings)        [frozen]
Phase / impl specs   → WHAT a phase builds
Change Orders        → HOW a specific change is scoped
CHANGELOG.md         → the RECORD of decisions & named bug fixes
Code docstrings      → POINTER from a function to its governing spec section
```

Docstrings cite the spec/section they implement where one exists.

---

## 9. Reporting security issues

Do **not** open a public issue for a vulnerability. Follow [`SECURITY.md`](SECURITY.md).

---

By contributing you agree your work follows these standards and the frozen
architecture. Reviewers will hold changes to them.
