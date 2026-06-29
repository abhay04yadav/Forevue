# Placement_Cell_AI_Complete_Design_v1.0

**Version:** v1.0  
**Generated:** June 27, 2026

---

This document combines the **Role Definition & Feature Freeze** and the **Role Solution Design Document (RSDD)** for the Placement Cell AI Assistant.

---

# Role Definition & Feature Freeze — Placement Cell AI Assistant

**Phase 1 — Product Definition** · AI Intelligence Layer on top of the College ERP (the ERP remains the System of Record)
**Status:** Draft for freeze · **Scope:** v1 (India-first) · **AI posture:** read-only & advisory — AI suggests, a human acts.

> This document defines the role *before* implementation. It contains no architecture or code. Once frozen (§12), it is the official feature list for this role; new features are not added afterward without a re-freeze.

---

## Decisions to ratify before reading on (PM flags)

These are product-definition decisions a reviewer must accept for the rest of the document to hold. They are stated up front rather than buried.

| # | Flag | Decision taken in this doc | Why |
|---|---|---|---|
| D1 | **This is a *new* role.** The locked role set is `admin / principal / registrar / iqac / faculty / student`. There is no placement role today. | Introduce a new role: **Placement Officer (TPO)**, role key `placement`. Sub-roles `placement_head` (approver) and `placement_coordinator` (operator) are an enhancement, not v1. | The placement function has a distinct data scope, a distinct external-sharing surface, and distinct decision rights. Folding it into `registrar` or `faculty` would violate least-privilege and create overlap. **[Assumption — confirm the role-model extension.]** |
| D2 | **External data sharing is a new DPDP surface.** Every other module keeps student data *inside* the tenant. Placement, by definition, shares it *with external companies*. | Treat recruiter-facing sharing of any student profile/resume as gated by **explicit, logged, per-drive student consent**. No external share without it. | DPDP Act 2023: the college is Data Fiduciary; purpose limitation + consent apply when data leaves the institution's lawful educational processing. **[Researched + risk synthesis — legal review before GA.]** |
| D3 | **Two name collisions + one duplicate in the input list.** "Daily AI Brief" appears twice; "Placement Dashboard"/"Placement Analytics Dashboard" and "Skill Gap Analyzer"/"Readiness Analyzer" overlap. | De-dup the Brief; keep the two dashboards but split them on *operational vs strategic*; **merge** Skill-Gap into the Readiness Analyzer as its explanation layer. Full rationale in §12. | A frozen list must have no ambiguous duplicates, or engineering builds the same thing twice. |
| D4 | **Minors are mostly out of frame here, but not entirely.** Placement is final-year (≈20–22). | Default to adult handling; retain the under-18 guard (consent gating, no behavioural profiling) for the rare minor (fast-track/lateral/diploma) so the role inherits the platform's DPDP §9(3) posture. | Bright-line child = under 18; the prohibition on detrimental profiling of children is **not** waived by consent. |

---

## 1. Role Overview

**Why this role exists.** A college's placement (Training & Placement) cell sits at the seam between the institution and the job market. It owns the outcome leadership is judged on — *did our students get placed, where, and at what package* — yet it is the role least served by the ERP. Placement data is the most scattered of all (spreadsheets per drive, recruiter emails, separate resume folders, ad-hoc WhatsApp groups), the most time-pressured (a drive's eligibility shortlist is needed in hours, not days), and the most externally exposed (data leaves the building). The Placement Cell AI Assistant exists to give this function a single operating surface: one place to run a drive, one trustworthy eligibility shortlist, one current view of every student's readiness, and one source of placement numbers that leadership and accreditation bodies can rely on.

**Responsibilities.**
- Run the end-to-end placement drive lifecycle: intake a company's criteria, shortlist eligible students, communicate, schedule, and record outcomes.
- Maintain an accurate, current picture of each student's *placement readiness* (academics-eligible, skills, resume quality, interview preparedness).
- Coordinate communication between recruiters, students, and the cell — without auto-acting on anyone's behalf.
- Produce the placement numbers that feed leadership dashboards and NIRF/NAAC reporting (the cell *supplies* this data; IQAC drafts the report).

**Business objectives.** Maximise placement rate and quality (offers, median/highest package, breadth of recruiters), shorten drive turnaround, protect the institution's recruiter relationships and reputation, and keep placement data audit- and accreditation-ready.

**Daily workflow (today, pre-product).** Open last night's recruiter emails → manually cross-check each company's criteria (CGPA cut-off, backlog rule, branch eligibility, gap-year rule) against a master spreadsheet → build a shortlist by hand → email/announce eligible students → chase responses → maintain a parallel tracker for who attended, cleared which round, and got offers → at quarter/year end, reconstruct the placement report from these scattered trackers.

**Success criteria.** Higher and faster placements; zero eligibility disputes (no eligible student wrongly excluded, no ineligible student wrongly forwarded to a recruiter); recruiter satisfaction; placement numbers that reconcile to the SoT with no manual rework at accreditation time.

**Problems faced today.** Eligibility is computed by hand against rules that vary per company — slow and error-prone. Student readiness is invisible until a drive exposes it. Resume quality is uneven and reviewed inconsistently. Communication is manual and lossy. The "what's our placement rate" question takes days to answer and never quite matches across spreadsheets. Sharing student data with recruiters happens informally, with no consent trail — a live DPDP risk.

**How AI improves it.** AI does the cross-checking, drafting, summarising, and pattern-spotting that consumes the cell's day, while the officer keeps every decision. Eligibility becomes an instant, explainable shortlist instead of a manual cross-tab. Readiness becomes continuous instead of discovered at the drive. Communication is drafted, not composed from scratch. The placement number is one query, grounded in the SoT. Crucially, the AI never *acts* — it never auto-rejects a student, auto-sends to a recruiter, or shares data without the human and the consent gate.

---

## 2. Role Goals

**Business goals.** Increase placement rate and package quality; widen the recruiter base; protect institutional reputation and recruiter trust; turn placement performance into a defensible accreditation and marketing asset.

**Operational goals.** Cut drive turnaround time (criteria-in to shortlist-out) from hours/days to minutes; eliminate eligibility errors; keep a single, current drive tracker; maintain a complete, consented data trail for every external share.

**Productivity goals.** Remove manual eligibility cross-checking, repetitive recruiter/student emailing, and end-of-period report reconstruction. Free the officer to spend time on relationships and student coaching, not spreadsheets.

**AI goals.** Make eligibility explainable (every inclusion/exclusion shows the rule and the value that triggered it); make readiness continuous and legible; ground every number in the SoT with a "can't answer from the data" fallback — never free-generate a placement figure.

**Automation goals.** Automate *computation and drafting* (shortlists, summaries, draft messages, draft reports), never *adverse or external action*. Auto-send, auto-reject, and auto-share are explicitly out of scope (§10).

**Decision-support goals.** Give the officer ranked, reasoned options — which students to nudge, which skill gaps to address before a drive, which recruiters to prioritise — so decisions are faster and evidence-backed, while the decision stays human.

---

## 3. User Profile

**Who uses this role.** The Training & Placement Officer (TPO) and placement coordinators. Read-only consumers of its *outputs* include the Principal/leadership (placement health) and IQAC (accreditation evidence) — but they operate under their own roles, not this one.

**Technical expertise.** Low-to-moderate. Comfortable with spreadsheets and email; not technical. The interface must be natural-language-first and require no query-building or SQL — consistent with the product's core "ask in plain English" principle.

**Daily activities.** Reviewing incoming drives, building eligibility shortlists, communicating with students and recruiters, scheduling rounds, recording outcomes, monitoring cohort readiness, and reporting numbers upward.

**Pain points.** Manual, per-company eligibility cross-checking; readiness invisible until too late; inconsistent resume review; lossy manual communication; placement numbers that take days and never reconcile; no consent trail for external data sharing.

**Current ERP frustrations.** Placement is the worst-served ERP area — often no module at all, or a thin one. Data is trapped in spreadsheets and email. No canonical student ID linking academics to placement. No dashboards. Reporting is a manual reconstruction.

**Information required.** Per student: academic eligibility signals (CGPA/aggregate, active backlogs, attendance where a company requires it, branch/programme, admission/gap year), skills & certifications, resume, placement status & history, contact details, and *consent status* for external sharing. Per drive: company, role, criteria, package, schedule, rounds, outcomes.

**Authority level.** Owns the placement drive lifecycle and placement records. **Read-only** on the academic SoT (consumes marks/attendance, never edits them). **No** authority over admissions, fees, accreditation drafting, or other departments' data.

**Decision-making responsibilities.** Approving eligibility shortlists (overriding the AI where justified, with reason logged); approving every external share and every outbound recruiter/student communication; deciding readiness interventions; signing off placement numbers before they go upstream.

---

## 4. Feature Catalog

> Naming reflects the §12 rationalisation: Skill-Gap is merged into the Readiness Analyzer; the two dashboards are split operational vs strategic; the duplicate Brief is removed.

### 4.1 Placement Dashboard (operational home screen)
- **Purpose.** The cell's daily cockpit: live drives, pending actions, today's schedule, and the Daily AI Brief in one view.
- **Problem solved.** No single place to see "what needs me today"; status lives across spreadsheets and inboxes.
- **Business value.** Faster turnaround, nothing dropped. **User value.** Walk in, see the day, act.
- **Inputs.** Active drives, pending shortlists/approvals, today's interviews, unread recruiter/student threads, readiness alerts.
- **Outputs.** Prioritised action cards, live drive statuses, quick-action launchers, the Daily Brief.
- **Dependencies.** Company Drive Management, Eligibility Engine, Readiness Analyzer, Comm Assistant, SoT.
- **AI involvement.** Summarises and *prioritises* the day (§6); does not act.
- **Expected behaviour.** Read-mostly; every action launches a human-confirmed flow. **Permissions.** View + Trigger-AI; actions inherit each feature's permissions.
- **Limitations.** Not analytics/reporting (that is 4.7). **Future.** Configurable widgets; saved layouts.

### 4.2 Student Placement Readiness Analyzer *(includes Skill-Gap)*
- **Purpose.** A continuous, explainable readiness picture per student and per cohort — *with the skill-gap breakdown as its explanation layer*.
- **Problem solved.** Readiness (and the specific gaps behind it) is invisible until a drive exposes it.
- **Business value.** Intervene before drives, not after; higher conversion. **User value.** Know who's drive-ready and exactly what each unready student is missing.
- **Inputs.** Academic eligibility signals, skills/certifications, resume signals, interview-prep progress, target-role skill profiles.
- **Outputs.** Readiness tier + reasons; per-student skill-gap list vs target roles; cohort readiness rollups.
- **Dependencies.** SoT, Resume Analyzer, Interview Prep, Eligibility Engine.
- **AI involvement.** Analyzes, explains, compares, recommends interventions (§6). Advisory only.
- **Expected behaviour.** Every tier shows the signals behind it; no opaque score. **Permissions.** View, Trigger-AI, View-Analytics; no edit of underlying academic data.
- **Limitations.** Not a hiring or grading judgement; advisory. For any under-18 student, no behavioural profiling — academic/skill signals only (D4). **Future.** Per-recruiter readiness benchmarking; predictive "drive-ready by date."

### 4.3 Resume Analyzer & Optimizer
- **Purpose.** Review a student's resume and suggest improvements against role/recruiter expectations.
- **Problem solved.** Uneven, inconsistently reviewed resumes weaken candidacy and the institution's brand at drives.
- **Business value.** Stronger candidacy, fewer recruiter complaints. **User value.** Consistent, fast, specific feedback at scale.
- **Inputs.** Student resume (uploaded), target role/JD, student profile signals.
- **Outputs.** Structured critique, gap callouts, prioritised suggestions, optional rewritten *suggestions* the student/officer can accept.
- **Dependencies.** Readiness Analyzer, Company Drive (for JD/role context), consent (resume is student PII).
- **AI involvement.** Analyzes, summarizes, generates suggested edits, explains why (§6).
- **Expected behaviour.** Suggests; never silently rewrites-and-submits. The student/officer accepts changes. **Permissions.** View + Trigger-AI on resumes in placement scope; Access-Sensitive-Data (resume PII) gated by consent.
- **Limitations.** Does not fabricate experience/credentials; does not submit on a student's behalf. **Future.** ATS-style scoring vs specific recruiters; version history.

### 4.4 Company Drive Management
- **Purpose.** System of record (within the AI layer) for the drive lifecycle: company, role, criteria, schedule, rounds, outcomes.
- **Problem solved.** Drives live in scattered emails/sheets with no single tracker.
- **Business value.** Reliable execution, recruiter trust, clean outcome data for reporting. **User value.** One tracker per drive, start to offer.
- **Inputs.** Company profile, JD/criteria, schedule, round structure; student responses and round results (entered/confirmed by the cell).
- **Outputs.** Drive record, round-by-round status, offer records, outcome feed to analytics.
- **Dependencies.** Eligibility Engine, Comm Assistant, SoT (for student linkage), consent (external sharing).
- **AI involvement.** Parses recruiter criteria from emails/JDs into structured drive criteria (suggested, human-confirmed); summarises drive status (§6).
- **Expected behaviour.** Placement *operational* records live here; canonical academic data is referenced read-only, never duplicated or edited. **Permissions.** Full CRUD on drive records within placement scope; Approve on offers; no edit of academic SoT.
- **Limitations.** Not the academic SoR; placement records are operational, not canonical academics. **Future.** Recruiter portal; auto-ingest of recruiter emails (still human-confirmed).

### 4.5 AI Eligibility Engine
- **Purpose.** Given a drive's criteria, produce an explainable eligible/ineligible shortlist against the SoT.
- **Problem solved.** Manual, per-company eligibility cross-checking — the cell's single biggest time sink and error source.
- **Business value.** Instant, dispute-free shortlists; protected recruiter relationships. **User value.** Minutes not hours; every decision defensible.
- **Inputs.** Drive criteria (CGPA/aggregate, backlog rule, branch, attendance threshold if required, gap/year rules), student academic signals from SoT.
- **Outputs.** Eligible list + ineligible list, **each row showing the exact rule and value that decided it** (e.g. "excluded: 1 active backlog; rule = 0"). Borderline cases flagged for review.
- **Dependencies.** Company Drive (criteria), SoT (signals), Readiness Analyzer.
- **AI involvement.** Evaluates rules deterministically and explains; the *engine is rules-based and explainable* (mirrors the platform's advisory, no-black-box-score principle).
- **Expected behaviour.** Produces a **draft** shortlist the officer reviews and approves. **It never auto-rejects a student or auto-forwards anyone to a recruiter.** Overrides are allowed and logged with reason.
- **Permissions.** View, Trigger-AI; Approve the resulting shortlist; cannot delete students or edit academic data.
- **Limitations.** Eligibility ≠ selection; advisory and reviewable. **Future.** Criteria templates per recruiter; "what-if" threshold preview.

### 4.6 Interview Preparation Assistant
- **Purpose.** Help students prepare — practice questions, role/company-specific prep, mock-interview feedback.
- **Problem solved.** Uneven, ad-hoc interview prep; the cell can't coach everyone individually.
- **Business value.** Higher conversion at the interview stage. **User value.** Scalable, role-specific prep; feeds readiness.
- **Inputs.** Target role/company, student profile, JD, prior round feedback.
- **Outputs.** Practice question sets, suggested answers/rubrics, mock feedback, prep-progress signal back to Readiness.
- **Dependencies.** Readiness Analyzer, Company Drive, Resume Analyzer.
- **AI involvement.** Generates, explains, gives practice feedback (§6).
- **Expected behaviour.** Coaching aid; advisory. **Permissions.** View + Trigger-AI within placement scope.
- **Limitations.** Not a guarantee of outcomes; does not represent the student to recruiters. **Future.** Voice/video mock practice; recruiter-specific question banks.

### 4.7 Placement Analytics & Reporting *(formerly "Placement Analytics Dashboard")*
- **Purpose.** The strategic, outcome-facing view: placement rate, package distribution, recruiter breadth, branch/cohort/YoY trends — and the **clean data feed for NIRF/NAAC placement metrics**.
- **Problem solved.** "What's our placement rate?" takes days and never reconciles across sheets.
- **Business value.** Board-level visibility; accreditation-ready placement numbers; marketing proof points. **User value.** One query, grounded answer, exportable.
- **Inputs.** Drive outcomes, offers, student placement statuses — all from the SoT.
- **Outputs.** KPIs, trend charts, cohort/branch drill-downs, exportable accreditation-format placement tables.
- **Dependencies.** Company Drive, SoT; consumed by leadership (read) and IQAC (accreditation drafting — *they* draft, the cell supplies).
- **AI involvement.** Summarizes, compares, forecasts, alerts on trend shifts (§6); grounded — never free-generates a number.
- **Expected behaviour.** Read-only analytics; numbers reconcile to the SoT. **Permissions.** View-Analytics, Export, Share (internal); no edit of source data.
- **Limitations.** Supplies placement data to accreditation; does **not** draft the SSR/AQAR (IQAC's job — §10). **Future.** Predictive placement forecasting; recruiter-relationship analytics.

### 4.8 AI Email & Communication Assistant
- **Purpose.** Draft recruiter and student communications — invites, eligibility notices, schedules, follow-ups, offer/outcome notes.
- **Problem solved.** Manual, repetitive, lossy communication.
- **Business value.** Faster, more professional, consistent comms; protected recruiter relationships. **User value.** Draft-ready messages in seconds.
- **Inputs.** Drive context, recipient list, intent, prior thread.
- **Outputs.** **Draft** messages for human review and send.
- **Dependencies.** Company Drive, Eligibility Engine, consent (any external/student-facing send).
- **AI involvement.** Generates and summarizes (§6).
- **Expected behaviour.** **Drafts only — never auto-sends.** The officer reviews and sends; external sends respect the consent gate (D2). **Permissions.** Trigger-AI to draft; Share/send is a human action with its own approval.
- **Limitations.** No autonomous outbound; no sharing student data externally without consent. **Future.** Channel integration (email/WhatsApp) with human-confirm send; templates.

### 4.9 Daily AI Brief *(de-duplicated)*
- **Purpose.** A short morning summary: today's drives and interviews, pending approvals, readiness alerts, recruiter threads needing a reply.
- **Problem solved.** The day starts with inbox/spreadsheet triage.
- **Business value / User value.** Nothing slips; the officer starts informed.
- **Inputs.** State across drives, schedules, threads, readiness alerts.
- **Outputs.** A prioritised, summarised brief (surfaced in 4.1).
- **Dependencies.** All operational features, SoT.
- **AI involvement.** Summarizes, prioritizes, alerts (§6).
- **Expected behaviour.** Informational; every item links to a human-confirmed action. **Permissions.** View + Trigger-AI.
- **Limitations.** Does not act on any item. **Future.** Push/scheduled delivery; per-user tailoring.

---

## 5. Dashboard Overview (operational — 4.1)

- **Widgets.** Active drives; today's schedule; pending eligibility approvals; readiness alerts; recruiter threads awaiting reply.
- **Cards.** Action cards ("Approve shortlist for X drive", "3 students dropped below eligibility", "Recruiter Y awaiting response").
- **Charts.** Light operational only (drive funnel, week ahead); deep trend charts live in Analytics (4.7).
- **Quick actions.** New drive · Run eligibility · Draft message · Open readiness board.
- **Notifications.** Eligibility-impacting academic changes, new recruiter emails, schedule conflicts, consent-pending shares.
- **KPIs (at-a-glance).** Active drives, students placed this cycle, pending approvals, drive-ready %.
- **Search.** Natural-language, scoped to placement data ("final-year CSE students with no backlog and a resume on file").
- **AI chat.** Plain-English copilot over placement-scoped data, grounded, with the "can't answer from the data" fallback.
- **Navigation.** Dashboard · Drives · Readiness · Resumes · Interview Prep · Analytics · Communications.
- **Daily summary.** The Daily AI Brief (4.9) anchors the top of the screen.

---

## 6. AI Capabilities (with *why*)

| Capability | What it does for this role | Why it exists |
|---|---|---|
| **Generate** | Draft messages, resume suggestions, interview questions, draft reports. | The cell's most repetitive work is composition; drafting (not sending) removes it while keeping the human in control. |
| **Summarize** | Daily Brief, drive status, recruiter threads, student profiles. | Replaces inbox/spreadsheet triage; turns scattered state into a glance. |
| **Predict / Forecast** | Likely placement readiness by a date; cohort placement trajectory. | Lets the cell intervene *before* a drive instead of reacting after. |
| **Recommend** | Which students to nudge, which gaps to close, which recruiters to prioritise. | Closes the loop from insight to action — ranked, reasoned, human-decided. |
| **Automate** | Computation and drafting only (shortlists, summaries, drafts). | Speed without risk; adverse/external action stays human (§10). |
| **Explain** | Every eligibility decision and readiness tier shows its underlying rule/signal. | Eligibility disputes and black-box scores destroy recruiter and student trust; explainability is the platform principle. |
| **Analyze** | Readiness, skill gaps, resume quality, drive performance. | The judgement the officer can't do at scale by hand. |
| **Compare** | Student vs role profile; cohort vs cohort; YoY placement. | Surfaces gaps and trends that drive intervention and reporting. |
| **Alert** | Eligibility-impacting academic changes; schedule conflicts; consent-pending shares; trend shifts. | Proactive nudges prevent dropped balls and compliance lapses. |
| **Prioritize** | Orders the day and the action queue. | Limited cell time goes to the highest-impact action first. |

All capabilities are **read-only and advisory** in v1. None take adverse action against a student or send/share externally without a human and the consent gate.

---

## 7. Permission Matrix (least privilege)

Role key: `placement`. Y = allowed; — = not allowed; *gated* = allowed only through the consent/approval flow.

| Feature | View | Create | Edit | Delete | Approve | Export | Share | Trigger AI | View Analytics | Sensitive Data |
|---|---|---|---|---|---|---|---|---|---|---|
| 4.1 Placement Dashboard | Y | — | — | — | — | — | — | Y | Y | — |
| 4.2 Readiness Analyzer (+Skill-Gap) | Y | — | — | — | — | Y | internal | Y | Y | *gated* |
| 4.3 Resume Analyzer & Optimizer | Y | — | suggest-only | — | — | — | *gated* | Y | — | *gated (resume PII)* |
| 4.4 Company Drive Management | Y | Y | Y | soft-only | Y (offers) | Y | *gated (external)* | Y | Y | *gated* |
| 4.5 AI Eligibility Engine | Y | — | override-w/-reason | — | Y (shortlist) | Y | internal | Y | Y | *gated* |
| 4.6 Interview Prep Assistant | Y | Y (prep sets) | Y | soft-only | — | — | internal | Y | — | — |
| 4.7 Placement Analytics & Reporting | Y | — | — | — | — | Y | internal | Y | — |
| 4.8 Email & Comm Assistant | draft | draft | draft | — | — | — | *gated (send)* | Y | — | *gated* |
| 4.9 Daily AI Brief | Y | — | — | — | — | — | — | Y | Y | — |

Cross-cutting rules: **no edit/delete of the academic SoT** (marks, attendance, results are read-only); **deletes are soft only**, never hard; **every external share and every send is a human-approved action subject to the consent gate** (D2); overrides of AI output are allowed but **logged with a reason** (full audit, per platform principle).

---

## 8. Data Access

**Data this role needs (read, unless noted).**
- Academic eligibility signals: CGPA/aggregate, active backlogs, branch/programme, admission/gap year, and attendance *only where a drive requires it*.
- Skills, certifications, resume (student PII).
- Placement records & history (read/write — these are the cell's own operational records).
- Student contact details and **consent status** for external sharing.

**Data this role should never access.** Fee/financial records; health data; disciplinary records beyond placement relevance; the detailed behavioural/risk reasoning of the Student Success Engine (a coarse "academically at-risk" flag is acceptable; the underlying sensitive reasons are not); other departments' or other roles' confidential data outside placement scope; the academic SoT in any *writable* form.

**Data ownership.** The college is Data Fiduciary. Placement *records* (drives, outcomes) are owned operationally by the cell within the AI layer. Academic data is owned by registrar/faculty; placement only references it. The ERP remains System of Record throughout.

**Data sensitivity.** Resume, contact, and any profile shared externally are high-sensitivity PII. Academic signals are sensitive. Placement outcomes are reportable but reconcile to the SoT.

**Cross-role restrictions.** Cannot edit academics (faculty/registrar), draft accreditation (IQAC), manage admissions/fees (registrar/admin), or see leadership-only institutional data outside placement scope.

**Privacy considerations (DPDP).** Data minimisation — pull only the signals a given drive needs. **External sharing is consent-gated, per-purpose, and logged** (D2). For any under-18 student, no behavioural profiling; academic/skill signals only, advisory, human-in-the-loop (D4). Independent legal review before GA.

---

## 9. Workflow Summary (per feature — definition only, no implementation)

Each follows: **Trigger → AI → ERP/SoT (read) → Response → Human Approval (if required) → Completion.**

- **4.5 Eligibility.** New/updated drive criteria → AI evaluates rules against SoT signals → reads academic data → returns explained eligible/ineligible draft → **officer approves/overrides (logged)** → shortlist finalised.
- **4.2 Readiness.** New academic/skill/resume signal → AI recomputes readiness + skill-gap → reads SoT → updated tiers + reasons → (no approval; advisory) → cohort/board refreshed.
- **4.3 Resume.** Officer/student requests review → AI analyzes vs role → reads profile/resume → critique + suggested edits → **human accepts edits** → updated resume on file.
- **4.4 Drives.** Recruiter criteria/email in → AI parses to structured draft → reads student linkage → drive record proposed → **officer confirms** → drive live; outcomes recorded as rounds complete.
- **4.6 Interview Prep.** Officer/student starts prep for a role → AI generates questions/feedback → reads profile/JD → prep set + feedback → (advisory) → prep-progress feeds readiness.
- **4.7 Analytics.** Officer asks/opens report → AI summarises grounded SoT data → reads outcomes → KPIs/trends/export → (officer reviews/sign-off before upstream use) → numbers shared internally / supplied to IQAC.
- **4.8 Comms.** Officer initiates a message → AI drafts → reads drive/recipient context → draft returned → **officer reviews; external send passes consent gate** → sent by human.
- **4.1 / 4.9 Dashboard & Brief.** Day starts / state changes → AI summarises + prioritises → reads operational state → brief/action cards → (each item is a human-confirmed action) → officer acts.

---

## 10. Out of Scope (what this role must NEVER do)

- **Never auto-reject or auto-debar a student**, and never auto-forward anyone to a recruiter. Eligibility is a *draft* a human approves.
- **Never auto-send** recruiter or student communications. Drafts only; humans send.
- **Never share student data externally without explicit, logged, per-drive consent** (D2).
- **Never edit the academic System of Record** — marks, attendance, results are read-only here.
- **Never draft accreditation reports** (SSR/AQAR/NIRF narratives) — the cell *supplies* placement data; **IQAC** drafts (avoids overlap with the Accreditation Assistant).
- **Never manage admissions, fees, or finance** (registrar/admin domain).
- **Never run student counselling / mental-health or behavioural-risk intervention** — that is the Student Success Engine + mentor/faculty domain. Placement may see a coarse academic-risk flag, not the sensitive reasoning.
- **Never make hiring decisions or guarantee outcomes** — the recruiter decides; the cell facilitates.
- **Never fabricate resume content or credentials.**
- **Never profile minors behaviourally** (DPDP §9(3)).

---

## 11. Future Features (versioned)

**Version 1 (this freeze).** The eight features in §4 — operational dashboard, readiness+skill-gap analyzer, resume analyzer, drive management, eligibility engine, interview prep, analytics & reporting, comms assistant — plus the Daily Brief. All read-only/advisory; consent-gated external sharing; human approval on all adverse/external actions.

**Version 2.** Recruiter self-service portal (drives, schedules, feedback) with consent-gated student data exposure; channel-integrated comms (email/WhatsApp) with human-confirm send; ATS-style resume scoring vs specific recruiters; predictive "drive-ready by date" and placement forecasting; recruiter-relationship analytics; criteria templates per recruiter; recruiter-email auto-ingest (still human-confirmed).

**Version 3.** Voice/video mock-interview practice; cross-institution / alumni-network benchmarking; placement-outcome ML calibrated per recruiter and role; deeper predictive analytics feeding leadership and accreditation; sub-role separation (`placement_head` approver vs `placement_coordinator` operator) and field-level access if scale demands.

---

## 12. Final Feature Freeze

**Rationalisation applied before freezing (the PM calls you asked for):**

1. **De-duplicate "Daily AI Brief".** It was listed twice. → One feature (4.9), surfaced inside the operational Dashboard (4.1).
2. **Merge "Student Skill Gap Analyzer" into "Student Placement Readiness Analyzer".** Skill-gap is the *explanation* of a readiness gap, not a separate engine — they share the same inputs and audience. Keeping them apart would split one capability across two screens and invite double-building. → Skill-gap becomes the named drill-down inside 4.2.
3. **Keep both dashboards, but split them sharply.** "Placement Dashboard" = **operational** daily cockpit (4.1, action-oriented, light charts). "Placement Analytics Dashboard" → renamed **"Placement Analytics & Reporting"** = **strategic** outcomes/trends/accreditation-feed (4.7). They serve different jobs (act-today vs report-the-quarter) and different audiences; merging would overload one screen.
4. **No renames needed** for Resume Analyzer, Company Drive Management, AI Eligibility Engine, Interview Prep Assistant, AI Email & Communication Assistant — all keep their names; behaviour is constrained to advisory/draft-only as specified.

**Frozen list (8 features + Daily Brief):**

| Feature | Purpose | Priority | Version | Owner | Dependencies | Status |
|---|---|---|---|---|---|---|
| Placement Dashboard | Operational daily cockpit + action queue | P0 | V1 | Placement Officer (TPO) | Eligibility, Drives, Readiness, Comms, SoT | Frozen |
| Readiness Analyzer (incl. Skill-Gap) | Continuous, explainable readiness + gap breakdown | P0 | V1 | TPO | SoT, Resume, Interview Prep, Eligibility | Frozen |
| AI Eligibility Engine | Explainable, human-approved eligibility shortlist | P0 | V1 | TPO | Drives, SoT, Readiness | Frozen |
| Company Drive Management | Drive lifecycle records (company→offer) | P0 | V1 | TPO | Eligibility, Comms, SoT, Consent | Frozen |
| Daily AI Brief | Prioritised morning summary | P0 | V1 | TPO | All operational features, SoT | Frozen |
| AI Email & Comm Assistant | Draft-only recruiter/student comms | P1 | V1 | TPO | Drives, Eligibility, Consent | Frozen |
| Resume Analyzer & Optimizer | Suggestion-only resume review | P1 | V1 | TPO | Readiness, Drives, Consent | Frozen |
| Interview Prep Assistant | Role-specific prep + mock feedback | P1 | V1 | TPO | Readiness, Drives, Resume | Frozen |
| Placement Analytics & Reporting | Strategic outcomes/trends + accreditation data feed | P1 | V1 | TPO (supplies); Leadership/IQAC (consume) | Drives, SoT | Frozen |

**Cross-cutting freeze conditions (apply to all features):** read-only & advisory; human approval on every adverse or external action; external sharing consent-gated and logged; no edit of the academic SoT; full audit on overrides and shares; DPDP minor-handling inherited. New features are not added beyond this point without a re-freeze.

*Frozen subject to ratifying D1 (new `placement` role) and D2 (external-sharing consent gate). Both are product-definition prerequisites, not implementation detail.*


---

# Placement Cell AI Assistant — Role Solution Design Document (RSDD)

**Product:** AI ERP Copilot — an AI Intelligence Layer on top of existing College ERP systems.
**This document defines:** the Placement Cell AI Assistant role, end to end — product, UX, AI behaviour, security, and delivery.
**Posture:** The ERP remains the **System of Record**. The AI Layer is the **System of Intelligence** — **read-only and advisory in V1: the AI proposes, a human decides and acts.**
**Status:** Design reference for engineering handoff · **Scope:** V1 (India-first) · **Audience:** PM, UX, Backend, Frontend, AI, Security, QA, DevOps.

> **Builds on the existing foundation — do not redesign:** authentication, multi-tenancy (Postgres RLS, server-side tenant injection), Student 360, the ingestion pipeline (raw → staging → canonical), audit logging, and the rules-based risk engine. The Placement Assistant consumes these; it does not duplicate them.

> **Scope note for reviewers.** An earlier feature-freeze scoped a tight 8-feature V1. This RSDD intentionally designs the broader **18-feature** V1 the product owner has chosen. To keep that deliverable realistic, the Implementation Roadmap (§22) phases the 18 across **V1.0 / V1.1 / V1.2** rather than implying a single simultaneous release. Feature boundaries are drawn explicitly in §7 to prevent two features being built for one job.

---

# CHAPTER 1 — Product Foundation

## 1. Executive Summary

The placement (Training & Placement) function owns the outcome a college is judged on — *did our students get placed, where, and at what package* — yet it is the worst-served by the ERP. Its data is the most scattered (a spreadsheet per drive, recruiter email threads, loose resume folders), the most time-pressured (an eligibility shortlist is needed in hours), and uniquely **externally exposed** — placement is the one function that routinely sends student data *outside* the institution, to recruiters.

The **Placement Cell AI Assistant** gives this function a single operating surface inside the AI ERP Copilot: one place to run a drive, one trustworthy and *explainable* eligibility shortlist, one continuous view of every student's placement readiness, one recruiter relationship record, and one reconciled source of placement numbers for leadership and accreditation. AI removes the cross-checking, drafting, summarising and pattern-spotting that consume the cell's day, while every decision — every shortlist, every external share, every outbound message — stays with a human.

The design follows the platform's non-negotiables: multi-tenant isolation via row-level security with server-injected tenant context; AI that is grounded in the canonical Single Source of Truth (SoT) and never free-generates a number; full audit of every action and override; and DPDP-by-design, with a placement-specific addition — **explicit, logged, per-drive student consent before any data leaves the institution.** The enterprise reference points are Microsoft Copilot, Salesforce Einstein, ServiceNow AI, Oracle Fusion AI and Google Workspace AI: an assistant woven into the workflow, transparent about its reasoning, and constrained to suggestion in any high-stakes path.

V1 delivers 18 capabilities spanning the full placement lifecycle — from readiness and eligibility, through drive and recruiter management, to communication, reporting and insight — phased for a credible engineering rollout.

## 2. Role Definition

**Role name:** Placement Cell AI Assistant. **Human owner:** Training & Placement Officer (TPO) and placement coordinators. **New role key:** `placement`.

**Role-model decision (flag).** The locked role set is `admin / principal / registrar / iqac / faculty / student`. There is **no placement role today**; V1 requires extending the role enum with `placement`. Sub-roles `placement_head` (approver) and `placement_coordinator` (operator) are a V1.2/V2 refinement, not a V1.0 prerequisite. The role is added because placement has a distinct data scope, distinct decision rights, and a distinct external-sharing surface; folding it into `registrar` or `faculty` would break least-privilege and create overlap. *(Assumption — confirm the role-model extension.)*

**What the role owns.** The placement drive lifecycle and placement operational records; recruiter relationships; student placement readiness coordination; placement communications; and the placement numbers supplied upward.

**What the role consumes (read-only).** Academic eligibility signals from the SoT (CGPA/aggregate, active backlogs, branch/programme, admission/gap year, and attendance only where a drive requires it), skills/certifications, resumes, and a *coarse* academic-risk flag — never the detailed risk reasoning.

**What the role must never do (summary; full list §19/§17).** Never edit the academic System of Record; never auto-reject a student or auto-forward anyone to a recruiter; never auto-send communications; never share student data externally without consent; never draft accreditation narratives (it supplies data, IQAC drafts); never manage admissions or fees; never run behavioural counselling or profile minors.

## 3. User Persona

**Primary — Training & Placement Officer (TPO).** Owns placement outcomes and recruiter relationships. Moderate technical comfort: fluent with spreadsheets and email, not with query tools. Time-poor during placement season, juggling many concurrent drives. Judged on placement rate, package quality, and recruiter breadth. Needs speed without losing control or defensibility.

**Secondary — Placement Coordinator.** Executes the day-to-day: building shortlists, scheduling, chasing responses, recording outcomes. Wants the busywork removed.

**Adjacent consumers (own roles, read-only on placement outputs).** Principal/leadership (placement health), IQAC (accreditation evidence), and Students (own placement status and a scoped query assistant). These are not `placement`-role users; they see placement *outputs* through their own roles and scopes.

**Goals.** Place more students, faster, with stronger candidacy and zero eligibility disputes; keep recruiters happy and returning; produce numbers that reconcile instantly at reporting time; spend reclaimed time on relationships and student coaching.

**Frustrations today.** Manual per-company eligibility cross-checking; readiness invisible until a drive exposes it; inconsistent resume review; lossy manual communication; placement numbers that take days and never match; and informal external data sharing with no consent trail.

## 4. Business Goals

- **Placement outcomes:** raise placement rate, median/highest package, and recruiter breadth.
- **Speed:** cut drive turnaround (criteria-in to shortlist-out) from hours/days to minutes.
- **Trust & reputation:** zero eligibility disputes; protected recruiter relationships; stronger institutional brand at drives.
- **Readiness:** make student placement-readiness continuous and actionable, so intervention happens before drives.
- **Reporting & accreditation:** placement numbers that reconcile to the SoT with no rework; clean placement-metric feed for NIRF/NAAC (cell supplies, IQAC drafts).
- **Compliance:** every external share consented and logged; DPDP-by-design; full audit.
- **Productivity:** remove manual eligibility cross-checking, repetitive communication, and end-of-period report reconstruction.

## 5. Current Problems

1. **Eligibility is manual and error-prone.** Each company's criteria (CGPA cut-off, backlog rule, branch eligibility, gap/year rules) are cross-checked by hand against a master sheet — slow, and a single mistake (an eligible student excluded, or an ineligible one forwarded) damages student trust and the recruiter relationship.
2. **Readiness is invisible until too late.** No continuous picture of who is drive-ready and what the unready are missing; gaps surface only when a drive exposes them.
3. **Resume quality is uneven.** Inconsistent, ad-hoc review weakens candidacy and the institution's brand.
4. **Communication is manual and lossy.** Invites, notices, schedules and follow-ups are composed from scratch; threads are scattered across inboxes and chat groups.
5. **Recruiter relationships are untracked.** No institutional memory of who hires what, when, and how the relationship is trending — it lives in one officer's head.
6. **Numbers don't reconcile.** "What's our placement rate?" takes days and never quite matches across spreadsheets; accreditation time becomes a manual reconstruction.
7. **External sharing has no consent trail.** Student data goes to recruiters informally — a live DPDP exposure.
8. **No forward view.** No market/hiring-trend awareness or predictive readiness to plan training and target recruiters.

## 6. Dashboard Design (philosophy)

Two distinct surfaces, deliberately separated so neither is overloaded:

- **Placement Dashboard (operational cockpit, §7.1).** The daily "what needs me today": live drives, pending approvals, today's schedule, event-driven alerts, and the Daily AI Brief. Action-oriented, light charts, every action launching a human-confirmed flow.
- **Placement Analytics Dashboard (strategic, §7.7).** The "how are we doing": placement rate, package distribution, recruiter breadth, cohort/branch/YoY trends, and the accreditation data feed. Read-only, grounded in the SoT, exportable.

Design principles across both: natural-language-first (no query-building); explainability on every AI output (reasons shown, no black-box scores); grounded answers with a clear "I can't answer that from the data" fallback; tenant- and role-scoped everywhere; and a consistent "AI proposes → human reviews → human acts" interaction for any high-stakes step.

---

# CHAPTER 2 — Complete Feature Catalogue

Every feature is **read-only and advisory** in V1 unless it operates on the cell's own operational records (drives, CRM, calendar, offers). No feature edits the academic SoT; no feature takes adverse or external action without a human and, where data leaves the institution, the consent gate. Each entry covers: Purpose · User Problem · Business Value · Impact on Students & Recruiters · Inputs / Required ERP Data · Outputs · Expected Behaviour · AI Behaviour · User Workflow · Permissions · Dependencies · Risks · Future Improvements.

**Boundary map (read this first — prevents double-building):**
- **Company Drive Management** = per-drive *execution* (one drive, start to offer). **CRM** = the long-term *recruiter account* view across all drives. Drive records roll up into the CRM relationship history.
- **Placement Analytics Dashboard** = *interactive* exploration of outcomes. **Placement Report Generator** = *formatted document* output (NIRF/NAAC/management). Same numbers, different surface.
- **Daily AI Brief** = *scheduled* once-a-day summary. **AI Notifications & Alerts** = *event-driven* nudges in real time. The Brief aggregates the day's notable alerts; it does not replace them.
- **Student Placement Readiness Analyzer** = the *aggregate* readiness tier + reasons. **Student Skill Gap Analyzer** = the *deep drill-down* into specific skill gaps vs target roles, usable standalone for training planning; it feeds Readiness.
- **Student Recommendation Engine** = *matching* (students↔drives, actions↔students). It proposes; it never auto-forwards a student to a recruiter.

---

## 7.1 Placement Dashboard
- **Purpose / Why it exists.** The cell's daily operational cockpit — one screen for "what needs me today."
- **User Problem / Business problem solved.** Status lives across spreadsheets and inboxes; nothing tells the officer where to start.
- **Business Value.** Faster turnaround; nothing dropped. **Value to cell:** a single, prioritised starting point each morning.
- **Impact on students & recruiters.** Faster, more reliable handling of drives and responses → better candidate and recruiter experience.
- **Inputs / Required ERP data.** Active drives, pending approvals, today's schedule, unread recruiter/student threads, readiness alerts (from SoT + placement records).
- **Outputs.** Prioritised action cards, live drive statuses, quick-action launchers, the Daily Brief surface.
- **Expected Behaviour.** Read-mostly; every action launches a human-confirmed flow inheriting that feature's permissions.
- **AI Behaviour.** Summarises and prioritises the day; does not act autonomously.
- **User Workflow.** Open dashboard → scan brief + action cards → launch a flow (eligibility, message, drive) → return.
- **Permissions.** View, Trigger-AI, View-Analytics (operational only).
- **Dependencies.** Eligibility Engine, Drive Management, Readiness, Comms, Notifications, Daily Brief, SoT.
- **Risks.** Alert overload → mitigate with prioritisation and grouping.
- **Future Improvements.** Configurable/saved widget layouts; role-tailored cockpits for coordinator vs head.

## 7.2 Student Placement Readiness Analyzer
- **Purpose / Why it exists.** A continuous, explainable readiness picture per student and cohort.
- **User Problem.** Readiness is discovered at the drive, not before it.
- **Business Value.** Intervene early; higher conversion. **Value to cell:** know who is drive-ready at any moment.
- **Impact on students & recruiters.** Students get targeted help before drives; recruiters meet better-prepared candidates.
- **Inputs / Required ERP data.** Academic eligibility signals, skills/certifications, resume signals, interview-prep progress, target-role profiles.
- **Outputs.** Readiness tier + reasons; cohort rollups; links to the Skill-Gap drill-down (7.8).
- **Expected Behaviour.** Every tier shows the signals behind it; no opaque score; advisory only.
- **AI Behaviour.** Analyzes, explains, compares against role profiles, recommends interventions.
- **User Workflow.** Open readiness board → filter cohort → inspect a student's reasons → assign/track an intervention.
- **Permissions.** View, Trigger-AI, View-Analytics; no edit of underlying academic data.
- **Dependencies.** SoT, Skill-Gap Analyzer, Resume Analyzer, Interview Prep, Eligibility Engine.
- **Risks.** Misread readiness if source data is stale → show provenance/last-updated; for under-18 students, academic/skill signals only (no behavioural profiling).
- **Future Improvements.** "Drive-ready by date" prediction; per-recruiter readiness benchmarking.

## 7.3 Resume Analyzer & Optimizer
- **Purpose / Why it exists.** Consistent, fast, role-aware resume review and improvement suggestions.
- **User Problem.** Uneven, inconsistently reviewed resumes weaken candidacy and brand.
- **Business Value.** Stronger candidacy, fewer recruiter complaints. **Value to cell:** scalable review.
- **Impact on students & recruiters.** Students present better; recruiters receive higher-quality, relevant resumes.
- **Inputs / Required ERP data.** Student resume (uploaded), target role/JD, student profile signals.
- **Outputs.** Structured critique, gap callouts, prioritised suggestions, optional suggested rewrites to accept/reject.
- **Expected Behaviour.** Suggests; never silently rewrites-and-submits; never fabricates experience or credentials.
- **AI Behaviour.** Analyzes, summarizes, generates suggested edits, explains the why.
- **User Workflow.** Upload/select resume → choose target role → review AI critique → accept edits → save version.
- **Permissions.** View + Trigger-AI on resumes in placement scope; Sensitive-Data (resume PII) gated by consent.
- **Dependencies.** Readiness, Drive Management (role/JD context), consent.
- **Risks.** Over-optimisation/uniformity, or fabrication → constrain to truthful, evidence-backed suggestions; human accepts.
- **Future Improvements.** ATS-style scoring vs specific recruiters; version history & diff.

## 7.4 Company Drive Management
- **Purpose / Why it exists.** The operational record (within the AI layer) of the drive lifecycle: company, role, criteria, schedule, rounds, outcomes.
- **User Problem.** Drives live in scattered emails and sheets with no single tracker.
- **Business Value.** Reliable execution; clean outcome data. **Value to cell:** one tracker per drive, start to offer.
- **Impact on students & recruiters.** Smooth, professional drive execution; recruiters trust the process.
- **Inputs / Required ERP data.** Company profile (from CRM), JD/criteria, schedule, round structure; student responses and round results (entered/confirmed by the cell); student linkage from SoT.
- **Outputs.** Drive record, round-by-round status, offer records, outcome feed to Analytics/Reports/Offer Tracking.
- **Expected Behaviour.** Placement *operational* records live here; canonical academic data is referenced read-only, never duplicated or edited; deletes soft only.
- **AI Behaviour.** Parses recruiter criteria/JD/email into structured drive criteria (suggested, human-confirmed); summarises drive status.
- **User Workflow.** New drive → confirm AI-parsed criteria → run eligibility → communicate → record rounds/outcomes → close.
- **Permissions.** Full CRUD on drive records in placement scope; Approve (offers); external Share gated by consent; no edit of academic SoT.
- **Dependencies.** CRM, Eligibility Engine, Comms, Calendar, Offer Tracking, SoT, consent.
- **Risks.** Mis-parsed criteria → human confirmation mandatory before eligibility runs.
- **Future Improvements.** Recruiter email auto-ingest (still confirmed); recruiter self-service portal (V2).

## 7.5 AI Eligibility Engine
- **Purpose / Why it exists.** Turn a drive's criteria into an explainable eligible/ineligible shortlist against the SoT — the cell's single biggest time sink solved.
- **User Problem.** Manual, per-company eligibility cross-checking is slow and error-prone.
- **Business Value.** Instant, dispute-free shortlists; protected recruiter relationships. **Value to cell:** minutes not hours, every decision defensible.
- **Impact on students & recruiters.** No eligible student wrongly excluded; no ineligible student wrongly forwarded.
- **Inputs / Required ERP data.** Drive criteria (CGPA/aggregate, backlog rule, branch, attendance threshold if required, gap/year rules); student academic signals from SoT.
- **Outputs.** Eligible and ineligible lists, **each row showing the exact rule and value that decided it** (e.g. "excluded: 1 active backlog; rule = 0"); borderline cases flagged.
- **Expected Behaviour.** Produces a **draft** shortlist the officer approves; **never auto-rejects a student or auto-forwards to a recruiter**; overrides allowed and logged with reason.
- **AI Behaviour.** Evaluates rules deterministically and explains; rules-based and explainable, consistent with the platform's no-black-box principle (reuses the risk engine's explainability pattern).
- **User Workflow.** Open drive → run eligibility → review explained lists → override exceptions (with reason) → approve shortlist.
- **Permissions.** View, Trigger-AI, Approve (shortlist), Export; override-with-reason; cannot delete students or edit academics.
- **Dependencies.** Drive Management, SoT, Readiness.
- **Risks.** Criteria ambiguity or stale data → confirm parsed criteria, show signal provenance, keep human approval.
- **Future Improvements.** Per-recruiter criteria templates; "what-if" threshold preview.

## 7.6 Interview Preparation Assistant
- **Purpose / Why it exists.** Scalable, role-specific interview prep and mock feedback.
- **User Problem.** Prep is ad-hoc; the cell can't coach everyone individually.
- **Business Value.** Higher conversion at interview stage. **Value to cell:** coaching at scale.
- **Impact on students & recruiters.** Students walk in prepared; recruiters see stronger performance.
- **Inputs / Required ERP data.** Target role/company, student profile, JD, prior round feedback.
- **Outputs.** Practice question sets, answer rubrics, mock feedback, prep-progress signal back to Readiness.
- **Expected Behaviour.** Coaching aid; advisory; does not represent the student to recruiters.
- **AI Behaviour.** Generates questions, gives practice feedback, explains.
- **User Workflow.** Select role → practice → receive feedback → progress feeds readiness.
- **Permissions.** View + Trigger-AI in placement scope.
- **Dependencies.** Readiness, Drive Management, Resume Analyzer.
- **Risks.** Over-reliance / generic prep → role- and company-specific banks; clear "practice aid" framing.
- **Future Improvements.** Voice/video mock practice; recruiter-specific question banks.

## 7.7 Placement Analytics Dashboard
- **Purpose / Why it exists.** The strategic, outcome-facing view: placement rate, package distribution, recruiter breadth, cohort/branch/YoY trends.
- **User Problem.** "What's our placement rate?" takes days and never reconciles.
- **Business Value.** Board-level visibility; marketing proof points; accreditation-ready numbers. **Value to cell:** one query, grounded answer.
- **Impact on students & recruiters.** Indirect — informs where to focus effort and which recruiters to grow.
- **Inputs / Required ERP data.** Drive outcomes, offers, placement statuses — all from the SoT.
- **Outputs.** KPIs, trend charts, cohort/branch drill-downs, internal exports.
- **Expected Behaviour.** Read-only; numbers reconcile to the SoT; AI never free-generates a figure.
- **AI Behaviour.** Summarizes, compares, forecasts, alerts on trend shifts; grounded with fallback.
- **User Workflow.** Ask in NL or open a view → grounded answer + chart → drill down → export/share internally.
- **Permissions.** View-Analytics, Export, internal Share; no edit of source data.
- **Dependencies.** Drive Management, Offer Tracking, SoT; consumed by leadership/IQAC under their roles.
- **Risks.** Misinterpretation of trends → show definitions/provenance; grounding only.
- **Future Improvements.** Predictive placement forecasting; recruiter-relationship analytics.

## 7.8 Student Skill Gap Analyzer
- **Purpose / Why it exists.** Deep drill-down into specific skill gaps per student and cohort vs target-role profiles — usable standalone for training planning.
- **User Problem.** The cell knows students are "not ready" but not precisely what to train.
- **Business Value.** Targeted training spend; higher eventual placement. **Value to cell:** turns readiness into a concrete training plan.
- **Impact on students & recruiters.** Students get specific, actionable upskilling; recruiters meet better-matched candidates.
- **Inputs / Required ERP data.** Student skills/certifications, academic signals, target-role skill profiles, drive criteria.
- **Outputs.** Per-student and cohort skill-gap maps; suggested training priorities; feeds Readiness (7.2).
- **Expected Behaviour.** Advisory; explains each gap against a named target role.
- **AI Behaviour.** Analyzes, compares (student vs role), recommends training priorities.
- **User Workflow.** Pick target roles/recruiters → view cohort gap map → export a training plan.
- **Permissions.** View, Trigger-AI, View-Analytics, Export; Sensitive-Data gated.
- **Dependencies.** SoT, Readiness, Drive Management/CRM (target roles).
- **Risks.** Gaps only as good as skill data quality → surface coverage/confidence; no behavioural profiling of minors.
- **Future Improvements.** Link to LMS/training providers; gap-to-course recommendations.

## 7.9 Company Relationship Management (CRM)
- **Purpose / Why it exists.** The long-term recruiter *account* view across all drives — institutional memory of the relationship.
- **User Problem.** Recruiter knowledge lives in one officer's head; relationships aren't tracked or grown.
- **Business Value.** Wider, deeper, more durable recruiter base. **Value to cell:** continuity across staff changes and seasons.
- **Impact on students & recruiters.** More and better-matched opportunities; recruiters feel known and managed professionally.
- **Inputs / Required ERP data.** Company profiles, contacts, engagement history, past drives/outcomes, hiring patterns (placement records + drive rollups).
- **Outputs.** Recruiter account pages, relationship timeline, engagement health, follow-up suggestions.
- **Expected Behaviour.** CRM holds *recruiter* data and engagement; per-drive execution stays in Drive Management; drives roll up here.
- **AI Behaviour.** Summarizes relationship history, recommends follow-ups and which recruiters to prioritise, alerts on dormant accounts.
- **User Workflow.** Open recruiter → review history/health → log interaction → act on suggested follow-up.
- **Permissions.** Full CRUD on CRM records in placement scope; external Share gated; Export.
- **Dependencies.** Drive Management, Comms, Calendar, Analytics.
- **Risks.** Recruiter contact PII handling → access-controlled and audited.
- **Future Improvements.** Recruiter self-service portal; relationship-health scoring.

## 7.10 AI Email & Communication Assistant
- **Purpose / Why it exists.** Draft recruiter and student communications — invites, eligibility notices, schedules, follow-ups, outcome notes.
- **User Problem.** Manual, repetitive, lossy communication.
- **Business Value.** Faster, consistent, professional comms; protected relationships. **Value to cell:** draft-ready messages in seconds.
- **Impact on students & recruiters.** Timely, clear, professional communication.
- **Inputs / Required ERP data.** Drive context, recipient list, intent, prior thread.
- **Outputs.** **Draft** messages for human review and send.
- **Expected Behaviour.** **Drafts only — never auto-sends;** external/student sends pass the consent gate.
- **AI Behaviour.** Generates and summarizes; matches tone/context.
- **User Workflow.** Pick context + intent → AI drafts → officer edits → human sends (consent-checked).
- **Permissions.** Trigger-AI to draft; Share/send is a human action with its own approval; Sensitive-Data gated.
- **Dependencies.** Drive Management, Eligibility, CRM, consent.
- **Risks.** Accidental external send / wrong recipient → human-confirm send, consent gate, recipient validation.
- **Future Improvements.** Channel integration (email/WhatsApp) with human-confirm send; templates.

## 7.11 Placement Report Generator
- **Purpose / Why it exists.** Produce formatted placement reports — management summaries and the NIRF/NAAC placement-metric tables.
- **User Problem.** End-of-period reporting is a manual reconstruction across spreadsheets.
- **Business Value.** Hours → minutes; accreditation-ready output. **Value to cell:** defensible, reconciled reports on demand.
- **Impact on students & recruiters.** Indirect — accurate institutional reporting.
- **Inputs / Required ERP data.** Drive outcomes, offers, placement statuses from the SoT; report template/format.
- **Outputs.** Formatted report documents/tables (management, NIRF/NAAC placement sections), regenerable.
- **Expected Behaviour.** Generates *placement data* output; **does not draft accreditation narratives** — it supplies tables to IQAC, who draft the SSR/AQAR.
- **AI Behaviour.** Summarizes, assembles grounded numbers into the template, explains figures; never invents a number.
- **User Workflow.** Choose report + period → AI assembles → officer reviews/signs off → export/share internally.
- **Permissions.** View-Analytics, Export, internal Share; no edit of source data.
- **Dependencies.** Analytics, Drive Management, Offer Tracking, SoT; hands off to IQAC/Accreditation.
- **Risks.** Format drift as frameworks change → versioned templates.
- **Future Improvements.** Scheduled report runs; one-click accreditation-format export.

## 7.12 Placement Calendar & Schedule Manager
- **Purpose / Why it exists.** A single calendar for drives, interviews, deadlines and prep sessions, with conflict detection.
- **User Problem.** Scheduling lives in heads and sheets; clashes and missed deadlines happen.
- **Business Value.** Smooth execution; no missed drives. **Value to cell:** one schedule, conflicts flagged.
- **Impact on students & recruiters.** Reliable scheduling; fewer clashes for students sitting multiple drives.
- **Inputs / Required ERP data.** Drive schedules, interview rounds, deadlines, student availability signals.
- **Outputs.** Calendar views, conflict alerts, reminders.
- **Expected Behaviour.** Schedules placement events; conflict detection is advisory; reminders surface via Notifications.
- **AI Behaviour.** Detects conflicts, suggests slots, summarises the week/day ahead.
- **User Workflow.** Schedule a round → AI flags conflicts → adjust → reminders dispatched (human-confirmed where external).
- **Permissions.** CRUD on placement calendar in scope; no edit of others' calendars.
- **Dependencies.** Drive Management, Notifications, Comms.
- **Risks.** Double-booking students across drives → cross-drive conflict checks.
- **Future Improvements.** Two-way sync with institutional/recruiter calendars.

## 7.13 Student Query Assistant
- **Purpose / Why it exists.** A student-facing, plain-English assistant for placement questions — eligibility, drives, status, deadlines.
- **User Problem.** Students flood the cell with repetitive questions; answers are inconsistent.
- **Business Value.** Deflects routine queries; consistent answers. **Value to cell:** time reclaimed.
- **Impact on students & recruiters.** Students get instant, accurate, self-serve answers about *their own* placement.
- **Inputs / Required ERP data.** The asking student's own placement-relevant data; drive/eligibility info; FAQs.
- **Outputs.** Grounded answers scoped to the student's own data; "ask the cell" fallback.
- **Expected Behaviour.** **Strictly scoped to the asking student's own data;** read-only; grounded with fallback; consent-aware; advisory (does not decide eligibility).
- **AI Behaviour.** Answers, explains, summarises — within the student's scope only.
- **User Workflow.** Student asks → scoped grounded answer → escalate to cell if out of scope.
- **Permissions.** Student role, own-data scope only; never sees other students' data.
- **Dependencies.** SoT, Eligibility, Drive Management, semantic layer, RLS/role scoping.
- **Risks.** Cross-student leakage (top risk) → hard server-side own-data scoping + audit; no hallucinated eligibility claims.
- **Future Improvements.** Proactive student nudges; multilingual support.

## 7.14 Offer & Internship Tracking
- **Purpose / Why it exists.** Track offers and internships through their lifecycle — multiple offers, acceptance status, internship-to-PPO conversion.
- **User Problem.** Offers and internships are tracked loosely; conversions and multi-offer cases are missed.
- **Business Value.** Accurate placement counts; visibility into conversions. **Value to cell:** clean offer data feeding reports.
- **Impact on students & recruiters.** Clear offer status for students; reliable acceptance data for recruiters.
- **Inputs / Required ERP data.** Offers and internships from drives; student acceptance/decline; conversion events.
- **Outputs.** Offer/internship records, status, multi-offer view, conversion tracking; feeds Analytics/Reports.
- **Expected Behaviour.** Operational records; deletes soft; feeds reporting; advisory on conversion likelihood.
- **AI Behaviour.** Summarizes offer status, alerts on pending decisions, tracks conversions.
- **User Workflow.** Record offer → track student decision → log acceptance/conversion → flows to reports.
- **Permissions.** CRUD on offer/internship records in scope; Export; external Share gated.
- **Dependencies.** Drive Management, Analytics, Report Generator, SoT.
- **Risks.** Double-counting offers → dedupe rules and clear acceptance status.
- **Future Improvements.** Automated PPO-conversion reminders; offer-comparison view for students.

## 7.15 Industry Trends & Hiring Insights
- **Purpose / Why it exists.** Forward-looking market and hiring-trend awareness to plan training and target recruiters.
- **User Problem.** The cell reacts to drives; it has no market view to plan ahead.
- **Business Value.** Better-targeted training and recruiter outreach. **Value to cell:** plan the season, don't just react.
- **Impact on students & recruiters.** Students train for in-demand skills; recruiters find aligned talent.
- **Inputs / Required ERP data.** Internal placement/hiring history; **external market data sources** (the one feature requiring external inputs).
- **Outputs.** Trend summaries, in-demand skill/role insights, recruiter-targeting suggestions.
- **Expected Behaviour.** Advisory insight; **internal data is grounded in the SoT; external/market claims are clearly attributed and never presented as institutional fact.**
- **AI Behaviour.** Analyzes internal patterns, summarises external trends, recommends focus areas, forecasts demand.
- **User Workflow.** Open insights → review internal + external trends → feed into training/CRM strategy.
- **Permissions.** View, Trigger-AI, View-Analytics.
- **Dependencies.** Analytics, Skill-Gap, CRM; external data source (governed).
- **Risks.** Hallucinated or stale external claims → attribute sources, separate internal-grounded from external-advisory, avoid unverifiable specifics. *(Highest grounding risk in the catalogue — consider V1.2.)*
- **Future Improvements.** Curated, licensed market-data integrations; demand forecasting per role.

## 7.16 Student Recommendation Engine
- **Purpose / Why it exists.** Matching — recommend suitable students for a drive, and recommend next actions to students — to improve fit and conversion.
- **User Problem.** Matching students to opportunities is manual and inconsistent.
- **Business Value.** Better fit, higher conversion, wider participation. **Value to cell:** surfaces good matches the officer might miss.
- **Impact on students & recruiters.** Students see relevant opportunities; recruiters get better-fit candidate pools.
- **Inputs / Required ERP data.** Student readiness/skills/profile, drive criteria/role profiles, history.
- **Outputs.** Ranked, explained student-to-drive matches; per-student action recommendations.
- **Expected Behaviour.** **Proposes only — never auto-forwards a student to a recruiter;** recommendations are explained and reviewable; fairness-aware.
- **AI Behaviour.** Recommends, ranks, explains; advisory.
- **User Workflow.** Open drive → review recommended students with reasons → officer selects → eligibility/consent flow.
- **Permissions.** View, Trigger-AI; selection is a human action; external share gated.
- **Dependencies.** Readiness, Skill-Gap, Eligibility, Drive Management.
- **Risks.** Bias/unfairness, or feeling like auto-selection → explainable, reviewable, human-decided; monitor for systematic exclusion.
- **Future Improvements.** Outcome-calibrated matching; fairness dashboards.

## 7.17 AI Notifications & Alerts
- **Purpose / Why it exists.** Event-driven, real-time nudges — eligibility-impacting academic changes, new recruiter emails, schedule conflicts, pending approvals/decisions, consent-pending shares.
- **User Problem.** Time-sensitive events are missed in the noise.
- **Business Value.** Nothing slips; proactive instead of reactive. **Value to cell:** the system watches so the officer doesn't have to.
- **Impact on students & recruiters.** Timely responses; fewer dropped balls.
- **Inputs / Required ERP data.** State changes across drives, schedules, threads, SoT signals, consent status.
- **Outputs.** Prioritised, grouped notifications; deep-links to the relevant action.
- **Expected Behaviour.** Event-driven (distinct from the scheduled Daily Brief); each notification links to a human-confirmed action; consent-aware delivery.
- **AI Behaviour.** Detects, prioritises, groups, summarises events.
- **User Workflow.** Event occurs → prioritised notification → officer acts via deep-link.
- **Permissions.** View + Trigger-AI; actions inherit feature permissions.
- **Dependencies.** All operational features, SoT, delivery channels.
- **Risks.** Alert fatigue → prioritisation, grouping, user-tunable thresholds.
- **Future Improvements.** Channel preferences; digest vs real-time per category.

## 7.18 Daily AI Brief
- **Purpose / Why it exists.** A scheduled morning summary of the day — drives, interviews, pending approvals, readiness alerts, threads needing reply.
- **User Problem.** The day starts with inbox/spreadsheet triage.
- **Business Value.** Start informed; nothing slips. **Value to cell:** the day, summarised, in one place.
- **Impact on students & recruiters.** Indirect — a better-run cell.
- **Inputs / Required ERP data.** State across drives, schedules, threads, readiness alerts, the day's notable notifications.
- **Outputs.** A prioritised, summarised brief (surfaced in the Placement Dashboard).
- **Expected Behaviour.** Scheduled and informational (distinct from real-time Notifications, which it aggregates); every item links to a human-confirmed action; acts on nothing.
- **AI Behaviour.** Summarizes, prioritizes.
- **User Workflow.** Morning → read brief → act on top items.
- **Permissions.** View + Trigger-AI.
- **Dependencies.** All operational features, Notifications, SoT.
- **Risks.** Becoming noise → keep it short and prioritised.
- **Future Improvements.** Scheduled push delivery; per-user tailoring.

### Consolidated Permission Matrix (least privilege; role key `placement`)
Y = allowed · — = not allowed · *gated* = only via consent/approval flow · soft = soft-delete only.

| Feature | View | Create | Edit | Delete | Approve | Export | Share | Trigger AI | Analytics | Sensitive |
|---|---|---|---|---|---|---|---|---|---|---|
| Placement Dashboard | Y | — | — | — | — | — | — | Y | Y | — |
| Readiness Analyzer | Y | — | — | — | — | Y | internal | Y | Y | *gated* |
| Resume Analyzer | Y | — | suggest | — | — | — | *gated* | Y | — | *gated* |
| Company Drive Mgmt | Y | Y | Y | soft | Y(offer) | Y | *gated* | Y | Y | *gated* |
| Eligibility Engine | Y | — | override+reason | — | Y(list) | Y | internal | Y | Y | *gated* |
| Interview Prep | Y | Y | Y | soft | — | — | internal | Y | — | — |
| Analytics Dashboard | Y | — | — | — | — | Y | internal | Y | — | — |
| Skill Gap Analyzer | Y | — | — | — | — | Y | internal | Y | Y | *gated* |
| CRM | Y | Y | Y | soft | — | Y | *gated* | Y | Y | *gated* |
| Comm Assistant | draft | draft | draft | — | — | — | *gated* | Y | — | *gated* |
| Report Generator | Y | — | — | — | — | Y | internal | Y | Y | — |
| Calendar/Schedule | Y | Y | Y | soft | — | — | internal | Y | — | — |
| Student Query Asst | own | — | — | — | — | — | — | Y | — | own |
| Offer/Internship | Y | Y | Y | soft | Y | Y | *gated* | Y | Y | *gated* |
| Industry Trends | Y | — | — | — | — | Y | internal | Y | Y | — |
| Recommendation Eng | Y | — | — | — | select | — | *gated* | Y | Y | *gated* |
| Notifications/Alerts | Y | — | — | — | — | — | — | Y | — | — |
| Daily AI Brief | Y | — | — | — | — | — | — | Y | Y | — |

Cross-cutting: no edit/delete of the academic SoT; deletes soft only; every external share and send is human-approved and consent-gated; AI-output overrides allowed but logged with reason; full audit everywhere.

---

# CHAPTER 3 — Experience & Requirements

## 8. User Journeys

**J1 — Run a new drive (the core loop).** Recruiter email arrives → TPO opens *New Drive*; AI parses the email into structured criteria → TPO confirms criteria → runs *Eligibility*; AI returns explained eligible/ineligible lists → TPO reviews, overrides two edge cases with reasons, approves the shortlist → opens *Comm Assistant*; AI drafts the invite → TPO edits and, after the consent gate confirms shareable students, sends → *Calendar* schedules rounds, flagging one student's clash → rounds run, outcomes recorded in *Drive Management* → offers logged in *Offer Tracking* → numbers flow to *Analytics* and the next *Report*.

**J2 — Pre-season readiness push.** TPO opens *Readiness*; cohort is 60% drive-ready → drills into *Skill-Gap*; the gap map shows communication + SQL as top gaps for target IT recruiters → exports a training plan → over weeks, *Readiness* climbs as prep progress and resume updates land → *Industry Trends* confirms demand, informing recruiter targeting via *CRM*.

**J3 — Student self-serve.** Student asks the *Query Assistant* "Am I eligible for the Infosys drive?" → assistant answers from the student's own data with the criteria and the student's values, scoped strictly to that student, with an "ask the cell" fallback for anything out of scope.

**J4 — Reporting & accreditation.** Quarter-end → TPO opens *Report Generator*, selects the NIRF placement section and period → AI assembles grounded numbers into the template → TPO reviews and signs off → supplies the table to IQAC, who draft the narrative (the cell does not).

**J5 — Daily operation.** Morning → *Daily Brief* summarises the day → through the day, *Notifications* surface a new recruiter email and an eligibility-impacting grade change → TPO acts on each via deep-links.

## 9. Conversation Flows (AI interaction patterns)

All flows share the contract: **grounded in the SoT; explainable; scoped by tenant + role; advisory; "I can't answer that from the data" fallback; no free-generated numbers; any external/adverse step routed to a human + consent gate.**

- **Eligibility (officer).** *"Who's eligible for the TCS drive?"* → AI restates the criteria it used → returns lists with per-row reasons → offers to draft the invite. Never says "I've rejected these students"; says "these don't meet the criteria — review and approve."
- **Analytics (officer).** *"What's our CSE placement rate vs last year?"* → grounded answer + chart + "how I read your question" → drill-down offered. If the data can't support it, says so plainly.
- **Drafting (officer).** *"Draft an invite for the shortlisted students."* → produces a draft → states it is a draft for review → reminds that external send needs consent confirmation.
- **Student query (student).** *"Why am I not eligible for X?"* → explains the specific unmet criterion from the student's own data → never reveals other students' data → escalates out-of-scope questions to the cell.
- **Recommendation (officer).** *"Who should I put forward for this analyst role?"* → ranked, explained matches → "select to proceed" (human selects; AI never forwards).
- **Refusal/fallback pattern.** Out-of-scope, ungrounded, or sensitive requests → clear decline with reason and a safe next step; for minors, no behavioural-profiling outputs.

## 10. Dashboard Widgets

**Operational (Placement Dashboard):** Daily Brief · Action Queue (approvals/decisions) · Active Drives (live status) · Today's Schedule · Recruiter Threads Awaiting Reply · Readiness Alerts · Consent-Pending Shares · Quick Actions (New Drive · Run Eligibility · Draft Message · Open Readiness) · Scoped NL Search · AI Chat (placement-scoped, grounded).

**Strategic (Analytics Dashboard):** Placement Rate · Package Distribution · Recruiter Breadth · Cohort/Branch Trends · YoY Comparison · Offer/Conversion Funnel · Drive Funnel · Trend-Shift Alerts · Export/Report launchers.

Every widget is tenant- and role-scoped; analytics widgets show definitions and last-updated/provenance; operational widgets deep-link to human-confirmed actions.

## 11. Navigation

Primary nav (placement role): **Dashboard · Drives · Eligibility · Readiness · Skill-Gap · Resumes · Interview Prep · CRM · Offers & Internships · Calendar · Communications · Analytics · Reports · Insights · Notifications.** A persistent **AI Chat** is available across the role, always scoped to placement data. The **Student Query Assistant** is a separate, student-role surface (own-data scope), not part of the placement-role nav. Consistent placement of the Action Queue, Brief, and consent indicators across screens.

## 12. Functional Requirements

1. Extend the role model with `placement`; route placement features to it; enforce server-side role scoping (never trust client-supplied scope).
2. Eligibility, readiness, and recommendations must be **explainable** — every decision exposes the rules/signals and values behind it; no opaque scores.
3. AI is **advisory** across all features: no auto-reject, no auto-forward, no auto-send, no auto-share; high-stakes paths require human approval.
4. **External sharing of any student data is consent-gated, per-purpose/per-drive, and logged.**
5. NL features are **grounded** in the governed semantic layer over the SoT, read-only, tenant-scoped, with a "can't answer from the data" fallback; never generate numbers free-hand.
6. Placement operational records (drives, CRM, calendar, offers) are CRUD within scope; the academic SoT is **read-only** to this role; deletes are soft.
7. Reports and analytics **reconcile to the SoT**; the Report Generator supplies accreditation *data*, not narratives.
8. The Student Query Assistant is strictly **own-data scoped**; cross-student access is impossible by construction.
9. All AI-output overrides are permitted but **logged with a reason**; all actions are audited.
10. Reuse the existing foundation (auth, multi-tenancy/RLS, Student 360, ingestion, audit, risk-engine explainability) rather than re-implementing it.

## 13. Non-Functional Requirements

- **Multi-tenancy & isolation:** hard tenant isolation via Postgres RLS with server-injected tenant context; every query and AI answer provably scoped to one tenant.
- **Security & least privilege:** field-level access where needed; full audit; SSO/MFA for privileged users (inherited).
- **Privacy/compliance (DPDP):** data minimisation (pull only what a drive needs); consent lifecycle for external sharing; retention limits; minor-handling (no behavioural profiling of under-18s); independent legal review before GA.
- **Performance:** NL queries and eligibility runs fast under placement-season peaks; analytics on a decoupled read path; eligibility issues a bounded number of queries regardless of cohort size (reuse the risk-engine's batch-aggregate discipline).
- **Reliability & integrity:** idempotent operations; no partial writes; numbers reconcile; provenance retained.
- **Explainability & trust:** evidence shown behind every flag/answer; no black-box scores; grounded fallback.
- **Usability:** natural-language-first; mobile-responsive web (full native apps post-V1); accessible.
- **Auditability:** every action, override, share, and AI suggestion-accepted is logged.
- **Scalability:** region-pinned (India for V1), region-agnostic architecture for later expansion.

---

# CHAPTER 4 — Architecture, Data, Security

## 14. AI Architecture (high level)

The Placement Assistant adds an application layer over the existing platform; it does not introduce a parallel AI stack. Conceptually:

- **Governed semantic layer (the only surface the AI may query).** A read-only, tenant-scoped view of the SoT exposing placement-relevant entities and metrics. The LLM never sees raw tables and never emits raw SQL; tenant context is injected server-side from the authenticated session, never from model output. This is the single most important safety boundary (it is what makes NL answers tenant-safe and non-hallucinatory).
- **Orchestration layer.** Routes a request to the right capability (NL query, eligibility, drafting, recommendation, summarisation), assembles grounded context, calls the LLM, validates the output, and enforces the advisory contract (proposes, never acts).
- **Deterministic engines for high-stakes logic.** Eligibility and rule evaluation are **rules-based and deterministic** (reusing the risk-engine pattern), not left to the LLM — the LLM explains and drafts; the rules decide eligibility. This keeps eligibility auditable, reproducible, and dispute-free.
- **Retrieval for grounding.** Resume/JD/recruiter-context grounding via the platform's retrieval/vector capability (e.g. pgvector) so drafting and analysis cite real artifacts, not invented ones.
- **Explainability everywhere.** Each AI output carries its reasons/evidence; outputs that can't be grounded trigger the fallback rather than a guess.

**Trade-off decisions (recommended approach + justification):**
1. **Rules engine for eligibility, LLM for explanation/drafting** — not LLM-decided eligibility. *Justification:* eligibility is high-stakes, must be deterministic, auditable, and reproducible; an LLM deciding it would be unexplainable and legally fragile. *(Recommended.)*
2. **Semantic layer + read-only views, no model-generated SQL.** *Justification:* the #1 platform risk is cross-tenant leakage via NL→SQL; a governed layer with server-injected tenant context removes it. *(Recommended, non-negotiable.)*
3. **Advisory-only AI in V1 (no autonomous send/share/reject).** *Justification:* placement actions are externally visible and often irreversible (a recruiter email can't be unsent; a wrongly-excluded student is a real harm). Human-in-the-loop is the correct posture for V1. *(Recommended.)*
4. **Industry Trends external data is attributed and segregated from grounded internal facts.** *Justification:* external market data is the one place the assistant can't ground in the SoT; mixing it with institutional numbers would invite hallucinated "facts." *(Recommended; consider deferring to V1.2.)*

## 15. Data Requirements (conceptual — no schemas)

**Consumed read-only from the SoT / Student 360:** student identity & contact; academic eligibility signals (CGPA/aggregate, active backlogs, branch/programme, admission/gap year, attendance where required); skills & certifications; resumes; a coarse academic-risk flag; provenance/last-updated for every signal.

**Owned operational data (within the AI layer, this role):** drives & criteria; recruiter/company profiles & engagement history (CRM); placement calendar events; offers & internships; communications drafts/logs; readiness/skill-gap computations; consent records for external sharing; report artifacts.

**Never accessed by this role:** fees/financial records; health data; disciplinary detail beyond placement relevance; the detailed behavioural/risk reasoning of the Student Success Engine; other roles' confidential data outside placement scope; any *writable* access to the academic SoT.

**Data governance:** the college is Data Fiduciary; minimisation (pull only what a drive needs); consent lifecycle for external sharing (give/withdraw, logged, per-purpose); retention limits with advance-notice deletion; minor-data segregation and no behavioural profiling of under-18s; region-pinned storage (India, V1). Every row carries tenant + source + provenance for isolation and audit.

## 16. API Summary (high level — endpoint families, not contracts)

Conceptual capability groups exposed to the placement role (all JWT-authenticated, tenant- and role-scoped, audited). Concrete contracts are out of scope for this document.

- **Drives & eligibility:** create/manage drives; parse criteria (AI, human-confirmed); run eligibility (draft, explained); approve shortlist.
- **Readiness & skill-gap:** compute/read readiness and gap maps; export training plans.
- **Resume:** analyze/optimize (suggestions); manage versions.
- **CRM:** manage recruiter accounts, contacts, engagement history.
- **Calendar:** manage placement events; conflict detection.
- **Offers & internships:** record/track offers, acceptance, conversions.
- **Communications:** draft messages (AI); human-confirmed send (consent-gated).
- **Analytics & reports:** grounded NL query; KPI/trend reads; report generation/export.
- **Insights & recommendations:** trends; student↔drive matches (proposals).
- **Notifications & brief:** event-driven alerts; scheduled brief.
- **Student query (student role):** own-data scoped Q&A.
- **Consent:** record/withdraw/check consent for external sharing.

Reused unchanged: auth/session, tenant context, audit, Student 360 reads.

## 17. Security Considerations

- **Tenant isolation:** RLS + server-injected tenant context on every path; no model-supplied tenant/scope; meta-tested coverage (reuse existing RLS coverage discipline).
- **Role scoping:** server-side; `placement` sees only placement scope; the Student Query Assistant is hard-scoped to the asking student's own data (cross-student access impossible by construction — the top risk for that feature).
- **Least privilege:** read-only on academics; CRUD only on owned operational records; soft deletes; per-feature permission matrix (§Chapter 2) enforced server-side, with the client matrix as UX guard only.
- **External-sharing consent gate:** no student data leaves the institution without explicit, logged, per-purpose consent; recipient validation on every external send.
- **NL safety:** governed semantic layer only; no raw SQL from the model; query grounding + fallback; adversarial/red-team testing of the NL path before GA.
- **PII handling:** resumes, contacts, recruiter contacts are sensitive; access-controlled, audited, minimised, region-pinned.
- **DPDP:** consent lifecycle; minor-handling (no behavioural profiling of under-18s; advisory + human-in-the-loop); retention/deletion; legal review before GA.
- **Audit:** every action, override, share, send, and accepted AI suggestion logged with actor, tenant, and reason where applicable.
- **AuthN/Z:** SSO/MFA for privileged users (inherited); JWT-scoped sessions.

## 18. Error Handling (behavioural expectations)

- **Ungroundable NL query:** return the explicit "I can't answer that from the data" fallback; never fabricate a number or a fact.
- **Ambiguous/mis-parsed drive criteria:** require human confirmation before eligibility runs; surface what was parsed and ask.
- **Stale or missing source signals:** show provenance/last-updated; flag low-confidence; do not silently compute on gaps.
- **Eligibility data conflict:** surface the conflict and the precedence applied; never silently pick a value.
- **Consent missing/withdrawn at send time:** block the external send, explain why, route to obtain consent.
- **LLM failure/timeout:** degrade gracefully — deterministic features (eligibility rules, record CRUD) remain available without the LLM; AI assists are clearly marked unavailable, never silently wrong.
- **Permission denied:** clear, non-leaking message (e.g. faculty-scope/own-data violations return not-found rather than revealing existence).
- **Partial failures in batch (e.g. cohort readiness):** record per-item errors, never abort the whole batch, summarise outcomes.

## 19. Edge Cases

- **Under-18 (minor) student** in a drive: adult-default handling does not apply — consent gating + no behavioural profiling; academic/skill signals only.
- **Student with multiple offers / offer declined / internship→PPO conversion:** tracked distinctly; no double-counting in reports.
- **Borderline eligibility** (e.g. CGPA at the cut-off boundary, backlog cleared mid-drive): flagged for human review, not auto-decided.
- **Recruiter changes criteria mid-drive:** re-run eligibility; preserve prior shortlist with versioned reasons.
- **Cross-drive scheduling clash** for a student sitting several drives: conflict flagged; human resolves.
- **Student consent withdrawn after shortlisting but before share:** student removed from the external share; logged.
- **Eligible student the officer wants to exclude (or vice-versa):** override allowed, reason mandatory and logged.
- **Recruiter requests data the cell shouldn't share** (e.g. fees, health): blocked by data-access boundaries regardless of request.
- **Two source systems disagree on a student's CGPA/backlogs:** surfaced as a conflict with precedence; eligibility shows which value and why.
- **NL question about another student** via the Student Query Assistant: refused by scope, not answered.
- **Industry-trends external source unavailable/unverifiable:** present internal grounded data only; clearly note external data is unavailable rather than guessing.

---

# CHAPTER 5 — Metrics, Testing, Delivery

## 20. Success Metrics

**Outcome (business):** placement rate ↑; median/highest package ↑; recruiter breadth (distinct active recruiters) ↑; offer-to-acceptance and internship-to-PPO conversion ↑.

**Efficiency (operational):** drive turnaround (criteria-in → approved shortlist) ↓ from hours/days to minutes; report assembly time ↓; routine student queries deflected by the Query Assistant ↑.

**Quality & trust:** eligibility disputes → ~zero (no eligible student wrongly excluded, no ineligible one forwarded); report numbers reconcile to the SoT with no manual rework; recruiter satisfaction ↑.

**AI quality:** grounded-answer rate ↑; hallucination/ungrounded-number incidents → ~zero (hard target); fallback used appropriately rather than guessing; explanation-coverage = 100% of eligibility/readiness/recommendation outputs.

**Compliance:** 100% of external shares consented and logged; zero cross-tenant or cross-student leakage; zero behavioural-profiling outputs for minors.

**Adoption:** weekly active placement users; % of drives run through the system vs spreadsheets; AI-suggestion acceptance rate (with override reasons captured).

## 21. Testing Checklist

**Functional.** Drive lifecycle end-to-end; eligibility correctness against varied criteria (CGPA, backlog, branch, attendance, gap/year) with explanations; readiness/skill-gap computation; resume suggestions (no fabrication); CRM/calendar/offer CRUD; report assembly reconciles to SoT; recommendations ranked + explained.

**AI behaviour.** Grounded answers; fallback fires when ungroundable; no free-generated numbers; explanations present and correct; drafts never auto-send; recommendations never auto-forward; eligibility never auto-rejects.

**Security & isolation.** RLS/tenant isolation (no cross-tenant data on any path); role scoping (placement scope enforced server-side); Student Query Assistant own-data scoping (cross-student access impossible); permission matrix enforced server-side; audit entries for every action/override/share/send; adversarial/red-team NL testing for leakage.

**Compliance.** Consent gate blocks un-consented external shares; consent withdrawal removes student from share; minor-handling (no behavioural profiling; consent gating); retention/deletion behaviour; data-minimisation (only required signals pulled).

**Edge cases.** Every item in §19 has a test.

**Non-functional.** Performance under season peak; eligibility query-count bounded regardless of cohort size; graceful degradation when the LLM is unavailable (deterministic features still work); idempotency / no partial writes.

**Regression.** Existing foundation (auth, multi-tenancy, Student 360, ingestion, audit, risk engine) unaffected; existing RLS coverage meta-test still green.

## 22. Implementation Roadmap (phasing the 18 features realistically)

The 18 features are all in **V1 scope**, sequenced so each phase ships a coherent, usable slice. Dependencies drive the order (foundation → core loop → relationships/scheduling → reporting/insight).

**Phase 0 — Enablement (prerequisite).** Extend role model with `placement`; placement-scoped semantic-layer views over the SoT; consent records for external sharing; reuse auth/RLS/audit/Student 360. *Exit:* a placement user can log in, see scoped data, and consent is recordable.

**V1.0 — Core placement loop (highest value, drives daily use).**
Placement Dashboard · Company Drive Management · AI Eligibility Engine · Student Placement Readiness Analyzer · AI Email & Communication Assistant (draft-only) · AI Notifications & Alerts · Daily AI Brief.
*Rationale:* this is the irreducible loop — intake a drive, shortlist, communicate, stay on top of the day. Ships standalone value.

**V1.1 — Depth & relationships.**
Student Skill Gap Analyzer · Resume Analyzer & Optimizer · Interview Preparation Assistant · Company Relationship Management (CRM) · Placement Calendar & Schedule Manager · Offer & Internship Tracking.
*Rationale:* deepens readiness and recruiter management once the core loop is trusted.

**V1.2 — Insight, reporting & self-serve.**
Placement Analytics Dashboard · Placement Report Generator · Student Recommendation Engine · Student Query Assistant · Industry Trends & Hiring Insights.
*Rationale:* analytics/reporting need accumulated outcome data to be meaningful; the student-facing assistant and external-data Industry Trends carry the highest isolation/grounding risk and benefit from a hardened core first.

Each phase carries the cross-cutting conditions (advisory-only, consent-gated sharing, explainability, audit, no SoT writes) and a hardening pass before the next, consistent with the platform's phased-delivery discipline.

## 23. Future Scope (post-V1)

- **Recruiter self-service portal** (drives, schedules, feedback) with consent-gated student-data exposure.
- **Channel-integrated communications** (email/WhatsApp) with human-confirm send.
- **Predictive placement & "drive-ready by date" forecasting;** outcome-calibrated recommendation and fairness dashboards.
- **ML-calibrated eligibility-adjacent matching** (eligibility itself stays deterministic).
- **Sub-role separation** (`placement_head` approver vs `placement_coordinator` operator) and field-level access at scale.
- **LMS/training-provider integration** for gap-to-course recommendations.
- **Curated, licensed market-data integrations** for Industry Trends.
- **Voice/video mock interviews;** multilingual student assistant.
- **Alumni-network and cross-institution benchmarking** (region-aware, post India-first).

---

*End of RSDD. This document is the single design reference for the Placement Cell AI Assistant. It is intentionally free of API contracts, schemas, infrastructure diagrams, and code — those are produced in the design phase that follows, against this reference. Open prerequisites to ratify before build: (1) the `placement` role-model extension; (2) the external-sharing consent gate; (3) DPDP legal review before GA; (4) confirmation of the 18-feature V1 scope and its V1.0/V1.1/V1.2 phasing.*
