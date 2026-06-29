Icon-only square button for toolbars, close, and "more" actions — always give it an `aria-label`.

```jsx
<IconButton aria-label="More" variant="ghost"><i data-lucide="more-horizontal"></i></IconButton>
<IconButton aria-label="Send" variant="solid"><i data-lucide="arrow-up"></i></IconButton>
```

Variants: `ghost` (default, neutral), `bordered`, `solid` (teal). Sizes `sm`/`md`/`lg`. Pass any icon node as children.
