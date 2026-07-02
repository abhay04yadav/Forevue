import { Calendar } from "lucide-react";

import { StudentQueryState, formatTime } from "@/components/student";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentId, useStudentTimetable } from "@/hooks/useStudentContext";
import { PageHeader } from "@/layout/PageHeader";
import { cn } from "@/lib/utils";

export function StudentTimetablePage() {
  const studentId = useStudentId();
  const timetable = useStudentTimetable();

  if (!studentId) {
    return <p className="text-sm text-[var(--text-muted)]">Student record unavailable.</p>;
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Timetable" }]}
        title="Timetable"
        description={timetable.data?.summary ?? "Your schedule for today"}
      />
      <Card padding="none">
        <CardContent className="pt-4">
          <StudentQueryState
            isLoading={timetable.isLoading}
            isError={timetable.isError}
            onRetry={() => timetable.refetch()}
            empty={!timetable.data?.sessions.length}
          >
            {timetable.data?.sessions.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex gap-4 border-b border-[var(--border-subtle)] px-4 py-4 last:border-b-0",
                  item.status === "now" && "bg-[var(--color-teal-50)]",
                )}
              >
                <div className="w-16 text-right text-sm font-semibold tabular-nums text-[var(--text-muted)]">
                  {formatTime(item.start_time)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-strong)]">{item.title}</span>
                    {item.status === "now" && <Badge tone="neutral">Now</Badge>}
                    <Badge tone="neutral">{item.session_type}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {[item.room, item.faculty_name, item.notes].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Calendar size={16} className="shrink-0 text-[var(--color-deep-teal)]" />
              </div>
            ))}
          </StudentQueryState>
        </CardContent>
      </Card>
    </div>
  );
}
