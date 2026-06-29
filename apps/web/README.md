# Forevue Web (`apps/web`)

**Status:** Phase 5 — App Shell, role dashboards, frozen Design System.

React + Vite experience plane. API types come from `@forevue/api-client` (generated from OpenAPI).

```bash
# from repo root
pnpm install
pnpm --filter @forevue/api-client generate
pnpm --filter web dev
```

**Release gate:** `tsc --noEmit` + Playwright (`pnpm --filter web test:e2e`).

Set `VITE_API_BASE_URL=http://localhost:8000` in `.env.local`.
