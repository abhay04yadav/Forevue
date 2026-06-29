# AI ERP Copilot — Architecture Bible

## Chapter 11 — Observability & Operations

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** How the platform's behavior in production is understood — logging conventions, metrics, distributed tracing, AI-specific monitoring, and Service Level Objectives (SLOs) — and the operational practices (dashboards, alerting) built on top of them.
**Depends on:** Chapter 1 (Observability First, Ch1 §3 Group D's mandatory `tenant_id`/`model_version`/`config_version` log fields), Chapter 2 (the two-path request model §5, whose distinct shapes this chapter's SLOs must respect rather than flatten), Chapter 3 (the AI Gateway's audit fields — token counts, latency, cost, model tier — which this chapter repurposes as metrics inputs, and the guardrail table this chapter must make observable, not just designed), Chapter 8 (the audit log this chapter consumes as a monitoring input, and the standing AI red-team whose findings this chapter surfaces as a tracked signal), Chapter 10 (the health-check and structured-logging *capabilities* this chapter builds its actual logging/metrics/tracing practice on top of).
**Relationship to the existing build:** Structured logging with request-id and tenant-id context is **already implemented**. Metrics, distributed tracing, AI-specific monitoring, and formal SLOs are **not yet built** — this chapter is, honestly, more design-for-the-near-future than documentation-of-the-present, and says so plainly rather than implying otherwise.
**Boundary with Chapter 10 (DevOps & Cloud Architecture) — restated precisely.** Chapter 10 owns the infrastructure that makes the platform deployable and recoverable, and provides two specific capabilities this chapter depends on: health-check endpoints and structured log output. This chapter owns *understanding what's happening* on top of that infrastructure — turning raw signals into metrics, traces, dashboards, and the SLOs that define what "working correctly" means in measurable terms.

---

### 0. How this chapter builds on Chapters 1–10

Three commitments become concrete operational practice here:

1. **"Observability First"** (Ch1 §3 Group D) — restated precisely: *"you cannot operate a multi-tenant AI platform you cannot see into."* This chapter is where that principle stops being a value statement and becomes specific fields, specific dashboards, and specific alert thresholds.
2. **The two-path request model** (Ch2 §5) means observability cannot be one-size-fits-all: the synchronous read/ask path and the asynchronous ingest/compute path have fundamentally different notions of "healthy," and this chapter's metrics and SLOs (§4, §7) are built around that distinction rather than averaging across it.
3. **Every guardrail in Chapter 3's table (Ch3 §8) is a *design* claim until something measures whether it's actually holding in production.** This chapter's AI monitoring section (§6) is where "the model never asserts an ungrounded figure" becomes a measured rejection rate, not just an architectural intention.

The organizing idea:

> **A guarantee that isn't measured is a hope.** Every isolation boundary, every grounding guardrail, every latency target stated in an earlier chapter as an architectural property is, in this chapter, turned into something a dashboard can show as currently true or currently violated. Observability is not a separate concern bolted onto the architecture — it is how the platform proves, continuously, that its own stated guarantees still hold.

---

### 1. Observability at a glance

```
  RAW SIGNALS (Ch10's infrastructure capabilities)
  ─────────────────────────────────────────────────
  structured logs (tenant_id, request_id — BUILT)    health-check results (BUILT)
              │                                              │
              ▼                                              ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │  THIS CHAPTER — turning signals into understanding                  │
  │                                                                     │
  │  LOGGING (§3)         METRICS (§4)        TRACING (§5)              │
  │  context-rich,        golden signals,     end-to-end request        │
  │  PII-safe (BUILT)     per-path, AI-cost    flow, esp. the AI         │
  │                       (NOT YET BUILT)      pipeline (NOT YET BUILT)  │
  │                                                                     │
  │  AI-SPECIFIC MONITORING (§6)        SLOs (§7)                       │
  │  grounding/abstention rates,         per-path latency & freshness,  │
  │  cost/tenant, red-team findings      the isolation SLO (zero,       │
  │  as a tracked signal (NOT BUILT)     not a percentage)              │
  └──────────────────────────────┬────────────────────────────────────┘
                                 ▼
                    DASHBOARDS & ALERTING (§8)
                    engineering ops view + the same data, repurposed,
                    as the product's own "platform health" surface
```

---

### 2. Design tenets specific to observability

- **Measure the guarantee, not just the activity.** It is not enough to log that a query ran; the platform should be able to answer "what fraction of AI answers were grounded vs. abstained" and "has any cross-tenant read ever occurred" as standing, monitored facts — not facts only discoverable by reading code or running a one-off audit query.
- **Different paths, different health definitions.** A synchronous NL query's health is latency and correctness; an asynchronous ingestion batch's health is freshness and completeness. Forcing both into one generic "response time" metric would hide exactly the information an operator needs (Ch2 §5's two-path split, restated as an observability design constraint).
- **Cardinality is a cost, not a free dimension.** Tagging every metric with `tenant_id` is necessary for some questions (Ch8 §10's isolation guarantee) and dangerous for others (a metrics backend with one time-series per tenant per metric does not scale to a thousand colleges) — this chapter is explicit about which signals need per-tenant granularity and which need aggregate-with-drill-down instead.
- **Never log or expose what Chapter 8 protects.** Observability tooling is not exempt from the platform's own privacy rules — a log line, a trace span, or a dashboard that leaks PII or a minor's sensitive attribute is a Chapter 8 violation wearing an operations hat, not a separate category of acceptable exposure.
- **Observability infrastructure failing must never take the platform down.** A logging pipeline backlog or a metrics backend outage degrades the operator's *visibility*, never the platform's *function* — this is the same "failures are contained to their plane" discipline Chapter 2 established, applied to the observability plane itself (§10).

---

### 3. Logging

**What's built, precisely.** Every request runs inside Python's `contextvars`-backed `request_id` and `tenant_id` context, injected by a logging filter so **every log line, automatically**, carries `[request_id=... tenant_id=...]` — a developer writing a log statement doesn't need to remember to attach these; the logging configuration attaches them for every record regardless of where in the codebase the line is written.

**The mandatory field set, restated as binding rather than aspirational.** Chapter 1 (§3 Group D) specified that structured logs must carry `tenant_id` and, where relevant, `student_id`, `model_version`, and `config_version`. This is already true for `tenant_id`/`request_id` platform-wide; the Student Success Engine's own implementation spec extends the same discipline explicitly to its domain (`tenant_id`, `student_id`, `model_version`, and recompute-summary counts) — the pattern is established and this chapter's job is to ensure every future subsystem (the AI plane's eventual implementation, especially) inherits it rather than reinventing logging conventions per module.

**The one rule that overrides convenience.** Logs **never** contain secrets or full PII payloads — stated in the original implementation spec and restated here as a permanent constraint, not a Phase 0 starting point to be relaxed later. A debugging instinct to "just log the whole payload" is exactly the instinct this rule exists to override; the fields that matter for debugging (`tenant_id`, `request_id`, entity ids) are almost never the fields that carry PII risk, so the discipline costs little and protects a lot.

**What's missing, named honestly.** Centralized log aggregation and search (something an operator can actually query across all running instances) is not yet built — today's structured logs go to stdout, captured by whatever the deployment platform's default log collection provides (Ch10 §6), but there is no dedicated log-aggregation/search tooling. This is a near-term gap, not a structural one: because the logging *format* is already structured and context-rich, adding an aggregation backend later is additive — point the existing log stream at it — not a redesign.

> **Ruling OBS-3.1 — Structured logging's mandatory field set (`tenant_id`, plus `student_id`/`model_version`/`config_version` where relevant) and the never-log-secrets-or-PII rule are binding on every subsystem, present and future, without exception. Centralized log aggregation is a near-term infrastructure addition, not a redesign of the logging format already in place.** *Basis: Ch1 §3 Group D; Ch8's PII protections extended to the observability plane.*

---

### 4. Metrics

**Not yet built — designed here as the taxonomy the platform should instrument toward.** No metrics backend currently runs; this section specifies what should be measured once one does, organized by the same two-path split Chapter 2 established, because a single undifferentiated metric set would obscure more than it reveals.

```
  SYNCHRONOUS READ/ASK PATH (NL query, dashboards, boards — Ch2 §5)
  golden signals, the classic shape:
    LATENCY    p50/p95/p99 response time, split by whether the request
               touched the AI plane (Ch3) or was a direct role-scoped read
               (Ch2 §4.4) — these have very different latency budgets and
               averaging them together would hide an AI-plane regression
               behind a fast majority of plain dashboard reads.
    TRAFFIC    requests/sec, aggregate AND per-tenant (the per-tenant view
               is what makes Ch7 §10's rate-limiting and Ch3 §3's quota
               enforcement visible as currently-working, not just designed).
    ERRORS     rate of 4xx (capability/scope denials, expected) vs 5xx
               (platform failures, not expected) — conflating these would
               make a healthy access-control system look like an incident.
    SATURATION  connection pool usage, read-replica lag (Ch6 §8) — the
               leading indicator before latency actually degrades.

  ASYNCHRONOUS INGEST/COMPUTE PATH (ingestion, risk recompute — Ch2 §5)
  a different shape entirely — "freshness," not "speed":
    FRESHNESS   time from import RECEIVED to COMPLETED (Ch5 §7); time from
               import COMPLETED to risk recompute finishing (Ch2 §4.3) —
               this is the metric that actually matters for "is a college's
               data current," and a latency percentile on individual pipeline
               stages would miss it entirely.
    THROUGHPUT  rows processed per batch per unit time — the leading
               indicator for whether ingestion capacity needs to scale
               (Ch10 §7) before a backlog becomes visible as staleness.
    QUARANTINE RATE  fraction of rows quarantined per import (Ch5 §8) —
               a sudden spike is usually a source-format change, not a
               platform bug, but it needs to be visible either way.
    FAILURE RATE  fraction of batches reaching FAILED rather than
               COMPLETED (Ch5 §7) — should be near-zero in steady state;
               a sustained rise is an integration-layer health signal.
```

**Cardinality discipline — a real constraint at pooled-multi-tenant scale.** A metrics backend charges, operationally and financially, per unique time series. `tenant_id` as a label on every metric, at a thousand colleges, multiplies series count by a thousand per metric — workable for the metrics that specifically need per-tenant visibility (rate-limit/quota enforcement, per-tenant SLO tracking, §7) and wasteful for everything else. The discipline: **aggregate by default; tag with `tenant_id` only for metrics where per-tenant drill-down is the actual operational need**, with per-tenant detail available on-demand (a query-time filter against logs/traces) rather than pre-aggregated into every metric series.

> **Ruling OBS-4.1 — Metrics are organized around the read/ask vs. ingest/compute path split (Ch2 §5), not a single undifferentiated set; `tenant_id` is a metric label only where per-tenant visibility is the specific operational need (rate limiting, per-tenant SLOs), with broader per-tenant drill-down available via logs/traces on demand rather than universal per-tenant cardinality.** *Basis: Ch2 §5; cost and scalability of the metrics backend itself.*

---

### 5. Tracing

**Not yet built — and the case for it is strongest specifically for the AI request lifecycle.** A single NL query, per Chapter 3 §9's ten-step assembled request, passes through the Context Builder, the AI Gateway, Tool Calling, the grounding guardrails, and a second Gateway call for narration — a latency or correctness problem ("why did this answer take eight seconds," "why did this answer abstain when it shouldn't have") is close to undiagnosable from logs alone, because the relevant story is *the relationship between several steps across several modules*, which is exactly what distributed tracing is for and logging alone is not.

**The mechanism — extending what already exists rather than introducing something unrelated.** The platform already propagates a `request_id` through context for logging (§3); the natural extension is a trace context (a trace id plus per-step spans) propagated the same way, so each step of Chapter 3's assembled request (Context Builder build time, Gateway call latency and which model tier was used, Tool Calling's query execution time, the grounding check) becomes a span on one trace, queryable as a single connected story rather than reconstructed by grepping for a shared `request_id` across separate log lines.

**Why an open, vendor-neutral standard, not a proprietary one.** Per Chapter 1's vendor-independence ruling (Ch1 §8 MR-3, applied to the LLM provider, not the database) — the same reasoning extends naturally to tracing tooling: adopting OpenTelemetry's instrumentation API means the *means of capturing* a trace is decoupled from *where it's sent and visualized*, so a future change of observability backend is a configuration change, not a re-instrumentation of the codebase.

> **Ruling OBS-5.1 — Distributed tracing, when built, uses OpenTelemetry instrumentation, extending the existing request-id propagation pattern with trace/span context. The AI request lifecycle (Ch3 §9) is the first and highest-priority tracing target, given its multi-step, multi-module shape.** *Basis: Ch1 §8 MR-3's vendor-independence reasoning, applied to observability tooling; Ch3 §9's diagnosability need.*

---

### 6. AI-specific monitoring — making Chapter 3's guardrails observable

**The chapter's most distinctive section, because this is where a design promise becomes a measured fact.** Chapter 3 §8 listed ten guardrails as architectural commitments — server-side scope, allow-listed tools, grounding, abstention, output validation, advisory-only, egress minimization, isolation red-teaming. Each one of those is currently a *design property*; this section is where each becomes something a dashboard can show as "currently holding" or flag as "currently violated."

```
  GROUNDING & ABSTENTION (Ch3 §8)
    grounded-answer rate vs. abstention rate — what fraction of NL queries
    got a real answer vs. "I can't answer that from your data." A rising
    abstention rate isn't necessarily bad (it might mean users are asking
    things outside the governed schema) but it's a signal worth watching,
    and a NEAR-ZERO abstention rate combined with user complaints about
    wrong answers would be the early warning that grounding has a gap.

  OUTPUT VALIDATION REJECTIONS (Ch3 §8)
    rate at which a model's draft narration contained a figure not present
    in the grounded result set and was stripped/blocked before reaching the
    user. This metric, directly, is the running, continuous proof that
    "the model never asserts an ungrounded figure" (Ch1 §4.4) is actually
    enforced — not a one-time test result, but a live count.

  COST & MODEL TIER (Ch3 §3, §10)
    cost per query, per tenant (drill-down, not default-aggregated — §4's
    cardinality rule applies here, but cost specifically IS a per-tenant
    question worth the cardinality cost, since per-tenant cost is what
    Ch3 §10's tiering/caching levers are meant to control); model-tier
    distribution (what fraction of calls used the cheap vs. strong tier) —
    this is the metric that tells you whether Ch3's cost-tiering Gateway
    logic is actually routing correctly, not just configured to.

  CACHE EFFECTIVENESS (Ch3 §3, Ch6 §6)
    AI Gateway cache hit rate, per the tenant-partitioned cache Chapter 6
    built — a falling hit rate is an early signal of either a configuration
    regression or simply more unique queries than the cache was sized for.

  ISOLATION & SECURITY (Ch8 §8, §10)
    prompt-injection attempt rate and outcome (always "contained," per
    Ch8 §8's structural argument — a rising attempt count with a steady
    100% containment rate is a usage-pattern signal, not an incident; any
    non-contained outcome is a sirens-now incident, not a metric to trend).
    The standing red-team's findings (Ch8 §8) are tracked as a recurring
    operational input here, not a one-off report that gets filed and
    forgotten — a red-team program that doesn't feed back into a tracked
    signal isn't actually standing, it's just repeated.
```

**Why this section exists separately from general metrics (§4).** The AI plane is the platform's newest and least conventionally-understood component (Ch8 §8), and its guardrails are specifically the kind of property that *looks* fine from outside (a plausible-sounding answer) while silently failing inside (an ungrounded figure that happened to be correct anyway, or one that wasn't). General infrastructure metrics (§4) would never surface that distinction; only monitoring built specifically around Chapter 3's guardrail contract can.

> **Ruling OBS-6.1 — Every guardrail in Chapter 3 §8's table has a corresponding monitored metric once the AI plane is implemented; grounding/abstention rate and output-validation-rejection rate are the two highest-priority AI metrics, because they are the most direct, continuous proof that Ch1 §4.4's no-ungrounded-figures guarantee is actually holding in production.** *Basis: Ch3 §8; Ch1 §4.4; "a guarantee that isn't measured is a hope" (§0).*

---

### 7. SLOs — defined per path, with one that isn't a percentage at all

**Most SLOs are a target percentage over a time window — but not all of them should be, and naming the exception matters.**

```
  READ/ASK PATH LATENCY SLO
    e.g. "95% of NL queries return within N seconds, measured monthly" —
    the classic shape, set once real production load data exists to
    calibrate N against (not invented from first principles).

  INGEST/COMPUTE PATH FRESHNESS SLO
    e.g. "95% of import batches reach COMPLETED within N minutes of
    upload" and "95% of risk recomputes finish within M minutes of the
    triggering import's COMPLETED" — a freshness target, not a latency
    target, matching §4's distinct metric shape for this path.

  AI GROUNDING SLO
    e.g. "the output-validation-rejection rate (§6) stays below X%" —
    framed as an upper bound on a failure mode, not a target to hit,
    because the guardrail succeeding looks like a LOW number here, unlike
    every other SLO in this list where higher (more availability, more
    speed) is better.

  THE ISOLATION SLO — NOT A PERCENTAGE
    "zero cross-tenant data exposure events, ever" — Chapter 8 §10
    already established this as a release-blocking, continuously-tested
    invariant, not a target with an acceptable failure rate. Restating it
    as an SLO here is deliberate: most SLOs admit "good enough most of
    the time"; this one does not, and writing it as "99.9% isolation"
    would imply a tolerance for the 0.1% that does not, and should not,
    exist. The isolation SLO's target is exactly zero, and a single
    violation is an incident, not a metric dip.
```

**Per-tenant vs. aggregate SLO reporting.** Aggregate SLOs answer "is the platform healthy overall"; a privileged tenant administrator reasonably wants to know "is *my* college's data fresh and *my* college's queries fast" — which argues for per-tenant SLO visibility specifically (echoing §4's cardinality exception for cost) even though most metrics stay aggregated. This is a forward-looking capability, not yet built, named here so future dashboard work (§8) knows it's expected.

> **Ruling OBS-7.1 — SLOs are defined per path (read/ask latency, ingest/compute freshness, AI grounding as an upper-bound-on-failure metric) rather than as one platform-wide number; the isolation guarantee is stated as an absolute (zero events), never as a percentage with an implied tolerance.** *Basis: Ch2 §5; Ch8 §10.*

---

### 8. Dashboards & alerting

**Two audiences, overlapping but distinct data.** An engineering operations dashboard (latency, error rates, replica lag, queue depth) serves the people keeping the platform running; a "platform health" surface for institutional leadership (drawing on the same risk/accreditation data the product already serves, per Chapter 1's own product-vision framing of a principal's digest) is a *product* feature built from related but not identical signals — this chapter owns the former; the latter belongs to the relevant RSDD, not duplicated here.

**Alerting follows the SLOs (§7), and respects the degradation model (Ch2 §8) rather than paging on every plane's failure equally.** A read-replica lag breach pages; an AI-plane provider outage that degrades only the NL-query feature, while dashboards and boards remain fully available (Ch2 §8's contained-failure design), should alert at a lower severity than an incident that takes down the whole platform — paging discipline that doesn't distinguish these would train operators to ignore pages, which defeats the point of having them.

**The isolation SLO gets its own alerting tier, distinct from everything else.** Per §7, a single cross-tenant exposure event is not a metric dip to trend — it is the platform's highest-severity possible incident, and alerting on it (were the release-blocking tests in Ch8 §10 ever somehow bypassed in production) should be unmissable, not folded into a general error-rate dashboard where it could be one line among many.

---

### 9. The audit log's role in observability — restated, not redesigned

Chapter 8 §7 built the append-only audit log for accountability; this chapter's contribution is naming it explicitly as an **observability input**, not a separate mechanism: a spike in `403`/`404` responses visible in audit data can surface an RBAC/ABAC misconfiguration (Ch4) before a user complaint does; a pattern of repeated failed access attempts from one account is a security-monitoring signal as much as an accountability record. This chapter does not duplicate audit-log design — it notes that the same data, already collected for Chapter 8's purposes, is also a legitimate input to this chapter's dashboards, exactly the kind of deliberate reuse Chapter 1's maintainability driver rewards.

---

### 10. Failure & degradation — when observability itself fails

**The platform must never depend on its own observability infrastructure to function.** This is the one principle in this chapter that matters most precisely because it's counterintuitive to over-engineer against: observability exists to help operators *understand* the platform, and if a logging pipeline backlog, a metrics-backend outage, or a tracing collector failure ever caused a request to fail or be rejected, the tail would be wagging the dog.

| Failure | Behaviour | Why |
|---|---|---|
| **The log-aggregation backend (once built) is unavailable** | Logs continue to stdout (Ch10's existing capability); nothing in the request path waits on or depends on the aggregator being reachable. | Logging is fire-and-forget from the request's perspective; visibility degrades, function doesn't. |
| **The metrics backend (once built) is unavailable** | Metric emission is non-blocking / best-effort; a failed metric write never fails the request it was measuring. | Same principle — measurement is observation, not a dependency. |
| **The tracing collector (once built) is unavailable** | Spans are dropped or buffered with a bound, never blocking the traced operation itself. | Tracing instrumentation overhead must be negligible and non-blocking by design. |
| **An AI-monitoring metric (§6) shows a guardrail violation** | This is the one case where observability failing to detect something would be worse than the platform itself failing — a missed grounding violation is a silent erosion of Ch1 §4.4's guarantee. | The asymmetry between "observability infra down" (acceptable, degrades visibility) and "observability *missing a real guardrail breach*" (not acceptable, this section's entire purpose) is the one place this chapter treats its own reliability as load-bearing. |

---

### 11. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **OBS-3.1** | Logging standard | Mandatory field set + never-log-PII rule binding on all future subsystems; aggregation added additively later | Per-subsystem ad hoc logging conventions | Ch1 §3 Group D; Ch8 PII protection |
| **OBS-4.1** | Metrics taxonomy | Organized by read/ask vs. ingest/compute path; tenant_id label only where per-tenant visibility is the actual need | One undifferentiated metric set; universal per-tenant cardinality | Ch2 §5; metrics-backend cost |
| **OBS-5.1** | Tracing standard | OpenTelemetry, extending existing request-id propagation; AI lifecycle is the first target | Proprietary/vendor-locked tracing; logging alone for multi-step AI debugging | Ch1 §8 MR-3 reasoning; Ch3 §9 |
| **OBS-6.1** | AI monitoring | Every Ch3 §8 guardrail gets a corresponding metric; grounding/abstention and output-validation-rejection rates are top priority | Treating AI guardrails as design-only, unmeasured | Ch3 §8; Ch1 §4.4 |
| **OBS-7.1** | SLO structure | Per-path SLOs (latency vs. freshness vs. grounding-as-upper-bound); isolation stated as an absolute zero, never a percentage | One platform-wide SLO; isolation expressed with an implied tolerance | Ch2 §5; Ch8 §10 |

---

### 12. How this chapter governs the rest of the Bible

- **Chapter 3 (AI Platform)**'s guardrail table (§8) is the direct specification this chapter's AI-monitoring section (§6) implements as measured signals — any future change to Chapter 3's guardrails should be paired with a corresponding metric change here.
- **Chapter 8 (Security Architecture)**'s isolation tests (§10) and audit log (§7) are this chapter's two most important monitored inputs — the isolation SLO (§7) and the audit-as-observability-input (§9) both consume Chapter 8's mechanisms directly rather than re-deriving them.
- **Chapter 10 (DevOps & Cloud Architecture)**'s health-check and structured-logging capabilities (Ch10 §10) are the raw material this chapter's logging (§3) and future metrics/tracing (§4, §5) are built on.
- **Chapter 14 (Testing & Quality Strategy)** should treat this chapter's metrics and SLOs as the basis for load-testing targets (does the read path actually meet its latency SLO under realistic load) and should add the AI-monitoring metrics (§6) as assertions in any future AI-evaluation test suite, not just production dashboards.
- **Chapter 15 (Implementation Roadmap)** should schedule metrics, tracing, and formal SLOs as a named near-term milestone — alongside Chapter 10's named CI/cold-install gaps — since all of them are currently "designed, not yet built."

New observability tensions are added to this ledger (§11) by amendment.

---

### 13. Sign-off

This chapter is normative once ratified. Amendments to the isolation-SLO-as-absolute principle (§7) or the AI-monitoring guardrail mapping (§6) require Architecture Review Board approval.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Security Architect | | ☐ Approve ☐ Revise | |
| Principal Platform Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |

---

*End of Chapter 11 — Observability & Operations.*
