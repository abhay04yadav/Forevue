import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Forevue Button — design-system/components/core/Button.jsx */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-[0.005em] transition-[background,border-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-[0.5px] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border border-[var(--action-primary)] bg-[var(--action-primary)] text-[var(--action-primary-text)] hover:bg-[var(--action-primary-hover)]",
        secondary:
          "border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--color-deep-teal)] hover:bg-[var(--color-neutral-50)]",
        ghost:
          "border border-transparent bg-transparent text-[var(--color-deep-teal)] hover:bg-[var(--color-teal-50)]",
        danger:
          "border border-[var(--color-risk-high)] bg-[var(--surface-card)] text-[var(--color-risk-high)] hover:bg-[var(--color-risk-high-bg)]",
        default:
          "border border-[var(--action-primary)] bg-[var(--action-primary)] text-[var(--action-primary-text)] hover:bg-[var(--action-primary-hover)]",
        outline:
          "border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--color-deep-teal)] hover:bg-[var(--color-neutral-50)]",
      },
      size: {
        sm: "h-8 rounded-[var(--radius-md)] px-3 text-[13px] [&_svg]:size-[15px]",
        md: "h-10 rounded-[var(--radius-md)] px-4 text-sm [&_svg]:size-4",
        lg: "h-12 rounded-[var(--radius-md)] px-[22px] text-[15px] [&_svg]:size-[17px]",
        default: "h-10 rounded-[var(--radius-md)] px-4 text-sm [&_svg]:size-4",
        icon: "h-9 w-9 rounded-[var(--radius-md)] [&_svg]:size-4",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      iconLeft,
      iconRight,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const resolvedSize = size === "default" ? "md" : size;
    const resolvedVariant =
      variant === "default" ? "primary" : variant === "outline" ? "secondary" : variant;

    return (
      <Comp
        type={asChild ? undefined : type}
        className={cn(
          buttonVariants({ variant: resolvedVariant, size: resolvedSize, fullWidth, className }),
        )}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {iconLeft}
            {children}
            {iconRight}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
