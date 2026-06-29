import * as React from "react";

/**
 * Signature governance primitive: student risk shown as colour + shape + label, never
 * colour alone. high = square, watch = diamond, low = circle. Colour-vision-safe.
 *
 * @startingPoint section="Product" subtitle="Risk tier as colour + shape + label" viewport="700x150"
 */
export interface RiskMarkerProps {
  tier?: "high" | "watch" | "low";
  /** `pill` (tinted, bordered) or `glyph` (bare shape + text). */
  variant?: "pill" | "glyph";
  /** Hide the text label (shape still carries meaning via `title`). */
  showLabel?: boolean;
  /** Override the default label ("High"/"Watch"/"Low"). */
  label?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function RiskMarker(props: RiskMarkerProps): JSX.Element;
