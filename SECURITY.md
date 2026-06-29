# Security Policy

Forevue holds sensitive student data for multiple institutions, including
records of minors. Security is a first-class, non-negotiable property of the
architecture — not a feature. This policy summarizes how we handle
vulnerabilities, secrets, and the security posture the platform is built on. The
authoritative sources are Architecture Bible **Chapter 4 (Identity & Access
Management)** and **Chapter 8 (Security Architecture)**.

---

## 1. Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

- Email the security team at **security@forevue.tech** (replace with the real
  alias before launch) with a description, reproduction steps, and impact.
- Alternatively, use **GitHub Private Vulnerability Reporting** (Security tab →
  "Report a vulnerability) once enabled on this repository.
- You will receive an acknowledgement within **2 business days** and a
  remediation timeline after triage.
- Please give us a reasonable window to remediate before any public disclosure.

> **Repo admin action required:** enable GitHub *Private Vulnerability
> Reporting*, *secret scanning*, *push protection*, and *Dependabot security
> alerts* for this repository.

---

## 2. Secrets management

**No secret is ever committed to this repository.**

- Real values live only in a local, git-ignored `.env` (templated by
  [`.env.example`](.env.example)) or, in staging/production, in the platform's
  **secret store**, injected as environment variables at container start
  (Bible Ch10 §5). Secrets are never baked into an image layer and never printed
  in a CI log (CI steps that echo environment state mask secret values).
- `.gitignore` blocks `.env`, `*.env`, keys, and certificates. Secret scanning +
  push protection are the backstop against accidental commits.

### Secrets to rotate (carried over from the legacy prototype)

The legacy `AI-ERP-Copilot` prototype committed real secrets to its `.env`.
Because the JWT secret *is* the entire authentication trust boundary, treat all
of the following as **compromised and rotate them before any reuse** — and
never carry the old values into Forevue:

| Secret | Why it must be rotated |
|---|---|
| `JWT_SECRET_KEY` | Anyone with it can forge tenant-crossing access tokens. |
| `APP_DB_PASSWORD` | Application DB role credential, exposed in plaintext. |
| Postgres user password (in `DATABASE_URL` / `MIGRATIONS_DATABASE_URL`) | Direct database access. |

Rotation is a manual, owner-performed action (new random values per
environment, e.g. `python -c "import secrets; print(secrets.token_urlsafe(48))"`
for the JWT secret), followed by updating the secret store. **Forevue does not
rotate them automatically.**

---

## 3. Security posture (architectural invariants)

These are enforced by the architecture, not by convention, and any change that
weakens them requires ARB + security sign-off:

- **Tenant isolation in depth** (`AD-6.1`, `SEC-4.1`): Postgres Row-Level
  Security is `ENABLE`d + `FORCE`d on every tenant-owned table, evaluated
  against a **non-superuser** application role; the repository layer adds an
  explicit tenant filter on top. A misconfiguration fails toward **zero rows**,
  never toward all rows.
- **Server-side identity** (Ch2 §7): `tenant_id` and `role` are resolved
  server-side from the verified JWT and injected into the DB session — never
  taken from request body, query params, headers, or model output.
- **RBAC with 404-not-403** (Ch2 §4.4): out-of-scope records return *not found*,
  so the platform never reveals the existence of data a caller may not see.
- **Authentication** (`TDR-15`): stateless JWT access/refresh tokens; **Argon2**
  password hashing; short access-token lifetime; refresh-token revocation via a
  Redis denylist (`TDR-5`).
- **No NL-to-raw-SQL** (`TDR-8`): the LLM is an untrusted component; it returns
  governed semantic-layer tool calls that deterministic code validates and
  executes read-only against tenant-scoped views. The model never emits SQL or a
  tenant id.
- **Append-only audit** (Ch8): every security-relevant read/write and every AI
  interaction records actor, tenant, and the governed query that ran.
- **No silent data loss** (Ch1 §4.7): raw layer immutable; canonical deletes are
  soft; quarantined rows are retained.
- **Data residency** (Ch8 §9): Indian-tenant data — including backups and DR —
  stays within the India region (multi-AZ, not multi-region) unless a tenant's
  own residency requirement specifies otherwise.
- **DPDP / minors**: no automated parent-contact for minor or unknown-DOB
  subjects; such actions are human-confirmed and recorded.

---

## 4. Dependency & supply-chain security

- **Renovate** keeps dependencies current; **Dependabot security alerts** flag
  known CVEs. New dependencies require explicit confirmation (`ENG-5.1`).
- Lockfiles are committed; CI runs dependency audits (`pip-audit` / `npm audit`)
  and **CodeQL** static analysis once CI is established (planned — see
  `docs/engineering/ENGINEERING_FOUNDATION_PLAN.md`).
- Runtime and dev dependencies are kept in separate groups so production never
  ships dev tooling's attack surface.

---

## 5. Supported versions

Forevue is a continuously deployed SaaS platform; the supported version is the
currently deployed release on `main`. Security fixes are rolled forward, not
back-ported to historical tags.

---

## 6. Scope during Phase 0

This repository currently contains only foundation, documentation, and
configuration — no running application. The primary Phase 0 security
obligations are: keep secrets out of version control, ship `.env.example` (not
`.env`), and ensure the rotation list in §2 is actioned before any legacy
configuration is reused.
