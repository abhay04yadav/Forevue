# AI ERP Copilot — Architecture Bible

## Chapter 12 — Engineering Standards

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The day-to-day engineering discipline that keeps the architecture in the preceding eleven chapters from eroding one commit at a time — coding standards, linting/type-checking policy, dependency discipline, Git workflow and change-management practice, the ADR *process* (not its content), and documentation conventions.
**Depends on:** Chapter 1 (driver #4 maintainability, the SOLID/Clean-Architecture principles), Chapter 6 (the migration/schema-evolution discipline this chapter's coding standards extend to application code generally), Chapter 8 (the audit-as-accountability pattern this chapter's "name the bug" practice mirrors at the code level), Chapter 10 (the CI gates — ruff hard, mypy advisory-with-tracked-backlog — and the one-commit-per-change standard this chapter adopts as binding, not re-decides).
**Relationship to Chapter 13 (Technology Decision Records):** This chapter owns the **ADR process and format** — how a decision gets written down, what makes it a good record, where it lives. Chapter 13 owns the **content** — the actual catalog of *which* technology was chosen over *which* alternative and *why*. A reader looking for "why PostgreSQL over MongoDB" goes to Chapter 13; a reader asking "what format should I use to write my own ADR for a decision not yet in this Bible" comes here.
**A note on this chapter's evidence base.** Where earlier chapters described *target* architecture, this chapter is unusually close to the ground — most of what follows is a direct transcription of practices already running in this project's own implementation specs and CHANGELOG, formalized as binding standards rather than re-invented. The project has, in effect, already been writing this chapter in practice; this is where that practice gets named, generalized, and made citable.

---

### 0. How this chapter builds on Chapters 1–11

Three commitments become daily engineering practice here:

1. **"Enterprise Maintainability"** (Ch1 §3 Group C/D) is not a value that lives in architecture diagrams — it lives in whether the next engineer touching a file can trust its types, its layering, and its history. This chapter is where that trust is earned, line by line.
2. **"Explainability is invariant"** (Ch1 §4.4) applies recursively to the codebase itself: a decision made where a spec was silent must be *explainable* — reasoned from the spec's own constraints and recorded — not a silent guess a future engineer has to reverse-engineer.
3. **"Name the bug, don't silently patch"** — a practice this Bible has already shown in action (Ch8 §7's actor-attribution fix, Ch9 §11's redirect-timing fix) is formalized here as a standing engineering value, not an incidental habit of the people who happened to write those fixes.

The organizing idea:

> **Every gap, every ambiguity, and every bug is an opportunity to either erode the architecture quietly or strengthen it visibly — and this project has consistently chosen the second path. This chapter exists to make that choice the default for every future engineer, not a virtue that depended on who happened to be writing the code that day.**

---

### 1. Engineering standards at a glance

```
  CODING STANDARDS (§3)              LINT/TYPE GATES (§4)         DEPENDENCY DISCIPLINE (§5)
  typed, layered, explainable-       ruff hard / mypy advisory-    zero new deps by default;
  in-code, no magic numbers,         with-tracked-backlog          even dev-only additions
  bulk-not-N+1, defense in depth     (Ch10 DEVOPS-3.1)              need explicit confirmation
              │                              │                            │
              └──────────────┬───────────────┴────────────────────────────┘
                              ▼
                    GIT WORKFLOW & CHANGE DISCIPLINE (§6)
                    one-commit-per-change · scoped "Change Order" units ·
                    numbered CHANGEs · named file scope · acceptance criteria
                              │
                              ▼
        TWO RECURRING PRACTICES THIS BIBLE HAS ALREADY MODELED:
        "decisions where the spec was silent" (§7)    "name the bug" (§8)
        reasoned, recorded, listed for review          fixed AND explained, never
                                                        silently patched around
                              │
                              ▼
                    ADR PROCESS (§9) & DOCUMENTATION STANDARDS (§10)
                    this Bible's Ruling-X.X pattern IS the ADR format;
                    docstrings cite spec sections; CHANGELOG per phase
```

---

### 2. Design tenets specific to engineering standards

- **Standards should describe what the project already does well, then make it binding for what comes next.** Nearly every standard in this chapter already exists as a *practice* somewhere in this codebase's history; the chapter's job is to generalize it, name it, and remove the possibility that it quietly lapses once the people who established it move on.
- **A rule without a stated reason is a superstition.** Every coding standard below states *why*, not just *what* — because an engineer who understands why `B008` is ignored in lint config (it's FastAPI's intended DI pattern, not a bug) will make the right call in a similar judgment situation that no rule explicitly covers; an engineer who only memorized "ignore B008" will not.
- **Honesty about technical debt beats either extreme.** A pre-existing backlog of type errors is reported in categories, not mass-suppressed with blanket ignores and not used as an excuse to disable the check entirely — the same disciplined middle this Bible has applied to every other named gap (Ch6's schema gaps, Ch9's stack mismatch, Ch10's cold install).
- **A decision and its reasoning are inseparable.** Whether it's an architecture-level ruling (this Bible's `Ruling-X.X` pattern) or a code-level "the spec was silent here, so I did X because Y," the standard is the same: state the decision, state the reasoning, make both visible to the next reader.

---

### 3. Coding standards

**Typing is complete, not aspirational.** Full type hints on every function and method; SQLAlchemy mapped classes use typed `Mapped[...]` annotations; code is held to be mypy-clean *under the repository's own configured rules* (§4) — not under an idealized strict mode the project hasn't actually adopted yet.

**Purity and determinism where correctness must be provable.** Functions that compute something a person's risk tier or an eligibility verdict depends on are pure and clock-independent — the *only* permitted non-determinism is metadata like a timestamp, and a timestamp is never itself an input to a score or a tier. This is the coding-standard expression of Chapter 1's "deterministic rules over LLM for eligibility decisions" principle (Ch1 §3 Group B) and Chapter 3's MR-4 ruling, made literal at the function-signature level: if a function's output could differ between two calls with identical typed inputs, it does not belong in the deterministic-adjudication path.

**No magic numbers — config, not constants buried in logic.** Every threshold, weight, or cutoff that could plausibly differ per tenant or change as the product evolves comes from configuration, not a literal embedded in a conditional. A named constant is acceptable only for a genuinely fixed default seed value, never for a business rule's actual threshold.

**Explainability invariants are asserted in code, not just designed in documentation.** Chapter 1 §4.4 says no score without findings; the coding standard is that this is an **assertion in the code itself** — a risk assessment with a non-`low` tier and an empty findings list, or a score that doesn't equal the (clamped) sum of its findings' contributions, should be a condition the code actively checks and rejects, not a property the architecture merely hopes holds because the design intends it to.

**Idempotency and versioning are stamped, not implied.** Every computed, versioned artifact (a risk assessment, an entity-resolution match) stamps the model/config version that produced it; recomputing on unchanged input writes nothing new — this is Chapter 6's natural-key-upsert idempotency principle (DATA-3.1), restated as a coding standard for *computed* state, not just *ingested* state.

**Performance is a correctness property for batch operations, not an afterthought.** Any operation that runs once per entity in a batch (a recompute across a cohort, a bulk resolution pass) issues a **bounded** number of database queries, independent of how many entities are in the batch — enforced, not just hoped for, by a query-count assertion in the test suite (§4's testing tie-in). An engineer introducing an accidental per-row query inside a loop should see a test fail, not discover the regression in production under real data volume.

**Defense in depth is the default posture for every new mutable table.** RLS is enabled (Ch8 §4 Layer 1) and the repository layer adds an explicit tenant filter (Layer 2) on every new table without exception; role/attribute scoping (Ch4 §5/§6) is enforced server-side, never trusted from client input beyond what the caller's actual role and attributes permit.

**Error handling isolates failure to its smallest meaningful unit.** A batch operation processing many independent items (a recompute across many students, an import processing many rows) isolates one item's failure from the rest — one student's evaluation raising an exception is recorded against that student and the batch continues for everyone else, exactly mirroring Chapter 5 §7's per-row quarantine principle, now stated as a general coding standard rather than a pipeline-specific rule.

**Layering and dependency direction are not suggestions.** The established layering — `api/routes` → `services` → `repositories` → `models`, with Pydantic `schemas` strictly for request/response DTOs, never doubling as the ORM layer — is followed for every new module, and **dependencies between sibling modules are kept one-directional**: a module that calls into another (e.g., the ingestion pipeline triggering a risk recompute) is never called back by the module it calls. A dependency cycle between two services is treated as a design smell to resolve, not a pattern to route around with a workaround import.

> **Ruling ENG-3.1 — Coding standards (full typing, determinism in adjudication paths, config-not-constants, explainability assertions in code, idempotent versioned writes, bounded-query batch operations, defense-in-depth on every new table, per-item error isolation, one-directional module dependencies) are binding on all new code without exception, and are the baseline against which code review checks every change.** *Basis: Ch1 driver #4; the project's own already-demonstrated practice, generalized.*

---

### 4. Linting & type-checking standards

**The actual configuration, stated as a standard, not just a tool setting.** `ruff` selects `E` (pycodestyle errors), `F` (pyflakes), `I` (import sorting), `B` (bugbear), and `UP` (pyupgrade) rule sets; `mypy` enables `disallow_untyped_defs` and `check_untyped_defs`, with `ignore_missing_imports` for third-party packages genuinely lacking type stubs. Neither tool runs in `--strict` mode — a deliberate choice (§4's "pragmatic, not idealized" tenet) to keep the bar achievable and honestly enforced rather than aspirational and routinely bypassed.

**Every lint-rule exception is documented with a reason, never a bare disable.** The one standing exception in the current config — `B008` (flagging a function call as a default argument) is ignored globally, because it would otherwise flag FastAPI's own intended dependency-injection pattern (`Depends(...)` as a default argument) as a bug. The standard this generalizes: **a global rule exception is acceptable when the rule's premise genuinely doesn't apply to a specific framework pattern in use, and only when that reasoning is written down at the point of exception** — not when a rule is merely inconvenient for a specific piece of code, which calls for a narrow, commented, line-level exception instead (see below).

**Targeted exceptions over blanket suppressions, always.** Where a third-party stub is genuinely missing or a specific line needs an exception mypy/ruff can't be configured to grant globally, the standard is a **targeted, commented** `# type: ignore[specific-code]` or `# noqa: SPECIFIC` at that line — stating which check is being overridden and, briefly, why — never a bare `# type: ignore` that silences every possible error at that location, present and future.

**The technical-debt-backlog discipline, restated as a binding standard, not a one-time event.** When type-checking was first enforced against an existing codebase, a real backlog of pre-existing errors surfaced. The standard that was followed — and that this chapter now makes binding for any future similar situation — is precise: **report the count and the categories; do not mass-suppress; fix what's actually in scope for the current change; leave the rest as an explicitly tracked, categorized backlog** (Ch10 DEVOPS-3.1's "advisory until the backlog clears, then blocking" is the CI-policy expression of this same standard). A future engineer encountering a similarly large pre-existing issue count when turning on a new check should follow the identical pattern: categorize, report, fix what's in scope, track the rest — not silently widen the ignore list to make the count disappear.

**New errors introduced by a change are always fixed, never reported-and-left, regardless of whether the backlog overall is fixed yet.** The standard draws a clear line between *inherited* debt (categorized, tracked, paid down deliberately) and *newly introduced* issues (fixed before the change merges, every time) — conflating the two would let "there's already a backlog" become an excuse for adding to it.

> **Ruling ENG-4.1 — Lint/type exceptions require a stated reason at the point of exception; global exceptions are reserved for genuine framework-pattern mismatches, never code-specific convenience; pre-existing backlogs are categorized and tracked, never mass-suppressed; new code introduces zero new lint/type errors regardless of backlog state.** *Basis: Ch10 DEVOPS-3.1; honest incrementalism over either extreme.*

---

### 5. Dependency discipline

**Zero new dependencies is the default assumption for any change, not an aspiration.** A change that accomplishes its goal using only what's already in the dependency tree is preferred over one that reaches for a new package, even a small one — every dependency is a future maintenance, security-patching, and version-compatibility obligation (directly: Chapter 9 §3's CHANGELOG/lockfile mismatch and Chapter 10 §3's cold-install failure are *both*, concretely, dependency-related problems this exact discipline exists to minimize the frequency of).

**Adding any dependency — even a dev-only one — requires explicit, named confirmation before it happens, not after.** The standard observed in practice: a proposed change that would add a dependency states so explicitly, flags it as requiring confirmation, and proceeds only once that confirmation is given — `mypy` and `ruff` themselves were added to the project this way, as a dev-only optional-dependency group, with the addition itself called out and confirmed rather than silently bundled into an unrelated change.

**Runtime and development dependencies are kept in clearly separated groups, never conflated.** A linter or type-checker is a development-time tool with zero runtime footprint; it is added to a `dev`/optional dependency group specifically so that production deployments (Ch10 §6) never need to install, ship, or carry the attack surface of tooling that exists purely to help engineers write correct code before it runs.

> **Ruling ENG-5.1 — No dependency, runtime or dev-only, is added without explicit confirmation that names the dependency and its purpose; runtime and dev dependencies are kept in separate, never-conflated groups.** *Basis: Ch1 driver #4; the concrete cost already paid in Ch9/Ch10's named dependency-related gaps.*

---

### 6. Git workflow & change discipline

**One commit per logical change — binding, restated from Chapter 10, not re-decided here.** Chapter 10 §4 already ruled on this (DEVOPS-4.1) and named the one historical violation (the squashed Phase 3 frontend commit) as a recorded-but-not-retroactively-fixed gap. This chapter adopts that ruling as a coding-process standard without relitigating it — a reviewer, or a future `git bisect`, should be able to read history as a sequence of individually-reasoned changes.

**The "Change Order" as the project's actual unit of planning — a distinctive, worth-generalizing practice.** Rather than vague tickets, substantive changes in this project are specified as a structured **Change Order** document: a named, numbered list of discrete `CHANGE`s, each with (a) an explicit rationale ("why"), (b) an explicit, bounded file scope ("backend changes limited to: ..."), (c) explicit acceptance criteria/tests, and (d) — critically — an explicit **confirmation gate** flagged with a warning symbol wherever the change would do something risk-bearing (add a dependency, touch a destructive migration, touch files outside the named scope) that the engineer should not proceed past without checking first.

```
  CHANGE ORDER STRUCTURE (the pattern to reuse for future substantive work):

  CHANGE N — <short title>
    Why:           the problem this specific change solves
    Scope:         the exact files/modules this change may touch — and,
                   implicitly, the files it may NOT touch
    Confirmation:  ⚠️ flagged explicitly wherever risk requires a stop-
                   and-ask rather than proceed-by-default (new dependency,
                   destructive schema change, ambiguous test environment)
    Acceptance:    the specific, checkable tests/conditions that define
                   "done" for this CHANGE — not a vague description of
                   intended behavior
```

**Why this is worth formalizing as a standard rather than leaving as an organic habit.** A vague ticket ("improve risk engine error handling") invites scope creep and an undocumented decision trail; a Change Order with a named scope and explicit acceptance criteria makes "did this change do what it said, and only what it said" a checkable fact rather than a judgment call — directly serving the same auditability goal Chapter 8's data-layer audit log serves for production data, applied here to the *engineering process* that produces the code in the first place.

> **Ruling ENG-6.1 — Substantive changes are specified as Change Orders (named rationale, bounded scope, explicit confirmation gates for risk-bearing items, checkable acceptance criteria) rather than open-ended tickets; one-commit-per-change (Ch10 DEVOPS-4.1) remains binding without exception going forward.** *Basis: Ch1 driver #4; the project's own demonstrated practice across multiple phases.*

---

### 7. "Decisions where the spec was silent" — a standing engineering practice, named

**The pattern, observed repeatedly across this project's own history, formalized as a standard rather than left as an emergent habit.** No specification anticipates every situation an engineer will actually encounter while implementing it. The discipline this project has consistently followed when a spec is silent on something a real implementation needs to decide:

```
  1. REASON from the spec's own stated constraints — never guess from
     outside context, and never default to "whatever's easiest."
     (e.g., login requiring a tenant_slug wasn't invented; it was FORCED
     by the spec's own UNIQUE(tenant_id, email) constraint — the decision
     follows necessarily from a rule already written down elsewhere.)
  2. RECORD the decision explicitly, numbered, in the CHANGELOG — not
     buried in a commit message or, worse, left undocumented entirely.
  3. LIST it for review — a decision made this way is presented as a
     decision THAT WAS MADE, available to be challenged or confirmed,
     not retroactively defended only if someone happens to ask.
```

**This Bible has practiced exactly this discipline throughout itself, and that's not a coincidence.** Chapter 6 §3.4's `semester_results`/`Faculty` schema gaps, Chapter 7 §4's API-versioning decision, Chapter 9 §3's CHANGELOG/lockfile stack mismatch, and Chapter 10 §3's cold-install root-cause-and-fix are all, structurally, instances of this exact three-step pattern applied at the architecture-documentation level rather than the code level: reason from existing constraints, record explicitly, flag for review rather than hide. **This chapter is where that recurring pattern across the whole Bible is named as the actual standard being followed, retroactively making visible something that was already true of how this entire document was written.**

> **Ruling ENG-7.1 — Any decision made where a specification, an earlier chapter, or an existing convention is silent follows the three-step pattern (reason from existing constraints, record explicitly and numbered, list for review) — at the code level via the CHANGELOG, and at the architecture level via this Bible's own ledgers.** *Basis: Ch1 §4.4's explainability invariant, extended to engineering decisions generally.*

---

### 8. "Name the bug, don't silently patch" — a standing engineering practice, named

**The pattern.** When a test (especially an acceptance test written for an unrelated change) surfaces a real, pre-existing bug, the standard observed — and now made binding — is: **fix it, and explicitly call it out as a bug found and fixed, separately from the change that was actually being made** — never silently absorb the fix into the surrounding diff as if it were just part of the planned work, and never work around the symptom without naming and fixing the actual root cause.

**Three real instances already in this project's own history, each following the identical shape.** Chapter 8 §7's audit actor-attribution bug (a context variable not propagating across the framework's copied execution contexts — found, root-caused against the runtime's actual behavior, fixed with a session-instance-based mechanism, and explicitly written up). Chapter 9 §11's stale post-sign-out redirect (a React commit-timing race — found via debug logging that confirmed actual event order, fixed with a mechanism that doesn't depend on the false assumption, written up as a generalizable lesson). And, surfaced during this project's own hardening work: a `Decimal`-to-JSONB serialization failure in the ingestion pipeline's cleaning phase — caught by a newly-written acceptance test unrelated to the bug itself, root-caused to a JSON encoder that doesn't know how to serialize Python's `Decimal` type, and fixed with a dedicated `to_jsonable()` conversion applied **only** at the JSONB-storage boundary (deliberately not applied to the validation dict upstream, which needs real `Decimal`/numeric types for its range checks) — written up explicitly as "a bug found and fixed along the way, not named in the change order," rather than quietly folded into the diff.

**Why this matters enough to be a named standard rather than just good instinct.** A silently-patched bug teaches nothing to the next engineer who hits a similar shape of problem; a *named* bug — root cause stated, fix explained, why the fix works at the specific boundary it was applied at — becomes a piece of institutional knowledge the next engineer can recognize when they see the same pattern again. This is precisely why Chapters 8 and 9 each drew an explicit "generalizable lesson" out of their respective bugs rather than treating them as isolated incidents — that habit is what this section formalizes as something every future bug-fix should do, not just the two this Bible happened to discuss in earlier chapters.

> **Ruling ENG-8.1 — A bug discovered outside a change's named scope is fixed and explicitly documented as a separate, named finding (root cause, fix, and why the fix is correct at its specific boundary) — never silently folded into the surrounding diff or worked around without explanation.** *Basis: Ch8 §7; Ch9 §11; the project's own repeated demonstrated practice.*

---

### 9. ADR process — the format, not the catalog

**This Bible's own `Ruling-X.X` pattern *is* this project's Architecture Decision Record format — already, by construction, not as a new thing to introduce.** Every chapter in this Bible has recorded its consequential decisions as a blockquoted ruling: a stated decision, the alternatives considered and rejected (with their trade-offs argued, not just listed), and a basis citing the principle or chapter that justifies the call. That **is** an ADR, formatted to live inline within the architecture document it belongs to rather than as a separate file disconnected from the context that produced it.

**Why inline, chapter-embedded ADRs, rather than a separate `/docs/adr/` directory of standalone files (a real comparison, not an assumed default).**

- *Option A — standalone ADR files, one per decision, in a dedicated directory, numbered sequentially regardless of which architectural area they touch.* The traditional pattern; works well when decisions are made by a team that doesn't otherwise maintain a single architecture narrative. Its cost here: a standalone file disconnects the decision from the surrounding reasoning (the principles, the comparison table, the chapter's other related rulings) that gives it meaning — a reader finds the "what" but has to go hunting for the "why this and not that, in this specific system's context."
- *Option B — decisions recorded inline, within the architecture chapter whose subject they belong to, each tagged with a chapter-prefixed ID (Ch1's `MR-*`, Ch2's `AD-*`, Ch3's `AI-*`, Ch4's `IAM-*`, Ch5's `INT-*`, Ch6's `DATA-*`, Ch7's `API-*`, Ch8's `SEC-*`, Ch9's `FE-*`, Ch10's `DEVOPS-*`, Ch11's `OBS-*`) — RECOMMENDED, and what this Bible has done throughout.* A reader gets the decision *and* its full surrounding context in one place; the chapter-prefixed ID still makes every ruling individually citable and searchable across the whole document, which is the property a separate-file system exists to provide in the first place — without paying the cost of disconnecting decision from rationale.

**The one place a standalone, catalog-style ADR document genuinely earns its keep: technology selection specifically, which is exactly what Chapter 13 is for.** A "why PostgreSQL, why FastAPI, why React" catalog benefits from being browsable as a single list precisely *because* its decisions cut across every architecture chapter rather than belonging to one — Chapter 13's job, not this chapter's.

**The format, made explicit so a future engineer writing a new ruling does it consistently.**

```
  > **Ruling <CHAPTER-PREFIX>-<N>.<M> — <the decision, stated as an
  >   instruction, not a question>.** *Basis: <citation(s) to the
  >   principle/chapter/driver that justifies it>.*

  Preceded, in the surrounding prose, by:
    - the alternatives genuinely considered (not a strawman list)
    - the trade-off each alternative carries
    - why the chosen option wins given THIS platform's specific
      constraints, not a generic "best practice" appeal
```

> **Ruling ENG-9.1 — Architecture-level decisions are recorded as inline, chapter-prefixed rulings (this Bible's established format) rather than standalone ADR files, except for technology-selection decisions specifically, which are catalogued separately in Chapter 13 because their relevance cuts across chapters.** *Basis: keeping decision and rationale co-located; Chapter 13's distinct cross-cutting purpose.*

---

### 10. Documentation standards

**Docstrings cite the specification section they implement — not just describe what the code does.** Every module and public function's docstring states its purpose **and** references the spec section that motivated it (e.g., "implements spec §6.3") wherever a governing spec exists. This is a small habit with an outsized payoff: a future engineer asking "why does this function work this way" has a direct pointer to the authoritative source, rather than having to trust that the code's current shape was always the intended one.

**The CHANGELOG is a living decision record, organized by phase, not a commit-message dump.** Each implementation phase appends its own section, structured around exactly the two recurring practices this chapter has now formalized (§7, §8): decisions made where the spec was silent, numbered and reasoned; bugs found and fixed, named and explained. A CHANGELOG built this way is itself a usable engineering artifact — a future audit, a new engineer's onboarding read, or this very Bible's own research process (every citation in this document chasing back to a CHANGELOG entry) all depend on the CHANGELOG actually containing reasoning, not just a list of file names that changed.

**The documentation hierarchy, stated explicitly so each layer's job is clear and non-overlapping.**

```
  THIS ARCHITECTURE BIBLE        the durable WHY — principles, constraints,
                                  cross-chapter rulings, the reasoning that
                                  should outlive any single implementation phase

  PHASE/IMPLEMENTATION SPECS     the WHAT for a specific build phase — concrete
  (e.g. IMPLEMENTATION_SPEC_*)   schemas, endpoints, file structure for that
                                  phase's scope

  CHANGE ORDERS (§6)             the HOW for a specific substantive change —
                                  scoped, with acceptance criteria

  CHANGELOG                       the RECORD of what actually happened — gap-
                                  filling decisions, bugs found, deviations
                                  from the spec, all reasoned and dated

  CODE DOCSTRINGS                the POINTER from a specific function back to
                                  the spec section that justifies its shape
```

Each layer answers a different question, and the standard is that a reader should never need to guess which layer to consult — durable principle → this Bible; what a phase was supposed to build → its spec; what actually got decided or fixed along the way → the CHANGELOG; why *this specific function* looks the way it does → its docstring.

> **Ruling ENG-10.1 — Docstrings cite governing spec sections; the CHANGELOG is structured around the §7/§8 practices (reasoned silent-spec decisions, named bug fixes) per phase; the five-layer documentation hierarchy (Bible → phase specs → change orders → CHANGELOG → docstrings) is maintained without layers collapsing into each other.** *Basis: Ch1 driver #4; the project's own already-functioning documentation practice, formalized.*

---

### 11. Failure & degradation — what happens when a standard is violated

| Failure | Behaviour | Why |
|---|---|---|
| **A PR introduces a new lint/type error** | Blocked by CI (Ch10's `backend-ci.yml`/the planned `frontend-ci.yml`) before merge — new errors are never added to the tracked backlog (§4). | New debt is fixed, not deferred, regardless of inherited-backlog state. |
| **A change adds a dependency without prior confirmation** | Flagged in review as a process violation; the change is not merged until the dependency is explicitly confirmed (§5), even if the dependency itself is reasonable. | The confirmation gate is about process discipline, not just outcome. |
| **A bug is found and silently patched without being named** | Caught in review by the absence of an explanation for a diff that doesn't match the stated Change Order scope (§6, §8) — a reviewer should ask "what is this unrelated-looking fix, and why isn't it called out." | The standard is enforceable specifically because Change Orders state scope explicitly — an unexplained out-of-scope diff is visible by construction. |
| **A decision is made where a spec is silent, without being recorded** | The CHANGELOG's phase-section structure (§10) makes an *absence* visible — a phase that shipped real gap-filling decisions with no corresponding CHANGELOG entries is itself a signal something wasn't documented. | Documentation standards make the absence of documentation detectable, not just the presence of bad documentation. |
| **An architectural ruling is made inline but never given a chapter-prefixed ID** | Inconsistent with §9's format; future cross-referencing (as this Bible does constantly, chapter to chapter) breaks because the citation has nothing stable to point to. | The ID is what makes a ruling citable across the whole document — without it, "see Chapter 6's decision about X" has no anchor. |

---

### 12. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **ENG-3.1** | Coding standards | Binding baseline (typing, determinism, no-magic-numbers, explainability-in-code, idempotent versioning, bounded-query batches, defense-in-depth, per-item error isolation, one-directional dependencies) | Leaving these as informal conventions | Ch1 driver #4 |
| **ENG-4.1** | Lint/type exceptions | Reasoned, documented exceptions only; backlogs categorized and tracked, never mass-suppressed; zero new errors regardless of backlog state | Blanket ignores; permanently advisory checks | Ch10 DEVOPS-3.1 |
| **ENG-5.1** | Dependency additions | Explicit confirmation required for any dependency, runtime or dev; groups kept separate | Silent/bundled dependency additions | Concrete cost already paid (Ch9/Ch10 gaps) |
| **ENG-6.1** | Change planning | Change Orders (scoped, confirmation-gated, acceptance-criteria-bound) + one-commit-per-change | Open-ended tickets; squashed multi-change commits | Ch10 DEVOPS-4.1 |
| **ENG-7.1** | Spec-silence decisions | Reason from existing constraints → record numbered → list for review, at both code and architecture level | Guessing; undocumented decisions | Ch1 §4.4 |
| **ENG-8.1** | Bug handling | Fix and explicitly name out-of-scope bugs found during other work | Silent patches; symptom workarounds | Ch8 §7; Ch9 §11 |
| **ENG-9.1** | ADR format | Inline, chapter-prefixed rulings; standalone catalog reserved for Chapter 13's technology decisions only | Separate ADR files for every decision | Co-locating decision and rationale |
| **ENG-10.1** | Documentation hierarchy | Five distinct layers (Bible/specs/change orders/CHANGELOG/docstrings), each with a non-overlapping job | Collapsing documentation into one undifferentiated source | Ch1 driver #4 |

---

### 13. How this chapter governs the rest of the Bible

- **Every prior chapter's `Ruling-X.X` entries** are retroactively confirmed by this chapter (§9) to be following the project's actual ADR standard, not an ad hoc choice made for this document alone.
- **Chapter 10 (DevOps & Cloud Architecture)**'s CI gates (DEVOPS-3.1, DEVOPS-3.2) are the automated enforcement mechanism for this chapter's lint/type standards (§4) — this chapter defines the standard; Chapter 10 defines how it's checked on every change.
- **Chapter 13 (Technology Decision Records)** is the one place a standalone, catalog-style decision record is appropriate per this chapter's own reasoning (§9) — Chapter 13 should explicitly reference this chapter's ADR-format discussion rather than re-deriving why its format differs from every other chapter's inline rulings.
- **Chapter 14 (Testing & Quality Strategy)** should treat this chapter's coding standards (§3 — bounded queries, explainability assertions, per-item error isolation) as a direct source of required test categories, not just a style guide.
- **Chapter 15 (Implementation Roadmap)** should track adoption of the Change Order practice (§6) and the documentation hierarchy (§10) for any future phase planning, alongside the other named near-term items from Chapters 9–11.

New engineering-standards tensions are added to this ledger (§12) by amendment.

---

### 14. Sign-off

This chapter is normative once ratified. Amendments to the ADR-format decision (§9) or the documentation hierarchy (§10) require Architecture Review Board approval.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Engineering Manager | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Solution Architect | | ☐ Approve ☐ Revise | |
| Principal DevSecOps Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |

---

*End of Chapter 12 — Engineering Standards.*
