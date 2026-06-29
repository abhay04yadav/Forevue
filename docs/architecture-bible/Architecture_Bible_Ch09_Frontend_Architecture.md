# AI ERP Copilot — Architecture Bible

## Chapter 9 — Frontend Architecture

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The client the platform's users actually touch — the technology stack, the design system (tokens, the colour-vision-safe tier language), role-aware navigation, shared components, dashboards/screens, client-side state handling, and the auth/token model the frontend runs under.
**Depends on:** Chapter 1 (MR-1's "mobile-respectful, not mobile-first-native" ruling, Accessibility/Performance principles), Chapter 4 (the JWT/role model the frontend consumes but never enforces), Chapter 7 (the OpenAPI-generated TypeScript client this chapter's only means of reaching the backend), Chapter 8 (the principle that client-side controls are UX, never the security boundary).
**Relationship to the existing build:** The design tokens, the screen-to-endpoint bindings, and the auth/state-management patterns described here are **already implemented**. This chapter also names one real, unresolved discrepancy in the project's own documentation (§3) rather than silently presenting it as settled.

---

### 0. How this chapter builds on Chapters 1–8

Three commitments become concrete frontend decisions here:

1. **"Role gating is UX, not the security boundary"** — this is not a frontend shortcut; it is the *correct* architecture given Chapter 4's RBAC/ABAC model and Chapter 8's Zero Trust posture. The frontend hides what a role shouldn't see for a good experience; the server enforces what a role *cannot* see regardless of what the frontend shows. This chapter is where that division of labor is made explicit and binding.
2. **"Mobile-respectful, not mobile-first-native"** (Ch1 §8 MR-1) — this chapter's responsive-web approach is the architecture that ruling actually produces, not a separate decision.
3. **Contract-first development means the frontend never hand-writes a request shape** (Ch7 §5) — this chapter's entire data layer is built on that guarantee, and treats any deviation from it as a defect.

The organizing idea:

> **The frontend is one client of an API-first platform — a fast, honest one, never an authority.** It renders exactly what the server says is true, asks the server again when in doubt, and is designed so that even a fully compromised or maliciously modified client cannot see or do anything its user's role and attributes don't already permit at the server (Chapters 4 and 8).

---

### 1. Frontend architecture at a glance

```
  USER (faculty mentor / principal / registrar / admin / iqac / hod / placement)
            │
            ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  REACT APPLICATION (Vite-built SPA)                                   │
  │                                                                       │
  │  ROUTING + ROLE-AWARE NAV (§5)     "what this role should see" — UX  │
  │       │                                                              │
  │       ▼                                                              │
  │  SCREENS (§7): Risk Board · Student 360 · Dashboard (privileged)     │
  │       │  bind to ──────────────────────┐                             │
  │       ▼                                ▼                             │
  │  SHARED DESIGN SYSTEM (§4, §6)    SERVER STATE LAYER (TanStack Query) │
  │  tokens · TierBadge · States        cache · invalidation · retries    │
  │       │                                │                             │
  │       └────────────┬───────────────────┘                             │
  │                     ▼                                                │
  │  AUTH/TOKEN LAYER (§9): Axios + JWT access/refresh, single in-flight  │
  │  refresh promise, tokens treated as UI state only — NEVER authority   │
  └──────────────────────────────┬────────────────────────────────────────┘
                                 │  HTTPS, generated client types (Ch7 §5)
                                 ▼
                   BACKEND API (Ch7) — the ONLY security boundary
```

The diagram's one load-bearing label is the bottom line: every box above it is UX, convenience, and presentation; the box at the bottom is where "may this user see this" is actually decided. Nothing in this chapter's design tries to make the frontend a second place that decision gets made — that would be redundant at best and a false sense of security at worst.

---

### 2. Design tenets specific to the frontend

- **Render server truth; never assert client truth.** A risk score, a tier, a finding — every number on screen comes from an API response, never from a value computed or assumed client-side from stale or partial data. The Phase 3 build states this explicitly for the demo: every score and tier rendered is engine-computed, fetched live — design-mockup numbers were illustrative only and are never hardcoded.
- **Don't build what the backend doesn't serve.** Where a screen's design calls for something no endpoint provides (a historical trend line, for instance — see §8), the frontend shows an honest placeholder, not a fabricated chart. Faking a feature the data can't support is worse than admitting it isn't ready yet.
- **One visual language, reused, not reinvented per screen.** The tier color/shape/label treatment (§4) is designed once and is the *same* component everywhere it appears — the board, the 360 view, the dashboard tiles. Consistency here is not a style preference; it's what lets a user's learned pattern ("red square diamond = high risk") transfer across every screen without re-learning it.
- **Design every state, not just the happy path.** Loading, empty, error, and stale are first-class, deliberately designed states (§8) — an empty risk board should read as good news, not a broken page; an error should say what happened and the way forward, never "Oops!"
- **Client-side state is convenience, not authority.** Tokens, cached role information, and locally-stored UI preferences exist to make the experience fast and pleasant; none of them are ever consulted by the *server* to make an authorization decision, and the frontend's own code is written with the explicit assumption that a sufficiently motivated user could alter any of it.

---

### 3. The stack — and an honest discrepancy worth naming now

**The stack as actually resolved and running:** React, TypeScript, Vite, and React Router, with TanStack Query for server-state caching and Axios for HTTP. **There is a real, unresolved gap between two of the project's own documents about which *versions*** — the implementation changelog states React 18 and React Router v6 as the choices made (a reasonable default at the time, absent an explicit spec), while the project's dependency lockfile resolves React 19, React Router 7, TypeScript 6, and Vite 8. This is not a hypothetical risk; it is a present, named discrepancy between documentation and what is actually installed and running.

**Why this matters enough to state in an architecture chapter, not just a changelog footnote.** A future engineer reading the changelog and writing code against React-18/Router-v6 assumptions (e.g., Router v6's data APIs differ from v7's) could introduce a real bug or, at minimum, waste time debugging a mismatch between what they expect and what's actually executing. Architecture documentation that doesn't match the running system is worse than no documentation, because it's actively misleading rather than merely absent.

> **Ruling FE-3.1 — The CHANGELOG's stated stack versions (React 18, React Router v6) must be corrected to match the lockfile's actually-resolved versions (React 19, React Router 7, TypeScript 6, Vite 8) as a near-term documentation fix, not deferred indefinitely.** *Basis: Ch1 driver #4 (maintainability — documentation that contradicts the running system actively degrades it); this item is carried forward to Chapter 15's roadmap as a named, scheduled task rather than left as an open question here.*

**Why this stack, briefly (the choices that *were* deliberate).** React for the ecosystem and component model fit for a dense, data-heavy console; Vite for fast iteration during a product-definition-and-build phase where screens change frequently; TanStack Query specifically because the frontend's primary job is *displaying server state*, not managing complex client-only state — a dedicated server-state library (caching, invalidation, retry, staleness) is the right tool for an app that is, architecturally, a thin rendering layer over the API (§0); Axios for its interceptor model, which is what makes the single-in-flight-refresh pattern (§9) clean to implement.

---

### 4. The design system — tokens first, components second

**Why tokens, not just a component library, are the actual design system.** A component library (buttons, cards, inputs) is necessary but not sufficient — the thing that makes this product's screens *feel* like one coherent system, and the thing a user's eye learns to trust, is a small set of named design tokens applied with discipline everywhere they're relevant:

```
  PALETTE (named roles, not raw hex everywhere):
    a quiet neutral surface · a deep professional ink for text ·
    ONE confident accent for primary actions/links ·
    + the tier severity ramp below

  TIER SEVERITY RAMP (the product's actual visual identity):
    high  → ink #B42318 / fill #B42318 / bg #FBEAE8 / shape: ▪ square
    watch → ink #8A5800 / fill #B07A12 / bg #FAF0DC / shape: ◆ diamond
    low   → ink #1F7A4D / fill #1F7A4D / bg #E7F4EC / shape: ● circle

  ALWAYS rendered as COLOUR + SHAPE + TEXT LABEL together — never colour
  alone. This is the platform's colour-vision-safe accessibility
  commitment made concrete, not a separate a11y checkbox.

  TYPOGRAPHY: 2-3 weight/size roles + TABULAR FIGURES for every number,
  so scores and percentages align in columns at a glance — a console
  that's read under time pressure earns its trust through this kind of
  unglamorous discipline, not through decoration.
```

**Why this specific tier encoding is the chapter's signature decision.** The design brief that produced it was explicit about *why*: this consistent tier language, reused across the board, the 360 score, the history timeline, and the dashboard tiles, **is** the product's visual identity — the brief's own instruction was to spend design boldness here and keep everything else quiet. That instruction is sound architecture, not just taste: a console used daily under time pressure (Ch1 §3 Group E, Performance First) benefits far more from one learnable, consistent signal repeated everywhere than from per-screen visual variety.

**Deliberately avoiding "AI-default" visual choices.** The design brief explicitly steered away from generic-looking patterns (a particular cream-and-serif look, a stark near-black-with-one-acid-accent look, a hairline-rule broadsheet-column look) specifically because they read as templated rather than as a serious institutional tool a principal would trust. Naming this here is a reminder that "the AI generated something plausible" is not the bar — distinctiveness and credibility for *this specific audience* (busy administrators and mentors, not a consumer app's users) is.

> **Ruling FE-4.1 — Design tokens (palette, the tier severity ramp, typography roles) are the platform's actual design system; component implementations consume tokens rather than hardcoding values, and any new screen reuses the existing tier language rather than inventing a new visual encoding for risk/status.** *Basis: Ch1 §3 Group E (accessibility, performance); consistency as a learnability mechanism.*

---

### 5. Navigation & role-aware UX — the single most important frontend security principle

**Role gating is UX-only, and this is correct, not a shortcut.** Navigation items and routes are hidden or shown based on the logged-in user's role (`RequirePrivileged`/`RequireAdmin`-style guards) so that a faculty mentor's home screen is the Risk Board and a principal's is the institution-wide Dashboard — but this gating exists **for a good experience, not as a security control.** The platform's actual security boundary is the server: a `GET /risk/summary` call already enforces tenant and role scope regardless of what the frontend's navigation shows or hides, per Chapter 4's RBAC/ABAC model. This is stated explicitly in the codebase's own auth-guard component as a comment, precisely so a future engineer doesn't mistake a UX convenience for a security mechanism and skip a server-side check believing the frontend already handled it.

**Why this division of labor is the right architecture, not a compromise.** If the frontend tried to *also* be an enforcement point, two bad outcomes follow: either it duplicates Chapter 4's authorization logic client-side (which then must be kept in sync with the server forever, and which a modified client can simply bypass), or — worse — a developer comes to *rely* on the frontend hiding something and skips the real server-side check, creating an actual vulnerability. Keeping the frontend's role-awareness purely cosmetic removes the temptation entirely: there is nothing security-sensitive to get wrong on the client, because nothing security-sensitive is decided there.

**What role-aware navigation actually does.** A faculty (cohort-scoped) user's navigation shows Risk Board only, with no Dashboard item and no route to it — not because they're blocked from a forbidden page, but because the leadership-level institution view simply isn't relevant to their job. A privileged user (principal, registrar, admin) sees both, with Dashboard as their natural landing screen. This mirrors Chapter 4's RBAC groupings (privileged/institution-wide vs. scoped/cohort-limited) directly in the nav structure — the navigation *is* a visualization of the role model, not an independent design.

---

### 6. Shared components — one tier language, reused everywhere

**`TierBadge` as the canonical example of the chapter's reuse principle.** A single component renders tier as colour + shape + label together, consuming the design tokens (§4) rather than hardcoding any of them — and this *exact* component, not a per-screen reimplementation, appears on the Risk Board's rows, the Student 360 view's current-tier display, the dashboard's KPI tiles, and the history timeline. When the severity ramp needs adjusting (a contrast tweak, a new shape for a future tier), it changes in one place and is correct everywhere by construction — the same architectural benefit Chapter 6 got from its mixin-based canonical model (Ch6 §3.2), applied to the frontend's component layer.

**The shared "States" components** (loading, empty, error) follow the same discipline: one `LoadingState`, one `ErrorState` (with a retry affordance and a message in the product's voice, never a generic "Oops!"), reused across every screen that fetches server data, rather than each screen growing its own ad hoc spinner-and-message logic.

**Why this matters beyond tidiness.** A shared component is a single point of accountability for a *behavior*, not just a *look* — when the Risk Board's empty state needed to read as good news rather than a void ("No students in your cohort are flagged right now"), getting that tone right once, in one component, means every future screen reusing `EmptyState` inherits the same considered tone without anyone having to remember to write it again.

> **Ruling FE-6.1 — Tier display, loading/empty/error states, and any other cross-screen visual pattern are built as shared components consuming shared tokens; no screen reimplements its own version of an existing shared pattern.** *Basis: Ch1 §3 Group C (DRY/modularity applied to the frontend); consistency as both a UX and a maintenance property.*

---

### 7. Dashboards & screens

**Two home screens, one system.** The platform's frontend currently centers on two screens that the rest of the system inherits visual language from:

```
  FACULTY RISK BOARD (/board)           DASHBOARD (/dashboard) — PRIVILEGED ONLY
  cohort-scoped (Ch4 ABAC FacultyScope) institution-wide (principal/registrar/admin/iqac)
  "who in MY group needs help, and why"  "how is the WHOLE institution doing"
  ranked list, tier + score + top         KPI tiles + by-department breakdown +
  findings inline + minor badge +         highest-risk-right-now list, all driven
  "log intervention" affordance           by the same tier/severity tokens (§4, §6)
```

**Screen-to-endpoint binding is explicit and exhaustive — no screen guesses its data source.** Every visible element on a screen is mapped, in the implementation guide, to the exact endpoint it binds to:

| Screen element | Endpoint | Note |
|---|---|---|
| Faculty Risk Board | `GET /risk/students?tier=&risk_type=&...` | Role-scoped server-side (Ch4); default filter shows watch+high only — low isn't "at risk." |
| Student 360 | `GET /students/{id}` + `GET /risk/students/{id}` | Profile + tier/score/findings/history/interventions, no separate history endpoint needed. |
| Dashboard tiles | `GET /risk/summary` | Privileged-only screen. |
| Dashboard by-department | `GET /risk/summary/by-department` | High-share % computed client-side from raw counts — display logic, not a new data need. |
| Dashboard trend chart | *(none — see §8)* | Deliberately a placeholder, not a fabricated chart. |

**Render engine values, never mockup values — restated as a binding rule, not a one-time instruction.** The original high-fidelity mockup used illustrative placeholder numbers to communicate design intent; the implementation rule explicitly carried forward was that those numbers are *never* hardcoded in the running application — every score, tier, and finding the user sees is whatever the live API actually returns for their tenant and scope, even when that produces a far less "designed-looking" empty or sparse result than the mockup showed.

**The privileged/scoped split is enforced twice, deliberately, at two different layers.** The Dashboard is hidden from a faculty user's navigation (§5, UX) *and* a faculty user calling `/risk/summary` directly still only receives their own scope back (Ch4's server-side RBAC/ABAC) — the same defense-in-depth posture Chapter 8 established for tenant isolation, applied here to role-based screen access: the UX layer makes the right thing convenient, the server layer makes the wrong thing impossible.

---

### 8. State handling — loading, empty, error, and stale as designed states

**Four states, every screen, none of them an afterthought.**

```
  LOADING     a labeled loading indicator, never a bare spinner with no
              context — "Loading institution overview…" not just motion.

  EMPTY        a directional, positive message when there's genuinely
              nothing to show ("No students in your cohort are flagged
              right now") — emptiness reads as good news, not a bug.

  ERROR        states what happened and the way forward, with a retry
              affordance wired to the actual failed query — never a
              generic "Oops! Something went wrong" with no recovery path.

  STALE        a calm, non-blocking note when the underlying risk
              computation is out of date (e.g. the latest import's
              recompute status is partial/failed) — visible, not
              alarming, with a link to the place a re-run can be
              triggered.
```

**The deferred-trend example, as a model for how to handle "the design wants something the data can't yet support."** The original screen design included a "risk trend over time" chart; no endpoint currently serves the historical weekly tier counts that would require, and a new pilot college has no such history yet regardless. The binding instruction, carried through to implementation, was explicit: **do not build that endpoint in this pass, and do not fake the chart.** The frontend shows an honest placeholder ("Trend builds as risk data accumulates") instead. This is the chapter's clearest instance of tenet §2's "don't build what the backend doesn't serve" — and it's a pattern worth reusing whenever a future screen's design outruns the current data model: name the gap, show it honestly, and treat building the real thing as a separate, explicitly scoped task rather than quietly approximating it.

---

### 9. Auth & token handling on the client

**The token contract matches the backend exactly — no parallel auth model.** The frontend's JWT access/refresh handling is built directly against the existing backend auth contract (Ch4 §2); there is no separate frontend-specific authentication surface introduced for convenience.

**Where tokens live, and the explicit boundary on what that means.** Tokens are held in memory and in `localStorage` for persistence across reloads — and this is **explicitly documented in the code itself** as never trusted for authorization decisions, used only for UI state (e.g., "is someone logged in, so show the authenticated layout"). The actual security boundary remains the server (Ch8 §2's Zero Trust posture) regardless of where or how the token happens to be stored client-side. Naming the storage choice's limits in the code, not just in this chapter, is exactly the kind of documentation that prevents a future engineer from accidentally treating client-stored state as authoritative.

**Collapsing concurrent token refreshes — a real reliability detail worth specifying as a pattern.** Multiple simultaneous API calls can hit an expired access token at once; without coordination, each would independently trigger its own refresh request. The frontend's Axios response interceptor instead maintains a **single in-flight refresh promise** — the first 401 triggers one `/auth/refresh` call, and every other concurrent 401 awaits that same in-flight promise rather than firing its own. A failed refresh clears tokens and routes to `/login`. This is a small mechanism, but it's the kind of correctness detail (avoiding a refresh-token race that could otherwise invalidate itself or create duplicate refresh calls) that distinguishes a frontend built to be *correct under concurrency*, not just correct in the common single-request case.

---

### 10. Contract conformance — the frontend never guesses a shape

**The frontend's only means of describing a request or response is the generated client.** Per Chapter 7 §5's contract-first ruling, TypeScript types are generated from the backend's OpenAPI spec (itself generated from the same Pydantic models that validate every request) — re-exported by name from one central types file rather than used as scattered inline imports, so that a future schema regeneration needs review in exactly one place, not a grep across the codebase.

**`tsc --noEmit` as a build-blocking contract test, restated as a frontend-architecture commitment, not just a CI detail.** A frontend change that doesn't match the current backend contract fails to *compile*, not just fails at runtime in a user's browser. This is the frontend-side enforcement of Chapter 7's "drift is impossible by construction" claim — it only holds as a real guarantee if the frontend actually treats a type-check failure as a hard stop, which this chapter records as binding practice, not optional discipline.

> **Ruling FE-10.1 — No frontend code constructs a request payload or reads a response field outside the generated client types; `tsc --noEmit` passing against the current OpenAPI-generated types is a release gate, not a suggestion.** *Basis: Ch7 §5 (API-5.1); eliminates an entire class of integration bugs at compile time rather than discovering them in production.*

---

### 11. A real frontend failure mode, and the generalizable lesson in it

**The bug.** During verification, a faculty user signing out and a principal then logging in on the same browser tab produced a real defect: the principal's login landed on the faculty user's last-visited student page instead of the principal's expected dashboard/board landing screen.

**The root cause, precisely, because the mechanism is the lesson.** The route guard's redirect-to-login logic attaches the page being left as a "return to this after login" value for *any* unauthenticated render — including a deliberate sign-out, not just an expired-session redirect. Reordering the sign-out handler's logout/navigate calls did not fix it, because the actual failure was a **timing race**: the imperative navigation's history update and the auth context's "user is now null" state update do not reliably land in the same React render commit, so the route guard's stale-location render could clobber an explicit "go to login with no return-page" instruction with its own default "remember where I was."

**The fix, and why it was deliberately *not* more React state.** The fix uses a plain module-level flag, set synchronously by the sign-out handler before logout fires, checked by the route guard without depending on a React render to see it, and cleared once the login page actually mounts. This was a deliberate choice: the failure mode *was* a render-timing race, so another piece of React state would have been exactly as vulnerable to the same race — the fix needed something that doesn't wait for a commit to be visible.

**The generalizable lesson — and why it's the frontend's mirror of Chapter 8's audit-actor-attribution lesson.** Chapter 8 (§7) named a backend case where an accountability mechanism's correctness depended on understanding the runtime's *actual* execution model (context variables not propagating across copied execution contexts) rather than assuming a simpler mental model. This frontend bug is the same lesson from the opposite side of the API: **a client-side correctness guarantee that depends on "this state update and that state update land together" needs to be verified against React's actual commit-timing behavior, not assumed from how the code reads.** Both cases were caught by the same discipline — debug logging that confirmed the actual order of events, not just inspection of the code's apparent logic — and both were fixed by reaching for a mechanism that doesn't depend on the assumption that turned out to be false.

---

### 12. Accessibility & responsive design

**Accessibility floor, applied as baked-in defaults, not an afterthought pass.** Labeled form fields; tier badges rendered with colour, shape, *and* text label together (§4) so the platform's most important visual signal is never colour-only; visible focus-visible states on every interactive element; respect for reduced-motion preferences. This is the concrete delivery of Chapter 1's Accessibility principle (Ch1 §3 Group E) for this specific product's signature visual element.

**Responsive, not native-first — the literal expression of Chapter 1's MR-1 ruling.** A mentor opening the Risk Board on a phone between classes is an expected, designed-for use case, not an edge case — the layout collapses sensibly at mobile widths (the navigation rail folds away, grids go single-column) rather than assuming a desktop-only audience. This is "mobile-respectful" exactly as Chapter 1 scoped it: a fully responsive web experience, with native app parity explicitly out of scope for v1.

---

### 13. The minor-consent UI — a designed flow, not a nag

**Carrying Chapter 4/8's hardest rule into an actual interface moment.** Creating a `parent_contact` intervention for a student whose `subject_minor_status` is `minor` or `unknown` (Ch4 §6's fail-safe attribute) requires an explicit consent-confirmation step in the UI before the request is sent — and the server enforces the same requirement independently (a request without `guardian_consent_confirmed=true` for an in-scope minor is rejected), so the UI step is a courtesy that prevents a doomed request, not the actual gate.

**Designed deliberately, not bolted on.** The product's own design direction for this moment was explicit: the consent confirmation should read as **a deliberate step the user is making a real decision about, not a nag dialog to click through.** This matters because a UI that makes a consent gate feel like friction trains users to click past it without reading — exactly the wrong outcome for a control that exists because of a statutory child-protection requirement (Ch8 §9). Non-parent intervention types remain unrestricted regardless of minor status — the friction is scoped precisely to the one action category the law actually cares about, not applied indiscriminately.

**Minor status is visible, not hidden, wherever it's relevant.** A small, consistent badge marks minor students on both the Risk Board row and the Student 360 view — visible context for the mentor *before* they reach the consent gate, not a surprise that appears only at the moment of creating the intervention.

---

### 14. Failure & degradation (frontend-specific)

| Failure | Behaviour | Why |
|---|---|---|
| **Access token expired mid-session** | Single in-flight refresh promise; concurrent requests await it rather than each refreshing independently; failure clears tokens and routes to `/login`. | §9; avoids a refresh race or duplicate refresh calls. |
| **A query fails (network/server error)** | The shared `ErrorState` component renders with a specific message and a retry action wired to the actual failed query. | §6, §8; never a generic dead-end. |
| **A screen's data is genuinely empty** | The shared `EmptyState` component renders a directional, positive message specific to that screen's context. | §6, §8; emptiness ≠ brokenness. |
| **The latest risk computation is stale/partial/failed** | A calm, non-blocking note appears, linking to the place a re-run can be triggered — never a silent display of outdated numbers as if current. | §8; honesty about data freshness. |
| **A user attempts to navigate to a role-inappropriate route by URL** | The route renders nothing useful for their role (or redirects), but more importantly, any data the page would have fetched is still scoped correctly by the server regardless. | §5; the server, not the route guard, is the real boundary. |
| **The frontend's stale CHANGELOG-vs-lockfile stack documentation causes confusion** | Tracked as a named, scheduled documentation fix (§3, FE-3.1), not silently left to cause future debugging time loss. | Ch1 driver #4. |

---

### 15. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **FE-3.1** | Stack documentation | Correct the CHANGELOG to match the lockfile's actually-resolved versions; scheduled as a near-term fix | Leaving the documentation mismatch unaddressed | Ch1 driver #4 |
| **FE-4.1** | Design system foundation | Tokens (palette, tier ramp, typography) as the actual design system; components consume tokens | Component-library-first with hardcoded values per component | Ch1 §3 Group E; consistency |
| **FE-6.1** | Component reuse | Shared components (TierBadge, States) for every cross-screen pattern; no per-screen reimplementation | Per-screen bespoke implementations of the same pattern | Ch1 §3 Group C; maintainability |
| **FE-10.1** | Contract conformance | Generated client types only; `tsc --noEmit` as a release gate | Hand-written request/response shapes | Ch7 API-5.1 |
| **FE-13.1** | Minor-consent UI | An explicit, deliberate confirmation step for `parent_contact` only, scoped narrowly; server independently enforces it | A blanket consent dialog for all intervention types; relying on the UI step alone | Ch4 §6; Ch8 §9 |

---

### 16. How this chapter governs the rest of the Bible

- **Chapter 4 (IAM)** and **Chapter 8 (Security)** are the authorities this chapter's UX-only role gating (§5) explicitly defers to — this chapter adds no new authorization logic anywhere.
- **Chapter 7 (API & Integration Standards)**'s generated-client contract (§5, §10) is this chapter's only data-access mechanism; any future API versioning (Ch7 §4) is a regeneration of this chapter's types, not a manual update.
- **Chapter 10 (DevOps)** operationalizes the frontend build pipeline (Vite), the `tsc --noEmit` release gate (§10), and should pick up the FE-3.1 documentation-correction task in its own backlog.
- **Chapter 12 (Engineering Standards)** should adopt this chapter's "render server truth, design every state, tokens-first" tenets (§2) as binding frontend coding standards, not merely architectural intent.
- **Chapter 14 (Testing)** owns the Playwright-style verification this chapter's screens already rely on (the role-scoping and minor-consent-gate acceptance tests named in §7/§13), and should add a regression test for the specific redirect-timing bug in §11 so the fix's invariant (no stale `from` survives a deliberate sign-out) stays verified.
- **Chapter 15 (Implementation Roadmap)** should carry forward FE-3.1 (the CHANGELOG/lockfile stack-version correction) as a named, scheduled item — it is referenced here, not resolved here.

New frontend tensions are added to this ledger (§15) by amendment.

---

### 17. Sign-off

This chapter is normative once ratified. Amendments to the role-gating-is-UX-only principle (§5) or the minor-consent UI requirements (§13) require Architecture Review Board approval; §13 amendments additionally require alignment with Chapter 8's legal-review gate on minor-handling changes.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal UX Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Security Architect | | ☐ Approve ☐ Revise | |
| Principal API Architect | | ☐ Approve ☐ Revise | |
| Chief Product Officer | | ☐ Approve ☐ Revise | |

---

*End of Chapter 9 — Frontend Architecture.*
