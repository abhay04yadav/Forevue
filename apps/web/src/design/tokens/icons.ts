/**
 * Forevue icon tokens — Lucide line icons (design-system/readme.md ICONOGRAPHY)
 */

import type { LucideProps } from "lucide-react";

export const iconLibrary = "lucide-react" as const;

export const iconSizes = {
  sm: 15,
  md: 17,
  lg: 20,
} as const;

export const iconVars = {
  library: "var(--icon-library)",
  strokeWidth: "var(--icon-stroke-width)",
  sizeSm: "var(--icon-size-sm)",
  sizeMd: "var(--icon-size-md)",
  sizeLg: "var(--icon-size-lg)",
  colorDefault: "var(--icon-color-default)",
  colorMuted: "var(--icon-color-muted)",
  colorActive: "var(--icon-color-active)",
  colorOnTeal: "var(--icon-color-on-teal)",
} as const;

/** Default props for Lucide icons in product UI */
export const iconDefaults = {
  strokeWidth: 1.75,
  size: iconSizes.md,
  absoluteStrokeWidth: false,
} satisfies Partial<LucideProps>;

export type IconSize = keyof typeof iconSizes;
