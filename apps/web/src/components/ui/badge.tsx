import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Forevue Badge — design-system/components/core/Badge.jsx */
const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-[5px] rounded-[var(--radius-pill)] px-[9px] text-xs font-semibold leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral:
          "border border-[var(--border-subtle)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
        teal: "border border-[var(--color-teal-100)] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]",
        amber:
          "border border-[var(--color-amber-200)] bg-[var(--color-amber-50)] text-[var(--color-amber-700)]",
        dark: "border border-[var(--color-midnight-teal)] bg-[var(--color-midnight-teal)] text-[var(--text-on-dark)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

/** Forevue Tag — design-system/components/core/Badge.jsx */
function Tag({ className, children, onRemove, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-card)] px-2.5 text-[13px] font-medium whitespace-nowrap text-[var(--color-neutral-700)]",
        onRemove && "pr-1.5 pl-2.5",
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onRemove}
          className="inline-flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded border-none bg-transparent text-sm leading-none text-[var(--color-neutral-500)] hover:text-[var(--text-strong)]"
        >
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      )}
    </span>
  );
}

export { Badge, Tag, badgeVariants };
