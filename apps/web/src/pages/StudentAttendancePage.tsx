import { StudentQueryState } from "@/components/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudentAttendance, useStudentId } from "@/hooks/useStudentContext";
import { useStudentNav } from "@/hooks/useStudentNav";
import { PageHeader } from "@/layout/PageHeader";

export function StudentAttendancePage() {
  const studentId = useStudentId();
  const nav = useStudentNav();
  const attendance = useStudentAttendance();

  if (!studentId) {
    return <p className="text-sm text-[var(--text-muted)]">Student record unavailable.</p>;
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Attendance" }]}
        title="Attendance intelligence"
        description="Per-subject standing against the required line"
      />
      <Card padding="md" className="mb-4">
        <StudentQueryState
          isLoading={attendance.isLoading}
          isError={attendance.isError}
          onRetry={() => attendance.refetch()}
        >
          {attendance.data && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Current</div>
                  <div className="fv-data text-4xl font-extrabold">{attendance.data.overall_pct}%</div>
                </div>
                {attendance.data.predicted_pct != null && (
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Predicted</div>
                    <div className="text-2xl font-bold tabular-nums">{attendance.data.predicted_pct}%</div>
                  </div>
                )}
              </div>
              <Progress
                value={attendance.data.overall_pct}
                label={`Required ${attendance.data.required_pct}%`}
                showValue
              />
              <p className="text-sm leading-relaxed">{attendance.data.note}</p>
            </div>
          )}
        </StudentQueryState>
      </Card>

      <Card padding="none">
        <CardContent className="divide-y divide-[var(--border-subtle)] pt-2">
          <StudentQueryState isLoading={attendance.isLoading} isError={attendance.isError} empty={!attendance.data?.courses.length}>
            {attendance.data?.courses.map((c) => (
              <div key={c.course_id} className="px-4 py-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{c.course_name}</span>
                  <span className="tabular-nums">
                    {c.present_sessions} / {c.total_sessions} sessions · {c.percentage}%
                  </span>
                </div>
                <Progress value={c.percentage} />
              </div>
            ))}
          </StudentQueryState>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button variant="secondary" onClick={() => nav.toAi({ context: "attendance" })}>
          Ask Forevue about attendance
        </Button>
      </div>
    </div>
  );
}
