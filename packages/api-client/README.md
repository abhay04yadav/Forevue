# `@forevue/api-client`

TypeScript types generated from the Forevue backend OpenAPI spec (`ADR-11`).

```bash
# from repo root
pnpm --filter @forevue/api-client generate
```

Never hand-edit `src/schema.d.ts` — change Pydantic schemas in `apps/api` and regenerate.

To refresh `openapi.json` from the FastAPI app:

```bash
node packages/api-client/scripts/export-openapi.mjs
```
