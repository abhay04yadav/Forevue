Calm single-line text field — label on top, deep-teal focus ring, optional hint or error.

```jsx
<Input label="Email" type="email" hint="We'll only use this for sign-in." />
<Input label="Roll number" error="Not found in this batch." iconLeft={<i data-lucide="search"></i>} />
```

Sizes `sm`/`md`/`lg`. `error` overrides `hint` and turns the field red. Pass any native input attrs through.
