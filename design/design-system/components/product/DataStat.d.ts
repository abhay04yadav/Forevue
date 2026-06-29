import * as React from "react";

/** A single figure + label. Public Sans 800, tabular numerals. Numbers never use the serif. */
export interface DataStatProps {
  value: React.ReactNode;
  /** Uppercase eyebrow label above the figure. */
  label?: React.ReactNode;
  /** Muted subtext after the value. */
  sub?: React.ReactNode;
  /** Delta value text, e.g. "12". */
  delta?: React.ReactNode;
  deltaDir?: "up" | "down" | "flat";
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

export function DataStat(props: DataStatProps): JSX.Element;
