import { cn } from "@/lib/utils";

export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  /** Minimum width of the primary column (Dashboard Framework: 300px) */
  primaryMinWidth?: number;
  /** Minimum width of the secondary rail (Dashboard Framework: 280px) */
  secondaryMinWidth?: number;
}

/** Forevue two-column page layout — primary column + optional side rail */
export function SidebarLayout({
  className,
  primary,
  secondary,
  primaryMinWidth = 300,
  secondaryMinWidth = 280,
  ...props
}: SidebarLayoutProps) {
  return (
    <div
      className={cn("flex flex-wrap items-start gap-[18px]", className)}
      {...props}
    >
      <div
        className="flex min-w-0 flex-[3] flex-col gap-[18px]"
        style={{ minWidth: primaryMinWidth }}
      >
        {primary}
      </div>
      {secondary && (
        <aside
          aria-label="Side panel"
          className="flex min-w-0 flex-1 flex-col gap-4"
          style={{ minWidth: secondaryMinWidth }}
        >
          {secondary}
        </aside>
      )}
    </div>
  );
}
