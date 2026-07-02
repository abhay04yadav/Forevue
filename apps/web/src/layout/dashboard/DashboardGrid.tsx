import { SidebarLayout } from "@/layout/SidebarLayout";
import { cn } from "@/lib/utils";

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  /** Hide the side rail on mobile — widgets stack in the primary column */
  collapseSecondaryOnMobile?: boolean;
}

/**
 * Dashboard overview layout — primary column (KPIs + widgets) and optional side rail.
 * Matches Dashboard Framework two-column overview tab.
 */
export function DashboardGrid({
  primary,
  secondary,
  collapseSecondaryOnMobile = true,
  className,
  ...props
}: DashboardGridProps) {
  if (!secondary) {
    return (
      <div className={cn("flex flex-col gap-[18px]", className)} {...props}>
        {primary}
      </div>
    );
  }

  return (
    <SidebarLayout
      aria-label="Dashboard overview"
      className={className}
      primary={primary}
      secondary={
        collapseSecondaryOnMobile ? (
          <div className="contents max-md:w-full md:contents">{secondary}</div>
        ) : (
          secondary
        )
      }
      {...props}
    />
  );
}
