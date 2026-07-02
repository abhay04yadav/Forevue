import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Check, ClipboardList, Target } from "lucide-react";

import { StudentQueryState } from "@/components/student";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentDashboard } from "@/hooks/useStudentContext";
import { PageHeader } from "@/layout/PageHeader";
import { STUDENT_PATHS } from "@/routes/paths";

const LINKS = [
  { to: STUDENT_PATHS.attendance, label: "Attendance", icon: Check, description: "Standing vs required line" },
  { to: STUDENT_PATHS.assignments, label: "Assignments", icon: ClipboardList, description: "Open work and deadlines" },
  { to: STUDENT_PATHS.examPrep, label: "Exam prep", icon: Target, description: "Readiness by subject" },
] as const;

export function StudentAcademicsPage() {
  const dashboard = useStudentDashboard();

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Brief" }, { label: "Academics" }]}
        title="Academics"
        description="Attendance, assignments, and exam readiness in one place."
      />
      <StudentQueryState isLoading={dashboard.isLoading} isError={dashboard.isError} onRetry={() => dashboard.refetch()}>
        {dashboard.data && (
          <Card className="mb-4">
            <CardContent className="p-5">
              <p className="text-sm text-[var(--text-muted)]">Subject health snapshot</p>
              <ul className="mt-3 space-y-2">
                {dashboard.data.subject_health.map((s) => (
                  <li key={s.course_code} className="flex justify-between text-sm">
                    <span className="font-medium">{s.course_name}</span>
                    <span className="text-[var(--text-muted)]">{s.status}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </StudentQueryState>
      <div className="grid gap-3 sm:grid-cols-3">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--color-teal-300)]"
          >
            <link.icon size={18} className="mb-2 text-[var(--color-deep-teal)]" aria-hidden />
            <p className="font-semibold text-[var(--text-strong)]">{link.label}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{link.description}</p>
          </Link>
        ))}
      </div>
      <Card className="mt-4 border-dashed">
        <CardContent className="flex items-center gap-3 p-4 text-sm text-[var(--text-muted)]">
          <BookOpen size={18} className="shrink-0 text-[var(--color-deep-teal)]" aria-hidden />
          Marks and performance trends also appear on your Brief home.
        </CardContent>
      </Card>
    </div>
  );
}
