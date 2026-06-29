import * as React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Optional count pill (tabular numerals). */
  count?: number;
}

/** Quiet underline tabs; active tab is teal with a teal underline. */
export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}

export function Tabs(props: TabsProps): JSX.Element;
