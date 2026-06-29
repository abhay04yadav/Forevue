# Cross-cutting tests (`tests/`)

**Status:** Skeleton.

End-to-end and contract tests that span `apps/api` and `apps/web` (e.g.
Playwright). Unit and integration tests live **with their app**
(`apps/api/tests`, `apps/web` test files).

RLS isolation and tenant-coverage tests are **release-blocking** (Bible Ch8 §10).
