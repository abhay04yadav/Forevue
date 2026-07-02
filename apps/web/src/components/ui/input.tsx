import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof fieldSizes> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  iconLeft?: React.ReactNode;
  wrapperClassName?: string;
}

/** Forevue Input — design-system/components/forms/Input.jsx */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      hint,
      error,
      iconLeft,
      size = "md",
      id,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const [focused, setFocused] = React.useState(false);
    const message = error ?? hint;

    const shell = (
      <div
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--surface-card)] px-3 transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
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
        {iconLeft && (
          <span className="inline-flex text-[var(--color-neutral-500)]">{iconLeft}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--color-neutral-400)] disabled:cursor-not-allowed",
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
        />
      </div>
    );

    if (!label && !message && !iconLeft) {
      return shell;
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-semibold text-[var(--text-strong)]"
          >
            {label}
          </label>
        )}
        {shell}
        {message && (
          <span
            className={cn(
              "text-xs",
              error ? "text-[var(--color-risk-high)]" : "text-[var(--text-muted)]",
            )}
          >
            {message}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
