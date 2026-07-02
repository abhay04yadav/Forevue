import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as React from "react";

import { getRiskSummary, listAtRiskStudents } from "@/api/risk";
import { useAuth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/design";
import { DailyBriefCard, KpiLayout, type KpiItem } from "@/layout/dashboard";
import { PageHeader } from "@/layout/PageHeader";
import { STAFF_PATHS } from "@/routes/paths";

export function HodDashboardPage() {
  const { user } = useAuth();
  const departments = user?.departmentCodes ?? [];
  const [activeDept, setActiveDept] = React.useState(departments[0] ?? "Department");

  React.useEffect(() => {
    if (departments.length > 0 && !departments.includes(activeDept)) {
      setActiveDept(departments[0]!);
    }
  }, [departments, activeDept]);

  const summaryQuery = useQuery({ queryKey: ["risk-summary"], queryFn: getRiskSummary });
  const atRiskQuery = useQuery({
    queryKey: ["risk-students", "watch-high", activeDept],
    queryFn: () => listAtRiskStudents({ tier: "high", department: activeDept }),
  });

  if (summaryQuery.isLoading) {
    return <LoadingState label="Loading department health…" />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <ErrorState
        title="Department dashboard didn't load"
        message="The risk service didn't respond. Try again in a moment."
        onRetry={() => summaryQuery.refetch()}
      />
    );
  }

  const summary = summaryQuery.data;
  const total = summary.total_assessed;
  const pct = (n: number) => (total > 0 ? `${((n / total) * 100).toFixed(1)}% of assessed` : "—");
  const atRisk = atRiskQuery.data ?? [];

  const kpis: KpiItem[] = [
    { id: "assessed", label: "Assessed", value: String(total), sub: `${activeDept} scope` },
    { id: "high", label: "High risk", value: String(summary.by_tier.high), sub: pct(summary.by_tier.high) },
    { id: "watch", label: "Watch", value: String(summary.by_tier.watch), sub: pct(summary.by_tier.watch) },
    { id: "low", label: "Low", value: String(summary.by_tier.low), sub: pct(summary.by_tier.low) },
  ];

  const briefBullets = [
    `${summary.by_tier.high} high-risk students need triage in ${activeDept}`,
    `${summary.by_tier.watch} on watch — review movement on the risk board`,
    atRisk.length > 0 ? `${atRisk.length} high-tier students flagged for ${activeDept}` : "No high-tier students flagged right now",
  ];

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Department health"
        title={`${activeDept} brief`}
        description="Department-scoped KPIs from the Student Success Engine."
        actions={
          departments.length > 1 ? (
            <select
              className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm"
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      <DailyBriefCard
        text={`Overnight scan for ${activeDept}: focus on high-tier movement and attendance dips before department review.`}
        bullets={briefBullets}
      />

      <KpiLayout kpis={kpis} className="mb-6" />

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-strong)]">At-risk students</p>
            <p className="text-sm text-[var(--text-muted)]">
              {atRisk.length > 0
                ? `${atRisk.length} high-risk students in ${activeDept} need triage.`
                : `No high-risk students in ${activeDept} right now.`}
            </p>
          </div>
          <Link
            to={STAFF_PATHS.board}
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-deep-teal)] px-4 py-2 text-sm font-semibold text-white"
          >
            Open risk board
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
