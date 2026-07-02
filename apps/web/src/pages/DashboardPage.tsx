import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getRiskSummary, getRiskSummaryByDepartment, listAtRiskStudents, listRiskAlerts } from "@/api/risk";
import { Card, CardContent } from "@/components/ui/card";
import {
  ErrorState,
  LoadingState,
  TierBadge,
  sevForTier,
  type Tier,
} from "@/design";
import { DailyBriefCard, KpiLayout, type KpiItem } from "@/layout/dashboard";
import { PageHeader } from "@/layout/PageHeader";

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["risk-summary"], queryFn: getRiskSummary });
  const byDeptQuery = useQuery({
    queryKey: ["risk-summary-by-department"],
    queryFn: getRiskSummaryByDepartment,
  });
  const topQuery = useQuery({
    queryKey: ["risk-students", "high", "all"],
    queryFn: () => listAtRiskStudents({ tier: "high" }),
  });
  const alertsQuery = useQuery({ queryKey: ["risk-alerts"], queryFn: () => listRiskAlerts() });

  if (summaryQuery.isLoading || byDeptQuery.isLoading) {
    return <LoadingState label="Loading institution overview…" />;
  }

  if (summaryQuery.isError || byDeptQuery.isError || !summaryQuery.data || !byDeptQuery.data) {
    return (
      <div className="pb-16">
        <ErrorState
          title="Dashboard didn't load"
          message="The risk service didn't respond. Try again in a moment."
          onRetry={() => {
            summaryQuery.refetch();
            byDeptQuery.refetch();
          }}
        />
      </div>
    );
  }

  const summary = summaryQuery.data;
  const total = summary.total_assessed;
  const pct = (n: number) => (total > 0 ? `${((n / total) * 100).toFixed(1)}% of assessed` : "—");
  const departments = [...byDeptQuery.data.departments].sort(
    (a, b) => b.high / Math.max(1, b.total) - a.high / Math.max(1, a.total),
  );
  const maxRate = Math.max(0.0001, ...departments.map((d) => d.high / Math.max(1, d.total)));
  const topStudents = (topQuery.data ?? []).slice(0, 5);
  const topDept = departments[0];
  const unreadAlerts = (alertsQuery.data ?? []).filter((a) => a.status !== "read").length;

  const kpis: KpiItem[] = [
    { id: "assessed", label: "Assessed", value: String(total), sub: `across ${departments.length} departments` },
    { id: "high", label: "High risk", value: String(summary.by_tier.high), sub: pct(summary.by_tier.high) },
    { id: "watch", label: "Watch", value: String(summary.by_tier.watch), sub: pct(summary.by_tier.watch) },
    { id: "low", label: "Low", value: String(summary.by_tier.low), sub: pct(summary.by_tier.low) },
  ];

  const briefBullets = [
    topDept ? `${topDept.department} has the highest high-risk share (${topDept.high}/${topDept.total})` : "Department breakdown building",
    `${summary.by_tier.high} students institution-wide in high tier`,
    unreadAlerts > 0 ? `${unreadAlerts} unread risk alert(s)` : "Risk alert queue is clear",
  ];

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Leadership · whole institution"
        title="Institution overview"
        description={`${total} students assessed across ${departments.length} departments`}
      />

      <DailyBriefCard
        title="Daily executive brief"
        text="Overnight institution scan — prioritized items for leadership attention."
        bullets={briefBullets}
      />

      <KpiLayout kpis={kpis} className="mb-8" />

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">By department</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">High-risk share of assessed students</p>
          <ul className="mt-4 flex flex-col gap-3">
            {departments.map((d) => {
              const rate = d.high / Math.max(1, d.total);
              return (
                <li
                  key={d.department}
                  className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[var(--text-strong)]">{d.department}</span>
                    <span className="fv-data text-xs text-[var(--text-muted)]">
                      {d.high} high · {d.total} assessed
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-risk-high)]"
                      style={{ width: `${(rate / maxRate) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">Highest risk right now</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Top high-tier students institution-wide</p>
          {topQuery.isLoading ? (
            <LoadingState label="Loading highest-risk students…" />
          ) : topStudents.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--text-muted)]">No high-tier students right now.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {topStudents.map((s) => (
                <li key={s.student_id}>
                  <Link
                    to={`/students/${s.student_id}`}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 transition-colors hover:border-[var(--color-teal-300)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--text-strong)]">{s.name}</p>
                      <p className="fv-data text-xs text-[var(--text-muted)]">{s.canonical_roll_no}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <TierBadge tier={s.tier as Tier} size="sm" />
                      <span
                        className="fv-data text-xl font-extrabold"
                        style={{ color: sevForTier(s.tier as Tier).ink }}
                      >
                        {Math.round(s.overall_score)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Card className="mt-6 border-dashed border-[var(--border-default)]">
            <CardContent className="p-4">
              <p className="text-sm text-[var(--text-muted)]">Trend builds as risk data accumulates.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
