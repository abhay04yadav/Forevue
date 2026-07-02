import * as React from "react";

import { cn } from "@/lib/utils";

const alertTones = {
  info: {
    color: "text-[var(--color-deep-teal)]",
    bg: "bg-[var(--color-teal-50)]",
    border: "border-[var(--color-teal-100)]",
  },
  abstain: {
    color: "text-[var(--color-neutral-700)]",
    bg: "bg-[var(--color-neutral-100)]",
    border: "border-[var(--border-subtle)]",
  },
  draft: {
    color: "text-[var(--color-amber-700)]",
    bg: "bg-[var(--color-amber-50)]",
    border: "border-[var(--color-amber-200)]",
  },
  caution: {
    color: "text-[var(--color-risk-high)]",
    bg: "bg-[var(--color-risk-high-bg)]",
    border: "border-[var(--color-risk-high)]",
  },
} as const;

export type AlertTone = keyof typeof alertTones;

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: AlertTone;
  title?: React.ReactNode;
  icon?: React.ReactNode;
}

/** Forevue Alert (Callout) — design-system/components/feedback/Callout.jsx */
function Alert({ tone = "info", title, icon, className, children, ...props }: AlertProps) {
  const t = alertTones[tone] ?? alertTones.info;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-[11px] rounded-[var(--radius-md)] border px-3.5 py-3",
        t.bg,
        t.border,
        className,
      )}
      {...props}
    >
      {icon && (
        <span aria-hidden className={cn("mt-px inline-flex shrink-0", t.color)}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        {title && (
          <div className={cn("mb-0.5 text-[13.5px] font-semibold", t.color, children && "mb-1")}>
            {title}
          </div>
        )}
        {children && (
          <div className="text-[13.5px] leading-normal text-[var(--text-body)]">{children}</div>
        )}
      </div>
    </div>
  );
}

export { Alert, alertTones };
