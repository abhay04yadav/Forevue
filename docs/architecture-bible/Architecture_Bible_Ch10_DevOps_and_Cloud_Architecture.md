# AI ERP Copilot — Architecture Bible

## Chapter 10 — DevOps & Cloud Architecture

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** How the platform is built, tested, deployed, scaled, and recovered — CI/CD pipelines, source-control discipline, environments and configuration, containerization and deployment topology, horizontal scaling, and disaster recovery.
**Depends on:** Chapter 1 (Cloud Native/HA/DR/Twelve-Factor principles, Ch1 §5's avoid-premature-scaling discipline), Chapter 2 (the modular monolith and its extraction seams, AD-2.1), Chapter 6 (the canonical store's backup/DR requirements, the migration discipline of Ch6 §10), Chapter 7 (API-3.1's "introduce heavyweight infrastructure at the extraction trigger, not before" reasoning, which this chapter applies again to Kubernetes), Chapter 8 (secrets management, encryption-at-rest, the data-residency constraint).
**Relationship to the existing build:** This chapter is candid about what currently exists versus what is designed-for-later. A backend CI workflow runs today; a frontend CI workflow does not yet exist; there is a known, root-caused dependency conflict blocking a clean cold install; and there is a known violation of the project's own one-commit-per-change discipline. None of these are smoothed over — each is named, explained, and ruled on as a scheduled item, consistent with this Bible's practice of distinguishing "built" from "designed-for" (Ch6 §3.4, Ch7 §4, Ch9 §3).
**Boundary with Chapter 11 (Observability & Operations):** This chapter owns the *infrastructure* that makes the platform deployable, scalable, and recoverable. Chapter 11 owns what runs *on top of* that infrastructure to understand the platform's behavior in production — metrics, tracing, logging conventions, AI-specific monitoring, and SLOs. Where this chapter mentions a health-check endpoint or structured log output, it is naming the *capability* this chapter provides; Chapter 11 is where that capability is consumed, aggregated, and alerted on.

---

### 0. How this chapter builds on Chapters 1–9

Three commitments become concrete operational machinery here:

1. **Twelve-Factor App / Cloud Native** (Ch1 §3 Group D) — config in the environment, stateless processes, dev/prod parity — is what makes "the same artifact runs for one college or a thousand" (Ch1 §1.3.2) actually deployable rather than aspirational. This chapter is where that discipline becomes pipeline steps and deployment manifests.
2. **"Peel off services under measured load, not before"** (Ch2 AD-2.1) and **"introduce a dedicated gateway at the extraction trigger, not earlier"** (Ch7 API-3.1) are both instances of one deeper rule this chapter applies a third time, to infrastructure orchestration itself: **don't adopt Kubernetes-grade complexity before there is more than one thing to orchestrate.**
3. **No silent data destruction; canonical deletes are soft; raw is immutable** (Ch1 §4.7, Ch6 §4) — this chapter is where that becomes an actual backup and disaster-recovery posture for the store that holds it all.

The organizing idea:

> **Infrastructure complexity should track real operational need, not anticipated need.** Every piece of DevOps tooling in this chapter — a CI gate, a container orchestrator, a multi-region failover plan — is justified by a specific, current or near-term problem it solves, not adopted because it's what "enterprise platforms" are assumed to run. The chapters before this one have already practiced this discipline (the modular monolith, the deferred API gateway); this chapter is where the same discipline is applied to the infrastructure layer.

---

### 1. DevOps architecture at a glance

```
  SOURCE CONTROL                CI                          DEPLOYMENT
  ─────────────                ──                          ──────────
  GitHub, one repo              backend-ci.yml (exists):    Container-per-process
  one-commit-per-change          lint (hard gate) →          (app, worker-capable
  discipline (§4 — a real,       mypy (advisory, tracked     instance, Postgres,
  named gap exists today)        backlog) → pytest           Redis) on a managed
                                 (testcontainers)             container platform —
                                                              NOT Kubernetes at v1
                                frontend CI (MISSING —        (§6)
                                §3, named gap, ruled now)
                                                             │
                                                             ▼
                                                       ENVIRONMENTS (§5)
                                                       dev → staging → prod
                                                       parity via env-based config
                                                             │
                                                             ▼
                                                       SCALING (§7) & DR (§8)
                                                       horizontal app scaling,
                                                       read-replica scaling,
                                                       Postgres backup/PITR,
                                                       India-region pinning
```

---

### 2. Design tenets specific to DevOps & cloud

- **Don't build the orchestrator before there's something to orchestrate.** A single deployable modular monolith (Ch2 AD-2.1) doesn't need Kubernetes — it needs a process manager, health checks, and a way to run more than one copy behind a load balancer. The complexity of a full container-orchestration platform is justified by *multiple, independently-scaled services*, which v1 does not yet have.
- **CI gates protect what's expensive to get wrong, and stay advisory on what isn't, yet.** A failing isolation test or a failing migration is release-blocking. A backlog of pre-existing type errors accumulated before type-checking was enforced is tracked and paid down deliberately, not mass-suppressed with blanket ignores and not silently made blocking overnight either — both extremes would be worse than the honest middle this platform has chosen.
- **Every environment is the same artifact, different configuration.** Dev, staging, and production run the same container image; what differs is environment variables (secrets, connection strings, feature flags) — never a recompiled or differently-built artifact per environment. This is Twelve-Factor's dev/prod-parity principle, treated as load-bearing rather than aspirational.
- **Migrations are part of the deployment, not a side activity.** A schema change ships in lockstep with the code that depends on it, runs through the same additive-by-default discipline Chapter 6 established, and is treated as a release-blocking step a deploy cannot skip past.
- **DR planning starts from "what's actually irreplaceable."** The canonical Postgres store is the one truly irreplaceable asset (Ch1 §1.2's moat); Redis (Ch6 §6) holds nothing that isn't reconstructable from Postgres and therefore needs no DR strategy of its own beyond "redeploy and let it repopulate."

---

### 3. CI/CD — what exists, what's missing, and the one broken thing, named precisely

**What runs today.** A backend CI workflow triggers on any change under the backend path: lint via `ruff` (a **hard gate** — the build fails if it doesn't pass), type-checking via `mypy` (currently **advisory, continue-on-error**), and the test suite via `pytest` (using testcontainers, so CI spins up real ephemeral infrastructure rather than mocking the database away).

**Why mypy is advisory rather than blocking — stated honestly rather than left to look like an oversight.** At the point type-checking was introduced, a substantial number of pre-existing type errors already existed in earlier-phase code. The deliberate choice was **not** to mass-suppress them with blanket `# type: ignore` comments (which would hide real issues forever) and **not** to make the gate immediately blocking (which would halt all work on unrelated code until a large, separate backlog was cleared). Instead, the backlog is tracked explicitly and mypy stays advisory **until that backlog is paid down** — a named, intentional, temporary state, not a permanently-lowered bar.

> **Ruling DEVOPS-3.1 — mypy remains advisory until the tracked pre-existing type-error backlog reaches zero, at which point it becomes a hard CI gate. This transition is a tracked roadmap item (Chapter 15), not an indefinite deferral.** *Basis: Ch1 driver #4; honest, incremental discipline over either extreme.*

**The missing frontend CI workflow — a real, named gap, ruled now.** Only `backend-ci.yml` exists. There is no equivalent pipeline running `tsc --noEmit` (the contract-conformance gate Chapter 9 §10 already declared binding), linting, or any frontend test suite on every frontend change. This means Chapter 9's own release-gate claim (FE-10.1: "`tsc --noEmit` passing is a release gate, not a suggestion") currently has **no automated enforcement** — it is true by discipline, not yet true by CI.

> **Ruling DEVOPS-3.2 — A `frontend-ci.yml` workflow is added, mirroring the backend's structure: lint (oxlint) as a hard gate, `tsc --noEmit` against the generated API types as a hard gate (making Ch9's FE-10.1 actually enforced rather than merely declared), and the Playwright suite referenced in Chapter 9's verification practice as the test job.** *Basis: Ch9 FE-10.1; Ch1 driver #4 — a release gate that isn't automated isn't reliably a gate.*

**The broken cold install — root-caused precisely, not just flagged.** A clean `npm ci` in the frontend fails. The specific cause: `openapi-typescript` (pinned at `^7.13.0`) declares a peer dependency on `typescript@^5.x`, while the project's own TypeScript dependency is pinned at `~6.0.2` (and resolves to `6.0.3` in the lockfile) — a genuine, verifiable peer-dependency range conflict, not a vague "tooling issue." npm's strict peer-dependency resolution rejects this combination on a clean install even though the two packages work together in practice at the versions actually resolved.

**Resolution options, compared rather than just patched over.**

- *Option A — downgrade TypeScript to a `^5.x` release to satisfy the stated peer range.* Works, but moves the project backward from a deliberately current TypeScript version for the sake of one dev-dependency's stated (and likely just stale) peer range — the wrong direction to resolve a transitive tooling constraint.
- *Option B — use `--legacy-peer-deps` or an npm overrides/resolutions entry to force the actually-working version combination.* Unblocks the install immediately and matches what's already running (the lockfile already resolves TypeScript 6.0.3 successfully *once installed* — the conflict is specifically a fresh-install-time peer-check, not a real runtime incompatibility). **Recommended**, paired with an explicit code comment recording *why* the override exists, so a future engineer doesn't "clean up" an override whose purpose isn't stated.
- *Option C — wait for `openapi-typescript` to widen its peer range to include TypeScript 6.x upstream, and do nothing in the meantime.* Defers the fix to a third party's release schedule, leaving every new clone of the repository broken until then — unacceptable given how basic "can a new engineer clone and run this" is to onboarding and to disaster recovery itself (§8 — a DR rebuild that can't even `npm ci` is not a recovery plan).

> **Ruling DEVOPS-3.3 — Resolve the cold-install failure via an explicit npm override forcing the working TypeScript version against `openapi-typescript`'s stated peer range, with a code comment recording the specific conflict and why the override is safe (the versions already work together once installed — this is a peer-check artifact, not a real incompatibility). Tracked as an immediate fix, not deferred to an upstream release.** *Basis: Ch1 §4.7's spirit applied to tooling — a broken cold install is itself a small, avoidable "data loss" of engineering time on every new clone; Ch1 driver #4.*

---

### 4. Source control discipline

**The standard.** One commit per logical change — a discipline that exists so the audit trail Chapter 8 built for *data* has an analogue for *code*: a reviewer, or a future engineer doing `git bisect`, should be able to read history as a sequence of intentional, individually-reasoned changes, not reconstruct intent from a monolithic diff.

**A named violation, not hidden.** The entire Phase 3 frontend build — the design system, the screens, the auth/token layer, all of Chapter 9's subject matter — landed as a **single squashed commit**, a direct violation of the platform's own discipline. This is recorded here for the same reason every other gap in this Bible is recorded rather than smoothed over: a future engineer investigating *when* a specific frontend behavior was introduced, or trying to revert one isolated piece of it, currently cannot, because the commit history offers no finer granularity than "all of Phase 3 frontend, at once."

> **Ruling DEVOPS-4.1 — The one-commit-per-change discipline is binding on all future work without exception; the existing Phase 3 frontend squash is not retroactively split (rewriting shared history has its own cost) but is named explicitly here, and Chapter 15's roadmap should track it as a closed-but-documented item rather than an open one to "fix."** *Basis: Ch1 driver #4; honest scoping of which gaps are worth the cost of retroactive repair versus which are simply worth recording.*

---

### 5. Environments & configuration

**Dev / staging / production — one artifact, environment-driven behavior.** The same built container image is promoted through environments; what changes between them is environment variables only — database connection strings, secret values (Ch8 §6), feature flags, and the deployment region. There is no environment-specific build step, no "the staging build has debug logging compiled in" divergence — if a bug only reproduces in one environment, the first suspect is a configuration difference, not a code difference, precisely because code differences between environments are architecturally not supposed to exist.

**Secrets remain Chapter 8's domain; this chapter only fixes *how* they reach a running process.** Every secret (Ch8 §6) is injected as an environment variable by the deployment pipeline at container start, sourced from the platform's secret store — never baked into an image layer, never committed, and never present in a CI log (CI steps that print environment state mask secret values explicitly).

**Why this matters for disaster recovery specifically (forward reference to §8).** Because configuration is fully externalized from the artifact, *rebuilding* the platform in a new environment after a disaster is "deploy the known-good image with the known-good secrets," not "reconstruct a bespoke environment-specific build" — environment parity is a DR enabler, not just a tidiness preference.

---

### 6. Containerization & deployment topology — why not Kubernetes at v1

**The decision, argued, not assumed.** The platform's processes — the FastAPI application (Ch2's modular monolith, Ch7's de facto API gateway), the in-process background-task ingestion pipeline (Ch5 §11), the eventual extracted services — are packaged as containers. The question this section actually answers is *what orchestrates them*, and the mandate's enumeration of "Kubernetes" as a chapter topic does not, on inspection, mean Kubernetes is the right choice for the platform's *current* shape.

**Comparison.**

- *Option A — Kubernetes from the start.* Provides best-in-class orchestration for many independently-scaled services: rolling deploys, service discovery, fine-grained autoscaling per service, a vast ecosystem. The cost is real and immediate: a dedicated operational skillset, cluster management overhead, and a meaningful baseline complexity tax — for a v1 deployment topology that is, per Chapter 2's own decomposition ruling (AD-2.1), **one deployable application plus a database plus a cache.** Orchestrating "one thing" with a platform built for orchestrating "many things" is the same premature-scaling mistake Chapter 7 already declined to make with a dedicated API gateway (API-3.1) and Chapter 2 already declined to make with microservices (AD-2.1) — applied a third time, to the same underlying judgment.
- *Option B — a managed container platform / PaaS (e.g. a managed App Runner/Cloud Run/Container Apps-class service) for the application tier, with managed Postgres and managed Redis.* Provides horizontal scaling (more copies of the same container behind a load balancer — exactly what the v1 topology actually needs, §7), zero-downtime deploys, and health-check-driven restarts, **without** requiring cluster operations expertise the platform doesn't yet need. **Recommended for v1.**
- *Option C — raw VMs with manual orchestration.* Strictly worse than Option B on every axis that matters (scaling, deploy safety, health management) for no offsetting benefit at this scale. Rejected.

**The extraction trigger, restated a third time because the pattern is now a platform-wide rule, not a one-off.** Per Chapter 2 §9's scale progression, the moment ingestion workers or AI orchestration are genuinely extracted as independent, independently-scaled services (AD-2.1's trigger condition) is the *same* moment a real orchestrator's value — independent scaling policies per service, service-mesh-grade routing between them — becomes real rather than theoretical. Kubernetes (or an equivalent) is introduced **at that trigger**, not before, mirroring exactly the reasoning Chapter 7 applied to the API gateway (API-3.1) and Chapter 2 applied to decomposition (AD-2.1).

> **Ruling DEVOPS-6.1 — A managed container/PaaS platform (not Kubernetes) hosts the v1 application tier; managed Postgres and managed Redis are used rather than self-hosted instances of either. Kubernetes (or an equivalent orchestrator) is adopted at the same trigger point as service extraction (Ch2 AD-2.1), not before.** *Basis: Ch1 §5 (avoid premature scaling); Ch7 API-3.1's identical reasoning, applied a third time.*

---

### 7. Scaling

**The application tier scales horizontally — more identical containers, not bigger ones, as the first lever.** Because the application is stateless (Ch9 §9's explicit "tokens are UI state, never authority" design, Twelve-Factor's stateless-process principle), running additional copies behind a load balancer requires no session-affinity tricks and no shared in-process state to reconcile — any request can be served by any running copy.

**The data layer scales along the path Chapter 6 already designed for.** Interactive read load scales by adding read-replica capacity (Ch6 §8, Ch2 AD-5.1) before the canonical primary's write path needs anything beyond normal vertical headroom (Ch6 §11) — this chapter's job is only to operationalize that design as an actual capacity-planning trigger (replica lag or query latency crossing a defined threshold), not to re-decide it.

**Per-tenant fairness, not just aggregate capacity.** Because the platform is pooled-multi-tenant (Ch2 AD-6.1), scaling the application tier alone does not, by itself, prevent one tenant's heavy usage from degrading another's — that fairness guarantee is already enforced at the API boundary (Ch7 §10's rate limiting) and the AI Gateway (Ch3 §3's per-tenant quotas); this chapter's scaling decisions exist *alongside* those, not as a substitute for them.

**The scale progression, as an operational checklist rather than a restated diagram.** Chapter 2 §9 already drew the macro progression (1 college → 100 → 1,000 → millions); this chapter's contribution is naming the *operational trigger* at each step: more application container replicas and a read-replica capacity increase (100 colleges); the AD-2.1 service extraction plus the orchestrator adoption (DEVOPS-6.1) at 1,000 colleges; a sized analytical/warehouse tier (Ch2 AD-5.1's deferred option) and multi-region DR posture (§8) at the millions-of-users step.

---

### 8. Disaster recovery

**Start from what's actually irreplaceable (§2's tenet, made concrete).** The canonical PostgreSQL store (Ch6 §5) — including the raw/staging/canonical medallion layers and the pgvector embeddings living in the same database (Ch6 §7) — is the platform's one truly irreplaceable asset. Everything else in the architecture is either stateless (the application tier, §7) or explicitly designed to hold nothing that isn't reconstructable from Postgres (Redis, Ch6 §6's "never a system of record" rule).

**Backup strategy, tiered to that asset's importance.**

```
  POSTGRES (canonical SoT, raw/staging, pgvector)
      → continuous backup with point-in-time recovery (PITR), not just
        nightly snapshots — because the gap between "last snapshot" and
        "the incident" is exactly the data Chapter 1's no-silent-data-loss
        constraint (§4.7) cares about losing
      → automated backup verification (a backup that has never been
        test-restored is not a verified backup)

  REDIS (cache, rate-limit counters, refresh-token denylist)
      → NO backup/DR strategy required beyond "redeploy and let it
        repopulate" — by Chapter 6's own design rule, nothing here is
        the only copy of any fact

  RAW UPLOADED FILES (if stored as object storage rather than DB blobs)
      → versioned, redundant object storage with the same retention
        posture as the raw database tables (Ch1 §4.7) — immutable,
        never purged opportunistically
```

**India data residency shapes where backups can physically live, not just where primary data lives.** Chapter 8 §9's residency requirement (India-tenant data hosted in India) applies to backups and DR replicas with the same force it applies to the primary store — a backup strategy that replicates to an out-of-region location for redundancy would itself be a residency violation, so DR design for Indian tenants stays **multi-AZ within the India region**, not multi-region, until a future tenant's residency requirements (Ch1 §1.3.3's region-agnostic architecture) explicitly call for a different region's DR posture.

**RPO/RTO — named as targets the platform commits to, not left unspecified.** A Recovery Point Objective (maximum acceptable data loss, measured in time) and Recovery Time Objective (maximum acceptable downtime) are set per the canonical store's actual backup cadence and the realistic time to restore and re-point the application tier at a recovered instance — continuous PITR backup makes a tight RPO (low single-digit minutes) achievable; RTO is bounded primarily by infrastructure provisioning time, not data-restore time, given PITR's speed relative to a full snapshot restore.

> **Ruling DEVOPS-8.1 — Continuous PITR backup with periodic restore verification for the canonical PostgreSQL store; no DR strategy for Redis beyond redeploy; backups and DR replicas for India tenants stay within the India region, multi-AZ, never multi-region, until a tenant's own residency requirement specifies otherwise.** *Basis: Ch1 §4.7; Ch8 §9's residency constraint; Ch6 §6's "Redis is never a system of record."*

---

### 9. Release & migration discipline

**A migration ships with the code that needs it, in the same release, never as a separate "we'll run that later" step.** Alembic migrations (Ch6 §10) run as a release-blocking deployment step, before the new application code that depends on the schema change goes live — not after, and not manually by an operator outside the pipeline.

**Additive-by-default is what makes this safe to automate.** Because Chapter 6 §10 already established that the default migration posture is additive (new nullable columns, new tables) rather than destructive, an automated "run migrations, then deploy" pipeline step is low-risk by construction — the rare genuinely-breaking migration (a `NOT NULL` hardening, a column rename) is the one case that gets a manual review gate in the pipeline rather than fully automated promotion, precisely because it's the exception Chapter 6 already flagged as needing the invariant proven true in running code first.

**Rollback strategy matches the additive-by-default posture.** Because most migrations are additive, rolling back application code without rolling back the migration is almost always safe (an old code version simply doesn't read the new column yet) — this is a direct dividend of Chapter 6's schema-evolution discipline, paying off here as a simpler, lower-risk release process.

---

### 10. Infra-level observability — the capability this chapter provides

This chapter does not own monitoring, metrics, or alerting (Chapter 11 does) — but it owns the *infrastructure-level capabilities* those depend on, named briefly so Chapter 11 has something concrete to consume:

- **Health-check endpoints** (a basic liveness check and a database-roundtrip readiness check) exist and are what the deployment platform's orchestration (§6) uses to decide whether a container is healthy enough to receive traffic or needs restarting — this is an infrastructure concern (is this process alive and able to reach its dependencies) distinct from Chapter 11's business-level monitoring (is the platform behaving correctly).
- **Structured log output** from every process, in a format a log-aggregation pipeline can ingest, carrying the `tenant_id`/`model_version`/etc. fields Chapter 1 (§3 Group D) already specified as mandatory — this chapter's job is only to ensure that output reaches somewhere Chapter 11's tooling can read it, not to define what's logged or how it's analyzed.

---

### 11. Failure & degradation (DevOps-specific)

| Failure | Behaviour | Why |
|---|---|---|
| **A CI lint/type/test gate fails** | The merge is blocked; mypy failures are currently logged but non-blocking per the tracked backlog (§3) — a deliberate, temporary exception, not a precedent for other gates. | Protect what's expensive to get wrong (§2); honest about the one current exception. |
| **A deployment's migration step fails** | The release is aborted before the new application code goes live; the previous version keeps serving traffic. | Migrations gate deploys, not the reverse (§9). |
| **A container fails its health check** | The orchestration platform stops routing traffic to it and restarts it; other healthy copies continue serving. | Stateless horizontal scaling (§7) makes this safe — no request was tied to that specific instance. |
| **The canonical Postgres primary becomes unavailable** | Failover to a standby within the same region/AZ-set, per the DR posture (§8); RPO/RTO targets bound acceptable loss and downtime. | §8; India-region residency constrains where the standby can live. |
| **A clean clone of the repository fails to install** | Currently happens (§3's named gap) until DEVOPS-3.3's override fix lands; tracked as an immediate-priority item specifically because it blocks onboarding and DR rebuild alike. | Honesty about a real, present gap rather than presenting CI/CD as fully solved. |

---

### 12. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **DEVOPS-3.1** | mypy gate status | Advisory until tracked backlog clears, then blocking | Permanently advisory; immediately blocking | Ch1 driver #4 |
| **DEVOPS-3.2** | Frontend CI | Add `frontend-ci.yml` mirroring backend structure (lint, `tsc --noEmit`, Playwright) | Leaving FE-10.1 unenforced by automation | Ch9 FE-10.1 |
| **DEVOPS-3.3** | Cold install fix | npm override forcing the working TypeScript version, documented inline | Downgrading TypeScript; waiting on upstream | Ch1 §4.7's spirit; onboarding/DR reliability |
| **DEVOPS-4.1** | Commit discipline | Binding going forward; the Phase 3 squash is recorded, not retroactively rewritten | Rewriting shared history to retroactively split it | Ch1 driver #4 |
| **DEVOPS-6.1** | Orchestration platform | Managed container/PaaS + managed Postgres/Redis for v1; Kubernetes at the service-extraction trigger | Kubernetes from the start; raw VMs | Ch1 §5; Ch7 API-3.1's identical reasoning |
| **DEVOPS-8.1** | Disaster recovery | Continuous PITR for Postgres; no DR for Redis; India-region multi-AZ, never multi-region, for Indian tenants | Multi-region DR by default; nightly-snapshot-only backup | Ch1 §4.7; Ch8 §9; Ch6 §6 |

---

### 13. How this chapter governs the rest of the Bible

- **Chapter 6 (Data Architecture)**'s migration discipline (§10) and soft-delete/immutable-raw design (§9) are what make this chapter's automated, low-risk migration pipeline (§9) and backup/PITR strategy (§8) possible — this chapter consumes those designs operationally rather than re-deciding them.
- **Chapter 7 (API & Integration Standards)**'s deferred-gateway reasoning (API-3.1) is the precedent this chapter applies a second time to Kubernetes (DEVOPS-6.1) — both should be revisited together at the same AD-2.1 extraction trigger.
- **Chapter 8 (Security Architecture)**'s secrets model (§6) and residency requirement (§9) are this chapter's binding constraints for environment configuration (§5) and DR posture (§8) respectively.
- **Chapter 9 (Frontend Architecture)**'s FE-10.1 release-gate claim becomes actually enforced once DEVOPS-3.2's frontend CI workflow exists — until then, Chapter 9's gate is correct in principle but unverified in practice, and this chapter is where that gap is closed.
- **Chapter 11 (Observability & Operations)** consumes the health-check and structured-logging capabilities named in §10 as its raw material; this chapter does not define metrics, dashboards, or alerting itself.
- **Chapter 15 (Implementation Roadmap)** should carry forward DEVOPS-3.1 (the mypy backlog pay-down), DEVOPS-3.2 (frontend CI), DEVOPS-3.3 (the cold-install fix), and the FE-3.1 stack-documentation correction from Chapter 9, as a single near-term "close the named gaps" milestone.

New DevOps tensions are added to this ledger (§12) by amendment.

---

### 14. Sign-off

This chapter is normative once ratified. Amendments to the orchestration-platform decision (§6) or the DR posture (§8) require Architecture Review Board approval; §8 amendments touching data residency additionally require alignment with Chapter 8's legal/compliance sign-off.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Cloud Architect | | ☐ Approve ☐ Revise | |
| Principal DevSecOps Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |
| Principal Platform Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |

---

*End of Chapter 10 — DevOps & Cloud Architecture.*
