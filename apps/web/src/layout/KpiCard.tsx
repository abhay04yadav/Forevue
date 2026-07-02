import { cn } from "@/lib/utils";

export type DeltaDirection = "up" | "down" | "flat";

const deltaColor: Record<DeltaDirection, string> = {
  up: "text-[var(--color-risk-low)]",
  down: "text-[var(--color-risk-high)]",
  flat: "text-[var(--text-muted)]",
};

const deltaArrow: Record<DeltaDirection, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: React.ReactNode;
  deltaDir?: DeltaDirection;
  valueClassName?: string;
}

/** Forevue KPI card — Dashboard Framework KPI region + DS DataStat */
export function KpiCard({
  className,
  label,
  value,
  sub,
  delta,
  deltaDir = "flat",
  valueClassName,
  ...props
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-[18px] py-4 shadow-[var(--shadow-sm)]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <span className="fv-eyebrow">{label}</span>
        <span
          className={cn(
            "fv-data text-[34px] leading-none font-extrabold tracking-[-0.02em] text-[var(--color-deep-teal)]",
            valueClassName,
          )}
        >
          {value}
        </span>
        {(sub || delta) && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px]">
            {delta && (
              <span className={cn("font-semibold tabular-nums", deltaColor[deltaDir])}>
                {deltaArrow[deltaDir]} {delta}
              </span>
            )}
            {sub && <span className="text-[var(--text-muted)]">{sub}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
