Quiet underline tabs with an optional count pill. Active tab is teal.

```jsx
<Tabs
  defaultValue="watch"
  items={[
    { id: "all", label: "All students", count: 1240 },
    { id: "watch", label: "Needs attention", count: 18 },
    { id: "drafts", label: "Drafts" },
  ]}
  onChange={setTab}
/>
```

Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
