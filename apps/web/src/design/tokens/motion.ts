/**
 * Forevue motion tokens — design/design-system/tokens/spacing.css + readme.md
 * Quiet fades and small translates only; no bounce or spring.
 */

export const easing = {
  standard: "var(--ease-standard)",
  out: "var(--ease-out)",
} as const;

export const duration = {
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
} as const;

/** Framer Motion / JS consumers (seconds) */
export const motion = {
  easeStandard: [0.2, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  durationFast: 0.12,
  durationNormal: 0.2,
  durationSlow: 0.4,
  translateMax: 14,
} as const;
