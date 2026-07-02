import { cn } from "@/lib/utils";

export type ResponsiveGridVariant = "kpi" | "widget" | "dashboard" | "auto";

const variantClass: Record<ResponsiveGridVariant, string> = {
  /** KPI region — Dashboard Framework */
  kpi: "grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5",
  /** Widget grid */
  widget: "grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3.5",
  /** Two-up dashboard panels */
  dashboard: "grid grid-cols-1 gap-6 lg:grid-cols-2",
  /** Generic auto-fit cards */
  auto: "grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4",
};

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ResponsiveGridVariant;
}

/** Forevue responsive grid — Dashboard Framework KPI + widget regions */
export function ResponsiveGrid({
  className,
  variant = "auto",
  ...props
}: ResponsiveGridProps) {
  return <div className={cn(variantClass[variant], className)} {...props} />;
}
