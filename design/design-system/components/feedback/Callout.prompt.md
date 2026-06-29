Quiet inline note. Two tones encode Forevue's posture: `abstain` (it couldn't ground an answer — say so, don't guess) and `draft` (human-owned generated content, never auto-finalized).

```jsx
<Callout tone="abstain" title="Not enough to answer">
  Attendance for CSE-3 hasn't synced since Tuesday. I can't ground this yet.
</Callout>

<Callout tone="draft" title="Draft — for you to review" icon={<i data-lucide="pencil"></i>}>
  A message to the mentor of six students below the attendance line.
</Callout>
```

Tones: `info` (teal), `abstain` (neutral), `draft` (amber), `caution` (red).
