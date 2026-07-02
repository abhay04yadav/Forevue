import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: React.ReactNode;
  showValue?: boolean;
}

/** Forevue Progress — Student Dashboard credits / readiness bars */
function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  className,
  ...props
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && <span className="text-sm text-[var(--text-muted)]">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold tabular-nums text-[var(--text-strong)]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-neutral-100)]"
      >
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--color-teal-500)] transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-standard)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export { Progress };
