import { Link } from "react-router-dom";
import { BookOpen, Calendar, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useFacultyDashboard } from "@/hooks/useFacultyDashboard";
import { PageHeader } from "@/layout/PageHeader";
import { STAFF_PATHS } from "@/routes/paths";

const LINKS = [
  {
    to: `${STAFF_PATHS.teaching}/lecture-planner`,
    label: "Lecture planner",
    icon: BookOpen,
    description: "Draft session plans grounded in your syllabus.",
  },
  {
    to: `${STAFF_PATHS.teaching}/progress`,
    label: "Course progress",
    icon: Target,
    description: "Coverage vs plan for each course you teach.",
  },
  {
    to: `${STAFF_PATHS.teaching}/office-hours`,
    label: "Office hours",
    icon: Calendar,
    description: "Set availability — bookings are human-confirmed.",
  },
] as const;

export function FacultyTeachingPage() {
  const dashboard = useFacultyDashboard();

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Teaching"
        title="Teaching workspace"
        description="Lecture planning, progress tracking, and office hours for your scoped courses."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {(dashboard.data?.course_progress ?? []).map((c) => (
          <Card key={c.course_id}>
            <CardContent className="p-4">
              <p className="text-sm font-semibold">{c.course_code}</p>
              <p className="text-2xl font-extrabold">{c.coverage_pct}%</p>
              <p className="text-xs text-[var(--text-muted)]">
                {c.delivered_sessions}/{c.planned_sessions} sessions
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {LINKS.map(({ to, label, icon: Icon, description }) => (
          <Link key={to} to={to} className="block">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <Icon size={20} className="mb-2 text-[var(--color-deep-teal)]" />
                <p className="font-semibold text-[var(--text-strong)]">{label}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
