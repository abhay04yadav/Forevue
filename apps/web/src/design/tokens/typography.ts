/**
 * Forevue typography tokens — design/design-system/tokens/typography.css
 * Product UI uses Public Sans only; Spectral is marketing-only.
 */

export const fontFamilies = {
  sans: "var(--font-sans)",
  serif: "var(--font-serif)",
  data: "var(--font-data)",
} as const;

export const fontWeights = {
  regular: "var(--weight-regular)",
  medium: "var(--weight-medium)",
  semibold: "var(--weight-semibold)",
  bold: "var(--weight-bold)",
  data: "var(--weight-data)",
} as const;

export const fontSizes = {
  xs: "var(--text-xs)",
  sm: "var(--text-sm)",
  base: "var(--text-base)",
  md: "var(--text-md)",
  lg: "var(--text-lg)",
  xl: "var(--text-xl)",
  "2xl": "var(--text-2xl)",
  "3xl": "var(--text-3xl)",
  "4xl": "var(--text-4xl)",
  "5xl": "var(--text-5xl)",
} as const;

export const lineHeights = {
  tight: "var(--leading-tight)",
  snug: "var(--leading-snug)",
  normal: "var(--leading-normal)",
} as const;

export const letterSpacing = {
  display: "var(--tracking-display)",
  tight: "var(--tracking-tight)",
  normal: "var(--tracking-normal)",
  eyebrow: "var(--tracking-eyebrow)",
} as const;

export const typographyRoles = {
  heading: {
    family: "var(--role-heading-family)",
    weight: "var(--role-heading-weight)",
  },
  body: {
    family: "var(--role-body-family)",
    weight: "var(--role-body-weight)",
  },
  eyebrow: {
    weight: "var(--role-eyebrow-weight)",
    tracking: "var(--role-eyebrow-tracking)",
    size: "var(--role-eyebrow-size)",
  },
  data: {
    weight: "var(--role-data-weight)",
    numeric: "var(--role-data-numeric)",
  },
} as const;

export const tabularNums = "var(--num-tabular)";
