Attach this to every AI answer — Forevue shows its evidence or abstains, never guesses. Renders the sources behind a claim as quiet, clickable file chips.

```jsx
<EvidenceCite
  label="Based on"
  sources={[
    { label: "Attendance register", meta: "wk 6–9" },
    { label: "Internal marks", meta: "CSE-3" },
    "Fee status",
  ]}
  onOpen={(s) => openSource(s)}
/>
```

Pass `onOpen` to make chips clickable (drill into the source). If an answer can't be grounded, show an abstain message instead of inventing a citation.
