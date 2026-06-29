import * as React from "react";

/** Small status/count pill. Quiet tones; `amber` is the single accent — use sparingly. */
export interface BadgeProps {
  tone?: "neutral" | "teal" | "amber" | "dark";
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Squared, optionally dismissible label for filters and metadata. */
export interface TagProps {
  children?: React.ReactNode;
  /** Show a remove "×"; called when clicked. */
  onRemove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
export function Tag(props: TagProps): JSX.Element;
