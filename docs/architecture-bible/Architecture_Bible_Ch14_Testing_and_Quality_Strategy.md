# AI ERP Copilot — Architecture Bible

## Chapter 14 — Testing & Quality Strategy

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** How the platform proves, continuously, that the guarantees made in every preceding chapter actually hold — unit testing, integration testing, the tenant-isolation acceptance suite, AI evaluation, security testing, and load testing.
**Depends on:** Chapter 1 (driver #1 isolation, driver #2 explainability), Chapter 3 (the guardrail table §8 this chapter's AI evaluation suite must verify), Chapter 8 (the four release-blocking isolation tests §10, restated here in full procedural detail), Chapter 11 (the SLOs this chapter's load tests target, and the AI monitoring metrics this chapter's evaluation suite shares a vocabulary with), Chapter 12 (the coding standards — bounded-query batches, explainability-in-code, per-item error isolation — that this chapter's tests exist specifically to enforce, not merely describe), Chapter 13 (ADR-21's pytest+testcontainers choice, adopted here, not re-decided).
**Relationship to the existing build:** The acceptance-test discipline, the RLS-coverage meta-test, the no-N+1 query-count pattern, and the tenant-isolation DB-level tests described in this chapter are **already implemented and passing** (101/101 at last count, across Phases 0–2). AI evaluation and load testing are **not yet built** — named honestly, consistent with this Bible's practice in Chapters 9–11.

---

### 0. How this chapter builds on Chapters 1–13

Three commitments become executable tests here:

1. **"A guarantee that isn't measured is a hope"** (Ch11 §0) has a testing-chapter twin: **a guarantee that isn't tested is a hope that happens to currently be true.** Every architectural invariant this Bible has stated — isolation, determinism, explainability, no-N+1 — earns a place in this chapter specifically because stating it in Chapter 1 and verifying it in Chapter 14 are different acts, and only the second one catches a regression before a user does.
2. **Chapter 8 §10's four isolation tests** are not just security requirements — they are this chapter's flagship example of what a *good* test looks like: it tests the platform's actual behavior under a real adversarial scenario, not just that a function returns the value a unit test expected.
3. **Chapter 12's "name the bug, don't silently patch" standard (ENG-8.1)** has an unstated second half this chapter makes explicit: **every named bug gets a regression test**, not just a fix and a writeup — otherwise the writeup is documentation of a problem that could recur silently.

The organizing idea:

> **Tests are how this Bible's claims stay true after the people who wrote them have moved on to the next chapter, the next phase, the next feature.** A test suite is the only part of this entire document that runs *itself*, continuously, without needing a human to remember to re-check whether a principle still holds.

---

### 1. Testing at a glance — the pyramid, plus what doesn't fit a pyramid

```
                    ▲
                   /│\          AI EVALUATION (§9 — NOT YET BUILT)
                  / │ \         grounding, abstention, injection resistance
                 /──┼──\        — doesn't fit the pyramid; tests a PROBABILISTIC
                /   │   \       component against guardrails, not a deterministic
               / LOAD│    \      function against an expected value
              /──────┼─────\
             /  SECURITY/   \   SECURITY/ISOLATION (§6 — BUILT)
            / ISOLATION TESTS \  release-blocking; the platform's #1 guarantee
           /────────────────────\
          /                       \  INTEGRATION TESTS (§5 — BUILT)
         /   INTEGRATION TESTS      \  real Postgres via testcontainers;
        /─────────────────────────── \  RLS-coverage meta-test; no-N+1 checks
       /                               \
      /          UNIT TESTS              \  UNIT TESTS (§4 — BUILT)
     /───────────────────────────────────  \ pure rule/scoring functions;
                                              deterministic, fast, no I/O
```

The classic pyramid (many cheap unit tests, fewer integration tests, fewer still end-to-end tests) describes §4–§5 well. It does not describe §9 (AI evaluation) or §10 (load testing) at all — both are organized around different axes (probabilistic correctness; performance under realistic concurrency) that a "how many and how fast" pyramid doesn't capture. This chapter treats them as genuinely distinct categories rather than forcing them into pyramid layers they don't fit.

---

### 2. Design tenets specific to testing

- **Test the guarantee, not the implementation.** A good test for "tenant isolation holds" asserts that tenant B's data is actually unreachable under a real adversarial scenario (Ch8 §10) — not that a specific function was called with specific arguments, which would pass even if the underlying guarantee silently broke via a different code path.
- **Meta-tests beat enumerated tests wherever a new instance of the same risk can appear without anyone remembering to add a test for it.** The RLS-coverage test (§5) doesn't test thirty-one named tables — it queries the database's own catalog for every table with a `tenant_id` column and checks each one, so table thirty-two is covered automatically, the day it's created, with zero additional test-writing.
- **A regression test is the second half of every bug fix, not an optional follow-up.** Chapter 12 §8's "name the bug" standard is only complete here: a fix without a test that would have caught the original bug is a fix that can silently regress.
- **Honesty about what's tested vs. what's hoped.** Where a testing category doesn't exist yet (AI evaluation, load testing), this chapter says so plainly and designs toward it, rather than implying coverage that isn't there.
- **No-N+1 is a correctness test, not a performance nice-to-have.** Per Chapter 12 §3, bounded-query batch behavior is a coding *standard*; the test that enforces it (§7) is therefore a correctness gate that blocks a merge, with the same seriousness as a logic-error test — not a benchmark that's nice to have green.

---

### 3. The acceptance-test discipline — numbered, phase-scoped, the definition of done

**The pattern, already running consistently across every implementation phase.** Each phase's specification ends with an explicit, numbered acceptance-test list — not a vague "make sure it works," but specific, checkable conditions (Phase 2's risk engine, for instance, lists fourteen: signal correctness, per-rule isolation, scoring/tiering exactness, determinism, idempotent recompute, recompute-on-import behavior, error isolation, tenant isolation, role scoping, minor handling, intervention lifecycle, config-driven behavior change, no-N+1, and audit correctness). **This numbered list *is* the phase's definition of done** — not a description of testing to aim for afterward, but the literal completion criteria agreed before implementation starts.

**Why this format, generalized as a standard rather than left as one phase's habit.** A numbered, specific acceptance list does two things a prose description cannot: it's checkable (each item is either demonstrably true or not, with no room for "mostly done"), and it's a contract the implementer and the spec author both agreed to *before* code was written — exactly the same discipline Chapter 12 §6's Change Orders apply to scope, applied here to correctness.

> **Ruling TEST-3.1 — Every future implementation phase or substantive feature ships with an explicit, numbered acceptance-test list as part of its specification, agreed before implementation begins; "done" means every numbered item is demonstrably true, not approximately true.** *Basis: Ch1 §4.4's explainability invariant, applied to the definition of completion itself; the project's own demonstrated practice across Phases 0–2.*

---

### 4. Unit tests

**What they cover.** Pure, deterministic logic with no I/O — rule evaluation (does `ATTENDANCE_BELOW_THRESHOLD` fire exactly when its condition holds, and not otherwise), scoring/tiering arithmetic (does a known finding set yield the exact expected score and tier), and the platform's explicit determinism guarantee (does evaluating identical typed inputs twice produce byte-identical output, every time).

**Why these specifically are unit-testable and most of the rest of the platform isn't.** Chapter 12 §3's purity-and-determinism coding standard ("the only non-determinism allowed is timestamp metadata, never an input to score or tier") is precisely what makes a function unit-testable in the cheap, fast, no-mocking sense — a function whose output depends only on its typed inputs needs no database, no fixtures beyond plain data, no testcontainer. The unit-test layer is, in effect, a direct dividend of the determinism standard Chapter 12 made binding for exactly this reason.

**What unit tests deliberately do *not* try to cover.** Anything touching RLS, real query behavior, or cross-row aggregation belongs in integration tests (§5) — a unit test that mocked the database to test "does the repository call the right query" would test a much weaker, less meaningful property than an integration test asserting the actual returned rows are correct under real RLS enforcement.

---

### 5. Integration tests — real Postgres, and the meta-test that scales with the schema

**Real infrastructure, not mocks — per Chapter 13's ADR-21, adopted here without re-deciding it.** Tests that need genuine database behavior run against real, ephemeral PostgreSQL instances provisioned by testcontainers — because RLS policies, real constraint enforcement, and actual query plans cannot be meaningfully approximated by a mock.

**The RLS-coverage meta-test — the chapter's single most valuable testing pattern, and worth explaining precisely why.** Rather than writing one test per known tenant-owned table ("does `students` have RLS enabled," "does `attendance` have RLS enabled," ... for every table by name), the actual test queries PostgreSQL's own system catalog (`pg_class`, `pg_attribute`, `pg_policies`) to find **every** table that has a `tenant_id` column, and checks that *each one* has RLS enabled, forced, and carries a policy — with an explicit, near-empty `EXEMPT_TABLES` dict for the rare legitimate exception, each entry requiring a written justification.

```
  WHY A SCHEMA-INTROSPECTING META-TEST BEATS AN ENUMERATED TEST LIST:

  An enumerated test ("test_students_has_rls", "test_attendance_has_rls", ...)
  only protects tables someone remembered to write a test for. The actual
  risk this test exists to catch — per its own stated rationale — is NOT a
  forgotten WHERE clause (FORCE RLS already backstops that, Ch8 §4); it's a
  FUTURE migration that adds a new tenant-owned table and forgets the RLS
  block entirely. An enumerated test list cannot catch a table that didn't
  exist when the list was written. A meta-test that asks the database
  "which tables currently have a tenant_id column" catches table #32 the
  day it's created, automatically, with ZERO new test code required.
```

**The `EXEMPT_TABLES` discipline — a small mechanism with an outsized integrity requirement.** The dict exists, empty by default, specifically so a legitimate exception (a table that genuinely needs no tenant scoping — the `tenants` table itself is the canonical example, per Chapter 4 §3) has a place to be recorded *with a reason*, rather than forcing the test to be disabled or weakened to accommodate it. The standard, stated as bluntly as the test's own comments state it: **do not add a table to this list to silence a failure without a real reason** — a failure here almost always means a table is missing its RLS block, and the fix is adding that block in a new migration, not exempting the table.

> **Ruling TEST-5.1 — Coverage-style invariants (every tenant table has RLS; every canonical table has a natural key; every new entity inherits the standard mixins) are tested via schema-introspecting meta-tests wherever the underlying risk is "a future addition might be missed," not via enumerated per-table test lists.** *Basis: Ch8 §4; the demonstrated value of catching table #32 automatically.*

---

### 6. Tenant isolation & security testing — the platform's #1 guarantee, tested at two levels

**Chapter 8 §10 already named these as release-blocking; this chapter is where their procedural detail lives.** Isolation is tested at **both** the database level and the API level, deliberately, because each level catches a different failure mode:

```
  DB-LEVEL ISOLATION TESTS (test_rls_isolation.py-style)
    test: with tenant A's context set, querying directly returns ONLY A's
          rows, even via raw SQL that bypasses the application's ORM layer
          entirely — this is what proves RLS itself, not application code,
          is the actual enforcement mechanism.
    test: with NO tenant context set at all, every protected table returns
          ZERO rows — proving the fail-closed default (Ch8 §4) is real,
          not just designed.

  API-LEVEL ISOLATION TESTS (per-endpoint, added as each endpoint ships)
    test: authenticated as tenant A, no endpoint — under any role, any
          query parameter combination — ever returns tenant B's data.
          This level exists because the DB-level tests alone wouldn't
          catch an application bug that, say, accidentally accepted a
          tenant_id from a request body instead of the verified JWT
          (Ch4 §2's "tenant id never originates from client input" rule,
          made testable rather than just stated).
```

**Why both levels, not just one — restated precisely because it's the chapter's central testing-strategy lesson.** A DB-level test alone wouldn't catch an application-layer bug that somehow constructed a query against the *wrong* tenant context correctly per RLS but incorrectly per business logic. An API-level test alone wouldn't catch an RLS misconfiguration on a table no current endpoint happens to expose yet, but a future one will. Testing both is the direct, executable expression of Chapter 8 §4's defense-in-depth argument — two independent layers, tested independently, so a gap in one is still caught by the other.

**Role-scoping and the 404-vs-403 contract get their own explicit test pattern.** Per Chapter 4 §5 and Chapter 7 §6: a faculty user sees only students within their own scope; a request for an out-of-scope student returns 404 (not 403 — existence hidden); a role lacking the capability outright (e.g., the `student` role attempting a faculty-only Phase 2 endpoint) returns 403. Both outcomes are explicitly, separately tested for every scoped endpoint — conflating them in a test (asserting only "the request failed") would miss exactly the distinction Chapter 7 §6 made binding.

**Minor-handling and consent-gate tests are a named, mandatory category for any feature touching student records — not just the risk engine's.** A student under 18 must resolve to `subject_minor_status='minor'`; an unknown date of birth must resolve to `minor` as the fail-safe default (Ch4 §6); the engine/alerts must never auto-create a parent-contact intervention for a minor; a manual parent-contact intervention for a minor without `guardian_consent_confirmed=true` must be rejected, and accepted (with the confirming user recorded) when present. **Any future feature that creates or surfaces a parent-facing action involving a student must include this exact test category**, not a feature-specific reinvention of it — the attribute (`subject_minor_status`) and the gate (`guardian_consent_confirmed`) are platform-wide (Ch4 §6), so the test pattern verifying them should be too.

> **Ruling TEST-6.1 — Tenant isolation is tested at both the database and API level for every new endpoint; role-scoping tests explicitly distinguish 404 (out-of-scope) from 403 (no capability) outcomes; any feature touching student records includes the minor-handling/consent-gate test category as a mandatory, not optional, addition.** *Basis: Ch8 §10; Ch7 §6; Ch4 §6.*

---

### 7. The no-N+1 performance test — a correctness gate, not a benchmark

**The pattern.** A batch operation that should issue a bounded number of queries regardless of how many entities it processes (a risk recompute across a cohort, an entity-resolution pass across an import batch) is tested by actually counting queries — via a SQLAlchemy event listener attached for the duration of the test — and asserting that count does **not** scale with the number of entities processed.

**Why this is filed under correctness, restated from Chapter 12 §3, not repeated as a separate performance concern.** A function that issues one query per student rather than one bulk query per batch isn't merely "slower" in some abstract sense — at real tenant scale (thousands of students per recompute), it's the literal difference between a request that completes and one that times out or starves other tenants' requests sharing the same database connection pool (Ch7 §10, Ch3 §3's per-tenant fairness concerns). The test is a correctness gate for exactly this reason: an accidental per-row query inside a loop is a bug whose blast radius only becomes visible at production data volume, which is precisely the kind of bug a fast, cheap, every-CI-run test should catch before it ever reaches that volume.

---

### 8. Regression tests — the second half of every bug fix

**The standard, made explicit and binding, not just implied by Chapter 12 §8.** A bug found outside a change's named scope is fixed *and* given a dedicated regression test that specifically reproduces the original failure condition — not just a general-purpose test that happens to exercise the same code path. Three real instances already demonstrate the pattern:

```
  AUDIT-ACTOR BUG (Ch8 §7)           a dedicated test asserting the pipeline-
                                     loaded canonical row's audit entry carries
                                     the REAL importing user's id, not a stale/
                                     null value — added specifically because
                                     the original bug was exactly this.

  REDIRECT-TIMING BUG (Ch9 §11)      a Playwright-verified assertion that
                                     history.state after a deliberate sign-out
                                     carries no stale "from" location — added
                                     specifically because the original bug
                                     was exactly this race.

  DECIMAL/JSONB BUG (Ch12 §8)        a test exercising the specific row shape
                                     (a Decimal-typed fee/mark value flowing
                                     through cleaning into JSONB storage) that
                                     originally failed silently.
```

**Why "a test that exercises the same code path" isn't good enough — the standard is specific, not general.** A bug fix validated only by "the existing test suite still passes" proves the fix didn't break anything *already tested* — it proves nothing about whether the *original failure condition* can recur. A dedicated regression test, by contrast, is specifically constructed to fail against the pre-fix code and pass against the post-fix code — which is the only way to be confident the actual bug, not just a symptom near it, is what got fixed.

> **Ruling TEST-8.1 — Every bug fix, whether found in-scope or via Chapter 12 §8's "name the bug" practice, ships with a dedicated regression test reproducing the original failure condition specifically — general test-suite passage is not treated as sufficient evidence the bug is fixed.** *Basis: Ch12 ENG-8.1, completed; the demonstrated pattern across three real bugs.*

---

### 9. AI evaluation — not yet built, designed against Chapter 3's guardrail table

**Honest status, consistent with Chapters 9–11's practice.** No AI evaluation suite currently exists, because the AI plane's implementation (Chapter 3) is itself still primarily a design, not a built system, per this Bible's own running distinction between "built" and "designed-for." This section specifies what the suite should verify once there's an AI plane to test.

**Why AI evaluation doesn't fit the unit/integration pyramid (§1, restated with the actual reason).** A unit test asserts a deterministic function returns an exact expected value; an AI evaluation test asserts a *probabilistic* component's output satisfies a *property* (grounded, or correctly abstained, or didn't leak scope) across a representative set of inputs, often without one single "correct" output to assert equality against. The right mental model is closer to the security/red-team testing this chapter already does at scale (§6) than to a unit test — adversarial and property-based, not input-output-pair-based.

```
  GROUNDING & ABSTENTION CORRECTNESS (Ch3 §8, Ch11 §6)
    a curated test set of questions answerable from the governed semantic
    layer (expect a grounded, correct answer) and questions NOT answerable
    from it (expect abstention, "I can't answer that from your data") —
    testing BOTH directions matters: a suite that only checks abstention
    on genuinely unanswerable questions wouldn't catch a model that's
    started abstaining on questions it actually CAN answer, which is its
    own failure mode (a falsely over-cautious system is also wrong).

  OUTPUT VALIDATION REJECTION (Ch3 §8)
    deliberately construct cases where a model's draft narration WOULD
    contain a figure not present in the grounded result set, and assert
    the output-validation guardrail actually strips/blocks it before
    reaching a test assertion — this is the test-suite equivalent of
    Ch11 §6's "output-validation-rejection rate" metric, but exercised
    deliberately rather than waited for in production traffic.

  PROMPT-INJECTION RESISTANCE (Ch8 §8)
    a versioned, growing set of adversarial prompts specifically attempting
    scope escalation, cross-tenant data extraction via crafted questions,
    or instruction-override attempts embedded in RAG-retrieved content —
    each test asserts CONTAINMENT (the structural argument of Ch8 §8 holds:
    privilege was never available to escalate, regardless of whether the
    model's language output sounded compliant with the injected instruction).
    This is where Chapter 8's "standing red-team" PRACTICE becomes a
    versioned, repeatable, CI-runnable TEST SUITE rather than only a
    periodic manual exercise — the practice and the suite should grow
    together, with every red-team finding becoming a new permanent test
    case, not a one-time report.

  TENANT ISOLATION VIA THE AI PLANE SPECIFICALLY
    distinct from §6's general isolation tests: a question crafted to try
    to retrieve another tenant's RAG-indexed evidence, or to manipulate
    tool-call arguments toward another tenant's data, asserting the
    tenant-filter-before-similarity-search guarantee (Ch6 §7) and the
    server-side-scope-injection guarantee (Ch3 §4) both hold under
    adversarial pressure, not just under a well-behaved request.
```

**Every AI guardrail in Chapter 3 §8's table should map to a test category here, the same way Chapter 11 §6 mapped each one to a monitoring metric.** This is a deliberate, explicit parallel: Chapter 11 asks "is this guardrail holding *in production, right now*"; this chapter asks "would this guardrail hold against a *deliberately constructed* adversarial or edge case, *before* it ships." Both are necessary; neither substitutes for the other.

> **Ruling TEST-9.1 — AI evaluation, when built, is organized around Chapter 3 §8's guardrail table (grounding/abstention correctness in both directions, output-validation rejection, prompt-injection resistance, AI-plane-specific isolation), tested as adversarial/property-based cases rather than input-output unit tests; every red-team finding (Ch8 §8) becomes a permanent, versioned test case, not a one-time report.** *Basis: Ch3 §8; Ch8 §8; Ch11 §6's parallel monitoring structure.*

---

### 10. Load testing — not yet built, targeted against Chapter 11's SLOs

**Honest status.** No load-testing practice or tooling currently exists. This section names what it should target once built, using Chapter 11's SLO definitions as the concrete numbers to test against rather than inventing new targets here.

```
  READ/ASK PATH LOAD TEST
    simulate realistic concurrent NL-query and dashboard traffic; assert
    the read/ask latency SLO (Ch11 §7) holds at the target percentile —
    and, separately, that it holds specifically WHILE an ingestion batch
    is concurrently running, since that's the scenario the read-replica
    decoupling (Ch2 AD-5.1, Ch6 §8) exists to protect against. A load
    test that never runs ingestion and reads concurrently would never
    actually exercise the architectural decision it's supposed to verify.

  INGEST/COMPUTE PATH LOAD TEST
    simulate a realistically large import batch (the volume a real
    college's annual data actually represents, not a toy fixture size);
    assert the freshness SLO (Ch11 §7) holds — time-to-COMPLETED and
    time-to-risk-recompute-finished, not a latency percentile, matching
    Ch11 §4's explicit point that this path's health is a different shape.

  PER-TENANT FAIRNESS UNDER LOAD
    simulate one tenant generating heavy load (a large import, a burst of
    AI queries) CONCURRENTLY with a second tenant's normal usage; assert
    the second tenant's experience is unaffected — this is the load-test
    verification of Ch7 §10's rate limiting and Ch3 §3's per-tenant quotas,
    neither of which can be meaningfully verified by a single-tenant load
    test, however large.
```

**Why per-tenant fairness specifically needs its own load-test category, not just an aggregate-throughput number.** An aggregate load test ("the platform handles N requests/second") can pass while a single noisy tenant degrades every other tenant's experience — exactly the pooled-multi-tenancy risk Chapter 2 AD-6.1 and Chapter 7 §10 already named as a concern at the design level. A load test that doesn't specifically construct a multi-tenant noisy-neighbor scenario hasn't actually tested the fairness guarantee, no matter how high its aggregate throughput number looks.

> **Ruling TEST-10.1 — Load testing, when built, targets Chapter 11's per-path SLOs directly (not invented separately) and includes a dedicated multi-tenant fairness scenario as a first-class test category, not an afterthought to an aggregate-throughput number.** *Basis: Ch11 §7; Ch2 AD-6.1; Ch7 §10.*

---

### 11. CI gating — mapping this chapter's tests to enforcement

**Every test category in this chapter has a defined relationship to the CI gates Chapter 10 already established, restated here only to close the loop, not to re-decide it.** Unit and integration tests (§4–§5) run in the `pytest` job of `backend-ci.yml`; the RLS-coverage meta-test and the DB/API-level isolation tests (§6) are part of that same suite and are, per Chapter 8 §10, release-blocking without exception — a failing isolation test is never merged around, regardless of how unrelated the rest of the change appears to be. The no-N+1 query-count tests (§7) are ordinary `pytest` tests with no special CI treatment beyond being tests that must pass, consistent with §2's "correctness gate, not benchmark" framing. AI evaluation and load testing (§9–§10), once built, belong in their own CI stages — likely not run on every single commit (cost and runtime), but on a defined cadence (e.g., nightly, or pre-release) that Chapter 10's roadmap item for "metrics, tracing, formal SLOs" (Ch11 §12) should be extended to include.

---

### 12. Failure & degradation — when the test environment itself fails

| Failure | Behaviour | Why |
|---|---|---|
| **Docker/testcontainers unavailable in CI** | The test job fails loudly, not silently skips — a CI environment that can't provision its test database is a broken CI run, not a green one with reduced coverage. | A silently-skipped integration test suite is worse than a visibly-failed one; the former hides exactly the regression this chapter exists to catch. |
| **A flaky test (intermittent, non-deterministic failure)** | Investigated and fixed at its root cause — Chapter 12 §3's purity/determinism standard means a genuinely flaky test in this codebase is itself almost always a real bug (hidden non-determinism) in the code under test, not an acceptable cost of testing. Re-running until green is explicitly not the standard. | A flaky test masking a real non-determinism bug is the testing-chapter mirror of Chapter 12 §3's "the only non-determinism allowed is timestamp metadata" rule. |
| **`EXEMPT_TABLES` (§5) starts accumulating entries without strong justification** | A code-review-level signal that the RLS-coverage test's integrity is eroding — reviewed specifically for whether each entry's stated reason actually holds, not rubber-stamped. | The meta-test's entire value depends on this list staying near-empty and well-justified; this is the one place a "test passing" status can be quietly hollowed out from inside. |
| **An AI evaluation test (once built) shows a guardrail failing under a new adversarial prompt** | Treated with the same severity as a failing isolation test — added immediately as a permanent regression case (§9), not patched around with a narrower prompt filter that avoids the specific test case without fixing the underlying containment property. | Ch8 §8's structural-containment argument must hold against the *property*, not just against the specific prompts already in the suite. |

---

### 13. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **TEST-3.1** | Definition of done | Numbered, specific, pre-agreed acceptance-test lists per phase/feature | Vague prose descriptions of intended behavior | Ch1 §4.4; demonstrated practice |
| **TEST-5.1** | Coverage-style testing | Schema-introspecting meta-tests for "every X has property Y" invariants | Enumerated per-instance test lists | Catches future additions automatically |
| **TEST-6.1** | Isolation/security testing | Both DB-level and API-level isolation tests; explicit 404-vs-403 distinction; mandatory minor-handling category for student-record features | Testing only one level; conflating 404/403 outcomes | Ch8 §10; Ch7 §6; Ch4 §6 |
| **TEST-8.1** | Regression testing | Every bug fix ships a test reproducing the specific original failure | General test-suite passage as sufficient evidence | Ch12 ENG-8.1 |
| **TEST-9.1** | AI evaluation | Organized around Ch3 §8's guardrail table; adversarial/property-based; red-team findings become permanent tests | Input-output unit testing for a probabilistic component | Ch3 §8; Ch8 §8 |
| **TEST-10.1** | Load testing | Targets Ch11's per-path SLOs directly; dedicated multi-tenant fairness scenario | Aggregate-throughput-only load testing | Ch11 §7; Ch2 AD-6.1 |

---

### 14. How this chapter governs the rest of the Bible

- **Chapter 3 (AI Platform)**'s guardrail table (§8) and **Chapter 11 (Observability)**'s AI monitoring metrics (§6) are both directly operationalized as test categories here (§9) — a future change to either should be paired with a corresponding test-suite update.
- **Chapter 8 (Security Architecture)**'s isolation tests (§10) are restated here with full procedural detail (§6) — this chapter doesn't redefine them, it specifies exactly how they're structured and why both levels matter.
- **Chapter 10 (DevOps & Cloud Architecture)**'s CI gates are where every test category in this chapter actually executes (§11) — this chapter defines *what* must be tested; Chapter 10 defines *how* and *when* in the pipeline.
- **Chapter 12 (Engineering Standards)**'s coding standards (§3, bounded queries, explainability assertions, purity/determinism) are the properties this chapter's unit and no-N+1 tests directly enforce — and ENG-8.1's "name the bug" standard is completed by this chapter's TEST-8.1 regression-test requirement.
- **Chapter 15 (Implementation Roadmap)** should schedule AI evaluation (§9) and load testing (§10) as named near-term milestones, alongside the other "designed, not yet built" items already tracked from Chapters 9–11.

New testing tensions are added to this ledger (§13) by amendment.

---

### 15. Sign-off

This chapter is normative once ratified. Amendments to the isolation-testing requirements (§6) or the AI-evaluation guardrail mapping (§9) require Architecture Review Board approval.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Engineering Manager | | ☐ Approve ☐ Revise | |
| Principal Security Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |

---

*End of Chapter 14 — Testing & Quality Strategy.*
