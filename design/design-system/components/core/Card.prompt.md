The default product surface — white, soft neutral border, generous radius, subtle shadow. Keep contents calm and uncluttered.

```jsx
<Card padding="lg" interactive>
  <CardHeader eyebrow="CSE · Semester 3" title="Attendance watch" trailing={<IconButton aria-label="More"><i data-lucide="more-horizontal"></i></IconButton>} />
  <p>Six students slipped below the attendance line this week.</p>
</Card>
```

`padding`: none/sm/md/lg/xl. Set `interactive` for clickable cards (lifts shadow on hover). `CardHeader` gives the standard eyebrow + title + trailing-slot row.
