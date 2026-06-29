Primary action button — use the teal `primary` variant exactly once per view; everything else is a quiet bordered `secondary` or `ghost`.

```jsx
<Button variant="primary" onClick={save}>Save draft</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">View evidence</Button>
```

Variants: `primary` (teal fill, one per view), `secondary` (white, neutral border), `ghost` (no border), `danger` (red outline — destructive only). Sizes: `sm` 32px, `md` 40px, `lg` 48px. Pass `iconLeft` / `iconRight` for icon nodes. No gradients or glow — hover only darkens/tints.
