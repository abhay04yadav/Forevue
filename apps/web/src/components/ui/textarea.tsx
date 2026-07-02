import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const fieldSizes = cva("", {
  variants: {
    size: {
      sm: "min-h-[34px]",
      md: "min-h-10",
      lg: "min-h-[46px]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof fieldSizes> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  wrapperClassName?: string;
}

/** Forevue Textarea — AI Workspace composer / artifact editor patterns */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      hint,
      error,
      size = "md",
      id,
      onFocus,
      onBlur,
      disabled,
      rows = 3,
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
          "rounded-[var(--radius-md)] border bg-[var(--surface-card)] px-3 py-2.5 transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
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
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          className={cn(
            "block w-full resize-y border-none bg-transparent text-sm leading-relaxed text-[var(--text-strong)] outline-none placeholder:text-[var(--color-neutral-400)] disabled:cursor-not-allowed",
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

    if (!label && !message) {
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
Textarea.displayName = "Textarea";

export { Textarea };
