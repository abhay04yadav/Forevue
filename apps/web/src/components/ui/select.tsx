import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

const fieldSizes = cva("", {
  variants: {
    size: {
      sm: "h-[34px]",
      md: "h-10",
      lg: "h-[46px]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof fieldSizes> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
}

/** Forevue Select — design-system/components/forms/Select.jsx */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      hint,
      error,
      size = "md",
      id,
      children,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const selectId = id ?? reactId;
    const [focused, setFocused] = React.useState(false);

    const shell = (
      <div
        className={cn(
          "relative rounded-[var(--radius-md)] border bg-[var(--surface-card)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          fieldSizes({ size }),
          error
            ? "border-[var(--color-risk-high)]"
            : focused
              ? "border-[var(--focus-ring)] shadow-[var(--shadow-focus)]"
              : "border-[var(--border-default)]",
          disabled && "opacity-50",
          wrapperClassName,
        )}
      >
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            "h-full w-full cursor-pointer appearance-none border-none bg-transparent py-0 pr-9 pl-3 text-sm text-[var(--text-strong)] outline-none disabled:cursor-not-allowed",
            className,
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--color-neutral-500)]"
          size={iconDefaults.size}
          strokeWidth={iconDefaults.strokeWidth}
        />
      </div>
    );

    if (!label && !hint && !error) {
      return shell;
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[13px] font-semibold text-[var(--text-strong)]"
          >
            {label}
          </label>
        )}
        {shell}
        {hint && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
        {error && <span className="text-xs text-[var(--color-risk-high)]">{error}</span>}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
