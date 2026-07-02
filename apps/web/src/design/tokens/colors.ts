/**
 * Forevue color tokens — CSS custom properties from design/design-system/tokens/colors.css
 */

export const colorVars = {
  /* Brand palette */
  midnightTeal: "var(--color-midnight-teal)",
  teal: "var(--color-teal)",
  deepTeal: "var(--color-deep-teal)",
  amber: "var(--color-amber)",
  ink: "var(--color-ink)",
  paper: "var(--color-paper)",
  mist: "var(--color-mist)",

  /* Teal ramp */
  teal900: "var(--color-teal-900)",
  teal800: "var(--color-teal-800)",
  teal700: "var(--color-teal-700)",
  teal600: "var(--color-teal-600)",
  teal500: "var(--color-teal-500)",
  teal300: "var(--color-teal-300)",
  teal200: "var(--color-teal-200)",
  teal100: "var(--color-teal-100)",
  teal50: "var(--color-teal-50)",

  /* Amber ramp */
  amber700: "var(--color-amber-700)",
  amber600: "var(--color-amber-600)",
  amber200: "var(--color-amber-200)",
  amber50: "var(--color-amber-50)",

  /* Neutrals */
  white: "var(--color-white)",
  neutral50: "var(--color-neutral-50)",
  neutral100: "var(--color-neutral-100)",
  neutral200: "var(--color-neutral-200)",
  neutral300: "var(--color-neutral-300)",
  neutral400: "var(--color-neutral-400)",
  neutral500: "var(--color-neutral-500)",
  neutral600: "var(--color-neutral-600)",
  neutral700: "var(--color-neutral-700)",
  neutral900: "var(--color-neutral-900)",

  /* Risk tiers (product only) */
  riskHigh: "var(--color-risk-high)",
  riskHighBg: "var(--color-risk-high-bg)",
  riskWatch: "var(--color-risk-watch)",
  riskWatchBg: "var(--color-risk-watch-bg)",
  riskLow: "var(--color-risk-low)",
  riskLowBg: "var(--color-risk-low-bg)",

  /* Semantic */
  textStrong: "var(--text-strong)",
  textBody: "var(--text-body)",
  textMuted: "var(--text-muted)",
  textOnTeal: "var(--text-on-teal)",
  textOnDark: "var(--text-on-dark)",
  textLink: "var(--text-link)",

  surfacePage: "var(--surface-page)",
  surfaceCard: "var(--surface-card)",
  surfaceSunken: "var(--surface-sunken)",
  surfaceDark: "var(--surface-dark)",

  borderSubtle: "var(--border-subtle)",
  borderDefault: "var(--border-default)",
  borderStrong: "var(--border-strong)",

  actionPrimary: "var(--action-primary)",
  actionPrimaryHover: "var(--action-primary-hover)",
  actionPrimaryActive: "var(--action-primary-active)",
  actionPrimaryText: "var(--action-primary-text)",

  accent: "var(--accent)",
  accentStrong: "var(--accent-strong)",
  focusRing: "var(--focus-ring)",
} as const;

export type ColorVar = (typeof colorVars)[keyof typeof colorVars];
