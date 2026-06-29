# Forevue Design System

**Tagline:** *Clarity, early.*
**Namespace (for bundle imports):** `window.ForevueDesignSystem_24f415`

Forevue is **the intelligence layer for Indian higher education**. It sits on top of
the systems a college already runs (the ERP), lets staff ask anything in plain English,
watches every student for early signs of risk, and keeps accreditation evidence ready.
It does not replace the ERP — it lets you see inside it.

This design system covers **two layers that share one spine**:

- **Product UI (in-app)** — Public Sans only, teal + cool-neutral tokens, calm and
  utilitarian. This is what the system mainly produces.
- **Marketing (deck / site / social)** — may add **Spectral** (serif) for large
  headlines and the warm **Paper** surface. The serif **never** appears inside the product.

The shared **Forevue Teal `#0E7C86`** is the through-line that unifies both, so brand
and app read as one company.

## Sources this system was built from
All under `uploads/` (originals preserved there; working copies live in `assets/`):
- `forevue-brand-reference.md` — the canonical brand & design reference.
- `forevue-brand-guidelines.html` — the rendered brand guidelines (colour, type, voice, logo).
- `README.md` — the logo-asset manifest.
- Logo / icon assets: `forevue-app-icon.svg`, `forevue-app-icon-512.png`,
  `forevue-favicon-32.png`, `forevue-lockup-on-light.svg`, `forevue-lockup-on-dark.svg`.

No Figma file or codebase was provided — the system is derived entirely from the brand
reference + guidelines above. If a product codebase exists, attach it and we can tighten
the UI-kit recreations against the real source.

---

## CONTENT FUNDAMENTALS — how Forevue writes

**Posture first.** Every line reflects three rules that never bend:
*Advisory* (it surfaces, humans decide) · *Grounded* (always shows its evidence; abstains
rather than guesses) · *Privacy-first* (minors are consent-gated). Copy must never imply
Forevue acts on its own.

- **Voice & person.** Plain verbs, **sentence case** everywhere (not Title Case). Address
  the institution as **"you" / "your students," "the systems you already run."** Forevue
  refers to itself by name or as "it," never "we the revolutionary platform."
- **Lead with the specific.** *"Six students in CSE-3 slipped below the attendance line
  this week"* — never *"actionable insights"* or *"data-driven outcomes."*
- **Evidence on the table.** Every claim names what it's based on ("based on the attendance
  register, internal marks…"). Numbers are concrete and sourced.
- **Dignity for every student.** "students who need attention," never "failures" or
  "problem students." Never alarmist; a risk flag always comes with care and a next step.
- **Confident, never boastful.** No "revolutionary," no "empower," no "leverage," no hype.
- **No emoji.** None — not in product, not in marketing. (The brand explicitly rules them out.)
- **Vibe:** calm, grounded, humane, trustworthy. Edtech that feels like a careful colleague,
  not a disruptor.

**Say this, not that**
- surfaces / shows / flags — *not* decides / acts / fixes
- students who need attention — *not* failures / problem students
- the systems you already run — *not* rip-and-replace your ERP
- with the evidence behind it — *not* unexplained scores
- consent-gated · minor — consent required — *never* share a minor's data quietly

**In voice:** "Which students in CSE-3 are slipping, and why? Here's who, and what it's based on."
**Off voice:** "🚀 Our AI-powered platform empowers institutions to leverage data-driven insights!"

---

## VISUAL FOUNDATIONS

**Colour.** Teal is the spine; amber is the spark.
- *Forevue Teal `#0E7C86`* — primary actions, shared brand + product. *Deep Teal `#0A656D`*
  for links/secondary/focus. *Midnight Teal `#06363B`* for dark hero canvases.
- *Insight Amber `#E6A23C`* — **one accent per view**, the "moment of clarity." Never a
  background fill; it's a focal point (a single flagged number, the point in the mark).
- *Ink `#0E1B22`* text, *Mist `#5E7175`* muted. *Paper `#F7F5F0`* warm surface — **marketing
  only**; in-app surfaces stay cooler/neutral white with `--color-neutral-*` borders.
- **Risk tiers (product only):** high `#C0492B`, watch `#B97A1F`, low `#1E7A52` — always
  shown as **colour + shape + label** (high = square, watch = diamond, low = circle),
  colour-vision-safe, never colour alone. These never enter the marketing brand.

**Type.** Two faces, on purpose.
- *Public Sans* — **all** product UI, body, labels, data. Numbers use **tabular numerals**;
  big data figures are weight 800. UI eyebrow labels are 700, uppercase, tracked `0.14em`.
- *Spectral* (serif) — display headlines and the italic tagline, **marketing only**.
- Both load from Google Fonts (they are the brand's real fonts — no substitution).

**Spacing & layout.** 4px base scale (`--space-1`…`--space-24`). App shell is a fixed
`--app-sidebar` (248px) rail + topbar; content max-widths `--container-narrow` (780) and
`--container-wide` (1120). Information-dense but uncluttered — generous whitespace around
the one thing that matters.

**Corners & cards.** Generous radius: product cards `--radius-lg` (14px), marketing cards
`--radius-xl` (18px), hero canvases `--radius-2xl` (24px). Cards are **white**, with a
**soft neutral 1px border** (`--border-subtle`) and a **subtle cool shadow** (`--shadow-sm`,
lifting to `--shadow-md` on hover for interactive cards). No heavy drop shadows, no glow.

**Borders & shadows.** Hairline neutral borders carry most of the structure; shadows are
soft, low-opacity, cool (tinted with Ink, not black). Focus uses a **deep-teal ring**
(`--shadow-focus`) in product; amber focus is reserved for marketing.

**Backgrounds.** Marketing heroes use a quiet **radial midnight-teal gradient** (the only
sanctioned gradient) and the warm Paper surface; sections alternate paper ↔ midnight. The
product app is flat cool neutral (`--surface-page`), no gradients, no textures. No
stock photography of glowing-blue-AI-brains — ever.

**Motion.** Quiet. Fades and small (≤14px) translates on a standard ease
(`--ease-standard`), 120–400ms. **No bounce, no spring, no infinite loops.** Reduced-motion
is respected.

**Hover / press.** Hover = a small colour shift (primary darkens to deep teal; quiet
surfaces tint to `--color-neutral-50` / `--color-teal-50`). Press = a 0.5px nudge down,
never a scale-bounce. Disabled = reduced opacity, no pointer.

**Transparency & blur.** Sparingly — the sticky marketing nav uses a translucent midnight
bar with backdrop-blur. In-product surfaces stay opaque for legibility of data.

**Signature device — "the resolve."** Scattered records (faint teal points + lines)
converge to one bright **amber** point that looks forward. It is the recurring motif:
deck opener, site hero, app splash, loading states. One memorable element; everything
around it stays quiet.

---

## ICONOGRAPHY

- **Style:** simple **line** icons — single stroke weight, **rounded caps/joins**, teal or
  ink. No filled/duotone icons, no gradient-mesh, no node-network "AI" clichés.
- **Library:** **[Lucide](https://lucide.dev)** is the chosen set — its rounded-cap,
  single-weight line style matches the brand exactly. It's loaded from CDN in the UI kits
  and component cards (`https://unpkg.com/lucide@latest`), rendered with
  `<i data-lucide="name"></i>` + `lucide.createIcons()`. *This is a substitution of a
  well-matched open library — no proprietary product icon set was provided; flag if you
  have one and we'll swap it in.*
- **Brand glyphs** (not from Lucide) are bespoke and live in `assets/`: the risk shapes
  (square / diamond / circle), the consent lock, the evidence/citation file, and **the
  resolve** mark itself. The `RiskMarker`, `ConsentTag`, and `EvidenceCite` components
  carry these inline so meaning never rests on colour alone.
- **Emoji / unicode as icons:** never. The brand explicitly excludes emoji.
- **Logos:** real vector SVGs in `assets/` — lockups (light/dark), icon-only (light/dark),
  app icon (gradient tile), favicon. Don't stretch, recolour, add effects, or rebuild the
  wordmark in a live font. Clear space = the mark's own height; below ~120px wide use the
  icon alone.

---

## INDEX — what's in this system

**Root**
- `styles.css` — the single entry point consumers link (`@import` lines only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`.
- `assets/` — logos, icons (the resolve, app icon, favicon, lockups light/dark).
- `readme.md` (this file) · `SKILL.md` (Agent-Skills wrapper).

**Components** — `window.ForevueDesignSystem_24f415.*`
- `components/core/` — **Button**, **IconButton**, **Card** + **CardHeader**, **Badge**, **Tag**
- `components/forms/` — **Input**, **Select**, **Checkbox**, **Switch**
- `components/product/` — **RiskMarker**, **EvidenceCite**, **ConsentTag**, **DataStat** *(the governance primitives)*
- `components/navigation/` — **Tabs**
- `components/feedback/` — **Callout** *(incl. `abstain` and human-owned `draft` tones)*
Each directory has a `*.card.html` specimen (Design System tab) and each component a
`.d.ts` + `.prompt.md`.

**UI kits**
- `ui_kits/forevue-app/` — the in-app product: Ask, Watchlist, Student evidence (interactive `index.html`).
- `ui_kits/forevue-site/` — the marketing homepage (hero, features, proof, governance, CTA).

**Slides** — `slides/` — sample pitch-deck frames (title, stat, comparison, quote) at 1280×720.

**Foundation cards** — `guidelines/*.card.html` — Colors, Type, Spacing, Brand specimens for the Design System tab.
