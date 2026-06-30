# Forevue Web (`apps/web`)

**Status:** Frontend foundation — React 19 + Vite + Tailwind + shadcn/ui.

Experience plane for Forevue. API types will come from `@forevue/api-client` (generated from OpenAPI) in a later phase.

```bash
# from repo root
pnpm install
pnpm --filter web dev
pnpm --filter web build
```

**Tooling:** Oxlint + ESLint (`pnpm --filter web lint`), Prettier (`pnpm --filter web format:check`).

**Release gate (future):** `tsc --noEmit` + Playwright.

Set `VITE_API_BASE_URL=http://localhost:8000` in `.env.local` when API wiring lands.
