# HOD_AI_Complete_Design_v1.0

**Version:** v1.0  
**Generated:** June 27, 2026

---

This document combines the **Role Definition & Feature Freeze** and the **Role Solution Design Document (RSDD)** for the HOD AI Assistant.

---

# Role Definition & Feature Freeze Document
## Role: HOD (Head of Department) AI Assistant

**Product:** AI Intelligence Layer for College ERP (System of Record = existing ERP)
**Phase:** Phase 1 — Product Definition
**Status:** Draft for review → Feature Freeze on sign-off
**Scope rule for this role (the single most important line in this document):**
The HOD AI Assistant operates **at the department boundary** — it sees, analyses, and acts on **one department's** students, faculty, courses, and outcomes. It is **not** an institution-wide role (that is the Principal/Management copilot) and **not** a cohort-only role (that is the Faculty/Mentor copilot). Every section below inherits this boundary.

> **Platform constraints that bind every feature (locked, not re-litigated here):**
> 1. The **ERP remains the System of Record.** The AI layer reads, analyses, drafts, and recommends. It **does not autonomously write back** to the ERP in v1 — it proposes; a human acts; the ERP commits.
> 2. **AI is advisory and grounded.** Every flag, number, and recommendation traces to underlying records ("show the why"). The AI never free-generates numbers and falls back to *"I can't answer that from the data"* rather than guessing.
> 3. **DPDP Act 2023 by design.** The institution is the Data Fiduciary; a child is **under 18**; behavioural tracking / detrimental profiling of minors is prohibited and **not waivable by consent**. Minor-handling and consent gating apply to this role wherever student-level data is touched.
> 4. **Tenant + department isolation** is enforced server-side, never from anything the model produces.

---

## 1. Role Overview

### Why this role exists
In an Indian higher-education institution, the **Head of Department** is the accountable owner of a single academic department's outcomes — its students' progression, its faculty's teaching, its subjects' results, its accreditation contribution, and its placement and research standing. Today the HOD is the most **data-starved decision-maker** in the institution: the Principal gets institution dashboards, the Registrar owns the statutory record, faculty hold their own cohorts — but the HOD must *assemble the department's truth manually*, by chasing spreadsheets, marks registers, attendance exports, and faculty emails. The HOD AI Assistant exists to give the department head a **single, continuously-updated, department-scoped view of reality** and a decision-support layer on top of it.

### Responsibilities (what the human HOD owns, which this role serves)
- Department academic health: pass rates, attendance, internal-assessment trends, backlogs.
- Early identification and follow-through on at-risk students in the department.
- Subject- and faculty-level performance oversight within the department.
- Equitable faculty workload and section/lab allocation.
- Syllabus coverage and pace against the academic calendar.
- The department's **contribution** to institutional accreditation (NAAC/NBA criteria, OBE attainment) — *contribution, not ownership; IQAC owns and signs.*
- Department placement readiness and research/publication standing (visibility, not the drives themselves).
- Departmental meetings, reviews, and decisions, and the records thereof.

### Business objectives this role supports
- Lift department pass/progression rates and cut attrition by catching risk early.
- Reduce accreditation effort and DVV surprises by keeping department evidence continuously ready.
- Improve faculty utilisation and fairness in load distribution.
- Give leadership a credible, drillable department story without manual report assembly.

### Daily workflow (the shape of the HOD's day with this role)
1. Open the **Daily AI Brief** — what changed overnight, what needs attention today.
2. Glance at the **Department Health Dashboard** — KPIs, anomalies, drill points.
3. Triage the **Department Risk Overview** — which students moved into watch/high, and why; assign or review interventions (mentors act; HOD oversees).
4. Spot-check **Subject** and **Syllabus** signals where a brief flagged a problem.
5. Handle the day's specific job — a report for the Principal, an accreditation gap, a workload rebalance, a meeting to prepare — using the relevant feature.
6. Ask follow-up questions in natural language (**Decision Support**) instead of building reports.

### Success criteria for the role
- The HOD starts the day in the Brief, not in spreadsheets.
- Time-to-answer for a typical department question drops from hours to minutes.
- At-risk students are identified and acted on **earlier** (measured against intervention timestamps and outcomes).
- Accreditation/department evidence is "review-ready," not "rebuild-from-scratch."
- Every number the HOD presents upward is traceable and trusted.

### Problems this role faces today
- **Fragmentation:** the department's truth is scattered across ERP modules, LMS exports, and faculty spreadsheets.
- **Latency:** by the time a problem (failing subject, dropping attendance, syllabus slippage) is visible, the term is half over.
- **Manual reporting tax:** HODs spend disproportionate time assembling reports for the Principal, IQAC, and accreditation cycles.
- **No early-warning system:** student risk is noticed at result-declaration, not before.
- **Opaque comparisons:** "is this subject/faculty/section actually a problem, or is it normal variance?" is hard to answer with evidence.

### How AI improves this role
- **Aggregation → instant:** the department view is assembled continuously, not on demand.
- **Surfacing → proactive:** anomalies, risk movements, and slippage are pushed (Brief/alerts), not pulled.
- **Reporting → drafted:** AI produces a first draft with linked evidence; the HOD reviews and owns it.
- **Questions → conversational:** NL replaces report-building for ad-hoc questions.
- **Always grounded:** every AI output shows its evidence, keeping the HOD's upward communication defensible.

---

## 2. Role Goals

**Business goals**
- Raise department pass/progression rates and reduce attrition.
- Strengthen the department's accreditation contribution (criterion completeness, OBE attainment, evidence readiness).
- Improve faculty utilisation and placement/research visibility as institutional differentiators.

**Operational goals**
- One continuously-updated department view replacing manual assembly.
- Earlier detection of academic, attendance, and syllabus-pace problems.
- Faster, lower-effort department reporting to leadership and IQAC.

**Productivity goals**
- Cut the HOD's time spent assembling data and reports by a large, measurable margin.
- Make routine department questions answerable in natural language without analyst help.
- Auto-prepare recurring artifacts (briefs, review packs, meeting agendas from ERP data).

**AI goals**
- Summarise, analyse, compare, and explain department data on demand and proactively.
- Surface *why* — every flag carries its evidence; no black-box scores.
- Stay strictly within the department's data scope and within DPDP minor constraints.

**Automation goals**
- Automate the *gathering, drafting, and alerting* steps — never the *deciding* or *committing* steps.
- Generate first drafts (reports, briefs, agendas) that a human finalises.
- Keep all write-actions to the ERP human-in-the-loop in v1.

**Decision-support goals**
- Help the HOD prioritise (which students/subjects/faculty need attention first).
- Help the HOD compare (this term vs last, this section vs another, against department norms).
- Help the HOD reason about options (workload rebalances, intervention focus) with evidence — without making the decision for them.

---

## 3. User Profile

**Who uses this role**
The Head of Department of a single academic department (e.g., HOD–CSE), and — by delegation — a Deputy HOD or department coordinator acting on the HOD's behalf within the same department scope. A faculty member is *not* an HOD; a Principal/Dean is *above* this scope.

**Technical expertise**
Domain-expert academic, **not technical**. Comfortable with dashboards and Excel-level analysis; not expected to write queries, understand schemas, or interpret raw exports. The interface must be natural-language-first and explanation-rich. (This matches the platform's core "NL-native for non-technical staff" thesis.)

**Daily activities**
Reviewing department health, triaging at-risk students, overseeing faculty and syllabus progress, preparing reports and meetings, responding to leadership/IQAC asks, and making department-level academic and resourcing decisions.

**Pain points**
Manual data assembly; late visibility of problems; the reporting tax; inability to compare with evidence; juggling many disconnected systems and faculty spreadsheets.

**Current ERP frustrations**
ERPs store data but don't *surface* department-level intelligence; reports are rigid and report-after-the-fact; nothing is proactive; cross-module questions ("attendance vs internal marks by section") require manual joining; no natural-language access.

**Information required**
Department-scoped: student academics/attendance/risk, subject results, faculty teaching load and output, syllabus coverage, accreditation criterion contribution, placement readiness, research/publication standing, complaints/grievances within the department.

**Authority level**
Department-bounded leadership. Can view all department data, trigger AI analysis, draft and export department reports, and **approve department-internal items** (e.g., a workload plan, an intervention assignment within the department). **Cannot** approve institution-level or statutory items, cannot edit the ERP record of marks/attendance directly through this layer, and cannot see other departments' data.

**Decision-making responsibilities**
Owns department-level decisions: where to focus interventions, how to allocate faculty load and sections, which subjects/faculty need support, what to escalate to the Principal/IQAC, and what the department reports upward. The AI supports these; it does not make them.

---

## 4. Feature Catalog

> Naming note: three features are renamed in §12 for boundary clarity. This catalog uses the **final** names and flags the original where it differs.

### 4.1 Department Health Dashboard
- **Purpose:** the HOD's single-glance command view of department health.
- **Problem solved:** the daily manual assembly of "how is my department doing?"
- **Business value:** faster, evidence-based oversight; earlier problem detection.
- **User value:** one screen replaces a folder of spreadsheets.
- **Inputs required:** department students, attendance, internal/external marks, results, fees-context (read-only), at-risk counts, syllabus status.
- **Outputs produced:** KPI tiles, trends, anomaly flags, drill-down entry points.
- **Dependencies:** unified data layer; risk engine; semantic layer for metrics.
- **AI involvement:** anomaly detection, trend narration, prioritised "what to look at."
- **Expected behaviour:** read-only, always department-scoped, evidence behind every tile.
- **Permissions:** View, Trigger AI, View Analytics, Export. No edit/approve/delete.
- **Limitations:** no other-department data; no raw record editing; no statutory MIS.
- **Future enhancements:** configurable tiles; saved views; predictive trend bands (V3, ML seam).

### 4.2 Department Risk Overview *(renamed from "Student Risk Prediction" — see §12)*
- **Purpose:** the department-aggregate + drill-down view of at-risk students.
- **Problem solved:** risk noticed too late; no department-level risk picture.
- **Business value:** lower attrition; earlier, better-targeted intervention.
- **User value:** ranked at-risk list with reasons, by section/subject, for the whole department.
- **Inputs required:** attendance, academic decline signals, fee-context flags, prior history (from the Student Success Engine).
- **Outputs produced:** ranked at-risk students with **reasons + evidence**, distribution by tier, movement since last compute, drill to Student 360.
- **Dependencies:** Student Success Engine (rules-based `RiskEvaluator`); faculty/mentor assignment; intervention log.
- **AI involvement:** rules-based risk scoring with explicit findings; prioritisation; (ML prediction is a future seam, not v1).
- **Expected behaviour:** explainable tiers (high/watch/low) with color+label; never a black-box score.
- **Permissions:** View, Trigger AI, View Analytics, Export. Can review/oversee interventions; mentors create/own them.
- **Limitations:** **rules-based, not predictive ML in v1.** Minor students: parent-contact interventions require **guardian-consent gate**; behavioural profiling of minors is prohibited.
- **Future enhancements:** ML risk model behind the existing seam (V3); cohort comparison.

### 4.3 Subject Performance Analytics
- **Purpose:** show how each subject in the department is performing and where it's failing students.
- **Problem solved:** "is this subject a problem, or normal variance?" — currently unanswerable with evidence.
- **Business value:** targeted academic remediation; OBE/attainment insight for accreditation.
- **User value:** per-subject pass rates, mark distributions, section comparisons, outliers.
- **Inputs required:** internal/external marks, assessments, enrollments, section mapping.
- **Outputs produced:** subject-level analytics, section comparisons, flagged outliers with evidence.
- **Dependencies:** unified data layer; semantic-layer metrics; assessment ordering (`assessment_date`).
- **AI involvement:** outlier detection, comparison narration, "why this subject is flagged."
- **Expected behaviour:** read-only; department subjects only; comparisons grounded in real data.
- **Permissions:** View, Trigger AI, View Analytics, Export.
- **Limitations:** no editing of marks; no cross-department subjects; correlation ≠ causation framing required.
- **Future enhancements:** attainment mapping to course outcomes; historical term trends.

### 4.4 Faculty Performance Analytics *(recommended V2 — see §12)*
- **Purpose:** give the HOD a view of teaching output and effectiveness for *own-department* faculty.
- **Problem solved:** no consolidated, evidence-based view of faculty teaching outcomes.
- **Business value:** targeted faculty development; appraisal input; accreditation faculty metrics.
- **User value:** per-faculty results, coverage, feedback synthesis (where available).
- **Inputs required:** faculty–course mapping, results by faculty's sections, student feedback, syllabus coverage. **(Several inputs — structured feedback, appraisal data — may not exist in the v1 SoT; this is why it's V2.)**
- **Outputs produced:** faculty teaching-output summaries with evidence.
- **Dependencies:** faculty data model; feedback ingestion; **appraisal governance policy** (HR-sensitive).
- **AI involvement:** synthesis and comparison — strictly grounded, never an "AI rating of a person."
- **Expected behaviour:** own-department faculty only; advisory; evidence-linked; no automated judgments about individuals.
- **Permissions:** View, View Analytics, Export — gated to own department; **no AI-generated personnel verdicts.**
- **Limitations:** HR-sensitive; must not become detrimental profiling of staff; needs institutional appraisal policy and feedback data before it's honest. **Hence V2.**
- **Future enhancements:** appraisal-cycle integration; development recommendations (V3).

### 4.5 Faculty Workload Optimizer
- **Purpose:** help the HOD distribute teaching load and sections fairly across department faculty.
- **Problem solved:** opaque, often inequitable manual workload allocation.
- **Business value:** better utilisation; fewer overload/underload disputes.
- **User value:** current-load view + AI-suggested rebalancing options.
- **Inputs required:** faculty–course/section mapping, contact hours, lab/tutorial loads, timetable constraints.
- **Outputs produced:** load picture + **suggested** rebalances (advisory).
- **Dependencies:** timetable/section data; faculty data model.
- **AI involvement:** optimisation suggestions with rationale and constraints shown.
- **Expected behaviour:** **suggests** options; the HOD decides; nothing is committed to the ERP automatically.
- **Permissions:** View, Trigger AI, Approve (department-internal plan), Export.
- **Limitations:** advisory only; no auto-assignment; quality bounded by timetable-data availability.
- **Future enhancements:** constraint-aware scheduling; what-if scenarios.

### 4.6 Syllabus Progress Monitor
- **Purpose:** track syllabus coverage against the academic calendar, per subject/section.
- **Problem solved:** syllabus slippage discovered too late.
- **Business value:** on-time completion; better exam outcomes; accreditation evidence.
- **User value:** coverage % vs plan, behind-schedule flags, by subject and faculty.
- **Inputs required:** syllabus plan, coverage updates (from faculty/LMS), calendar.
- **Outputs produced:** coverage status, slippage alerts with evidence.
- **Dependencies:** syllabus-plan data; coverage-update source (LMS or faculty entry).
- **AI involvement:** slippage detection, pace projection, prioritised alerts.
- **Expected behaviour:** read/analytical; flags, doesn't reschedule.
- **Permissions:** View, Trigger AI, View Analytics, Export.
- **Limitations:** depends on coverage being recorded somewhere ingestible; no auto-rescheduling.
- **Future enhancements:** projected completion dates; auto-nudges to faculty.

### 4.7 Complaint Analytics *(V1 — conditional on a grievance/complaint data source — see §12)*
- **Purpose:** surface patterns in department-related complaints/grievances.
- **Problem solved:** complaints handled case-by-case with no pattern visibility.
- **Business value:** systemic issue detection; DPDP grievance-redressal support.
- **User value:** themes, volumes, trends, recurring issues — department-scoped.
- **Inputs required:** a grievance/complaint feed scoped to the department. **(If no such feed is ingested, this degrades to manual tagging — the reason it carries a data dependency.)**
- **Outputs produced:** theme extraction, volume/trend analytics, flagged recurrences.
- **Dependencies:** **grievance/complaint data source** (the gating dependency).
- **AI involvement:** theme/sentiment extraction, trend surfacing.
- **Expected behaviour:** read-only analytics; privacy-aware; no exposure of complainant identity beyond authority.
- **Permissions:** View, Trigger AI, View Analytics — sensitive-data access gated.
- **Limitations:** entirely dependent on complaint data existing in the SoT; strict privacy handling.
- **Future enhancements:** resolution-time analytics; escalation suggestions.

### 4.8 Department Report Generator *(renamed from "AI Report Generator" — see §12)*
- **Purpose:** draft department-internal reports from live data.
- **Problem solved:** the manual reporting tax.
- **Business value:** hours saved; consistent, evidence-linked reporting upward.
- **User value:** "draft my department review for the Principal" → a grounded first draft.
- **Inputs required:** department metrics across modules; the report's intent (NL prompt or template).
- **Outputs produced:** drafted report with **linked evidence and real numbers**; exportable.
- **Dependencies:** semantic layer; export pipeline.
- **AI involvement:** grounded drafting (numbers from the warehouse, never invented), formatting.
- **Expected behaviour:** drafts; the HOD reviews, edits, and owns the final; export only after human review.
- **Permissions:** Create (draft), Edit, Export, Share, Trigger AI.
- **Limitations:** **department/internal reports only — NOT statutory MIS** (that is the Registrar). No invented figures.
- **Future enhancements:** report templates; scheduled department digests.

### 4.9 Accreditation Contribution (Department) *(renamed from "Accreditation Assistant" — see §12)*
- **Purpose:** keep the department's accreditation contribution continuously ready.
- **Problem solved:** annual accreditation panic; last-minute department evidence scramble.
- **Business value:** fewer DVV surprises; stronger criterion completeness.
- **User value:** "what's my department missing for Criterion X?" with linked evidence.
- **Inputs required:** department metrics mapped to NAAC/NBA criteria; uploaded evidence; OBE attainment.
- **Outputs produced:** department criterion completeness %, gap list, evidence back-links, **draft department sections**.
- **Dependencies:** **IQAC Intelligence module owns the institution-level framework**; this feature feeds it.
- **AI involvement:** data→criterion mapping, gap detection, grounded drafting (department scope).
- **Expected behaviour:** the HOD prepares and submits the department's contribution; **IQAC owns, validates, and signs** the institutional submission.
- **Permissions:** View, Create (draft), Edit, Export, Trigger AI — department criteria only.
- **Limitations:** **does NOT own or submit institutional SSR/AQAR/SAR.** No final sign-off authority. No cross-department criteria.
- **Future enhancements:** automated department evidence tagging; consistency pre-checks.

### 4.10 Placement Readiness Dashboard *(V1 read-only view — placement *operations* belong to a future Placement role — see §12)*
- **Purpose:** show the department's placement readiness.
- **Problem solved:** no department-level visibility into who's placement-ready and gaps.
- **Business value:** improved placement %, an accreditation/marketing metric.
- **User value:** eligibility, readiness gaps, offers/standing — department-scoped.
- **Inputs required:** placement/eligibility data (CGPA, backlogs, skills, offers). **(May be partially absent from v1 SoT — flagged dependency.)**
- **Outputs produced:** readiness summary, gap flags, drill to students.
- **Dependencies:** placement data source; future Placement Officer role for the drives themselves.
- **AI involvement:** readiness gap detection, prioritisation.
- **Expected behaviour:** **read-only view** for the HOD; the HOD does not run placement drives here.
- **Permissions:** View, View Analytics, Export.
- **Limitations:** no placement-drive management (that's a separate role); bounded by placement data availability.
- **Future enhancements:** readiness coaching suggestions; employer-fit analytics.

### 4.11 Resource Planning
- **Purpose:** help the HOD plan department teaching resources (sections, labs, rooms, slots) — advisory.
- **Problem solved:** ad-hoc, manual resource allocation.
- **Business value:** better utilisation; fewer clashes.
- **User value:** current allocation view + suggested plans.
- **Inputs required:** sections, labs, rooms, timetable, enrolment projections.
- **Outputs produced:** allocation view + **suggested** plans.
- **Dependencies:** timetable/infrastructure data.
- **AI involvement:** suggestion + constraint surfacing.
- **Expected behaviour:** advisory; the HOD approves a department plan; no ERP auto-write.
- **Permissions:** View, Trigger AI, Approve (department plan), Export.
- **Limitations:** advisory; bounded by infrastructure data; no booking commitment in v1.
- **Future enhancements:** scenario planning; capacity forecasting.

### 4.12 Meeting Assistant *(recommended V2 — see §12)*
- **Purpose:** prepare for and capture department meetings.
- **Problem solved:** unstructured meeting prep and lost action items.
- **Business value:** decisions tracked to closure.
- **User value:** AI-prepared agenda packs from live department data; action-item capture.
- **Inputs required (V1-possible):** department data for an **agenda pack**. **Inputs required (the valuable part, V2):** meeting **transcripts/notes** — *which do not live in the ERP/SoT.*
- **Outputs produced:** agenda pack (V1-feasible); minutes/action-item extraction (V2).
- **Dependencies:** **meeting data source** (transcription/notes ingestion) for the core value.
- **AI involvement:** agenda drafting from data; later, summarisation and action extraction.
- **Expected behaviour:** drafts; humans own minutes and decisions.
- **Permissions:** Create (draft), Edit, Export, Share, Trigger AI.
- **Limitations:** the high-value capability depends on data outside the SoT. **Hence V2.**
- **Future enhancements:** action-item tracking to closure; integration with calendar/meeting tools.

### 4.13 Decision Support AI *(scope-tightened — see §12)*
- **Purpose:** the department's **natural-language question + compare/scenario** surface.
- **Problem solved:** ad-hoc department questions still require report-building.
- **Business value:** decisions made faster, on evidence.
- **User value:** "Which sections are dragging CSE pass rates and why?" → grounded answer.
- **Inputs required:** the NL question; the department's governed semantic layer.
- **Outputs produced:** grounded answers, comparisons, prioritised lists, explained — with the *"can't answer from the data"* fallback.
- **Dependencies:** semantic layer; read-only, department-scoped query execution.
- **AI involvement:** NL→semantic-layer query, comparison, prioritisation, explanation.
- **Expected behaviour:** read-only; never invents numbers; always department-scoped; explainable.
- **Permissions:** Trigger AI, View, View Analytics, Export (of answers).
- **Limitations:** read/analytical only; not a write-action engine; not a substitute for the HOD's judgment.
- **Future enhancements:** what-if scenario simulation (V3); saved/shared questions.

### 4.14 Research Dashboard *(recommended V2 — see §12)*
- **Purpose:** show the department's research/publication standing.
- **Problem solved:** no consolidated department research view.
- **Business value:** research is a key accreditation and reputation metric.
- **User value:** publications, citations, projects, funding — department-scoped.
- **Inputs required:** research data that is **externally sourced** (Scopus, funding portals) — a *hybrid* per the IQAC design; faculty populate much of it.
- **Outputs produced:** research standing summary, gaps.
- **Dependencies:** **external research-data ingestion / faculty entry** (not in v1 SoT).
- **AI involvement:** synthesis of available data; gap surfacing.
- **Expected behaviour:** honest "structured container + reminders" model, not false full automation.
- **Permissions:** View, View Analytics, Export.
- **Limitations:** data lives outside operational systems; v1 can offer a container at best. **Hence V2.**
- **Future enhancements:** connector-based publication sync; impact analytics.

### 4.15 Daily AI Brief
- **Purpose:** the HOD's morning department digest — what changed, what needs attention.
- **Problem solved:** the HOD has to go hunting for what's important each day.
- **Business value:** proactive attention on the right things; nothing slips.
- **User value:** a short, prioritised, evidence-linked brief on open.
- **Inputs required:** overnight changes across department risk, attendance, results, syllabus, complaints, deadlines.
- **Outputs produced:** prioritised summary with drill links.
- **Dependencies:** all department data feeds; the other features as drill targets.
- **AI involvement:** summarisation, prioritisation, anomaly surfacing.
- **Expected behaviour:** read-only push; every item links to its evidence; department-scoped.
- **Permissions:** View, Trigger AI, Export.
- **Limitations:** quality bounded by data freshness; no actions taken from the brief automatically.
- **Future enhancements:** configurable priorities; delivery to email/app; "since you last looked" framing.

---

## 5. Dashboard Overview

**Widgets** — department KPI tiles (pass rate, attendance, at-risk count, syllabus coverage, placement readiness %, accreditation contribution %), each evidence-linked and drillable.
**Cards** — "Highest-risk students now," "Subjects flagged," "Behind-schedule syllabus," "Faculty load outliers."
**Charts** — risk-tier distribution, attendance/mark trends, subject pass-rate comparison, syllabus coverage vs plan. All numbers tabular and traceable; trend charts show a calm placeholder until enough history accrues (no faked trends).
**Quick Actions** — "Draft department report," "Ask a question" (Decision Support), "Review interventions," "Prepare meeting agenda," "Recompute risk."
**Notifications** — risk movements, anomaly flags, syllabus slippage, accreditation gaps, deadlines; unread count in nav.
**KPIs** — the department-scoped metric set above; never institution-wide; never another department's.
**Search** — within department entities (students/subjects/faculty).
**AI Chat** — persistent NL surface (Decision Support), read-only, department-scoped, with the "can't answer from the data" fallback.
**Navigation** — role-aware: the HOD sees department views only; institution-overview nav (the Principal's view) is not shown and is server-blocked if called directly.
**Daily Summary** — the Daily AI Brief, surfaced on landing.

---

## 6. AI Capabilities (and why each exists)

- **Summarize** — turn the department's scattered data into a daily brief and report drafts. *Why: kill the assembly and reporting tax.*
- **Analyze** — find what's happening inside subjects, sections, attendance, syllabus. *Why: replace manual joining of modules.*
- **Predict / Forecast** — *flagged: rules-based now.* Project syllabus completion and surface risk trajectories; true ML prediction is a future seam. *Why: shift from reactive to proactive — honestly scoped.*
- **Recommend** — suggest workload rebalances, resource plans, intervention focus. *Why: support decisions without making them.*
- **Automate** — automate gathering, drafting, and alerting (never deciding/committing). *Why: save time while keeping humans accountable.*
- **Explain** — show the evidence behind every flag and number. *Why: trust and DPDP/defensibility; no black-box scores.*
- **Compare** — section vs section, term vs term, subject vs department norm. *Why: distinguish real problems from normal variance.*
- **Alert** — push risk movements, slippage, gaps, deadlines. *Why: nothing important should require hunting.*
- **Prioritize** — rank what needs the HOD's attention first. *Why: the HOD's time is the scarce resource.*
- **Generate** — first-draft reports, briefs, agenda packs, accreditation department sections. *Why: a reviewed draft beats a blank page.*

Every capability is **department-scoped, read/analytical or draft-only, grounded in real data, and explainable.** None writes to the ERP autonomously; none profiles minors behaviourally.

---

## 7. Permission Matrix (Least Privilege)

Scope qualifier on every row: **own department only.** "Approve" means *department-internal* approval (a plan, an intervention assignment), never institutional/statutory sign-off. "Trigger AI" is always read/analytical or draft-only. Direct editing of ERP records (marks/attendance/fees) is **not** granted to this role through the AI layer — that stays in the ERP with its owning roles.

| Feature | View | Create | Edit | Delete | Approve | Export | Share | Trigger AI | View Analytics | Access Sensitive Data |
|---|---|---|---|---|---|---|---|---|---|---|
| Department Health Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ aggregate only |
| Department Risk Overview | ✅ | ❌* | ❌ | ❌ | ⚠️ oversee | ✅ | ⚠️ | ✅ | ✅ | ⚠️ minor-gated |
| Subject Performance Analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Faculty Performance Analytics *(V2)* | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ HR-gated | ✅ | ✅ | ⚠️ HR-sensitive |
| Faculty Workload Optimizer | ✅ | ✅ draft | ✅ draft | ❌ | ✅ dept plan | ✅ | ✅ | ✅ | ✅ | ❌ |
| Syllabus Progress Monitor | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Complaint Analytics *(dep.)* | ✅ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ privacy-gated |
| Department Report Generator | ✅ | ✅ draft | ✅ | ❌ | ⚠️ dept only | ✅ | ✅ | ✅ | ✅ | ⚠️ within dept |
| Accreditation Contribution (Dept) | ✅ | ✅ draft | ✅ | ❌ | ❌ (IQAC signs) | ✅ | ✅ | ✅ | ✅ | ⚠️ within dept |
| Placement Readiness Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ within dept |
| Resource Planning | ✅ | ✅ draft | ✅ draft | ❌ | ✅ dept plan | ✅ | ✅ | ✅ | ✅ | ❌ |
| Meeting Assistant *(V2)* | ✅ | ✅ draft | ✅ | ⚠️ own drafts | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Decision Support AI | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ answers | ✅ | ✅ | ✅ | ⚠️ within dept |
| Research Dashboard *(V2)* | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Daily AI Brief | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ minor-gated |

✅ granted · ❌ denied · ⚠️ conditional/gated. *“Create” on Risk Overview is ❌ for the HOD because **mentors** create/own interventions; the HOD **oversees** (⚠️ Approve).* No feature grants **Delete** of records (append-only/audit-safety property of the platform) beyond a user's own unsubmitted drafts.

---

## 8. Data Access

**What this role needs (department-scoped, read/analytical):**
Department students' academics, attendance, internal/external marks, results, risk findings, and intervention history; department subjects and sections; department faculty teaching mapping, load, and (V2) performance inputs; syllabus plans/coverage; department accreditation criterion data and evidence; department placement readiness; department research standing (V2); department complaints (where a feed exists); relevant deadlines.

**What should never be accessible to this role:**
- **Other departments' data** of any kind.
- **Institution-wide aggregates beyond the department** (the Principal's view).
- **Statutory/MIS record ownership** (the Registrar's domain) — the HOD can report internally, not generate or own statutory returns.
- **Direct ERP write access** to marks/attendance/fees through this layer.
- **Minor students' behavioural profiles** — prohibited by DPDP §9(3), not waivable by consent.
- **Sensitive personal data beyond legitimate educational purpose** (e.g., raw guardian PII, financial detail beyond fee-context flags).

**Data ownership:** the **ERP owns the record**; the AI layer holds a read/analytical projection. The HOD owns *department decisions and the reports they author*, not the underlying records.

**Data sensitivity (tiers this role touches):**

| Sensitivity | Examples | HOD access |
|---|---|---|
| Low | Aggregate department KPIs, subject pass rates | Full (read) |
| Medium | Individual student academics/attendance/risk (department) | Read, evidence-linked, audited |
| High | Minor-student data; complaints/grievances; faculty performance (V2) | Gated, minimised, audited; minor behavioural profiling **prohibited** |
| Out of scope | Other departments; statutory record; raw financials; institution-wide PII | **No access** |

**Cross-role restrictions:** HOD ⊂ department; below Principal (institution), beside Registrar (statutory) and IQAC (accreditation ownership), above Faculty (cohort). No upward or sideways data reach.

**Privacy considerations:** DPDP-by-design — purpose limitation, data minimisation, consent lifecycle (parent-contact interventions for minors require the guardian-consent gate), full audit of access, and the standing prohibition on detrimental profiling of minors regardless of consent.

---

## 9. Workflow Summary (per feature — flow only, no implementation)

Standard pattern: **Trigger → AI → ERP (read) → Response → Human Approval (if any) → Completion.** "ERP" here is always a *read*; no feature writes to the ERP autonomously in v1.

| Feature | Trigger | AI | ERP (read) | Response | Human Approval | Completion |
|---|---|---|---|---|---|---|
| Dept Health Dashboard | HOD opens / data updates | Detect anomalies, narrate trends, prioritise | Reads dept metrics | KPIs + flags + drill points | — | HOD informed |
| Dept Risk Overview | HOD opens / recompute | Rules-based scoring + findings + ranking | Reads signals/history | Ranked at-risk + reasons | Mentor acts; HOD oversees | Intervention logged by mentor |
| Subject Performance | HOD opens / asks | Outlier + comparison analysis | Reads marks/assessments | Subject analytics + flags | — | HOD informed |
| Faculty Performance *(V2)* | HOD opens | Grounded synthesis (no person-ratings) | Reads teaching output/feedback | Faculty output summary | — (appraisal stays human) | HOD informed |
| Workload Optimizer | HOD requests rebalance | Suggest options + constraints | Reads load/timetable | Suggested plans | **HOD approves dept plan** | Plan adopted (acted via ERP by owner) |
| Syllabus Monitor | Coverage updates / HOD opens | Slippage detection + projection | Reads plan/coverage | Coverage status + alerts | — | HOD informed / nudges faculty |
| Complaint Analytics | New complaints / HOD opens | Theme + trend extraction | Reads grievance feed | Patterns + recurrences | — | HOD informed |
| Dept Report Generator | HOD requests report | Grounded drafting | Reads dept metrics | Draft report + evidence | **HOD reviews & owns** | Exported/shared |
| Accreditation Contribution | HOD opens / IQAC asks | Criterion mapping + gap + draft | Reads dept criterion data | Completeness + gaps + draft | **IQAC validates & signs** | Submitted into IQAC flow |
| Placement Readiness | HOD opens | Readiness gap detection | Reads placement data | Readiness summary + gaps | — | HOD informed |
| Resource Planning | HOD plans | Suggest allocation + constraints | Reads infra/timetable | Suggested plan | **HOD approves dept plan** | Plan adopted by owner |
| Meeting Assistant *(V2)* | HOD prepares meeting | Draft agenda; (V2) summarise notes | Reads dept data | Agenda pack / minutes draft | **HOD owns minutes** | Finalised by HOD |
| Decision Support AI | HOD asks (NL) | NL→semantic query, compare, explain | Reads dept semantic layer | Grounded answer / "can't answer" | — | HOD informed |
| Research Dashboard *(V2)* | HOD opens | Synthesis + gaps | Reads research data (hybrid) | Research standing + gaps | — | HOD informed |
| Daily AI Brief | Daily / on open | Summarise + prioritise overnight changes | Reads all dept feeds | Prioritised brief + links | — | HOD starts the day |

---

## 10. Out of Scope (what this role must NEVER do)

- **Never access or act on other departments' data.** Department boundary is absolute.
- **Never see or produce institution-wide views** — that is the Principal/Management copilot.
- **Never generate or own statutory MIS / AICTE-UGC returns** — that is the Registrar copilot.
- **Never own, validate, or sign the institutional SSR/AQAR/SAR** — the HOD *contributes*; **IQAC owns and signs.**
- **Never write directly to the ERP** (marks, attendance, fees, records) through the AI layer. AI suggests; humans act in the ERP.
- **Never run placement drives or own placement operations** — HOD gets a read-only readiness view; drives belong to a future Placement role.
- **Never auto-assign workload/resources** without explicit HOD approval.
- **Never produce an AI "rating" or behavioural profile of a faculty member** as a verdict (HR-sensitive; advisory and evidence-linked only).
- **Never behaviourally profile or track minor students** — prohibited by DPDP §9(3), not waivable by consent.
- **Never invent numbers** — grounded answers only; explicit "can't answer from the data" fallback.
- **Never replace the HOD's judgment** — the role is decision *support*, not decision *automation*.

**Overlap firewall (explicit):** Faculty = own cohort; HOD = own department; Principal = whole institution; Registrar = statutory record; IQAC = accreditation ownership; (future) Placement role = placement operations. The HOD never crosses into another's lane.

---

## 11. Future Features (versioned)

**Version 1 (this freeze — engineering handoff):**
Department Health Dashboard · Department Risk Overview (rules-based) · Subject Performance Analytics · Faculty Workload Optimizer (advisory) · Syllabus Progress Monitor · Complaint Analytics (dependency-flagged) · Department Report Generator · Accreditation Contribution (Department) · Placement Readiness Dashboard (read-only) · Resource Planning (advisory) · Decision Support AI (NL/compare) · Daily AI Brief.

**Version 2 (after V1 proves out + data/governance prerequisites met):**
Faculty Performance Analytics (needs feedback data + appraisal governance) · Meeting Assistant (needs meeting-notes/transcript ingestion) · Research Dashboard (needs external research-data connectors) · Complaint resolution-time analytics · Configurable dashboards & saved views · Brief delivery to email/app.

**Version 3 (mature / ML seam filled):**
Predictive ML risk model (filling the existing `RiskEvaluator` seam) · What-if scenario simulation in Decision Support · Projected syllabus-completion forecasting · Faculty-development recommendations · Constraint-aware scheduling for workload/resources · Cross-term/cohort benchmarking (department-scoped).

---

## 12. Final Feature Freeze

### Recommended changes before freeze (with reasoning, as requested)

**Renames (3):**
1. **"Student Risk Prediction" → "Department Risk Overview."** The engine is **rules-based with an ML seam**, not predictive ML in v1, and the product explicitly avoids black-box scores. "Prediction" overpromises and invites a capability we don't yet ship. The new name also disambiguates from the **Faculty** cohort risk board (faculty-scope) — the HOD version is the **department aggregate + drill-down**.
2. **"Accreditation Assistant" → "Accreditation Contribution (Department)."** **IQAC owns and signs** the institutional SSR/AQAR/SAR. An "Accreditation Assistant" on the HOD implies duplicate ownership and collides head-on with the IQAC copilot. The rename makes the boundary unambiguous: the HOD **contributes** department criterion data and evidence; IQAC owns.
3. **"AI Report Generator" → "Department Report Generator."** The **Registrar** owns statutory MIS (AICTE/UGC returns). A generic "AI Report Generator" blurs into statutory reporting. The rename confines it to **department-internal** reports.

**Defers (3 → V2):**
4. **Faculty Performance Analytics → V2.** It is HR-sensitive (risks becoming a person-verdict / detrimental staff profiling) and depends on **structured feedback + appraisal-governance** inputs that the v1 SoT doesn't reliably hold. A minimal teaching-output snapshot can ride inside the Department Health Dashboard in V1; the full analytics are V2 once the data and policy exist.
5. **Meeting Assistant → V2.** Its core value (minutes, action-item extraction) depends on **meeting transcripts/notes that don't live in the ERP/SoT.** V1 could only do a thin "agenda pack from ERP data," which doesn't justify a standalone V1 feature.
6. **Research Dashboard → V2.** Research/publication data is **externally sourced** (Scopus, funding portals) — a hybrid in your own IQAC design where faculty populate much of it. V1 can offer a container at best; defer the analytics until connectors exist.

**Scope-tightens (1):**
7. **Decision Support AI** repositioned as the department-scoped **NL question + compare/scenario surface** (this persona's instance of the platform's NL engine), so it doesn't become a catch-all overlapping the Daily Brief and Dashboard.

**Dependency-flagged (kept in V1):**
8. **Complaint Analytics** stays V1 **only if a grievance/complaint feed is ingested**; otherwise it degrades to manual tagging. Flagged so engineering treats the data source as a hard prerequisite.
9. **Placement Readiness** stays V1 as a **read-only department view**; placement *operations* are reserved for a future Placement role.

**No removals.** No merges (Faculty Performance vs Workload Optimizer are deliberately kept separate — quality/output vs load distribution are distinct jobs with different data and sensitivity).

### Official V1 feature list (frozen on sign-off)

| Feature | Purpose | Priority | Version | Owner (consumes) | Dependencies | Status |
|---|---|---|---|---|---|---|
| Department Health Dashboard | One-glance department health | P0 | V1 | HOD | Unified data layer, semantic layer, risk engine | Frozen |
| Department Risk Overview | Department at-risk aggregate + drill-down (rules-based) | P0 | V1 | HOD (mentors act) | Student Success Engine, faculty scope, interventions | Frozen |
| Daily AI Brief | Prioritised morning department digest | P0 | V1 | HOD | All dept feeds; other features as drill targets | Frozen |
| Subject Performance Analytics | Per-subject performance + outliers | P1 | V1 | HOD | Marks/assessments, semantic layer | Frozen |
| Decision Support AI | Dept NL question + compare surface | P1 | V1 | HOD | Governed semantic layer (read-only, dept-scoped) | Frozen |
| Department Report Generator | Drafts department-internal reports | P1 | V1 | HOD | Semantic layer, export | Frozen |
| Syllabus Progress Monitor | Coverage vs calendar; slippage flags | P1 | V1 | HOD | Syllabus plan + coverage source (LMS/faculty) | Frozen |
| Accreditation Contribution (Dept) | Department criterion completeness + evidence + draft | P1 | V1 | HOD (IQAC signs) | IQAC module, criterion mapping, evidence vault | Frozen |
| Faculty Workload Optimizer | Advisory load/section rebalancing | P2 | V1 | HOD | Timetable/section data, faculty model | Frozen |
| Resource Planning | Advisory dept resource planning | P2 | V1 | HOD | Infra/timetable data | Frozen |
| Placement Readiness Dashboard | Read-only dept readiness view | P2 | V1 | HOD | Placement data source *(dependency-flagged)* | Frozen (conditional) |
| Complaint Analytics | Dept complaint patterns | P2 | V1 | HOD | Grievance/complaint feed *(hard dependency)* | Frozen (conditional) |
| Faculty Performance Analytics | Dept faculty teaching-output analytics | — | **V2** | HOD | Feedback data + appraisal governance | Deferred |
| Meeting Assistant | Agenda packs + minutes/action items | — | **V2** | HOD | Meeting notes/transcript ingestion | Deferred |
| Research Dashboard | Dept research/publication standing | — | **V2** | HOD | External research-data connectors | Deferred |

**This is the official feature list for the HOD AI Assistant. No features are to be added after sign-off without a new change request.**

---

### Sign-off
| Reviewer | Role | Decision | Date |
|---|---|---|---|
| | Product | ☐ Approve ☐ Changes | |
| | Architecture | ☐ Approve ☐ Changes | |
| | Compliance (DPDP) | ☐ Approve ☐ Changes | |
| | Domain (Accreditation/IQAC boundary) | ☐ Approve ☐ Changes | |


---

# Role Solution Design Document (RSDD) — HOD AI Assistant

**Product:** AI ERP Copilot — Enterprise AI Intelligence Layer for Higher Education
**Role:** HOD (Head of Department) AI Assistant — 1 of 6 V1 personas
**Document type:** Role Solution Design Document — single source of truth for this role
**Audience:** Product · UX · Backend · Frontend · AI · Security · QA · DevOps
**Status:** Draft for engineering handoff

> **Inherited, non-negotiable product invariants** (every section conforms):
> 1. The **ERP is the System of Record**; this product is the **System of Intelligence**, **read-only and advisory in v1** — AI suggests, humans act. **No write-back to the ERP, no autonomous action.**
> 2. **DPDP Act 2023** governs. Students under 18 are children: academic/administrative signals only, advisory, no detrimental profiling, consent gate on parent-directed actions. **Faculty are also data principals** — employee analytics carry their own privacy/governance duty (see the faculty-feature risk notes).
> 3. **No free-form SQL from the model.** NL resolves against a **governed semantic layer**; queries run **read-only** through **tenant-scoped, RLS-protected** views; **tenant_id and scope are injected server-side**, never from model output. The frontend is never the security boundary.
> 4. Build **on top of** the existing foundation (auth, multi-tenancy, Student 360, ingestion, audit, Student Success/risk engine, `FacultyScope` scoping). Extend; do not redesign.
> 5. **Adaptive learning / content authoring** stays out of scope; **financial accounting beyond fees** is an explicit v1 exclusion.

> **Two findings that shape this entire document — read first.**
>
> **(A) The HOD role does not exist yet.** The locked role set is `admin, principal, registrar, iqac, faculty, student`. There is no `hod` (or `management`) role. However, the platform already has a department-scoping primitive — `FacultyScope` with `scope_type="department"` — and `/risk/summary` and `/risk/summary/by-department` are already department-/role-scoped server-side. The HOD is therefore modeled as a **net-new, department-scoped authority role built on the existing scope machinery** (the foundational work item, Section 12 / S0).
>
> **(B) Much of the requested HOD feature set is data-gated today.** The canonical model populates *students, attendance, internal_marks, fees, enrollment* and reference entities (*departments, programmes, courses*). But **`Faculty` is DDL-only and not wired into ingestion**; **`ResearchPublication`, `Placement`, `Hostel` are empty stubs**; there is **no budget/finance entity**; **timetable and syllabus/coverage are not in the canonical model**. Features depending on these (Faculty Performance/Workload/Recommendation, Research & Publication Analytics, Budget & Resource Planning, Course Coverage, Department Timetable) **cannot be V1 regardless of priority** — they are gated on data that must first be ingested. The faculty-performance features additionally require a governance/ethics decision because they profile employees. Each feature in Chapter 2 carries an explicit **Buildability tag** making this unambiguous.

---

# CHAPTER 1 — Foundations (Sections 1–6)

## 1. Executive Summary

The HOD AI Assistant is the **department-level command surface** of AI ERP Copilot. Where the Student copilot serves a student about themselves and Faculty sees their own cohort, the HOD sees and steers an **entire department**: its students (risk, attendance, performance), its faculty (workload, coverage — once that data exists), its courses, its accreditation evidence, and its goals — all bounded to the one department the HOD heads, never the whole institution (that is the Principal/Management scope).

It is **not a new ERP module and not an admin console**. It is a conversational, advisory intelligence surface that reuses the platform's existing Student Success/risk engine, NL/semantic engine, and Student 360 — re-scoped from "a cohort" to "a department" — and adds department-level aggregation, reporting, and a small set of department-owned artefacts (notices, goals, intervention oversight). Every figure traces to a real record; the assistant abstains rather than inventing.

**Why it matters to the business:** the HOD is the operational owner of departmental outcomes — pass rates, retention, accreditation readiness (NBA at the programme level, NAAC criteria at the institution level), and faculty effectiveness. Today these are reconstructed manually from spreadsheets and portals. Giving the HOD an early, explainable, department-scoped view of risk and performance — and a fast way to produce the reports and accreditation evidence they are constantly asked for — is one of the highest-leverage adoption and outcome plays in the product. It also makes the HOD an internal champion for institution-wide rollout.

**What V1 can honestly deliver** (because it reuses existing, populated data): a department-scoped At-Risk Student Intelligence board, Student Performance & Attendance Analytics, Student Intervention oversight, a Department Query Assistant (NL), a Department Reports Generator, a Notice Generator, Department Goal Tracking, a Department Performance/KPI dashboard (point-in-time; trend lines are deferred until history accrues), and a Daily AI Brief.

**What is deferred (V2), and why:** every **faculty-data** feature (Performance Analytics, Workload Analyzer, Recommendation Engine), **Research & Publication Analytics**, **Budget & Resource Planning**, **Course Coverage Tracker**, **Department Timetable Intelligence**, and **Meeting Briefs & Minutes** — because the underlying data is not yet ingested (faculty/research are stubs; budget/timetable/syllabus don't exist in the model) and, for the faculty features, because employee profiling needs a governance decision first. The **Accreditation/NBA-NAAC Documentation Assistant** is gated on the platform's Accreditation module (a planned but not-yet-built module); the HOD surface consumes it when it ships.

**The foundational engineering element** this role introduces is the **HOD role and department-scope authority**: a new role that resolves to exactly the department(s) the user heads, reusing `FacultyScope(department)` for read-scope but with elevated read (faculty-level data within the department) and the ability to own department artefacts. This is treated as the first roadmap phase (S0).

## 2. Role Definition

**Role purpose.** Give a Head of Department a single, trustworthy, conversational command surface over their **own department** — its students, faculty, courses, accreditation evidence, and goals — to monitor outcomes, intervene early, produce required reports, and steer the department, without writing to the ERP, without taking autonomous action, and without reaching beyond their department.

**What the role does:**
- Aggregates and presents **department-scoped** intelligence: risk, attendance, performance, interventions, KPIs, goals.
- Answers department-scoped questions in plain language, grounded in real records.
- Generates department deliverables — reports, notices, accreditation evidence views, meeting briefs (where inputs exist) — always as **human-approved drafts**, never auto-published.
- Oversees (does not perform) student interventions across the department's cohorts.
- (V2, data permitting) surfaces faculty workload/coverage and research analytics to support planning — descriptively and advisorily, never as automated appraisal.

**What the role is not:** an institution-wide view (Principal/Management), the accreditation system of record (IQAC owns that; HOD contributes department evidence), a placement-drive manager (Placement Cell), an HR/appraisal engine, or any path that writes to the ERP or auto-publishes.

**Position in the platform.** The HOD copilot is a department-scoped consumer of the shared AI layer (NL/semantic engine, Student Success engine, guardrails) over the unified data layer. It reuses faculty-style department scoping and adds: the HOD role + elevated department authority, department-level aggregation, department-owned artefacts (notice/goal/report), and (V2) faculty/research/budget surfaces once that data is ingested.

## 3. User Persona

**Primary user:** a Head of Department — a senior faculty member with managerial responsibility for one academic department (occasionally more than one). Technically moderate; time-poor; outcome- and compliance-driven; lives in spreadsheets and email today.

| Attribute | Detail |
|---|---|
| **Who** | Department head (senior faculty + manager). May also still teach. |
| **Technical expertise** | Moderate; comfortable with dashboards and email; not a data analyst; values plain-language answers and ready-made reports. |
| **Scope of authority** | One department (sometimes more): its students, faculty, courses, accreditation evidence, goals. **Not** institution-wide. |
| **Devices** | Desktop-primary for reports/planning; mobile for brief, risk board, approvals. |
| **Frequency** | Daily (brief, risk board); weekly (performance, interventions, reports); cyclical (accreditation, goals, planning). |
| **Pain points** | Manual reconciliation across systems; late visibility of at-risk students/cohorts; accreditation evidence scramble; repetitive report/notice writing; no single department pulse. |
| **Current ERP frustrations** | No department-level rollups; no NL answers; data scattered; reports hand-built; faculty/research/budget data fragmented or on paper. |
| **Information required** | Department-scoped: student risk/attendance/performance/interventions; (V2) faculty workload/coverage/research; courses; accreditation evidence; KPIs and goals. |
| **Authority level** | **Department authority.** Read across the department (incl. faculty-level data, V2); can create/edit/approve **department-owned artefacts** (notices, goals, reports, intervention oversight). **No institution-wide access; no ERP write; no autonomous action.** |
| **Decision responsibilities** | Departmental: where to intervene, what to report, which goals to set, how to plan resources (advisory inputs only). |

## 4. Business Goals

| Goal category | Goal | How HOD role contributes | Indicative measure (Section 20) |
|---|---|---|---|
| **Outcomes** | Improve department pass rates / retention | Early, explainable department risk + intervention oversight | At-risk caught early; intervention follow-through; breach reduction |
| **Compliance** | Department-level NBA/NAAC readiness | Continuous evidence view + report drafting (when Accreditation module ships) | Evidence completeness; report turnaround |
| **Efficiency** | Cut manual reporting & reconciliation | NL answers + auto-drafted reports/notices | Hours saved per report; query deflection |
| **Steering** | A real department pulse | KPI/goal dashboard + Daily Brief | Dashboard/brief usage; goal progress visibility |
| **Adoption** | Make the HOD an internal champion | A visibly useful department command surface | HOD WAU; NPS; expansion influence |
| **Planning (V2)** | Smarter faculty/resource planning | Workload/coverage/research analytics (once data exists) | Planning-cycle time; coverage gaps closed |

**Non-goals:** institution-wide oversight, HR/appraisal automation, running placement drives, owning the accreditation SoR, or any write-back/auto-publish.

## 5. Current Problems

**HOD-side problems today:**
- **Manual rollups:** department status is reconstructed by hand from attendance portals, marks sheets, fee data, and faculty inputs.
- **Late visibility:** at-risk students and weak cohorts surface too late to act.
- **Accreditation scramble:** NBA/NAAC evidence is gathered reactively from many sources with inconsistent IDs.
- **Repetitive authoring:** reports, notices, and minutes are written from scratch repeatedly.
- **No department pulse:** no single, current view of KPIs and goals.
- **Fragmented faculty/research/budget data:** often on paper or in private spreadsheets — not queryable.

**Institutional problems this role helps with:**
- Department outcomes that depend on early, acted-upon visibility.
- Accreditation grades that hinge on consistent, evidence-backed department data.
- Leadership wanting comparable, reliable department rollups.

**Constraints that bound the solution (features, not obstacles):**
- Read-only/advisory; the HOD acts, the system informs.
- **Data-gating:** faculty, research, budget, timetable, and syllabus data are not yet in the platform — dependent features must wait for ingestion (Chapter 2 tags; Section 15).
- Faculty analytics touch employee privacy and appraisal sensitivity — governance before build.
- Trend/time-series views require accrued history (no trend endpoint today) — point-in-time first.

## 6. Dashboard Design

The HOD home is a **department command dashboard** — denser and more analytical than the Student surface, desktop-primary but responsive, with the Daily Brief and risk board as the daily entry points.

**Layout intent (top to bottom):**
1. **Daily AI Brief** — what changed in the department since yesterday: new high-risk students, attendance dips, deadlines, items needing the HOD's approval.
2. **Department KPI strip** — pass rate, attendance, at-risk counts by tier, fee status, goal progress (point-in-time; trend lines appear once history accrues).
3. **At-Risk Student Intelligence board** — department-scoped, ranked, with reasons and intervention status (reuses the existing risk board, re-scoped).
4. **Performance & attendance analytics** — department/programme/course drill-downs.
5. **Action area** — generate report · draft notice · review interventions · ask a question.
6. **Cards (V2, data-gated):** faculty workload/coverage, research output, budget/resource view, accreditation evidence completeness.
7. **Persistent NL entry** — "Ask about your department."

**Designed states:** full · empty (new pilot, no data) · partial (a source/module not connected — e.g. accreditation, faculty data) · stale (last-sync shown) · error. Trend widgets explicitly render a "builds as data accumulates" placeholder rather than faking a line (consistent with the platform's deferred-trends decision).

**Inherited from the existing design system:** the risk board, Student 360 drill-down, tier treatment (shape + colour, colour-vision-safe), and empty/error/stale patterns are reused and re-scoped — not reinvented. Unlike the student surface, the HOD **is** an appropriate audience for the risk tier/score (they are mentoring/leadership staff), still presented with reasons and evidence, never as a black box.

**Explicitly absent (by design):** any other department's data; institution-wide aggregates beyond the HOD's department; the IQAC accreditation SoR editing surface; HR/appraisal actions; any write-back to the ERP.

---

# CHAPTER 2 — Complete Feature Catalogue (Section 7)

Each feature uses the HOD template: **Why it exists · Business problem solved · Value to HOD · Department-level impact · Inputs (required ERP data) · Outputs · Expected behaviour · AI capabilities/behaviour · User workflow · Permissions · Dependencies · Risks · Future enhancements.** Every feature is **department-scoped, read-only/advisory**, and generated content is a **human-approved draft**.

**Buildability tag legend** (the honest state, given the grounded data findings):
- 🟢 **V1 — buildable now**: reuses existing populated data (students/attendance/marks/fees + signals) and existing engine, re-scoped to department.
- 🟡 **V1-gated**: buildable in V1 *only if* a specific source exists for the tenant (e.g. timetable); else degrades gracefully.
- 🟠 **V2 — data-gated**: depends on data the platform does **not yet ingest** (faculty is DDL-only/unwired; research/placement are empty stubs; budget/syllabus/timetable absent). Cannot be V1.
- 🔴 **V2 — data-gated + governance**: as above, *and* requires a privacy/ethics/HR governance decision (employee profiling).
- 🔵 **Module-gated**: depends on another platform module not yet built (Accreditation Assistant).

## 7.1 Department Performance Dashboard — 🟢 V1 (trends deferred)
- **Why it exists:** the HOD has no single, current view of department health.
- **Business problem solved:** manual rollups across systems.
- **Value to HOD:** one glance at pass rate, attendance, risk, fees, goal progress.
- **Department-level impact:** faster steering; shared, consistent numbers.
- **Inputs (ERP data):** students, attendance, internal_marks, fees, enrollment (all populated), risk assessments — department-scoped.
- **Outputs:** KPI tiles + distributions, point-in-time; drill to programme/course.
- **Expected behaviour:** department-scoped; point-in-time now (trend lines render a "builds as data accumulates" placeholder — no trend endpoint exists yet); stale indicator shown.
- **AI behaviour:** NL narration of the numbers ("attendance dragging in 2nd-year DBMS"); no invented figures.
- **User workflow:** open dashboard → glance → drill → ask a follow-up in NL.
- **Permissions:** view (department); no edit of source data.
- **Dependencies:** Student Success signals; aggregation; department scope (S0).
- **Risks:** users expect trends early — set expectation; avoid implying real-time.
- **Future enhancements:** historical trend reconstruction once `risk_assessments.computed_at` history accrues.

## 7.2 Faculty Performance Analytics — 🔴 V2 (data-gated + governance)
- **Why it exists:** HODs want to understand teaching effectiveness in the department.
- **Business problem solved:** no consolidated view of faculty-linked outcomes.
- **Value to HOD:** planning, mentoring, identifying support needs.
- **Department-level impact:** better teaching support — *if* done ethically.
- **Inputs (ERP data):** **NOT AVAILABLE TODAY.** Requires faculty↔course allocation + faculty-attributed outcomes; `Faculty` is DDL-only and not wired into ingestion.
- **Outputs (if/when built):** descriptive, transparent indicators (e.g. course outcomes, coverage) — **never a ranking or opaque "performance score."**
- **Expected behaviour:** advisory, descriptive, transparent; **never feeds automated HR/appraisal action**; faculty informed; access tightly controlled.
- **AI behaviour:** aggregation + explanation only; no predictive "good/bad teacher" labelling.
- **User workflow:** HOD reviews descriptive indicators to plan support — not to rank.
- **Permissions:** HOD (department), with explicit governance controls and audit.
- **Dependencies:** faculty data ingestion; faculty↔course↔outcome linkage; **privacy/HR governance + legal review.**
- **Risks (high):** employee profiling; IR/appraisal misuse; DPDP (faculty are data principals); "black-box score" anti-pattern. **Recommend: scope to descriptive/advisory only, never ranking, never automated action.**
- **Future enhancements:** outcome-based course analytics tied to accreditation CO-PO mapping.

## 7.3 Student Performance Analytics — 🟢 V1
- **Why it exists:** the HOD needs department-wide academic trajectory, not raw marks.
- **Business problem solved:** hidden grade decline across cohorts.
- **Value to HOD:** spot weak courses/cohorts early.
- **Department-level impact:** targeted remediation; better pass rates.
- **Inputs (ERP data):** internal_marks, enrollment, programmes/courses — department-scoped.
- **Outputs:** department/programme/course performance views + narration.
- **Expected behaviour:** department-scoped; explainable; no per-student exposure beyond what the HOD legitimately oversees.
- **AI behaviour:** trend analysis + NL narration over the academic signal.
- **User workflow:** open analytics → drill by programme/course → act/report.
- **Permissions:** view (department).
- **Dependencies:** academic signals; department scope.
- **Risks:** DPDP for minor students — academic signals only; no profiling.
- **Future enhancements:** cohort comparison over time (history-gated).

## 7.4 At-Risk Student Intelligence — 🟢 V1
- **Why it exists:** at-risk students surface too late.
- **Business problem solved:** late detection across the department.
- **Value to HOD:** ranked at-risk list with reasons, department-wide.
- **Department-level impact:** earlier intervention; retention.
- **Inputs (ERP data):** risk assessments + findings (existing engine), department-scoped.
- **Outputs:** ranked board (high/watch), reasons, intervention status, Student 360 drill.
- **Expected behaviour:** reuses the existing risk board re-scoped to department; HOD (staff) **may** see tier/score with reasons/evidence; constructive for minor students; advisory only.
- **AI behaviour:** explainable rule-based findings (existing engine); no automated adverse action.
- **User workflow:** open board → review reasons → oversee/assign intervention.
- **Permissions:** view + intervention oversight (department).
- **Dependencies:** Student Success engine; department scope.
- **Risks:** DPDP minors (academic-signal-only, advisory — already enforced by the engine).
- **Future enhancements:** ML risk scoring (later predictive module).

## 7.5 Attendance Analytics — 🟢 V1
- **Why it exists:** attendance is the earliest, strongest risk signal.
- **Business problem solved:** no department-level attendance visibility.
- **Value to HOD:** see norm breaches by cohort/course before detention.
- **Department-level impact:** retention; detention avoidance.
- **Inputs (ERP data):** attendance (populated), enrollment, norm config — department-scoped.
- **Outputs:** attendance distributions, below-norm lists, course/cohort breakdowns.
- **Expected behaviour:** department-scoped; norm-aware; degrades if norm unconfigured.
- **AI behaviour:** aggregation + narration; no invented figures.
- **User workflow:** open → spot dips → drill → act.
- **Permissions:** view (department).
- **Dependencies:** attendance signal; department scope.
- **Risks:** minor-student DPDP (academic signal — safe).
- **Future enhancements:** attendance trend lines (history-gated).

## 7.6 Department Timetable Intelligence — 🟡 V1-gated (timetable source)
- **Why it exists:** schedule conflicts and coverage gaps are invisible.
- **Business problem solved:** manual timetable reconciliation.
- **Value to HOD:** see clashes, room/faculty conflicts, gaps.
- **Department-level impact:** smoother operations.
- **Inputs (ERP data):** **timetable data — not in the canonical model today;** gated on a timetable source being ingested.
- **Outputs:** department schedule view + conflict/gap flags.
- **Expected behaviour:** degrades to a clear "timetable not connected" state if no source; never invents a schedule.
- **AI behaviour:** retrieval + conflict detection + NL answers.
- **User workflow:** open → review → flag conflicts to resolve (manually).
- **Permissions:** view (department).
- **Dependencies:** timetable source/integration.
- **Risks:** absent for many tenants — set expectation.
- **Future enhancements:** what-if scheduling assistance.

## 7.7 Faculty Workload Analyzer — 🟠 V2 (data-gated)
- **Why it exists:** workload is uneven and invisible.
- **Business problem solved:** ad-hoc, opaque workload allocation.
- **Value to HOD:** balance teaching/admin load fairly.
- **Department-level impact:** fairness; capacity planning.
- **Inputs (ERP data):** **NOT AVAILABLE** — needs faculty↔course allocation + load data; `Faculty` is unwired.
- **Outputs (when built):** workload distribution view; over/under-load flags.
- **Expected behaviour:** descriptive, advisory; suggestions only; HOD decides.
- **AI behaviour:** aggregation + balancing suggestions (advisory).
- **User workflow:** review load → consider rebalancing → act manually.
- **Permissions:** HOD (department).
- **Dependencies:** faculty data ingestion + allocation data.
- **Risks:** employee-data sensitivity (lower than appraisal, but real) — descriptive only.
- **Future enhancements:** workload + research + coverage combined capacity model.

## 7.8 Course Coverage Tracker — 🟠 V2 (data-gated)
- **Why it exists:** syllabus coverage drifts; surfaces only at exam time.
- **Business problem solved:** no visibility into coverage vs plan.
- **Value to HOD:** catch lagging coverage early.
- **Department-level impact:** exam readiness; quality.
- **Inputs (ERP data):** **NOT AVAILABLE** — needs syllabus/coverage data (LMS or manual); not in the model.
- **Outputs (when built):** coverage vs plan by course; lag flags.
- **Expected behaviour:** advisory; degrades cleanly if no source.
- **AI behaviour:** comparison + narration.
- **User workflow:** review coverage → nudge faculty → track.
- **Permissions:** HOD (department).
- **Dependencies:** syllabus/coverage source (LMS integration).
- **Risks:** data quality; faculty sensitivity if framed punitively — frame supportively.
- **Future enhancements:** CO-PO/accreditation linkage.

## 7.9 AI Department Reports Generator — 🟢 V1 (bounded to existing data)
- **Why it exists:** report writing is repetitive and slow.
- **Business problem solved:** hand-built department reports.
- **Value to HOD:** minutes, not hours, for routine reports.
- **Department-level impact:** faster, consistent reporting up the chain.
- **Inputs (ERP data):** department-scoped students/attendance/marks/fees/risk + a report intent.
- **Outputs:** a **draft** report (data-bound, grounded) for HOD review/edit/export.
- **Expected behaviour:** grounded in real department data; figures traceable; **draft only**, never auto-sent; abstains where data is missing.
- **AI behaviour:** NL → semantic selection → grounded narrative + tables; no invented numbers.
- **User workflow:** request report in NL → review/edit draft → export/share.
- **Permissions:** create/export drafts (department).
- **Dependencies:** NL/semantic layer; reporting; department scope.
- **Risks:** over-trust of drafts — require human review; mark as draft.
- **Future enhancements:** scheduled reports; templates per institution.

## 7.10 Accreditation & NBA/NAAC Documentation Assistant — 🔵 Module-gated
- **Why it exists:** accreditation evidence is a recurring, high-stakes scramble.
- **Business problem solved:** reconstructing department evidence from scattered sources.
- **Value to HOD:** continuous department-level readiness; faster SAR/SSR contribution.
- **Department-level impact:** better accreditation outcomes.
- **Inputs (ERP data):** department data mapped to NBA (programme) / NAAC criteria; **depends on the platform Accreditation Assistant module (planned, not yet built)** and on faculty/research data (also gated) for some criteria.
- **Outputs (when available):** department criterion completeness view; **draft** evidence-linked narrative for human approval.
- **Expected behaviour:** the HOD **contributes** department evidence; IQAC remains the accreditation SoR/owner; drafts are human-approved; figures traceable.
- **AI behaviour:** data→criterion mapping; grounded drafting; consistency checks (provided by the Accreditation module).
- **User workflow:** view department readiness → fill gaps → AI drafts → HOD/IQAC approve.
- **Permissions:** HOD contributes (department); IQAC owns institution-level.
- **Dependencies:** **Accreditation module build**; faculty/research data for some criteria.
- **Risks:** role overlap with IQAC — define HOD-contributes vs IQAC-owns boundary.
- **Future enhancements:** CO-PO attainment, DVV-style pre-checks at department level.

## 7.11 Budget & Resource Planning Assistant — 🟠 V2 (data-gated + scope flag)
- **Why it exists:** department planning needs a resource view.
- **Business problem solved:** no consolidated budget/resource picture.
- **Value to HOD:** evidence-based planning requests.
- **Department-level impact:** better resource allocation.
- **Inputs (ERP data):** **NOT AVAILABLE** — no budget/finance entity; **financial accounting beyond fees is an explicit v1 exclusion.**
- **Outputs (when built):** department resource/budget view; planning scenarios (advisory).
- **Expected behaviour:** advisory; no financial-system write; degrades cleanly.
- **AI behaviour:** analysis + scenario narration over provided budget data.
- **User workflow:** review → plan → submit request (manually, outside the system).
- **Permissions:** HOD (department).
- **Dependencies:** a budget/finance data source + a scope decision (financial depth is out of v1).
- **Risks:** scope creep into accounting; keep advisory and integrate, don't rebuild finance.
- **Future enhancements:** integrate with the institution's finance system (read-only).

## 7.12 Department Notice Generator — 🟢 V1
- **Why it exists:** notices are written from scratch repeatedly.
- **Business problem solved:** slow, inconsistent notice authoring.
- **Value to HOD:** fast, well-formatted department notices.
- **Department-level impact:** clearer, timelier communication.
- **Inputs (ERP data):** the HOD's intent + optional department context (e.g. an exam date); no sensitive data required.
- **Outputs:** a **draft** notice for HOD review/edit/publish (publish via existing channels, human-approved).
- **Expected behaviour:** draft only; never auto-published; no PII unless the HOD adds it.
- **AI behaviour:** constrained text generation (no grounding needed beyond provided context).
- **User workflow:** describe notice → review/edit → publish manually.
- **Permissions:** create/edit drafts (department).
- **Dependencies:** notification/publishing channel (human-triggered).
- **Risks:** tone/accuracy — human review mandatory.
- **Future enhancements:** templates; multilingual; scheduled notices.

## 7.13 Faculty Recommendation Engine — 🔴 V2 (data-gated + governance; scope to be clarified)
- **Why it exists:** allocation and support decisions are ad-hoc. **(Ambiguous as named — see scope note.)**
- **Business problem solved:** opaque course-allocation/support decisions.
- **Value to HOD:** advisory suggestions for **course/workload allocation** — not appraisal.
- **Department-level impact:** balanced, sensible allocation.
- **Inputs (ERP data):** **NOT AVAILABLE** — needs faculty data + allocation + (optionally) coverage/workload.
- **Outputs (when built):** advisory allocation/support suggestions the HOD decides on.
- **Expected behaviour:** **advisory only; human decides; never automated HR action; never a faculty ranking.**
- **AI behaviour:** suggestion + rationale; transparent; no opaque scoring of people.
- **User workflow:** review suggestions → decide → act manually.
- **Permissions:** HOD (department), governed + audited.
- **Dependencies:** faculty data; **governance/legal review.**
- **Risks (high):** if misread as appraisal/ranking, serious IR/ethics/DPDP exposure. **Recommend: explicitly scope to course/workload allocation suggestions, not personnel evaluation; rename to "Course Allocation Assistant" to remove ambiguity.**
- **Future enhancements:** allocation optimisation across workload + coverage + preferences.

## 7.14 Student Intervention Management — 🟢 V1
- **Why it exists:** interventions need oversight across the department.
- **Business problem solved:** interventions tracked inconsistently.
- **Value to HOD:** see and steer intervention follow-through department-wide.
- **Department-level impact:** closes the loop from risk to action to outcome.
- **Inputs (ERP data):** intervention records (existing lifecycle), risk findings — department-scoped.
- **Outputs:** intervention status board; oversight; outcome logging.
- **Expected behaviour:** reuses the existing intervention lifecycle; **for minor students the parent-contact consent gate is enforced** (never auto-created/sent); advisory.
- **AI behaviour:** intervention suggestions (existing engine); no automated adverse action.
- **User workflow:** review interventions → assign/oversee → confirm outcomes.
- **Permissions:** oversight + create/update (department); parent-contact for minors requires the consent gate.
- **Dependencies:** Student Success engine intervention service; department scope.
- **Risks:** DPDP minor parent-contact (gated already).
- **Future enhancements:** outcome analytics (which interventions work).

## 7.15 AI Meeting Briefs & Minutes Generator — 🟠 V2 (new input modality)
- **Why it exists:** meeting prep and minutes are time-consuming.
- **Business problem solved:** manual briefing and minute-taking.
- **Value to HOD:** auto-drafted pre-meeting briefs and post-meeting minutes.
- **Department-level impact:** better-run, documented meetings.
- **Inputs (ERP data):** for **briefs**, department data (available). For **minutes**, a **meeting transcript/notes — a new input modality not in the ERP**; introduces audio/text handling + meeting-content privacy.
- **Outputs:** a **draft** brief (grounded in department data) and **draft** minutes (from provided notes) for human review.
- **Expected behaviour:** briefs grounded in real data; minutes summarise only provided input; drafts only.
- **AI behaviour:** summarisation; for briefs, grounded department selection.
- **User workflow:** request brief before a meeting; upload notes after → review minutes.
- **Permissions:** create drafts (department).
- **Dependencies:** for minutes, a transcript/notes input pipeline + privacy handling.
- **Risks:** meeting content privacy; off-SoT input; transcription accuracy. **Recommend: ship "Meeting Brief" (grounded, V1-adjacent) before "Minutes" (V2, needs the input pipeline).**
- **Future enhancements:** action-item tracking tied to goals.

## 7.16 Department KPI Dashboard — 🟢 V1 (point-in-time)
- **Why it exists:** KPIs are scattered and stale.
- **Business problem solved:** no consolidated department KPIs.
- **Value to HOD:** the metrics that matter, in one place.
- **Department-level impact:** consistent steering.
- **Inputs (ERP data):** department-scoped students/attendance/marks/fees/risk.
- **Outputs:** KPI tiles (point-in-time) + drill.
- **Expected behaviour:** point-in-time; trend placeholders until history accrues; stale indicator.
- **AI behaviour:** narration; anomaly callouts.
- **User workflow:** glance → drill → ask.
- **Permissions:** view (department).
- **Dependencies:** signals; aggregation; scope. (Overlaps 7.1 — recommend merging the Performance and KPI dashboards into one surface; see Chapter notes.)
- **Risks:** redundancy with 7.1.
- **Future enhancements:** configurable KPI sets; trends.

## 7.17 Department Goal Tracking — 🟢 V1 (new artefact)
- **Why it exists:** department goals aren't tracked against live data.
- **Business problem solved:** goals live in documents, disconnected from outcomes.
- **Value to HOD:** see goal progress against real signals.
- **Department-level impact:** accountability; focus.
- **Inputs (ERP data):** HOD-defined goals (a **new department-owned artefact**) + the signals they map to.
- **Outputs:** goals with live progress; status.
- **Expected behaviour:** HOD creates/edits goals; progress computed from real data; advisory.
- **AI behaviour:** map goals to metrics; narrate progress; suggest focus.
- **User workflow:** set goals → track against live data → review.
- **Permissions:** create/edit/delete goals (department).
- **Dependencies:** goal artefact store; signals; scope.
- **Risks:** goal-metric mismatch — keep mapping transparent.
- **Future enhancements:** goal trends; cascading institution goals (with Principal role).

## 7.18 Department Query Assistant — 🟢 V1
- **Why it exists:** HODs can't self-serve answers without IT.
- **Business problem solved:** no NL access to department data.
- **Value to HOD:** ask anything about the department in plain language.
- **Department-level impact:** decisions in seconds.
- **Inputs (ERP data):** department-scoped canonical data via the governed semantic layer + the NL question.
- **Outputs:** grounded answer + table/chart + interpretation echo.
- **Expected behaviour:** **department-scoped** (server-injected, never model-supplied); grounded; abstains out-of-scope/out-of-data; never reaches another department or institution-wide data.
- **AI behaviour:** NL → semantic selection → deterministic read-only query → grounded response.
- **User workflow:** ask → read grounded answer → follow up.
- **Permissions:** trigger AI (department).
- **Dependencies:** NL/semantic engine; department scope.
- **Risks:** scope leakage (the #1 risk) — server-side scope + RLS; adversarial tests.
- **Future enhancements:** saved/shared department queries; Indic-language.

## 7.19 Research & Publication Analytics — 🟠 V2 (data-gated)
- **Why it exists:** research output is invisible and accreditation-relevant.
- **Business problem solved:** research data on paper/spreadsheets.
- **Value to HOD:** department research pulse; accreditation evidence.
- **Department-level impact:** research planning; NBA/NAAC criteria.
- **Inputs (ERP data):** **NOT AVAILABLE** — `ResearchPublication` is an **empty stub** (no columns, no ingestion).
- **Outputs (when built):** publication counts/trends, faculty/department research views.
- **Expected behaviour:** descriptive; advisory; degrades cleanly.
- **AI behaviour:** aggregation + narration.
- **User workflow:** review → use for planning/accreditation.
- **Permissions:** view (department).
- **Dependencies:** research data ingestion (schema + source).
- **Risks:** faculty-attributed data sensitivity; data quality.
- **Future enhancements:** citation/impact analytics; accreditation auto-mapping.

## 7.20 Daily AI Brief — 🟢 V1
- **Why it exists:** the HOD needs "what changed and what needs me" each morning.
- **Business problem solved:** no proactive department digest.
- **Value to HOD:** the one-glance department start-of-day.
- **Department-level impact:** faster response to emerging issues.
- **Inputs (ERP data):** department-scoped risk/attendance/performance changes, deadlines, approval items.
- **Outputs:** a short, prioritised department brief.
- **Expected behaviour:** department-scoped; constructive; handles empty/partial states.
- **AI behaviour:** multi-source summarisation + prioritisation.
- **User workflow:** open → read brief → jump to the one thing that matters.
- **Permissions:** view (department).
- **Dependencies:** signals; summarisation; scheduler; scope.
- **Risks:** noise — prioritise hard.
- **Future enhancements:** weekly recap; configurable focus.

### 7.21 Feature buildability summary

| # | Feature | Tag | Version | Gating reason |
|---|---|---|---|---|
| 7.1 | Department Performance Dashboard | 🟢 | V1 | (trends deferred — no history) |
| 7.3 | Student Performance Analytics | 🟢 | V1 | — |
| 7.4 | At-Risk Student Intelligence | 🟢 | V1 | reuses risk engine |
| 7.5 | Attendance Analytics | 🟢 | V1 | — |
| 7.9 | AI Department Reports Generator | 🟢 | V1 | bounded to existing data |
| 7.12 | Department Notice Generator | 🟢 | V1 | — |
| 7.14 | Student Intervention Management | 🟢 | V1 | reuses intervention lifecycle |
| 7.16 | Department KPI Dashboard | 🟢 | V1 | (merge with 7.1) |
| 7.17 | Department Goal Tracking | 🟢 | V1 | new artefact |
| 7.18 | Department Query Assistant | 🟢 | V1 | — |
| 7.20 | Daily AI Brief | 🟢 | V1 | — |
| 7.6 | Department Timetable Intelligence | 🟡 | V1-gated | timetable source must exist |
| 7.15 | AI Meeting Briefs & Minutes | 🟠 | V1 brief / V2 minutes | minutes need transcript input |
| 7.10 | Accreditation & NBA/NAAC Assistant | 🔵 | Module-gated | Accreditation module not built |
| 7.7 | Faculty Workload Analyzer | 🟠 | V2 | faculty data not ingested |
| 7.8 | Course Coverage Tracker | 🟠 | V2 | syllabus/coverage source absent |
| 7.11 | Budget & Resource Planning | 🟠 | V2 | no finance entity; out of v1 scope |
| 7.19 | Research & Publication Analytics | 🟠 | V2 | research_publication is an empty stub |
| 7.2 | Faculty Performance Analytics | 🔴 | V2 | faculty data + governance |
| 7.13 | Faculty Recommendation Engine | 🔴 | V2 | faculty data + governance (rename: Course Allocation Assistant) |

**Catalogue-level recommendations (PM judgment):** (1) **merge 7.1 + 7.16** into one Department Dashboard surface (redundant). (2) **Split 7.15**: ship grounded Meeting *Brief* early; defer *Minutes* (new input pipeline). (3) **Rename 7.13** to "Course Allocation Assistant" and scope it to allocation, not appraisal. (4) Treat all 🔴/🟠 faculty features as a single **"Faculty Module (V2)"** gated on faculty-data ingestion + governance, so they're planned coherently rather than piecemeal. (5) Keep 7.10 aligned to the Accreditation module's delivery.

---

# CHAPTER 3 — Experience & Requirements (Sections 8–13)

## 8. User Journeys

All journeys are department-scoped, read-only/advisory; generated outputs are human-approved drafts.

**J1 — First login & department-scope setup (foundational).**
HOD account is provisioned with the `hod` role and bound to their department(s) → on login, department scope is resolved server-side (via the department-scope mechanism) → lands on the Daily Brief, which may be empty/partial on a new pilot. If the HOD heads multiple departments, a department switcher scopes everything.

**J2 — Morning check-in (core loop).**
Opens Daily Brief → sees new high-risk students, attendance dips, deadlines, and items needing approval → taps the risk board → reviews reasons → oversees/assigns an intervention (parent-contact for a minor routes through the consent gate).

**J3 — Department question (NL).**
Asks "which 2nd-year courses have the worst attendance this month?" → assistant interprets, echoes its reading, returns a grounded, department-scoped answer → HOD drills into a course.

**J4 — Produce a report.**
Requests "draft the monthly department performance report" → reviews the grounded draft → edits → exports/shares. Never auto-sent.

**J5 — Track goals.**
Opens Goal Tracking → sees progress against live signals → adjusts a goal or focus.

**J6 — Accreditation contribution (when the module ships).**
Opens department readiness view → sees criterion gaps → AI drafts evidence-linked narrative → HOD reviews → routes to IQAC for approval.

**J7 — Faculty planning (V2, data permitting).**
Reviews descriptive workload/coverage → considers rebalancing → acts manually. No ranking, no automated action.

**J8 — Graceful degradation.**
On a tenant without timetable/faculty/research data, those surfaces show honest "not connected yet" states; the rest of the dashboard works.

**J9 — Multi-department HOD.**
Switches department context → all data, scope, and answers re-scope to the selected department; no cross-department bleed.

## 9. Conversation Flows

Department-scoped variant of the platform NL engine:

```
HOD utterance
   ↓
Intent + entity parse (LLM)
   ↓
Department scope + tenant context injected server-side (never from model output)
   ↓
Map to governed semantic metric/dimension ──(no match)──▶ Abstain:
   ↓ (match)                                               "I can't answer that from your
Deterministic read-only query (RLS + department scope)      department's data" + suggest
   ↓                                                        what it can answer
Grounded response + interpretation echo
   ↓
Optional follow-up (context retained, still department-scoped)
```

**Designed behaviours:** interpretation echo on every substantive answer; grounding (no invented numbers); abstention over guessing; **scope enforcement** (never another department or institution-wide data — that's Principal/Management); safe redirection for anything requiring ERP write or institutional action; refusal for out-of-scope or, for faculty-data questions in V1, an honest "that data isn't connected yet."

## 10. Dashboard Widgets

| Widget | Content | Source feature | Tag | States |
|---|---|---|---|---|
| **Daily AI Brief** | Dept changes + approval items | 7.20 | 🟢 | full/empty/partial/stale |
| **Department KPI strip** | Pass rate, attendance, risk, fees, goals | 7.1/7.16 | 🟢 | point-in-time; trend placeholder |
| **At-Risk Board** | Ranked dept at-risk + reasons | 7.4 | 🟢 | full/empty |
| **Performance/Attendance analytics** | Programme/course drill-downs | 7.3/7.5 | 🟢 | full/insufficient-history |
| **Interventions** | Oversight + status | 7.14 | 🟢 | active/empty |
| **Goals** | Live progress vs goals | 7.17 | 🟢 | set/none |
| **Reports & Notices** | Draft generators | 7.9/7.12 | 🟢 | idle/drafting/draft-ready |
| **Ask-the-department** | Persistent NL input | 7.18 | 🟢 | idle/thinking/answered/abstained |
| **Faculty (workload/coverage)** | Descriptive views | 7.7/7.8 | 🟠 | V2 / not-connected |
| **Research output** | Publication views | 7.19 | 🟠 | V2 / not-connected |
| **Accreditation readiness** | Criterion completeness | 7.10 | 🔵 | module-gated |
| **Budget/Resource** | Resource view | 7.11 | 🟠 | V2 / not-connected |
| **Timetable** | Schedule + conflicts | 7.6 | 🟡 | connected / not-connected |

**Widget rules:** every widget is department-scoped, read-only; numeric widgets show freshness/stale; trend widgets render a "builds as data accumulates" placeholder, not a fake line; data-gated widgets show an honest "not connected yet" state (never an error or invented data); no widget shows another department or institution-wide data.

## 11. Navigation

Desktop-primary, responsive; analytical but not overwhelming.

**Primary nav:** **Brief** (home) · **Students** (risk, performance, attendance, interventions) · **Reports & Notices** · **Goals & KPIs** · **Accreditation** (module-gated) · **Faculty** (V2, data-gated) · **Ask**.

**Principles:** the NL "Ask" is reachable everywhere; a **department switcher** (for multi-department HODs) scopes the whole app; no path exposes another department, institution-wide leadership surfaces, IQAC's accreditation SoR editor, or HR/appraisal actions; data-gated sections are visible but clearly show "not connected yet" rather than being hidden (so the HOD knows the capability exists).

## 12. Functional Requirements

**Role, scope & access (foundational — net-new):**
- **FR-1.** Introduce an `hod` role (net-new; not in the current locked role set).
- **FR-2.** Bind each HOD to one or more departments; resolve **department scope** server-side, reusing the existing department-scope mechanism (`FacultyScope`-style `scope_type="department"`), extended with HOD-level elevated read.
- **FR-3.** Enforce department scope on every read, NL answer, report, and aggregation; scope is server-side, never client/model-supplied; fail closed.
- **FR-4.** A multi-department HOD switches active department; all data re-scopes; no cross-department bleed.
- **FR-5.** The HOD has **no** access to other departments, institution-wide leadership aggregates, the IQAC accreditation SoR editor, HR/appraisal actions, or any ERP write path.
- **FR-6.** HOD elevated read may include faculty-level data **within the department** — but only once that data exists and governance is approved (V2).

**Core department features (V1):**
- **FR-7.** Department dashboard (KPIs, point-in-time) + Daily Brief from department signals.
- **FR-8.** Department-scoped At-Risk board (reasons, evidence, Student 360 drill) reusing the existing risk engine.
- **FR-9.** Department Student Performance & Attendance analytics with drill-downs.
- **FR-10.** Intervention oversight (create/update/outcome), with the minor parent-contact consent gate enforced.
- **FR-11.** Department NL Query Assistant (grounded, scope-enforced, abstains correctly).
- **FR-12.** Department Reports Generator and Notice Generator — grounded/constrained **drafts**, human-approved, never auto-published.
- **FR-13.** Department Goal Tracking as a department-owned artefact, progress computed from live signals.

**Data-gated / module-gated features (V2 / when available):**
- **FR-14.** Timetable Intelligence (if a timetable source is ingested); else honest not-connected state.
- **FR-15.** Faculty Workload/Coverage/Allocation and Research analytics — **only** after faculty/research data ingestion **and** governance approval; descriptive/advisory; no ranking; no automated HR action.
- **FR-16.** Accreditation contribution view + drafting — when the Accreditation module ships; IQAC remains the owner.
- **FR-17.** Budget & Resource planning — when a budget source exists; advisory; no finance write.
- **FR-18.** Meeting Brief (grounded, earlier) and Minutes (V2, needs transcript input).

**Behavioural guarantees:**
- **FR-19.** No feature writes to the ERP/SoT or auto-publishes; generated artefacts are drafts until a human acts.
- **FR-20.** Every HOD read and AI interaction is department-scoped and audited (actor, scope, time).
- **FR-21.** Data-gated features degrade to honest not-connected states; never invented data.
- **FR-22.** Trend/time-series views render placeholders until history accrues (no fake trends).
- **FR-23.** Faculty-data features, when built, are descriptive/advisory only — never a personnel score, ranking, or automated action.

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Tenant & department isolation** | Existing tenant RLS **plus** department scope; isolation is the #1 risk; adversarially tested; fail closed; the frontend is never the security boundary. |
| **Security & privacy** | Encryption in transit/at rest; least privilege; full audit; DPDP for minor students (academic-signal-only, advisory, consent gate); **faculty-data governance** (employee privacy, no profiling/appraisal misuse) for V2 features. |
| **Performance** | Department aggregations stay responsive at result-day peaks; bulk/aggregate queries (no per-student loops); analytics/serving read path decoupled from writes. |
| **Scalability** | Many departments per tenant across many tenants; aggregation scales with department size. |
| **Availability** | Degrades gracefully when a source/module is absent; core department reads survive optional-source outages. |
| **Reliability / correctness** | Deterministic facts; grounding enforced; consistent department scope; bounded query counts. |
| **UX** | Desktop-primary, responsive; accessible (colour-vision-safe, labeled controls); honest empty/partial/stale/error states. |
| **Observability** | NL accuracy, abstention rate, scope denials, latency, error rates; auditable AI interactions; data-gating telemetry (which sources connected per tenant). |
| **Localisation** | English first; Indic-language-ready. |
| **Data residency** | India-region hosting (region-pinned). |
| **Maintainability** | Reuse shared layers (NL engine, signals, risk board, Student 360, scoping); add features behind the same seams; the V2 "Faculty Module" planned coherently. |

---

# CHAPTER 4 — Architecture, Data, Security & Resilience (Sections 14–19)

## 14. AI Architecture (High Level)

The HOD Assistant **reuses the platform's existing AI architecture**, re-scoped from cohort/self to **department**. No new AI paradigm; a department scope is added to the established NL pipeline, plus department-level aggregation and constrained drafting.

**Layered view:**
1. **HOD Copilot surface** (responsive, desktop-primary) — dashboard + conversation + draft generators.
2. **AI orchestration layer** — LLM via API: intent/entity parse → **department-scoped semantic selection** → grounded response; plus summarisation (Brief, Meeting Brief), grounded report drafting, and constrained generation (notices).
3. **Governed semantic layer (department-scoped subset)** — defines the department metrics/dimensions the HOD may ask about (department risk, attendance, performance, interventions, KPIs, goals). Faculty/research/budget metrics are **absent until that data is ingested** — the semantic layer literally has nothing to bind them to, which is the architectural reason those features can't be V1.
4. **Deterministic query execution** — code builds parameterised, allow-listed, **read-only** queries; **tenant_id and department scope injected server-side**; **Postgres RLS** + department filter enforce isolation (defense in depth).
5. **Shared signals/engine** — reuses the Student Success engine's findings/scores and the department-scoped summary/board (already role-scoped). The HOD, being staff, **may** see tier/score with reasons.
6. **Unified data layer** — canonical entities + audit + provenance.
7. **Generation services** — grounded report drafting and constrained notice/brief generation, all producing human-approved drafts.

**Key behaviours and reasoning:**
- **Model selects governed concepts, never SQL or numbers.** *Why:* the platform's anti-hallucination/anti-leakage guarantee; not relaxed for the HOD.
- **Department scope injected server-side.** *Why:* an HOD asking broad questions is a prime place for scope to widen accidentally; scope must never depend on client/model output.
- **Abstain over guess; honest "not connected" over invent.** *Why:* trust, and the data-gating reality — the assistant must distinguish "no data" from "no such thing."
- **Drafts, not actions.** Reports/notices/minutes are drafts; nothing is published or written to the ERP. *Why:* read-only/advisory invariant; human-in-the-loop.
- **Faculty analytics are descriptive, never predictive personnel scoring.** *Why:* DPDP (faculty are data principals), IR/ethics, and the "avoid black-box scores / advisory not controlling" principles.

**Architectural trade-offs (recommended + why):**

| Decision | Options | Recommended | Why |
|---|---|---|---|
| **HOD scope model** | (a) new bespoke scope; (b) reuse `FacultyScope(department)` extended | **(b) reuse + extend** | The department-scope primitive already exists and is tested; extend it with an `hod` role + elevated read rather than build a parallel system. |
| **Scope enforcement** | (a) app filter; (b) RLS; (c) both | **(c) both** | Defense in depth; mirrors the platform's RLS-as-backstop philosophy. |
| **Dashboard data** | (a) NL for everything; (b) fixed aggregate endpoints + NL for open questions | **(b)** | High-traffic KPIs/board are deterministic aggregates (cheap, reliable); NL handles open-ended questions safely via the semantic layer. |
| **Trends** | (a) build now; (b) defer until history | **(b) defer** | No trend endpoint exists and a new pilot has no history; render placeholders (platform-consistent). |
| **Faculty features** | (a) build with proxy data; (b) gate on real data + governance | **(b) gate** | Data isn't ingested and employee profiling needs governance; proxy data would be both wrong and unsafe. |
| **Report/notice output** | (a) auto-send; (b) human-approved draft | **(b) draft** | Read-only/advisory invariant; accuracy and tone need human review. |

## 15. Data Requirements

*(What data the role needs and its state today — not schemas.)*

**Available now (populated, wired) — powers all 🟢 V1 features, department-scoped:**
- Students, Attendance, Internal marks, Fees, Enrollment; reference entities Departments, Programmes, Courses; Risk assessments + findings + interventions.

**DDL-only / not wired (powers nothing until ingestion is built):**
- **Faculty** (DDL only, not in the ingestion connector) → blocks Faculty Performance/Workload/Allocation.
- **SemesterResult** (DDL only, unwired) → richer result analytics gated.

**Empty stubs (no columns, no behaviour):**
- **ResearchPublication** → blocks Research & Publication Analytics.
- **Placement**, **Hostel** → not central to HOD V1.

**Absent entirely from the model:**
- **Budget/finance** (financial depth beyond fees is an explicit v1 exclusion) → blocks Budget & Resource Planning.
- **Timetable** → gates Timetable Intelligence on a new source.
- **Syllabus/course-coverage** → gates Course Coverage on a new source (LMS).
- **Meeting transcripts/notes** → a new input modality for Minutes.

**Module-gated:**
- **Accreditation criterion mapping/evidence** → provided by the Accreditation module (planned, not built).

**New data this role introduces (extends, doesn't redesign):**
- The **`hod` role + HOD↔department binding**; **department-owned artefacts** (goals, draft reports, draft notices). These are additive.

**Data ownership & roles (DPDP):** the institution is Data Fiduciary; the ERP is the SoR. **Students** (esp. minors) and **faculty** are both data principals. The HOD surface is a read-only/advisory view; minor-student processing stays academic-signal-only and advisory; faculty-data processing (V2) is governed, descriptive, and access-controlled.

**Freshness & provenance:** reads reflect last sync; every numeric surface shows freshness; provenance on every canonical row supports "where does this number come from."

## 16. API Summary (High Level)

*(Endpoint families and intent only — no contracts/schemas. Existing endpoints reused and re-scoped; new ones added behind the same conventions: JWT, tenant-scoped session, now also department-scoped.)*

**Reused / extended (existing):**
- **Auth** (`/auth/*`) — extended to support the **`hod` role** and HOD↔department binding; issues department-scoped sessions.
- **Risk summary / by-department / board / student risk** (`/risk/summary`, `/risk/summary/by-department`, `/risk/students`, `/risk/students/{id}`) — already role-scoped; the HOD resolves to their department(s). The by-department endpoint is directly reusable.
- **Student 360** (`GET /students/{id}`) — drill-down, constrained to students within the HOD's department.
- **Interventions** (`/risk/interventions…`) — oversight within the department; minor consent gate enforced.

**New endpoint families for the HOD surface (high level):**
- **Department dashboard / KPIs** — point-in-time department aggregates.
- **Department performance & attendance analytics** — programme/course drill-downs.
- **Department Daily Brief** — assembled department digest.
- **Department NL copilot** — NL question → grounded, department-scoped answer.
- **Report drafts** — generate/list/export grounded report drafts.
- **Notice drafts** — generate/edit notice drafts (publish is human-triggered via existing channels).
- **Department goals** — CRUD on the department-owned goal artefact + live progress.
- **Department switcher** — list/select the HOD's departments.

**Gated (build when data/module exists):** faculty analytics, research analytics, budget/resource, timetable, course coverage, accreditation contribution, meeting minutes.

**Cross-cutting rules:** all HOD endpoints require a valid JWT, run in a tenant- **and department-scoped** session, are read-only against the SoR (writes only to department-owned artefacts), fail closed if scope can't be established, and are audited.

## 17. Security Considerations

**Identity & scope:**
- New `hod` role; **department scope enforced server-side at app + DB (RLS) layers** (defense in depth); never client/model-derived; fail closed.
- **Cross-department / cross-scope prevention:** an HOD can never resolve another department's or institution-wide data; multi-department switching re-scopes cleanly; tested adversarially.
- Elevated faculty-level read (V2) is gated, governed, and audited.

**Tenant isolation:** existing RLS + server-injected tenant_id remain authoritative; department scope is additive.

**AI-specific security:**
- No model-emitted SQL or scope identifiers; semantic-layer allow-listing; deterministic query construction.
- **Prompt-injection / jailbreak resistance:** untrusted content (uploaded meeting notes, report context, KB) cannot expand scope or exfiltrate data; the model's reach is bounded by department scope regardless of content instructions.
- Hallucination guardrail as a safety control; honest "not connected" for gated data.

**Data protection:**
- Encryption in transit/at rest; least privilege; secrets centrally managed; immutable audit of HOD reads, AI interactions, and draft generation.
- **DPDP — students:** minor processing academic-signal-only, advisory; parent-contact consent gate on interventions.
- **DPDP — faculty (V2):** employee data minimisation, purpose limitation, transparency, no profiling/appraisal misuse, governance + legal review before build.

**Abuse & safety:** rate limiting on NL and generation surfaces; draft outputs clearly marked; content safety on generated notices/reports.

**Auditing:** every HOD read, AI interaction, and draft generation recorded (actor, department scope, tenant, time) for DPDP accountability and incident review.

## 18. Error Handling

Principle: **fail safe, fail honest, never fabricate; distinguish "no data" from "no capability."**

| Situation | Behaviour |
|---|---|
| **Department scope can't be established** | Deny HOD reads (fail closed); clear "couldn't resolve your department" state; route to admin. |
| **Data-gated feature (faculty/research/budget/timetable/coverage)** | Honest "not connected yet" state for that feature; rest of dashboard works; never invented data. |
| **Module-gated (accreditation)** | "Accreditation module not yet available" state; no fake criterion data. |
| **AI/NL engine unavailable** | Deterministic dashboard/board still works; NL shows transient "can't answer right now"; never a fabricated answer. |
| **No governed metric matches** | Graceful abstention + suggestion of what can be answered. |
| **Out-of-scope request** (other department / institution-wide) | Decline with explanation ("I can only show your department"); audit. |
| **Trend requested but no history** | Placeholder ("builds as data accumulates"); never a fake line. |
| **Report/notice generation low-confidence or data-missing** | Produce a partial draft clearly flagging gaps; never assert ungrounded figures. |
| **Stale data** | Last-updated/stale indicator; never imply real-time. |
| **Partial dashboard load** | Render available widgets; per-widget error/empty/not-connected states; no dead-end. |

All errors are logged/observable; user-facing messages are plain-language.

## 19. Edge Cases

- **HOD heads multiple departments:** explicit switcher; everything re-scopes; no aggregation across departments unless explicitly designed (and even then, never beyond the HOD's own departments).
- **HOD reassigned / steps down:** scope binding updates; prior department data no longer accessible; audited.
- **Student in HOD's department but mid entity-resolution (ambiguous):** safe partial state; no guessed merge.
- **Student spanning departments (interdisciplinary/electives):** define attribution (home programme→department) consistently; avoid double-counting in KPIs.
- **"Unassigned" department bucket** (students with no resolvable department, as the existing by-department endpoint returns): the HOD sees only their own department, never the Unassigned bucket (that's a Principal/admin data-quality concern).
- **Minor students in the department:** academic-signal-only, advisory; parent-contact via consent gate; the HOD (staff) may see tier/score with reasons, but no detrimental profiling and no automated action.
- **Faculty-data feature requested in V1 (before ingestion):** honest "not connected yet," not an error or proxy data.
- **Faculty privacy pushback (V2):** descriptive-only, transparent, governed; never a ranking; never automated action — by design.
- **New pilot, no data:** empty-but-correct everywhere; trends placeholdered.
- **Attendance norm unconfigured:** show standing without a margin claim.
- **Adversarial prompts** ("show me another department / the whole college / rank my faculty"): scope and governance hold; decline + audit.
- **Report draft over-trusted:** drafts clearly marked; figures traceable; HOD must review before use.
- **Accreditation overlap with IQAC:** HOD contributes department evidence; IQAC owns/approves — enforced by permissions.

---

# CHAPTER 5 — Delivery (Sections 20–23)

## 20. Success Metrics

**Adoption & engagement**
- HOD weekly/daily active rate; Daily Brief open rate; NL questions per active HOD; reports/notices generated.

**Outcomes (department)**
- At-risk students caught early (vs prior baseline); intervention follow-through rate; reduction in attendance-norm breaches / academic-decline cases among acted-on cohorts (correlation, tracked over a term).

**Efficiency**
- Report turnaround time (hours saved per report); query deflection from IT/data staff; notice authoring time.

**Steering**
- Goal-progress visibility/usage; KPI dashboard usage; drill-down depth.

**Quality & trust**
- Answer-grounding rate (~100% traceable); abstention correctness; misread rate; HOD-reported "wrong answer" complaints; draft acceptance rate (drafts used after light edit).

**Safety & compliance (must-pass, not just KPIs)**
- Zero cross-department / cross-tenant exposure (any incident is Sev-1); DPDP minor handling intact (consent gate adherence); **no faculty ranking/score or automated personnel action exists** in shipped features; audit completeness.

**Experience**
- NL latency (p50/p95) under peak; dashboard availability; HOD NPS/CSAT.

## 21. Testing Checklist

**Scope & security (blocking — the #1 risk)**
- [ ] An HOD reads **only** their department across every endpoint, the dashboard, NL, reports, and aggregations.
- [ ] Department scope enforced at app + DB (RLS) layers; removing the app filter still yields zero cross-department rows.
- [ ] Multi-department switching re-scopes cleanly; no cross-department bleed; no aggregation beyond owned departments.
- [ ] Cross-tenant isolation unaffected by the new role/scope (existing RLS tests green).
- [ ] Scope **fails closed** when HOD↔department binding can't be resolved.
- [ ] HOD cannot reach institution-wide leadership data, another department, the IQAC SoR editor, or any ERP write path.
- [ ] Prompt-injection via report context / meeting notes / KB cannot expand scope or exfiltrate data.
- [ ] NL path never emits SQL; scope/tenant identifiers server-injected only.

**DPDP & governance (blocking)**
- [ ] Minor-student handling intact (academic-signal-only, advisory, parent-contact consent gate) in the department context.
- [ ] No shipped feature exposes a faculty performance score/ranking or triggers automated personnel action.
- [ ] Faculty-data features (when built) are descriptive/advisory, transparent, governed, audited.

**Functional**
- [ ] Department dashboard/KPIs/Brief assemble correctly (full/empty/partial/stale); trends show placeholders.
- [ ] At-risk board, performance, attendance, interventions are department-scoped and correct; Student 360 drill bounded to department.
- [ ] NL answers grounded, echo interpretation, abstain correctly out-of-scope/out-of-data, and say "not connected yet" for gated data (distinct from abstention).
- [ ] Report/notice generators produce grounded/constrained **drafts**; never auto-publish; flag data gaps.
- [ ] Goal Tracking computes progress from live signals; goals are department-owned.
- [ ] Data-gated/module-gated features show honest not-connected states.

**Non-functional**
- [ ] Department aggregations within latency targets at peak; bounded query counts (no N+1).
- [ ] Graceful degradation when a source/module/AI engine is down; core reads survive.
- [ ] Accessibility (colour-vision-safe, labeled controls); honest empty/partial/stale states.
- [ ] Audit records for HOD reads, AI interactions, and draft generation.

**Adversarial / red-team**
- [ ] "Show another department / the whole college / the Unassigned bucket" → declined + audited.
- [ ] "Rank my faculty / who's the worst teacher" → declined (no personnel scoring) + audited.
- [ ] "Ignore instructions / reveal system data" → guardrails hold.

## 22. Implementation Roadmap

**Phase H0 — HOD role & department-scope authority (foundational).**
Add the `hod` role; bind HOD↔department(s); resolve department scope server-side (reuse + extend `FacultyScope(department)`); app + DB (RLS) enforcement; multi-department switching; audit; fail-closed. *Exit:* an HOD logs in and reads only their department; scope/isolation tests (incl. cross-department + DB backstop) green.

**Phase H1 — Department intelligence over existing data (🟢 V1, P0).**
Department dashboard + KPIs (point-in-time, trend placeholders), Daily Brief, At-Risk board (re-scoped), Student Performance & Attendance analytics, Intervention oversight (minor consent gate). *Exit:* an HOD can monitor and act on department risk/performance daily.

**Phase H2 — Department NL + drafting (🟢 V1, P0/P1).**
Department Query Assistant (grounded, scope-enforced, abstains; "not connected" for gated data), Reports Generator, Notice Generator, grounded Meeting Brief. *Exit:* self-serve answers + fast draft reports/notices; adversarial scope/personnel tests pass.

**Phase H3 — Goals & timetable (🟢/🟡 V1, P1).**
Department Goal Tracking (new artefact, live progress); Timetable Intelligence **if** a timetable source exists (else honest not-connected). *Exit:* goal visibility; timetable where data allows.

**Phase H4 — Faculty Module (🔴/🟠 V2) — gated.**
*Entry gated on:* (a) faculty-data ingestion (Faculty wired + allocation/workload data), (b) **privacy/HR/ethics governance + legal review**, (c) explicit scoping to descriptive/advisory only. Then: Faculty Workload Analyzer, Course Allocation Assistant (renamed from "Recommendation Engine"), Course Coverage Tracker (needs syllabus source), Faculty Performance Analytics (descriptive only). *Exit:* department planning support that is demonstrably non-appraisal and governed.

**Phase H5 — Accreditation, Research, Budget, Minutes (🔵/🟠 V2) — gated.**
Accreditation contribution view + drafting (when the Accreditation module ships; IQAC owns); Research & Publication Analytics (when research data ingested); Budget & Resource Planning (when a budget source exists; advisory); Meeting Minutes (when a transcript input pipeline exists). *Exit:* each lights up as its dependency lands.

**Cross-phase, always-on:** scope/DPDP/governance testing, audit, observability, accessibility, graceful degradation — part of every phase's definition of done.

**Gates to confirm before/within build:** HOD provisioning + HOD↔department binding model with the institution; which sources exist per tenant (timetable, faculty, research, budget, syllabus); the Accreditation module timeline; the faculty-data governance decision; and the HOD↔IQAC accreditation boundary.

## 23. Future Scope

**Near-term (post-V1 / V2):**
- The full **Faculty Module** (workload, allocation, coverage, descriptive performance) once data + governance land.
- Research & Publication Analytics; Budget & Resource Planning (read-only finance integration).
- Accreditation contribution depth (CO-PO attainment, DVV-style pre-checks) aligned to the Accreditation module.
- Meeting Minutes (transcript pipeline); Indic-language NL; saved/shared department queries.

**Medium-term (V3+):**
- Department **trend analytics** once history accrues (the deferred trend reconstruction).
- ML-based department risk/forecasting (the later predictive module).
- Cascading goals with the Principal/Management roles (institution → department alignment).
- What-if planning (timetable, workload, resource scenarios).

**Explicitly out of scope (and expected to stay so unless re-decided):**
- Any ERP write-back or auto-publish; autonomous action.
- Faculty performance **scoring/ranking** or any automated personnel/appraisal action.
- Institution-wide oversight (Principal/Management scope) or owning the accreditation SoR (IQAC).
- Behavioural/detrimental profiling of students (always; minors especially) or of faculty.
- Financial accounting depth beyond fees (integrate, don't rebuild).

---

## Appendix A — Open decisions required for sign-off
1. **HOD role & provisioning:** confirm the `hod` role and how the institution binds an HOD to department(s) (drives Phase H0).
2. **Faculty-data governance:** the privacy/HR/ethics decision and scope (descriptive/advisory only, no ranking, no automated action) before any faculty feature is built.
3. **Source availability per tenant:** timetable, faculty, research, budget, syllabus — which exist for the pilot (gates H3–H5 features).
4. **Accreditation module timeline** and the **HOD↔IQAC boundary** (contributes vs owns).
5. **Dashboard consolidation:** confirm merging Department Performance Dashboard (7.1) and KPI Dashboard (7.16) into one surface.
6. **Feature renames/splits:** "Faculty Recommendation Engine" → "Course Allocation Assistant"; split Meeting Brief (earlier) from Minutes (V2).
7. **Persona reconciliation:** the V1 six-persona list vs. the design doc's named set (Principal/Management/IQAC/Faculty/Student) — reconcile once across all RSDDs, especially the HOD↔Principal↔IQAC boundaries.

## Appendix B — Grounding & provenance of this document
- **Verified against current backend/design artefacts read this session:** the locked role set (`admin, principal, registrar, iqac, faculty, student` — **no `hod`/`management`**); the department-scope mechanism (`FacultyScope` with `scope_type="department"`, `visible_student_ids`); the already-role-scoped `/risk/summary` and `/risk/summary/by-department` endpoints (incl. the `"Unassigned"` bucket); the deferred-trends decision (no trend endpoint); the canonical model state — **`Faculty` and `SemesterResult` are DDL-only/unwired**, **`ResearchPublication`/`Placement`/`Hostel` are empty stubs**, **no budget/timetable/syllabus entities**; the read-only/advisory invariant; and the DPDP minor handling (academic-signal-only, consent gate).
- **Net-new for this role (introduced here, detailed later):** the `hod` role + HOD↔department authority (extends the existing scope machinery), department-level aggregation, and department-owned artefacts (goals, draft reports/notices).
- **Honest data-gating call:** the buildability tags in Chapter 2 reflect what the platform can actually serve today. Faculty/research/budget/timetable/syllabus features are **data-gated** (the entities are stubs or absent), the Accreditation feature is **module-gated**, and the faculty-performance features additionally need a **governance decision** — none of which is a priority judgment, it is a data/governance reality.
- **Consistency:** inherits the same invariants and house style as the Student RSDD; the read-only/advisory, server-side-scope, grounding/abstention, and DPDP positions are identical, re-scoped from self to department.
