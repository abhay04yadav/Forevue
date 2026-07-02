/**
 * Forevue breakpoint tokens — design/design-system/tokens/breakpoints.css
 */

export const breakpoints = {
  marketingSm: 560,
  narrow: 780,
  content: 860,
  wide: 1120,
} as const;

export const breakpointVars = {
  marketingSm: "var(--breakpoint-marketing-sm)",
  narrow: "var(--breakpoint-narrow)",
  content: "var(--breakpoint-content)",
  wide: "var(--breakpoint-wide)",
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Media query strings for use in CSS-in-JS or hooks */
export const mediaQueries = {
  marketingSm: `(min-width: ${breakpoints.marketingSm}px)`,
  narrow: `(min-width: ${breakpoints.narrow}px)`,
  content: `(min-width: ${breakpoints.content}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
  maxContent: `(max-width: ${breakpoints.content - 1}px)`,
} as const;
