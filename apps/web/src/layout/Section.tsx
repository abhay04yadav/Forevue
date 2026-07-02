import { cn } from "@/lib/utils";

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Uppercase eyebrow label (Dashboard widget section headers) */
  eyebrow?: boolean;
}

/** Forevue content section — semantic landmark with optional heading row */
export function Section({
  className,
  title,
  description,
  actions,
  eyebrow = false,
  children,
  ...props
}: SectionProps) {
  const showHeader = title || description || actions;

  return (
    <section className={cn("flex flex-col", className)} {...props}>
      {showHeader && (
        <div
          className={cn(
            "mb-2.5 flex items-start justify-between gap-3",
            !eyebrow && description && "mb-4",
          )}
        >
          <div className="min-w-0">
            {title &&
              (eyebrow ? (
                <h2 className="fv-eyebrow m-0">{title}</h2>
              ) : (
                <h2 className="m-0 text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
              ))}
            {description && !eyebrow && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
