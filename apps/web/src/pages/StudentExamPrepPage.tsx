import { StudentQueryState } from "@/components/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudentExamPrep, useStudentId } from "@/hooks/useStudentContext";
import { useStudentNav } from "@/hooks/useStudentNav";
import { PageHeader } from "@/layout/PageHeader";

export function StudentExamPrepPage() {
  const studentId = useStudentId();
  const nav = useStudentNav();
  const examPrep = useStudentExamPrep();

  if (!studentId) {
    return <p className="text-sm text-[var(--text-muted)]">Student record unavailable.</p>;
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Exam prep" }]}
        title="Exam readiness"
        description={examPrep.data?.headline ?? "Subject readiness from your internals"}
      />
      <Card padding="md" className="mb-4">
        <StudentQueryState isLoading={examPrep.isLoading} isError={examPrep.isError} onRetry={() => examPrep.refetch()}>
          {examPrep.data && (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="fv-data text-4xl font-extrabold">{examPrep.data.overall_readiness}</span>
                <span className="text-sm text-[var(--text-muted)]">/100 ready</span>
              </div>
              <p className="text-sm text-[var(--text-body)]">{examPrep.data.tip}</p>
            </div>
          )}
        </StudentQueryState>
      </Card>

      <Card padding="none">
        <CardContent className="divide-y divide-[var(--border-subtle)] pt-2">
          <StudentQueryState isLoading={examPrep.isLoading} isError={examPrep.isError} empty={!examPrep.data?.subjects.length}>
            {examPrep.data?.subjects.map((s) => (
              <div key={s.course_id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.course_name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {s.exam_name}
                    {s.days_until_exam != null ? ` · in ${s.days_until_exam} days` : ""}
                  </div>
                  <Progress value={s.readiness_pct} className="mt-2 max-w-md" />
                </div>
                <Button variant="secondary" size="sm" onClick={() => nav.toAi({ coach: "exam", subject: s.course_code })}>
                  Start revision
                </Button>
              </div>
            ))}
          </StudentQueryState>
        </CardContent>
      </Card>
    </div>
  );
}
