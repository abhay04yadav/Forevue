import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white",
  {
    variants: {
      size: {
        sm: "h-6 w-6 text-[10.5px]",
        md: "h-[30px] w-[30px] text-xs",
        lg: "h-8 w-8 text-[13px]",
      },
      tone: {
        teal: "bg-[var(--color-teal-600)]",
        deepTeal: "bg-[var(--color-deep-teal)]",
        neutral: "bg-[var(--color-neutral-500)]",
        ink: "bg-[var(--color-ink)]",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "teal",
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  initials: string;
  src?: string;
  alt?: string;
}

/** Forevue Avatar — App Shell / Artifact Workspace user chips */
function Avatar({ className, initials, src, alt = "", size, tone, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(avatarVariants({ size, tone }), "object-cover", className)}
      />
    );
  }

  return (
    <span className={cn(avatarVariants({ size, tone }), className)} aria-hidden={!alt} {...props}>
      {initials}
    </span>
  );
}

export { Avatar, avatarVariants };
