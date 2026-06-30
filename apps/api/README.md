# Forevue API (`apps/api`)

**Status:** Phase 7+ — AI plane (semantic layer, gateway with real providers, tool calling, RAG/pgvector, bounded session memory, `/ai/*`).

The FastAPI **modular monolith** (Bible `AD-2.1`). Current surface:

| Area | Status |
|---|---|
| `app/core/` | config, db, security, RLS, audit, logging, exceptions, storage, middleware |
| `app/core/kv.py` | Redis or in-memory ephemeral store (denylist, rate limits, AI cache) |
| `app/core/refresh_tokens.py` | Refresh rotation + reuse detection |
| `app/models/` | tenants, users, audit, ingestion, canonical, identity, conflict, risk |
| `app/repositories/` | tenant, user, risk, faculty_scope |
| `app/services/` | auth, ingestion, risk, user provisioning, **ai** (semantic, gateway, tools, RAG, memory, guardrails) |
| `app/api/routes/` | `/health`, `/auth/*`, `/users/*`, ingestion, students, `/risk/*`, **`/ai/*`** |
| `migrations/` | Phase 0–2 + Phase 7 RAG/memory |

**Release gate:** `pytest` — RLS + ingestion + risk + hardening + **AI plane + AI eval** tests.

**AI provider env (optional):**
- `AI_GATEWAY_PROVIDER=stub` (default, local/tests)
- `AI_GATEWAY_PROVIDER=openai` + `OPENAI_API_KEY`
- `AI_GATEWAY_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`

Run locally: see [`docs/engineering/DEVELOPMENT_SETUP.md`](../../docs/engineering/DEVELOPMENT_SETUP.md).
