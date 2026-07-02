import { useQuery } from "@tanstack/react-query";

import { listPlacementDrives } from "@/api/placement";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/design";
import { PageHeader } from "@/layout/PageHeader";

export function PlacementDrivesPage() {
  const drivesQuery = useQuery({ queryKey: ["placement-drives"], queryFn: listPlacementDrives });

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Placement"
        title="Drives"
        description="Campus placement drives and recruiter pipelines."
      />

      {drivesQuery.isLoading && <LoadingState label="Loading drives…" />}
      {drivesQuery.isError && (
        <ErrorState title="Couldn't load drives" message="Try again." onRetry={() => drivesQuery.refetch()} />
      )}

      {drivesQuery.data && (
        <Card>
          <CardContent className="divide-y divide-[var(--border-subtle)] p-0">
            {drivesQuery.data.length === 0 ? (
              <p className="p-5 text-sm text-[var(--text-muted)]">No drives yet for this tenant.</p>
            ) : (
              drivesQuery.data.map((drive) => (
                <div key={drive.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                  <div>
                    <p className="font-semibold text-[var(--text-strong)]">{drive.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">{drive.company_name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium capitalize">{drive.status}</p>
                    <p className="text-[var(--text-muted)]">{drive.drive_date ?? "Date TBD"} · {drive.location ?? "Campus"}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
