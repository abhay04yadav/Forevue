import * as React from "react";

/** Native select styled to match Input. Pass `<option>`s as children. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Select(props: SelectProps): JSX.Element;
