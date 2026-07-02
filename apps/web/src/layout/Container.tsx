import * as React from "react";

import { cn } from "@/lib/utils";

export type ContainerWidth = "narrow" | "wide" | "full";

const widthClass: Record<ContainerWidth, string> = {
  narrow: "max-w-[var(--container-narrow)]",
  wide: "max-w-[var(--container-wide)]",
  full: "max-w-none",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  /** Dashboard Framework uses slightly roomier page padding */
  padded?: boolean;
}

/** Forevue page container — DS `--container-narrow` / `--container-wide` */
export function Container({
  className,
  width = "wide",
  padded = true,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        widthClass[width],
        padded && "px-4 py-5 md:px-6 md:py-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
