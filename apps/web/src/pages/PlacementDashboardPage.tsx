import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getPlacementSummary, listPlacementDrives } from "@/api/placement";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/design";
import { DailyBriefCard } from "@/layout/dashboard";
import { PageHeader } from "@/layout/PageHeader";
import { STAFF_PATHS } from "@/routes/paths";

export function PlacementDashboardPage() {
  const summaryQuery = useQuery({ queryKey: ["placement-summary"], queryFn: getPlacementSummary });
  const drivesQuery = useQuery({ queryKey: ["placement-drives"], queryFn: listPlacementDrives });

  if (summaryQuery.isLoading) return <LoadingState label="Loading placement dashboard…" />;

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <ErrorState
        title="Placement dashboard didn't load"
        message="Try again in a moment."
        onRetry={() => summaryQuery.refetch()}
      />
    );
  }

  const summary = summaryQuery.data;
  const activeDrives = (drivesQuery.data ?? []).filter((d) => d.status === "active");

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Placement operations"
        title="Placement dashboard"
        description={summary.note}
      />

      <DailyBriefCard title={summary.headline} text="Today's operational priorities for the placement cell." bullets={[
        `${summary.active_drives} active drive(s) on the calendar`,
        `${summary.draft_drives} draft drive(s) awaiting launch`,
        activeDrives.length > 0 ? `Next up: ${activeDrives[0]?.title}` : "No active drives scheduled yet",
      ]} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--text-muted)]">Active drives</p>
            <p className="fv-data mt-1 text-3xl font-extrabold">{summary.active_drives}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--text-muted)]">Draft</p>
            <p className="fv-data mt-1 text-3xl font-extrabold">{summary.draft_drives}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[var(--text-muted)]">Closed</p>
            <p className="fv-data mt-1 text-3xl font-extrabold">{summary.closed_drives}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <p className="mb-3 font-semibold text-[var(--text-strong)]">Active drives</p>
          {drivesQuery.isLoading ? (
            <p className="text-sm text-[var(--text-muted)]">Loading drives…</p>
          ) : activeDrives.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No active drives — connect recruiting data or seed demo drives.</p>
          ) : (
            <ul className="space-y-2">
              {activeDrives.map((drive) => (
                <li key={drive.id} className="flex justify-between text-sm">
                  <span>
                    <span className="font-medium">{drive.title}</span>
                    <span className="text-[var(--text-muted)]"> · {drive.company_name}</span>
                  </span>
                  <span className="text-[var(--text-muted)]">{drive.drive_date ?? "TBD"}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to={`${STAFF_PATHS.placement}/drives`}
            className="mt-4 inline-block text-sm font-semibold text-[var(--color-deep-teal)]"
          >
            View all drives
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
