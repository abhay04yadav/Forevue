# Migration Plan — Legacy Prototype → Forevue

**Status:** Phase 0 — plan of record. **No code is migrated in Phase 0.**
**Inputs:** the legacy `AI-ERP-Copilot` prototype, its
[`ARCHITECTURE_AUDIT.md`](../audits/ARCHITECTURE_AUDIT.md), and the frozen
Architecture Bible. **Authority:** `AD-2.1` (target decomposition), Ch12 (Change
Orders, standards), Ch8/Ch4 (security invariants the migration must preserve).

The legacy prototype is **reference only**. Migration is a deliberate,
module-by-module **re-homing and hardening** to Bible standards — never a
bulk copy. Each module migrates as its own **Change Order** (`ENG-6.1`) with
RLS/tenant-isolation tests as release gates.

---

## 1. Principles

1. **Nothing migrates until the foundation and restructure steps are approved.**
2. **One module, one Change Order, one PR** — bounded scope, acceptance
   criteria, isolation tests (`ENG-6.1`, `DEVOPS-4.1`).
3. **Preserve the invariants, improve the implementation.** Where the prototype
   already matches the Bible (RLS, audit, rules engine), port it faithfully;
   where the audit found debt (O(n²) resolver, no token revocation, no AI
   plane), rewrite to standard.
4. **Re-skin, don't reuse, the UI.** Frontend is rebuilt on the **frozen Design
   System / Final Designs**, not lifted from the prototype.
5. **Security first.** No legacy secret is reused (see
   [`SECURITY.md`](../../SECURITY.md) §2); RLS isolation tests gate every backend
   module's merge.

---

## 2. Module categorization

Every legacy module is **Preserve · Reuse · Rewrite · Discard · Future**.

### 2.1 Preserve — port faithfully (gold-standard patterns)

These already embody Bible rulings; port with minimal change into `apps/api`.

| Legacy module | Target | Basis |
|---|---|---|
| RLS primitive (`core/rls.py`, `set_tenant_context`) | `apps/api/app/core/rls.py` | `SEC-4.1`, `AD-6.1` |
| Tenant-scoped session DI (`get_tenant_session`) | `apps/api/app/api/deps.py` | Ch2 §7 |
| Generic audit hooks (`core/audit.py`) | `apps/api/app/core/audit.py` | Ch8 |
| Base model mixins (PK/Tenant/Timestamp/SoftDelete/Provenance) | `apps/api/app/models/base.py` | Ch6 §3.2 |
| Tenant repository (defense-in-depth) | `apps/api/app/repositories/base.py` | `ENG-3.1` |
| JWT + Argon2 security (`core/security.py`) | `apps/api/app/core/security.py` | `TDR-15` |
| Exception → HTTP mapping | `apps/api/app/core/exceptions.py` | Ch7 §6 |
| Rules engine framework (signals/rules/evaluator/scoring/versioned config) | `apps/api/app/services/risk/` | `TDR-9`, Ch3 |
| Medallion ingestion pipeline + connectors + canonical loaders | `apps/api/app/services/ingestion/` | Ch5, Ch6 |
| RBAC scoping (`services/risk/scoping.py`) | `apps/api/app/services/...` | Ch2 §4.4 |
| Alembic RLS-bootstrap migration pattern | `apps/api/migrations/` | Ch6 §10 |

### 2.2 Reuse — adapt with modest change

| Legacy module | Target | Adaptation |
|---|---|---|
| axios client + single-flight refresh | `apps/web/src/api/` | Re-skin; add refresh-token **rotation** (see Rewrite). |
| TanStack Query setup | `apps/web/src/` | `TDR-14`; keep. |
| `decodeAccessToken` UI role-gating | `apps/web/src/auth/` | UI gating only; server stays the authority. |
| Design tokens concept | `packages/design-system/` | Replace prototype tokens with the **frozen** DS tokens. |

### 2.3 Rewrite — re-implement to Bible standard

| Concern | Why rewrite | Basis |
|---|---|---|
| Fuzzy identity resolver | Prototype loads all students per row (O(n²)); needs pg_trgm/blocking. | Ch12 §3 (bounded queries) |
| Refresh-token revocation | Prototype has no server-side revocation; add Redis denylist + rotation. | `TDR-5`, `TDR-15` |
| `request_id` propagation | Defined but never set in the prototype; add ASGI middleware. | Ch11 |
| User / faculty-scope management | Missing entirely (only admin self-register exists). | Ch4 |
| Frontend screens | Rebuilt on frozen App Shell / Dashboard Framework / role dashboards. | RSDDs, Design System |
| CORS / rate limiting / auth hardening | Tighten wildcards; add per-tenant rate limits. | Ch7 §10, Ch8 |

### 2.4 Discard — never enters Forevue

| Item | Reason |
|---|---|
| `backend/.env` (live secrets) | Compromised; rotate, never copy (`SECURITY.md` §2). |
| `.venv/`, `__pycache__/`, `*_cache/`, `*.egg-info/` | Build/tool artifacts (`.gitignore`). |
| `Backend code repository shared/` | Misnamed stale design HTML/screenshots; superseded by the frozen DS. |
| Prototype ad-hoc design HTML/CSS | Superseded by the frozen Design System. |
| Vite/React boilerplate assets | Default scaffolding, not product code. |
| Prototype git history (squashed Phase 3 commit) | Known `DEVOPS-4.1` gap; new repo starts clean. |

### 2.5 Future — post-v1, behind existing seams

| Capability | Seam / interface | Basis |
|---|---|---|
| ML risk evaluator | Drop-in behind `RiskEvaluator` | `TDR-9` revisit trigger |
| **AI plane** (semantic layer, AI Gateway, NL query) | New `services/ai/` + serving layer | Ch3 — *absent from the prototype entirely* |
| pgvector RAG / Accreditation Assistant | pgvector in primary Postgres | `TDR-6`, Ch3 §6 |
| Live ERP/SIS connectors | `Connector` ABC | `TDR-12`, Ch5 |
| Notification delivery (email/SMS/WhatsApp) | Behind the alert abstraction | Ch3 |
| Service extraction (ingestion, AI orchestration) | `services/` | `AD-2.1` |
| Analytical/warehouse tier | Behind serving layer | `AD-5.1` |
| `Hostel` / `Placement` / `ResearchPublication` tables | Forward-compat stubs | Ch6 §6 |

---

## 3. Phased sequence (each phase = its own approval + Change Orders)

```
Phase 0  Foundation (THIS PHASE)
         Repo docs, conventions, .gitignore, .env.example. No code.

Phase 1  Repository skeleton & frozen-asset import
         Restructure steps B–E (REPOSITORY_RESTRUCTURE_PLAN.md): import frozen
         docs + design; stand up apps/packages/infra READMEs. Still no app code.

Phase 2  Backend foundation (Preserve set)
         Port core/ (rls, security, audit, exceptions, db, logging), base
         mixins, tenant repository, auth, Alembic RLS bootstrap.
         GATE: RLS isolation + tenant-coverage tests pass (release-blocking).

Phase 3  Canonical data + ingestion (Preserve + Rewrite resolver)
         Medallion pipeline, connectors, canonical models, entity resolution
         (rewritten to bounded-query). GATE: idempotency + quarantine tests.

Phase 4  Student Success Engine (Preserve)
         Signals/rules/evaluator/scoring/versioned config, interventions,
         alerts, DPDP minor gates. GATE: explainability + determinism tests.

Phase 5  Frontend (Reuse client + Rewrite screens)
         App Shell, Dashboard Framework, role dashboards on the frozen DS;
         contract-first generated client. GATE: tsc --noEmit + Playwright.

Phase 6  Hardening & gaps
         Token rotation/revocation, request_id, user/scope management, rate
         limiting; flip mypy to blocking when backlog clears (DEVOPS-3.1).

Phase 7+ AI plane & future capabilities (§2.5)
         Semantic layer, AI Gateway, NL query, RAG; then service extraction
         when load justifies it (AD-2.1).
```

---

## 4. Per-module migration checklist (applied every time)

- [ ] Change Order written: why, bounded scope, acceptance criteria, ⚠️ gates.
- [ ] Ported into the correct `apps/` / `packages/` location and layering.
- [ ] Full type hints; passes `ruff` (hard) and `mypy` (no new errors, `ENG-4.1`).
- [ ] New tenant tables: RLS enabled **and** repository tenant filter.
- [ ] **RLS isolation + tenant-coverage tests pass** (release-blocking).
- [ ] Idempotency / explainability / bounded-query assertions where applicable.
- [ ] Docstrings cite the governing spec section (`ENG-10.1`).
- [ ] `CHANGELOG.md` entry for any spec-silent decision or named bug fix.
- [ ] No secret introduced; no dependency added without explicit confirmation.
- [ ] One logical change, squash-merged with a Conventional-Commit title.

---

## 5. Risks carried from the audit (must be closed during migration)

| Risk (from `ARCHITECTURE_AUDIT.md`) | Closed in |
|---|---|
| Exposed secrets in `.env` | Phase 0/2 — rotate + secret store. |
| No refresh-token revocation | Phase 6. |
| O(n²) fuzzy resolver | Phase 3. |
| In-process pipeline durability | Kept v1 (`TDR-17`); extracted at `AD-2.1` trigger (Phase 7+). |
| Missing user/scope management | Phase 6. |
| `request_id` never set | Phase 6. |
| No AI plane at all | Phase 7+. |

---

## 6. What this plan deliberately does **not** do

- Migrate any code during Phase 0.
- Copy the legacy `.env`, history, or discarded folders.
- Lift the prototype UI instead of rebuilding on the frozen Design System.
- Re-decide any frozen architectural ruling — the migration conforms to the
  Bible, it does not amend it.
