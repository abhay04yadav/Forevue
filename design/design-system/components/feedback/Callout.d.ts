import * as React from "react";

/**
 * Quiet inline note. `abstain` is for when Forevue can't ground an answer;
 * `draft` marks human-owned generated content (advisory, never auto-finalized).
 */
export interface CalloutProps {
  tone?: "info" | "abstain" | "draft" | "caution";
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Callout(props: CalloutProps): JSX.Element;
