# AI ERP Copilot — Architecture Bible

## Chapter 3 — AI Platform Architecture

**Status:** Draft for Architecture Review Board sign-off
**Scope of this chapter:** The internals of the **AI plane** that Chapter 2 deferred — the five subsystems the model runs through (AI Gateway, Context Builder, Tool Calling, Retrieval-Augmented Generation, Memory), the guardrail envelope around them, and how they assemble into one safe, grounded, explainable request.
**Depends on:** Chapter 1 (invariants §2, hard constraints §4, drivers §6, ledger §8) and Chapter 2 (the AI plane and serving boundary §1, the NL/risk lifecycles §4.1/§4.3, the untrusted-component stance, ledger AD-2.1/AD-6.1). Cited, not repeated.
**Does not cover:** Role-specific copilot behaviour (the six RSDDs), the semantic layer's data internals (Ch 6), nor the security mechanism of tenant isolation (Ch 4). This chapter consumes those; it does not redefine them.

---

### 0. How this chapter builds on Chapters 1 & 2

Chapter 2 drew the AI plane as a single box sitting *above* the serving layer and *below* the copilots, and made three commitments this chapter must now honour in its internals:

1. **The model is an untrusted component** (Ch1 §2.2, Ch2 §1). Everything here is designed as if the model can be wrong, manipulated, or compromised — because at scale, occasionally, it will be.
2. **No NL-to-raw-SQL; numbers are grounded; outputs are explainable; the AI is advisory** (Ch1 §4.2–§4.4). These are not features of the AI plane — they are its boundary conditions.
3. **The AI plane is one of the two heavy seams to peel off under load** (Ch2 AD-2.1), so its subsystems are designed as separable modules behind stable interfaces from day one.

The organising idea of the entire chapter is a single inversion of trust:

> **The model *proposes*; governed, deterministic code *disposes*.** The LLM's job is language — understanding a question, choosing among governed options, and narrating a grounded result. It never executes, never adjudicates, and never asserts a fact. Every consequential action is taken by deterministic code the model can only *request*, never *perform*.

The five named subsystems are the structure that makes this inversion real and enforceable.

---

### 1. The AI platform at a glance

```
        COPILOT (experience plane)  ── user question / action ─►
                                                                 │
   ┌─────────────────────────────────────────────────────────── ▼ ─────────────┐
   │                          AI PLATFORM (the AI plane)                         │
   │                                                                             │
   │   ┌──────────────┐   builds the prompt    ┌───────────────────────────┐    │
   │   │   CONTEXT     │◄───── identity/role ───│  CONTROL PLANE (Ch2 §7)    │    │
   │   │   BUILDER §4  │      tenant (server-   │  tenant_id · role · config │    │
   │   │              │       side, never model)└───────────────────────────┘    │
   │   │  assembles:  │                                                          │
   │   │  • role-scoped semantic schema (allowed metrics/dims)                   │
   │   │  • few-shot college-language examples                                   │
   │   │  • RETRIEVED evidence (from RAG §6)   ◄──────────────┐                  │
   │   │  • bounded MEMORY (from §7)           ◄────────────┐ │                  │
   │   └───────┬──────┘                                     │ │                  │
   │           │ prompt + tool definitions                  │ │                  │
   │           ▼                                            │ │                  │
   │   ┌──────────────┐   model call (egress)   ┌───────────┴─┴────────────┐     │
   │   │  AI GATEWAY  │◄───────────────────────►│   LLM provider(s)        │     │
   │   │     §3       │  routing · vendor abstr. │   (external, untrusted)  │     │
   │   │              │  PII redaction · cache   └──────────────────────────┘    │
   │   │              │  rate-limit · failover · full audit                      │
   │   └───────┬──────┘                                                          │
   │           │ the model returns a TOOL CALL (a semantic selection),           │
   │           │ NOT prose-with-numbers and NOT SQL                              │
   │           ▼                                                                 │
   │   ┌──────────────┐  validate → execute (deterministic, governed)            │
   │   │ TOOL CALLING │  • allow-listed, read-only, schema-checked                │
   │   │     §5       │  • deterministic code builds the parameterised query     │
   │   │              │  • executes through tenant-scoped views (RLS) ───────────┼──► SERVING
   │   │              │  • OR retrieves evidence via RAG §6                       │    PLANE
   │   └───────┬──────┘  • OR reads a DETERMINISTIC engine result (risk/elig.)    │    (Ch2)
   │           │ grounded result rows / evidence                                 │
   │           ▼                                                                 │
   │   ┌──────────────┐  GUARDRAILS §8: grounding check · abstention · output    │
   │   │  GROUNDING & │  validation · explainability invariant · advisory-only   │
   │   │  GUARDRAILS  │  the model NARRATES the rows; it does not invent figures  │
   │   └───────┬──────┘                                                          │
   └───────────┼─────────────────────────────────────────────────────────────────┘
               ▼
        grounded answer + table + chart + "how I read your question" + citations
```

Note what is **deliberately not in the model's path**: the Student Success Engine and eligibility logic. Those are deterministic engines (Ch1 §8 MR-4); the AI plane may *read their results* as grounded inputs, but the model never computes a tier, a score, or a verdict. This is the single most important boundary in the chapter and the reason the five subsystems are arranged as they are.

---

### 2. Design tenets specific to the AI plane

Before the subsystems, the tenets that decide every trade-off below (each traces to Chapter 1):

- **Structured I/O over free text.** Wherever the model's output drives an action, it returns *structured* output (a tool call with typed arguments), never prose to be parsed. Free text is reserved for the final narration, after grounding. *(Enables validation; defeats injection.)*
- **Two grounding sources, never a third.** Quantitative facts come from the **semantic layer** (structured); narrative evidence comes from **RAG** over governed documents (unstructured). The model is permitted **no** other source for a claim — "from its own knowledge" is not a permitted source for anything tenant-specific. *(Ch1 §4.4.)*
- **Determinism for anything defensible.** Language is probabilistic; adjudication is deterministic. The split is absolute. *(Ch1 §8 MR-4.)*
- **Cost is an architectural input, not an afterthought.** Model tiering, caching, and rules-over-LLM are designed into the Gateway and Tool layer, because a naïve "frontier model on every keystroke" design is insolvent at a thousand colleges. *(Ch1 §3 Group B, driver #6.)*
- **Vendor independence at the model boundary only.** The Gateway is the abstraction seam (Ch1 §8 MR-3); nothing upstream of it knows which provider answered.

---

### 3. The AI Gateway

**Purpose.** A single, managed chokepoint for every interaction with an external model provider. Nothing in the platform calls a model SDK directly; everything goes through the Gateway. It is the orchestration port Chapter 2 named.

**Why a gateway at all (comparison).**

- *Option A — call the provider SDK directly from each service.* Simplest to start. Rejected: it scatters API keys, defeats vendor independence (MR-3), makes cost control and caching impossible to do once-and-correctly, and gives no single place to redact PII before egress or to audit what left the building. At a thousand colleges this is ungovernable.
- *Option B — a thin shared client library.* Better, but a library is in-process and per-service; it cannot do cross-request rate limiting, centralised failover, or independent scaling, and it re-couples every caller to the provider's interface.
- *Option C — a dedicated AI Gateway component (RECOMMENDED).* One logical service (a module behind a stable interface in the v1 monolith, AD-2.1; the first thing to extract under load) through which all model traffic flows.

> **Ruling AI-3.1 — All model access is mediated by the AI Gateway; no direct SDK calls anywhere.** *Basis: Ch1 MR-3 (vendor independence), driver #1 (the egress control point), driver #6 (cost).*

**What the Gateway owns.**

- **Provider abstraction & routing.** A provider-agnostic request shape in; provider-specific calls out. Swapping or mixing providers is a Gateway config change, invisible upstream.
- **Model tiering for cost (Scalable AI).** Routes each task to the cheapest model that meets its quality bar: a small/cheap model for intent parsing and short narration; a stronger model only where reasoning genuinely requires it; deterministic rules (not the model at all) for adjudication. This tiering is *the* primary lever that keeps AI cost sub-linear with users.
- **Egress data minimisation.** Strips or tokenises personal data before it leaves the platform boundary — and applies the stricter minor-handling rule (Ch1 §4.5): minimal personal data about under-18 subjects ever crosses to an external provider. This is a privacy-by-design control placed at the one point all egress passes through.
- **Caching.** Tenant-partitioned (Ch1 §8 MR-7 — a cache key without a tenant dimension is a bug) caching of model outputs for identical governed inputs, cutting both cost and latency.
- **Rate limiting, quotas, and failover.** Per-tenant quotas (one noisy tenant cannot exhaust capacity for others — the pooled-tenancy concern from Ch2 AD-6.1), provider failover, and graceful timeout behaviour.
- **Audit & observability.** Every call logged with `tenant_id`, task type, model tier, token counts, latency, and cost — the data the cost and reliability story depends on.

---

### 4. The Context Builder

**Purpose.** Assemble exactly the context the model needs for a task — and *nothing it must not have*. The Context Builder is where safety and quality are won or lost, because the model can only be as safe as its inputs and only as good as its grounding.

**The assembly, in order.** For an NL query the Context Builder composes:

```
  1. SYSTEM FRAMING        the model's job, its limits, and the abstention rule
                           ("select a governed metric or refuse; never invent a number")
  2. IDENTITY & SCOPE      tenant_id + role — injected SERVER-SIDE from the session,
                           NEVER read from the user's text or a prior model output  [Ch1 §4.1]
  3. ROLE-SCOPED SCHEMA    only the semantic metrics/dimensions this ROLE may see
                           (RBAC gates the menu before the model ever sees it)
  4. FEW-SHOT EXAMPLES     college-language → governed-concept mappings
                           ("3rd-yr CSE" → programme=CSE, year=3) to lift accuracy
  5. RETRIEVED EVIDENCE    relevant governed documents from RAG (§6), tenant-scoped
  6. BOUNDED MEMORY        only what §7 permits — recent turns / referenced saved query
  7. TOOL DEFINITIONS      the allow-listed governed tools the model may call (§5)
```

**The non-negotiable rule of the Context Builder:** identity and scope (step 2) are authoritative and server-derived. The model is never trusted to carry, infer, or alter the tenant or the role. This is the same rule as the NL lifecycle (Ch2 §4.1 step 3), enforced here at assembly time so a prompt-injection attempt in the user's text cannot reach a privilege it was not granted — the menu of metrics (step 3) was already filtered by role *before* assembly.

**Data minimisation by construction.** The Context Builder includes the *least* data sufficient for the task. It does not paste a student's full record into context "in case it's useful"; it includes the governed schema and lets Tool Calling fetch exactly the grounded rows needed. For minors, it carries only academic/administrative context, never behavioural — the §4.5 constraint implemented at the point of assembly.

**Token-budget discipline.** Context is a cost and a latency line item (every token is paid for, on every call, at every college). The Builder prioritises within a budget: scope and schema are mandatory; few-shot, evidence, and memory are included by relevance and trimmed to fit. *Comparison rejected: "stuff the whole schema and history into every prompt" — simplest, but quadratically expensive at scale and it degrades model accuracy by burying the relevant context. The governed, budgeted assembly is both cheaper and more accurate.*

---

### 5. Tool Calling

**Purpose.** The structured, safe interface through which the model *requests* an action without *performing* one. This is the concrete implementation of the chapter's prime directive — and it is how "no NL-to-raw-SQL" (Ch1 §4.3) is realised rather than merely asserted.

**The core decision: how does NL become a safe query?** Three approaches:

- *Option A — the model writes SQL.* The model emits SQL that the platform runs. **Rejected outright.** It is unsafe (injection, cross-tenant leakage, unbounded queries), unauditable, and non-deterministic. It violates Ch1 §4.3 at the root. No amount of validation makes generated SQL trustworthy enough for driver #1.
- *Option B — the model fills a query template (slot-filling).* Safer, but brittle: every question shape needs a template, and the model can still smuggle unsafe values into slots.
- *Option C — the model calls governed tools with typed arguments; deterministic code does everything else (RECOMMENDED).* The model is given a small set of **allow-listed tools** (e.g. "query a governed metric", "retrieve evidence", "read a risk assessment"). It returns a **tool call**: a structured selection of *metric, filters, dimensions, grain* — never SQL, never prose-with-numbers. Deterministic platform code then validates that selection against the governed schema and builds the **parameterised, allow-listed, read-only** query, executing it through tenant-scoped views under RLS.

> **Ruling AI-5.1 — Tool calling over governed semantic selections is the only path from NL to data. The model selects; deterministic code constructs and executes; the query is read-only, schema-checked, allow-listed, and bounded.** *Basis: Ch1 §4.3, driver #1, driver #2.*

**The tool registry and its rules.** Tools are the model's entire action vocabulary. Every tool is:

- **Allow-listed and read-only** in v1 — there is no "write" tool, because the AI is advisory (Ch1 §4.2). The seam for a future human-approved write tool is left clean (Ch1 §1.3.1) but unbuilt.
- **Tenant- and role-scoped** — a tool executes under the session's server-derived tenant and role; the model cannot widen scope by how it calls a tool. Out-of-scope results are 404-shaped (Ch2 §4.4).
- **Schema-validated and bounded** — the selection must map to a *governed* metric/dimension or it is rejected with an abstention; every query carries limits.
- **Audited** — each tool call records what governed query ran, for whom, in which tenant.

**What is deliberately not a tool.** The Student Success Engine and eligibility logic are **not** tools the model invokes to *compute* a verdict — they are deterministic engines whose *already-computed, versioned, explainable results* the model may read as grounded inputs (e.g. "read this student's current risk findings"). The model narrates findings; it never produces them. This keeps adjudication auditable and byte-identical (Ch1 §8 MR-4) and is why eligibility/risk sit outside the model path in the §1 diagram.

**Why "tool calling" and "semantic selection" are the same thing done well.** The product's locked design says the model outputs semantic-layer selections, not SQL, and deterministic code generates the parameterised query. Modern tool calling is exactly that mechanism: a typed function signature the model fills, whose implementation is deterministic platform code. We adopt tool calling as the *implementation* of the locked semantic-selection pattern — no redesign, a cleaner enforcement surface.

---

### 6. Retrieval-Augmented Generation (RAG)

**Purpose.** Ground *narrative and evidence* — the things that live in documents, not in metric tables — so the model can assemble accreditation drafts, Student 360 summaries, and "how I read your question" explanations against real source material instead of its own priors.

**The critical distinction this chapter insists on:** RAG and the semantic layer are **two different grounding sources for two different kinds of claim**, and they are never substituted for one another.

```
   QUANTITATIVE claim  ("attendance is 61%")  ──► SEMANTIC LAYER (Tool Calling §5)
                                                   numbers come from returned rows
   NARRATIVE/EVIDENCE  ("the SSR criterion 2.1 ──► RAG over governed documents
    evidence is these three records")              text grounded in retrieved source
```

A number never comes from RAG; a document citation never comes from the metric layer. Conflating them is the classic RAG failure mode — letting a retrieved passage *look like* it licenses a fabricated figure. The platform forbids it structurally: figures flow only through §5.

**Where RAG is used.**

- **Accreditation Assistant** — the highest-value RAG surface: retrieve the actual records and documents that satisfy a NAAC/NBA/NIRF/AICTE criterion, and draft the narrative *with citations to that evidence* (the DVV-grade evidence trail of Ch2 §7). The draft is advisory; a human owns it.
- **Student 360 narrative summary** — a plain-language summary assembled from grounded signals, every clause attributable.
- **Query interpretation** — grounding the "how I read your question" echo so misreads are caught by the user.

**Retrieval is tenant-scoped, always.** Embeddings and the vector index carry `tenant_id`; retrieval filters by the session tenant before similarity search. A retrieval that could surface another tenant's document is the same class of failure as a cross-tenant SQL read — driver #1 applies identically. Minor-handling (Ch1 §4.5) applies to what is retrievable and what is sent to the Gateway for a minor subject.

**Vector store choice (comparison).**

- *Option A — pgvector inside the existing Postgres (RECOMMENDED for v1).* Keeps embeddings beside the canonical data under the *same* RLS and the same backup/DR story; one datastore to operate and isolate; no new cross-store consistency problem. The isolation guarantee (driver #1) extends to retrieval for free.
- *Option B — a dedicated external vector database.* Better at very large scale and very high query volume, but it is a *second* store that must independently enforce tenant isolation, be backed up, and stay consistent with canonical data — new isolation surface, new operational load, premature at v1.

> **Ruling AI-6.1 — pgvector in the primary Postgres for v1; a dedicated vector store is a later capacity tier behind the same retrieval interface (MR-3-style seam), activated by measured scale, not by default.** *Basis: driver #1 (isolation reuse), driver #4 (maintainability), Ch1 §5 (avoid premature scaling).*

---

### 7. Memory

**Purpose.** Make conversations coherent (follow-up questions, "and for last year?") and let users save and re-run useful queries — without ever becoming a backdoor around isolation, consent, or the minor-profiling prohibition.

**Two kinds of memory, sharply separated.**

```
  SHORT-TERM (session)         │  LONG-TERM (explicit, user-owned artifacts)
  • the current conversation   │  • SAVED queries / shared queries
  • bounded window of turns    │  • user/tenant preferences
  • expires with the session   │  • explicitly created, explicitly deletable
  • for follow-up coherence    │  • NOT an implicit behavioural profile
```

**The decision: how much memory, and of what kind?**

- *Option A — stateless (no memory).* Safest, but breaks natural follow-ups; every question must be self-contained. Poor experience for the non-technical staff this product serves.
- *Option B — bounded session memory + explicit saved artifacts (RECOMMENDED).* The model sees a *bounded* window of recent turns for coherence, plus any saved query the user explicitly references. Nothing is remembered implicitly across sessions about a person's behaviour.
- *Option C — rich long-term user/subject profiles ("the AI learns about you").* Rejected. It manufactures exactly the standing behavioural profile that Ch1 §4.5 prohibits for minors and that DPDP purpose-limitation disfavours generally; it also creates a high-value cross-session data store that complicates retention and erasure. The convenience is not worth the constraint violation and the liability.

> **Ruling AI-7.1 — Bounded session memory for coherence + explicit, user-owned saved artifacts. No implicit long-term behavioural profile of any person; categorically none of minors.** *Basis: Ch1 §4.5, DPDP purpose-limitation and minimisation (Ch1 §4.5), driver #3.*

**Memory obeys every isolation and consent rule.** Memory is tenant- and user-scoped (no shared memory across tenants or users); saved/shared queries respect RBAC at execution time (sharing a query does not share data the recipient's role cannot see — it re-runs under *their* scope); memory is subject to DPDP retention limits and erasure. Memory is never a source of a *fact* — it is context for *intent*; grounding (§5/§6) still produces every number and citation on every turn, even a follow-up.

---

### 8. The guardrail envelope

Guardrails are not a subsystem in the pipeline; they are a property enforced at multiple points. Collected here because they are the chapter's safety contract.

| Guardrail | Where enforced | What it guarantees |
|---|---|---|
| **Server-side scope** | Context Builder (§4) | tenant/role never come from user text or model output (Ch1 §4.1). |
| **Allow-list + read-only + bounds** | Tool Calling (§5) | the model can only request governed, read-only, bounded queries (Ch1 §4.3). |
| **Grounding** | post-execution (§1) | every number traces to a returned row; every claim to retrieved evidence (Ch1 §4.4). |
| **Abstention / fallback** | post-execution | if no governed metric fits or retrieval is empty: "I can't answer that from your data" — never a guess. |
| **Interpretation echo** | narration | "how I read your question" surfaces misreads to the user before they act on a wrong answer. |
| **Output validation** | narration | the final answer is checked against the grounded result set; figures not present in the rows are stripped/blocked. |
| **Explainability invariant** | engines + narration | no score without findings; no claim without its evidence (Ch1 §4.4). |
| **Advisory-only** | whole plane | no tool takes autonomous action affecting a person (Ch1 §4.2). |
| **Egress minimisation** | AI Gateway (§3) | minimal personal data leaves the boundary; stricter for minors (Ch1 §4.5). |
| **Isolation red-teaming** | continuous | adversarial testing of cross-tenant leakage — the #1 risk — as an ongoing practice, not a one-off. |

---

### 9. The assembled AI request

Tying the five subsystems into the NL lifecycle Chapter 2 §4.1 sketched, now with internals:

```
 1  user asks; CONTROL resolves tenant_id + role server-side                    [§4 step 2]
 2  CONTEXT BUILDER assembles: framing · scope · role-scoped schema · few-shot ·
        RAG evidence · bounded MEMORY · tool definitions                        [§4, §6, §7]
 3  AI GATEWAY routes to the cheapest adequate model; redacts PII on egress;
        checks cache first                                                       [§3]
 4  model returns a TOOL CALL — a governed semantic selection, not SQL/prose     [§5]
 5  TOOL layer validates the selection, builds the parameterised read-only query,
        executes through tenant-scoped views under RLS  (or retrieves via RAG,
        or reads a deterministic engine result)                                  [§5, §6]
 6  GUARDRAILS ground the result; if nothing answerable → abstain                [§8]
 7  AI GATEWAY routes a short narration call (cheap model) over the grounded rows [§3]
 8  output validation strips any figure not in the rows; explainability enforced [§8]
 9  CONTROL audits the tool call + model calls; MEMORY records the turn (bounded) [§7]
10  copilot returns: grounded answer + table + chart + interpretation + citations
```

Every Chapter-1 invariant is satisfied by *where* a step happens, not by the model's goodwill: scope at step 1–2, no-raw-SQL at 4–5, isolation at 5, grounding/abstention/explainability at 6–8, advisory at 5 (no write tool), cost control at 3 and 7.

---

### 10. Cost & scale of the AI plane

The dominant variable cost of the whole platform is model inference, so cost is engineered, not discovered. The levers, in order of impact:

1. **Rules over LLM for adjudication** (Ch1 §8 MR-4) — the cheapest token is the one never spent. Risk and eligibility never call a model.
2. **Model tiering at the Gateway** (§3) — cheap models for parsing and narration; strong models only where reasoning needs them.
3. **Tenant-partitioned caching** (§3) — identical governed inputs do not pay twice.
4. **Budgeted context** (§4) — fewer tokens per call, at higher accuracy.
5. **Semantic-layer grounding** — a governed read is far cheaper than a long reasoning chain, and it is the only safe source of figures anyway.

At the scale steps from Ch1 §5: at one college the plane is an in-process module; at a thousand it is the first service extracted (Ch2 AD-2.1), the Gateway becomes a sized, independently scaled tier with per-tenant quotas, and pgvector may give way to a dedicated vector tier (AI-6.1) — all behind the interfaces drawn here, none a rewrite.

---

### 11. Failure & degradation (AI plane)

| Failure | Behaviour | Why |
|---|---|---|
| **Provider unavailable / timeout** | Gateway fails over to an alternate provider/tier; if none, the NL path returns "AI temporarily unavailable" while dashboards, boards, and risk data stay fully available (they bypass the AI plane). | The model is replaceable; the durable planes must not share its fate (Ch2 §8). |
| **No governed metric fits the question** | Abstain: "I can't answer that from your data," plus the interpretation echo so the user can rephrase. | Better a refusal than a guess (Ch1 §4.4). |
| **RAG retrieval empty / low relevance** | The narrative surface declines to assert evidence it cannot cite; offers what *is* grounded. | No claim without evidence (Ch1 §4.4). |
| **Model returns an invalid/unsafe tool call** | Rejected at validation; never executed; logged for red-team review. | Tool calls are validated, not trusted (§5). |
| **Low-confidence intent parse** | Echo interpretation and ask to confirm before executing a consequential read. | Misreads caught before the user acts. |

---

### 12. Decision ledger (this chapter)

| ID | Decision | Chosen | Rejected | Basis |
|---|---|---|---|---|
| **AI-3.1** | Model access | All traffic via the AI Gateway; no direct SDK calls | Direct SDK; thin client lib | Ch1 MR-3; drivers #1, #6 |
| **AI-5.1** | NL → data | Tool calling over governed semantic selections; deterministic execution | Model writes SQL; slot-filling templates | Ch1 §4.3; drivers #1, #2 |
| **AI-6.1** | Vector store | pgvector in primary Postgres for v1; dedicated store as later tier | External vector DB at v1 | Driver #1; §5 (no premature scaling) |
| **AI-7.1** | Memory | Bounded session memory + explicit saved artifacts; no implicit profiles | Stateless; rich long-term profiles | Ch1 §4.5; driver #3 |
| **AI-2.1** | Adjudication | Deterministic engines outside the model path; model only reads results | LLM computes risk/eligibility | Ch1 §8 MR-4; driver #2 |

---

### 13. How this chapter governs the rest of the Bible

- **Chapter 4 (Security)** implements the server-side scope injection (§4) and tool-execution isolation (§5) as the concrete zero-trust controls, and owns the isolation red-teaming (§8).
- **Chapter 5 (ERP Integration)** and **Chapter 6 (Data Architecture)** own the semantic layer that Tool Calling selects against and the governed documents RAG retrieves from.
- **Chapter 7 (API Architecture)** defines the contract between the copilots and the AI plane, and the Gateway's provider-agnostic request shape.
- **Chapter 9 (DevOps)** operationalises the Gateway's quotas, failover, caching, and the cost/observability telemetry (§3, §10).
- **Chapter 10 (Testing)** owns AI evaluation: grounding accuracy, abstention behaviour, and the standing isolation red-team (§8).

New AI-plane tensions are added to this ledger (§12) by amendment.

---

### 14. Sign-off

This chapter is normative once ratified. Amendments to the prime directive (§0), the safety rulings (AI-5.1, AI-7.1, AI-2.1), or the guardrail envelope (§8) require Architecture Review Board approval; changes touching minor handling (§4, §6, §7) additionally require legal review.

| Role | Name | Decision | Date |
|---|---|---|---|
| Chief Technology Officer | | ☐ Approve ☐ Revise | |
| Principal AI Architect | | ☐ Approve ☐ Revise | |
| Principal Security Architect | | ☐ Approve ☐ Revise | |
| Principal Data Architect | | ☐ Approve ☐ Revise | |
| Principal Software Architect | | ☐ Approve ☐ Revise | |
| Principal Site Reliability Engineer | | ☐ Approve ☐ Revise | |
| Data Protection / Legal (DPDP) | | ☐ Approve ☐ Revise | |

---

*End of Chapter 3 — AI Platform Architecture.*
