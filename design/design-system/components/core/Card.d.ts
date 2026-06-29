import * as React from "react";

/**
 * The workhorse product surface: white, soft border, generous radius, subtle shadow.
 *
 * @startingPoint section="Core" subtitle="Calm white card with optional header" viewport="700x150"
 */
export interface CardProps {
  /** Element tag to render as. */
  as?: keyof JSX.IntrinsicElements;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  /** Lift shadow + border on hover (use for clickable cards). */
  interactive?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface CardHeaderProps {
  title?: React.ReactNode;
  /** Uppercase teal eyebrow above the title. */
  eyebrow?: React.ReactNode;
  /** Trailing slot, right-aligned (e.g. a menu IconButton). */
  trailing?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: CardHeaderProps): JSX.Element;
