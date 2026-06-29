# Repository Restructure Plan

**Status:** Phase 0 — plan of record. **No assets are moved until each step is
explicitly approved.** This document defines *where every existing asset goes*
in the new Forevue repository and the safe order to move them.

**Authority:** [`REPOSITORY_STRUCTURE.md`](REPOSITORY_STRUCTURE.md) (target
layout), Architecture Bible `ENG-10.1` (doc hierarchy), `AD-2.1` (monolith with
seams), the rule that the legacy prototype is **reference only**.

---

## 1. Starting point

The current workspace mixes three different things that must be separated:

1. **Frozen product/design documents** — the Architecture Bible, the six RSDDs,
   the Design System, the Final Designs, and brand assets. *These belong in the
   new repo.*
2. **The legacy prototype** (`AI-ERP-Copilot/`) — working FastAPI + React code.
   *This does NOT enter the new repo as code; it is legacy reference only.*
3. **The legacy audit & specs** — `ARCHITECTURE_AUDIT.md`, implementation specs,
   change orders, the prototype CHANGELOG. *These enter the new repo as
   reference documentation.*

> Per the Phase 0 mandate, this plan **does not execute** any of the moves
> below. It is the approved map for a later, separately-approved restructure
> step. Phase 0 itself only creates the foundation files (the four root docs,
> the six engineering docs, `.gitignore`, `.env.example`, `CODEOWNERS`).

---

## 2. Current → target mapping

### 2.1 Documentation (frozen — verbatim, no edits)

| Current location | Target | Notes |
|---|---|---|
| `Documentation/🚀 Bible/Architecture_Bible_Ch01..Ch15_*.md` | `docs/architecture-bible/` | Rename to ASCII-safe paths; keep chapter numbering. |
| `Documentation/🎓 Director AI Assistant/Director_AI_Complete_Design_v1.0.md` | `docs/rsdd/director.md` | RSDD. |
| `Documentation/🎓 Academic Head/AcademicHead_AI_Complete_Design_v1.0.md` | `docs/rsdd/academic-head.md` | RSDD. |
| `Documentation/🏛 HOD AI Assistant/HOD_AI_Complete_Design_v1.0.md` | `docs/rsdd/hod.md` | RSDD. |
| `Documentation/👨‍🏫 Faculty AI Assistant/Faculty_AI_Complete_Design_v1.0.md` | `docs/rsdd/faculty.md` | RSDD. |
| `Documentation/🚀 Placement Cell AI Assistant/Placement_Cell_AI_Complete_Design_v1.0.md` | `docs/rsdd/placement-cell.md` | RSDD. |
| `Documentation/🎓 Student AI Assistant/Student_AI_Complete_Design_v1.0(1).md` | `docs/rsdd/student.md` | RSDD; drop the `(1)` suffix. |

### 2.2 Design (frozen)

| Current location | Target | Notes |
|---|---|---|
| `Forevue Design System Guide/tokens/*.css` | `design/design-system/tokens/` | colors, typography, spacing, fonts. |
| `Forevue Design System Guide/components/**` (`*.jsx`, `*.d.ts`, `*.prompt.md`, `*.card.html`) | `design/design-system/components/` | Component specs/refs (source of truth for `packages/design-system`). |
| `Forevue Design System Guide/guidelines/**`, `templates/**`, `slides/**`, `styles.css`, `readme.md` | `design/design-system/` | Preserve substructure. |
| `Forevue Design System Guide/ui_kits/**` (`AppShell.jsx`, `StudentView.jsx`, `AskView.jsx`, `WatchView.jsx`) | `design/design-system/ui-kits/` | Reference kits. |
| `Forevue Final Designs/*.dc.html` (App Shell, Dashboard Framework, AI Workspace, Artifact Workspace, Student Dashboard, Icon) | `design/final-designs/` | Approved comps. |
| `Forevue Final Designs/_ds/**` | `design/design-system/_ds/` | DS bundle/manifest/adherence config. |
| `Assets/*.svg`, `Assets/README.md` | `design/brand/` | Logos/lockups/icons. |
| `forevue-brand-guidelines (1).html`, `forevue-brand-reference.md` (workspace root) | `design/brand/` | Rename to ASCII-safe; drop `(1)`. |

> **De-duplication note:** brand SVGs appear in `Assets/`, `Forevue Design
> System Guide/assets/`, `Forevue Design System Guide/uploads/`, and `Forevue
> Final Designs/assets/`. Consolidate to a single canonical copy under
> `design/brand/`; the design-system folder references those, not its own
> duplicates.

### 2.3 Legacy audit & specs (reference only)

| Current location | Target | Notes |
|---|---|---|
| `AI-ERP-Copilot/ARCHITECTURE_AUDIT.md` | `docs/audits/ARCHITECTURE_AUDIT.md` | The legacy audit. |
| `AI-ERP-Copilot/Docs/IMPLEMENTATION_SPEC_*.md` | `docs/legacy/specs/` | Reference only. |
| `AI-ERP-Copilot/Docs/CHANGE_ORDER_*.md` | `docs/legacy/change-orders/` | Reference only. |
| `AI-ERP-Copilot/CHANGELOG.md` | `docs/legacy/legacy-CHANGELOG.md` | Reference only — the new repo starts a fresh `CHANGELOG.md`. |

### 2.4 Legacy code (NOT migrated)

| Current location | Target | Notes |
|---|---|---|
| `AI-ERP-Copilot/backend/**`, `AI-ERP-Copilot/frontend/**` | **Not copied** | Legacy reference, kept outside the new repo / archived. Re-implementation is governed by [`MIGRATION_PLAN.md`](MIGRATION_PLAN.md), module by module, via Change Orders. |
| `AI-ERP-Copilot/backend/.env` | **Never copied** | Contains live secrets — see [`SECURITY.md`](../../SECURITY.md) §2 (rotate). |
| `AI-ERP-Copilot/Backend code repository shared/` | **Discarded** | Misnamed folder of stale design HTML/screenshots, superseded by the frozen Design System. |
| `.venv/`, `__pycache__/`, `.mypy_cache/`, `.pytest_cache/`, `.ruff_cache/`, `*.egg-info/` | **Never tracked** | Build/tool artifacts; covered by `.gitignore`. |

---

## 3. Move sequence (each step separately approved)

```
Step A  Initialize the new repo with the Phase 0 foundation (DONE this phase):
        root docs + docs/engineering/ + .gitignore + .env.example + CODEOWNERS.

Step B  Import the FROZEN docs:  docs/architecture-bible/, docs/rsdd/,
        docs/product/.  Verbatim copy; ASCII-safe paths; no content edits.

Step C  Import the FROZEN design:  design/brand/, design/design-system/,
        design/final-designs/.  De-duplicate brand assets to one canonical copy.

Step D  Import legacy reference:  docs/audits/, docs/legacy/.

Step E  Stand up the empty app/package/infra skeleton with READMEs only
        (apps/api, apps/web, packages/*, services/README.md, infra/*) — still
        NO Docker/CI/application code (separate, later phases).

Step F+ Begin module re-homing per MIGRATION_PLAN.md (Change-Order-driven).
```

Steps B–F are **not** part of Phase 0 and each requires its own approval.

---

## 4. Path-hygiene rules applied during moves

- **ASCII-only paths.** Current folders use emoji and non-breaking characters
  (`🚀 Bible`, `👨‍🏫 Faculty AI Assistant`). Targets are lowercase,
  hyphenated, ASCII (`docs/architecture-bible/`, `docs/rsdd/faculty.md`) — emoji
  and spaces in paths break tooling, shells, and some CI runners on Windows.
- **No spaces or parentheses** in committed paths (`Student_..._v1.0(1).md` →
  `docs/rsdd/student.md`).
- **One canonical copy** of every brand asset; references, not duplicates.
- **Frozen content is copied verbatim** — restructuring changes *location*,
  never *content*, of an approved document.

---

## 5. Validation checklist (run after any move step)

- [ ] No `.env` or secret file is tracked (`git ls-files | grep -i env` returns
      only `.env.example`).
- [ ] No `node_modules/`, `.venv/`, or cache directory is tracked.
- [ ] Every frozen document's content hash matches its source (verbatim copy).
- [ ] All committed paths are ASCII, space-free, lowercase-hyphenated.
- [ ] Brand assets exist in exactly one canonical location.
- [ ] `CODEOWNERS` patterns resolve to the moved paths.
- [ ] Internal doc links still resolve after relocation.

---

## 6. What this plan deliberately does **not** do

- It does not move anything during Phase 0 (foundation only).
- It does not migrate legacy application code (see `MIGRATION_PLAN.md`).
- It does not edit frozen documents.
- It does not create Docker, CI, or application scaffolding.
