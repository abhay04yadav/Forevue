# Forevue — Product App UI kit

The in-app intelligence layer. Calm, utilitarian, information-dense but uncluttered.
Public Sans throughout (no serif), cool neutral surfaces, white cards, one teal
primary action per view, and the governance primitives front and centre.

## Screens (`index.html` is the interactive entry)
- **Ask** (`AskView.jsx`) — plain-English query → a grounded answer with a stat row,
  a ranked list of students (risk markers + consent tags), an evidence citation row,
  and a *human-owned draft* that is never sent or written back to the ERP automatically.
- **Watchlist** (`WatchView.jsx`) — students who need attention, as a scannable table.
  Risk is always colour + shape + label; minors carry a consent-required tag.
- **Student** (`StudentView.jsx`) — the *why* behind a risk tier, signal by signal,
  with evidence on the table and a reminder that humans decide.
- **AppShell** (`AppShell.jsx`) — sidebar + topbar chrome shared by every view.

## Composition
Built entirely from the design-system components via `window.ForevueDesignSystem_24f415`
(Button, Card, RiskMarker, EvidenceCite, ConsentTag, DataStat, Tabs, Callout, …).
Icons are Lucide (line, rounded caps, single weight) loaded from CDN.

## Posture encoded in the UI
Advisory (it surfaces, humans decide) · Grounded (every answer shows its evidence,
abstains rather than guesses) · Privacy-first (minors are consent-gated). Never imply
Forevue acts on its own — no auto-send, no ERP write-back.

> Recreation for design reference. No real data; interactions are illustrative.
