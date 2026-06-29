import * as React from "react";

/**
 * Privacy-first DPDP marker. Minors always carry a consent-required tag; never
 * surface a minor's data without it.
 */
export interface ConsentTagProps {
  /** `required` (amber lock) or `granted` (green check). */
  state?: "required" | "granted";
  /** Override the default label. */
  label?: React.ReactNode;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}

export function ConsentTag(props: ConsentTagProps): JSX.Element;
