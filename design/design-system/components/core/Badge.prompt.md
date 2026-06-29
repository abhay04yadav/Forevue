Quiet status pills and filter tags. Badge tones are `neutral` (default), `teal`, `amber` (the single accent — sparingly), `dark`. Tag is a squared, optionally-removable filter chip.

```jsx
<Badge tone="teal">Draft</Badge>
<Badge tone="amber">Needs attention</Badge>
<Tag onRemove={() => clear('cse3')}>CSE-3</Tag>
```

Don't use the amber badge as a background block — it's an accent. Counts inside badges/tags should use tabular numerals.
