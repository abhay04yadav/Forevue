import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Forevue Card — design-system/components/core/Card.jsx */
const cardVariants = cva(
  "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-strong)] shadow-[var(--shadow-sm)] transition-[box-shadow,border-color] duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
  {
    variants: {
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-5",
        xl: "p-6",
      },
      interactive: {
        true: "hover:border-[var(--border-default)] hover:shadow-[var(--shadow-md)]",
        false: "",
      },
    },
    defaultVariants: {
      padding: "none",
      interactive: false,
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, interactive, as: Tag = "div", ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(cardVariants({ padding, interactive }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  trailing?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, eyebrow, trailing, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-3 flex items-start justify-between gap-3 px-5 pt-5", className)}
      {...props}
    >
      <div>
        {eyebrow && (
          <div className="fv-eyebrow mb-1 text-[var(--color-deep-teal)]">{eyebrow}</div>
        )}
        {title && (
          <div className="text-[var(--text-md)] font-semibold text-[var(--text-strong)]">
            {title}
          </div>
        )}
        {children}
      </div>
      {trailing}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-[var(--text-md)] font-semibold tracking-[var(--tracking-tight)]", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-[var(--text-muted)]", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-5 pb-5 text-[var(--text-body)]", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export { Card, CardContent, CardDescription, CardHeader, CardTitle, cardVariants };
