import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

/** Forevue page header — Dashboard Framework title + actions row */
export function PageHeader({
  className,
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
  ...props
}: PageHeaderProps) {
  return (
    <header className={cn("mb-[18px]", className)} {...props}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1.5 text-[13px]">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    aria-hidden
                    className="text-[var(--color-neutral-400)]"
                    size={14}
                    strokeWidth={iconDefaults.strokeWidth}
                  />
                )}
                {item.href && !isLast ? (
                  <a href={item.href} className="text-[var(--text-muted)] hover:text-[var(--text-link)]">
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={cn(
                      isLast ? "font-medium text-[var(--text-body)]" : "text-[var(--text-muted)]",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {eyebrow && <p className="fv-eyebrow mb-1">{eyebrow}</p>}

      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-[25px] font-bold tracking-[var(--tracking-display)] text-[var(--text-strong)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm leading-normal text-[var(--text-muted)]">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
