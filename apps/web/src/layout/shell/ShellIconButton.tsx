import * as React from "react";

import { cn } from "@/lib/utils";

export interface ShellIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  badge?: boolean;
}

export function ShellIconButton({
  className,
  active,
  badge,
  children,
  ...props
}: ShellIconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-700)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-[var(--color-neutral-100)]",
        active && "bg-[var(--color-neutral-100)]",
        className,
      )}
      {...props}
    >
      {children}
      {badge && (
        <span
          aria-hidden
          className="absolute top-[7px] right-2 h-2 w-2 rounded-full border-[1.5px] border-[var(--surface-card)] bg-[var(--color-amber)]"
        />
      )}
    </button>
  );
}
