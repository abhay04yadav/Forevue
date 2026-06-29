The signature governance primitive. Student risk is shown as **colour + shape + label**, never colour alone — high = square (red), watch = diamond (amber), low = circle (green). Colour-vision-safe.

```jsx
<RiskMarker tier="high" />
<RiskMarker tier="watch" variant="glyph" />
<RiskMarker tier="low" size="sm" showLabel={false} />
```

`variant`: `pill` (tinted + bordered, default) or `glyph` (bare shape + text). Never set the risk colour without the shape — that's the whole point of the component.
