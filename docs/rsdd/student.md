# Student_AI_Complete_Design_v1.0

**Version:** v1.0  
**Generated:** June 27, 2026

---

This document combines the **Role Definition & Feature Freeze** and the **Role Solution Design Document (RSDD)** for the Student AI Assistant.

---

# Role Definition & Feature Freeze — Student AI Assistant

**Product:** AI ERP Copilot — Enterprise AI Intelligence Layer for Higher Education
**Phase:** 1 — Product Definition (no implementation/architecture in this document)
**Role:** Student AI Assistant (1 of 6 V1 personas)
**Status:** Draft for Feature Freeze — pending sign-off
**Document owner:** Product

> **Reading note.** This document inherits three locked product decisions and never contradicts them: (1) the ERP remains the **System of Record**; our product is the **System of Intelligence** and is **read-only/advisory in v1** — AI suggests, humans act, AI never writes to the ERP and takes no autonomous action; (2) **DPDP Act 2023** governs, and §9(3) prohibits tracking, behavioural monitoring, and detrimental profiling of **children (under 18)** — *not waived by parental consent* — while education has a partial *consent* exemption only, **not** a harm-prohibition exemption; (3) **adaptive learning / AI tutoring / content authoring** is explicitly out of v1 scope per the Definitive Design ("adjacent layer; partner, don't build"). Where the requested feature list collides with these, the conflict is flagged in §4 and resolved in §12 **before** the freeze.

---

## 1. Role Overview

### Why this role exists
Every other persona in the platform (Faculty, HOD, Principal, Management, Placement Cell) looks at students *in aggregate or from the outside*. The Student AI Assistant is the only surface that serves the student **about themselves** — turning the institution's scattered systems (attendance biometric, internal marks, fee ledger, timetable, LMS, placement records) into one plain-language view of *"how am I doing, and what should I do next."* Today a student has no single place to ask that question; they chase WhatsApp groups, notice boards, and clerks. This role closes that gap **without becoming a new ERP and without exposing anyone else's data**.

### Responsibilities (of the role, as a product surface)
- Give each student a single, trustworthy, plain-language view of **their own** academic standing.
- Answer self-service questions ("how many DBMS classes can I still miss?") grounded only in the student's own records — never invented numbers.
- Surface timely, specific, *constructive* nudges (attendance slipping, fee due, assessment approaching) so problems are caught early.
- Help the student organise their own effort (planning, deadlines, exam preparation) and their own career artefacts (resume), strictly as an advisory aide.
- Route the student to the right human (mentor, office, placement cell) rather than acting on the institution's behalf.

### Business objectives
- **Adoption / stickiness:** the student-facing copilot is the highest-frequency surface in the product; daily student use is what makes the platform feel alive and justifies institutional renewal.
- **Retention outcomes:** earlier student self-awareness complements the faculty-facing Student Success Engine — the same signal, surfaced constructively to the student, supports the institution's retention and pass-rate goals.
- **Reduced administrative load:** self-service answers deflect routine queries away from faculty/office staff.
- **Differentiation:** an NL-native, India-higher-ed student copilot that is DPDP-correct is a clear gap in the competitive field.

### Daily workflow (of a student using the assistant)
1. Opens the app → reads the **Daily AI Brief** (today's classes, attendance status, anything due, any nudge).
2. Checks **attendance** standing and how much margin remains against the 75% norm.
3. Asks a free-text question about their own marks / timetable / fees.
4. Acts on a nudge (plans study time, sets a reminder, opens a campus info answer).
5. Periodically (not daily): works on career artefacts (resume feedback), reviews performance trends.

### Success criteria
- **Engagement:** % of enrolled students who open the brief at least weekly; questions asked per active student.
- **Trust:** answer-grounding rate (every numeric answer traceable to a real record); "I can't answer that from your data" fallback used instead of guessing.
- **Outcome correlation:** students who act on attendance/fee nudges show measurably fewer threshold breaches.
- **Deflection:** measured reduction in routine queries to office/faculty.
- **Safety:** zero cross-student data exposure; full DPDP compliance for minors.

### Problems this role faces today
- **No single view:** standing is scattered across biometric portals, marks sheets, fee receipts, timetables, and notice boards.
- **Late awareness:** a student often learns they're below the attendance threshold only when detained — too late to recover.
- **Navigation pain:** legacy ERP student portals are menu-heavy, mobile-hostile, and rarely used.
- **Information asymmetry:** "how many classes can I still miss?", "what's my fee status?" require a clerk or a faculty member.
- **No constructive framing:** where data exists, it's presented as raw records, not as "here's what it means and what to do."

### How AI improves this role
- **Natural language over menus:** ask in plain English/Indic language instead of navigating the ERP.
- **Grounding, not generation:** answers are computed from the student's own canonical record via the governed semantic layer — never hallucinated.
- **Proactive, constructive nudges:** the platform surfaces the *meaning* of a signal ("attendance 61%, below 75% — here's the recovery path") rather than a raw number.
- **Summarisation:** the Daily Brief compresses many sources into one glance.
- **Self-organisation aids:** planning and exam-readiness support, kept advisory and academic-integrity-safe.

---

## 2. Role Goals

**Business Goals**
- Drive daily student engagement as the platform's highest-frequency surface.
- Support institutional retention and pass-rate goals by raising student self-awareness early.
- Strengthen renewal/expansion by making the platform visibly useful to the largest user population (students).

**Operational Goals**
- Deflect routine status queries from faculty and office staff.
- Provide a consistent, correct, single source of "my standing" so students stop chasing multiple systems.
- Route students to the correct human/office for anything the assistant cannot (and should not) resolve.

**Productivity Goals**
- Cut the time a student spends finding their own attendance/marks/fee/timetable status to seconds.
- Help students plan their own effort (deadlines, study time, exam prep) in one place.

**AI Goals**
- Answer self-service questions grounded strictly in the student's own data, with explainable reasoning.
- Summarise multi-source status into a single daily brief.
- Surface forward-looking, advisory signals (e.g. attendance projection) without opaque scoring.

**Automation Goals**
- Automate *information delivery* only: briefs, reminders, consent-aware notifications.
- Explicitly **no** automation of any decision, adverse action, or write-back to the ERP. (Automation here = surfacing, never acting.)

**Decision Support Goals**
- Help the *student* make their own decisions (attend the next N classes, pay by date, prepare for X) with clear, evidence-backed prompts.
- Never make institutional decisions and never expose institution- or cohort-level decision data.

---

## 3. User Profile

**Who uses this role**
Enrolled students of the institution — UG and PG. A large share of first-year UG students are **17 (minors under DPDP)**; this is not an edge case, it is a primary segment and shapes the whole role.

**Technical expertise**
Low to moderate; mobile-first, consumer-app expectations. Comfortable with chat interfaces and notifications; intolerant of menu-heavy ERP UX. Assume the lowest-friction path wins.

**Daily activities**
Check today's classes and attendance margin; read the daily brief; ask occasional questions about own marks/fees/timetable; act on nudges; (periodically) plan study, prep for exams, work on resume.

**Pain points**
- Standing scattered across many systems; no single answer.
- Learns about problems (attendance shortfall, fee due) too late.
- Old portals are unusable on a phone.
- Has to ask a human for simple status facts.

**Current ERP frustrations**
Multiple logins, no plain-language answers, no proactive alerts, poor mobile experience, raw data with no interpretation.

**Information required**
Own attendance (and margin vs norm), own internal marks and trend, own timetable, own fee status/dues, own enrolment/course details, own placement-readiness view, campus/institutional information (calendar, policies, contacts), and notifications addressed to them.

**Authority level**
**Lowest-privilege persona in the platform.** Read-only on their own data; can create only personal artefacts (questions, plans, reminders, uploaded resume). **No approval authority. No access to any other person's data. No access to institutional aggregates.**

**Decision-making responsibilities**
Personal only — managing their own attendance, study, fees-on-time, and preparation. The assistant supports these personal decisions; it carries **no** institutional decision rights.

---

## 4. Feature Catalog

> Each feature is defined as requested. Where a feature collides with a locked decision (read-only/advisory, DPDP minors, "partner-don't-build" learning layer, or cross-role overlap with the Placement Cell persona), the conflict is named here and **resolved in §12 before the freeze**. Nothing is silently dropped or reshaped.

### 4.1 AI Academic Assistant
- **Purpose:** Plain-language Q&A and explanation over the student's own academic record.
- **Problem solved:** Students can't get simple answers without chasing humans or menus.
- **Business value:** Deflection; daily engagement; trust in the platform.
- **User value:** "Ask anything about *my* academics" in seconds.
- **Inputs:** Student's own canonical record (attendance, marks, enrolment, timetable, fees) via the governed semantic layer; the NL question; authenticated student + tenant context.
- **Outputs:** Grounded answer + relevant figures + a short "how I read your question" explanation.
- **Dependencies:** NL/semantic layer; Unified Student 360 (own record only); RLS scoping to self.
- **AI involvement:** High — NL → semantic-layer read → grounded response with hallucination fallback.
- **Expected behaviour:** Answers only from the student's own data; says "I can't answer that from your data" rather than guessing; never returns another student's data.
- **Permissions:** View own; Trigger AI on own data. No create/edit/delete of institutional data.
- **Limitations:** Read-only; no cross-student/aggregate answers; no ERP write-back.
- **Future enhancements:** Indic-language Q&A; voice input.

### 4.2 Timetable Assistant
- **Purpose:** Surface and answer questions about the student's own schedule.
- **Problem solved:** Timetable changes/clashes are communicated poorly.
- **Business value:** Engagement; fewer "what's my next class" queries.
- **User value:** "What's on today / this week / where" at a glance and on demand.
- **Inputs:** Student's enrolment + institutional timetable data; NL question.
- **Outputs:** Today/upcoming schedule; answers to schedule questions; feeds the Daily Brief.
- **Dependencies:** Timetable data in the canonical layer (integration-dependent — flag if not yet ingested); NL layer.
- **AI involvement:** Medium — retrieval + NL formatting.
- **Expected behaviour:** Reflects only the student's own schedule; read-only.
- **Permissions:** View own; Trigger AI on own data.
- **Limitations:** Cannot edit the timetable; depends on timetable being available as a source.
- **Future enhancements:** Calendar export/sync; change alerts.

### 4.3 Attendance Intelligence
- **Purpose:** Show the student their own attendance standing and *margin* against the institution's norm (e.g. 75%).
- **Problem solved:** Students discover shortfalls too late to recover.
- **Business value:** Directly supports retention/detention-avoidance; complements the faculty Student Success Engine.
- **User value:** "How am I doing, and how many more classes can I miss?"
- **Inputs:** Own attendance records; tenant attendance norm/config.
- **Outputs:** Current %, margin to threshold, subject-wise breakdown, constructive framing.
- **Dependencies:** Attendance signal (already computed by the Success Engine); semantic layer.
- **AI involvement:** Medium — computation is deterministic; NL explanation on top.
- **Expected behaviour:** Constructive, specific, non-alarming framing. **Does not expose the student's internal risk *tier/score*** (see §10 boundary note) — surfaces the underlying signal and what to do.
- **Permissions:** View own; Trigger AI on own data.
- **Limitations:** Read-only; own data only.
- **Future enhancements:** Per-subject recovery planning.

### 4.4 Attendance Prediction
- **Purpose:** Forward-looking, advisory projection of where attendance is heading ("at this rate you'll cross/miss the threshold by X").
- **Problem solved:** Students react late; a projection prompts earlier action.
- **Business value:** Earlier self-correction → retention.
- **User value:** "If I keep going like this, what happens?"
- **Inputs:** Own attendance history + remaining sessions + norm.
- **Outputs:** Advisory projection with the assumptions shown.
- **Dependencies:** Attendance Intelligence; forecasting capability (note: the Definitive Design treats forecasting as a later **Predictive Analytics** module — see §11/§12 versioning).
- **AI involvement:** Medium — a deterministic rule-based projection is feasible early; ML forecasting is a later module.
- **Expected behaviour:** Advisory only; assumptions transparent; **academic signal only** (DPDP-safe for minors); never an automated adverse action.
- **Permissions:** View own; Trigger AI on own data.
- **Limitations:** A projection, not a guarantee; read-only.
- **⚠ DPDP / scope flag:** For minors, must remain advisory educational processing, not detrimental profiling. **Versioning recommendation in §12** (deterministic projection V1.5; ML forecast V2).
- **Future enhancements:** ML-based, multi-signal forecast (V2 predictive module).

### 4.5 AI Study Planner
- **Purpose:** Help a student organise their own study time around deadlines and weak areas.
- **Problem solved:** Students struggle to plan; effort is unstructured.
- **Business value:** Engagement; supports outcomes indirectly.
- **User value:** A personal, adjustable study plan.
- **Inputs:** Student's own deadlines/timetable + self-identified goals; (optionally) own marks to highlight weak subjects.
- **Outputs:** A draft, editable study plan / schedule.
- **Dependencies:** Timetable + (optionally) marks; NL layer.
- **AI involvement:** Medium-High — generative planning.
- **Expected behaviour:** A *suggestion the student edits*; the student owns and controls the plan; nothing is enforced or reported to staff.
- **Permissions:** View/Create/Edit/Delete own plan; Trigger AI.
- **Limitations:** Personal aid only; not a commitment tracked by the institution.
- **⚠ Scope flag:** Edges toward the "adaptive learning" adjacent layer. Kept in scope **only** as a personal scheduling aid (not adaptive courseware). See §12.
- **Future enhancements:** Plan adherence reminders; integration with LMS deadlines.

### 4.6 AI Tutor
- **Purpose (as requested):** Explain subject concepts / tutor the student on course content.
- **Problem solved:** Students want on-demand help understanding material.
- **User value:** "Explain this concept to me."
- **AI involvement:** High — subject-matter generation.
- **❌ Locked-scope conflict:** **Directly collides** with the Definitive Design's explicit v1 exclusion: *"AI tutoring / adaptive courseware — adjacent layer; partner, don't build."* It is a *learning-layer* product, not an intelligence layer *on top of the ERP*; it reads no institutional record; subject-matter generation carries hallucination and pedagogy-quality risk; and for minors it adds content-safety exposure. **Resolution in §12: defer to V2 as a partner integration, or ship a clearly-labelled general "Concept Explainer" only if explicitly re-approved.** Defined here so it is on record, not built in V1.
- **Permissions (if ever shipped):** Trigger AI on own request; no institutional data.
- **Limitations:** Not grounded in the SoT; outside the "additive, read-only ERP layer" thesis.
- **Future enhancements:** Partner LMS/tutoring integration (V2+).

### 4.7 Assignment Assistant
- **Purpose (as requested):** Help the student with assignments.
- **Problem solved (intended):** Students juggle multiple assignment deadlines and need help getting started.
- **User value:** Stay on top of (and make progress on) assignments.
- **AI involvement:** Medium-High.
- **⚠ Academic-integrity + scope conflict:** "Assignment Assistant" reads as "generate my submission," which is an **academic-integrity and reputational landmine** for a product sold *to institutions*, and content generation again sits in the "partner, don't build" learning layer. **Resolution in §12: rename + narrow to "Assignment Tracker / Planner"** — surface assignment deadlines (from LMS/timetable), break work into a plan, send reminders — **not** generate submittable answers.
- **Permissions:** View own deadlines; Create/Edit own plan & reminders.
- **Limitations:** No generation of graded/submittable work; depends on assignment data being available as a source.
- **Future enhancements:** LMS deadline sync; submission-status visibility (read-only).

### 4.8 Notes Generator
- **Purpose (as requested):** Generate study notes for the student.
- **User value:** Condensed notes to revise from.
- **AI involvement:** High — content generation.
- **⚠ Scope conflict:** Content authoring → "partner, don't build" learning layer; not grounded in the SoT. **Resolution in §12: merge with Quiz Generator into a single "Study Material Helper," scope V1 to *summarising the student's own provided/LMS material* (grounded) rather than free generation, and otherwise defer to V2.**
- **Permissions:** Create/Edit/Delete own notes; Trigger AI.
- **Limitations:** Quality/accuracy risk on free generation; not institutional content.
- **Future enhancements:** LMS-content-grounded summaries (V2).

### 4.9 Quiz Generator
- **Purpose (as requested):** Generate practice quizzes for self-testing.
- **User value:** Practice and self-assessment.
- **AI involvement:** High — content + assessment generation.
- **⚠ Scope conflict:** Same as Notes Generator — content/assessment authoring is the adjacent learning layer and is explicitly out of v1 scope; also overlaps proctored-exam/assessment territory (excluded). **Resolution in §12: merge into "Study Material Helper," defer to V2 (partner/LMS-grounded).**
- **Permissions:** Create/Trigger AI on own practice; results private to the student.
- **Limitations:** Self-practice only; never an institutional assessment; never reported to staff.
- **Future enhancements:** Grounded practice from the institution's own question banks via LMS (V2).

### 4.10 Exam Readiness Analyzer
- **Purpose:** Give the student an advisory read on how prepared they are for upcoming assessments, from their own academic signals.
- **Problem solved:** Students lack an objective sense of preparedness.
- **Business value:** Engagement; nudges earlier preparation.
- **User value:** "Am I on track for this exam, and where are my gaps?"
- **Inputs:** Own internal marks, attendance, assessment calendar.
- **Outputs:** A transparent readiness view by subject (components shown, **no opaque score**) + suggested focus areas.
- **Dependencies:** Academic + attendance signals; assessment calendar.
- **AI involvement:** Medium — deterministic signal + NL framing.
- **Expected behaviour:** Explainable, advisory, constructive; **academic signal only** (DPDP-safe).
- **⚠ DPDP flag:** For minors, keep advisory + transparent; avoid any black-box "readiness score."
- **Permissions:** View own; Trigger AI on own data.
- **Limitations:** Advisory; read-only.
- **Future enhancements:** Tie into Study Planner focus areas.

### 4.11 Performance Analytics
- **Purpose:** Show the student trends in their **own** marks/attendance over time.
- **Problem solved:** Raw marks sheets don't reveal trajectory.
- **Business value:** Engagement; self-awareness supporting retention.
- **User value:** "How am I trending?"
- **Inputs:** Own historical marks/attendance.
- **Outputs:** Personal trend charts + plain-language narration.
- **Dependencies:** Student 360 (self); semantic layer.
- **AI involvement:** Medium — analytics + NL narration.
- **Expected behaviour:** Own data only; constructive framing; no peer comparison/ranking (privacy + minor-profiling concern).
- **Permissions:** View own; View own analytics; Trigger AI; Export own.
- **Limitations:** No cohort comparison; read-only.
- **Future enhancements:** Goal-tracking against the student's own targets.

### 4.12 Career Roadmap Generator
- **Purpose (as requested):** Generate a forward-looking career path/roadmap for the student.
- **User value:** Direction and next steps for their career.
- **AI involvement:** High — generative + forward-looking.
- **⚠ DPDP + overlap conflict:** Forward-looking *career profiling of a minor* is sensitive under §9(3); the feature is generative and not grounded in the SoT; and it partially overlaps the **Placement Cell** persona. **Resolution in §12: V2, advisory only, with legal review; for minors treat as non-detrimental educational guidance, never profiling.**
- **Permissions:** Trigger AI on own request; own artefact.
- **Limitations:** Advisory; not grounded in institutional records; not a placement guarantee.
- **Future enhancements:** Ground against the institution's own placement-outcome data (V2+).

### 4.13 Resume Analyzer
- **Purpose:** Advisory feedback on a resume the student uploads.
- **Problem solved:** Students get little structured resume feedback.
- **Business value:** Placement-readiness support; engagement.
- **User value:** "Make my resume stronger."
- **Inputs:** The student's **own uploaded resume** (consented document); no institutional placement data.
- **Outputs:** Structured, advisory feedback.
- **Dependencies:** Document handling; NL layer. **Not** dependent on Placement-Cell-managed data (see §10 boundary).
- **AI involvement:** High — analysis + suggestions on a student-provided doc.
- **Expected behaviour:** Operates only on the student's uploaded document; advisory.
- **Permissions:** Create/Edit/Delete own upload; Trigger AI; Share own (student's choice).
- **Limitations:** No access to placement-cell records; advice only.
- **⚠ DPDP flag:** Minor's uploaded document = personal data; consent + retention rules apply.
- **Future enhancements:** Role-targeted feedback; V2.

### 4.14 Placement Readiness Score
- **Purpose (as requested):** A score telling the student how placement-ready they are.
- **User value:** A sense of readiness for placements.
- **AI involvement:** High — composite scoring.
- **⚠ DPDP + overlap + "no black-box scores" conflict:** A *score on a student* — especially a minor — is exactly the opaque-profiling pattern the design warns against ("avoid black-box scores"); it overlaps the **Placement Cell** persona, which owns the placement process and cohort analytics. **Resolution in §12: rename to an explainable "Placement Readiness Checklist/Indicator"** (transparent components, no single opaque number), bound to the student's **own** view, DPDP-gated for minors, with the *process/cohort* side owned by Placement Cell. Target **V2**.
- **Permissions:** View own; Trigger AI on own data.
- **Limitations:** No access to drive/company/cohort data (Placement Cell's domain); advisory.
- **Future enhancements:** Component-level guidance tied to the checklist (V2).

### 4.15 Campus Information Assistant
- **Purpose:** Answer general institutional questions (calendar, policies, fee schedules, office contacts, procedures).
- **Problem solved:** This information is buried in notices/PDFs/people.
- **Business value:** Deflection; engagement.
- **User value:** "When do exams start / what's the leave policy / who do I contact for X."
- **Inputs:** Institution's published/general information (RAG over a curated, non-personal knowledge base); NL question.
- **Outputs:** Grounded answer with source/where-to-go.
- **Dependencies:** A curated institutional knowledge base; NL/RAG.
- **AI involvement:** Medium-High — retrieval-grounded answering.
- **Expected behaviour:** Answers only from approved institutional content; grounded; says when it doesn't know.
- **Permissions:** View (general institutional info); Trigger AI. No personal data of others.
- **Limitations:** Only as good as the curated KB; no personal/other-student data.
- **Future enhancements:** Multilingual; broader KB coverage.

### 4.16 Smart Notifications
- **Purpose:** Deliver timely, consent-aware nudges (attendance margin, fee due, assessment approaching, timetable change, info addressed to the student).
- **Problem solved:** No proactive nudges today; problems caught late.
- **Business value:** Engagement; earlier action → retention.
- **User value:** "Tell me what I need to know, when I need it."
- **Inputs:** The student's own signals + delivery preferences + consent state.
- **Outputs:** Multi-channel notifications (app/email/SMS as configured), **consent-aware**.
- **Dependencies:** Signals; notification/delivery service; consent framework.
- **AI involvement:** Medium — prioritisation + phrasing.
- **Expected behaviour:** Addressed to the student about their own data; constructive; **for minors, any parent-directed notification is governed by the platform's consent gate and is never auto-sent.**
- **Permissions:** View/Trigger own; Edit own notification preferences.
- **Limitations:** No notifications about other people; respects consent + quiet hours.
- **⚠ DPDP flag:** Parent-directed messaging for minors flows through the platform's existing consent gate, not this student surface.
- **Future enhancements:** WhatsApp channel; smarter prioritisation.

### 4.17 Daily AI Brief
- **Purpose:** A single morning summary across the student's own data (today's classes, attendance status, anything due, top nudge).
- **Problem solved:** No single glanceable "what matters today."
- **Business value:** The habit-forming, highest-frequency surface → adoption.
- **User value:** "One glance and I know my day."
- **Inputs:** Timetable, attendance, fees, assessments, notifications — all own.
- **Outputs:** A short, prioritised, plain-language daily summary.
- **Dependencies:** Most other read features; summarisation.
- **AI involvement:** High — multi-source summarisation + prioritisation.
- **Expected behaviour:** Own data only; concise; constructive; deterministic facts, AI phrasing.
- **Permissions:** View own; Trigger AI on own data.
- **Limitations:** Read-only; own scope only.
- **Future enhancements:** Personalised timing; end-of-week recap.

---

## 5. Dashboard Overview

The student "home" is the **Daily Brief**, not a data console — mobile-first, glanceable.

- **Widgets:** Daily Brief (top), Attendance margin meter, Next classes (timetable), Fee status, Upcoming assessments, "Ask me anything" entry.
- **Cards:** Attendance standing; Fee due; Performance trend snapshot; Exam readiness snapshot; Placement-readiness checklist (V2).
- **Charts:** Personal attendance trend; personal marks trend. (No peer comparison/ranking — privacy + minor-profiling.)
- **Quick Actions:** Ask a question; Set a reminder; Open study plan; Upload/check resume; View timetable; Contact-the-right-office shortcut.
- **Notifications:** Consent-aware nudge centre (attendance, fees, deadlines, info).
- **KPIs (student-facing, personal only):** Attendance % and margin; fee status; assessment-readiness signal; assignment/deadline count. *(No risk tier/score shown — see §10.)*
- **Search:** Scoped strictly to the student's own data + general campus info.
- **AI Chat:** Always-available NL copilot, grounded in own data + campus KB, with hallucination fallback.
- **Navigation:** Flat and minimal (Brief · Academics · Timetable · Fees · Career · Ask) — the copilot does the navigating.
- **Daily Summary:** = the Daily AI Brief (the centrepiece).

---

## 6. AI Capabilities (and why each exists)

- **Generate** — study plans, resume feedback, (V2) study material/career roadmap. *Why:* help the student organise and improve their own effort and artefacts. *(Subject-matter/content generation deferred per §12.)*
- **Summarize** — Daily Brief; "explain my standing." *Why:* collapse many sources into one glance; the core adoption driver.
- **Predict** — advisory attendance projection (deterministic V1.5; ML V2). *Why:* prompt earlier self-correction. *(Academic signal only, DPDP-safe.)*
- **Recommend** — next personal actions ("attend the next N classes," "pay by date," "focus on these subjects"). *Why:* turn awareness into action.
- **Automate** — *information delivery only* (briefs, reminders, consent-aware notifications). *Why:* timeliness without any decision-making or write-back. **No action automation — locked.**
- **Explain** — "how I read your question"; why a nudge fired. *Why:* trust and DPDP transparency; no black-box outputs.
- **Analyze** — personal performance/attendance trends; exam readiness. *Why:* self-awareness from raw records.
- **Compare** — *self-over-time only* (this term vs last). *Why:* trajectory matters; **peer comparison is excluded** (privacy + minor profiling).
- **Forecast** — attendance trajectory (advisory). *Why:* forward view supports early action. *(Later predictive module.)*
- **Alert** — consent-aware nudges. *Why:* catch issues early; the proactive layer absent today.
- **Prioritise** — what matters most today/this week. *Why:* avoid overload; surface the one thing to act on.

---

## 7. Permission Matrix (Least Privilege)

Scope key: **Own** = the authenticated student's own records only. All access is tenant-scoped via RLS; the student is the lowest-privilege persona.

| Feature | View | Create | Edit | Delete | Approve | Export | Share | Trigger AI | View Analytics | Sensitive Data |
|---|---|---|---|---|---|---|---|---|---|---|
| AI Academic Assistant | Own | — | — | — | No | Own | No | Yes (own) | Own | Own PII only |
| Timetable Assistant | Own | — | — | — | No | Own | No | Yes (own) | — | No |
| Attendance Intelligence | Own | — | — | — | No | Own | No | Yes (own) | Own | Own only |
| Attendance Prediction | Own | — | — | — | No | Own | No | Yes (own) | Own | Own only |
| Study Planner | Own | Own plan | Own plan | Own plan | No | Own | Own | Yes | — | No |
| ~~AI Tutor~~ (deferred) | — | — | — | — | No | — | — | Yes* | — | No |
| Assignment Tracker (renamed) | Own | Own plan/reminders | Own | Own | No | Own | No | Yes | — | No |
| Study Material Helper (merged, V2) | Own | Own | Own | Own | No | Own | Own | Yes | — | No |
| Exam Readiness Analyzer | Own | — | — | — | No | Own | No | Yes (own) | Own | Own only |
| Performance Analytics | Own | — | — | — | No | Own | No | Yes (own) | Own | Own only |
| Career Roadmap (V2) | Own | Own artefact | Own | Own | No | Own | Own | Yes | — | No |
| Resume Analyzer | Own upload | Own upload | Own | Own | No | Own | Own | Yes | — | Own doc |
| Placement Readiness Indicator (renamed, V2) | Own | — | — | — | No | Own | No | Yes (own) | Own | Own only |
| Campus Information Assistant | General | — | — | — | No | No | No | Yes | — | No |
| Smart Notifications | Own | Own reminders | Own prefs | Own | No | No | No | Yes | — | Own only |
| Daily AI Brief | Own | — | — | — | No | No | No | Yes (own) | Own | Own only |

\* AI Tutor "Trigger AI" applies only if/when re-approved as a general concept explainer (no institutional data). **Across all features: Approve = No (no approval authority); no access to any other person's data; no access to institutional aggregates, the risk board, accreditation, or admin configuration.**

---

## 8. Data Access

**What this role needs (read-only, own scope):**
Own attendance, internal marks, enrolment, timetable, fee status/dues, course details; own placement-readiness inputs and uploaded resume; general (non-personal) institutional information; notifications addressed to the student.

**What must never be accessible:**
- Any other student's data (marks, attendance, fees, contact, anything).
- Faculty/HOD/Principal/Management/Placement-Cell data and tooling.
- Institution-level aggregates, the faculty/leadership **Risk Board**, the student's **own raw risk tier/score** as a label (see §10), cohort analytics, rankings.
- Accreditation data, statutory MIS, financial accounting, admin/RBAC config.
- Anything outside the student's tenant (hard RLS boundary).

**Data ownership:** The ERP/institution remains the **System of Record and data owner** (the institution is DPDP **Data Fiduciary**). The student is the **Data Principal** for their own personal data, with associated rights (access, correction requests routed to the institution, consent/withdrawal where applicable). The assistant is a read-only view, not an owner.

**Data sensitivity:** Own academic + fee + contact data is personal and (for under-18s) **child data**. Uploaded resume is personal data. Campus KB is non-personal.

**Cross-role restrictions:** Strict. The student surface never exposes another persona's scope, and never the institution-facing framing of the student's own risk (which belongs to mentors/leadership).

**Privacy considerations (DPDP-by-design):**
- **Minors (under 18):** processing limited to academic/administrative signals as **legitimate educational processing**; **no behavioural tracking or detrimental profiling** (not waived by parental consent); all forward-looking/scoring features advisory and transparent; legal review before GA for any minor-facing predictive/profiling feature.
- **Consent lifecycle:** parent-directed messaging for minors flows through the platform's consent gate; never auto-sent.
- **Data minimisation + retention:** student surface requests only what each feature needs; uploaded artefacts (resume) follow retention rules.
- **No automated adverse action** anywhere, for anyone.

---

## 9. Workflow Summary

Pattern per feature (information/advisory only — no ERP write, no autonomous action):

**AI Academic Assistant / Campus Info**
Trigger: student asks → AI: NL → semantic layer (read-only, scoped to self / curated KB) → ERP/SoT: read own canonical record → Response: grounded answer + explanation → Human approval: not applicable (read-only) → Completion.

**Attendance Intelligence / Prediction / Performance / Exam Readiness**
Trigger: student opens / asks → AI: NL framing on top of deterministic signals → ERP/SoT: read own records → Response: standing/trend/projection (transparent, advisory) → Human approval: n/a → Completion.

**Study Planner / Assignment Tracker / Resume Analyzer / (V2) Study Material, Career Roadmap**
Trigger: student requests → AI: generate/analyse on student-owned inputs → ERP/SoT: read own context where relevant (no write) → Response: editable draft/feedback → Human approval: the **student** accepts/edits their own artefact (no staff approval) → Completion.

**Smart Notifications / Daily Brief**
Trigger: scheduled or signal-driven → AI: prioritise + phrase → ERP/SoT: read own signals → Response: consent-aware nudge / brief to the student → Human approval: parent-directed messaging for minors passes the consent gate (never auto-sent) → Completion.

**Placement Readiness Indicator (V2)**
Trigger: student opens → AI: compute transparent checklist from own data → ERP/SoT: read own records → Response: explainable indicator (no opaque score) → Human approval: n/a (advisory) → Completion.

---

## 10. Out of Scope

**This role must NEVER:**
- Write to or modify the ERP / System of Record, or take any autonomous action.
- Access, infer, or display **any other student's** data.
- Access institution/cohort aggregates, rankings, the faculty/leadership **Risk Board**, accreditation, statutory MIS, financial accounting, or admin/RBAC configuration.
- Display the student's **own raw risk tier/score** as a mentor-facing label. *(Boundary note: the Student Success Engine's tier/score is a faculty- and leadership-facing construct. Surfacing "you are HIGH dropout risk" — especially to a minor — risks detrimental framing. The student surface presents the underlying constructive signals and recovery actions, not the alarming label. This is an explicit product decision to confirm at freeze.)*
- Perform behavioural tracking or detrimental profiling of any student (and never of minors, regardless of parental consent).
- Generate submittable/graded academic work (academic-integrity boundary).
- Act as adaptive courseware / a content-authoring or proctored-exam tool (locked v1 exclusion).
- Make or automate any institutional decision; trigger any adverse action.

**Avoiding overlap with other roles:**
- **Faculty / HOD:** own the Risk Board, interventions, and cohort views. Student sees only *their own* constructive signals.
- **Principal / Management:** own institution-health and aggregate analytics. Off-limits to students.
- **Placement Cell:** owns the placement *process*, company/drive management, and cohort placement analytics. The student sees only their **own** placement-readiness view and resume feedback. (This is the most likely overlap — see Career Roadmap / Placement Readiness / Resume in §12.)

---

## 11. Future Features

**Version 1 (build now):**
AI Academic Assistant · Timetable Assistant · Attendance Intelligence · Performance Analytics · Exam Readiness Analyzer · Campus Information Assistant · Smart Notifications · Daily AI Brief · Study Planner · Assignment **Tracker** (renamed/narrowed) · Attendance Prediction (deterministic projection, V1.5 within the V1 line).

**Version 2:**
Study Material Helper (Notes + Quiz merged, LMS/own-content-grounded) · Resume Analyzer (if not pulled into V1 as a quick win) · Placement Readiness **Indicator** (renamed, DPDP-gated) · Career Roadmap (advisory, legal-reviewed) · ML-based Attendance/Performance forecasting · AI Tutor as a **partner integration** · Indic-language NL.

**Version 3:**
Deeper personalised guidance grounded in the institution's own placement-outcome data · voice interface · richer multilingual coverage · proactive, multi-signal personalised coaching (only as DPDP rules and adaptive-learning partnerships mature).

---

## 12. Final Feature Freeze

### Pre-freeze adjustments (recommended removals / merges / renames, with rationale)

As requested, these are proposed **before** finalising, because the requested list collides in places with locked decisions:

1. **AI Tutor → DEFER to V2 (partner integration).** Conflicts with the locked v1 exclusion of AI tutoring/adaptive courseware; not grounded in the ERP SoT; subject-matter hallucination + minor content-safety risk. *Optional V1 fallback only if explicitly re-approved:* a clearly-labelled general "Concept Explainer" with no institutional data.
2. **Notes Generator + Quiz Generator → MERGE into "Study Material Helper," DEFER to V2.** Both are content/assessment authoring (adjacent learning layer, "partner, don't build"); not grounded in the SoT. V2 scope: summarising the student's own/LMS material, not free generation.
3. **Assignment Assistant → RENAME to "Assignment Tracker / Planner," keep in V1, narrow.** Removes the academic-integrity hazard of "generate my submission"; keeps the genuinely useful deadline/planning value; no generation of graded work.
4. **Placement Readiness Score → RENAME to "Placement Readiness Indicator/Checklist," DEFER to V2, DPDP-gate.** Replaces an opaque score (warned against) with transparent components; resolves overlap with the Placement Cell persona (student sees own view only); minor-safe.
5. **Career Roadmap Generator → V2, advisory + legal-reviewed.** Forward-looking career profiling of minors is sensitive; generative; overlaps Placement Cell.
6. **Attendance Prediction → ship a deterministic projection in the V1 line (V1.5); ML forecast in V2.** Keeps an honest, transparent early version without prematurely building the predictive-ML module.
7. **Resume Analyzer → keep, bounded to the student's own uploaded document; V1 if cheap, else V2.** No access to Placement-Cell-managed data.
8. **Confirm the risk-tier boundary (§10):** students do **not** see the raw mentor-facing risk tier/score — they see constructive underlying signals. Recommended as a freeze decision.

### Freeze table

Owner key: **SC** = Student Copilot squad (product owner for this role). Dependencies reference platform modules (NL/Semantic layer, Student 360, Student Success Engine signals, Notifications, Consent/DPDP framework, LMS/Timetable integration).

| # | Feature | Purpose | Priority | Version | Owner | Dependencies | Status |
|---|---|---|---|---|---|---|---|
| 1 | AI Academic Assistant | NL Q&A on own academic record | P0 | V1 | SC | NL/Semantic, Student 360, RLS | Frozen — V1 |
| 2 | Daily AI Brief | One-glance daily summary (own) | P0 | V1 | SC | Most read features, Summarisation | Frozen — V1 |
| 3 | Attendance Intelligence | Own attendance standing + margin | P0 | V1 | SC | Success Engine signals, Semantic | Frozen — V1 |
| 4 | Smart Notifications | Consent-aware nudges (own) | P0 | V1 | SC | Notifications, Consent/DPDP | Frozen — V1 |
| 5 | Timetable Assistant | Own schedule + Q&A | P0 | V1 | SC | Timetable integration, NL | Frozen — V1 (gated on timetable source) |
| 6 | Performance Analytics | Own marks/attendance trends | P1 | V1 | SC | Student 360, Semantic | Frozen — V1 |
| 7 | Campus Information Assistant | Grounded institutional Q&A | P1 | V1 | SC | Curated KB, RAG/NL | Frozen — V1 (gated on KB) |
| 8 | Exam Readiness Analyzer | Transparent readiness from own signals | P1 | V1 | SC | Academic/attendance signals | Frozen — V1 |
| 9 | Study Planner | Personal, editable study plan | P1 | V1 | SC | Timetable, NL | Frozen — V1 (personal aid only) |
| 10 | Assignment Tracker *(renamed)* | Deadlines + planning (no generation) | P1 | V1 | SC | LMS/Timetable, Reminders | Frozen — V1 (renamed/narrowed) |
| 11 | Attendance Prediction | Advisory deterministic projection | P1 | V1.5 | SC | Attendance Intelligence | Frozen — V1.5 (deterministic) |
| 12 | Resume Analyzer | Advisory feedback on own resume | P2 | V1/V2 | SC | Doc handling, NL | Frozen — V2 (V1 if low-cost) |
| 13 | Study Material Helper *(merged: Notes+Quiz)* | Grounded study summaries/practice | P2 | V2 | SC | LMS content, NL | Deferred — V2 (merged) |
| 14 | Placement Readiness Indicator *(renamed)* | Transparent own readiness checklist | P2 | V2 | SC + Placement Cell | Placement data, DPDP gate | Deferred — V2 (renamed, DPDP) |
| 15 | Career Roadmap *(advisory)* | Advisory career guidance | P2 | V2 | SC | NL, Placement outcomes (V2+) | Deferred — V2 (legal review) |
| 16 | AI Tutor *(partner)* | Concept help / tutoring | P3 | V2 | SC + Partner | Partner/LMS integration | Deferred — V2 (partner; out of v1 scope) |
| 17 | *(Decision)* Risk-tier boundary | Students see signals, not raw tier/score | P0 | V1 | SC + Success Engine | — | Proposed freeze decision |

**Freeze statement:** With the §12 adjustments accepted, the **V1 student feature set is items 1–11** (plus Resume Analyzer if low-cost), governed by read-only/advisory, own-data-only, and DPDP-minor constraints. Items 12–16 are scheduled to V2 for the reasons stated. **No features are to be added to this role after sign-off without a change order.**

---

### Open items for sign-off (not new features — decisions this freeze needs)
1. Confirm the **risk-tier boundary** (item 17): students see constructive signals, not the raw mentor-facing tier/score.
2. Confirm **AI Tutor / Notes / Quiz** deferral to V2 (vs. a re-approved, clearly-labelled general explainer in V1).
3. Confirm **timetable** and **campus-KB** source availability (features 5 and 7 are gated on these existing as ingestible sources).
4. Confirm **Placement Cell ⇄ Student** data boundary for items 12/14/15.


---

# Role Solution Design Document (RSDD) — Student AI Assistant

**Product:** AI ERP Copilot — Enterprise AI Intelligence Layer for Higher Education
**Role:** Student AI Assistant (1 of 6 V1 personas)
**Document type:** Role Solution Design Document — single source of truth for this role
**Audience:** Product · UX · Backend · Frontend · AI · Security · QA · DevOps
**Status:** Draft for engineering handoff
**Scope discipline:** This document defines *what* to build and *why*, plus high-level architecture and behaviour. It deliberately stops short of API contracts and database schemas — those are designed in a later phase.

> **Inherited, non-negotiable product invariants** (every section below conforms to these):
> 1. The **ERP is the System of Record**; this product is the **System of Intelligence**. The AI layer is **read-only and advisory in v1** — AI suggests, humans act. **No write-back to the ERP, no autonomous action.**
> 2. **DPDP Act 2023** governs. §9(3) prohibits tracking, behavioural monitoring, and **detrimental profiling of children (under 18)** — *not waived by parental consent*. Education has a partial *consent* exemption only, **not** a harm-prohibition exemption. Many first-year students are 17.
> 3. **No free-form SQL from the model, ever.** NL is resolved against a **governed semantic layer**; queries execute **read-only** through **tenant-scoped, RLS-protected** views; **tenant_id is injected server-side** from the session, never from model output.
> 4. Build **on top of** the existing foundation (auth, multi-tenancy, Student 360, ingestion, audit, risk engine). Extend; do not redesign.
> 5. **Adaptive learning / AI tutoring / content authoring is out of v1 scope** ("adjacent layer; partner, don't build"). Features that collide with this are deferred/re-scoped — see Chapter 2 and the freeze notes.

> **Cross-reference:** This RSDD operationalises the *Role Definition & Feature Freeze — Student AI Assistant*. The freeze's reshapings are carried through here: **Assignment Assistant → Assignment Tracker/Planner** (narrowed, no answer generation); **Notes Generator + Quiz Generator → Study Material Helper** (V2, grounded); **AI Tutor → V2 partner integration**; **Placement Readiness Score → Placement Readiness Indicator** (V2, transparent, no black-box score); **Career Roadmap → V2** (advisory, legal-reviewed); **Attendance Prediction → V1.5 deterministic projection**; and the **risk-tier boundary** (students see constructive signals, not the mentor-facing tier/score label).

---

# CHAPTER 1 — Foundations (Sections 1–6)

## 1. Executive Summary

The Student AI Assistant is the highest-frequency surface in AI ERP Copilot and the only persona that serves a student **about themselves**. Where Faculty, HOD, Principal, Management, and Placement Cell copilots look at students in aggregate or from the outside, the Student Assistant turns the institution's fragmented systems — attendance (biometric), internal marks, fees, timetable, and (where integrated) LMS and placement records — into one plain-language, mobile-first view of *"how am I doing, and what should I do next."*

It is **not a new student portal and not an ERP**. It is a conversational, advisory intelligence surface that reads the unified canonical record already produced by the ingestion pipeline and Student 360, scoped strictly to the authenticated student's own data, and presents it with grounding, explanation, and constructive nudges. Every number it shows traces to a real record; when it cannot answer from the student's data, it says so rather than inventing a figure.

**Why it matters to the business:** daily student engagement is what makes the platform feel alive to an institution, supports retention and pass-rate outcomes (the same early signals the faculty Success Engine uses, surfaced constructively to the student), and deflects routine status queries from staff. It is also the persona most exposed to **DPDP minor-protection law**, so it is designed DPDP-first: academic/administrative signals only, advisory framing, no behavioural profiling, no opaque scores, and a consent gate on any parent-directed action.

**The single biggest net-new engineering element** this role introduces is **student identity and self-scoping**: today the platform authenticates *staff* roles and scopes data by *tenant*. The Student Assistant requires a student to log in, be linked to exactly one canonical student record, and be confined to that record — a per-subject scope layered on top of the existing tenant RLS. This is treated as a foundational requirement (Section 12, Section 14, Section 17), not an afterthought.

**V1 delivers** a read-only student copilot with: Daily AI Brief, AI Academic Assistant (NL Q&A on own data), Attendance Intelligence, Timetable Assistant, Performance Analytics, Exam Readiness Analyzer, Campus Information Assistant, Smart Notifications, Study Planner, Assignment Tracker, and a deterministic Attendance Projection (V1.5). Content-generation and forward-profiling features (Tutor, Study Material Helper, Career Roadmap, Placement Readiness Indicator, richer Resume feedback) are deferred to V2 for the scope and DPDP reasons above.

## 2. Role Definition

**Role purpose.** Provide each enrolled student a single, trustworthy, conversational view of their own academic standing, plus advisory help organising their effort — without exposing any other person's data, without writing to any system of record, and without taking any action on the institution's behalf.

**What the role does (as a product surface):**
- Assembles and presents the student's **own** canonical record (attendance, marks, fees, timetable, enrolment) in plain language.
- Answers self-service questions grounded only in that record, with explainable interpretation.
- Surfaces timely, specific, **constructive** nudges (attendance margin, fee due, assessment approaching).
- Helps the student organise their own work (planning, deadlines, exam prep) and own artefacts (resume) as an advisory aide.
- Routes the student to the correct human/office for anything outside its remit.

**What the role explicitly is not:** a content-authoring/tutoring tool, a place to see other students or cohorts, a holder of the mentor-facing risk tier/score, an approval authority, or any path that writes to the ERP or triggers institutional action. (Full boundary list: Section 19 and Chapter 2.)

**Position in the platform.** The Student Assistant is one of six persona copilots that sit above the shared AI layer (NL/semantic engine, Student Success Engine, guardrails), which sits above the unified data layer (canonical entities + Postgres RLS), which sits above the ingestion/integration tier. The Student Assistant reuses these shared layers and adds: student identity/self-scope, a **self-scoped semantic surface**, a student-appropriate presentation of existing signals, and consent-aware notification behaviour.

## 3. User Persona

**Primary user:** an enrolled student (UG/PG). A large share of first-year UG students are **17 — minors under DPDP**. This is a primary segment, not an edge case, and it shapes the entire role.

| Attribute | Detail |
|---|---|
| **Who** | Enrolled UG/PG students; significant minor (<18) population among first-years. |
| **Technical expertise** | Low–moderate; mobile-first; consumer-app expectations; intolerant of menu-heavy ERP UX. |
| **Devices** | Predominantly mobile (responsive web in v1; native apps deferred). |
| **Frequency** | Daily (brief, attendance, timetable); periodic (performance, resume, planning). |
| **Daily activities** | Read the Daily Brief; check attendance margin; see today's classes; ask a question; act on a nudge. |
| **Pain points** | Standing scattered across systems; learns of problems too late; old portals unusable on phone; must ask a human for simple facts; raw data with no interpretation. |
| **Current ERP frustrations** | Multiple logins, no plain-language answers, no proactive alerts, poor mobile experience. |
| **Information required** | Own attendance + margin; own marks + trend; own timetable; own fee status; own enrolment/courses; own placement-readiness view (V2); campus info; own notifications. |
| **Authority level** | **Lowest-privilege persona.** Read-only on own data; can create only personal artefacts (questions, plans, reminders, resume upload). **No approval authority. No access to any other person's data. No institutional aggregates.** |
| **Decision responsibilities** | Personal only (attend, study, pay on time, prepare). The assistant supports these; it carries no institutional decision rights. |

**Accessibility & inclusion:** colour-vision-safe status (shape + colour, never colour alone — inherited from the design system); labeled controls; readable on low-end devices and intermittent connectivity; English first, Indic-language NL as a near-term enhancement.

## 4. Business Goals

| Goal category | Goal | How this role contributes | Indicative measure (see Section 20) |
|---|---|---|---|
| **Adoption** | Make the platform a daily habit for the largest user base | Highest-frequency surface (brief + attendance) | Weekly active students; brief open rate |
| **Retention / outcomes** | Catch academic risk early, constructively | Surfaces the same early signals to the student that the Success Engine surfaces to faculty | Reduction in threshold breaches among nudge-actors |
| **Operational efficiency** | Deflect routine status queries from staff | Self-service NL answers on own data | Estimated query deflection |
| **Trust** | Be believed, never caught inventing data | Grounded answers + explicit "can't answer from your data" fallback | Answer-grounding rate; complaint rate |
| **Compliance** | Be demonstrably DPDP-correct for minors | Academic-signal-only, advisory, consent-gated, audited | Zero cross-student exposure; consent-gate adherence |
| **Differentiation / renewal** | A reason for the institution to renew/expand | A visibly useful, India-higher-ed, DPDP-safe student copilot | Renewal influence; student NPS |

**Non-goals (business):** the role is not a revenue surface in itself (no ads, no upsell to students), not a learning/courseware product, and not a channel for institutional decisions.

## 5. Current Problems

**Student-side problems (today):**
- **Fragmentation:** standing lives across biometric portals, marks sheets, fee receipts, timetables, notices — no single answer.
- **Late awareness:** a student often learns of an attendance shortfall only at detention — past the point of recovery.
- **Navigation pain:** legacy student portals are menu-heavy and mobile-hostile; usage is low.
- **Information asymmetry:** "how many classes can I still miss?", "what's my fee status?" require a clerk or faculty member.
- **No interpretation:** where data exists, it is raw records, not "what it means and what to do."

**Institutional problems this role helps with:**
- Staff time lost to routine student status queries.
- Retention/detention outcomes that depend on early, acted-upon awareness.
- Low student-side adoption of the existing systems the institution already paid for.

**Constraints that bound the solution (these are features, not obstacles):**
- The product must remain additive and read-only — it cannot fix data at the source, only surface and explain it.
- Minor-protection law restricts what may be computed and shown, and how forward-looking/profiling features may behave.
- Some sources (timetable, LMS, placement) may not yet be ingested for a given tenant; features depending on them must degrade gracefully (Section 18/19).

## 6. Dashboard Design

The student "home" is a **Daily Brief surface**, not a data console — mobile-first, glanceable, conversation-forward. Design principle: *one glance and the student knows their day and the one thing to act on.* (Detailed widget specs in Section 10; navigation in Section 11.)

**Layout intent (top to bottom, mobile):**
1. **Daily AI Brief** — the centrepiece: today's classes, attendance status, anything due, the single most important nudge.
2. **Attendance margin meter** — current % and how many more sessions can be missed against the norm; constructive framing.
3. **Today's timetable** — next/at-a-glance classes.
4. **Action strip** — Ask a question · Set a reminder · Open study plan · View fees · Career (V2).
5. **Cards (scroll):** Fee status · Performance trend snapshot · Exam readiness snapshot · Placement-readiness checklist (V2).
6. **Persistent NL entry** — "Ask me anything about your studies," always reachable.

**Explicitly absent from the student dashboard (by design):**
- Any other student's data; any cohort/aggregate; any ranking or peer comparison.
- The **mentor-facing risk tier/score label** (the student sees the underlying constructive signals and recovery actions, not "HIGH risk").
- Faculty/leadership/placement-process tooling; accreditation; financial accounting; admin config.

**Design system inheritance:** reuse the established visual identity, tier/status treatment (shape + colour for colour-vision safety), and empty/error/stale-state patterns from the existing Risk Copilot design — adapted to a constructive, student-appropriate tone (a 17-year-old must never be shown an alarming "dropout risk" framing).

**States the dashboard must handle (designed, not afterthoughts):** first-login/empty (no data yet ingested), partial-data (e.g. timetable source absent), stale-data (last sync time shown), and error (a source or the AI engine is unavailable). See Sections 18–19.

---

# CHAPTER 2 — Complete Feature Catalogue (Section 7)

Each feature uses the required template: **Purpose · User Problem · Business Value · Inputs · Outputs · Expected Behaviour · AI Behaviour · Permissions · Dependencies · Future Improvements.** Every feature inherits the invariants (read-only/advisory, self-scope only, DPDP-minor-safe, no ERP write). Permissions are summarised here and matrixed in Chapter 3 (Section 12). "Self-scope" = the authenticated student's own canonical record only.

> **Version legend:** V1 = build now · V1.5 = within the V1 line, follows core · V2 = deferred (scope/DPDP/partner reasons) · "Frozen/Deferred" status per the Feature Freeze.

## 7.1 AI Academic Assistant — *V1, P0*
- **Purpose:** Plain-language Q&A and explanation over the student's own academic record.
- **User Problem:** Students can't get simple answers without chasing humans or navigating menus.
- **Business Value:** Query deflection; daily engagement; the trust anchor of the role.
- **Inputs:** The NL question; authenticated student + tenant + self-scope context; the student's own canonical record (attendance, marks, enrolment, timetable, fees) via the governed semantic layer.
- **Outputs:** A grounded answer + the relevant figures + a short "how I read your question" interpretation.
- **Expected Behaviour:** Answers only from the student's own data; never returns another student's data; when no governed metric fits, abstains with "I can't answer that from your data" rather than guessing.
- **AI Behaviour:** NL → intent/entity parse → **self-scoped semantic-layer selection** (metric/filter/dimension) → deterministic read-only query → grounded response with interpretation echo. Never generates numbers; never emits SQL.
- **Permissions:** View own; Trigger AI on own data. No create/edit/delete of institutional data; no approval; no export of others' data.
- **Dependencies:** NL/semantic layer; Student 360 (self); student self-scope (Section 14); RLS.
- **Future Improvements:** Indic-language Q&A; voice input; richer multi-turn follow-ups.

## 7.2 Timetable Assistant — *V1, P0 (gated on timetable source)*
- **Purpose:** Surface and answer questions about the student's own schedule.
- **User Problem:** Timetable and changes are communicated poorly; "what's my next class / where" is hard.
- **Business Value:** Engagement; deflection of routine schedule queries.
- **Inputs:** Student enrolment + institutional timetable data; NL question.
- **Outputs:** Today/upcoming schedule; answers to schedule questions; a feed into the Daily Brief.
- **Expected Behaviour:** Reflects only the student's own schedule; read-only; degrades gracefully with a clear message if no timetable source is ingested for the tenant.
- **AI Behaviour:** Retrieval over the student's schedule + NL formatting/answering; no invention of classes not present in data.
- **Permissions:** View own; Trigger AI on own data. Cannot edit the timetable.
- **Dependencies:** Timetable available as an ingested source (integration-dependent — flagged); NL layer.
- **Future Improvements:** Calendar export/sync; proactive change alerts.

## 7.3 Attendance Intelligence — *V1, P0*
- **Purpose:** Show the student their own attendance standing and **margin** against the institution norm (e.g. 75%).
- **User Problem:** Students discover shortfalls too late to recover.
- **Business Value:** Directly supports retention/detention-avoidance; the student-side complement to the faculty Success Engine.
- **Inputs:** Own attendance records (already summarised per-course by Student 360); tenant attendance norm/config.
- **Outputs:** Current %, margin to threshold, subject-wise breakdown, constructive framing and next action.
- **Expected Behaviour:** Constructive, specific, non-alarming. **Does not display the mentor-facing risk tier/score** — surfaces the underlying signal ("attendance 61%, below the 75% norm") and what to do.
- **AI Behaviour:** Computation is deterministic (reuses existing attendance signal); AI provides NL explanation and the recovery framing only.
- **Permissions:** View own; Trigger AI on own data; Export own.
- **Dependencies:** Attendance signal (Success Engine); semantic layer; self-scope.
- **Future Improvements:** Per-subject recovery planning tied to the Study Planner.

## 7.4 Attendance Prediction — *V1.5, P1 (deterministic projection)*
- **Purpose:** Forward-looking, advisory projection — "at this rate you will cross/miss the threshold by X."
- **User Problem:** Students react late; a projection prompts earlier action.
- **Business Value:** Earlier self-correction → retention.
- **Inputs:** Own attendance history + remaining scheduled sessions + norm.
- **Outputs:** An advisory projection with its assumptions shown explicitly.
- **Expected Behaviour:** **Advisory only**, assumptions transparent, **academic signal only** (DPDP-safe for minors), never an automated adverse action, never an opaque score.
- **AI Behaviour:** A **deterministic rule-based projection** in V1.5 (arithmetic on remaining sessions), with AI only framing the result. ML/multi-signal forecasting is V2 (the predictive-analytics module), not built now.
- **Permissions:** View own; Trigger AI on own data.
- **Dependencies:** Attendance Intelligence; scheduled-sessions data.
- **Future Improvements:** ML forecast across multiple signals (V2), still advisory and transparent.
- **DPDP note:** For minors, remains legitimate educational processing, not detrimental profiling.

## 7.5 AI Study Planner — *V1, P1 (personal aid only)*
- **Purpose:** Help a student organise their own study time around deadlines and weak areas.
- **User Problem:** Effort is unstructured; students struggle to plan.
- **Business Value:** Engagement; indirect outcome support.
- **Inputs:** Student's own deadlines/timetable + self-identified goals; optionally own marks to highlight weak subjects.
- **Outputs:** A draft, **editable** study plan/schedule owned by the student.
- **Expected Behaviour:** A suggestion the student edits and controls; nothing is enforced or reported to staff; not an institutional commitment.
- **AI Behaviour:** Generative planning constrained to scheduling/organisation of the student's own data — **not** adaptive courseware or subject content.
- **Permissions:** View/Create/Edit/Delete own plan; Trigger AI.
- **Dependencies:** Timetable + (optional) marks; NL layer.
- **Future Improvements:** Adherence reminders; LMS-deadline integration.
- **Scope note:** Kept in V1 strictly as a personal scheduling aid; it must not drift into the adaptive-learning adjacent layer.

## 7.6 AI Tutor — *V2, P3 (partner integration; out of v1 scope)*
- **Purpose (as requested):** Explain subject concepts / tutor on course content.
- **User Problem:** Students want on-demand help understanding material.
- **Business Value:** Engagement — but not aligned to the "intelligence-layer-on-top-of-ERP" thesis.
- **Inputs:** Student's request/topic (no institutional record needed).
- **Outputs:** Concept explanations (if ever shipped).
- **Expected Behaviour (if shipped):** Clearly labelled, advisory; never grounded in or implying institutional records it doesn't have.
- **AI Behaviour:** Subject-matter generation — high hallucination and pedagogy-quality risk, plus content-safety exposure for minors.
- **Permissions:** Trigger AI on own request; no institutional data.
- **Dependencies:** A partner/LMS tutoring integration.
- **Future Improvements:** Full partner integration in V2.
- **Freeze decision:** **Deferred.** Directly collides with the locked v1 exclusion of AI tutoring/adaptive courseware. Defined here for record; not built in V1. A re-approved, clearly-labelled general "Concept Explainer" is the only acceptable V1 fallback, and only on explicit sign-off.

## 7.7 Assignment Tracker / Planner *(renamed from "Assignment Assistant")* — *V1, P1*
- **Purpose:** Surface assignment deadlines and help the student plan and track their own work.
- **User Problem:** Students juggle multiple deadlines and lose track.
- **Business Value:** Engagement; reduced missed-deadline incidents.
- **Inputs:** Assignment/deadline data (from LMS/timetable where available) + the student's own plan/reminders.
- **Outputs:** A deadline view, a personal work plan, and reminders.
- **Expected Behaviour:** Tracks and plans only; **does not generate submittable or graded work** (academic-integrity boundary). Degrades gracefully without an LMS source.
- **AI Behaviour:** Organisation/planning + reminder phrasing; no answer generation.
- **Permissions:** View own deadlines; Create/Edit/Delete own plan & reminders; Trigger AI.
- **Dependencies:** LMS/timetable (where integrated); reminders/notifications.
- **Future Improvements:** Submission-status visibility (read-only); deeper LMS sync.
- **Freeze decision:** **Renamed and narrowed** from "Assignment Assistant" to remove the "do my homework" academic-integrity hazard.

## 7.8 + 7.9 Study Material Helper *(Notes Generator + Quiz Generator, merged)* — *V2, P2*
- **Purpose (as requested):** Generate study notes (7.8) and practice quizzes (7.9) for self-study.
- **User Problem:** Students want condensed notes and self-test practice.
- **Business Value:** Engagement — but content authoring sits in the adjacent learning layer.
- **Inputs:** The student's own provided/LMS material (for grounded summarisation) — not free generation.
- **Outputs:** Grounded summaries and practice questions from the student's own material.
- **Expected Behaviour:** Self-study only; private to the student; never an institutional assessment; never reported to staff.
- **AI Behaviour:** Grounded summarisation/question generation over student-provided content — bounded to avoid free, unverifiable generation.
- **Permissions:** Create/Edit/Delete own; Trigger AI; results private.
- **Dependencies:** LMS/content availability; document handling; NL layer.
- **Future Improvements:** Practice grounded in the institution's own question banks.
- **Freeze decision:** **Merged and deferred to V2.** Both are content/assessment authoring (locked-out of v1, "partner, don't build") and not grounded in the SoT; V2 scopes them to grounded summarisation, not free generation.

## 7.10 Exam Readiness Analyzer — *V1, P1*
- **Purpose:** Give the student an advisory, transparent read on preparedness for upcoming assessments from their own academic signals.
- **User Problem:** Students lack an objective sense of readiness and where their gaps are.
- **Business Value:** Engagement; earlier, focused preparation.
- **Inputs:** Own internal marks, attendance, assessment calendar.
- **Outputs:** A subject-wise readiness view with **components shown (no opaque score)** + suggested focus areas.
- **Expected Behaviour:** Explainable, advisory, constructive; **academic signal only**; safe for minors.
- **AI Behaviour:** Deterministic signal computation + NL framing and focus suggestions.
- **Permissions:** View own; Trigger AI on own data.
- **Dependencies:** Academic + attendance signals; assessment calendar.
- **Future Improvements:** Feed focus areas directly into the Study Planner.

## 7.11 Performance Analytics — *V1, P1*
- **Purpose:** Show the student trends in their **own** marks and attendance over time.
- **User Problem:** Raw marks sheets don't reveal trajectory.
- **Business Value:** Engagement; self-awareness supporting retention.
- **Inputs:** Own historical marks/attendance.
- **Outputs:** Personal trend charts + plain-language narration.
- **Expected Behaviour:** Own data only; **no peer comparison or ranking** (privacy + minor-profiling concern); constructive framing.
- **AI Behaviour:** Analytics over the student's own series + NL narration of the trend.
- **Permissions:** View own; View own analytics; Trigger AI; Export own.
- **Dependencies:** Student 360 (self); semantic layer.
- **Future Improvements:** Tracking against the student's own self-set goals.

## 7.12 Career Roadmap Generator — *V2, P2 (advisory, legal-reviewed)*
- **Purpose (as requested):** Generate a forward-looking career path/roadmap.
- **User Problem:** Students lack direction and concrete next steps.
- **Business Value:** Engagement; placement-readiness support.
- **Inputs:** Student's own profile/goals; (V2+) the institution's own placement-outcome data.
- **Outputs:** Advisory guidance/roadmap, transparent about its basis.
- **Expected Behaviour:** Advisory only; not a guarantee; for minors, non-detrimental educational guidance — **never profiling**.
- **AI Behaviour:** Generative + forward-looking — the reason it is gated for minors and deferred.
- **Permissions:** Trigger AI on own request; own artefact.
- **Dependencies:** NL layer; (V2+) placement-outcome data; legal review.
- **Future Improvements:** Ground against real institutional placement outcomes.
- **Freeze decision:** **Deferred to V2.** Forward-looking career profiling of minors is sensitive under §9(3); generative and not grounded in the SoT; partially overlaps the Placement Cell persona.

## 7.13 Resume Analyzer — *V2 (V1 if low-cost), P2*
- **Purpose:** Advisory feedback on a resume the student uploads.
- **User Problem:** Students get little structured resume feedback.
- **Business Value:** Placement-readiness support; engagement.
- **Inputs:** The student's **own uploaded resume** (consented document). No Placement-Cell-managed data.
- **Outputs:** Structured, advisory feedback.
- **Expected Behaviour:** Operates only on the student's uploaded document; advisory; the student owns/shares it at their discretion.
- **AI Behaviour:** Analysis + suggestions on a student-provided document.
- **Permissions:** Create/Edit/Delete own upload; Trigger AI; Share own.
- **Dependencies:** Document handling; NL layer. **Not** dependent on Placement-Cell data (Section 19 boundary).
- **Future Improvements:** Role-targeted feedback.
- **DPDP note:** A minor's uploaded document is personal data — consent + retention rules apply.

## 7.14 Placement Readiness Indicator *(renamed from "Placement Readiness Score")* — *V2, P2*
- **Purpose:** A transparent, advisory checklist of the student's own placement readiness.
- **User Problem:** Students don't know where they stand for placements.
- **Business Value:** Placement-readiness support; engagement.
- **Inputs:** Student's own academic/eligibility signals; own resume.
- **Outputs:** An explainable **checklist/indicator with components shown — no single opaque number**.
- **Expected Behaviour:** Advisory; own view only; no access to drive/company/cohort data (Placement Cell's domain); DPDP-gated for minors.
- **AI Behaviour:** Transparent component computation + NL framing — deliberately not a black-box score.
- **Permissions:** View own; Trigger AI on own data.
- **Dependencies:** Placement-relevant data; DPDP consent framework; Placement Cell boundary.
- **Future Improvements:** Component-level guidance tied to each checklist item.
- **Freeze decision:** **Renamed and deferred to V2.** A "score" on a (possibly minor) student is the opaque-profiling pattern the design warns against; reframed as a transparent indicator and de-overlapped from the Placement Cell role.

## 7.15 Campus Information Assistant — *V1, P1 (gated on curated KB)*
- **Purpose:** Answer general institutional questions (calendar, policies, fee schedules, office contacts, procedures).
- **User Problem:** This information is buried in notices, PDFs, and people.
- **Business Value:** Deflection; engagement.
- **Inputs:** The institution's published/general (non-personal) information as a curated knowledge base; the NL question.
- **Outputs:** A grounded answer with a pointer to the source/where-to-go.
- **Expected Behaviour:** Answers only from approved institutional content; grounded; says when it doesn't know; surfaces no personal data of others.
- **AI Behaviour:** Retrieval-augmented answering (RAG) over the curated KB with a hallucination fallback.
- **Permissions:** View general institutional info; Trigger AI. No personal data of others.
- **Dependencies:** A curated, maintained institutional KB; RAG/vector store; NL layer.
- **Future Improvements:** Multilingual coverage; broader KB scope.

## 7.16 Smart Notifications — *V1, P0*
- **Purpose:** Deliver timely, consent-aware nudges (attendance margin, fee due, assessment approaching, timetable change, info addressed to the student).
- **User Problem:** No proactive nudges today; problems caught late.
- **Business Value:** Engagement; earlier action → retention.
- **Inputs:** The student's own signals + delivery preferences + consent state.
- **Outputs:** Multi-channel notifications (app/email/SMS as configured), **consent-aware**.
- **Expected Behaviour:** Addressed to the student about their own data; constructive; respects preferences and quiet hours; **for minors, any parent-directed message routes through the platform consent gate and is never auto-sent.**
- **AI Behaviour:** Prioritisation + phrasing of nudges; no decisioning, no adverse action.
- **Permissions:** View/Trigger own; Edit own notification preferences. No notifications about other people.
- **Dependencies:** Signals; notification/delivery service; consent framework.
- **Future Improvements:** WhatsApp channel; smarter prioritisation.
- **DPDP note:** Parent-directed messaging for minors is governed by the existing consent gate, not this student surface.

## 7.17 Daily AI Brief — *V1, P0 (the centrepiece)*
- **Purpose:** A single morning summary across the student's own data — today's classes, attendance status, anything due, the top nudge.
- **User Problem:** No single glanceable "what matters today."
- **Business Value:** The habit-forming, highest-frequency surface — the primary adoption driver.
- **Inputs:** Timetable, attendance, fees, assessments, notifications — all own.
- **Outputs:** A short, prioritised, plain-language daily summary.
- **Expected Behaviour:** Own data only; concise; constructive; deterministic facts with AI phrasing; handles empty/partial data gracefully.
- **AI Behaviour:** Multi-source summarisation + prioritisation (which one thing matters most today).
- **Permissions:** View own; Trigger AI on own data.
- **Dependencies:** Most read features; summarisation; scheduler.
- **Future Improvements:** Personalised delivery timing; end-of-week recap.

### 7.18 Feature freeze summary (carried from the Feature Freeze)

| Feature | Version | Priority | Status |
|---|---|---|---|
| AI Academic Assistant | V1 | P0 | Frozen |
| Daily AI Brief | V1 | P0 | Frozen |
| Attendance Intelligence | V1 | P0 | Frozen |
| Smart Notifications | V1 | P0 | Frozen |
| Timetable Assistant | V1 | P0 | Frozen (gated on source) |
| Performance Analytics | V1 | P1 | Frozen |
| Campus Information Assistant | V1 | P1 | Frozen (gated on KB) |
| Exam Readiness Analyzer | V1 | P1 | Frozen |
| Study Planner | V1 | P1 | Frozen (personal aid) |
| Assignment Tracker/Planner *(renamed)* | V1 | P1 | Frozen (narrowed) |
| Attendance Prediction | V1.5 | P1 | Frozen (deterministic) |
| Resume Analyzer | V1/V2 | P2 | Frozen V2 (V1 if low-cost) |
| Study Material Helper *(Notes+Quiz, merged)* | V2 | P2 | Deferred |
| Placement Readiness Indicator *(renamed)* | V2 | P2 | Deferred (DPDP) |
| Career Roadmap *(advisory)* | V2 | P2 | Deferred (legal review) |
| AI Tutor *(partner)* | V2 | P3 | Deferred (out of v1 scope) |

---

# CHAPTER 3 — Experience & Requirements (Sections 8–13)

## 8. User Journeys

Journeys are written as experience flows, not implementation. All are read-only/advisory and self-scoped.

**J1 — First login & onboarding (incl. minor handling).**
Student receives an invite/credential from the institution → logs in → the system links them to their canonical student record and establishes **self-scope** → a one-time notice explains what data is shown and the DPDP basis → if the student is a **minor**, the minor-appropriate experience is set (no profiling features, consent-gated parent messaging) → lands on the Daily Brief (which may be in an empty/partial state if data is still ingesting).

**J2 — Daily check-in (the core loop).**
Opens app → reads Daily Brief → sees attendance margin and today's classes → notices a nudge ("2 more absences and you cross the 75% line in DBMS") → taps it → sees the constructive detail + suggested action → optionally sets a reminder or adds it to the study plan.

**J3 — Ask a question (NL).**
Types "how many classes can I miss in OS?" → assistant interprets, echoes its reading, returns a grounded answer from the student's own attendance → student asks a follow-up ("and in DBMS?") → assistant maintains context, still self-scoped.

**J4 — Check performance trend.**
Opens Performance Analytics → sees own marks/attendance trajectory with plain-language narration → no peer comparison shown → optionally exports own data.

**J5 — Prepare for an exam.**
Opens Exam Readiness → sees transparent, subject-wise readiness components and focus areas → sends focus areas into the Study Planner → plans study time around the timetable.

**J6 — Campus question.**
Asks "when does the fee deadline fall this term?" → Campus Information Assistant answers from the curated KB with a where-to-go pointer; if unknown, says so and routes to the right office.

**J7 — Resume feedback (V2).**
Uploads own resume → receives advisory feedback → edits → (optionally) shares. Operates only on the uploaded document.

**J8 — Graceful degradation.**
A student on a tenant without a timetable source opens the Timetable Assistant → sees a clear "your college hasn't connected timetables yet" state, not an error or an invented schedule.

**J9 — Data correction request.**
Student sees an attendance figure they believe is wrong → assistant explains it is read from the institution's records and **routes a correction request to the right office** (the assistant cannot edit the SoT).

## 9. Conversation Flows

The student copilot is conversational but bounded. Canonical flow (mirrors the platform's NL engine, scoped to self):

```
Student utterance
   ↓
Intent + entity parse (LLM)
   ↓
Self-scope + tenant context injected server-side (never from model output)
   ↓
Map to a governed semantic metric/dimension  ──(no match)──▶ Abstain:
   ↓ (match)                                                 "I can't answer that
Deterministic read-only query (RLS-enforced, self-scoped)     from your data" + suggest
   ↓                                                          what it *can* answer
Grounded response + interpretation echo ("Here's how I read that…")
   ↓
Optional follow-up (context retained, still self-scoped)
```

**Designed conversational behaviours:**
- **Interpretation echo:** every substantive answer states how the question was read, so misreads are caught.
- **Grounding:** every figure traces to a returned record; the copilot never free-generates numbers.
- **Abstention:** out-of-scope, out-of-data, or other-student questions are declined gracefully ("I can only show your own records"), never answered by guessing or by reaching beyond self-scope.
- **Constructive tone:** risk-adjacent answers use recovery framing, never the alarming mentor-facing tier label — especially for minors.
- **Safe redirection:** requests to change data, contact staff, or do something the assistant can't → routed to the right human/office.
- **Refusal cases:** asks about other students, staff, cohorts, or institutional aggregates → declined with explanation; requests to "write my assignment/answer the exam" → declined on academic-integrity grounds.

**Multi-turn context:** retained within a session for the student's own data only; never carries another subject into scope.

## 10. Dashboard Widgets

| Widget | Content | Source feature | States to design |
|---|---|---|---|
| **Daily AI Brief** | Today's classes, attendance status, due items, top nudge | 7.17 | Full / empty / partial / stale |
| **Attendance Margin Meter** | Current % + sessions-can-miss vs norm | 7.3 | Full / no-data / below-threshold (constructive) |
| **Today's Timetable** | Next + today's classes | 7.2 | Full / no-source / no-classes-today |
| **Fee Status Card** | Own dues, due dates, status | (Student 360 fees) | Paid / due / overdue (factual, non-punitive) |
| **Performance Trend Snapshot** | Own marks/attendance trajectory | 7.11 | Full / insufficient-history |
| **Exam Readiness Snapshot** | Transparent readiness components | 7.10 | Full / no-upcoming-assessments |
| **Placement Readiness Checklist** (V2) | Transparent own checklist | 7.14 | V2 |
| **Nudge / Notification Centre** | Consent-aware nudges | 7.16 | Has-nudges / empty / quiet-hours |
| **Ask-Me-Anything entry** | Persistent NL input | 7.1 | Idle / thinking / answered / abstained |
| **Quick Actions** | Ask · Remind · Plan · Fees · Career(V2) | multiple | — |

**Widget rules:** every widget is self-scoped and read-only; every numeric widget shows a last-updated/stale indicator; no widget shows the risk tier/score label or any peer/cohort comparison; empty and error states are first-class (Sections 18–19).

## 11. Navigation

Flat, minimal, mobile-first; the copilot does the navigating.

**Primary nav (≤6 items):** **Brief** (home) · **Academics** (attendance, marks, performance, exam readiness) · **Timetable** · **Fees** · **Career** (resume; V2 indicators/roadmap) · **Ask** (persistent NL).

**Navigation principles:**
- The NL "Ask" entry is reachable from everywhere; many tasks are completed without navigating at all.
- No path exposes another persona's surface (faculty board, leadership dashboard, placement-process tools, admin).
- Deep links are self-scoped: a student can only ever reach their own records.
- Back/empty/error states return the student to a sensible, non-dead-end place.

## 12. Functional Requirements

Numbered for traceability (FR-#). "Self-scope" = authenticated student's own canonical record only.

**Identity, scope & access (foundational — net-new for this role):**
- **FR-1.** A student must authenticate as a distinct **student identity** (not a staff role) within their tenant.
- **FR-2.** Each student identity must be linked to exactly one canonical student record; the link is established and verifiable at the institution's control.
- **FR-3.** The platform must enforce **self-scope**: a student can read only their own canonical record, layered on top of existing tenant RLS. Self-scope is enforced server-side and is never derived from client or model input.
- **FR-4.** Every student-facing read must be denied if self-scope cannot be established (fail closed).
- **FR-5.** A student identity must have **no** access to other students, staff data, cohorts, aggregates, the risk board, accreditation, financial accounting, or admin configuration.

**Core read features (V1):**
- **FR-6.** Render a Daily Brief assembled from the student's own timetable, attendance, fees, assessments, and notifications.
- **FR-7.** Answer NL questions over the student's own record via the governed semantic layer, with interpretation echo and grounding.
- **FR-8.** Show attendance standing, per-course breakdown, and margin to the configured norm, with constructive framing.
- **FR-9.** Provide a deterministic, advisory attendance projection (V1.5).
- **FR-10.** Show own performance trends (no peer comparison) and a transparent exam-readiness view.
- **FR-11.** Answer campus/general questions from a curated, non-personal KB with a hallucination fallback.
- **FR-12.** Surface own timetable and answer schedule questions (where a timetable source exists).

**Personal-artefact features (V1):**
- **FR-13.** Let a student create/edit/delete their own study plan and reminders.
- **FR-14.** Let a student view/track assignment deadlines and plan work — **without** generating submittable work.

**Notifications & DPDP:**
- **FR-15.** Deliver consent-aware, self-addressed notifications across configured channels, respecting preferences and quiet hours.
- **FR-16.** For minors, never auto-send a parent-directed message; route any such action through the existing consent gate.
- **FR-17.** Compute and respect `subject_minor_status` (under 18 → minor) for feature availability and behaviour.
- **FR-18.** Restrict minor-facing features to academic/administrative signals only; expose no behavioural-profiling output and no opaque score.

**Behavioural guarantees:**
- **FR-19.** No feature writes to the ERP/SoT or triggers any institutional action.
- **FR-20.** The student surface must never display the mentor-facing risk tier/score label.
- **FR-21.** Every student-facing read and AI interaction is audited (actor, scope, time) using the existing audit mechanism.
- **FR-22.** Where a depended-on source (timetable, LMS, placement, KB) is absent, the feature degrades to a clear, honest state — never an error or invented data.
- **FR-23.** Data-correction requests are routed to the institution; the assistant never edits the record.

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Tenant & subject isolation** | Hard tenant isolation (existing RLS) **plus** per-student self-scope; isolation is the #1 risk and must be adversarially tested (Section 21). Fail closed. |
| **Security & privacy** | Encryption in transit and at rest; least privilege (student is lowest-privilege); full audit; DPDP-by-design for minors; data minimisation per feature. |
| **Performance** | NL answers and dashboard reads stay responsive under exam/result-day peaks; reads use the analytics/serving path decoupled from transactional writes; self-scoped queries are cheap and bounded. |
| **Scalability** | Support a large concurrent student population per tenant across many tenants; the highest-frequency surface in the product must scale to peak login bursts (result days). |
| **Availability** | Resilient to a single source/integration being down; degrades gracefully per FR-22; the brief and core reads remain available when optional sources aren't. |
| **Reliability / correctness** | Deterministic facts (no AI-invented numbers); grounding enforced; idempotent reads; consistent self-scope. |
| **Mobile-first UX** | Responsive web in v1; usable on low-end devices and intermittent connectivity; accessible (colour-vision-safe, labeled controls). |
| **Observability** | Tracing/metrics/logging for NL accuracy, abstention rate, scope denials, latency, and error rates; auditable AI interactions. |
| **Localisation** | English first; architecture ready for Indic-language NL. |
| **Data residency** | India-region hosting (region-pinned), per platform decision. |
| **Maintainability / extensibility** | Reuse shared layers (NL engine, signals, Student 360); add features behind the same seams without redesign. |

---

# CHAPTER 4 — Architecture, Data, Security & Resilience (Sections 14–19)

## 14. AI Architecture (High Level)

The Student Assistant **reuses the platform's existing AI architecture**, scoped to a single subject. No new AI paradigm is introduced; a self-scope is added to the established NL pipeline, and student-appropriate presentation/guardrails are layered on.

**Layered view (top to bottom):**
1. **Student Copilot surface** (responsive web) — conversation + dashboard.
2. **AI orchestration layer** — LLM via API behind an orchestrator that does: intent/entity parse → **self-scoped semantic-layer selection** → grounded response composition. The orchestrator also handles summarisation (Daily Brief), RAG (Campus Info), and constrained generation (Study Planner, Resume — V2).
3. **Governed semantic layer (self-scoped subset)** — the only surface the model's selections may target. Defines the metrics/dimensions a student may ask about (own attendance, marks, fees, timetable, readiness), excluding any cohort/aggregate metric.
4. **Deterministic query execution** — code (not the model) builds parameterised, allow-listed, **read-only** queries from the semantic selection; **tenant_id and student self-scope are injected server-side**; **Postgres RLS** enforces isolation.
5. **Shared signals/engine** — reuses the Student Success Engine's attendance/academic signals for Attendance Intelligence, Exam Readiness, and the deterministic projection. The student surface consumes the **signals**, not the mentor-facing tier/score label.
6. **Unified data layer** — canonical entities (Student 360) + audit + provenance.
7. **Knowledge base / vector store** — pgvector-style RAG for Campus Information (non-personal institutional content).

**Key behaviours and the reasoning behind them:**
- **Model never emits SQL or numbers.** It selects governed semantic concepts and composes language; deterministic code does the data access. *Why:* this is the platform's core anti-hallucination and anti-leakage guarantee; relaxing it for the student surface would reintroduce the #1 risk.
- **Self-scope injected server-side.** The student's identity → student record link is resolved server-side and applied as a mandatory filter, in addition to tenant RLS. *Why:* a student surface is the most likely place for a confused-deputy/IDOR-style mistake; scope must never depend on client or model output.
- **Abstain over guess.** No governed metric match, or any reach beyond self-scope → graceful abstention. *Why:* trust and DPDP correctness.
- **Signals, not labels, for minors.** The architecture deliberately routes the student surface to the underlying academic signals and constructive framing, not the risk tier/score. *Why:* DPDP §9(3) and duty-of-care to minors.
- **Generation is bounded and grounded.** Where generation exists (Study Planner now; Resume/Study Material in V2), it operates on the student's own inputs/own data, not free subject-matter generation. *Why:* keeps the role out of the "adaptive learning / content authoring" adjacent layer.

**Architectural trade-offs (recommended approach + why):**

| Decision | Options | Recommended | Why |
|---|---|---|---|
| **How the student surface gets data** | (a) free NL→SQL; (b) governed semantic layer; (c) fixed read endpoints only | **(b) + (c): fixed endpoints for dashboard reads, governed semantic layer for NL** | Dashboard widgets are deterministic and high-traffic → cheap fixed reads; open-ended NL needs the governed semantic layer for safety. Free NL→SQL is rejected (leakage + hallucination). |
| **Self-scope enforcement point** | (a) application filter; (b) DB RLS extended to subject; (c) both | **(c) both — defense in depth** | App-level filter for clarity + a DB-level self-scope so a coding mistake can't leak; mirrors the platform's existing RLS-as-backstop philosophy. |
| **Risk presentation to students** | (a) show tier/score; (b) show signals only | **(b) signals only** | DPDP minor-protection + duty of care; the tier/score is a mentor/leadership construct. |
| **Attendance prediction** | (a) ML now; (b) deterministic now, ML later | **(b) deterministic V1.5, ML V2** | Transparent, explainable, DPDP-safe, no premature ML investment; ML forecasting is the later predictive module. |
| **Tutoring/content** | (a) build; (b) partner/defer | **(b) defer/partner (V2)** | Locked v1 exclusion; hallucination/pedagogy/content-safety risk; off-thesis. |

## 15. Data Requirements

*(What data the role needs and how it is treated — not schemas.)*

**Data the role consumes (read-only, self-scope):**
- **Student profile** (own): identity, programme/department, admission year, status, dob (for minor status), contact.
- **Attendance** (own): per-course sessions, present/absent, derived %/margin.
- **Internal marks** (own): assessment results and trend.
- **Fees** (own): dues, due dates, status.
- **Timetable / enrolment** (own): schedule and registered courses (where ingested).
- **Assessment calendar** (own/institutional): upcoming assessments for readiness.
- **Derived signals** (own): attendance/academic signals from the Success Engine (consumed as signals, not as the tier/score label).
- **Campus knowledge base** (non-personal): curated institutional content for RAG.

**Data the role produces (student-owned artefacts):**
- Study plans, reminders, uploaded resume (V2), and notification preferences. These are personal data of the student and follow consent/retention rules.

**Data the role must never access:**
- Any other student's data; staff data; cohorts/aggregates; the risk board; accreditation; statutory MIS; financial accounting; admin/RBAC config; anything outside the student's tenant.

**Data ownership & roles (DPDP):**
- The **institution is the Data Fiduciary** and the ERP remains the System of Record/owner.
- The **student is the Data Principal** for their own personal data, with associated rights (access, correction-request routing, consent/withdrawal where applicable).
- The assistant is a **read-only view + advisory layer**, never an owner of record data.

**Sensitivity & minimisation:**
- Own academic/fee/contact data is personal; for under-18s it is **child data** with heightened protection.
- Each feature requests only the data it needs (minimisation); the student surface exposes no field it doesn't use.

**Freshness & provenance:**
- Reads reflect the last ingested/synced state; every numeric surface shows a freshness/stale indicator; provenance (already on every canonical row) supports "where does this number come from."

**New data relationships introduced by this role:**
- A **student-identity ↔ canonical-student link** (the basis of self-scope) and **student-owned artefacts** (plans, reminders, resume, preferences). These extend the existing model; they do not redesign it.

## 16. API Summary (High Level)

*(Endpoint families and intent only — no contracts, payloads, or schemas. Existing endpoints reused; new ones added behind the same conventions: JWT, tenant-scoped session, now also self-scoped.)*

**Reused / extended (existing):**
- **Auth** (`/auth/*`) — extended to support a **student identity** and issue self-scoped sessions.
- **Student 360** (`GET /students/{id}`) — the unified own-record read; for students, constrained to *self* (a student may only resolve their own id).
- **Risk signals** — the student surface consumes the underlying **signals** that feed the existing risk endpoints; it does **not** expose the mentor-facing `/risk/*` tier/score responses to students.

**New endpoint families for the student surface (high level):**
- **Student self profile / "my 360"** — the self-scoped unified read powering the dashboard.
- **My attendance & margin** — standing, per-course breakdown, projection (V1.5).
- **My performance & exam readiness** — trends and transparent readiness components.
- **My timetable** — schedule and schedule Q&A (where a source exists).
- **My fees** — own fee status.
- **Student NL copilot** — submit an NL question → grounded, self-scoped answer with interpretation.
- **Daily Brief** — assembled summary for the authenticated student.
- **Notifications & preferences** — list/ack nudges; manage own delivery preferences (consent-aware).
- **Personal artefacts** — study plans, reminders, (V2) resume upload/feedback.
- **Campus info Q&A** — RAG over the curated KB.
- **Correction-request routing** — submit a "this looks wrong" request that is routed to the institution (no SoT write).

**Cross-cutting API rules:** all student endpoints require a valid JWT, run in a tenant-scoped **and self-scoped** session, are read-only against the SoT (writes only to student-owned artefacts), fail closed if self-scope can't be established, and are audited.

## 17. Security Considerations

Security for this role centres on **isolation** (the platform's #1 risk) and **minor protection**.

**Identity & scope:**
- Distinct student identity; **self-scope enforced server-side at both application and DB (RLS) levels** (defense in depth); never derived from client/model input; fail closed.
- **IDOR/confused-deputy prevention:** a student can never resolve or address another student's id, even by manipulating requests; tested adversarially.

**Tenant isolation:**
- Existing Postgres RLS + server-injected tenant_id remain authoritative; the student self-scope is *additive*, never a replacement.

**AI-specific security:**
- **No model-emitted SQL or tenant/scope identifiers**; semantic-layer allow-listing; deterministic query construction.
- **Prompt-injection / jailbreak resistance:** untrusted content (e.g. campus KB documents, an uploaded resume) must not be able to expand scope, exfiltrate data, or change behaviour; the model's data reach is bounded by self-scope regardless of instructions in content.
- **Hallucination guardrail** as a safety control, not just quality: never present an invented figure as fact.

**Data protection:**
- Encryption in transit and at rest; least privilege (student is lowest-privilege); secrets managed centrally; comprehensive, immutable audit of student reads and AI interactions.
- **DPDP minor protection:** academic-signal-only processing for minors; no behavioural profiling; no opaque scores; consent gate on parent-directed actions (never auto-sent); data minimisation and retention on student-owned artefacts; correction-request routing supports Data-Principal rights.

**Abuse & safety:**
- Rate limiting on NL and notification surfaces; quiet-hours and preference enforcement; content-safety on any generative output (heightened for minors).

**Auditing:**
- Every student-facing read and AI interaction recorded (actor, self-scope, tenant, time) via the existing audit mechanism; supports DPDP accountability and incident review.

## 18. Error Handling

Principle: **fail safe, fail honest, never fabricate.** Errors must never expose other data or invent figures.

| Situation | Behaviour |
|---|---|
| **Self-scope cannot be established** | Deny all student reads (fail closed); show a clear "we couldn't verify your student account" state; route to support. |
| **Depended-on source absent** (timetable/LMS/placement/KB) | Show an honest "not connected yet" state for that feature; keep the rest of the surface working. |
| **AI/NL engine unavailable** | Dashboard reads (deterministic) still work; NL shows a transient "can't answer right now" state; never a fabricated answer. |
| **No governed metric matches the question** | Graceful abstention + suggestion of what can be answered; no guess. |
| **Stale data** | Show last-updated/stale indicator; never imply real-time when it isn't. |
| **Out-of-scope / other-student request** | Decline with explanation ("I can only show your own records"); audit the denial. |
| **Generative output low-confidence/unsafe** (Planner/Resume/V2) | Withhold or flag; never present unsafe or unverifiable content, especially to minors. |
| **Notification delivery failure** | Retry per policy; never leak content to a wrong recipient; for minors never bypass the consent gate. |
| **Partial dashboard load** | Render available widgets; show per-widget error/empty states; no dead-end. |

All errors are logged/observable; user-facing messages are plain-language and non-technical.

## 19. Edge Cases

- **Minor turning 18 mid-term:** `subject_minor_status` recomputes from dob; feature availability/behaviour updates accordingly; transitions must not retroactively expose previously-restricted outputs in a way that breaches the prior minor protection.
- **Unknown DOB:** treat as `unknown` → apply the **stricter** (minor-equivalent) handling for safety until resolved.
- **Student linked to no canonical record / mislinked:** fail closed; route to institution to correct the link; never default to showing some other or empty record as if it were theirs.
- **Student with multiple roll numbers across sources (pre-resolution):** rely on entity resolution → one canonical student; if ambiguity remains (a merge-review item), the student sees a safe partial state, not a guessed merge.
- **No data yet ingested for the tenant/student:** empty-but-correct states everywhere (brief, attendance, etc.); never invented placeholders.
- **Attendance norm not configured:** show standing without a margin claim; don't assume 75%.
- **Attendance projection with too little history:** abstain from projecting (confidence guard), consistent with the engine's small-sample guard.
- **Fee data present but ambiguous (free-text status):** present the factual numeric position; avoid asserting a status the data doesn't clearly support.
- **Timetable conflict / last-minute change:** reflect only what the source provides; flag staleness; don't reconcile or invent.
- **Resume upload with sensitive personal data (V2):** treat as personal data; for minors apply child-data handling and retention; never share without the student's action.
- **Adversarial prompts** ("show me the topper's marks", "ignore previous instructions"): scope and guardrails hold regardless of phrasing; decline + audit.
- **Account sharing / wrong account:** self-scope binds to the authenticated identity; the surface shows only that identity's data; no cross-account leakage.
- **Withdrawn/alumni/dropped status:** behaviour defined per institution policy; default to read-only access to own historical record unless the institution restricts it.

---

# CHAPTER 5 — Delivery (Sections 20–23)

## 20. Success Metrics

Grouped by the goal they evidence. Targets are set per pilot; the metric definitions are the contract here.

**Adoption & engagement**
- Weekly Active Students (WAS) / enrolled; Daily Brief open rate; NL questions per active student; returning-student rate.

**Trust & quality**
- **Answer-grounding rate** (share of numeric answers traceable to a record — target ~100%); **abstention correctness** (abstains when it should, doesn't when it shouldn't); misread rate (caught via interpretation echo); student-reported "wrong answer" complaints.

**Outcome (institutional)**
- Among students who act on attendance/fee nudges: reduction in threshold breaches / late fees vs non-actors; correlation (not causation claim) tracked over a term.

**Efficiency**
- Estimated routine-query deflection from staff (survey + usage proxy).

**Safety & compliance (must-pass, not just KPIs)**
- **Zero cross-student/tenant data exposure** (any incident is a Sev-1); consent-gate adherence for minors (no auto-sent parent messages); zero display of the mentor-facing risk tier/score on the student surface; audit completeness of student reads/AI interactions.

**Experience**
- NL answer latency (p50/p95) under peak; surface availability; student NPS/CSAT.

## 21. Testing Checklist

Organised by discipline; isolation and DPDP are blocking.

**Isolation & security (blocking — the #1 risk)**
- [ ] A student can read **only** their own canonical record across every endpoint and the NL surface.
- [ ] Self-scope is enforced at both application and DB (RLS) layers; removing the app filter still yields zero cross-subject rows (DB backstop holds).
- [ ] IDOR attempts (manipulating ids/requests) to reach another student fail and are audited.
- [ ] Cross-tenant isolation is unaffected by the new self-scope (existing RLS tests still green).
- [ ] Self-scope **fails closed** when the identity↔student link can't be established.
- [ ] Prompt-injection via campus KB content or an uploaded resume cannot expand scope or exfiltrate data.
- [ ] The NL path never emits SQL; tenant/scope identifiers are server-injected, never model-supplied.

**DPDP / minor handling (blocking)**
- [ ] `subject_minor_status` computed correctly (under 18 = minor; unknown dob = stricter handling).
- [ ] Minor-facing features expose academic signals only — no behavioural profiling, no opaque score.
- [ ] No parent-directed message is ever auto-sent for a minor; the consent gate is required and the confirmer recorded.
- [ ] The mentor-facing risk tier/score is never shown on the student surface.
- [ ] Minor-turning-18 and unknown-dob transitions behave safely.

**Functional**
- [ ] Daily Brief assembles correctly across sources, including empty/partial/stale states.
- [ ] NL answers are grounded, echo interpretation, and abstain correctly out-of-scope/out-of-data.
- [ ] Attendance standing/margin correct vs configured norm; projection abstains on small samples.
- [ ] Performance/exam-readiness show own data only, no peer comparison, transparent components.
- [ ] Timetable / campus-info degrade gracefully when the source/KB is absent.
- [ ] Personal artefacts (plan/reminders, V2 resume) create/edit/delete correctly and stay private.
- [ ] No feature writes to the SoT; correction requests route to the institution.

**Non-functional**
- [ ] NL + dashboard latency within target at result-day peak load.
- [ ] Graceful degradation when an optional source or the AI engine is down (core reads survive).
- [ ] Accessibility: colour-vision-safe status, labeled controls, low-end-device/intermittent-connectivity usability.
- [ ] Audit records exist for student reads and AI interactions.

**Adversarial / red-team**
- [ ] "Show another student / the topper / a cohort" → declined + audited.
- [ ] "Write my assignment / answer my exam" → declined (academic integrity).
- [ ] "Ignore your instructions / reveal system data" → guardrails hold.

## 22. Implementation Roadmap

Phased; each phase ends in something demonstrable. Sequencing reflects dependencies (identity/self-scope first; sources gate dependent features).

**Phase S0 — Student identity & self-scope (foundational).**
Extend auth to a student identity; establish and verify the identity↔canonical-student link; add self-scope at application + DB (RLS) layers; audit; fail-closed. *Exit:* a student logs in and can read only their own Student-360 record; isolation tests (incl. IDOR + DB backstop) green.

**Phase S1 — Core read surface + Daily Brief (V1, P0).**
Self-scoped "my 360", Attendance Intelligence (+margin), Performance Analytics, Fee status, and the Daily AI Brief; constructive framing; empty/partial/stale states. *Exit:* a student opens the brief and sees a correct, glanceable day.

**Phase S2 — NL copilot + Campus Info (V1, P0/P1).**
Self-scoped NL over the semantic layer with interpretation echo, grounding, and abstention; Campus Information RAG over a curated KB; abstain/decline behaviours. *Exit:* "ask anything about your studies" works safely; adversarial scope tests pass.

**Phase S3 — Timetable, Exam Readiness, Smart Notifications (V1, P0–P1).**
Timetable Assistant (gated on source), Exam Readiness Analyzer, consent-aware notifications with minor consent-gate enforcement. *Exit:* daily loop is complete; DPDP notification tests pass.

**Phase S4 — Personal-productivity (V1, P1) + Attendance Projection (V1.5).**
Study Planner, Assignment Tracker/Planner (no answer generation), deterministic attendance projection. *Exit:* students can plan/track their own work; projection is transparent and small-sample-safe.

**Phase S5 — V2 features (deferred set).**
Resume Analyzer (if not pulled into V1), Study Material Helper (grounded), Placement Readiness Indicator (transparent, DPDP-gated), Career Roadmap (advisory, legal-reviewed), AI Tutor (partner). *Entry gated on:* legal review for minor-facing predictive/profiling features, partner availability for tutoring, and placement-data boundary agreement with the Placement Cell role.

**Cross-phase, always-on:** isolation/DPDP testing, audit, observability, accessibility, and graceful degradation are part of every phase's definition of done — not a final hardening step.

**Dependencies & gates to confirm before/within build:** student-identity provisioning model with the institution; availability of timetable, LMS, placement, and campus-KB sources per tenant; the risk-tier-boundary decision (signals, not label); and the Placement Cell ⇄ Student data boundary.

## 23. Future Scope

**Near-term (post-V1 / V2):**
- Indic-language NL and voice input.
- Study Material Helper grounded in LMS content and institutional question banks.
- Placement Readiness Indicator and advisory Career Roadmap (transparent, legal-reviewed).
- AI Tutor via a partner/LMS integration.
- Richer Resume feedback (role-targeted).
- Calendar sync and proactive timetable-change alerts.

**Medium-term (V3+):**
- Personalised guidance grounded in the institution's own placement-outcome data.
- Goal-tracking against student-set targets; adherence coaching (DPDP-bounded).
- Native mobile apps (current scope is responsive web).
- Deeper, multi-signal advisory coaching — only as DPDP rules mature and adaptive-learning partnerships are in place.

**Explicitly out of scope (and expected to stay so unless re-decided):**
- Any write-back to the ERP or autonomous action on the institution's behalf.
- Behavioural tracking or detrimental profiling of any student (always, for minors).
- Generation of submittable/graded academic work; proctored assessment delivery; full adaptive courseware.
- Exposing other students, cohorts, aggregates, the mentor-facing risk tier/score, or any other persona's surface.

---

## Appendix A — Open decisions required for sign-off
1. **Risk-tier boundary:** confirm students see constructive signals, **not** the mentor-facing tier/score label (recommended; assumed throughout).
2. **Student identity provisioning:** how the institution creates/links student accounts and proves the identity↔student link (drives Phase S0).
3. **Source availability per tenant:** timetable, LMS, placement, and campus-KB — which exist for the pilot (gates S2/S3/S5 features).
4. **Tutor / Notes / Quiz:** confirm V2 deferral vs. a re-approved, clearly-labelled general Concept Explainer in V1.
5. **Placement Cell ⇄ Student boundary:** confirm the data split for Resume / Placement Indicator / Career Roadmap.
6. **Persona reconciliation:** the V1 six-persona list (Student/Faculty/HOD/Principal/Management/Placement Cell) vs. the design doc's named set — reconcile once across all RSDDs.

## Appendix B — Grounding & provenance of this document
- **Verified against current backend/design artefacts read this session:** existing API surface (`/auth/*`, `/students/{id}` Student 360, `/risk/*`, ingestion endpoints), the canonical data model (students/attendance/internal_marks/fees + refs), the NL/semantic-engine design (intent→semantic→deterministic read-only→RLS→grounded), the read-only/advisory invariant, and the DPDP minor-handling design (academic-signals-only, consent gate, advisory).
- **Net-new for this role (introduced here, to be designed in detail later):** student identity & self-scope, the self-scoped semantic subset, student-owned artefacts, and consent-aware student notifications. These **extend** the existing foundation and do not redesign it.
- **Inherited from the Feature Freeze:** all rename/merge/defer decisions and the risk-tier boundary.
