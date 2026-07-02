import { KpiCard } from "@/layout/KpiCard";
import { ResponsiveGrid } from "@/layout/ResponsiveGrid";
import { Section } from "@/layout/Section";

import type { KpiItem } from "./types";

export interface KpiLayoutProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  kpis?: KpiItem[];
  children?: React.ReactNode;
}

/** KPI region — Dashboard Framework auto-fit grid of DataStat-style cards */
export function KpiLayout({ kpis, children, className, ...props }: KpiLayoutProps) {
  return (
    <Section aria-label="Key metrics" className={className} {...props}>
      <ResponsiveGrid variant="kpi">
        {children ??
          kpis?.map((kpi) => (
            <KpiCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.sub}
              delta={kpi.delta}
              deltaDir={kpi.deltaDir}
              valueClassName={kpi.valueClassName}
            />
          ))}
      </ResponsiveGrid>
    </Section>
  );
}
