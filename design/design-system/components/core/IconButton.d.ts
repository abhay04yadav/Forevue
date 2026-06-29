import * as React from "react";

/** Square button holding a single icon. Always pass an accessible `aria-label`. */
export interface IconButtonProps {
  variant?: "ghost" | "bordered" | "solid";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label": string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function IconButton(props: IconButtonProps): JSX.Element;
