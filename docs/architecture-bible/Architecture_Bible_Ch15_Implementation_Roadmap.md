# AI ERP Copilot — Architecture Bible

## Chapter 15 — Implementation Roadmap

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The phase-by-phase engineering plan from where the platform stands today to where the preceding fourteen chapters say it needs to go — synthesizing every named gap, deferred decision, and revisit trigger scattered across this Bible into one sequenced, dependency-aware plan.
**Depends on:** Every preceding chapter. This is the Bible's synthesis chapter — it manufactures no new architecture and re-argues no prior ruling; it collects what Chapters 1–14 already flagged as "near-term," "designed but not built," or "revisit at trigger X," and sequences them.
**Explicitly out of scope here, restated from Chapter 1's own founding rule.** This Bible covers only the shared enterprise platform (Ch1, ROLE/IMPORTANT RULES). Product- and role-level roadmap items — reconciling the Placement Cell feature-scope discrepancy, ratifying the Faculty generative-content suite, HOD/Placement V2 data-prerequisite work — belong to their respective RSDDs and Feature Freeze Documents, not to this chapter. Where a platform capability gates a product workstream (most importantly, student identity in §7), this chapter names the platform side of that dependency and stops there.

---

### 0. How this chapter closes the Bible

Fourteen chapters have each, independently, done something this chapter now collects: stated what's actually built, named what's designed but not yet real, and set a condition under which a deferred decision gets revisited. Read end to end, those scattered statements already *are* a roadmap — they were just never assembled into one. This chapter's only job is that assembly, organized by **dependency and risk**, not by the order the chapters happened to appear in.

> **The organizing principle:** close named gaps before building new surface area on top of them, build new surface area in the order its own internal dependencies require, and never build ahead of a stated trigger condition just because the calendar suggests it's "time." Every phase below exists because something earlier in this Bible already said "do this," "do this when X," or "this isn't built yet" — this chapter adds sequencing, not new scope.

---

### 1. Roadmap at a glance

```
  ALREADY BUILT (Phases 0–3, §2)
  Foundation → Ingestion → Risk Engine → Frontend
        │
        ▼
  PHASE 4 — Close the named gaps (§3)              [low-risk, high-leverage,
  CI/tooling/versioning/documentation fixes          do this FIRST — every
  already named across Ch7/9/10/12                   later phase inherits debt
        │                                            if skipped]
        ▼
  PHASE 5 — The AI plane build-out (§4)             [the single largest
  Semantic layer → Gateway/Context Builder →          block of NEW platform
  Tool Calling → RAG → Memory → guardrails            surface area]
        │                              │
        ▼                              ▼
  PHASE 6 — Observability maturity   PHASE 7 — Student identity (§6)
  metrics/tracing/SLOs/AI monitoring  [gates the entire Student RSDD —
  (§5)                                 a platform precondition, product
                                        scope stays out of this Bible]
        │
        ▼
  SCALE-TRIGGERED PHASE (§8) — no fixed date, gated by Ch2 AD-2.1
  service extraction → Kubernetes → real queue/stream → dedicated gateway
  (all four ADR revisit triggers from Ch13 §10 fire TOGETHER, by design)
```

---

### 2. Design tenets for sequencing

- **Gaps before growth.** A platform that builds the AI plane (genuinely new, high-value surface area) while its cold install is still broken and its frontend has no CI gate is compounding technical debt under a more complex system — Phase 4 exists specifically to make every later phase land on solid ground, not to delay value delivery for its own sake.
- **Internal dependency order within a phase matters as much as phase order.** The AI plane (Phase 5) cannot build Tool Calling before the governed semantic layer it selects against exists; it cannot build AI evaluation tests (Ch14 §9) for guardrails that don't exist yet. Sequencing within a phase is argued explicitly, not left as "build all of Chapter 3 somehow."
- **Never build ahead of a named trigger.** Kubernetes, a real message queue, and a dedicated API gateway all share one trigger (Ch2 AD-2.1's service extraction) — building any of them on a calendar-driven "we're probably big enough now" instinct rather than the actual trigger condition is exactly the premature-scaling mistake this Bible has argued against from Chapter 1 onward.
- **Every phase ships with its own definition of done**, per Chapter 14 §3's ruling (TEST-3.1) — a numbered acceptance list, not a vague description of intended progress.

---

### 3. What's already built — Phases 0–3

```
  PHASE 0 — Foundation (complete)
    repo structure · base mixins (PK/Tenant/Timestamp/SoftDelete/Provenance)
    tenants/users · JWT auth (Argon2) · Postgres RLS (forced, non-superuser
    app_user) · append-only audit_log via mapper events · /health + /health/db
    structured logging with request/tenant context

  PHASE 1 — Ingestion pipeline (complete)
    RAW → STAGING → CANONICAL medallion · Connector ABC (CSV/Excel) · column
    mapping (fuzzy-suggest, versioned, human-confirmed) · entity resolution
    (three confidence bands) · the three-transaction-boundary load · data-
    quality reconciliation

  PHASE 2 — Student Success Engine (complete)
    deterministic rules evaluator behind a RiskEvaluator interface · bulk
    signal computation (no N+1) · scoring/tiering · intervention lifecycle ·
    minor/consent gating · 89/89 tests passing, test_rls_coverage.py green
    across 31 tenant-scoped tables

  PHASE 3 — Frontend (complete, with named gaps — see Phase 4)
    Faculty Risk Board + Student 360 + privileged-only Dashboard · design-
    token system (tier severity ramp) · contract-first generated client ·
    JWT access/refresh with collapsed-refresh-race handling · 101/101 tests
    passing across the full backend suite by this point
```

**This is real, verified progress, not aspiration.** Every item above is cited from this Bible's own grounding in the actual codebase — Chapters 4–9 didn't design these from scratch, they documented and justified what's running. The roadmap from here forward is honest specifically because this foundation is solid: Phase 4's gap-closing work is small and bounded precisely because the platform underneath it is not.

---

### 4. Phase 4 — Close the named gaps

**Presented as an actual Change Order, per Chapter 12 §6's own format — this Bible's last chapter practicing the standard the engineering-standards chapter itself established, rather than just describing it.**

```
CHANGE 1 — Fix the broken cold install
  Why:     openapi-typescript's stated typescript@^5.x peer range conflicts
           with the project's actual typescript~6.0.2; npm ci fails clean.
  Scope:   frontend/package.json (npm override), one inline comment
           explaining the override.
  Confirmation: none needed — root cause is verified, fix is additive.
  Acceptance:   a clean `npm ci` on a fresh clone succeeds.
  Cites:   Ch10 §3 (DEVOPS-3.3).

CHANGE 2 — Add frontend CI
  Why:     FE-10.1's "tsc --noEmit is a release gate" is currently true by
           discipline only, not by automated enforcement.
  Scope:   .github/workflows/frontend-ci.yml (new) — oxlint (hard gate),
           tsc --noEmit (hard gate), Playwright suite.
  Confirmation: none needed — mirrors the existing backend-ci.yml pattern.
  Acceptance:   the workflow runs on every frontend-path push/PR and blocks
                merge on lint/type failure.
  Cites:   Ch10 §3 (DEVOPS-3.2); Ch9 §10 (FE-10.1).

CHANGE 3 — Correct the stack-version documentation
  Why:     CHANGELOG states React 18/Router v6; the lockfile resolves
           React 19/Router 7/TypeScript 6/Vite 8. A future engineer coding
           against the documented versions could introduce a real bug.
  Scope:   CHANGELOG.md (the Phase 3 frontend section) — correct the stated
           versions; no code change.
  Confirmation: none needed — purely a documentation correction.
  Acceptance:   CHANGELOG matches package-lock.json exactly.
  Cites:   Ch9 §3 (FE-3.1).

CHANGE 4 — Adopt API versioning now
  Why:     Routes carry no version segment today; retrofitting a version
           AFTER the first breaking change forces every client to migrate
           at the worst possible moment.
  Scope:   route registration — prefix the entire current surface as /v1/;
           no behavior change to any individual endpoint.
  Confirmation: ⚠️ touches every route's path — coordinate with frontend
                client regeneration (the generated TS types will change
                shape) in the SAME release, not a follow-up one.
  Acceptance:   every existing endpoint is reachable under /v1/; the
                generated frontend client is regenerated and tsc --noEmit
                passes against it.
  Cites:   Ch7 §4 (API-4.1).

CHANGE 5 — Pay down the mypy backlog, categorized
  Why:     mypy is advisory specifically because of a tracked, categorized
           pre-existing backlog (the session.get()-returns-Optional pattern,
           ~50 errors one root cause; untyped legacy functions; Sequence-vs-
           list mismatches; one callable-as-type-annotation issue).
  Scope:   the five categories already named in CHANGELOG's mypy report —
           fix one category per sub-change, in separate commits, per
           Ch10 DEVOPS-1's one-commit-per-change standard.
  Confirmation: none needed per category — each is a narrow, well-understood
                fix already categorized; if a category proves larger than
                expected, STOP and re-report rather than mass-suppress.
  Acceptance:   mypy app exits clean; flip backend-ci.yml's mypy step from
                continue-on-error to blocking (Ch10 DEVOPS-3.1's named
                transition condition, now satisfied).
  Cites:   Ch10 §3 (DEVOPS-3.1); CHANGELOG's own categorized backlog report.

CHANGE 6 — Idempotency-key convention for non-upsert writes
  Why:     Writes without a natural key (e.g. POST /risk/interventions)
           rely on client discipline, not a server-side guarantee, against
           blind-retry-driven duplication.
  Scope:   a shared idempotency-key header convention + a short-TTL
           dedup table (or Redis-backed set, per Ch6 DATA-6.1's existing
           Redis introduction) checked at the start of each non-upsert
           write endpoint.
  Confirmation: ⚠️ new behavior on existing endpoints — confirm before
                adding, per Ch12 ENG-5.1 if it requires a new dependency;
                likely does NOT, since Redis already exists for this.
  Acceptance:   a duplicated request with the same idempotency key produces
                no duplicate intervention/record.
  Cites:   Ch7 §9 (API-9.1).
```

**Note what is deliberately NOT in this Change Order: the squashed Phase 3 frontend commit.** Per Ch10 §4's own ruling (DEVOPS-4.1), that gap is recorded, not retroactively repaired — rewriting shared history has its own cost, and this roadmap respects that earlier decision rather than reopening it here.

> **Ruling ROADMAP-4.1 — Phase 4 is sequenced before any new platform capability; Changes 1–3 (install, CI, documentation) ship first as the lowest-risk, highest-leverage fixes; Change 4 (versioning) ships before Phase 5 begins, since Phase 5's AI-plane endpoints should be born versioned, not retrofitted; Changes 5–6 proceed in parallel with Phase 5 since neither blocks it.** *Basis: §2's "gaps before growth" tenet.*

---

### 5. Phase 5 — The AI plane build-out

**The single largest block of genuinely new platform surface area this Bible describes.** Chapter 3 designed the AI plane in full; almost none of it is built yet (Ch3's framing throughout, Ch11 §0's explicit acknowledgment that metrics/tracing/AI-monitoring presuppose an AI plane that doesn't yet exist to monitor). This phase exists to build it — sequenced by its own internal dependency chain, not all at once.

```
  5a. THE GOVERNED SEMANTIC LAYER FIRST
      metrics/dimensions/joins as views over the read replica (Ch6 §8,
      Ch2 AD-5.1) — built BEFORE any AI orchestration code, because Tool
      Calling (5c) has nothing to select against without it, and because
      this layer can be built and tested entirely with deterministic code,
      no model involved yet.

  5b. THE AI GATEWAY + CONTEXT BUILDER
      provider abstraction, model tiering, egress minimization, caching
      (Ch3 §3) + role-scoped schema assembly, few-shot examples, budgeted
      context (Ch3 §4) — built next because Tool Calling (5c) needs a
      Gateway to route through and a Context Builder to assemble its
      prompt, but THIS layer can be built and partially tested (routing,
      caching, context assembly) against a STUBBED model response before
      a real provider integration is wired in.

  5c. TOOL CALLING
      the model returns a governed semantic selection; deterministic code
      validates and executes it (Ch3 §5) — the riskiest and most safety-
      critical piece, built only once 5a and 5b exist, and built WITH its
      AI evaluation test category (Ch14 §9: grounding/abstention in both
      directions, output-validation rejection) as part of ITS OWN
      definition of done — not bolted on after the fact.

  5d. RAG / pgvector
      governed-document retrieval for the Accreditation Assistant and
      Student 360 narrative (Ch3 §6, Ch6 §7) — built after 5c because RAG
      retrieval results flow INTO context the model narrates, and the
      narration/grounding discipline (5c) needs to already be solid before
      adding a second grounding source to keep straight.

  5e. MEMORY
      bounded session memory + explicit saved artifacts (Ch3 §7) — built
      LAST among the five subsystems specifically because it's the lowest-
      risk, most purely-additive piece (it affects coherence across turns,
      not correctness of any single turn) and the one place a mistake is
      most likely to silently violate Ch1 §4.5's no-implicit-profiling
      rule if rushed — it gets the most deliberate, least time-pressured
      build slot for exactly that reason.

  THE PROMPT-INJECTION RED-TEAM SUITE (Ch8 §8, Ch14 §9) is built
  INCREMENTALLY alongside 5c–5e, not as a single post-hoc pass at the end —
  each subsystem's own scope-escalation surface is adversarially tested as
  it ships, so containment is verified piece by piece, matching how it was
  actually built.
```

**Why this internal order, restated as a single sentence.** Build the thing the model selects against, then the thing that routes to and frames the model, then the thing that lets the model select safely, then the second grounding source, then the lowest-risk convenience layer — in that order, because each step's safety properties depend on the step before it already being real and tested.

> **Ruling ROADMAP-5.1 — The AI plane is built in the order 5a→5b→5c→5d→5e; AI evaluation tests for each subsystem (Ch14 §9) are part of that subsystem's own definition of done, not a separate phase that follows after all five are "complete."** *Basis: Ch3's own internal dependency structure; Ch14 §9.*

---

### 6. Phase 6 — Observability maturity

**Sequenced to begin alongside Phase 5, not strictly after it, with one exception named explicitly.** Logging (Ch11 §3) is already built and needs no new phase. Metrics, tracing, and formal SLOs (Ch11 §4, §5, §7) can be built against the *existing* platform (the read/ask and ingest/compute paths already exist) without waiting for the AI plane — there's real value in instrumenting what's already running before adding a new component to instrument. **The one genuine dependency**: AI-specific monitoring (Ch11 §6 — grounding/abstention rate, output-validation-rejection rate, cost-per-tenant, cache hit rate) cannot be built before Phase 5 produces an AI plane to monitor, and should land **incrementally as each Phase 5 subsystem ships** — the Gateway's cost/cache metrics as soon as 5b exists, the grounding/abstention metrics as soon as 5c exists — rather than as a single monitoring pass after all of Phase 5 completes.

```
  6a. METRICS (existing paths)      — independent of Phase 5, can start now
  6b. TRACING (OpenTelemetry)       — independent of Phase 5, highest value
                                       once 5c exists (the multi-step AI
                                       request lifecycle is the hardest
                                       thing to debug without it) but useful
                                       for the existing ingest/recompute
                                       path immediately
  6c. FORMAL SLOs                   — independent of Phase 5; needs real
                                       production load data to calibrate
                                       targets against (Ch11 §7), so this
                                       sub-phase's actual NUMBERS should be
                                       set from observed traffic, not
                                       invented in advance
  6d. AI-SPECIFIC MONITORING        — DEPENDS on Phase 5; lands incrementally
                                       alongside each AI-plane subsystem
```

> **Ruling ROADMAP-6.1 — Metrics, tracing, and SLO calibration (6a–6c) begin independently of and concurrently with Phase 5; AI-specific monitoring (6d) lands incrementally with each Phase 5 subsystem rather than as a separate post-Phase-5 pass.** *Basis: Ch11 §0; no reason to delay instrumenting what already exists.*

---

### 7. Phase 7 — Student identity (the platform precondition)

**Named here specifically because it's a platform capability that gates a product workstream, the one explicit exception to this chapter's product-roadmap exclusion.** Chapter 4 §9 already stated it bluntly: students currently exist as canonical data rows, not authenticated users — there is no student login, no student session, and therefore no way to exercise the `student` role's ABAC predicate (`resource.student_id == subject.user_id`) even though the model for it is fully designed. **No student-facing self-service feature ships before this exists.**

```
  WHAT THIS PHASE BUILDS (platform side — the product side is the Student
  RSDD's job, out of this Bible's scope):
    - a student identity-issuance mechanism (how a student gets a login —
      institutional roster-based provisioning is the likely shape, but the
      specific mechanism is a product decision, not an architecture one)
    - the `student` role's session/auth path through the EXISTING JWT
      contract (Ch4 §2) — no new auth mechanism, just a new population
      using the one that already exists
    - the self-scoping ABAC predicate, already named in Ch4 §6 but never
      exercised because no student session has ever existed to test it
      against
    - the test category this unlocks: a REAL "student sees only their own
      record" isolation test (Ch14 §6), which currently cannot exist
      because there's no student session to attempt it with
```

**Why this is sequenced after Phase 5/6 rather than earlier, despite being named as urgent in Chapter 4.** Urgency and sequencing position are different questions. This phase has no technical dependency on Phases 4–6 — it could, in principle, run in parallel with any of them. It's placed here because it is, in practice, gated by a **product decision** (the specific identity-issuance mechanism, a choice this Bible explicitly defers to the Student RSDD) rather than an architectural one — the platform-side work itself is small once that product decision lands, and this roadmap should not block on architecture work that isn't actually the bottleneck.

> **Ruling ROADMAP-7.1 — Student identity's platform-side implementation (the auth path, the self-scoping predicate, the resulting isolation test) is ready to build as soon as the product-level identity-issuance decision is made; this roadmap does not gate that decision, but tracks the platform work as immediately actionable once it lands, independent of Phases 4–6's progress.** *Basis: Ch4 §9; this Bible's own scope boundary (front matter).*

---

### 8. The scale-triggered phase — four decisions, one trigger, no fixed date

**The cleanest example in this entire Bible of decisions that were deliberately deferred together because they were deferred for the identical reason.** Chapter 13 §10 already noticed this pattern; this chapter is where it becomes an actual, named roadmap phase with **no calendar date**, because a calendar date would be exactly the premature-scaling mistake every one of these four decisions was written to avoid.

```
  THE TRIGGER (Ch2 AD-2.1): ingestion workers OR AI orchestration are
  genuinely extracted as independent, independently-scaled services —
  not "the team feels like the platform is getting big," but a measured
  load condition on one of those two specific subsystems.

  WHAT FIRES, SIMULTANEOUSLY, THE MOMENT THAT TRIGGER IS MET:
    - Kubernetes (or an equivalent orchestrator) replaces the managed
      PaaS platform (Ch10 DEVOPS-6.1)
    - the in-process background-task pipeline is swapped for a real
      message queue/event stream, behind the SAME stage interface that
      was deliberately kept stable for this exact swap (Ch1 MR-2)
    - a dedicated API gateway is introduced in front of what are now
      multiple backends (Ch7 API-3.1)
    - the modular monolith's bounded contexts (Ch2 §2) become actual
      separate deployable services along the seams that were deliberately
      kept clean for this exact moment (Ch2 AD-2.1)
```

**Why "no fixed date" is itself the correct roadmap entry, not an evasion.** Every other phase in this chapter has a real sequencing argument (dependency order, risk reduction). This phase's entire architectural point — made across four separate chapters, independently, before this chapter ever tied them together — is that building any of these four things *before* the trigger fires is a cost paid for no current benefit. Putting a target quarter on this phase would itself violate the reasoning that produced it.

> **Ruling ROADMAP-8.1 — The four scale-triggered infrastructure decisions (orchestrator, queue/stream, API gateway, service extraction) are tracked as one phase with one shared trigger condition and explicitly no calendar target; a future architecture review proposing to build any ONE of them should be required to show the AD-2.1 trigger condition is actually met, not merely that time has passed.** *Basis: Ch13 §10's TDR-10.1; Ch1 §5.*

---

### 9. The roadmap as a dependency graph

A phase list reads as if everything within it is independent; a dependency graph shows what actually blocks what — and is the more honest artifact for planning purposes.

```
  Phase 4 (gaps) ──────────────────────────────────┐
       │                                            │
       │ (versioning specifically, CHANGE 4)        │
       ▼                                            ▼
  Phase 5a (semantic layer) ──► 5b (Gateway/Context) ──► 5c (Tool Calling)
                                                              │      │
                                                              ▼      ▼
                                                       5d (RAG)  Phase 6d
                                                              │   (AI monitoring,
                                                              ▼    incremental)
                                                       5e (Memory)

  Phase 6a/6b/6c (metrics/tracing/SLOs) ── independent of Phase 5 entirely,
                                            can run start-to-finish in parallel

  Phase 7 (student identity) ── independent of Phases 4–6 technically;
                                 gated by a PRODUCT decision, not a platform one

  Scale-triggered phase ── gated ONLY by the Ch2 AD-2.1 trigger; can fire
                            at any point on this timeline, including
                            theoretically before Phase 5/6/7 complete, if
                            the trigger condition is met early
```

**The one hard sequencing dependency worth restating because it's easy to miss:** Phase 4's CHANGE 4 (API versioning) should land **before** Phase 5 begins, specifically so every new AI-plane endpoint is born inside `/v1/` rather than needing to be retrofitted alongside everything else later. Every other cross-phase relationship in this graph is "can run in parallel," not "must precede" — Phase 4/CHANGE 4 is the one genuine exception.

---

### 10. What's deliberately not on this roadmap

Restated from Chapter 1 §7's non-goals, because a roadmap's silences are as informative as its phases: no system-of-record ambitions, no autonomous AI write-actions, no LMS/content-authoring/proctored-exam rebuild, no AI-tutoring product, no deep financial-accounting depth beyond fees, no native-mobile-first build, no international (UAE or otherwise) deployment work. None of these are "phase 8" — they are not on this platform's roadmap at all, by the same deliberate boundary Chapter 1 drew at the very start of this Bible.

**Also explicitly not here, restated from this chapter's own front matter:** the Placement Cell feature-scope reconciliation, Faculty generative-content-suite ratification, and HOD/Placement V2 data-prerequisite work are real, active workstreams — but they are product/RSDD roadmap items, tracked in their own documents, and this chapter does not absorb them just because it's the last chapter in the Bible. The one link between that roadmap and this one is Phase 7 (§7): student identity is the platform precondition the Student RSDD's entire roadmap depends on, and that single dependency is the extent of this chapter's reach into product-roadmap territory.

---

### 11. Risk register — what goes wrong if this sequencing isn't followed

| Risk | If sequencing is ignored | Mitigation already in this plan |
|---|---|---|
| **Building Phase 5 (AI plane) before Phase 4 (gaps)** | New, complex surface area gets layered onto a frontend with no CI gate and a broken cold install — every AI-plane frontend change inherits both problems at higher stakes. | §2's "gaps before growth" tenet; Phase 4 sequenced first explicitly. |
| **Skipping API versioning (CHANGE 4) before Phase 5** | AI-plane endpoints ship unversioned alongside the rest of the unversioned surface, and the platform's first breaking change (likely to involve the AI plane, given how new and fast-evolving it is) forces the same painful retrofit Chapter 7 §4 warned against — except now across a larger surface. | §9's explicit "CHANGE 4 before Phase 5" hard dependency. |
| **Building 5c (Tool Calling) without its AI evaluation tests as part of the same definition of done** | A guardrail (grounding, abstention, output validation) ships "designed" but unverified — exactly the gap Chapter 14 §9 exists to close, reopened by treating evaluation as a follow-up phase rather than part of 5c's own completion criteria. | §5's explicit ruling that evaluation tests are part of EACH subsystem's definition of done, not a trailing phase. |
| **Adopting Kubernetes/a queue/a gateway on a calendar-driven instinct rather than the AD-2.1 trigger** | Real operational complexity and cost paid for capability the platform doesn't yet need — the exact premature-scaling mistake four separate chapters argued against independently. | §8's explicit "no calendar date, trigger-gated only" framing; ROADMAP-8.1's burden-of-proof requirement. |
| **Letting Phase 7 (student identity) drift indefinitely because it's "blocked on product"** | The Student RSDD's entire roadmap silently stalls on a platform dependency nobody is actively tracking, because it's technically "not blocked" on this side. | §7's explicit framing as immediately actionable the moment the product decision lands — a standing, not dormant, readiness state. |

---

### 12. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **ROADMAP-4.1** | Phase 4 sequencing | Gap-closing fixes first; versioning (CHANGE 4) before Phase 5 begins | Building new AI surface area before closing named gaps | §2's tenet |
| **ROADMAP-5.1** | Phase 5 internal order | Semantic layer → Gateway/Context → Tool Calling → RAG → Memory, each with its own eval tests as part of its DoD | Building all five subsystems in parallel; evaluation as a trailing phase | Ch3's dependency structure; Ch14 §9 |
| **ROADMAP-6.1** | Phase 6 sequencing | Metrics/tracing/SLOs start independent of Phase 5; AI monitoring lands incrementally with each AI subsystem | Waiting for all of Phase 5 before any observability work | Ch11 §0 |
| **ROADMAP-7.1** | Phase 7 framing | Platform-side work is immediately actionable once the product identity-issuance decision lands, not gated by this roadmap | Treating Phase 7 as blocked until explicitly scheduled | Ch4 §9 |
| **ROADMAP-8.1** | Scale-triggered phase | One phase, one shared trigger, no calendar date; burden of proof on showing the trigger is met | A fixed future quarter for "infrastructure modernization" | Ch13 TDR-10.1; Ch1 §5 |

---

### 13. How this chapter closes the Bible

This is the last chapter, and its governance section runs in the opposite direction from every other chapter's: instead of naming which later chapters inherit its rulings, it names which **earlier** chapters this roadmap depends on staying internally consistent as it executes.

- **Chapters 1–2** set the principles and macro architecture every phase above must continue to honor as it's built — Phase 5 in particular should be re-checked against Chapter 1's hard constraints (§4) at each subsystem's completion, not just at the end of Phase 5.
- **Chapter 3** is what Phase 5 builds; **Chapter 11** is what Phase 6 builds; **Chapter 4 §9** is what Phase 7 closes; **Chapters 7, 9, 10, 12** are the source of every Phase 4 Change.
- **Chapter 13's ADR catalog** should be updated as each scale-triggered decision (§8) actually fires — the catalog's "Accepted" status for ADR-16/17/18/22 should flip to "Superseded by [new ADR]" at that moment, not silently left stale.
- **Chapter 14's testing strategy** is the standard every phase's acceptance criteria in this chapter were written against — a numbered list per §3's TEST-3.1 ruling, exactly as Phase 4's Change Order and Phase 5's per-subsystem definitions of done both demonstrate.

**A closing observation, since this is the Bible's last chapter.** Every chapter in this document has practiced the same two disciplines this chapter now formally closes the loop on: state what's actually true (built vs. designed, working vs. gapped), and state the condition under which a decision should be revisited. A roadmap built from fourteen chapters that were all already honest about their own gaps required remarkably little invention — it required collection, sequencing, and one synthesis: noticing that several deferred decisions shared one trigger, and saying so once, clearly, in one place.

---

### 14. Final sign-off — the Architecture Bible as a whole

This chapter's ratification, once approved, completes the Architecture Bible's initial sign-off across all fifteen chapters. Each chapter retains its own sign-off table and remains independently amendable per its own stated approval requirements (most binding chapters: Architecture Review Board; minor-handling and DPDP-touching chapters: additionally, independent legal review). This table ratifies the **roadmap** specifically — the sequencing and phasing of work the preceding fourteen chapters' architecture already authorizes.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Chief Product Officer | | ☐ Approve ☐ Revise | |
| Principal Engineering Manager | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Security Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |

---

*End of Chapter 15 — Implementation Roadmap.*

*End of the AI ERP Copilot Architecture Bible.*
