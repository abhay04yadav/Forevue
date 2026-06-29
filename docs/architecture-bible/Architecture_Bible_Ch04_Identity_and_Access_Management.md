# AI ERP Copilot — Architecture Bible

## Chapter 4 — Identity & Access Management

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** Who the platform lets in, what it lets them do, and how it tells one college apart from another at the access-control layer — Authentication, Authorization (RBAC), Attribute-Based Access Control (ABAC), and Multi-tenancy.
**Depends on:** Chapter 1 (driver #1 isolation, hard constraint §4.1, the minor-protection invariant §2.5), Chapter 2 (the Control Plane §7, pooled tenancy AD-6.1), Chapter 3 (server-side scope injection into the Context Builder, role-gated AI tool menu).
**Explicitly out of scope here (→ Chapter 8, Security Architecture):** Zero-trust network posture, encryption in transit/at rest, the audit-log mechanism itself, DPDP compliance program detail, AI-plane adversarial threats, and the cross-tenant red-team program. This chapter builds the *identity and access* primitives; Chapter 8 builds the *defensive posture* around the whole platform that consumes them. Where the two would otherwise overlap — tenant isolation, minor handling — this chapter owns the **mechanism** (how identity and attributes encode it) and Chapter 8 owns the **threat model and verification** (how we prove it holds under attack).

---

### 0. How this chapter builds on Chapters 1–3

Three commitments already made become concrete machinery here:

1. **"Tenant id is resolved server-side from the verified session — never from input or model output"** (Ch1 §4.1, Ch3 §4) is, at its root, an *identity* claim: it can only be true if the identity system is the single, trusted source tenant and role are derived from. This chapter is where that trust is established.
2. **Pooled multi-tenancy with isolation in depth** (Ch2 AD-6.1) needs a concrete *tenant-resolution* story — how a request even knows which college it belongs to before any data is touched. That story lives here.
3. **The AI plane only offers a role-scoped menu of metrics** (Ch3 §4) presumes an authorization model expressive enough to gate *what a role may even see*, not just what it may do. RBAC alone is coarse for that; this chapter introduces ABAC specifically to close that gap.

The organizing idea for the whole chapter:

> **Identity answers "who and where"; RBAC answers "what kind of person"; ABAC answers "given the specific thing in front of you, is this actually allowed."** All three layers ride together on every request, and the third is what stops a correct role from making a wrong decision about a specific student, a specific consent state, or a specific cohort.

---

### 1. IAM at a glance

```
  LOGIN  ──► resolve TENANT (by slug) ──► verify credentials ──► issue JWT
                                                                  { sub, tenant_id, role, exp }
  EVERY REQUEST after login:
       JWT verified  ──►  tenant_id + role extracted (server-side, authoritative)
                     ──►  session opened, tenant context SET on the connection
                     ──►  RBAC gate: does this ROLE have this capability at all?
                     ──►  ABAC gate: given THIS record's attributes (minor status,
                          cohort/scope, consent state, tier...), is it actually allowed?
                     ──►  ALLOW (scoped) or 404 (existence hidden) or 403 (capability denied)
```

Two rings of authorization, not one: **RBAC** is the coarse switch ("can a `faculty` ever do this kind of thing"); **ABAC** is the fine-grained check against the *specific* record's attributes ("can *this* faculty member act on *this* student, given *this* consent state"). Most real decisions in this product — a faculty viewing a risk board, a parent-contact intervention for a minor — require both, in that order.

---

### 2. Authentication

**Mechanism.** Username/email + password, tenant-qualified. Passwords are hashed with **Argon2** — chosen over bcrypt/PBKDF2 because it is the current best-practice for password hashing with tunable memory hardness, resisting GPU-based cracking better at equivalent CPU cost. A successful login issues a short-lived **access token (JWT)** and a longer-lived **refresh token**.

**Why tenant-qualified login (a real constraint, not a preference).** The same email can exist under different colleges — a faculty member could plausibly teach at two client institutions with the same address — so the identity model treats `(tenant, email)` as the unique key, not email alone. Login therefore takes `{tenant_slug, email, password}`, and tenant resolution happens *before* credential verification.

**The JWT contract.** The token carries exactly:

```
{ sub: user_id, tenant_id: <uuid>, role: <one of the locked roles>, exp: <timestamp> }
```

This is deliberately minimal — the smallest claim set that lets every downstream layer (RBAC, ABAC, RLS) work without a database round-trip on every request, and small enough that nothing sensitive rides in a token that could be intercepted or logged. **The token is the single, authoritative source of tenant and role for the request's lifetime.** No other input — not a header, not a query parameter, not a value the AI model returns — is ever consulted for these two facts (Ch1 §4.1). This is the load-bearing rule of the entire chapter.

**Session lifecycle.** Short access-token lifetime bounds the damage of a stolen token; the refresh token allows silent renewal without re-login and can be revoked server-side to force re-authentication (e.g. on role change, suspected compromise, or offboarding). Privileged roles (admin and above) additionally require **SSO/MFA** — a stronger authentication bar for the accounts whose compromise has the widest blast radius.

**Why not session cookies / server-side sessions (comparison).** *Option A — server-side session store (Redis-backed).* Centralizes revocation, but adds a stateful dependency the API must consult on every request, and complicates the modular-monolith-to-services extraction path (Ch2 AD-2.1) — every extracted service would need access to the session store. *Option B — stateless JWT (RECOMMENDED).* Self-contained, verifiable anywhere without a shared store, naturally fits the "any service can validate a request" property the platform will need once the AI plane or ingestion workers are extracted (Ch2 §9). The cost — revocation requires either short expiry or an explicit denylist — is accepted and mitigated by short access-token lifetimes plus refresh-token revocation.

> **Ruling IAM-2.1 — Stateless JWT authentication, tenant-qualified login, short-lived access tokens with revocable refresh tokens, MFA for privileged roles.** *Basis: Ch2 AD-2.1 (extraction-friendly); Ch1 driver #1.*

---

### 3. Multi-tenancy — the identity-layer half

Chapter 2 ruled on the *topology* (pooled, AD-6.1); Chapter 8 will own the *isolation enforcement* (RLS, defense in depth). This chapter's job is the piece in between: **how does a request acquire a trustworthy tenant identity in the first place?**

**Tenant resolution at the boundary.** The `tenants` table is the one table in the system that is *not* tenant-scoped — by definition, since it's the list of tenants. Login resolves the tenant by slug **before** any tenant-scoped query runs, avoiding a chicken-and-egg problem (you cannot look up a user inside a tenant context you don't have yet). Once resolved, every subsequent action for that session carries the tenant id from the verified JWT, never from the slug again.

**Tenant context propagation.** At the start of every request, after the JWT is verified, the platform opens a database session and sets the tenant context *on that session* for the duration of its transaction. This is the precise mechanical link between identity (this chapter) and isolation enforcement (Chapter 8's RLS floor): the identity layer's only job is to put the *right* tenant id in front of the database; the database's job, covered in Chapter 8, is to refuse to return anything else.

**Multi-tenancy as an identity concern, not just a data concern.** Two further IAM-specific implications of pooling:

- **Roles are tenant-local.** An `admin` at College A has no standing whatsoever at College B — there is no "global admin" role that spans tenants in the product's access model. Cross-tenant administrative tooling (for Anthropic-side... rather, for the platform operator) is a separate, explicitly audited operator path, not a tenant role.
- **One identity, one tenant, per session.** A user is not "logged into multiple colleges at once" within a session; switching tenants (e.g. a consultant working with several colleges) requires a fresh login against the target tenant's slug. This keeps "which tenant is this request for" unambiguous everywhere downstream — a property the ABAC and RBAC layers both depend on.

**The documented escape hatch.** Per Ch2 AD-6.1, a marquee tenant with a contractual isolation requirement the pool cannot meet may run in a dedicated silo. At the identity layer this changes *which* identity provider/database a login resolves against, not the shape of the JWT or the RBAC/ABAC model — the escape hatch is invisible above the tenant-resolution step.

---

### 4. The authorization model — three rings, two mechanisms

Authorization in this platform is not a single check; it is a sequence of three nested questions, answered by two distinct mechanisms:

```
  RING 1 — TENANT     "which college"          → identity layer (§3) + RLS floor (Ch8)
  RING 2 — ROLE        "what kind of action"    → RBAC (§5)
  RING 3 — ATTRIBUTE   "is THIS specific case allowed" → ABAC (§6)
```

RBAC is necessary but not sufficient for this product. "A `faculty` user may view risk assessments" is a true and useful RBAC statement — but it says nothing about *which* students, and nothing about whether a *specific* action (contacting a parent) is permitted given a *specific* student's consent state. Those are not properties of the role; they are properties of the data and the moment. That gap is exactly what ABAC closes, and it is why this chapter — unusually for an enterprise IAM chapter — treats ABAC as a first-class, not optional, layer.

---

### 5. Role-Based Access Control (RBAC)

**The locked role set.** `admin · principal · registrar · iqac · faculty · student`, with **HOD** and **Placement Cell** added as deliberately scoped additional personas (their detailed boundaries are fixed in the RSDDs and are not re-litigated here — this chapter only fixes how the *mechanism* enforces whatever boundary a role is given).

**What RBAC decides.** Roles are coarse, capability-level gates: which API operations and which categories of semantic-layer metric a role may invoke *at all*. They answer "is this kind of thing within this role's job," not "is this specific record within reach." Two practical groupings recur throughout the product and are worth naming because they recur in every chapter that touches authorization:

```
  PRIVILEGED / institution-wide visibility:  admin · principal · registrar · iqac
  SCOPED / cohort-limited visibility:        faculty · hod
  SELF-SCOPED:                               student (once identity exists, §9)
  PURPOSE-SCOPED:                            placement cell (consent-gated external surface)
```

**A documented correction, carried forward honestly.** An earlier specification referred to a "management" role in a full-visibility list; the locked role set has no such role. The faithful resolution — recorded as policy here, not improvised per-feature — is that "full visibility" means *every role besides faculty and student* (i.e., admin, principal, registrar, iqac), and any future "Management" persona must either map onto one of these or be added to the locked set through the same Feature-Freeze process every other role went through. RBAC checks are written against the **locked set**, never against an informally assumed role name.

**404-not-403 for capability *and* existence.** When a role lacks the capability outright, or when a record exists but is out of the caller's scope, the response is **not-found**, not **forbidden** — the platform does not confirm to a caller that something exists which they may not see (Ch1 §3 Group A). This rule is enforced uniformly by RBAC for capability denial and by ABAC (§6) for scope denial; from the caller's perspective the two are indistinguishable, which is the point.

**RBAC gates the AI's menu before the model reasons.** A role's permitted metrics and grains determine what even appears in the governed schema the Context Builder shows the model (Ch3 §4 step 3). This closes the prompt-injection escalation path at the source: the model cannot select what RBAC never put in front of it.

> **Ruling IAM-5.1 — RBAC checks are written exclusively against the locked role set (six base roles + HOD + Placement Cell); any undocumented role name encountered in a spec is resolved by explicit decision, never inferred at the call site.** *Basis: traceability; avoiding silent privilege drift.*

---

### 6. Attribute-Based Access Control (ABAC)

**Why RBAC alone is not enough here.** This product's hardest access decisions are not "what can a faculty member do" but "can *this* faculty member act on *this* student, given *this* student's current attributes." Three real examples already locked into the build make the point concretely:

```
  EXAMPLE 1 — Cohort scoping
    A faculty member's visible student set is not "all students" or "no students" —
    it is computed from FacultyScope attributes (scope_type ∈ {department, programme,
    course, section}, scope_ref) joined against each student's department/programme/
    enrollment. Two faculty with the SAME role see DIFFERENT students.

  EXAMPLE 2 — Minor-consent gating
    Creating a parent_contact intervention requires guardian_consent_confirmed=true
    when the TARGET student's subject_minor_status attribute is "minor" or "unknown"
    (fail-safe: unknown DOB is treated as minor). The SAME role (faculty, registrar,
    admin) creating the SAME intervention TYPE is allowed or denied purely based on
    the target's attribute and the request's consent attribute — not on role at all.
    Non-parent intervention types are unrestricted regardless of minor status.

  EXAMPLE 3 — Privileged-visibility roles
    "Full institutional visibility" is not one role but an attribute of a small role
    set (admin, principal, registrar, iqac) checked as has_full_visibility(role) —
    itself a tiny attribute predicate over the role claim, composed with the
    cohort-scoping predicate above for everyone else.
```

None of these is expressible as a static role-permission table. Each is a **policy evaluated against attributes of the subject (the caller), the resource (the target record), and sometimes the action itself** — the definition of ABAC.

**The attribute taxonomy.** Four attribute classes recur across the product and are worth fixing as the platform's standard vocabulary, so every future feature reuses them instead of inventing new ad hoc checks:

| Attribute class | Examples | Where it lives |
|---|---|---|
| **Subject attributes** (the caller) | `role`, `user_id`, `FacultyScope` rows (scope_type/scope_ref) | JWT (role) + a scoped lookup table (FacultyScope) |
| **Resource attributes** (the target) | `subject_minor_status`, `department`/`programme`/`enrollment`, `tier` (risk), `tenant_id` | Canonical/derived fields on the record itself |
| **Action attributes** | intervention `type` (e.g. `parent_contact` vs `mentor_meeting`), the governed metric being requested | The request itself |
| **Environment / consent attributes** | `guardian_consent_confirmed`, consent-lifecycle state (given/withdrawn), DPDP purpose tag | Request payload + consent records |

**The policy-decision pattern.** Every ABAC check in the platform follows the same shape, so it is auditable and testable uniformly rather than bespoke per feature:

```
  decision = POLICY( subject attributes, resource attributes, action, environment )
           → ALLOW | DENY-as-404 (out of scope) | DENY-as-422/403 (consent/precondition not met)
```

Concretely: cohort scoping resolves a *set* of permitted resource ids from subject attributes, and any resource outside that set is **404** (Example 1 — a scope failure looks like absence). Minor-consent gating is a *precondition* check at write-time, and its failure is a **422/403 with a clear reason** ("guardian consent required"), not a silent 404 — because the caller already knows the student exists; what's missing is a fact about the *action*, not the resource's visibility. This distinction (scope failure → hide; precondition failure → explain) is itself part of the chapter's standard, not an inconsistency.

**Why ABAC is implemented as composable predicates, not a generic policy engine (comparison).**

- *Option A — a generic externalized policy engine (e.g. a rules/policy DSL evaluated out-of-process).* Powerful and eventually attractive at scale (uniform policy authoring, central audit of policy changes), but it is a new moving part, a new failure mode, and a latency hop on every authorization decision — premature for v1 (Ch1 §5, avoid premature scaling) and in tension with the modular-monolith posture (Ch2 AD-2.1).
- *Option B — attribute predicates as ordinary, tested application code, composed per use case (RECOMMENDED for v1).* `has_full_visibility(role)`, `visible_student_ids(...)`, `requires_guardian_consent(student)` are plain functions, unit-tested like any other logic, called from the repository/service layer alongside RBAC checks. This keeps ABAC inside the same Clean/Hexagonal layering (Ch1 §3 Group C) as everything else, with no new infrastructure.
- The seam for Option A is kept open (the predicates are already factored as named, composable functions rather than inlined conditionals) so a future policy engine could subsume them without a rewrite, mirroring the "logically event-driven, infra deferred" pattern already used for ingestion (Ch1 §8 MR-2).

> **Ruling IAM-6.1 — ABAC is implemented as named, composable, unit-tested attribute predicates inside the application layer for v1; a generalized externalized policy engine is a later-scale option, not a v1 build.** *Basis: Ch1 §5; Ch2 AD-2.1.*

**ABAC and minors — the sharpest case, stated once, precisely.** `subject_minor_status` is computed at the resource layer from date of birth and takes three values: `minor`, `adult`, `unknown`. **Unknown is treated as minor** — the fail-safe default required by the asymmetry of the harm (Ch1 §4.5). This single attribute is then consulted by every policy that touches a student record where age-appropriate handling matters (parent-contact gating here; the AI plane's behavioural-monitoring exclusion in Chapter 3; consent-gated external sharing in the placement context). Defining it once, as a resource attribute rather than re-deriving age logic per feature, is precisely what makes ABAC the right tool: one attribute, enforced consistently everywhere it matters, instead of N independent age checks that could drift out of sync.

---

### 7. RBAC + ABAC together — the combined decision

In practice, almost every authorization check on this platform composes both rings. The general shape:

```
  1. RBAC:  does this ROLE have the CAPABILITY at all?            (coarse, fast, role-only)
       NO  → deny (404 if it would reveal existence, else plain capability error)
       YES → continue
  2. ABAC:  given the SPECIFIC resource/action/environment attributes, is it allowed?
       compute the permitted resource set / evaluate the precondition
       NOT IN SCOPE        → 404 (existence hidden)
       PRECONDITION UNMET  → explicit error naming the missing precondition
       ALLOWED              → proceed
```

This two-step composition is why a **faculty member with full RBAC capability to "view risk assessments"** can still get a 404 for a specific student (ABAC: not in their FacultyScope) and why an **admin with full RBAC capability to "create interventions"** can still be blocked from creating a `parent_contact` intervention for a specific minor without recorded consent (ABAC: precondition unmet) — the *same role*, two *different* outcomes, both correct, because the attributes of the specific case differed. This is the concrete, mechanical answer to the design tension Chapter 1 flagged only abstractly: RBAC sets the ceiling of what a role can ever do; ABAC decides whether *this* instance clears the bar.

---

### 8. Identity lifecycle

**Provisioning.** A tenant's first user is created at registration (self-serve college signup creates a `Tenant` and its first `admin` user atomically); subsequent users are provisioned by an admin within that tenant. There is no path to create a user without an owning tenant.

**Role changes.** Changing a user's role takes effect from their next token issuance (login or refresh) — a deliberate trade-off (§2) accepted because access-token lifetimes are short. A security-critical role change (e.g. demoting a compromised admin account) can force this immediately via refresh-token revocation rather than waiting for natural expiry.

**Deprovisioning.** Disabling a user invalidates future logins and revokes outstanding refresh tokens; any still-live short access token expires naturally within its short window. Deprovisioning never deletes the user's historical audit trail (Chapter 8 owns the audit mechanism; this chapter only notes that deprovisioning is a status change, not data destruction — consistent with Ch1 §4.7's no-silent-data-destruction rule).

**FacultyScope changes are an access-control event, not just a data edit.** Because cohort visibility is computed live from `FacultyScope` rows (§6, Example 1), reassigning a faculty member's department/section takes effect on their very next request — there is no separate "permissions cache" to invalidate, because there is no cache; the ABAC predicate is recomputed per request from current scope rows. This is a deliberate simplicity choice (correct-by-construction over fast-but-stale) appropriate at v1 scale, revisited only if scope-resolution latency becomes a measured problem.

---

### 9. The open dependency: student identity does not yet exist

Stated plainly, because an IAM chapter is the right place to be unambiguous about it: **students currently exist as canonical data rows, not as authenticated users.** There is no student login, no student session, and therefore no student-self ring of the authorization model (§4, Ring 3 for the `student` role) to actually exercise yet. This is not a gap in this chapter's design — the model is ready, since "a student is simply a role whose ABAC predicate is `resource.student_id == subject.user_id`" — it is a gap in what has been *built*. **No student-facing self-service feature ships before this identity mechanism exists.** This dependency gates the entire Student RSDD and is recorded here as the chapter's most important open item, not buried in a future-work footnote.

---

### 10. Failure & degradation (IAM-specific)

| Event | Behaviour | Why |
|---|---|---|
| **Expired/invalid JWT** | Request rejected before any tenant context is set; no data touched. | Identity failure fails closed at the earliest point. |
| **Token claims a tenant/role that no longer exists or was changed** | Re-verified against current state at sensitive operations (e.g. role-gated writes); stale role cannot escalate privilege beyond what current FacultyScope/role state allows for ABAC checks, which are recomputed live (§8). | Live ABAC recomputation bounds the risk of a short authorization lag. |
| **FacultyScope row missing/misconfigured for a faculty user** | Resolves to an empty visible set (no fallback to "all students"). | Fail-safe default is *less* access, never more. |
| **Unknown DOB on a student record** | `subject_minor_status = unknown`, treated as `minor` everywhere a minor check applies. | Fail-safe for the protected class (§6). |
| **Ambiguous/undocumented role name in a spec or import** | Resolved by explicit decision against the locked set (§5); never inferred silently at the call site. | Prevents silent privilege drift. |

---

### 11. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **IAM-2.1** | Authentication | Stateless JWT, tenant-qualified login, short access + revocable refresh, MFA for privileged roles | Server-side session store | Ch2 AD-2.1; Ch1 driver #1 |
| **IAM-5.1** | RBAC scope | Checks written only against the locked role set; undocumented roles resolved explicitly | Inferring roles ad hoc | Traceability |
| **IAM-6.1** | ABAC implementation | Named, composable, unit-tested attribute predicates in-application | Generalized externalized policy engine (v1) | Ch1 §5; Ch2 AD-2.1 |
| **IAM-6.2** | Minor attribute | `subject_minor_status` (minor/adult/unknown) as a single, reused resource attribute; unknown→minor | Per-feature age re-derivation | Ch1 §4.5; consistency |
| **IAM-8.1** | Scope freshness | FacultyScope/ABAC recomputed live per request, no permissions cache | Cached permissions with invalidation | Correctness over premature optimization |

---

### 12. How this chapter governs the rest of the Bible

- **Chapter 5 (ERP Integration)** consumes the identity model for service-to-service/connector authentication and inherits tenant-scoped sessions for every sync.
- **Chapter 6 (Data Architecture)** stores the attributes this chapter's ABAC predicates read (`subject_minor_status`, `FacultyScope`, consent state) as governed, canonical fields — not derived ad hoc per query.
- **Chapter 7 (API & Integration Standards)** specifies the JWT contract, the 404-vs-403/422 response contract, and the auth header conventions as binding API surface.
- **Chapter 8 (Security Architecture)** takes the tenant-resolution mechanism from §3 and builds the RLS enforcement floor and defense-in-depth isolation around it, and owns the audit trail that records every RBAC/ABAC decision.
- **Chapter 9 (Frontend)** implements role-aware navigation and the minor-consent UI gate as client-side reflections of the server-side ABAC truth (never as the authority).
- **Chapter 14 (Testing)** owns the RBAC/ABAC test matrix: every locked role × every documented attribute precondition, exhaustively.

New IAM tensions are added to this ledger (§11) by amendment; amendments touching minor-status handling (§6, §9) require legal review per Ch1 §4.5.

---

### 13. Sign-off

This chapter is normative once ratified. Amendments to the JWT contract (§2), the RBAC role set (§5), or the ABAC minor-attribute rule (§6) require Architecture Review Board approval; §6 amendments touching minors additionally require independent legal (DPDP) review.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal Security Architect | | ☐ Approve ☐ Revise | |
| Principal Enterprise Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Data Protection / Legal (DPDP) | | ☐ Approve ☐ Revise | |

---

*End of Chapter 4 — Identity & Access Management.*
