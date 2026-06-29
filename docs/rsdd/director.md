# Director_AI_Complete_Design_v1.0

**Version:** v1.0  
**Generated:** June 27, 2026

---

This document is the merged master design document for the **Director / Management AI Assistant**.

---

# Director / Management AI Assistant — Role Definition & Feature Freeze

**Product:** Meeraxu Intelligence — AI Intelligence Layer for College ERP (India)
**Phase:** Phase 1 — Product Definition (no implementation detail)
**Persona:** Director / Management AI Assistant (the *Principal / Management copilot* in the Definitive Design)
**Status of this document:** Feature-freeze candidate for Version 1
**System of Record:** the college's existing ERP / Sheets / biometric / LMS — *never replaced*
**Governing principle:** AI is **advisory**. The copilot surfaces, explains, and recommends; **humans decide and act.** No autonomous write-back in v1.

> **Grounding note.** This role is one of five copilots that share a single engine and differ only by goal, scope, and surface (Principal/Management, Registrar, Faculty/Mentor, IQAC, Student). Every capability below inherits the platform's locked decisions: read-only NL over a *governed semantic layer* (never raw SQL), Postgres row-level security for hard tenant + sub-unit isolation, grounded answers (every number traces to a real row; no invented figures), and DPDP-Act-2023 data governance with minor handling. Financial scope is **fees only** in v1 — not full accounting. These constraints shape the feature freeze.

---

## 1. Role Overview

### Why this role exists
Institutional leadership — the Trust/Chairman, Principal/Director, and Deans — carries accountability for the health of the institution but has **no single, trustworthy pulse**. Today the picture is reassembled by hand from departmental spreadsheets, ERP exports, and verbal updates, each lagging and inconsistent. Decisions that need a same-day view (Where are we losing students? Is fee collection tracking last year? Which department drags our NAAC score?) wait days for a manual MIS pull, and accreditation surprises surface only at peer-team review. The Director AI exists to collapse that gap: a **continuously-computed, explainable institution-health layer** that answers leadership questions in plain language, grounded in live operational data.

### Responsibilities of the role (what the assistant is accountable for)
- Maintaining an always-current **Institution Health pulse** across enrolment, attendance, results, fees, placements, at-risk count, and accreditation readiness.
- Answering **natural-language leadership questions** over governed metrics, with the reasoning and source rows shown.
- **Detecting anomalies and emerging risks** early and routing them to the right human owner.
- Producing **executive briefs and board-ready summaries** that are grounded, not generated from thin air.
- Doing all of the above **without exposing data the role shouldn't see**, and without acting on the institution's behalf.

### Business objectives
Faster, evidence-based leadership decisions; earlier intervention on student, financial, and accreditation risk; reduced "MIS reconstruction" labour; a credible, auditable basis for board and trust reporting; and a defensible accreditation posture (fewer DVV/peer-team surprises).

### Daily workflow (business view)
Open the **Daily Executive Brief** → glance at the Institution Health Score and overnight anomalies → drill into any flag down to department/programme → ask follow-up questions in natural language → forward a grounded summary to the board/trust or assign the issue to the responsible head. (Assigning and acting happen *outside* the AI — the copilot prepares the decision; the human makes it.)

### Success criteria
- Leadership opens the brief **daily** and acts on it (adoption, not vanity dashboards).
- Time-to-answer for a leadership question drops from *days* (manual MIS) to *seconds*.
- At-risk cohorts and fee/accreditation anomalies are caught **before** they become crises.
- Every executive figure is **traceable** to source — zero "where did this number come from" disputes.
- Measurable outcomes the institution can cite: hours saved, at-risk students caught, accreditation grade-risk reduced.

### Current executive challenges this addresses
No single source of truth; lagging, manual reporting; reactive (not proactive) risk awareness; accreditation panic concentrated at deadline; fragmented financial visibility (fees scattered across systems); inability to self-serve answers without routing through IT or a registrar.

### Strategic decision-making responsibilities supported (not replaced)
Resource and attention allocation across departments; fee/revenue planning at the institution level; accreditation-cycle prioritisation; retention strategy; and board/trust governance reporting. The AI **informs** each; the executive **owns** each.

### How AI improves institutional leadership
It converts continuously-ingested operational data into a **single explainable pulse**, replaces manual reporting with on-demand grounded answers, shifts leadership from reactive to **proactive** through early-warning detection, and makes every executive claim **auditable** — raising the quality and speed of decisions without removing the human from the decision.

---

## 2. Role Goals

**Business goals** — One trusted institution-health pulse; daily executive adoption; demonstrable hours saved versus manual MIS.

**Financial goals** *(fees-scoped in v1)* — Real-time visibility into fee collection vs. plan and vs. prior year; early flags on collection shortfalls and outstanding-dues concentration; fee-driven revenue forecasting for planning. *(Full budgeting beyond fees is deferred — see §11.)*

**Strategic goals** — Faster, evidence-based allocation of attention and resources; a defensible, board-credible accreditation posture; retention strategy informed by aggregate risk trends.

**Institutional growth goals** — Internal trend tracking (enrolment, results, placement, fee health over time) to inform growth decisions; **external peer benchmarking is deferred to v2** (it depends on network scale the product won't have at launch).

**Productivity goals** — Eliminate manual reconstruction of leadership reports; self-serve answers without IT/registrar in the loop; one-click grounded briefs.

**AI goals** — Grounded, explainable answers (no hallucinated figures); calibrated, advisory-only outputs; transparent "why" behind every flag.

**Automation goals** — Automate *reporting and detection* (digests, anomaly alerts, KPI computation); **keep human** all decisions, approvals, and any action on the world. No autonomous write-back in v1.

**Decision-support goals** — Turn questions into grounded answers in seconds; provide drill-down from institution → department → programme; supply board-ready summaries.

**Risk-management goals** — Early detection of student-retention, fee-collection, and accreditation-readiness risk; anomaly flagging on operational data; a full **audit trail** of every query and answer.

---

## 3. User Profile

**Who uses this role:** Trust/Chairman, Principal/Director, Vice-Principal, Deans. (These are also the *buyers* — the purchase decision sits with management/trust + principal/director + registrar; IT and IQAC influence but do not buy.)

**Technical expertise:** Low-to-moderate. Comfortable with dashboards and email; **not** SQL or BI-tool users. The natural-language interface exists precisely so leadership never has to navigate menus or write queries.

**Daily executive responsibilities:** Institutional oversight; board/trust reporting; resource and attention allocation; accreditation accountability; financial (fee) oversight; escalation handling.

**Current management workflow:** Request reports from departments/registrar → wait → reconcile inconsistent spreadsheets → form a partial picture → decide. Slow, lagging, and dispute-prone.

**Pain points:** No single pulse; stale, manual reporting; reactive risk awareness; accreditation surprises; fragmented fee visibility; dependence on others to answer basic questions.

**ERP limitations they hit:** ERPs are systems of record, not insight engines — they store transactions but don't synthesise institution-level intelligence, don't answer plain-language questions, and don't proactively flag risk across modules.

**Information required by the role:** Aggregate enrolment, attendance, academic results, fee collection/dues, placements, at-risk counts, and accreditation readiness — at institution and department/programme grain.

**Authority level:** Highest institutional authority. Broadest **read** scope across the tenant. **Not** an operational data editor — this role consumes intelligence, it does not maintain records.

**Decision-making responsibilities:** Final institutional decisions on strategy, resources, and accreditation priorities. The AI prepares; the executive decides.

---

## 4. Feature Catalog

> Read this alongside §11 (versioning) and §12 (freeze). Several requested features are **rescoped, merged, or deferred** to fit locked platform constraints; each is flagged here and justified before the freeze.

### 4.1 Executive Institution Dashboard *(v1)*
- **Purpose:** A single at-a-glance institution-health surface for leadership.
- **Problem solved:** No single pulse; leadership reassembles the picture by hand.
- **Business value:** Faster situational awareness; fewer reporting cycles.
- **Executive value:** Open once, know where the institution stands.
- **Inputs:** Canonical enrolment, attendance, results, fees, placements, at-risk counts, accreditation readiness % (all tenant-scoped).
- **Outputs:** KPI tiles, trend lines, at-risk count, Institution Health Score, anomaly flags.
- **Dependencies:** Unified data layer (SoT); Student Success / risk engine; accreditation readiness signal.
- **AI involvement:** Health-index composition; trend narration; anomaly surfacing.
- **Expected behaviour:** Glanceable, drill-downable, current ("updated N hrs ago"), explainable.
- **Permissions:** Privileged-only (principal/registrar/management). Faculty cannot route here.
- **Limitations:** Aggregates, not an operational editor; no write-back; respects DPDP minor-profiling limits.
- **Future enhancements:** Configurable executive widgets; multi-campus roll-up (v2/v3).

### 4.2 Multi-Campus Analytics Dashboard *(DEFER → v2/v3 — see §11)*
- **Purpose:** Cross-campus roll-up and comparison for multi-campus groups.
- **Problem solved:** Group-level leadership lacks a consolidated cross-campus view.
- **Business/Executive value:** Governance across a campus network.
- **Inputs:** Per-campus aggregates within the tenant's sub-unit hierarchy.
- **Outputs:** Campus comparison tiles, roll-ups, outliers.
- **Dependencies:** Sub-unit (campus) scoping in RLS; the single-campus dashboard it inherits from.
- **AI involvement:** Cross-campus anomaly detection and ranking.
- **Expected behaviour:** Roll-up with drill-down to a single campus.
- **Permissions:** Group-management only; campus heads see their own campus.
- **Limitations:** Most pilot/v1 colleges are single-campus; **multi-campus governance is explicitly a later-phase capability.**
- **Future enhancements:** This *is* the future enhancement — ship single-campus first.

### 4.3 Financial Performance Intelligence *(v1 — FEES-SCOPED)*
- **Purpose:** Institution-level visibility into fee collection and dues health.
- **Problem solved:** Fragmented fee visibility; cash-flow uncertainty.
- **Business value:** Revenue/collection planning; early shortfall warning.
- **Executive value:** Know collection vs. plan and vs. last year at a glance.
- **Inputs:** Canonical fee records (collected, outstanding, schedule).
- **Outputs:** Collection-rate tiles, dues concentration, fee trend, fee-based forecast.
- **Dependencies:** Fee ingestion in the SoT.
- **AI involvement:** Fee-collection forecasting (time-series); outlier/duplicate-entry anomaly flags.
- **Expected behaviour:** Grounded figures; trace to records.
- **Permissions:** Privileged; financial data is sensitive — least-privilege enforced.
- **Limitations:** **Fees only.** No general-ledger / accounting depth (integrate Tally/accounting where present). No payroll.
- **Future enhancements:** Deeper budgeting once accounting integration exists (v2).

### 4.4 Admissions & Enrolment Analytics *(v1)*
- **Purpose:** Track admissions funnel and enrolment health.
- **Problem solved:** No timely view of intake vs. capacity/targets.
- **Business/Executive value:** Intake planning; early shortfall awareness.
- **Inputs:** Admission/enrolment canonical data.
- **Outputs:** Enrolment tiles, trends vs. prior year, programme-wise fill.
- **Dependencies:** Admission/enrolment ingestion.
- **AI involvement:** Trend narration; anomaly flags on intake shifts.
- **Expected behaviour:** Institution → programme drill-down.
- **Permissions:** Privileged.
- **Limitations:** Reflects ingested data quality; no lead-gen/CRM.
- **Future enhancements:** Admissions forecasting (v2).

### 4.5 Placement Performance Analytics *(v1 — aggregate view)*
- **Purpose:** Leadership-level placement outcomes view.
- **Problem solved:** No consolidated placement pulse for management.
- **Business/Executive value:** Reputation/positioning; employability oversight.
- **Inputs:** Placement canonical data.
- **Outputs:** Placement-rate tiles, trends, department/programme breakdown.
- **Dependencies:** Placement ingestion; the TPO/placement persona owns operational detail.
- **AI involvement:** Trend narration; anomaly flags.
- **Expected behaviour:** Aggregate read; drill to department.
- **Permissions:** Privileged.
- **Limitations:** Management sees aggregates; **per-student placement-risk work belongs to the TPO/mentor**, not this role.
- **Future enhancements:** Placement-risk forecasting at the cohort level (v2).

### 4.6 Faculty Workforce Analytics *(v1 — NARROW; deeper HR DEFERRED)*
- **Purpose:** Light workforce signals leadership actually needs (counts, student-faculty ratio, research/extension output for accreditation).
- **Problem solved:** No institution view of faculty load/output relevant to NAAC/NBA.
- **Business/Executive value:** Accreditation evidence; staffing awareness.
- **Inputs:** Canonical faculty records; research/publication container (faculty-populated).
- **Outputs:** Headcount, student-faculty ratio, research-output tiles.
- **Dependencies:** Faculty ingestion; accreditation evidence vault.
- **AI involvement:** Output aggregation; gap flags relevant to accreditation.
- **Expected behaviour:** Aggregate, accreditation-relevant.
- **Permissions:** Privileged; HR data is sensitive (no payroll, no individual performance scoring).
- **Limitations:** **Not** a full HRMS / workload-optimiser / appraisal engine in v1.
- **Future enhancements:** Deeper workforce analytics once HR data is in scope (v2).

### 4.7 Student Success & Retention Intelligence *(v1 — aggregate)*
- **Purpose:** Institution-level at-risk and retention pulse.
- **Problem solved:** Reactive retention; no early aggregate signal.
- **Business/Executive value:** Retention strategy; earlier intervention.
- **Inputs:** Risk engine outputs (tiers, findings) — aggregated.
- **Outputs:** At-risk counts by tier/department; retention trend.
- **Dependencies:** Student Success Engine (rules-based now; ML seam later).
- **AI involvement:** Aggregate risk ranking; trend narration.
- **Expected behaviour:** Aggregate read; drill to department, **not** to identified-minor profiles beyond governance limits.
- **Permissions:** Privileged aggregate. **Per-student intervention is the Faculty/Mentor role.**
- **Limitations:** DPDP minor handling: behavioural profiling restricted; consent gating governs parent-contact interventions (owned by faculty, not this role).
- **Future enhancements:** ML-based retention prediction (v2).

### 4.8 Strategic KPI Dashboard *(MERGE INTO 4.1 — see §12)*
- **Purpose:** Curated strategic KPIs for leadership.
- **Recommendation:** **Merge** with the Executive Institution Dashboard (4.1). Maintaining two leadership "dashboards" splits attention and duplicates tiles. KPIs become a configurable view *within* the Executive Dashboard.
- **Net:** Capability retained; surface consolidated.

### 4.9 Budget Planning & Resource Optimization *(DEFER → v2)*
- **Purpose:** Budget planning and resource allocation support.
- **Problem solved:** No data-driven budgeting at the institution level.
- **Why deferred:** True budgeting needs **accounting/expense data the system does not own in v1** (fees-only). In v1 this is partially served by fee-driven revenue forecasting in 4.3. Full budget planning waits on accounting integration.
- **Future enhancements:** Resource-optimisation recommendations once cost data exists (v2).

### 4.10 Accreditation & Compliance Intelligence *(v1 — read/consume)*
- **Purpose:** Leadership view of accreditation readiness (NAAC / NBA / NIRF / AICTE-UGC).
- **Problem solved:** Accreditation surprises at peer-team review; no leadership visibility into readiness.
- **Business/Executive value:** Defensible accreditation posture; fewer DVV-style surprises.
- **Inputs:** IQAC's criterion completeness, evidence %, DVV-risk flags.
- **Outputs:** Readiness %, criterion drag, risk flags — at leadership grain.
- **Dependencies:** IQAC copilot (which *owns* drafting and evidence).
- **AI involvement:** Readiness summarisation; risk surfacing.
- **Expected behaviour:** Leadership **consumes** readiness; does not author SSR/AQAR.
- **Permissions:** Privileged read.
- **Limitations:** **Drafting and evidence ownership stay with IQAC.** This role does not generate or sign accreditation documents.
- **Future enhancements:** Predictive readiness scoring (v2).

### 4.11 AI Executive Reports Generator *(v1)*
- **Purpose:** On-demand grounded executive/board reports.
- **Problem solved:** Manual report assembly.
- **Business/Executive value:** Board-ready output in minutes; auditable.
- **Inputs:** Governed metrics; NL request.
- **Outputs:** Grounded report (every figure traced to source); exportable.
- **Dependencies:** Semantic layer; NL query engine.
- **AI involvement:** Grounded drafting + figure binding (numbers from the warehouse, never invented).
- **Expected behaviour:** Echoes its interpretation; abstains when no governed metric fits.
- **Permissions:** Privileged; can export/share per governance.
- **Limitations:** Read-only; advisory; human approves before circulation.
- **Future enhancements:** Scheduled board packs (v2).

### 4.12 Institutional Risk Intelligence *(v1)*
- **Purpose:** Consolidated institutional risk view (student + fee + accreditation + data anomalies).
- **Problem solved:** Risk scattered across modules; no single risk lens.
- **Business/Executive value:** Proactive, prioritised risk awareness.
- **Inputs:** Risk engine, fee anomalies, accreditation flags, data-quality anomalies.
- **Outputs:** Ranked institutional risks with reasons + suggested owner.
- **Dependencies:** Success Engine; anomaly detection; accreditation signal.
- **AI involvement:** Cross-domain anomaly detection; prioritisation; explanation.
- **Expected behaviour:** Every flag shows its "why"; routes to a human owner.
- **Permissions:** Privileged.
- **Limitations:** Advisory; no auto-remediation.
- **Future enhancements:** Outcome-trained risk ranking (v2).

### 4.13 Predictive Decision Support *(v1 RULES-SCOPED; ML → v2)*
- **Purpose:** Forward-looking support for leadership decisions.
- **Problem solved:** Decisions made on lagging data.
- **v1 scope:** **Rules/time-series forecasts only** — fee-collection prediction and attendance/marks trajectory. *(Aligned to "rules first; ML later.")*
- **AI involvement:** Time-series forecasting; rules-based projection.
- **Limitations:** **No ML/black-box scoring in v1.** Predictions are explainable and advisory.
- **Future enhancements:** ML predictive models once outcome-labelled data accumulates (v2 — the learning loop).

### 4.14 Executive Communication Assistant *(v1)*
- **Purpose:** Draft grounded leadership communications (board notes, departmental asks, digest narratives).
- **Problem solved:** Time spent composing data-backed updates.
- **Business/Executive value:** Faster, consistent, evidence-linked communication.
- **Inputs:** Grounded metrics; NL intent.
- **Outputs:** Draft text with linked figures; human edits and sends.
- **Dependencies:** Semantic layer; reports generator.
- **AI involvement:** Grounded drafting (same discipline as accreditation narratives).
- **Expected behaviour:** Drafts only; **does not send** on the user's behalf.
- **Permissions:** Privileged.
- **Limitations:** Advisory; no autonomous messaging; no impersonation of real individuals in persuasive content.
- **Future enhancements:** Template library (v2).

### 4.15 Institution Growth & Benchmarking *(SPLIT — internal growth v1; external benchmarking DEFER → v2)*
- **Purpose:** Growth tracking and peer comparison.
- **v1 scope:** **Internal** growth trends (enrolment, results, placement, fee health over time).
- **Deferred:** **External peer benchmarking** depends on cross-institution network scale the product won't have at launch — **v2.**
- **AI involvement (v1):** Internal trend analysis and narration.
- **Limitations:** No external benchmark until scale exists; no fabricated comparatives.
- **Future enhancements:** Anonymous peer benchmarking once the network is large enough (v2).

### 4.16 AI Strategic Planning Assistant *(DEFER → v3)*
- **Purpose:** Autonomous-leaning strategic planning support.
- **Why deferred:** This sits in the **autonomous-insight / institutional-optimisation** tier of the long-term vision (Yr 3–5). It presumes predictive ML, benchmarking, and write-capable orchestration that v1 explicitly excludes.
- **Future enhancements:** Scenario planning and AI-driven strategy synthesis (v3).

### 4.17 AI Executive Chat Assistant *(v1 — CORE)*
- **Purpose:** Natural-language Q&A over the institution's governed data.
- **Problem solved:** Leadership can't self-serve answers without IT/menus/SQL.
- **Business/Executive value:** Answers in seconds; the wedge for adoption.
- **Inputs:** NL question.
- **Outputs:** Grounded answer + interpretation echo + traceable figures.
- **Dependencies:** Governed semantic layer; RLS; RBAC metric gating.
- **AI involvement:** Intent/entity parse → semantic selection (not raw SQL) → read-only, tenant-scoped, RLS-enforced execution → grounded response.
- **Expected behaviour:** Refuses/abstains when no governed metric fits ("I can't answer that from your data"); never free-generates numbers.
- **Permissions:** Privileged; metric/grain visibility gated by role.
- **Limitations:** **Read-only.** No write-back. No cross-tenant data — ever.
- **Future enhancements:** Saved/shared queries; richer metric coverage (v2).

### 4.18 Daily Executive Brief *(v1 — CORE)*
- **Purpose:** A proactive morning digest of what changed and what needs attention.
- **Problem solved:** Leadership shouldn't have to go looking for the day's risks.
- **Business/Executive value:** Drives daily adoption; turns the tool into a habit.
- **Inputs:** Overnight metric deltas, new anomalies, tier escalations, deadlines.
- **Outputs:** Short grounded brief: health score, top changes, top risks, suggested drill-downs.
- **Dependencies:** Health index; anomaly detection; risk engine.
- **AI involvement:** Summarisation + prioritisation of overnight change.
- **Expected behaviour:** Concise, grounded, scannable; links into the dashboard.
- **Permissions:** Privileged; consent-aware delivery (email/app).
- **Limitations:** Advisory; no actions taken automatically.
- **Future enhancements:** Configurable cadence and channel (v2).

---

## 5. Dashboard Overview

**Executive widgets / KPI cards** — Enrolment, attendance, results, fee collection, placements, at-risk count, accreditation readiness %. Tabular figures; "updated N hrs ago" recency stamp.

**Financial dashboards** — Fee collection vs. plan and prior year; outstanding-dues concentration; fee-based forecast. *(Fees only.)*

**Institutional analytics** — Department/programme drill-downs from every institution-level tile.

**Charts / trends** — Trend lines for each KPI; prior-year overlays where data exists.

**Heatmaps** — Department × risk-tier heat for at-risk concentration; department × criterion for accreditation drag.

**Risk indicators** — The **colour-vision-safe tier language** (colour + text label + shape) reused everywhere it appears, the product's visual signature.

**Quick actions** — Drill down, ask a follow-up, generate a brief/report, assign-to-human (assignment routes a notification; the AI does not act).

**Notifications** — Anomaly alerts, tier escalations, deadline reminders; unread count in nav; consent-aware delivery.

**AI Chat** — The Executive Chat Assistant, always reachable from the dashboard.

**Executive search** — Natural-language search across governed metrics (not free-text over raw records).

**Daily Executive Summary** — Surfaced top-of-dashboard each morning (the Daily Executive Brief, §4.18).

**Institution Health Score** — A single composite pulse with its components transparently shown (no black-box score).

> **Designed-state honesty:** where a needed series doesn't exist yet (e.g. a long risk-trend history for a brand-new pilot), the dashboard shows a calm placeholder ("Trend builds as data accumulates") rather than fabricating a line. Stale-import states show a non-blocking note, not a hard error.

---

## 6. AI Capabilities (and why each exists)

- **Generate** — board/executive reports — *because manual assembly is slow and error-prone, and grounded generation is auditable.*
- **Summarize** — daily brief, accreditation readiness, anomalies — *because leadership needs the signal, not the raw feed.*
- **Predict / Forecast** — fee collection, attendance/marks trajectory *(rules/time-series in v1)* — *because decisions on lagging data are worse decisions.*
- **Recommend** — suggested drill-downs, suggested owner for a risk — *because surfacing a problem without a next step wastes executive time.*
- **Benchmark** — internal period-over-period in v1 *(external peer benchmarking v2)* — *because trend context turns a number into a judgement.*
- **Analyze / Compare** — across departments/programmes/time — *because institution-level decisions are comparative.*
- **Detect risks** — student, fee, accreditation, data-quality anomalies — *because early detection is the core value; reactive leadership is the status quo we're replacing.*
- **Prioritize** — rank risks and changes by materiality — *because attention is the scarcest executive resource.*
- **Explain** — the "why" behind every flag and figure, with source rows — *because trust requires traceability; unexplained scores get ignored.*
- **Optimize** — surface where attention/resources would move the needle *(advisory)* — *because the role allocates scarce resources.*
- **Alert** — proactive notifications on escalations/deadlines — *because the institution shouldn't depend on someone remembering to look.*
- **Support executive decisions** — assemble the grounded picture behind a decision — *because the role's job is to decide; the AI's job is to prepare the decision, never to make it.*

> Every capability obeys two non-negotiables: **grounding** (numbers trace to real rows; the model abstains rather than invent) and **advisory-only** (no autonomous action in v1).

---

## 7. Permission Matrix

Principle: **least privilege + executive governance.** Director/Management has the **broadest read** scope but is **not an operational editor** and **cannot act on the world** (no write-back in v1). The frontend is never the security boundary — the API enforces tenant + role server-side.

Legend: ✅ allowed · ⚠️ allowed-with-governance · ❌ not in this role / not in v1

| Feature | View | Create | Edit | Delete | Approve | Export | Share | Trigger AI | View Analytics | View Financial | View Inst. KPIs | Access Sensitive |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Executive Institution Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Financial Performance (fees) | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Admissions & Enrolment | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Placement Analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Faculty Workforce (narrow) | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| Student Success & Retention (aggregate) | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| Accreditation & Compliance (consume) | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| AI Executive Reports Generator | ✅ | ✅ | ⚠️ | ❌ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Institutional Risk Intelligence | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Predictive Decision Support (rules) | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| Executive Communication Assistant | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Institution Growth (internal) | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ❌ |
| AI Executive Chat Assistant | ✅ | ✅* | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Daily Executive Brief | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |

\* "Create" for the Chat Assistant = create a saved query/answer, not create operational records.
Notes: **Edit/Delete on operational data is never granted to this role** — leadership consumes, it does not maintain records. ⚠️ on *Access Sensitive* means access is governed by DPDP rules: aggregates yes; **identifiable minor profiling is restricted**, and individual-student PII drill-down beyond governance limits is not part of this role (that is the Faculty/Mentor scope).

---

## 8. Data Access

**Financial data required** — Fee collection, outstanding dues, fee schedule. *(Fees only; no general-ledger/payroll.)*

**Academic data required** — Enrolment, attendance, internal marks, results — **at aggregate/department grain** for this role.

**HR data required** — Faculty headcount, student-faculty ratio, research/extension output relevant to accreditation. **No payroll, no individual appraisal.**

**Placement data required** — Placement outcomes at aggregate/department grain.

**Admission data required** — Admissions funnel and enrolment aggregates.

**Compliance data required** — Accreditation readiness %, criterion completeness, DVV-risk flags (consumed from IQAC).

**Executive reports** — Grounded, exportable, board-ready, every figure traced.

**Institution-wide KPIs** — The full health-pulse set, tenant-scoped.

**Data ownership** — The **ERP remains the System of Record**; the AI layer owns derived intelligence and audit, not the source records.

**Data sensitivity** — Financial, HR, and minor-student data are sensitive. Tenant isolation is enforced by Postgres RLS; tenant ID is injected server-side from the session, never from model output.

**Cross-role restrictions** — Director/Management gets the **broadest aggregate read** but is walled off from operations it doesn't own: it does not author accreditation documents (IQAC), generate statutory returns (Registrar), or run per-student interventions (Faculty/Mentor).

**Privacy considerations (must never be exposed unnecessarily):**
- **No cross-tenant data, ever** — the platform's #1 risk; hard-isolated and red-teamed.
- **Minor data (under 18):** behavioural profiling restricted; identifiable minor-level drill-down and parent-contact actions are **not** this role's function. Leadership sees aggregates, not minor profiles.
- **Individual payroll / individual faculty appraisal** — out of scope for this role.
- **Raw PII at scale** — leadership works in aggregates; per-individual record access is a different role with its own justification and audit.
- Every query and answer is **logged, scoped, and explainable.**

---

## 9. Workflow Summary (business view — no implementation)

The pattern is identical across features; the *content* differs.

```
Trigger  →  AI Analysis  →  ERP/Unified Intelligence  →  Executive Recommendation
        →  Human Decision  →  Institution Action  →  Completion
```

**Per-feature trigger (business):**
- *Executive Dashboard* — leadership opens it / a KPI crosses a threshold.
- *Financial (fees)* — collection drifts from plan or prior year.
- *Admissions & Enrolment* — intake shifts vs. target.
- *Placement* — placement-rate movement.
- *Faculty Workforce* — accreditation-relevant ratio/output gap.
- *Student Success & Retention* — at-risk count rises; tier escalations overnight.
- *Accreditation* — readiness % drops / DVV-risk flag appears.
- *Reports Generator* — leadership requests a board pack in NL.
- *Risk Intelligence* — a cross-domain anomaly surfaces.
- *Predictive Support* — a forecast crosses a planning threshold.
- *Communication Assistant* — leadership needs a grounded update drafted.
- *Growth (internal)* — period-over-period shift worth noting.
- *Chat Assistant* — leadership asks a question.
- *Daily Brief* — scheduled each morning.

In every case the AI **analyses and recommends**; a **human decides**; the **institution acts** (outside the AI); the loop **completes**. The AI never closes the loop on its own in v1.

---

## 10. Out of Scope (what the Director AI must NEVER do)

**Boundaries against other copilots:**
- **vs. IQAC AI** — Director **consumes** accreditation readiness. It does **not** author, draft, or sign SSR/AQAR/SAR, nor own the evidence vault.
- **vs. Registrar AI** — Director **reads** compliance status. It does **not** generate AICTE/UGC statutory returns or run reconciliation queues.
- **vs. HOD / Academic-Head AI** — Director sees department aggregates. It does **not** run department-internal academic operations.
- **vs. Faculty / Mentor AI** — Director sees aggregate at-risk. It does **not** do per-student interventions, intervention logging, or parent-contact (and the DPDP minor-consent gate belongs to that flow, not this role).
- **vs. Student AI / Placement-Cell AI** — Director sees aggregates only; no individual student record management, no per-student placement-risk operations.

**Hard platform boundaries (all roles, reaffirmed for this one):**
- **No write-back / no autonomous AI actions in v1** — NL stays read/analytical; AI suggests, humans act.
- **No raw SQL from the model** — only governed semantic-layer queries.
- **No cross-tenant access** — ever.
- **No invented numbers** — abstain when no governed metric fits.
- **No identifiable minor profiling**; no payroll/appraisal of individuals.
- **No full accounting, LMS/courseware, AI tutoring, or native-mobile parity** in v1.
- **No international/UAE-specific compliance** in v1 (region-ready, not region-live).

---

## 11. Future Features (versioned)

### Version 1 — Enterprise executive capabilities required for launch
Executive Institution Dashboard (incl. merged Strategic KPIs) · Financial Performance Intelligence (fees) · Admissions & Enrolment Analytics · Placement Performance Analytics (aggregate) · Faculty Workforce Analytics (narrow/accreditation-relevant) · Student Success & Retention Intelligence (aggregate) · Accreditation & Compliance Intelligence (consume) · AI Executive Reports Generator · Institutional Risk Intelligence · Predictive Decision Support (rules/time-series) · Executive Communication Assistant · Institution Growth (internal trends) · AI Executive Chat Assistant · Daily Executive Brief.

### Version 2 — Advanced predictive intelligence & strategic planning
Multi-Campus Analytics (sub-unit roll-up) · ML-based Predictive Decision Support & retention prediction (the learning loop) · Budget Planning & Resource Optimization (post accounting integration) · External Peer Benchmarking (network-scale dependent) · Placement-risk forecasting · Scheduled board packs · Saved/shared NL queries.

### Version 3 — Autonomous insights, multi-campus governance, advanced forecasting, AI-powered optimisation
AI Strategic Planning Assistant (scenario planning) · Multi-campus governance · Autonomous/proactive institutional insight · Advanced forecasting · AI-driven institutional optimisation — consistent with the long-term arc *Copilot → Intelligence Platform → Education Data Cloud → University OS.*

---

## 12. Final Feature Freeze (Version 1 — Director / Management AI Assistant)

**CPO pre-freeze rationale (renames / merges / deferrals):**
- **Merge:** *Strategic KPI Dashboard* → into *Executive Institution Dashboard* (two leadership dashboards split attention; KPIs become a configurable view).
- **Rescope:** *Financial Performance* → **fees only**; *Faculty Workforce* → **narrow/accreditation-relevant**; *Predictive Decision Support* → **rules/time-series only**; *Student Success/Placement* → **aggregate** at this role.
- **Split:** *Institution Growth & Benchmarking* → **internal growth in v1**, **external benchmarking in v2**.
- **Defer:** *Multi-Campus Analytics* → v2/v3; *Budget Planning & Resource Optimization* → v2; *AI Strategic Planning Assistant* → v3.
- These keep v1 inside locked constraints (advisory-only, read-only NL, fees-scoped finance, rules-first, DPDP, single-tenant/single-campus default) while preserving every capability on the roadmap.

| Feature | Purpose | Priority | Version | Business Owner | Dependencies | Status |
|---|---|---|---|---|---|---|
| Executive Institution Dashboard *(incl. Strategic KPIs)* | Single institution-health pulse | P0 | v1 | Principal/Director | SoT; risk engine; accreditation signal | **Frozen** |
| AI Executive Chat Assistant | NL self-serve answers | P0 | v1 | Principal/Director | Semantic layer; RLS; RBAC | **Frozen** |
| Daily Executive Brief | Proactive morning digest | P0 | v1 | Principal/Director | Health index; anomaly; risk engine | **Frozen** |
| Student Success & Retention Intelligence (aggregate) | Institution at-risk pulse | P1 | v1 | Principal/Dean | Success Engine | **Frozen** |
| Financial Performance Intelligence (fees) | Fee collection/dues visibility | P1 | v1 | Trust/Principal | Fee ingestion | **Frozen** |
| Accreditation & Compliance Intelligence (consume) | Readiness visibility | P1 | v1 | Principal/IQAC liaison | IQAC copilot | **Frozen** |
| Institutional Risk Intelligence | Consolidated risk lens | P1 | v1 | Principal/Director | Risk engine; anomaly detection | **Frozen** |
| AI Executive Reports Generator | Grounded board reports | P1 | v1 | Principal/Director | Semantic layer; NL engine | **Frozen** |
| Admissions & Enrolment Analytics | Intake/enrolment health | P1 | v1 | Principal/Registrar liaison | Admission ingestion | **Frozen** |
| Placement Performance Analytics (aggregate) | Placement pulse | P2 | v1 | Principal/Dean | Placement ingestion | **Frozen** |
| Predictive Decision Support (rules/time-series) | Forward-looking support | P2 | v1 | Principal/Director | Forecasting (rules) | **Frozen** |
| Executive Communication Assistant | Grounded comms drafting | P2 | v1 | Principal/Director | Reports generator | **Frozen** |
| Faculty Workforce Analytics (narrow) | Accreditation-relevant workforce signals | P2 | v1 | Principal/Dean | Faculty ingestion; evidence vault | **Frozen** |
| Institution Growth (internal trends) | Period-over-period growth | P2 | v1 | Principal/Director | SoT trends | **Frozen** |
| Multi-Campus Analytics | Cross-campus roll-up | P2 | v2 | Group Management | Sub-unit RLS | Deferred |
| Budget Planning & Resource Optimization | Data-driven budgeting | P2 | v2 | Trust/Finance | Accounting integration | Deferred |
| External Peer Benchmarking | Cross-institution context | P2 | v2 | Principal/Director | Network scale | Deferred |
| AI Strategic Planning Assistant | Scenario/strategy synthesis | P2 | v3 | Trust/Principal | ML; benchmarking; orchestration | Deferred |

**This is the official Version 1 feature list for the Director / Management AI Assistant. No features are added after this point.**

---

*Prepared as a Phase-1 product-definition artifact. It deliberately contains no implementation detail and is intended as the foundation for subsequent architecture and engineering handoff.*


---

# Director / Management AI Assistant — Role Solution Design Document (RSDD)

**Product:** AI ERP Copilot — *System of Intelligence* on top of the college ERP (*System of Record*)
**Persona:** Director / Management AI Assistant (the *Principal / Management copilot*)
**Document type:** Role Solution Design Document — single source of truth for this role
**Phase:** Phase 1 product definition → engineering handoff
**Status:** Draft for architecture review

> **Reading frame.** This RSDD builds on an existing backend (auth, multi-tenancy, Student 360, three-layer ingestion, audit logging, rules-based Student Success Engine, Postgres RLS). Those are **reused, not redesigned**. The role's V1 scope is governed by the companion *Role Definition & Feature Freeze*: 14 features frozen for V1, with Multi-Campus Analytics, Budget Planning, External Benchmarking, and the Strategic Planning Assistant deferred. Five non-negotiables run through every chapter: **(1)** AI is advisory — humans decide and act; no write-back in V1. **(2)** NL is read-only over a *governed semantic layer*, never raw SQL. **(3)** Hard tenant + sub-unit isolation via RLS; tenant ID injected server-side, never from model output. **(4)** Grounded answers — every figure traces to a real row; the model abstains rather than invent. **(5)** DPDP-Act-2023 governance with minor (under-18) protections. Financial scope is **fees only** in V1.

---

# CHAPTER 1 — Foundations

## 1. Executive Summary

Institutional leadership — the Trust/Chairman, Principal/Director, and Deans — is accountable for the health of the institution yet has no single trustworthy pulse. Today that pulse is reassembled by hand from departmental spreadsheets and ERP exports, each lagging and inconsistent, so decisions that need a same-day view wait days for a manual MIS pull and accreditation surprises surface only at peer-team review.

The **Director / Management AI Assistant** closes that gap. It is the leadership surface of the AI ERP Copilot: a continuously-computed, explainable **Institution Health** layer that answers leadership questions in plain language over governed metrics, detects student/financial/accreditation risk early, and produces grounded, board-ready briefs — all without exposing data the role shouldn't see and without acting on the institution's behalf.

It is deliberately **advisory and read-only** in V1. The copilot prepares decisions; executives make them. This is both a trust posture (no black-box actions on a live institution) and a security posture (the single largest platform risk is cross-tenant data leakage, mitigated by keeping the model away from raw SQL and write paths).

The role reuses the platform's foundations rather than reinventing them: the unified data layer as System of Record mirror, the Student Success Engine for risk, the audit log for traceability, and RLS for isolation. What it adds is the **leadership intelligence layer** on top: the Institution Health Score, the Executive Chat Assistant, the Daily Executive Brief, grounded report generation, and cross-domain risk intelligence. Success is measured not by dashboards shipped but by **daily executive adoption, decisions made faster on traceable evidence, and risks caught before they become crises**.

## 2. Role Definition

**Who this role is.** The highest-authority *read* persona in the platform. It consumes institution-wide intelligence at aggregate and department/programme grain; it is **not** an operational editor of records and **cannot act on the world** in V1.

**What it is accountable for.**
- Maintaining an always-current institution-health pulse (enrolment, attendance, results, fees, placements, at-risk count, accreditation readiness).
- Answering natural-language leadership questions over governed metrics, with reasoning and source rows shown.
- Detecting anomalies and emerging risk early and routing them to the right human owner.
- Producing grounded executive/board briefs.
- Doing all of the above within strict data-governance boundaries.

**What it explicitly is not.** It does not author accreditation documents (IQAC), generate statutory returns (Registrar), run department-internal academic operations (HOD/Academic Head), or perform per-student interventions and parent contact (Faculty/Mentor). It sees aggregates; it does not profile identifiable minors. (Full boundary map in Chapter 4 §19 and the Freeze §10.)

**Relationship to the other copilots.** Same engine, different goal and scope. The five-persona model (Principal/Management, Registrar, Faculty/Mentor, IQAC, Student) means each capability either belongs here as an *aggregate read* or belongs elsewhere as an *operation*. When a requested feature would duplicate another persona's operation, this RSDD scopes it to the leadership read and points to the owning role.

## 3. User Persona

**Primary users:** Trust/Chairman, Principal/Director, Vice-Principal, Deans. (These are also the economic buyers — the purchase decision sits with management/trust + principal/director + registrar; IT and IQAC influence but do not buy.)

**Technical expertise:** Low-to-moderate. Comfortable with dashboards and email; not SQL or BI-tool users. The natural-language interface exists so leadership never writes a query or navigates a menu tree.

**A day in the life (target state):** Open the **Daily Executive Brief** → glance at the Institution Health Score and overnight anomalies → drill into any flag down to department/programme → ask follow-ups in natural language → forward a grounded summary to the board or assign the issue to the responsible head. Assigning and acting happen outside the AI.

**Pain points today:** No single pulse; lagging manual reporting; reactive risk awareness; accreditation panic concentrated at deadline; fragmented fee visibility; dependence on IT/registrar to answer basic questions.

**ERP limitations they hit:** ERPs store transactions but don't synthesise institution-level intelligence, don't answer plain-language questions, and don't proactively flag cross-module risk.

**Authority & scope:** Broadest aggregate read across the tenant; no operational edit rights; no autonomous action.

**Emotional/organisational context:** This user is time-poor, accountability-heavy, and dispute-averse — every number they repeat to a board must be defensible. Traceability is not a nice-to-have; it is the feature.

## 4. Business Goals

- **One trusted pulse, used daily.** Replace reconstructed reports with a single explainable institution-health surface that leadership opens every day.
- **Faster, evidence-based decisions.** Cut time-to-answer for leadership questions from days (manual MIS) to seconds, with every figure traceable.
- **Proactive risk posture.** Catch student-retention, fee-collection, and accreditation-readiness risk before it becomes a crisis.
- **Defensible accreditation posture.** Give leadership year-round visibility into NAAC/NBA/NIRF/AICTE-UGC readiness, reducing DVV/peer-team surprises.
- **Financial clarity (fees).** Real-time visibility into fee collection vs. plan and prior year; early shortfall and dues-concentration warning.
- **Demonstrable outcomes.** Hours saved vs. manual MIS, at-risk students caught, accreditation grade-risk reduced — the metrics that sell renewals.

## 5. Current Problems

**Current executive workflow.** Leadership requests reports from departments and the registrar, waits, reconciles inconsistent spreadsheets into a partial picture, then decides. The cycle is slow, lagging, and dispute-prone. There is no self-serve path — the principal cannot answer "fee collection vs. last year?" without routing through someone.

**Strategic decision-making challenges.** Resource and attention allocation, fee/revenue planning, accreditation prioritisation, and retention strategy are all made on stale, fragmented inputs. The cost of a late decision (a department's results sliding, a collection shortfall, an accreditation gap) is high and the warning arrives late.

**ERP limitations.** The ERP is a system of record optimised for transactions, not insight. It cannot narrate trends, compose a health index across modules, answer natural-language questions, or proactively flag anomalies. Reporting is export-and-reconcile, not ask-and-answer.

**Reporting delays.** A board pack is hand-assembled from multiple exports; by the time it is ready it is already stale, and the figures are only as consistent as the human who reconciled them.

**Fragmented institutional data.** Attendance, marks, fees, placements, and accreditation evidence live in different systems and spreadsheets with inconsistent IDs. No single source of truth means no single answer.

**Governance issues.** Without field-level access control and audit, sensitive financial and minor-student data is either over-shared (everyone gets the spreadsheet) or under-shared (leadership flies blind). There is no record of who saw what.

**How AI transforms executive decision-making.** The copilot converts continuously-ingested operational data into a single explainable pulse; replaces manual reporting with on-demand grounded answers; shifts leadership from reactive to proactive through early-warning detection; and makes every executive claim auditable. Crucially, it does this **without removing the human from the decision** — the AI surfaces, explains, and recommends; the executive decides and acts. That advisory boundary is what makes the system safe to deploy on a live institution and trustworthy enough to be used daily.

---

## 6. Dashboard Design — Director / Management Dashboard

The dashboard is a **calm, credible institutional decision console** — closer to a clinical/operations console than a consumer app. Density with clarity; it is read under time pressure, not admired. It is **privileged-only** (principal/registrar/management/admin); a faculty user cannot route to it, and the server returns only their scope if they try. The signature visual element is the **colour-vision-safe tier language** (colour + text label + shape) reused on every risk surface.

**Layout regions (top to bottom):**

1. **Header / context strip** — institution name, "students assessed across N departments," recency stamp ("Updated N hrs ago"), and a calm non-blocking note if the latest import is partial/failed (links to imports with a re-run action). Never a hard error for stale data.

2. **Daily Executive Brief** (pinned top) — the morning digest: health score delta, top overnight changes, top risks with suggested drill-downs. The single most important adoption driver.

3. **Institution Health Score** — one composite pulse with its **components transparently shown** (no black-box score). Click any component to see what drives it.

4. **Executive KPI row** — KPI cards with tabular figures: enrolment, attendance, results, fee collection, placement rate, at-risk count, accreditation readiness %. Each card carries a trend sparkline and prior-year comparison where data exists, and drills down to department/programme.

5. **Financial Overview (fees)** — collection vs. plan and vs. prior year, outstanding-dues concentration, fee-based forecast. Sensitive surface; least-privilege enforced.

6. **Admissions Dashboard** — funnel and enrolment health vs. target, programme-wise fill, prior-year overlay.

7. **Placement Dashboard** — placement-rate tiles and trend, department/programme breakdown (aggregate; per-student placement work belongs to the TPO).

8. **Academic Performance Summary** — results/attendance aggregates with department drill-down.

9. **Department Comparison** — department × KPI and department × risk-tier **heatmaps** to surface drag and concentration at a glance.

10. **Strategic Alerts** — anomaly and tier-escalation feed (unread count in nav), each alert showing its "why" and a suggested human owner.

11. **AI Recommendations** — prioritised, advisory suggestions ("attention here would move the needle"), each grounded and explainable; never auto-executed.

12. **Quick Actions** — drill down · ask a follow-up · generate a brief/report · assign-to-human (routes a notification; the AI does not act).

13. **AI Chat** — the Executive Chat Assistant, always reachable, with interpretation echo and traceable figures.

14. **Executive Navigation** — left rail by domain (Overview, Financial, Admissions, Placement, Academic, Risk, Accreditation, Reports, Chat). Full hierarchy in Chapter 3 §11.

15. **Cross-campus analytics** — **shown only for multi-campus tenants; deferred to V2 otherwise** (a roll-up region that, when enabled, sits above region 4 and lets group leadership compare campuses then drill into one).

**Designed states (honesty over fabrication):** where a series doesn't exist yet (e.g. a long risk-trend history for a brand-new pilot), show a calm placeholder ("Trend builds as data accumulates") — never a faked line or a call to a non-existent metric. Empty, loading, and error states are first-class, not afterthoughts.

---

# CHAPTER 2 — Complete Feature Catalogue

> Version status is carried from the Feature Freeze. **V1** = frozen for launch; **V1 (scoped)** = included but narrowed to locked constraints; **V2/V3** = deferred (designed here for continuity, not built now). Every feature inherits the five non-negotiables (advisory, read-only NL, RLS isolation, grounded, DPDP).

## 2.1 Executive Institution Dashboard — *V1 (incl. merged Strategic KPI Dashboard)*
- **Purpose:** A single at-a-glance institution-health surface for leadership.
- **User Problem:** No single pulse; leadership reassembles the picture by hand from lagging exports.
- **Business Value:** Faster situational awareness; fewer reporting cycles; demonstrable hours saved.
- **Executive Value:** Open once, know where the institution stands and what changed.
- **Inputs:** Canonical enrolment, attendance, results, fees, placements, at-risk counts, accreditation readiness % — tenant-scoped, aggregate grain.
- **Outputs:** KPI tiles, trend lines, at-risk count, Institution Health Score, anomaly flags, department drill-downs.
- **Expected Behaviour:** Glanceable, current ("updated N hrs ago"), drill-downable to department/programme, every figure traceable.
- **AI Behaviour:** Composes the health index from transparent components; narrates trends; surfaces anomalies; never invents a number; abstains when a metric is ungrounded.
- **User Interaction Flow:** Land → scan health + KPIs → click a tile → department breakdown → ask a follow-up in chat → generate/forward a brief.
- **Required ERP Data:** Enrolment, attendance, internal marks, results, fees, placements (read-only, aggregated).
- **Permissions:** Privileged-only; faculty cannot route here; server returns scope-limited data if called directly.
- **Dependencies:** Unified data layer (SoT); Student Success Engine; accreditation readiness signal; semantic layer.
- **Risks:** Over-cluttering (mitigate with progressive disclosure); stale data presented as fresh (mitigate with recency stamp + designed stale state); KPI misinterpretation (mitigate with "show the why").
- **Future Improvements:** Configurable executive widgets; saved views; multi-campus roll-up (V2/V3).

## 2.2 Multi-Campus Analytics Dashboard — *V2/V3 (deferred)*
- **Purpose:** Cross-campus roll-up and comparison for multi-campus groups.
- **User Problem:** Group leadership lacks a consolidated cross-campus view.
- **Business Value / Executive Value:** Governance across a campus network; outlier campuses surfaced.
- **Inputs:** Per-campus aggregates within the tenant's sub-unit hierarchy.
- **Outputs:** Campus comparison tiles, roll-ups, outliers, drill-into-one-campus.
- **Expected Behaviour:** Roll-up with drill-down; group leadership sees all campuses, a campus head sees only theirs.
- **AI Behaviour:** Cross-campus anomaly detection and ranking; comparative narration.
- **User Interaction Flow:** Group view → compare campuses → drill into one → standard single-campus dashboard.
- **Required ERP Data:** Same as 2.1, partitioned by campus sub-unit.
- **Permissions:** Group-management only; campus-scoped for campus heads (RLS sub-unit).
- **Dependencies:** Sub-unit (campus) scoping in RLS; the single-campus dashboard it inherits from.
- **Risks:** Most pilot/V1 colleges are single-campus — building now is premature; **multi-campus governance is an explicit later-phase capability.**
- **Future Improvements:** This *is* the future enhancement — ship single-campus first, design the seam now.

## 2.3 Financial Performance Intelligence — *V1 (scoped: fees only)*
- **Purpose:** Institution-level visibility into fee collection and dues health.
- **User Problem:** Fragmented fee visibility; cash-flow uncertainty.
- **Business Value:** Revenue/collection planning; early shortfall warning.
- **Executive Value:** Know collection vs. plan and vs. last year at a glance, traceable to records.
- **Inputs:** Canonical fee records (collected, outstanding, schedule).
- **Outputs:** Collection-rate tiles, dues concentration, fee trend, fee-based forecast.
- **Expected Behaviour:** Grounded figures; trace to source; sensitive-surface treatment.
- **AI Behaviour:** Fee-collection forecasting (time-series, explainable); duplicate/outlier anomaly flags; no fabricated projections.
- **User Interaction Flow:** Open Financial → collection vs. plan/prior-year → drill to programme/department → forecast → ask follow-up.
- **Required ERP Data:** Fee module (collections, dues, schedule).
- **Permissions:** Privileged; financial data flagged sensitive; least-privilege; audited access.
- **Dependencies:** Fee ingestion in SoT; forecasting service.
- **Risks:** Treating fees as full finance (mitigate by labelling scope clearly); forecast over-trust (mitigate by showing assumptions + confidence).
- **Future Improvements:** Deeper budgeting once accounting/Tally integration exists (V2).

## 2.4 Admissions & Enrolment Analytics — *V1*
- **Purpose:** Track admissions funnel and enrolment health.
- **User Problem:** No timely view of intake vs. capacity/targets.
- **Business Value / Executive Value:** Intake planning; early shortfall awareness.
- **Inputs:** Admission/enrolment canonical data.
- **Outputs:** Enrolment tiles, trends vs. prior year, programme-wise fill.
- **Expected Behaviour:** Institution → programme drill-down; prior-year overlay where available.
- **AI Behaviour:** Trend narration; anomaly flags on intake shifts.
- **User Interaction Flow:** Open Admissions → funnel/fill → drill to programme → ask follow-up.
- **Required ERP Data:** Admission and enrolment records.
- **Permissions:** Privileged.
- **Dependencies:** Admission/enrolment ingestion.
- **Risks:** Data-quality dependence (mitigate with anomaly flags); no lead-gen/CRM (scope boundary).
- **Future Improvements:** Admissions forecasting (V2).

## 2.5 Placement Performance Analytics — *V1 (scoped: aggregate)*
- **Purpose:** Leadership-level placement outcomes view.
- **User Problem:** No consolidated placement pulse for management.
- **Business Value / Executive Value:** Reputation/positioning; employability oversight.
- **Inputs:** Placement canonical data.
- **Outputs:** Placement-rate tiles, trends, department/programme breakdown.
- **Expected Behaviour:** Aggregate read; drill to department; per-student work excluded.
- **AI Behaviour:** Trend narration; anomaly flags.
- **User Interaction Flow:** Open Placement → rate/trend → drill to department → ask follow-up.
- **Required ERP Data:** Placement records.
- **Permissions:** Privileged.
- **Dependencies:** Placement ingestion; TPO/Placement persona owns operational detail.
- **Risks:** Scope creep into per-student placement-risk (mitigate by routing to TPO role).
- **Future Improvements:** Cohort-level placement-risk forecasting (V2).

## 2.6 Faculty Workforce Analytics — *V1 (scoped: narrow / accreditation-relevant)*
- **Purpose:** Light workforce signals leadership needs — counts, student-faculty ratio, research/extension output for accreditation.
- **User Problem:** No institution view of faculty load/output relevant to NAAC/NBA.
- **Business Value / Executive Value:** Accreditation evidence; staffing awareness.
- **Inputs:** Canonical faculty records; research/publication container (faculty-populated).
- **Outputs:** Headcount, student-faculty ratio, research-output tiles.
- **Expected Behaviour:** Aggregate, accreditation-relevant; no individual scoring.
- **AI Behaviour:** Output aggregation; accreditation gap flags.
- **User Interaction Flow:** Open Faculty → ratios/output → drill to department → ask follow-up.
- **Required ERP Data:** Faculty records; research/extension entries.
- **Permissions:** Privileged; HR data sensitive; **no payroll, no individual appraisal.**
- **Dependencies:** Faculty ingestion; accreditation evidence vault.
- **Risks:** Drifting into HRMS/appraisal (mitigate with explicit scope boundary); faculty data ingestion is a known gap (gate features on it).
- **Future Improvements:** Deeper workforce analytics once HR data is in scope (V2, with privacy/HR sign-off).

## 2.7 Student Success & Retention Intelligence — *V1 (scoped: aggregate)*
- **Purpose:** Institution-level at-risk and retention pulse.
- **User Problem:** Reactive retention; no early aggregate signal for leadership.
- **Business Value / Executive Value:** Retention strategy; earlier (department-level) intervention.
- **Inputs:** Risk engine outputs (tiers, findings) — aggregated.
- **Outputs:** At-risk counts by tier/department; retention trend; risk-type breakdown.
- **Expected Behaviour:** Aggregate read; drill to department, **not** to identifiable-minor profiles beyond governance limits.
- **AI Behaviour:** Aggregate risk ranking; trend narration; explanation of drivers.
- **User Interaction Flow:** Open Risk → at-risk by tier/department → drill to department → ask follow-up → assign to head (human acts).
- **Required ERP Data:** Attendance, internal marks, results (via the Success Engine).
- **Permissions:** Privileged aggregate; **per-student intervention is the Faculty/Mentor role.**
- **Dependencies:** Student Success Engine (rules-based now; ML seam later).
- **Risks:** DPDP minor profiling (mitigate by restricting identifiable minor-level drill-down to the owning role); misreading aggregates as individual judgements (mitigate with clear grain labelling).
- **Future Improvements:** ML-based retention prediction (V2 — the learning loop).

## 2.8 Strategic KPI Dashboard — *MERGED INTO 2.1*
- **Decision:** Maintaining two leadership dashboards splits attention and duplicates tiles. Strategic KPIs become a **configurable view within the Executive Institution Dashboard** (2.1). Capability retained; surface consolidated. No standalone build.

## 2.9 Budget Planning & Resource Optimization — *V2 (deferred)*
- **Purpose:** Data-driven budget planning and resource allocation.
- **User Problem:** No data-driven budgeting at the institution level.
- **Why deferred:** True budgeting needs accounting/expense data the system does not own in V1 (fees-only). Partially served in V1 by fee-driven revenue forecasting (2.3).
- **Inputs (future):** Fee revenue + accounting/expense data.
- **Outputs (future):** Budget scenarios, resource-allocation recommendations.
- **AI Behaviour (future):** Scenario modelling; optimisation suggestions (advisory).
- **Permissions:** Trust/Finance, privileged, sensitive.
- **Dependencies:** Accounting integration (not in V1).
- **Risks:** Building on absent data would produce ungrounded recommendations — explicitly avoided.
- **Future Improvements:** Resource-optimisation once cost data exists (V2).

## 2.10 Accreditation & Compliance Intelligence — *V1 (scoped: read/consume)*
- **Purpose:** Leadership view of accreditation readiness (NAAC/NBA/NIRF/AICTE-UGC).
- **User Problem:** Accreditation surprises at peer-team review; no leadership visibility into readiness.
- **Business Value / Executive Value:** Defensible accreditation posture; fewer DVV-style surprises.
- **Inputs:** IQAC's criterion completeness, evidence %, DVV-risk flags.
- **Outputs:** Readiness %, criterion drag, risk flags at leadership grain.
- **Expected Behaviour:** Leadership **consumes** readiness; does not author SSR/AQAR/SAR.
- **AI Behaviour:** Readiness summarisation; risk surfacing; no document drafting from this role.
- **User Interaction Flow:** Open Accreditation → readiness % → criterion drag → drill → ask follow-up → assign gap owner (IQAC acts).
- **Required ERP Data:** Operational metrics already mapped by IQAC; evidence completeness signals.
- **Permissions:** Privileged read.
- **Dependencies:** IQAC copilot (owns drafting and evidence).
- **Risks:** Boundary blur with IQAC (mitigate by read-only consumption; drafting stays with IQAC).
- **Future Improvements:** Predictive readiness scoring (V2).

## 2.11 AI Executive Reports Generator — *V1*
- **Purpose:** On-demand grounded executive/board reports.
- **User Problem:** Manual, slow, dispute-prone report assembly.
- **Business Value / Executive Value:** Board-ready output in minutes; auditable; consistent.
- **Inputs:** Governed metrics; NL request.
- **Outputs:** Grounded report (every figure traced); exportable.
- **Expected Behaviour:** Echoes its interpretation; abstains when no governed metric fits; human approves before circulation.
- **AI Behaviour:** Grounded drafting + figure binding (numbers from the warehouse, never invented).
- **User Interaction Flow:** Request in NL ("board pack for this term") → preview grounded draft → edit → export/share.
- **Required ERP Data:** All aggregate metrics in scope.
- **Permissions:** Privileged; export/share governed.
- **Dependencies:** Semantic layer; NL query engine.
- **Risks:** Ungrounded prose creeping in (mitigate by figure-binding + abstention); premature circulation (mitigate by human-approval gate).
- **Future Improvements:** Scheduled board packs (V2).

## 2.12 Institutional Risk Intelligence — *V1*
- **Purpose:** Consolidated institutional risk lens (student + fee + accreditation + data-quality anomalies).
- **User Problem:** Risk scattered across modules; no single risk view; reactive.
- **Business Value / Executive Value:** Proactive, prioritised risk awareness.
- **Inputs:** Risk engine, fee anomalies, accreditation flags, data-quality anomalies.
- **Outputs:** Ranked institutional risks with reasons + suggested owner.
- **Expected Behaviour:** Every flag shows its "why"; routes to a human owner; no auto-remediation.
- **AI Behaviour:** Cross-domain anomaly detection; prioritisation; explanation.
- **User Interaction Flow:** Open Risk Intelligence → ranked risks → expand "why" → assign owner (human acts).
- **Required ERP Data:** Attendance/marks/results, fees, accreditation signals, ingestion anomalies.
- **Permissions:** Privileged.
- **Dependencies:** Success Engine; anomaly detection; accreditation signal.
- **Risks:** Alert fatigue (mitigate with prioritisation + materiality thresholds).
- **Future Improvements:** Outcome-trained risk ranking (V2).

## 2.13 Predictive Decision Support — *V1 (scoped: rules/time-series; ML → V2)*
- **Purpose:** Forward-looking support for leadership decisions.
- **User Problem:** Decisions made on lagging data.
- **Business Value / Executive Value:** Plan ahead on collection and academic trajectory.
- **Inputs:** Fee history, attendance/marks trends.
- **Outputs:** Fee-collection forecast; attendance/marks trajectory projections.
- **Expected Behaviour:** Explainable, advisory; assumptions and confidence shown.
- **AI Behaviour:** **Rules/time-series only in V1** — no ML/black-box scoring.
- **User Interaction Flow:** Open a KPI → "project forward" → forecast with assumptions → ask follow-up.
- **Required ERP Data:** Fees, attendance, marks.
- **Permissions:** Privileged.
- **Dependencies:** Forecasting service (rules/time-series).
- **Risks:** Over-trust in projections (mitigate by showing method/assumptions); scope creep to ML (explicitly deferred).
- **Future Improvements:** ML predictive models once outcome-labelled data accumulates (V2).

## 2.14 Executive Communication Assistant — *V1*
- **Purpose:** Draft grounded leadership communications (board notes, departmental asks, digest narratives).
- **User Problem:** Time spent composing data-backed updates.
- **Business Value / Executive Value:** Faster, consistent, evidence-linked communication.
- **Inputs:** Grounded metrics; NL intent.
- **Outputs:** Draft text with linked figures; human edits and sends.
- **Expected Behaviour:** Drafts only; **does not send** on the user's behalf; no impersonation of real individuals in persuasive content.
- **AI Behaviour:** Grounded drafting (same discipline as accreditation narratives).
- **User Interaction Flow:** "Draft a note to the CSE HOD about the results dip" → grounded draft → edit → copy/send manually.
- **Required ERP Data:** Whatever metrics the message references.
- **Permissions:** Privileged.
- **Dependencies:** Semantic layer; reports generator.
- **Risks:** Autonomous-send expectation (mitigate by draft-only boundary).
- **Future Improvements:** Template library (V2).

## 2.15 Institution Growth & Benchmarking — *V1 (internal) / V2 (external, deferred)*
- **Purpose:** Growth tracking and peer comparison.
- **User Problem:** No internal growth narrative; no external context.
- **Business Value / Executive Value:** Trend-informed growth decisions; positioning.
- **Inputs (V1):** Internal time-series (enrolment, results, placement, fee health).
- **Outputs (V1):** Internal growth trends and narration.
- **Expected Behaviour:** No external benchmark until network scale exists; no fabricated comparatives.
- **AI Behaviour:** Internal trend analysis; honest abstention on external comparison in V1.
- **User Interaction Flow:** Open Growth → period-over-period trends → narration → ask follow-up.
- **Required ERP Data:** Historical aggregates.
- **Permissions:** Privileged.
- **Dependencies (V2):** Cross-institution network scale for anonymous benchmarking.
- **Risks:** Faking external benchmarks (explicitly avoided).
- **Future Improvements:** Anonymous peer benchmarking once the network is large enough (V2).

## 2.16 AI Strategic Planning Assistant — *V3 (deferred)*
- **Purpose:** Scenario-based strategic planning support.
- **Why deferred:** Sits in the autonomous-insight / institutional-optimisation tier (Yr 3–5). Presumes predictive ML, benchmarking, and write-capable orchestration that V1 excludes.
- **Outputs (future):** Scenario plans, strategy synthesis (advisory).
- **AI Behaviour (future):** Multi-factor scenario modelling.
- **Permissions:** Trust/Principal, privileged.
- **Dependencies:** ML; benchmarking; orchestration.
- **Risks:** Premature autonomy on a live institution.
- **Future Improvements:** Scenario planning and AI-driven strategy synthesis (V3).

## 2.17 AI Executive Chat Assistant — *V1 (core)*
- **Purpose:** Natural-language Q&A over the institution's governed data.
- **User Problem:** Leadership can't self-serve answers without IT/menus/SQL.
- **Business Value / Executive Value:** Answers in seconds; the adoption wedge.
- **Inputs:** NL question.
- **Outputs:** Grounded answer + interpretation echo + traceable figures.
- **Expected Behaviour:** Refuses/abstains when no governed metric fits ("I can't answer that from your data"); never free-generates numbers; read-only.
- **AI Behaviour:** Intent/entity parse → semantic selection (not raw SQL) → read-only, tenant-scoped, RLS-enforced execution → grounded response.
- **User Interaction Flow:** Ask → see interpretation echo → answer with sources → drill or refine → optionally generate a report from the answer.
- **Required ERP Data:** All governed metrics in scope, gated by role.
- **Permissions:** Privileged; metric/grain visibility gated by RBAC.
- **Dependencies:** Governed semantic layer; RLS; RBAC metric gating.
- **Risks:** NL-to-SQL leakage (the #1 platform risk — mitigated by no raw SQL, server-injected tenant, allow-listing, red-teaming); hallucinated figures (mitigated by grounding + abstention).
- **Future Improvements:** Saved/shared queries; richer metric coverage (V2).

## 2.18 Daily Executive Brief — *V1 (core)*
- **Purpose:** Proactive morning digest of what changed and what needs attention.
- **User Problem:** Leadership shouldn't have to go looking for the day's risks.
- **Business Value / Executive Value:** Drives daily adoption; turns the tool into a habit.
- **Inputs:** Overnight metric deltas, new anomalies, tier escalations, deadlines.
- **Outputs:** Short grounded brief: health score, top changes, top risks, suggested drill-downs.
- **Expected Behaviour:** Concise, grounded, scannable; links into the dashboard; no automatic action.
- **AI Behaviour:** Summarisation + prioritisation of overnight change.
- **User Interaction Flow:** Receive/open brief → scan → click into a flagged item → act/assign.
- **Required ERP Data:** Deltas across all in-scope metrics.
- **Permissions:** Privileged; consent-aware delivery (email/app).
- **Dependencies:** Health index; anomaly detection; risk engine.
- **Risks:** Noise (mitigate with materiality thresholds); delivery to wrong recipient (mitigate with role-scoped delivery + audit).
- **Future Improvements:** Configurable cadence and channel (V2).

---

# CHAPTER 3 — Experience & Requirements

## 8. User Journeys

**J1 — Morning pulse (the daily habit).** The Principal opens the app → the Daily Executive Brief is pinned at top → health score is up 1 point, but CSE results dipped and one fee-collection anomaly is flagged → she clicks the results flag → department breakdown shows the dip is concentrated in two programmes → she opens chat, asks "is attendance also down there?" → grounded answer with sources → she assigns the issue to the CSE HOD (a notification; the AI does not act) → done in under three minutes.

**J2 — Financial review (fees).** The Trust opens Financial Overview → collection is 6% behind prior-year at this point in term → drills into dues concentration → final-year dues dominate → asks chat to forecast end-of-term collection → forecast with stated assumptions and confidence → generates a one-page grounded note for the next trust meeting.

**J3 — Admissions check.** The Director opens Admissions → one programme is 20% under fill vs. target → drills to the funnel → asks "how did this programme fill last year by this date?" → prior-year comparison → flags it for the admissions head.

**J4 — Placement oversight.** The Dean opens Placement → overall rate steady, but one department lags → drills to department → asks chat for the trend over three years → grounded trend → notes it for review (per-student work routed to the TPO).

**J5 — Accreditation readiness.** The Principal opens Accreditation → NAAC readiness 78%, two criteria dragging → expands the drag → assigns gap owners to IQAC (IQAC owns the drafting; leadership only consumes and routes).

**J6 — Risk triage.** A Strategic Alert fires overnight (a tier escalation cluster in one department) → the Principal opens Risk Intelligence → ranked risks with "why" → the top item is an attendance-driven cluster → assigns to the HOD and mentor chain (humans act).

**J7 — Board pack.** Before a board meeting, the Director asks the Reports Generator for "this term's institution summary" → grounded draft assembled from governed metrics → edits the narrative → exports → every figure in the pack traces to source.

## 9. AI Conversation Flows (illustrative)

> All answers are grounded, echo the interpretation, and abstain when ungrounded. Numbers shown are illustrative of *behaviour*, not real data.

**C1 — Institutional performance review**
> **Director:** How are we doing this term overall?
> **AI:** Reading institution-level metrics for the current term (vs. prior year). Health score 82 (▲1). Attendance steady (81%); results down 3 pts, concentrated in CSE; fee collection 6% behind plan; placements steady. Want me to drill into the CSE results dip or the collection gap?

**C2 — Financial analysis (fees)**
> **Director:** Why is fee collection behind?
> **AI:** Outstanding dues are concentrated in final-year (62% of the gap), driven by a cluster of unpaid third-instalments. This is collection timing, not a fee-structure change. Source: fee records as of today. Shall I forecast end-of-term collection?

**C3 — Admission forecasting**
> **Director:** Will we hit our intake target for the ECE programme?
> **AI:** On current funnel velocity vs. last year's same-date pace, ECE is tracking ~12% below target. This is a rules/time-series projection, not an ML prediction — assumptions shown. Confidence: moderate (small daily volumes). Want the prior-year overlay?

**C4 — Placement analysis**
> **Director:** Which department is dragging placements?
> **AI:** Mechanical is 9 pts below the institution rate this cycle. I can show the three-year trend, but per-student placement-risk work sits with the TPO copilot — I'll keep this at the aggregate level.

**C5 — Budget planning** *(boundary-aware)*
> **Director:** Build me a full department budget plan.
> **AI:** I can plan around **fee revenue and collection** today, but full budgeting needs expense/accounting data the platform doesn't yet hold — so I'd be guessing on the cost side. I can give you a fee-revenue forecast now, or flag full budgeting for the V2 accounting integration. Which would you like?

**C6 — Risk assessment**
> **Director:** What should I worry about today?
> **AI:** Top three, ranked by materiality: (1) attendance-driven at-risk cluster in CSE-3A — assign mentor review; (2) fee-collection shortfall in final-year — finance follow-up; (3) NAAC Criterion 2 evidence gap — IQAC. Each links to its "why." Want me to draft assignment notes?

**C7 — Strategic planning** *(boundary-aware)*
> **Director:** Plan our five-year growth strategy.
> **AI:** Full scenario strategy planning is a later-phase capability (it needs predictive models and benchmarking we don't run yet). What I *can* do now: show internal growth trends across enrolment, results, placement, and fee health, and narrate what's moving. Shall I?

**C8 — Executive report generation**
> **Director:** Draft the board summary for this term.
> **AI:** Drafting from governed metrics. Here's a grounded summary — every figure links to source. Review and edit before circulating; I won't send it for you.

**C9 — Policy decision (advisory boundary)**
> **Director:** Should we raise the attendance threshold to 80%?
> **AI:** I can model the impact: at 80%, the at-risk count rises from 297 to ~middle-400s based on current distributions (shown by department). That's the data; the policy call is yours. Want the department-by-department impact table?

## 10. Dashboard Widgets

| Widget | Purpose | Data Source | User Interaction | Refresh | Permissions |
|---|---|---|---|---|---|
| Institution Health Score | Single composite pulse, components shown | Health index over canonical metrics | Click a component to see drivers | On ingestion / scheduled | Privileged |
| KPI Card (per KPI) | Headline metric + trend + prior-year | Canonical aggregates | Click to drill to department/programme | On ingestion | Privileged |
| Daily Executive Brief | Overnight changes + top risks | Deltas, anomalies, risk engine | Click an item to drill | Daily (scheduled) | Privileged, consent-aware |
| Financial Overview (fees) | Collection vs. plan/prior-year, dues | Fee records | Drill to programme; request forecast | On ingestion | Privileged, sensitive |
| Admissions Funnel | Intake vs. target, fill | Admission/enrolment | Drill to programme | On ingestion | Privileged |
| Placement Rate | Aggregate placement outcomes | Placement records | Drill to department | On ingestion | Privileged |
| Department Comparison Heatmap | KPI / risk-tier concentration | Canonical aggregates + risk engine | Hover/click a cell to drill | On ingestion | Privileged |
| Strategic Alerts | Anomaly + escalation feed | Anomaly detection, risk engine | Open, expand "why", assign | Near-real-time on detection | Privileged |
| AI Recommendations | Prioritised advisory suggestions | Risk + metrics synthesis | Accept-as-task (human acts) | On compute | Privileged |
| Accreditation Readiness | Readiness % + criterion drag | IQAC signals | Drill, assign gap owner | On IQAC update | Privileged read |
| Quick Actions | Drill / ask / generate / assign | n/a (actions) | Click | n/a | Privileged |
| AI Chat | NL Q&A | Semantic layer | Ask, refine, drill | Live | Privileged, role-gated metrics |
| Cross-Campus Roll-up *(V2)* | Compare campuses | Per-campus aggregates | Compare, drill into one | On ingestion | Group-management |

**Stale/empty/error states are designed for every widget:** a partial import shows a calm non-blocking note; an absent series shows "builds as data accumulates"; a failed metric shows an explainable error, never a fabricated value.

## 11. Navigation

```
Director / Management AI Copilot
├── Overview (Executive Institution Dashboard)        ← default landing
│   ├── Daily Executive Brief (pinned)
│   ├── Institution Health Score
│   └── Executive KPI row → drill to department/programme
├── Financial (fees)
│   ├── Collection vs. plan / prior-year
│   ├── Dues concentration
│   └── Fee forecast
├── Admissions & Enrolment
├── Placement
├── Academic Performance
├── Department Comparison (heatmaps)
├── Risk Intelligence
│   ├── Strategic Alerts
│   └── AI Recommendations
├── Accreditation & Compliance (read)
├── Reports (AI Executive Reports Generator)
├── Chat (AI Executive Chat Assistant)               ← always reachable
└── [Cross-Campus]  (visible only for multi-campus tenants — V2)
```

Navigation is **role-gated server-side**: a faculty user never sees this rail and cannot route into it; a campus head (future) sees only their campus sub-tree.

## 12. Functional Requirements (by capability)

- **FR-1 Health Score:** compute a composite institution-health index from transparent components; expose each component's drivers; recency-stamp every value.
- **FR-2 KPI drill-down:** every institution-level KPI drills to department then programme without leaving the dashboard.
- **FR-3 NL Q&A:** accept a leadership question, echo the interpretation, return a grounded answer with source references, and abstain when no governed metric fits.
- **FR-4 Daily Brief:** generate a scheduled, role-scoped, consent-aware digest of overnight deltas, anomalies, escalations, and deadlines.
- **FR-5 Financial (fees):** show collection vs. plan and prior-year, dues concentration, and an explainable fee forecast; treat as sensitive.
- **FR-6 Admissions / Placement / Academic / Faculty aggregates:** show institution-level tiles with department drill-down and prior-year overlay where data exists.
- **FR-7 Risk Intelligence:** consolidate student/fee/accreditation/data-quality risk into a prioritised, explainable feed with suggested human owners; support assign-to-human (notification only).
- **FR-8 Accreditation (read):** present readiness %, criterion drag, and DVV-risk flags consumed from IQAC; support assign-gap-owner.
- **FR-9 Reports:** generate grounded executive/board reports with figure binding; require human approval before export/share.
- **FR-10 Communication Assistant:** draft grounded leadership communications; never auto-send.
- **FR-11 Predictive (rules):** produce explainable fee/academic projections with stated assumptions and confidence; no ML in V1.
- **FR-12 Designed states:** every surface implements loading, empty, partial-data, and error states without fabricating values.
- **FR-13 Audit:** log every query, answer, drill, report, and assignment with actor, scope, and timestamp.
- **FR-14 Boundaries:** the role performs no operational writes, authors no accreditation/statutory documents, and exposes no identifiable-minor profiling.

## 13. Non-Functional Requirements

- **Performance:** dashboard first meaningful render fast under realistic tenant data; NL answers return in seconds; reports generate without blocking the UI (progressive render). Analytics read path is decoupled from transactional writes (separate serving layer + caching).
- **Reliability:** grounded answers or honest abstention — never a fabricated figure; idempotent ingestion so a re-import doesn't double-count.
- **Scalability:** multi-tenant; aggregate queries are bulk (no per-student loops) and scale with institution size; caching for hot KPIs.
- **Availability:** leadership-critical surfaces (dashboard, brief, chat) prioritised; degraded-but-honest states when a dependency is down.
- **Accessibility:** WCAG-AA contrast; colour-vision-safe tier encoding (colour + label + shape); tabular figures aligned in columns; keyboard navigable.
- **Security:** RLS tenant + sub-unit isolation; server-injected tenant ID; RBAC metric gating; no raw SQL from the model; full audit. (Detail in Chapter 4 §17.)
- **Maintainability:** reuse existing backend surfaces (scoping, audit, RLS, the `404-not-403` existence-hiding pattern) rather than redesigning per feature.
- **Observability:** every NL query and answer logged and explainable; anomaly/forecast outputs carry method + assumptions; metrics on adoption and answer-grounding rates.
- **Executive reporting performance:** board-pack generation stays responsive on large tenants; exports stream rather than block.

---

# CHAPTER 4 — Architecture & Security

## 14. High-Level AI Architecture *(no implementation detail)*

The Director AI is a **reasoning-and-recommendation layer**, not an action layer. Its architecture is shaped by one rule: the model never touches raw data or write paths directly.

- **Executive AI reasoning.** Leadership questions are parsed for intent and entities, mapped to **governed semantic-layer selections** (metric, dimensions, filters, grain) — never to free-form SQL. Deterministic code turns the selection into a parameterised, read-only, RLS-enforced query. The model reasons over *returned rows*, not over an open database.
- **Strategic decision support.** The AI assembles the grounded picture behind a decision (the relevant metrics, trends, and risks) and recommends; it does not decide. Every recommendation is advisory and carries its evidence.
- **Predictive analytics.** V1 uses **rules/time-series** forecasting (fees, attendance/marks trajectory) with stated assumptions and confidence. ML scoring is a V2 seam, deliberately not wired in V1, so outputs stay explainable.
- **Institution-wide context building.** Context is composed from canonical aggregates within the authenticated tenant scope only. No cross-tenant context, ever. The model sees what RBAC permits at the grain RBAC permits.
- **Tool usage.** The AI's "tools" are governed metric retrieval, the risk engine, anomaly detection, and the report/communication drafters — all read-only and grounded. There is no write tool in V1.
- **Recommendation engine.** Prioritises risks and suggestions by materiality; each recommendation links to its drivers and a suggested human owner.
- **Risk intelligence.** Cross-domain anomaly detection feeds a ranked, explainable risk feed; signals flow rules → flags + reasons → alert/suggest, with outcomes (when logged by the owning role) feeding the future ML learning loop.
- **Human approval.** Reports and communications are drafts requiring human approval before circulation; assignments are notifications, not actions. The institution acts outside the AI.
- **Explainability.** Every figure traces to a row; every flag shows its "why"; the model echoes its interpretation so misreads are caught; when no governed metric fits, it abstains ("I can't answer that from your data").

## 15. Data Requirements

- **Financial data (fees only):** collections, outstanding dues, fee schedule. *No general ledger, no payroll.*
- **Admissions data:** funnel/intake and enrolment aggregates.
- **Academic data:** attendance, internal marks, results — **aggregate/department grain** for this role.
- **Placement data:** outcomes at aggregate/department grain.
- **Faculty data:** headcount, student-faculty ratio, research/extension output relevant to accreditation. *No payroll/appraisal.*
- **Institutional KPI data:** the full health-pulse set, tenant-scoped.
- **Compliance data:** accreditation readiness %, criterion completeness, DVV-risk flags (consumed from IQAC).
- **Executive reports:** grounded, exportable, every figure traced.
- **Read-only vs editable:** **everything is read-only for this role.** Leadership consumes intelligence; it does not maintain records or author documents.
- **Data ownership:** the ERP remains the **System of Record**; the AI layer owns derived intelligence + audit, not source records.
- **Privacy considerations:** no cross-tenant data ever; **no identifiable-minor profiling** (aggregates only at this role; minor-level drill-down and parent contact belong to Faculty/Mentor under the consent gate); no individual payroll/appraisal; raw PII at scale is out of role; every access logged, scoped, explainable; DPDP notice/purpose-limitation/retention honoured.

## 16. High-Level API Summary *(categories only — no contracts)*

- **ERP integrations:** read-only ingestion connectors (file/Sheets/CSV first; Tier-1 API next) feeding the unified data layer — reused, not redesigned.
- **Financial (fees) services:** fee aggregates and forecast endpoints over canonical fee data.
- **Admissions services:** admission/enrolment aggregate retrieval.
- **Placement services:** placement aggregate retrieval.
- **Analytics services:** institution-level KPI, health-index, department-comparison, and anomaly aggregates (bulk, role-scoped).
- **AI services:** NL → semantic-selection → read-only grounded query; report/communication drafting; risk synthesis; all behind RBAC and audit.
- **Reuse:** the existing risk summary surfaces (institution and by-department, role-scoped) are the foundation the leadership analytics extend.

*(Contracts, schemas, and infrastructure are intentionally out of scope here and designed in a later phase.)*

## 17. Security Considerations

- **Executive RBAC:** broad aggregate read; **no write/edit/delete on operational data; no document authoring; no autonomous action.** Metric and grain visibility gated by role.
- **Least privilege:** the role gets exactly the aggregate reads it needs and nothing more; sensitive surfaces (financial, faculty) carry tighter gating and audit.
- **Data governance:** DPDP-aware — notice, purpose limitation, minimisation, retention, grievance, consent lifecycle; minor handling enforced platform-wide.
- **Financial data protection:** fees flagged sensitive; access least-privileged and audited; export/share governed.
- **Audit logging:** every query, answer, drill, report, assignment logged with correct actor attribution, scope, and timestamp (the existing audit surface is reused; actor-attribution correctness is a known watch-item from prior verification).
- **AI safety:** grounded-or-abstain; advisory-only; human-approval gates on reports/communications; no impersonation of real public figures in generated content.
- **Prompt-injection protection:** the model emits semantic selections, not SQL; queries are allow-listed to known-safe shapes; tenant ID is server-injected from the session (never from model output); content ingested from documents/data is treated as untrusted and cannot escalate to actions; adversarial/red-team testing on isolation (the #1 risk).
- **Sensitive-data handling:** no identifiable-minor profiling; no payroll/appraisal; PII minimised to the aggregate grain the role needs.
- **Executive approval workflows:** reports/communications require human approval before circulation; assignments are notifications a human acts on.
- **Multi-tenancy:** hard isolation via Postgres RLS (ENABLED + FORCED + policy on every tenant table); a future tenant table missing its RLS block is caught by the RLS-coverage test — isolation cannot regress silently.
- **Compliance:** India/DPDP for V1; region-ready but not region-live for international (explicitly out of V1 scope).

## 18. Error Handling

- **Missing institutional data:** show a designed empty state ("builds as data accumulates"); never fabricate a value or call a non-existent metric.
- **AI failures:** on parse/grounding failure, abstain with a clear message and offer a narrower question; never guess a number.
- **Financial data delays / stale import:** show a calm non-blocking note with the import's recompute status and a re-run affordance; mark figures as of their last-good timestamp.
- **Permission failures:** enforce server-side; for hidden resources use the `404-not-403` existence-hiding pattern so the UI never leaks what exists out of scope.
- **Analytics failures:** degrade to the last cached good value with a staleness marker, or an explainable error — not a blank or a fake.
- **External service failures:** isolate the failing domain (e.g. a connector) so the rest of the dashboard stays usable; surface a scoped, honest status.
- **Partial responses:** render what is grounded, clearly mark what is missing, and offer a retry; never blend a real figure with an inferred one without labelling.

## 19. Edge Cases

- **Brand-new pilot, no history:** trends and forecasts have insufficient data → show "builds as data accumulates," suppress low-confidence projections.
- **Single-campus tenant:** cross-campus nav hidden entirely (not greyed) — the capability is V2.
- **Faculty user reaches a leadership URL:** UX guard hides the rail; server returns their scope only (or 404 for out-of-scope resources).
- **Minor-heavy first-year cohort:** aggregate risk shows, but identifiable-minor drill-down is blocked at this role; parent-contact actions are not available here.
- **Ungrounded question** ("predict our NIRF rank next year"): abstain; explain the boundary; offer the grounded alternative.
- **Conflicting source records** (a student counted in two departments): anomaly flag surfaces rather than silently double-counting; reconciliation routed to Registrar.
- **Stale/failed import mid-morning:** brief and dashboard mark data as of last-good time; offer re-run; do not present stale as fresh.
- **Fee duplicate/impossible entry:** anomaly detection flags it; financial tiles annotate the affected figure.
- **Boundary-overlap request** ("draft our AQAR section"): decline and route to IQAC; this role consumes accreditation, it doesn't author it.
- **Autonomous-action request** ("email all HODs the at-risk list"): draft only; never send; explain the advisory boundary. (And minor-related contents respect consent rules owned by the Faculty flow.)
- **Export of sensitive financial data:** governed and audited; least-privilege check at export time, not just view time.
- **Multi-campus head over-reach:** a campus head (future) cannot see sibling campuses — RLS sub-unit enforced, not UI-only.

---

# CHAPTER 5 — Delivery

## 20. Success Metrics

- **Executive adoption:** % of leadership users opening the Daily Brief on active days; weekly active leadership; chat questions per leader per week. *(Target: a daily habit, not a monthly login.)*
- **Decision quality / traceability:** % of executive answers with a source trace (target ~100%); rate of "where did this number come from" disputes (target → 0).
- **Time saved:** median time-to-answer for a leadership question (target: seconds vs. days); hours saved per month vs. manual MIS assembly.
- **Strategic insights:** number of risks surfaced *before* they became crises; % of anomalies acknowledged/assigned within a day.
- **Report-generation efficiency:** time to produce a board pack (target: minutes); % of report figures auto-grounded.
- **Forecast accuracy:** backtested error of fee/academic projections; calibration of stated confidence vs. realised outcome.
- **Grounding / safety:** abstention-when-ungrounded rate (should be high on out-of-scope questions); zero cross-tenant leakage in red-team tests; zero fabricated figures in audited samples.
- **User satisfaction:** leadership CSAT/qualitative trust score; would-recommend.

## 21. Testing Checklist

- **Functional:** every FR-1…FR-14 exercised; drill-downs resolve to correct grain; assignments route as notifications only; reports require approval before export.
- **UX:** loading/empty/partial/error states render on every widget; tier language is colour-vision-safe (colour + label + shape); tabular figures align; keyboard + screen-reader paths.
- **AI evaluation:** grounding (every figure traces to a returned row); interpretation-echo present; abstention on ungrounded/out-of-scope questions; boundary-routing (accreditation→IQAC, per-student→Faculty/TPO, statutory→Registrar); no hallucinated numbers in an eval set.
- **Security validation:** RLS coverage test passes (every tenant table ENABLED+FORCED+policy); faculty cannot reach leadership data via URL (UX guard + server scope + `404-not-403`); tenant ID never sourced from model output; prompt-injection red-team (no SQL escape, no action escalation, no cross-tenant); financial export least-privilege + audit.
- **Performance:** dashboard render and NL latency under realistic tenant volumes; bulk aggregates (no per-student loops); report generation non-blocking; analytics read path decoupled from writes.
- **Executive acceptance testing:** real leadership users complete J1–J7 unaided; the Daily Brief is judged trustworthy; board pack figures reconcile to source; minor-data and boundary guards hold under attempted over-reach.

## 22. Implementation Roadmap

> Reuses the existing backend (auth, multi-tenancy, ingestion, Student 360, risk engine, audit, RLS). The dashboard inherits from the already-built Faculty Risk Board / Student 360 design system and the existing role-scoped risk summary surfaces.

**Phase A — Leadership read foundation (priority 1).** Executive Institution Dashboard (incl. merged Strategic KPIs), Institution Health Score, KPI drill-downs, Department Comparison. *Dependencies:* canonical aggregates + risk summary surfaces (exist). *Deliverable:* a privileged, role-gated, honest-state dashboard. *Risk:* over-cluttering — mitigate with progressive disclosure.

**Phase B — The adoption wedge (priority 1).** AI Executive Chat Assistant + Daily Executive Brief. *Dependencies:* governed semantic layer, RBAC metric gating, anomaly/risk feed. *Deliverable:* self-serve grounded answers + the daily habit. *Risk:* NL-to-SQL leakage and hallucination — mitigate with no-raw-SQL, grounding, abstention, red-teaming.

**Phase C — Domain analytics (priority 2).** Financial (fees), Admissions, Placement, Academic, narrow Faculty Workforce, Accreditation (read), Institutional Risk Intelligence. *Dependencies:* respective ingestion (note: faculty-data ingestion is a known gap — gate Faculty Workforce on it). *Deliverable:* the full leadership read surface. *Risk:* fees-vs-finance scope confusion — mitigate with explicit labelling.

**Phase D — Generation & foresight (priority 2).** AI Executive Reports Generator, Executive Communication Assistant, Predictive Decision Support (rules/time-series), Institution Growth (internal). *Dependencies:* grounded drafting + figure binding; forecasting service. *Deliverable:* grounded board packs, drafts, explainable projections. *Risk:* ungrounded prose / over-trusted forecasts — mitigate with figure binding + stated assumptions + human approval.

**Phase E — Hardening & acceptance.** Audit completeness, RLS-coverage, prompt-injection red-team, performance, executive acceptance (J1–J7). *Deliverable:* sign-off-ready V1.

**Deferred (post-V1):** Multi-Campus Analytics, Budget Planning & Resource Optimization, External Peer Benchmarking, ML predictive models, AI Strategic Planning Assistant — see §23.

**Cross-cutting risks:** data-quality on ingestion (mitigate with anomaly reports + designed stale states); alert fatigue (materiality thresholds); boundary blur with IQAC/Registrar/Faculty (enforced routing + scope).

## 23. Future Scope

**Version 1 (frozen):** Executive Institution Dashboard (incl. Strategic KPIs) · Financial Performance Intelligence (fees) · Admissions & Enrolment Analytics · Placement Performance Analytics (aggregate) · Faculty Workforce Analytics (narrow) · Student Success & Retention Intelligence (aggregate) · Accreditation & Compliance Intelligence (consume) · AI Executive Reports Generator · Institutional Risk Intelligence · Predictive Decision Support (rules) · Executive Communication Assistant · Institution Growth (internal) · AI Executive Chat Assistant · Daily Executive Brief.

**Version 2 — advanced predictive & planning:** Multi-Campus Analytics · ML-based Predictive Decision Support & retention prediction (learning loop) · Budget Planning & Resource Optimization (post accounting integration) · External Peer Benchmarking (network-scale dependent) · Placement-risk forecasting · scheduled board packs · saved/shared NL queries · deeper Faculty Workforce (with HR/privacy sign-off).

**Version 3 — autonomous & governance:** AI Strategic Planning Assistant (scenario planning) · multi-campus governance · proactive/autonomous institutional insight · advanced forecasting · AI-driven institutional optimisation — consistent with the long-term arc *Copilot → Intelligence Platform → Education Data Cloud → University OS.*

---

## Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Product (CPO) | | Approve / Revise | |
| Principal Architect | | Approve / Revise | |
| Security Architect | | Approve / Revise | |
| AI Lead | | Approve / Revise | |
| Engineering Lead | | Approve / Revise | |

**Open decisions to ratify before build:**
1. **Director-vs-Academic-Head/HOD boundary** — confirm the aggregate-read line in §2 / §19 against the canonical persona roster.
2. **Financial scope** — confirm fees-only for V1 (Budget Planning stays V2 unless accounting integration is brought forward).
3. **Faculty Workforce gating** — confirm it waits on faculty-data ingestion + privacy/HR sign-off.

*This RSDD is the single source of truth for the Director / Management AI Assistant. It deliberately excludes API contracts, schemas, infrastructure, and code, which are designed in a later phase.*
