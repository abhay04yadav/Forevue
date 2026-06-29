# Forevue Logo Assets — v1.0

True vector files. The wordmark is built from real font-outline paths (Spectral
SemiBold, converted to geometry) — not live text — so it renders identically
in any tool, with no font installed. The icon mark ("the resolve") is hand-built
on a clean 100×100 grid.

## svg/ — the source files (use these for real work)

**Icon alone** — for app icons, social avatars, favicons, anywhere space is tight:
- `forevue-icon-color-on-light.svg` — teal + amber, for white/paper backgrounds
- `forevue-icon-color-on-dark.svg` — light-teal/white + amber, for midnight/dark backgrounds
- `forevue-icon-mono-ink.svg` / `forevue-icon-mono-white.svg` — single-colour, for stamps, letterhead, watermarks, or any context needing one flat colour

**Wordmark alone** — when the icon is shown separately (e.g. already in a nav bar) or isn't needed:
- `forevue-wordmark-on-light.svg` / `-on-dark.svg` / `-mono-ink.svg` / `-mono-white.svg`

**Full lockup** — icon + wordmark together, baseline-aligned. The default, primary logo:
- `forevue-lockup-on-light.svg` — for white/paper backgrounds
- `forevue-lockup-on-dark.svg` — includes its own midnight background fill
- `forevue-lockup-mono-ink.svg` — single colour, for contexts that can't carry full colour

**Production:**
- `forevue-app-icon.svg` — the square tile (with gradient + rounded corners) for app stores
- `forevue-favicon.svg` — simplified for tiny sizes (drops the forward tick, which disappears below ~24px)

## png/ — ready-to-use renders

- `forevue-app-icon-512.png` / `-192.png` / `-180.png` — Android/PWA/iOS app icon sizes
- `forevue-favicon-32.png` / `-16.png` — browser favicon sizes
- `forevue-lockup-on-light-preview.png` / `-on-dark-preview.png` — quick-use logo images for docs, slides, emails

## Using these

- **Default choice:** `forevue-lockup-on-light.svg` on white/paper, `forevue-lockup-on-dark.svg` on midnight/teal.
- **Tight space / app icon:** the icon-alone files, or `forevue-app-icon.svg` for the literal app-store icon.
- **One-colour contexts** (printed contracts, faxes, engraving, watermarks): the `-mono-` files.
- Minimum size: keep the wordmark lockup no smaller than ~120px wide on screen. Below that, switch to the icon alone.
- Clear space: leave at least the icon's own height as empty margin on all sides.
- Don't: stretch, recolour outside the palette, add shadows/outlines/effects, or rebuild the wordmark in a live font (it won't match these outlines exactly).

## If you need to edit the wordmark itself

The wordmark is frozen vector geometry — it can't be "retyped." To change the
text or font, the rebuild script (`build.js` + `extract.js`, using opentype.js
on the actual Spectral font file) regenerates everything from scratch with the
same math. Ask Claude to re-run it with new inputs rather than hand-editing
the path data.

---
Forevue — fore + vue · seeing it before it happens.
Pairs with `forevue-brand-guidelines.html` and the product design-system tokens.
