import { cn } from "@/lib/utils";

export interface WidgetCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  dashed?: boolean;
  bodyClassName?: string;
}

/** Forevue widget card — Dashboard Framework widget grid cell */
export function WidgetCard({
  className,
  title,
  footer,
  actions,
  dashed = false,
  bodyClassName,
  children,
  ...props
}: WidgetCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-card)] shadow-[var(--shadow-sm)]",
        dashed ? "border-dashed border-[var(--border-default)]" : "border-[var(--border-subtle)]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-[15px] py-3">
        <h3 className="flex-1 text-[13.5px] font-semibold text-[var(--text-strong)]">{title}</h3>
        {actions}
      </div>
      <div className={cn("flex min-h-32 flex-1 flex-col px-[15px] py-4", bodyClassName)}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-[var(--border-subtle)] px-[15px] py-2 text-[11.5px] text-[var(--text-muted)]">
          {footer}
        </div>
      )}
    </article>
  );
}
