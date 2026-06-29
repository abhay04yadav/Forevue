# Student_AI_Complete_Design_v1.0

**Version:** v1.0  
**Generated:** June 27, 2026

---

> This document is a merged compilation of the provided design documents.

---

# Academic Head AI Assistant — Role Definition & Feature Freeze Document

**Product:** AI ERP Copilot (AI Intelligence Layer over College ERP)
**Phase:** Phase 1 — Product Definition
**Persona:** Academic Head AI Assistant (net-new leadership persona)
**Status:** Draft for Feature Freeze sign-off
**System of Record:** Existing ERP (Fedena / ERPNext / MasterSoft / TCS iON) — unchanged
**AI Layer posture (V1):** Read-only and advisory. AI suggests; humans act. No ERP write-back.

---

## 0. Pre-Freeze Product Decisions (read before the freeze table)

These decisions are made deliberately, with reasoning, so deferrals are honest and traceable rather than implicit. They are the difference between a feature list and a freeze.

### 0.1 Role identity — Academic Head is a persona on the privileged tier, not a new data scope

The locked role set is `admin / principal / registrar / iqac / faculty / student`. There is **no `academic_head` and no `director` value** in `users.role`. The platform's scoping resolver already grants **full tenant-wide visibility** to the privileged group (`admin / principal / registrar / iqac`) and restricts only `faculty` (to their `faculty_scopes`) and `student` (out of scope).

Consequence: Academic Head needs **no new data-access mechanism** — it inherits the existing full-institution read scope. What it needs is a *product decision* on identity:

- **Recommended (V1):** provision Academic Head users under the existing **principal-class** visibility tier and differentiate the persona at the **application/copilot layer** (which dashboards, briefs, and prompts they see), not at the database role layer. This avoids touching the Phase 0 locked `VALID_ROLES` check constraint.
- **Alternative (governance decision required):** mint a new `academic_head` role value. This is a change to a locked Phase 0 schema constraint and must go through the same role-set governance gate used for HOD and Placement Cell. Flagged, not assumed.

### 0.2 Renames to prevent ownership collisions and honor platform principles

- **"AI Institutional Health Score" → "Institutional Health Indicators."** A single composite black-box score violates the locked principle "avoid black-box scores; show evidence behind every flag." The feature ships as a **decomposed, explainable panel** of named indicators (risk distribution, attendance health, academic health, fee health), each traceable to its evidence — not one opaque number.
- **"Student Success Analytics" → "Institution-wide Student Success Overview."** Prevents collision with the platform-level **Student Success Engine** and the HOD's "Department Risk Overview." Academic Head owns the *institution-wide aggregate*; HOD owns *one department*; Faculty owns *their cohort*. Same engine, three aggregation levels.
- **"Department Performance Analytics" → scoped to cross-department comparison.** HOD AI owns the deep single-department view. Academic Head's feature is explicitly the *compare-across-departments* lens, not a second single-department tool.

### 0.3 Scope-tightening

- **"AI Decision Support Assistant"** is tightened to **grounded analytics support only**: it surfaces, ranks, and explains options *from data that exists in the semantic layer*. It must never free-generate recommendations, numbers, or strategy that the data cannot support. Re-scoped this way it is V1-safe; left open-ended it is a hallucination surface.

### 0.4 Deferrals — data the canonical model does not yet contain

Each of these is deferred **because the source data is absent or unwired**, not because it lacks value:

- **Faculty Performance Dashboard** — the `faculty` entity is DDL-only and **not wired into ingestion**; there is no teaching-load, feedback, or output data in the canonical model. Also requires HR/privacy/ethics sign-off (same gate as the Faculty Module). → **V2 (data + governance gated).**
- **Student Discipline & Wellbeing Monitor** — no discipline or wellbeing data exists in the canonical model, and monitoring minors' behaviour/wellbeing is a **DPDP detrimental-profiling risk** requiring explicit legal review. → **V2 (data + DPDP gated).**
- **Accreditation (NAAC/NBA/NIRF) Assistant** — accreditation auto-drafting is explicitly a **later phase** and depends on accreditation data structures that do not exist yet; this also overlaps IQAC ownership. → **V2 (data gated).**
- **Budget & Resource Overview** — the only financial data in the canonical model is **student fees**; there is no budget, expense, payroll, or resource-allocation data. → **V2 (data gated).**
- **Meeting Briefs & Action Items Generator** — there is no meeting/transcript data source, and this is generative. → **V2 (data + governance gated).**
- **Campus Events & Calendar Intelligence** — no events/calendar entity exists. → **V3.**
- **Strategic Goal Tracking Dashboard** — no goals/OKR entity exists. → **V3.**

### 0.5 Governance gate — generative content

- **"AI Notice & Circular Generator"** is generative content authoring. The platform's original V1 scope deferred content authoring; this is the same expansion currently awaiting leadership ratification for the Faculty persona. It is frozen as **V1-conditional**, gated on that single generative-content sign-off. If sign-off lands, it ships in V1; if not, it moves to V2 with the rest of the content suite.

---

## 1. Role Overview

The **Academic Head** is the institution's senior academic leadership persona — Principal, Vice-Principal, or Dean (Academics) — accountable for the academic health of the *whole institution* across all departments. Where the HOD owns one department and Faculty owns their cohort, the Academic Head owns the **cross-cutting, institution-wide view**.

The Academic Head AI Assistant is a **read-only, advisory copilot** layered on top of the ERP. It does not replace the ERP, does not write back to it, and does not act autonomously. It unifies already-ingested institutional data into institution-wide dashboards, surfaces risk and trends earlier than manual reporting could, and answers natural-language questions over a governed semantic layer — never over raw SQL.

It sits **below a future Director/Trust persona** (multi-campus / board governance) and **above HOD** in scope, and it must not duplicate either.

---

## 2. Role Goals

1. **See the whole institution at a glance** — one daily, trustworthy picture of academic health across every department, without waiting for manual MIS compilation.
2. **Catch institution-wide risk early** — aggregate the Student Success Engine's signals to the institutional level so systemic problems (a failing cohort, a department-wide attendance collapse) surface before they become crises.
3. **Compare across departments fairly** — give leadership an apples-to-apples cross-department lens for resource and attention decisions.
4. **Reduce reporting burden** — turn recurring institutional reports and the daily brief into one-click, evidence-linked outputs.
5. **Answer in plain language** — let a non-technical academic leader query institutional data conversationally and get explainable, tenant-scoped, read-only answers.
6. **Support decisions, not make them** — present grounded options with evidence; leave the decision and the action to the human.

---

## 3. User Profile

| Attribute | Detail |
|---|---|
| **Who** | Principal / Vice-Principal / Dean (Academics) / Academic Head |
| **Technical level** | Low to moderate; expects natural-language interaction, not query builders |
| **Scope of authority** | Whole institution (all departments, all programmes, all students) within one tenant |
| **Primary cadence** | Daily brief in the morning; dashboard review through the day; reports weekly/monthly; ad-hoc NL questions |
| **Visibility tier** | Privileged (full tenant-wide read), inherited from the existing scoping resolver |
| **What they care about** | Institutional academic health, at-risk cohorts, department comparison, accreditation readiness (later), board-ready summaries |
| **What they must not do** | Edit ERP records, override faculty/HOD data ownership, view restricted operational/financial detail outside academic remit, act on AI output without review |

---

## 4. Feature Catalog

> Buildability tags: **V1-ready** (buildable on wired data now) · **V1-conditional** (gated on a governance sign-off) · **V2 (data-gated)** · **V2 (data + governance gated)** · **V3**.

### 4.1 Institutional Performance Dashboard — *V1-ready*
- **Purpose:** A single landing view of institution-wide academic health.
- **Problem Solved:** Leadership today stitches this together manually from departmental spreadsheets, days late.
- **Business Value:** Faster, evidence-based leadership attention; a visible reason the ERP investment is finally usable.
- **User Value:** "Where does my institution stand, right now?" answered in one screen.
- **Inputs Required:** Canonical students, attendance, internal_marks, fees; current risk assessments.
- **Outputs Produced:** KPI tiles (students assessed, tier counts), risk distribution, department breakdown, top-risk list.
- **Dependencies:** Student Success Engine, `/risk/summary`, `/risk/summary/by-department`.
- **AI Involvement:** Low — aggregation + plain-language summary of what the numbers show.
- **Expected Behaviour:** Renders only visible (tenant-wide) data; shows an honest empty/stale state when data is thin.
- **Permissions:** View, View Analytics, Export. No write.
- **Limitations:** Risk-trend-over-time is a placeholder until assessment history accumulates (no trend endpoint yet).
- **Future Enhancements:** Trend charting once history exists; configurable tile sets.

### 4.2 Institution-wide Student Success Overview *(renamed from "Student Success Analytics")* — *V1-ready*
- **Purpose:** Institution-level aggregate of the Student Success Engine's at-risk picture.
- **Problem Solved:** No single place shows systemic student risk above the department line.
- **Business Value:** Earlier institutional intervention; outcome data for the value story.
- **User Value:** "Which cohorts/departments are systemically at risk, and why?"
- **Inputs Required:** Current risk assessments, findings (with evidence), department links.
- **Outputs Produced:** Aggregated risk by tier/type/department, with drill-down to explanations.
- **Dependencies:** Student Success Engine; existing `/risk` surfaces.
- **AI Involvement:** Low–moderate — summarization and pattern-calling over engine output.
- **Expected Behaviour:** Every flag is decomposed to its findings/evidence; no opaque scores.
- **Permissions:** View, View Analytics, Export, Trigger AI (summarize).
- **Limitations:** Bounded to the three wired risk types (attendance, academic, fee).
- **Future Enhancements:** Additional risk types as new signals are wired.
- **Boundary:** Aggregate only. Single-department lens belongs to HOD; per-student to Faculty/Student.

### 4.3 Faculty Performance Dashboard — *V2 (data + governance gated)*
- **Purpose:** Institution-wide view of faculty effectiveness.
- **Problem Solved:** No consolidated faculty performance picture today.
- **Business Value / User Value:** Significant — but unbuildable now.
- **Inputs Required:** Faculty teaching load, feedback, outcomes — **none of which are in the canonical model.**
- **Dependencies:** `faculty` entity wiring (currently DDL-only, unwired); HR/privacy/ethics sign-off.
- **AI Involvement:** Deferred.
- **Limitations:** Blocked on data ingestion **and** governance. Building it now would mean inventing data.
- **Future Enhancements:** Revisit after the Faculty Module data + governance gate clears.

### 4.4 Department Performance Analytics *(scoped to cross-department comparison)* — *V1-ready*
- **Purpose:** Compare departments side-by-side on academic-health metrics.
- **Problem Solved:** Leadership lacks a fair, consistent cross-department comparison.
- **Business Value:** Better attention/resource allocation decisions.
- **User Value:** "Which departments need help, relative to the rest?"
- **Inputs Required:** Department-grouped risk, attendance, academic aggregates.
- **Outputs Produced:** Ranked/comparative department views with high-share %.
- **Dependencies:** `/risk/summary/by-department`; canonical department links.
- **AI Involvement:** Low — comparison + explanation.
- **Permissions:** View, View Analytics, Export.
- **Limitations:** Comparison is on wired academic signals only, not faculty/budget.
- **Boundary:** Cross-department compare only. Deep single-department analytics = HOD AI.

### 4.5 Institutional Health Indicators *(renamed from "AI Institutional Health Score")* — *V1-ready*
- **Purpose:** A decomposed, explainable panel of institutional academic-health indicators.
- **Problem Solved:** Leadership wants a quick health read without a misleading single number.
- **Business Value:** Fast orientation that survives scrutiny because every indicator is traceable.
- **User Value:** "Is the institution healthy, and on what basis?"
- **Inputs Required:** Aggregated risk distribution, attendance health, academic health, fee health.
- **Outputs Produced:** Named indicators with status + the evidence behind each.
- **Dependencies:** Student Success Engine aggregates.
- **AI Involvement:** Low — composes and narrates indicators; does not invent a score.
- **Permissions:** View, View Analytics, Export.
- **Limitations:** Deliberately **not** a single composite score (platform principle).
- **Future Enhancements:** Tenant-configurable indicator weighting (still explainable).

### 4.6 Attendance & Academic Intelligence — *V1-ready*
- **Purpose:** Institution-wide attendance and academic-performance intelligence.
- **Problem Solved:** Attendance/academic problems are seen late and per-department.
- **Business Value:** Earlier systemic detection.
- **User Value:** "Where is attendance slipping or academics declining, institution-wide?"
- **Inputs Required:** Canonical attendance, internal_marks; risk signals derived from them.
- **Outputs Produced:** Institution-wide attendance/academic summaries, decline flags with evidence.
- **Dependencies:** Wired attendance + internal_marks; Student Success Engine signals.
- **AI Involvement:** Low–moderate — summarize, detect decline, explain.
- **Permissions:** View, View Analytics, Export, Trigger AI.
- **Limitations:** `semester_results` is DDL-only/unwired, so deeper result-level analytics is limited until wired.

### 4.7 Student Discipline & Wellbeing Monitor — *V2 (data + DPDP gated)*
- **Purpose:** Monitor discipline and wellbeing signals institution-wide.
- **Problem Solved:** Real, but unbuildable and legally sensitive now.
- **Inputs Required:** Discipline/wellbeing data — **absent from the canonical model.**
- **Dependencies:** New data sources; **DPDP detrimental-profiling legal review** (many students are minors).
- **AI Involvement:** Deferred.
- **Limitations:** Blocked on data **and** a hard DPDP gate. Profiling minors' behaviour requires lawful-basis review before any design.
- **Future Enhancements:** Revisit only after legal review defines lawful, non-detrimental scope.

### 4.8 AI Decision Support Assistant *(scope-tightened)* — *V1-ready*
- **Purpose:** Surface and explain grounded options to support leadership decisions.
- **Problem Solved:** Leadership decisions are made without a fast, evidence-linked options view.
- **Business Value:** Better-informed decisions; defensible because grounded.
- **User Value:** "Given the data, what are my options and the evidence for each?"
- **Inputs Required:** Semantic-layer metrics only.
- **Outputs Produced:** Ranked, explained options strictly derived from existing data.
- **Dependencies:** Governed semantic layer; Student Success Engine.
- **AI Involvement:** Moderate — analyze, prioritize, explain. **Never** free-generates numbers/strategy.
- **Permissions:** View Analytics, Trigger AI.
- **Limitations:** Advisory only; "I can't answer that from the data" fallback enforced.

### 4.9 Institutional Reports Generator — *V1-ready*
- **Purpose:** One-click recurring institutional reports over the governed semantic layer.
- **Problem Solved:** Manual MIS compilation is slow and error-prone.
- **Business Value:** Major time savings; consistency.
- **User Value:** "Generate the monthly academic report" → evidence-linked draft.
- **Inputs Required:** Semantic-layer metrics; report template/parameters.
- **Outputs Produced:** Structured report drafts with linked evidence; export.
- **Dependencies:** Semantic layer; export service.
- **AI Involvement:** Moderate — assemble + narrate from real metrics only.
- **Permissions:** View, Create (draft), Export, Share (consent-aware), Trigger AI.
- **Limitations:** Statutory/accreditation reports excluded in V1 (those are IQAC/accreditation scope).
- **Boundary:** General institutional reporting only. Accreditation drafts = V2/IQAC; statutory MIS = Registrar.

### 4.10 AI Notice & Circular Generator — *V1-conditional (generative-content sign-off)*
- **Purpose:** Draft institutional notices/circulars.
- **Problem Solved:** Repetitive administrative writing.
- **Business Value / User Value:** Time savings; consistent tone.
- **Inputs Required:** Prompt + relevant institutional facts from the semantic layer.
- **Outputs Produced:** Draft notice/circular for human review and release.
- **Dependencies:** Generative-content capability + **leadership sign-off that content authoring is in V1 scope** (same gate as the Faculty content suite).
- **AI Involvement:** High (generative) — always a draft, never auto-published.
- **Permissions:** Create (draft), Edit, Share (after human approval), Trigger AI.
- **Limitations:** No factual claims beyond grounded data; human approval mandatory.
- **If sign-off denied:** moves to V2 with the content suite.

### 4.11 Meeting Briefs & Action Items Generator — *V2 (data + governance gated)*
- **Purpose:** Generate meeting briefs and action items.
- **Inputs Required:** Meeting agenda/transcript source — **none exists.**
- **Dependencies:** A meeting-input data source; generative-content sign-off.
- **AI Involvement:** Deferred (generative).
- **Limitations:** Blocked on both an input source and the content gate.

### 4.12 Accreditation (NAAC/NBA/NIRF) Assistant — *V2 (data-gated)*
- **Purpose:** Assist accreditation drafting and readiness.
- **Problem Solved:** High-value, well-validated thesis — but explicitly a later phase.
- **Inputs Required:** Accreditation data structures + evidence mapping — **not yet built.**
- **Dependencies:** Accreditation data model; overlaps **IQAC** ownership.
- **AI Involvement:** Deferred.
- **Limitations:** Auto-drafting is a later-phase commitment; must not double-build against IQAC.
- **Boundary:** When built, IQAC owns accreditation authoring; Academic Head consumes readiness views.

### 4.13 Budget & Resource Overview — *V2 (data-gated)*
- **Purpose:** Institution-wide budget/resource view.
- **Inputs Required:** Budget/expense/resource data — **only student fees exist in the model.**
- **Dependencies:** Financial data ingestion (deliberately out of v1 financial scope).
- **AI Involvement:** Deferred.
- **Limitations:** Fees ≠ budget; building now means inventing data.

### 4.14 Campus Events & Calendar Intelligence — *V3*
- **Purpose:** Institutional events/calendar intelligence.
- **Inputs Required:** Events/calendar entity — **does not exist.**
- **Dependencies:** New entity + ingestion.
- **Limitations:** No source; lowest-priority leadership need.

### 4.15 Institutional Risk & Alert Center — *V1-ready*
- **Purpose:** Institution-wide risk and alert aggregation center.
- **Problem Solved:** Risk and alerts are fragmented below the institutional line.
- **Business Value:** One place leadership watches systemic risk.
- **User Value:** "What needs my attention across the institution?"
- **Inputs Required:** Risk assessments, findings, existing alert records.
- **Outputs Produced:** Aggregated, prioritized, explained alerts.
- **Dependencies:** Student Success Engine; existing alert surfaces.
- **AI Involvement:** Moderate — detect, prioritize, alert, explain.
- **Permissions:** View, View Analytics, Trigger AI.
- **Limitations:** Bounded to wired risk types; advisory only.
- **Boundary:** Institution-wide aggregation; recipient-specific alerting stays with the engine's existing routing.

### 4.16 Strategic Goal Tracking Dashboard — *V3*
- **Purpose:** Track institutional strategic goals/OKRs.
- **Inputs Required:** Goals/OKR entity — **does not exist.**
- **Dependencies:** New entity + governance for goal definition.
- **Limitations:** No source; conceptual until a goals model exists.

### 4.17 AI Chat Assistant — *V1-ready (core wedge)*
- **Purpose:** Natural-language Q&A over institutional data.
- **Problem Solved:** Non-technical leaders can't self-serve answers today.
- **Business Value:** The platform's headline differentiator at the leadership level.
- **User Value:** "Ask your institution in English."
- **Inputs Required:** NL question; governed semantic layer.
- **Outputs Produced:** Explainable, tenant-scoped, read-only answers with evidence.
- **Dependencies:** Governed semantic layer; NL→semantic translation; isolation guardrails.
- **AI Involvement:** High — but constrained to semantic-layer-backed results; **no raw SQL, no free-generated numbers.**
- **Permissions:** View Analytics, Trigger AI, Export (of answers).
- **Limitations:** "I can't answer that from the data" fallback; bounded to defined metrics.
- **Boundary:** Institution-wide read scope; same capability is role-scoped narrower for HOD/Faculty/Student.

### 4.18 Daily Executive Brief — *V1-ready*
- **Purpose:** A morning summary of what changed and what needs attention.
- **Problem Solved:** Leaders start the day blind to overnight changes.
- **Business Value:** Daily habit-forming value; the "weekly digest" promise, daily.
- **User Value:** "Tell me what matters today."
- **Inputs Required:** Latest risk/attendance/academic aggregates + deltas.
- **Outputs Produced:** Short, prioritized, evidence-linked brief.
- **Dependencies:** Aggregation surfaces; summarization.
- **AI Involvement:** Moderate — summarize, prioritize, alert.
- **Permissions:** View, Trigger AI, Export.
- **Limitations:** Deltas limited until assessment history accumulates.

---

## 5. Dashboard Overview

The Academic Head's home is the **Institutional Performance Dashboard** — the single landing surface that answers "where does the institution stand right now?"

Layout (V1, built only on wired data):
- **Top row — Institutional Health Indicators:** decomposed status tiles (students assessed; high/watch/low risk counts; attendance health; academic health; fee health). Each tile drills into its evidence. No single composite score.
- **Risk distribution bar:** institution-wide tier split.
- **Cross-department comparison:** departments ranked by high-risk share, with the "Unassigned/NO DEPARTMENT" bucket handled honestly.
- **Highest-risk-now list:** top-N students/cohorts with their findings.
- **Risk trend over time:** rendered as a labelled placeholder ("Trend builds as risk data accumulates") until assessment history exists — never faked.
- **Daily Executive Brief entry point** and **AI Chat Assistant** are reachable from the dashboard chrome.

Every number on the dashboard traces to a field that exists in the API; nothing is invented for visual completeness.

---

## 6. AI Capabilities — and why each exists

| Capability | What it does for the Academic Head | Why it exists |
|---|---|---|
| **Generate** | Drafts reports, notices, briefs (notices gated on content sign-off) | Removes repetitive administrative writing; always a reviewable draft, never auto-published. |
| **Summarize** | Condenses institution-wide data into a readable picture | A leader can't read every row; summarization is the core of the daily brief and dashboard narration. |
| **Predict** | *Constrained in V1* — surfaces decline/trend signals the engine already computes | Honest early warning without overclaiming; full predictive modelling is deferred (rules first, per platform principle). |
| **Recommend** | Suggests grounded next steps tied to evidence | Decision support — but advisory only; the human decides and acts. |
| **Analyze** | Breaks down attendance, academic, and risk patterns | Turns raw aggregates into "what's actually happening and where." |
| **Compare** | Department-vs-department and period-vs-period (where history exists) | Fair allocation of leadership attention and resources. |
| **Explain** | Decomposes every flag/answer into its evidence | The locked explainability invariant — no black-box outputs, ever. |
| **Detect Risks** | Aggregates Student Success Engine signals to the institutional level | Catches systemic risk earlier than manual reporting. |
| **Prioritize** | Ranks what needs attention first | Leadership time is scarce; the brief and alert center must lead with what matters. |
| **Alert** | Flags institution-wide conditions needing attention | Closes the loop from detection to leadership awareness. |

All capabilities operate **read-only** over the **governed semantic layer** — never raw SQL, never write-back, always tenant-scoped, always explainable.

---

## 7. Permission Matrix (Least Privilege)

Academic Head is a **read/advisory** persona. It can author **drafts** (reports, and notices if the content gate clears) but cannot mutate ERP/system-of-record data, cannot delete, and cannot approve workflows that belong to other roles.

| Action | Academic Head | Notes |
|---|---|---|
| **View** | ✅ Institution-wide | Full tenant read (privileged tier). |
| **Create** | ⚠️ Drafts only | Report drafts; notice drafts only if generative-content sign-off lands. |
| **Edit** | ⚠️ Own drafts only | Cannot edit ERP records or other roles' data. |
| **Delete** | ❌ Never | No delete on any tenant data (append-only/audit-safe schema). |
| **Approve** | ❌ Not in V1 | AI is advisory; no approval authority over ERP workflows. |
| **Export** | ✅ | Reports, analytics, answers. |
| **Share** | ⚠️ Consent-gated | External sharing passes the platform consent gate; minor-data guards apply. |
| **Trigger AI** | ✅ | Chat, summarize, generate (within gates). |
| **View Analytics** | ✅ Institution-wide | Inherited full-visibility scope. |
| **Access Sensitive Data** | ⚠️ Academic remit only | No discipline/wellbeing/HR/financial-detail access in V1 (those features are deferred); minor PII handled under DPDP minimisation. |

Principle: the Academic Head sees **everything academic, institution-wide, read-only** — and writes **nothing** back to the System of Record.

---

## 8. Data Access

- **Required Data (V1, all already wired):** students, departments, programmes, courses, enrollment, attendance, internal_marks, fees; current risk assessments, findings, and alerts — all tenant-scoped via Row-Level Security.
- **Restricted Data (V1):** faculty performance/HR data, discipline/wellbeing records, budget/expense data, accreditation evidence, meeting/strategic-goal data — **not accessible because the features that would use them are deferred and the data is unwired/absent.** Restricting them now is both a privilege and a data-reality boundary.
- **Data Ownership:** The ERP remains the System of Record and owns the source data. Faculty own cohort-level entry; HOD owns department-level context; IQAC owns accreditation evidence. The Academic Head **consumes** aggregates; it does not own or alter source records.
- **Privacy (DPDP Act 2023):** Data minimisation enforced — the persona sees aggregates and explanations, not gratuitous raw PII. Minors (under-18) carry stricter handling; the existing minor consent gate and external-sharing consent gate apply to any sharing/export. No detrimental profiling.
- **Cross-role Restrictions:** Full-visibility scope must not be used to bypass other roles' ownership — the Academic Head cannot edit a faculty member's marks, override an HOD's department data, or view a student's data outside lawful educational purpose. Existence-hiding (`404-not-403`) and audit logging apply to all access.

---

## 9. Workflow Summary

```
TRIGGER        Academic Head opens dashboard / asks a question / requests a report or brief
   │
   ▼
AI             NL → governed semantic layer (read-only, tenant-scoped);
               summarize / analyze / compare / detect / prioritize / explain
   │
   ▼
ERP / SoT      Read-only query over canonical data + risk engine output
               (NEVER raw SQL · NEVER write-back · tenant ID from JWT only)
   │
   ▼
RESPONSE       Explainable, evidence-linked output (dashboard view / answer / draft / brief)
   │
   ▼
APPROVAL       Human review. Drafts (reports/notices) require human approval before any
               sharing/release. AI never auto-publishes or auto-acts.
   │
   ▼
COMPLETION     Action taken by the human in the ERP/outside the tool;
               every access + draft logged to the append-only audit trail.
```

The approval step is real, not decorative: in V1 nothing the AI produces takes effect until a human acts on it.

---

## 10. Out of Scope — what Academic Head AI must NEVER do

- **Never write back to the ERP / System of Record.** No edits, no deletes, no autonomous actions. (V1 platform non-negotiable.)
- **Never generate raw SQL** or query outside the governed semantic layer.
- **Never free-generate numbers, facts, or strategy** the data cannot support — "I can't answer that from the data" instead.
- **Never produce a black-box composite score** — all outputs decompose to evidence.
- **Never profile minors detrimentally** or access discipline/wellbeing data (deferred + DPDP-gated).

**Boundaries against other personas (no double-building):**

- **vs Director AI (future, above):** Academic Head stops at **one institution/campus**. Multi-campus / board / trust-level governance, cross-institution comparison, and board strategy belong to Director. Academic Head never aggregates across institutions.
- **vs HOD AI (below):** Academic Head does **cross-department comparison and institution-wide aggregates**. Single-department deep analytics, department-internal management, and department-scoped risk ownership belong to HOD. Academic Head never runs a department.
- **vs Faculty AI:** Academic Head never operates at the **cohort/section** level, never enters marks/attendance, never authors teaching content. Faculty owns that.
- **vs Student AI:** Academic Head never operates at the **individual self-service** level; students see only their own data via the (separately gated) student identity.
- **vs Placement Cell AI:** Academic Head does **not** own placement drives, employer CRM, eligibility decisions, or external placement sharing. The placement external-sharing consent surface is Placement Cell's.
- **vs IQAC:** Accreditation **authoring/evidence ownership** is IQAC's; Academic Head consumes readiness views only (and not until accreditation is built in V2).
- **vs Registrar:** Statutory MIS and operational record management stay with Registrar; Academic Head's reporting is academic-leadership reporting, not statutory returns.

---

## 11. Future Features

### Version 1 (this freeze — buildable on wired data now)
- Institutional Performance Dashboard
- Institution-wide Student Success Overview
- Department Performance Analytics (cross-department comparison)
- Institutional Health Indicators
- Attendance & Academic Intelligence
- AI Decision Support Assistant (grounded analytics, tightened)
- Institutional Reports Generator
- Institutional Risk & Alert Center
- AI Chat Assistant
- Daily Executive Brief
- *(Conditional)* AI Notice & Circular Generator — ships in V1 only if generative-content sign-off lands; otherwise V2.

### Version 2 (data and/or governance gated)
- AI Notice & Circular Generator (if sign-off slips) + Meeting Briefs & Action Items Generator (content suite)
- Faculty Performance Dashboard (after faculty data wiring + HR/privacy/ethics sign-off)
- Accreditation (NAAC/NBA/NIRF) Assistant (after accreditation data model; co-owned with IQAC)
- Budget & Resource Overview (after financial data ingestion)
- Student Discipline & Wellbeing Monitor (after data + DPDP detrimental-profiling legal review)
- Risk trend-over-time charting (once assessment history accumulates)

### Version 3 (new entities + lower priority)
- Campus Events & Calendar Intelligence (needs events/calendar entity)
- Strategic Goal Tracking Dashboard (needs goals/OKR entity)
- Predictive (ML) institutional modelling (rules-first principle; ML later)
- Cross-period institutional benchmarking

---

## 12. Final Feature Freeze — Official Version 1 List

> This is the official V1 list for engineering handoff. No features are added after the freeze. Renamed/deferred items are documented in Section 0 with reasoning.

| Feature | Purpose | Priority | Version | Owner | Dependencies | Status |
|---|---|---|---|---|---|---|
| Institutional Performance Dashboard | Single institution-wide health view | P0 | V1 | Academic Head | Success Engine, `/risk/summary`(+by-dept) | ✅ Frozen |
| Institution-wide Student Success Overview | Institution-level at-risk aggregate | P0 | V1 | Academic Head | Student Success Engine, `/risk` surfaces | ✅ Frozen |
| Department Performance Analytics (cross-dept) | Compare departments fairly | P1 | V1 | Academic Head | `/risk/summary/by-department` | ✅ Frozen |
| Institutional Health Indicators | Decomposed, explainable health panel | P1 | V1 | Academic Head | Success Engine aggregates | ✅ Frozen (renamed) |
| Attendance & Academic Intelligence | Institution-wide attendance/academic signals | P0 | V1 | Academic Head | Wired attendance + internal_marks | ✅ Frozen |
| AI Decision Support Assistant | Grounded, explained options | P1 | V1 | Academic Head | Semantic layer, Success Engine | ✅ Frozen (scope-tightened) |
| Institutional Reports Generator | One-click evidence-linked reports | P1 | V1 | Academic Head | Semantic layer, export | ✅ Frozen |
| Institutional Risk & Alert Center | Institution-wide risk/alert hub | P0 | V1 | Academic Head | Success Engine, alert surfaces | ✅ Frozen |
| AI Chat Assistant | NL Q&A over governed data | P0 | V1 | Academic Head | Semantic layer, NL→semantic, guardrails | ✅ Frozen |
| Daily Executive Brief | Morning prioritized summary | P0 | V1 | Academic Head | Aggregation + summarization | ✅ Frozen |
| AI Notice & Circular Generator | Draft notices/circulars | P2 | V1-conditional | Academic Head | **Generative-content sign-off** | ⏳ Gated |
| Faculty Performance Dashboard | Faculty effectiveness view | — | V2 | Academic Head | Faculty data wiring + HR/ethics sign-off | ⛔ Deferred (data+gov) |
| Student Discipline & Wellbeing Monitor | Discipline/wellbeing signals | — | V2 | Academic Head | Data source + **DPDP legal review** | ⛔ Deferred (data+DPDP) |
| Accreditation (NAAC/NBA/NIRF) Assistant | Accreditation readiness/drafting | — | V2 | IQAC (Academic Head consumes) | Accreditation data model | ⛔ Deferred (data) |
| Budget & Resource Overview | Budget/resource view | — | V2 | Academic Head | Financial data ingestion | ⛔ Deferred (data) |
| Meeting Briefs & Action Items Generator | Meeting briefs/actions | — | V2 | Academic Head | Meeting input source + content sign-off | ⛔ Deferred (data+gov) |
| Campus Events & Calendar Intelligence | Events/calendar intelligence | — | V3 | Academic Head | Events/calendar entity | ⛔ Deferred (data) |
| Strategic Goal Tracking Dashboard | Strategic goal/OKR tracking | — | V3 | Academic Head | Goals/OKR entity | ⛔ Deferred (data) |

**V1 confirmed: 10 features. V1-conditional: 1 (gated on sign-off). Deferred: 7 (data/governance-gated, with honest reasons).**

---

## 13. Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Product (CPO/PM) | | ☐ Approve ☐ Revise | |
| Engineering Lead | | ☐ Approve ☐ Revise | |
| Data/Platform | | ☐ Approve ☐ Revise | |
| DPDP / Legal | | ☐ Approve ☐ Revise | |
| Leadership (generative-content gate) | | ☐ Approve ☐ Defer | |

**Two decisions block parts of this freeze and need an explicit answer:**
1. **Role identity** (Section 0.1): persona on the principal-tier, or a new `academic_head` role value (locked-schema change)?
2. **Generative-content sign-off** (Section 0.5): does it cover Academic Head's Notice & Circular Generator for V1, or does that move to V2?


---

# Academic Head AI Assistant — Role Solution Design Document (RSDD)

**Product:** AI ERP Copilot — AI Intelligence Layer over College ERP
**System of Record:** Existing ERP (Fedena / ERPNext / MasterSoft / TCS iON) — unchanged
**System of Intelligence:** AI ERP Copilot (this product)
**Persona:** Academic Head AI Assistant
**Phase:** Phase 1 — Product Definition → engineering handoff reference
**AI posture (V1):** Read-only, advisory, explainable. AI suggests; humans act. No ERP write-back.
**Status:** RSDD — single source of truth for the Academic Head AI Assistant

> This RSDD builds on the existing backend foundation — authentication, multi-tenancy (Postgres RLS), the raw→staging→canonical ingestion pipeline, Student 360, audit logging, and the rules-based Student Success Engine with its `/risk/*` API and React dashboard. These are **reused, not redesigned**. It is consistent with the Academic Head Feature Freeze: 10 confirmed V1 features, 1 V1-conditional (gated on generative-content sign-off), 7 deferred (data/governance-gated).

---

# CHAPTER 1 — Foundations

## 1. Executive Summary

The Academic Head is the institution's senior academic leadership persona — Principal, Vice-Principal, or Dean (Academics) — accountable for the academic health of the **whole institution** across every department. Today that picture is assembled by hand from departmental spreadsheets, days late, with no consistent cross-department lens and no early warning of systemic risk.

The Academic Head AI Assistant is a **read-only, advisory copilot** that sits on top of the ERP. It unifies already-ingested institutional data into one trustworthy institution-wide view, aggregates the Student Success Engine's signals to the institutional level so systemic problems surface early, and answers natural-language questions over a **governed semantic layer** — never over raw SQL, never with free-generated numbers, always with the evidence behind every output.

Architecturally, this role consumes the existing grounded foundation (risk engine, Student 360, `/risk/*` reads) and introduces one net-new AI subsystem: a **governed semantic/metrics layer** plus an **LLM orchestration layer** for natural-language query, summarization, and (gated) draft generation. The deterministic engine already exists; the natural-language and generative capability does not, and is the principal new build for this persona.

The role's scope is bounded precisely: **above HOD** (institution-wide vs single-department), **below a future Director/Trust persona** (one institution vs multi-campus/board), and never overlapping Faculty, Student, Placement, IQAC, or Registrar ownership. Everything it produces is a view or a draft; nothing takes effect until a human acts.

**V1 delivers:** an Institutional Performance Dashboard, institution-wide student-success and risk aggregation, cross-department comparison, decomposed health indicators, attendance/academic intelligence, a grounded decision-support assistant, an institutional reports generator, a natural-language chat assistant, and a daily executive brief. A notice/circular generator is conditional on a generative-content governance decision.

## 2. Role Definition

| Attribute | Definition |
|---|---|
| **Role name** | Academic Head AI Assistant |
| **Maps to (humans)** | Principal / Vice-Principal / Dean (Academics) |
| **Scope** | One institution (tenant), all departments / programmes / students |
| **Visibility tier** | Privileged — full tenant-wide read (inherited from the existing scoping resolver) |
| **Posture** | Read-only, advisory, explainable; drafts allowed, no ERP write-back |
| **Sits above** | HOD (department), Faculty (cohort), Student (self) |
| **Sits below** | Director / Trust (multi-campus / board) — *future persona* |
| **Identity decision** | Provision on the existing principal-class tier (recommended) **or** mint a new `academic_head` role value (locked-schema change — governance gate). See §17. |

The Academic Head **consumes institution-wide aggregates and explanations**. It does not own source records, does not manage any single department, and does not enter or edit operational data.

## 3. User Persona

**Name:** Dr. Anjali Rao — Principal / Dean (Academics)
**Technical comfort:** Low-to-moderate. Expects to ask questions in plain English, not build queries.
**Daily reality:** Pulled between accreditation prep, leadership meetings, parent/board escalations, and academic governance. Time-poor; attention is the scarce resource.

| | |
|---|---|
| **Goals** | Know institutional academic health at a glance; catch systemic risk early; compare departments fairly; cut reporting time; answer board/parent questions fast. |
| **Frustrations** | MIS arrives late and inconsistent; no single source of truth; risk surfaces only after it's a crisis; reports are manual; can't self-serve answers. |
| **Cadence** | Daily brief in the morning; dashboard through the day; reports weekly/monthly; ad-hoc NL questions anytime. |
| **Trust needs** | Will not act on a number she can't trace. Every flag and answer must show its evidence. |
| **Must never** | Edit ERP data, override HOD/Faculty ownership, see data outside academic remit, or act on AI output without review. |

## 4. Business Goals

1. **Institution-wide visibility** — one trustworthy academic-health picture without manual compilation.
2. **Earlier systemic intervention** — aggregate risk to the institutional level to catch problems before they escalate.
3. **Fair resource allocation** — consistent cross-department comparison for attention and resourcing.
4. **Reporting efficiency** — turn recurring reports and the daily brief into one-click, evidence-linked outputs.
5. **Leadership self-service** — natural-language answers for a non-technical leader, safely scoped and explainable.
6. **Defensible decisions** — grounded options with evidence; the human decides and acts.
7. **Adoption** — a daily-habit copilot (the brief) that makes the underlying ERP investment finally usable.

## 5. Current Problems

- **Fragmented data:** academic reality lives across departmental sheets and ERP modules; no unified institutional view.
- **Latency:** MIS is compiled manually and arrives days late — leadership reacts instead of anticipating.
- **No cross-department lens:** comparing departments fairly is ad-hoc and inconsistent.
- **Late risk detection:** systemic attendance/academic decline is seen only after it becomes a crisis; risk today is surfaced per-department, not institution-wide.
- **Manual reporting burden:** recurring reports consume senior time.
- **No self-service:** a non-technical leader cannot query institutional data without intermediaries.
- **Trust gap with analytics:** existing dashboards present numbers without evidence; leaders won't act on black boxes.

## 6. Dashboard Design

The Academic Head's home is the **Institutional Performance Dashboard** — the single landing surface answering "where does the institution stand right now?" It extends the existing institution-overview dashboard (`DashboardPage`, bound to `/risk/summary` and `/risk/summary/by-department`) to the leadership persona.

**Design principles (carried from the platform):**
- Every value traces to a real API field — nothing invented for visual completeness.
- No black-box composite score — health is shown as **decomposed, explainable indicators**.
- Honest empty/stale/error states — trends render as a labelled placeholder until history exists; the risk service failing shows a retry state, not fake data.
- Colour-vision-safe tier treatment (shape + colour), reused from the existing design tokens.
- The frontend is **never** the security boundary — role/tenant scope is enforced server-side; the UI only reflects permission.

**V1 layout (built on wired data):**
1. **Institutional Health Indicators** (top) — decomposed status tiles: students assessed; high/watch/low counts; attendance health; academic health; fee health. Each tile drills to its evidence.
2. **Risk distribution bar** — institution-wide tier split.
3. **Cross-department comparison** — departments ranked by high-risk share, with the "Unassigned/NO DEPARTMENT" bucket handled honestly.
4. **Highest-risk-now** — top-N students/cohorts with findings (bound to `/risk/students?tier=high`).
5. **Risk trend over time** — labelled placeholder ("Trend builds as risk data accumulates") until assessment history accumulates; never faked.
6. **Brief + Chat entry points** — Daily Executive Brief and AI Chat Assistant reachable from the dashboard chrome.

Detailed widget specs are in Chapter 3 (§10).

---

# CHAPTER 2 — Complete Feature Catalogue

> Buildability tags carried from the Feature Freeze: **V1-ready** · **V1-conditional** (governance-gated) · **V2 (data-gated)** · **V2 (data+governance)** · **V2 (data+DPDP)** · **V3**.
> Every feature is read-only/advisory in V1. "Drafts" mean human-reviewed artifacts that never auto-publish and never write to the ERP.

## 2.1 Institutional Performance Dashboard — *V1-ready*
- **Purpose:** Single institution-wide academic-health landing view.
- **User Problem:** Leadership stitches this together manually, days late.
- **Business Value:** Faster, evidence-based leadership attention; visible ROI on the ERP.
- **Executive Value:** "Where does my institution stand right now?" in one screen.
- **Inputs:** Canonical students/attendance/internal_marks/fees; current risk assessments.
- **Outputs:** KPI tiles, risk distribution, department breakdown, top-risk list.
- **Expected Behaviour:** Renders visible (tenant-wide) data only; honest empty/stale/error states.
- **AI Behaviour:** Low — aggregation + plain-language narration of what the numbers show.
- **User Workflow:** Open app → land on dashboard → scan indicators → drill into evidence.
- **Required ERP Data:** Wired canonical entities + risk engine output.
- **Permissions:** View, View Analytics, Export.
- **Dependencies:** Student Success Engine; `/risk/summary`, `/risk/summary/by-department`, `/risk/students`.
- **Risks:** Thin pilot data makes tiles look empty — mitigated by honest empty states.
- **Future Improvements:** Trend charting once history exists; configurable tile sets.

## 2.2 Institution-wide Student Success Overview *(renamed from "Student Success Analytics")* — *V1-ready*
- **Purpose:** Institution-level aggregate of the Student Success Engine's at-risk picture.
- **User Problem:** No single place shows systemic student risk above the department line.
- **Business Value:** Earlier institutional intervention; outcome data for the value story.
- **Executive Value:** "Which cohorts/departments are systemically at risk, and why?"
- **Inputs:** Current risk assessments, findings (with evidence), department links.
- **Outputs:** Aggregated risk by tier/type/department with drill-down to explanations.
- **Expected Behaviour:** Every flag decomposes to findings/evidence; no opaque scores.
- **AI Behaviour:** Low–moderate — summarize and call out patterns over engine output.
- **User Workflow:** Dashboard → Success Overview → filter by tier/type/department → drill to evidence.
- **Required ERP Data:** Risk assessments/findings; student→programme→department links.
- **Permissions:** View, View Analytics, Export, Trigger AI (summarize).
- **Dependencies:** Student Success Engine; `/risk` surfaces.
- **Risks:** Confusion with engine ownership — mitigated by the boundary map (aggregate only).
- **Future Improvements:** Additional risk types as new signals are wired.
- **Boundary:** Aggregate only. Single-department = HOD; per-student = Faculty/Student.

## 2.3 Faculty Performance Dashboard — *V2 (data + governance)*
- **Purpose:** Institution-wide faculty-effectiveness view.
- **User Problem / Business Value / Executive Value:** Real and high — but unbuildable now.
- **Inputs:** Teaching load, feedback, outcomes — **none in the canonical model.**
- **Required ERP Data:** `faculty` entity (currently DDL-only, unwired) + new performance data.
- **AI Behaviour:** Deferred.
- **Permissions:** N/A in V1.
- **Dependencies:** Faculty data ingestion + HR/privacy/ethics sign-off (same gate as the Faculty Module).
- **Risks:** Building now means inventing data; HR-sensitive without governance.
- **Future Improvements:** Revisit after data wiring + governance clears.

## 2.4 Department Performance Analytics *(scoped to cross-department comparison)* — *V1-ready*
- **Purpose:** Compare departments side-by-side on academic-health metrics.
- **User Problem:** No fair, consistent cross-department comparison today.
- **Business Value:** Better attention/resource allocation.
- **Executive Value:** "Which departments need help, relative to the rest?"
- **Inputs:** Department-grouped risk/attendance/academic aggregates.
- **Outputs:** Ranked/comparative department views with high-share %.
- **Expected Behaviour:** Consistent metric definitions across departments; "Unassigned" handled.
- **AI Behaviour:** Low — comparison + explanation.
- **User Workflow:** Dashboard → Department comparison → sort/compare → drill into a department's drivers.
- **Required ERP Data:** `/risk/summary/by-department`; canonical department links.
- **Permissions:** View, View Analytics, Export.
- **Dependencies:** Student Success Engine; by-department aggregate.
- **Risks:** Misread as ranking faculty/HODs — framed as academic-health comparison only.
- **Future Improvements:** More comparison dimensions as data is wired.
- **Boundary:** Cross-department compare only. Deep single-department = HOD AI.

## 2.5 Institutional Health Indicators *(renamed from "AI Institutional Health Score")* — *V1-ready*
- **Purpose:** Decomposed, explainable panel of institutional academic-health indicators.
- **User Problem:** Leaders want a quick health read without a misleading single number.
- **Business Value:** Fast orientation that survives scrutiny — every indicator traceable.
- **Executive Value:** "Is the institution healthy, and on what basis?"
- **Inputs:** Aggregated risk distribution, attendance health, academic health, fee health.
- **Outputs:** Named indicators with status + the evidence behind each.
- **Expected Behaviour:** Never collapses to one opaque score (platform principle).
- **AI Behaviour:** Low — composes and narrates indicators; invents nothing.
- **User Workflow:** Dashboard top row → read indicators → expand any for evidence.
- **Required ERP Data:** Risk/attendance/academic/fee aggregates.
- **Permissions:** View, View Analytics, Export.
- **Dependencies:** Student Success Engine aggregates.
- **Risks:** Pressure to "just show one number" — resisted by design.
- **Future Improvements:** Tenant-configurable, still-explainable indicator weighting.

## 2.6 Attendance & Academic Intelligence — *V1-ready*
- **Purpose:** Institution-wide attendance and academic-performance intelligence.
- **User Problem:** Attendance/academic problems seen late and per-department.
- **Business Value:** Earlier systemic detection.
- **Executive Value:** "Where is attendance slipping or academics declining, institution-wide?"
- **Inputs:** Canonical attendance, internal_marks; derived risk signals.
- **Outputs:** Institution-wide summaries, decline flags with evidence.
- **Expected Behaviour:** Decline flags cite their evidence (recent vs prior windows).
- **AI Behaviour:** Low–moderate — summarize, detect decline, explain.
- **User Workflow:** Dashboard → Attendance/Academic → view hotspots → drill to evidence.
- **Required ERP Data:** Wired attendance + internal_marks; engine signals.
- **Permissions:** View, View Analytics, Export, Trigger AI.
- **Dependencies:** Student Success Engine signal layer.
- **Risks:** `semester_results` is DDL-only/unwired — result-level depth limited until wired.
- **Future Improvements:** Result-level analytics once `semester_results` is wired.

## 2.7 Student Discipline & Wellbeing Monitor — *V2 (data + DPDP)*
- **Purpose:** Institution-wide discipline/wellbeing monitoring.
- **User Problem / Value:** Real, but unbuildable and legally sensitive now.
- **Inputs:** Discipline/wellbeing data — **absent from the canonical model.**
- **Required ERP Data:** New discipline/wellbeing sources.
- **AI Behaviour:** Deferred.
- **Permissions:** N/A in V1.
- **Dependencies:** New data + **DPDP detrimental-profiling legal review** (many students are minors).
- **Risks:** Profiling minors' behaviour is a hard DPDP gate — no design before lawful-basis review.
- **Future Improvements:** Revisit only after legal review defines lawful, non-detrimental scope.

## 2.8 AI Decision Support Assistant *(scope-tightened to grounded analytics)* — *V1-ready*
- **Purpose:** Surface and explain grounded options to support leadership decisions.
- **User Problem:** Decisions made without a fast, evidence-linked options view.
- **Business Value:** Better-informed, defensible decisions.
- **Executive Value:** "Given the data, what are my options and the evidence for each?"
- **Inputs:** Semantic-layer metrics only.
- **Outputs:** Ranked, explained options strictly derived from existing data.
- **Expected Behaviour:** "I can't answer that from the data" fallback enforced; advisory only.
- **AI Behaviour:** Moderate — analyze, prioritize, explain. Never free-generates numbers/strategy.
- **User Workflow:** Ask a decision question → receive options + evidence → human decides/acts.
- **Required ERP Data:** Whatever the semantic layer exposes (risk, attendance, academic, fee).
- **Permissions:** View Analytics, Trigger AI.
- **Dependencies:** Governed semantic layer; LLM orchestration; Student Success Engine.
- **Risks:** Scope creep into ungrounded advice — bounded by the semantic layer + fallback.
- **Future Improvements:** Outcome-aware suggestions once intervention outcomes accumulate.

## 2.9 Institutional Reports Generator — *V1-ready*
- **Purpose:** One-click recurring institutional reports over the governed semantic layer.
- **User Problem:** Manual MIS compilation is slow and error-prone.
- **Business Value:** Major time savings; consistency.
- **Executive Value:** "Generate the monthly academic report" → evidence-linked draft.
- **Inputs:** Semantic-layer metrics; report template/parameters.
- **Outputs:** Structured report drafts with linked evidence; export.
- **Expected Behaviour:** Draft only; numbers come from the semantic layer, never generated.
- **AI Behaviour:** Moderate — assemble + narrate from real metrics only.
- **User Workflow:** Choose report → set scope/period → generate draft → review/edit → export/share.
- **Required ERP Data:** Semantic-layer metrics over wired canonical data.
- **Permissions:** View, Create (draft), Export, Share (consent-aware), Trigger AI.
- **Dependencies:** Semantic layer; LLM orchestration; draft store; export service.
- **Risks:** Confusion with statutory/accreditation reporting — excluded by boundary.
- **Future Improvements:** Scheduled reports; saved templates.
- **Boundary:** General institutional reporting only. Accreditation = V2/IQAC; statutory MIS = Registrar.

## 2.10 AI Notice & Circular Generator — *V1-conditional (generative-content sign-off)*
- **Purpose:** Draft institutional notices/circulars.
- **User Problem:** Repetitive administrative writing.
- **Business Value / Executive Value:** Time savings; consistent tone.
- **Inputs:** Prompt + relevant institutional facts from the semantic layer.
- **Outputs:** Draft notice/circular for human review and release.
- **Expected Behaviour:** Always a draft; no factual claims beyond grounded data; human approval mandatory.
- **AI Behaviour:** High (generative), grounded; never auto-publishes.
- **User Workflow:** Prompt → draft → review/edit → human approves → release outside the tool.
- **Required ERP Data:** Semantic-layer facts where the notice references data.
- **Permissions:** Create (draft), Edit, Share (after approval), Trigger AI.
- **Dependencies:** LLM orchestration; draft store; **leadership generative-content sign-off** (same gate as the Faculty content suite).
- **Risks:** Without the gate, ships outside agreed V1 content scope — hence conditional.
- **Future Improvements:** Templates, approval routing.
- **If sign-off denied:** moves to V2 with the content suite.

## 2.11 Meeting Briefs & Action Items Generator — *V2 (data + governance)*
- **Purpose:** Generate meeting briefs and action items.
- **Inputs:** Meeting agenda/transcript source — **none exists.**
- **Required ERP Data:** A meeting-input source (new).
- **AI Behaviour:** Deferred (generative).
- **Permissions:** N/A in V1.
- **Dependencies:** Meeting-input source + generative-content sign-off.
- **Risks:** Blocked on both an input source and the content gate.
- **Future Improvements:** Revisit with the content suite once an input source exists.

## 2.12 Accreditation (NAAC/NBA/NIRF) Assistant — *V2 (data-gated)*
- **Purpose:** Assist accreditation drafting and readiness.
- **User Problem:** High-value, well-validated thesis — but explicitly a later phase.
- **Inputs:** Accreditation data structures + evidence mapping — **not yet built.**
- **Required ERP Data:** Accreditation data model (new); evidence linkage.
- **AI Behaviour:** Deferred.
- **Permissions:** N/A in V1.
- **Dependencies:** Accreditation data model; **IQAC ownership** of authoring.
- **Risks:** Double-building against IQAC — avoided by boundary.
- **Future Improvements:** Academic Head consumes readiness views; IQAC owns authoring.

## 2.13 Budget & Resource Overview — *V2 (data-gated)*
- **Purpose:** Institution-wide budget/resource view.
- **Inputs:** Budget/expense/resource data — **only student fees exist in the model.**
- **Required ERP Data:** Financial data ingestion (deliberately out of v1 financial scope).
- **AI Behaviour:** Deferred.
- **Permissions:** N/A in V1.
- **Dependencies:** Financial data ingestion.
- **Risks:** Fees ≠ budget; building now means inventing data.
- **Future Improvements:** Revisit after financial ingestion is scoped.

## 2.14 Campus Events & Calendar Intelligence — *V3*
- **Purpose:** Institutional events/calendar intelligence.
- **Inputs:** Events/calendar entity — **does not exist.**
- **Required ERP Data:** New events/calendar entity + ingestion.
- **AI Behaviour:** Deferred.
- **Dependencies:** New entity.
- **Risks:** No source; lowest-priority leadership need.
- **Future Improvements:** Calendar-aware briefs once an events entity exists.

## 2.15 Institutional Risk & Alert Center — *V1-ready*
- **Purpose:** Institution-wide risk and alert aggregation hub.
- **User Problem:** Risk and alerts fragmented below the institutional line.
- **Business Value:** One place leadership watches systemic risk.
- **Executive Value:** "What needs my attention across the institution?"
- **Inputs:** Risk assessments, findings, existing alert records.
- **Outputs:** Aggregated, prioritized, explained alerts.
- **Expected Behaviour:** Advisory; every alert decomposes to evidence.
- **AI Behaviour:** Moderate — detect, prioritize, alert, explain.
- **User Workflow:** Open Alert Center → triage by priority → drill to evidence → note for action.
- **Required ERP Data:** Risk engine output; `/risk/alerts`.
- **Permissions:** View, View Analytics, Trigger AI.
- **Dependencies:** Student Success Engine; existing alert surfaces.
- **Risks:** Bounded to wired risk types; advisory only.
- **Future Improvements:** Configurable institutional alert rules.
- **Boundary:** Institution-wide aggregation; recipient-specific routing stays with the engine.

## 2.16 Strategic Goal Tracking Dashboard — *V3*
- **Purpose:** Track institutional strategic goals/OKRs.
- **Inputs:** Goals/OKR entity — **does not exist.**
- **Required ERP Data:** New goals/OKR entity.
- **AI Behaviour:** Deferred.
- **Dependencies:** New entity + governance for goal definition.
- **Risks:** No source; conceptual until a goals model exists.
- **Future Improvements:** Goal-vs-actual once goals are modelled.

## 2.17 AI Chat Assistant — *V1-ready (core wedge)*
- **Purpose:** Natural-language Q&A over institutional data.
- **User Problem:** Non-technical leaders can't self-serve answers.
- **Business Value:** The platform's headline differentiator at the leadership level.
- **Executive Value:** "Ask your institution in English."
- **Inputs:** NL question; governed semantic layer.
- **Outputs:** Explainable, tenant-scoped, read-only answers with evidence.
- **Expected Behaviour:** No raw SQL; no free-generated numbers; "can't answer from the data" fallback.
- **AI Behaviour:** High — NL→semantic translation constrained to defined metrics; isolation guardrails.
- **User Workflow:** Type a question → see answer + evidence → optionally export/follow-up.
- **Required ERP Data:** Whatever the semantic layer exposes.
- **Permissions:** View Analytics, Trigger AI, Export (answers).
- **Dependencies:** Governed semantic layer (**new**); LLM orchestration (**new**); guardrails.
- **Risks:** Hallucination — mitigated by semantic-layer-only execution + fallback; tenant leak — mitigated by server-injected tenant scope (never from model output).
- **Future Improvements:** Saved/shareable queries; richer metric coverage.
- **Boundary:** Institution-wide read scope; same capability role-scoped narrower for HOD/Faculty/Student.

## 2.18 Daily Executive Brief — *V1-ready*
- **Purpose:** Morning summary of what changed and what needs attention.
- **User Problem:** Leaders start the day blind to overnight changes.
- **Business Value:** Daily-habit value; the digest promise, daily.
- **Executive Value:** "Tell me what matters today."
- **Inputs:** Latest risk/attendance/academic aggregates + deltas.
- **Outputs:** Short, prioritized, evidence-linked brief.
- **Expected Behaviour:** Concise; leads with priorities; every item links to evidence.
- **AI Behaviour:** Moderate — summarize, prioritize, alert.
- **User Workflow:** Open app in the morning → read brief → tap any item to drill in.
- **Required ERP Data:** Aggregation surfaces; engine output.
- **Permissions:** View, Trigger AI, Export.
- **Dependencies:** Aggregation; LLM orchestration (summarization).
- **Risks:** Deltas limited until assessment history accumulates.
- **Future Improvements:** Personalized priorities; scheduled delivery (consent-aware).

### Feature catalogue summary
**V1-ready (10):** 2.1, 2.2, 2.4, 2.5, 2.6, 2.8, 2.9, 2.15, 2.17, 2.18.
**V1-conditional (1):** 2.10 (generative-content sign-off).
**V2 (5):** 2.3, 2.7, 2.11, 2.12, 2.13. **V3 (2):** 2.14, 2.16.

---

# CHAPTER 3 — Experience & Requirements

## 8. User Journeys

**J1 — Morning orientation (Daily Brief → Dashboard).** Dr. Rao opens the app. The Daily Executive Brief leads with the 2–3 things that changed or need attention overnight, each with a one-tap drill-in. She taps a department whose high-risk share jumped, lands on the cross-department comparison, then drills to the evidence behind the spike. *Outcome: oriented in under two minutes, with evidence.*

**J2 — Ad-hoc question (Chat).** Mid-meeting, a board member asks how first-year attendance is trending. She types the question into the AI Chat Assistant; it returns an institution-wide answer with the evidence and a "this is from attendance data through <date>" note. If the data can't support the question, it says so rather than guessing. *Outcome: a defensible answer in seconds.*

**J3 — Systemic risk triage (Risk & Alert Center).** A prioritized alert flags an institution-wide academic-decline pattern. She opens the Alert Center, sees the contributing departments and the findings behind the flag, and notes it for the next academic council. She cannot and does not edit any record. *Outcome: early, evidence-based escalation.*

**J4 — Monthly report (Reports Generator).** She selects the monthly academic report, sets scope and period, generates a draft assembled from the semantic layer, reviews and lightly edits the narration, and exports it. *Outcome: a report in minutes instead of hours; numbers traceable.*

**J5 — Decision support.** Facing a resourcing choice, she asks the Decision Support Assistant for options. It returns ranked, evidence-linked options strictly from existing data, with an explicit "can't answer from the data" where it lacks support. *Outcome: a grounded options view; she decides.*

## 9. Conversation Flows

**Design rules for all AI conversation:** read-only; tenant scope injected server-side from the JWT (never from model output); answers restricted to semantic-layer-backed metrics; every answer carries evidence + an "as-of" data date; explicit fallback when unsupported; no raw SQL ever surfaced or executed.

**Flow A — Answerable institutional question**
```
User:  "How is attendance across the institution this term?"
AI →   [classify intent → map to semantic metric: attendance health, tenant-scoped]
AI:    "Institution-wide attendance is <X>% across <N> assessed students.
        <M> students are flagged for low attendance, concentrated in <dept>.
        Evidence: attendance data through <date>. [View breakdown]"
```

**Flow B — Unsupported / out-of-data question**
```
User:  "What's our faculty teaching-quality score?"
AI:    "I can't answer that from the data. Faculty performance data isn't
        connected yet, so I'd be guessing. I can show student-success and
        attendance/academic health instead — want that?"
```

**Flow C — Out-of-scope (another persona's ownership)**
```
User:  "Change this student's attendance record."
AI:    "I can't edit records — I'm read-only and advisory. The ERP stays the
        source of truth. I can show you the record and its history."
```

**Flow D — Generative draft (gated feature)**
```
User:  "Draft a circular about the revised exam schedule."
AI:    [if generative-content gate ON] "Here's a draft for your review.
        I've left the dates as placeholders since I don't have a schedule
        source — please confirm before release. [Edit] [Approve to release]"
        [if gate OFF] "Notice drafting isn't enabled in this version yet."
```

## 10. Dashboard Widgets

| Widget | Bound to | Behaviour |
|---|---|---|
| **Institutional Health Indicators** | risk/attendance/academic/fee aggregates | Decomposed tiles; each expands to evidence. No single score. |
| **Risk distribution bar** | `/risk/summary` | Tenant-wide tier split; colour+shape safe. |
| **KPI tiles** | `/risk/summary` | Assessed count, high/watch/low; "% of assessed" subtitles. |
| **Cross-department comparison** | `/risk/summary/by-department` | Sorted by high-risk share; "Unassigned" bucket; high-share % client-side. |
| **Highest risk now** | `/risk/students?tier=high` | Top-N with findings; links to Student 360 (read-only). |
| **Risk trend over time** | — none yet — | Labelled placeholder until history accrues; never faked. |
| **Alert Center panel** | `/risk/alerts` (+ aggregation) | Prioritized, explained alerts. |
| **Daily Brief card** | aggregation + summarization | Top priorities with drill-ins. |
| **Chat entry** | semantic layer + LLM | NL Q&A with evidence. |

All widgets show explicit loading / empty / stale / error states; none invent data to fill space.

## 11. Navigation

Primary left-nav for the Academic Head persona (privileged, institution-wide):
- **Dashboard** (Institutional Performance) — default landing.
- **Daily Brief**.
- **Student Success** (institution-wide overview) → drill to Student 360 (read-only).
- **Departments** (cross-department comparison).
- **Attendance & Academic**.
- **Risk & Alerts**.
- **Reports**.
- **Chat** (persistent entry from chrome).
- **Notices** (only if generative-content gate is ON).

Nav gating is **UX-only** (mirrors the existing `RequirePrivileged` pattern) — it hides items the persona shouldn't see, but the **server remains the only security boundary**. Deferred features (Faculty Performance, Discipline/Wellbeing, Accreditation, Budget, Events, Goals) do not appear in V1 nav.

## 12. Functional Requirements

- **FR1** The system SHALL present an institution-wide dashboard scoped to the authenticated tenant.
- **FR2** The system SHALL aggregate Student Success Engine output to institutional and per-department levels.
- **FR3** The system SHALL decompose every health indicator and flag into its underlying evidence.
- **FR4** The system SHALL answer natural-language questions only via the governed semantic layer, never raw SQL.
- **FR5** The system SHALL return an explicit "cannot answer from the data" response when a question is unsupported.
- **FR6** The system SHALL generate report/notice drafts (notice gated) that are human-reviewed and never auto-published.
- **FR7** The system SHALL NOT write to the ERP/System of Record under any circumstance in V1.
- **FR8** The system SHALL enforce role and tenant scope server-side regardless of frontend state.
- **FR9** The system SHALL inject tenant identity from the verified JWT only — never from model output, headers, or client input.
- **FR10** The system SHALL log every data access and draft action to the append-only audit trail.
- **FR11** The system SHALL apply DPDP data-minimisation and minor-handling/consent gates to any sharing or export.
- **FR12** The system SHALL render honest empty/stale/error states and never fabricate data (e.g., trends) to fill UI.
- **FR13** The system SHALL produce a Daily Executive Brief summarizing changes and priorities with evidence links.

## 13. Non-Functional Requirements

- **Security & isolation:** RLS on all tenant tables; explicit tenant filter in every query (defense in depth); role scoping server-side; existence-hiding (404-not-403) on out-of-scope reads.
- **Privacy:** DPDP-by-design — minimisation, purpose limitation, minor consent gate, consent-gated external sharing, retention/audit.
- **Explainability:** every AI output carries evidence + an as-of data date; no black-box scores.
- **Performance:** institutional aggregates use bulk queries with a bounded query count independent of student volume (no N+1); enforced by query-count tests.
- **Reliability:** graceful degradation — a failing risk service shows a retry state, not stale/fake data.
- **Accessibility:** colour-vision-safe tiers (shape+colour), labelled controls, focus-visible states (reuse existing tokens).
- **Auditability & determinism:** deterministic risk inputs unchanged; AI narration is additive, never a source of numbers.
- **Latency targets (advisory):** dashboard reads sub-second on seeded data; chat answers within a few seconds; report drafts within tens of seconds.
- **Multi-tenancy:** every view provably scoped to one tenant; tenant-aware caching.

---

# CHAPTER 4 — Architecture & Security

## 14. High-Level AI Architecture

**Layering (what is reused vs net-new):**

```
Academic Head Copilot (React) — NEW persona frontend
        │  (read-only views · chat · drafts)
        ▼
AI ORCHESTRATION LAYER — NEW
  • NL → intent → governed semantic metric (no raw SQL)
  • summarization (brief, dashboard narration)
  • grounded generation (reports; notices if gated)
  • guardrails: tenant scope (server-injected), "can't answer from data"
        │
        ▼
GOVERNED SEMANTIC / METRICS LAYER — NEW
  • defined metrics/dimensions/joins · read-only · tenant-scoped views
        │
        ▼
GROUNDED FOUNDATION — REUSED (do not redesign)
  • Student Success Engine (rules; attendance/academic/fee risk)
  • /risk/* read APIs · Student 360 · institutional aggregates
  • Ingestion (raw→staging→canonical) · audit log
        │
        ▼
UNIFIED DATA LAYER — REUSED
  • Postgres + Row-Level Security · canonical entities · provenance
        │ ingestion/integrations
   ERP (System of Record) — unchanged
```

The deterministic engine already produces the numbers. The **net-new** parts are the semantic layer (so NL and generation are grounded and tenant-safe) and the orchestration layer (so the persona can ask, summarize, and draft). The frontend extends the existing institution-overview app to the leadership persona.

### Architecture decision A — How natural language reaches data
| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| LLM → raw SQL on canonical tables | Flexible | Hallucination, injection, tenant-leak risk; violates locked principle | ❌ Rejected |
| LLM → **governed semantic layer** (defined metrics, read-only, tenant-scoped) | Hallucination-bounded; auditable; tenant-safe; explainable | Needs metric modelling up front | ✅ **Recommended** |
| Pre-built dashboards only (no NL) | Simplest | Loses the headline differentiator | ⚠️ Insufficient |

**Recommendation:** governed semantic layer — it is the only approach consistent with the locked "no raw SQL / no free-generated numbers / provably tenant-scoped" principles.

### Architecture decision B — How generation stays grounded
| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| Free-form LLM generation | Fastest to ship | Invents numbers/facts | ❌ Rejected |
| **Templated + LLM narration over semantic-layer facts** | Numbers are real; narration is fluent; reviewable | Less "creative" | ✅ **Recommended** |
| Retrieval-augmented over evidence store | Good for evidence linkage | Heavier; overkill for V1 metrics | ⚠️ Later |

**Recommendation:** templated structure with LLM narration strictly over semantic-layer facts; numbers never originate in the model.

### Architecture decision C — Role identity (carried from the freeze)
Provision Academic Head on the existing **principal-class privileged tier** (no schema change) and differentiate at the copilot layer — recommended — versus minting a new `academic_head` role value (a locked Phase 0 constraint change requiring governance). **Recommendation: persona-on-tier for V1.**

## 15. Data Requirements

**Available now (wired through ingestion → reusable):** students, departments, programmes, courses, enrollment, attendance, internal_marks, fees; risk assessments, findings, interventions, alerts; provenance and audit on every canonical row.

**Net-new data constructs needed for this role:**
- **Semantic metric definitions** (institutional + per-department): attendance health, academic health, fee health, risk distribution, cross-department comparison metrics. (Definitions, not new source data.)
- **Draft store** for generated reports/notices (advisory artifacts; human-approved; audited).
- **Assessment history surface** to power trends later (point-in-time reconstruction over existing `computed_at`).

**Absent (blocks the deferred features, not V1):** faculty performance/HR data, discipline/wellbeing, budget/expense, accreditation structures, meeting/transcript input, events/calendar, goals/OKR. `faculty` and `semester_results` exist as DDL but are **unwired**.

**Data principles:** read-only consumption; minimisation (aggregates + evidence, not gratuitous PII); minor handling under DPDP; tenant scope via RLS on every read.

## 16. High-Level API Summary

> Contracts are out of scope here (per the prompt). This is the surface map: **reuse** existing endpoints; **add** thin institution-aggregate and AI endpoints following the established `/risk/*` role-scoping pattern.

**Reused (exist today):**
- `GET /risk/summary`, `GET /risk/summary/by-department` — dashboard tiles, distribution, cross-department.
- `GET /risk/students` (filterable) , `GET /risk/students/{id}` — at-risk lists + per-student detail (read-only drill-in).
- `GET /students/{id}` — Student 360 (read-only).
- `GET /risk/alerts`, `PATCH /risk/alerts/{id}/read` — alert center base.
- `auth/*` — JWT/refresh (no new auth surface).

**New (V1, follow existing role-scoping + RLS patterns):**
- Institution health-indicators aggregate (decomposed) — extends the summary pattern.
- Attendance/academic-intelligence aggregate — bulk, bounded query count.
- **AI query** endpoint — NL question → semantic metric → explainable answer (read-only).
- **Brief** endpoint — assembled daily summary.
- **Report/notice draft** endpoints — create/list/export drafts (notice gated); never publish.

**New (deferred with their features):** anything depending on faculty/discipline/budget/accreditation/events/goals data.

All new endpoints: tenant scope from JWT only; privileged-tier read; audited; no write-back to the ERP.

## 17. Security Considerations

- **Tenant isolation:** RLS (floor) + explicit tenant filter in every query (defense in depth); tenant id from verified JWT only — never from model output, headers, or client.
- **Role scoping:** server-side; privileged-tier full read; never trust the frontend's role gating.
- **Existence-hiding:** out-of-scope reads return 404, not 403 (reuse the established pattern).
- **AI-specific:** the LLM never sees cross-tenant data; the semantic layer executes read-only within the tenant context; prompts/answers are logged; the model cannot widen scope.
- **DPDP:** minimisation, purpose limitation, minor consent gate, **consent-gated external sharing** (relevant to report/notice sharing and export), retention/audit; no detrimental profiling (a hard gate on the deferred Discipline/Wellbeing feature).
- **Audit:** append-only logging of every access and draft action; actor attribution (the Phase-2 actor-attribution fix applies to any new audited writes such as draft creation).
- **No write-back:** the architecture has no path from the AI layer to the ERP/SoT in V1.

## 18. Error Handling

- **Service unavailable (risk/aggregate):** show a retry state; never render stale or fabricated numbers.
- **Empty data (new pilot):** honest empty states; trends show the labelled placeholder.
- **Unsupported NL question:** explicit "can't answer from the data" with a suggested in-scope alternative — never a guess.
- **Out-of-scope action (e.g., edit request):** refuse with a plain-language explanation of the read-only/advisory posture.
- **Partial aggregate failure:** degrade gracefully per widget (one panel erroring doesn't blank the dashboard).
- **Generation grounding failure:** if a draft can't be grounded in semantic-layer facts, it surfaces placeholders and flags them for human confirmation rather than inventing values.
- **Auth/expiry:** existing refresh-token flow; refresh failure routes to login (reuse frontend interceptor).

## 19. Edge Cases

- **Thin/no history:** trends and deltas limited — handled by placeholders and "as-of" dating.
- **"Unassigned" department:** students with no resolvable department appear in the explicit Unassigned bucket, never silently dropped.
- **Minor students (under 18):** stricter handling; sharing/export passes the consent gate; no detrimental profiling.
- **Conflicting source data:** the ingestion layer already records conflicts; aggregates reflect canonical values and the persona can see provenance, not silently averaged numbers.
- **Stale post-sign-out navigation:** reuse the fixed redirect behaviour (privileged login lands on dashboard, not a prior user's page).
- **Ambiguous NL question:** the assistant asks a clarifying question or maps to the nearest defined metric and states the assumption.
- **Generative gate OFF:** notice/meeting features are absent from nav and refuse gracefully if invoked.
- **Large institution:** aggregates must stay bounded-query (no N+1) regardless of student count.

---

# CHAPTER 5 — Delivery

## 20. Success Metrics

**Adoption & engagement**
- Daily Brief open rate (target: a habit — most working mornings).
- Weekly active leadership users; chat sessions per user per week.
- Dashboard drill-in rate (evidence views per session) — proxy for trust.

**Value delivered**
- Report generation time: hours → minutes (time saved per report).
- Time-to-detection of systemic risk vs the prior manual baseline (earlier is better).
- % of leadership questions answerable in-product without intermediaries.

**Trust & safety**
- AI answer grounding rate: % of answers backed by semantic-layer evidence (target ~100%).
- "Can't answer from the data" rate (healthy non-zero — proof it isn't guessing).
- Zero cross-tenant leaks; zero ERP write-back events; 100% of accesses audited.
- Hallucination incidents reported (target: zero ungrounded numbers).

**Quality**
- Aggregate query-count bounded regardless of student volume (no N+1).
- Empty/stale/error states correct in all data conditions (no fabricated data).

## 21. Testing Checklist

**Security & isolation**
- [ ] Privileged user sees whole tenant; faculty/student scoping unaffected by the new persona.
- [ ] Tenant A never sees tenant B in any new aggregate or AI answer.
- [ ] Tenant id is taken from JWT only; crafted headers/model output cannot widen scope.
- [ ] Out-of-scope reads return 404 (existence-hiding), not 403.
- [ ] No code path writes to the ERP/SoT.

**AI behaviour**
- [ ] NL answers come only from the semantic layer; no raw SQL executes.
- [ ] Unsupported questions return the explicit fallback, never a guess.
- [ ] Generated drafts contain no numbers absent from the semantic layer.
- [ ] Every answer/flag carries evidence + an as-of data date.
- [ ] Generative gate OFF → notice/meeting features absent and refuse gracefully.

**Data & aggregates**
- [ ] `summary` / `by-department` tier/type counts correct on seeded data.
- [ ] "Unassigned" department bucket grouped correctly.
- [ ] Health indicators decompose to correct evidence; never a single opaque score.
- [ ] Bounded query count regardless of student count (query-count test).

**UX & states**
- [ ] Loading/empty/stale/error states render correctly in all data conditions.
- [ ] Trend placeholder shows when no history; never fabricated.
- [ ] Nav gating hides deferred features; server still enforces scope.
- [ ] Colour-vision-safe tiers (shape+colour); labelled controls; focus-visible.

**Privacy**
- [ ] Minor handling + consent gate applied to sharing/export.
- [ ] Data-minimisation: aggregates/evidence, not gratuitous raw PII.
- [ ] Every access and draft action audited with correct actor attribution.

## 22. Implementation Roadmap

> Sequenced to reuse the grounded foundation first and add the AI subsystem incrementally. One-commit-per-change discipline; tests as you build.

**Stage 0 — Pre-work (decisions, not code)**
- Resolve role identity (persona-on-tier vs new role value).
- Resolve generative-content sign-off (decides whether Notice Generator is V1 or V2).

**Stage 1 — Institutional read foundation (lowest risk, highest certainty)**
- Academic Head persona frontend shell; extend the institution-overview dashboard.
- Health Indicators (decomposed) + cross-department comparison + attendance/academic intelligence + Risk & Alert Center, all on reused/extended `/risk/*` aggregates.
- Honest states throughout. *Delivers most of the dashboard value with no new AI risk.*

**Stage 2 — Governed semantic layer**
- Define institutional + per-department metrics/dimensions over canonical data; read-only, tenant-scoped. *Foundation for all NL/generation.*

**Stage 3 — AI orchestration (grounded)**
- AI Chat Assistant (NL→semantic, guardrails, fallback).
- Daily Executive Brief (summarization).
- AI Decision Support (grounded options). *The headline differentiators, now hallucination-bounded.*

**Stage 4 — Grounded generation**
- Institutional Reports Generator (templated + narration; draft store).
- (If gate ON) AI Notice & Circular Generator.

**Stage 5 — Hardening**
- Query-count/perf tests; full isolation/AI-safety suite; audit verification; accessibility pass.

**Deferred (post-V1, data/governance-gated):** Faculty Performance, Discipline/Wellbeing (DPDP review), Accreditation (with IQAC), Budget, Meeting Briefs, then Events and Strategic Goals; trend charting once history accrues.

## 23. Future Scope

- **Risk trend-over-time:** point-in-time reconstruction over assessment history once it accumulates.
- **Predictive (ML) modelling:** rules-first today; ML institutional forecasting later, kept explainable.
- **Faculty Module:** after faculty-data wiring + HR/privacy/ethics governance.
- **Accreditation suite:** NAAC/NBA/NIRF readiness + drafting, co-owned with IQAC, on a new accreditation data model.
- **Financial depth:** budget/resource overview after financial ingestion is scoped.
- **Wellbeing (lawful):** only after a DPDP detrimental-profiling legal review defines lawful, non-detrimental scope.
- **Director/Trust persona:** multi-campus / board governance above Academic Head — the next tier up.
- **Content suite expansion:** notices, meeting briefs, and richer drafting once the generative-content gate is ratified.

---

## Appendix A — Cross-persona boundary map (no double-building)

| Concern | Academic Head | HOD | Faculty | Student | IQAC | Registrar | Director (future) |
|---|---|---|---|---|---|---|---|
| Scope | Institution | One department | Cohort/section | Self | Accreditation | Operations/MIS | Multi-campus/board |
| Risk view | Institution-wide aggregate | Department overview | Cohort board | Own risk | — | — | Cross-institution |
| Reporting | Academic leadership reports | Department | — | — | Accreditation drafts | Statutory MIS | Board reports |
| Faculty data | (V2) compare only | (V2) manage dept | self | — | — | — | cross-institution |
| Generation | Reports / (gated) notices | — | (gated) content | — | Accreditation | Statutory | Board |
| Write to ERP | Never | Never | Marks/attendance entry (their own) | — | — | Operational | Never |

## Appendix B — Open decisions blocking parts of V1

1. **Role identity** (§14C / §2): principal-tier persona (recommended) vs new `academic_head` role value (locked-schema change, governance gate).
2. **Generative-content sign-off** (§2.10): covers Academic Head's Notice Generator for V1, or defers it to V2 with the content suite.
3. **Semantic-layer scope:** which institutional metrics ship in the first metric set (gates Chat/Brief/Decision Support/Reports breadth).

---

*End of RSDD — Academic Head AI Assistant. This document is the single source of truth for the persona and is consistent with the Academic Head Feature Freeze (10 V1, 1 conditional, 7 deferred).*
