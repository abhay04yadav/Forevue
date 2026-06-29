import * as React from "react";

/** Calm text field with label, optional hint/error, deep-teal focus ring. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  /** Helper text below the field. */
  hint?: React.ReactNode;
  /** Error message; turns border + text red and overrides hint. */
  error?: React.ReactNode;
  iconLeft?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
