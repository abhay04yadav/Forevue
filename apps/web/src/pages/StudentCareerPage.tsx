import { Briefcase, GraduationCap } from "lucide-react";

import { StudentQueryState } from "@/components/student";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStudentCareer, useStudentId } from "@/hooks/useStudentContext";
import { useStudentNav } from "@/hooks/useStudentNav";
import { PageHeader } from "@/layout/PageHeader";
import { ResponsiveGrid, WidgetCard } from "@/layout";

export function StudentCareerPage() {
  const studentId = useStudentId();
  const nav = useStudentNav();
  const career = useStudentCareer();

  if (!studentId) {
    return <p className="text-sm text-[var(--text-muted)]">Student record unavailable.</p>;
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Career" }]}
        title="Career"
        description="Placement readiness and opportunities"
      />
      <StudentQueryState isLoading={career.isLoading} isError={career.isError} onRetry={() => career.refetch()}>
        {career.data && (
          <>
            <ResponsiveGrid variant="auto">
              <WidgetCard title="Placement readiness">
                <div className="flex items-baseline gap-2">
                  <span className="fv-data text-3xl font-extrabold">{career.data.readiness_score}</span>
                  <span className="text-sm text-[var(--text-muted)]">/100</span>
                </div>
                <Progress value={career.data.readiness_score} className="mt-3" />
                <p className="mt-3 text-sm">{career.data.narrative}</p>
              </WidgetCard>
              <WidgetCard title="Credits">
                <div className="flex items-baseline gap-2">
                  <span className="fv-data text-3xl font-extrabold">{career.data.credits_completed}</span>
                  <span className="text-sm text-[var(--text-muted)]">/ {career.data.credits_required}</span>
                </div>
                <Progress
                  value={Math.round((100 * career.data.credits_completed) / career.data.credits_required)}
                  className="mt-3"
                  showValue
                />
              </WidgetCard>
              <WidgetCard title="Skills" className="lg:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {career.data.skills.map((s) => (
                    <Badge key={s} tone="neutral">{s}</Badge>
                  ))}
                </div>
              </WidgetCard>
            </ResponsiveGrid>

            <Card padding="none" className="mt-4">
              <CardContent className="pt-4">
                <h2 className="fv-eyebrow mb-3">Opportunities</h2>
                <ul className="space-y-4">
                  {career.data.opportunities.map((o) => (
                    <li key={o.title} className="flex items-center gap-3">
                      {o.icon === "graduation" ? (
                        <GraduationCap size={18} className="text-[var(--color-deep-teal)]" />
                      ) : (
                        <Briefcase size={18} className="text-[var(--color-deep-teal)]" />
                      )}
                      <span>
                        <span className="block font-semibold">{o.title}</span>
                        <span className="text-xs text-[var(--text-muted)]">{o.subtitle}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="primary" onClick={nav.toArtifacts}>
                Open resume workspace
              </Button>
              <Button variant="secondary" onClick={() => nav.toAi({ context: "career" })}>
                Ask Forevue about career
              </Button>
            </div>
          </>
        )}
      </StudentQueryState>
    </div>
  );
}
