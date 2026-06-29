import * as React from "react";

/**
 * One teal primary action per view; secondary actions are quiet and bordered.
 *
 * @startingPoint section="Core" subtitle="Teal primary, quiet bordered secondary" viewport="700x150"
 */
export interface ButtonProps {
  /** Visual role. Use `primary` once per view. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  /** Icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Button(props: ButtonProps): JSX.Element;
