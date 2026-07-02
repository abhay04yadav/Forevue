import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import * as React from "react";
import { Link, useParams } from "react-router-dom";

import { getStudent360, getStudentRisk } from "@/api";
import { createIntervention } from "@/api/risk";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FindingCard } from "@/components/risk/FindingCard";
import {
  ErrorState,
  LoadingState,
  TierBadge,
  sevForTier,
  type Tier,
} from "@/design";
import { PageHeader } from "@/layout/PageHeader";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Student 360 — GET /students/{id} + GET /risk/students/{id} */
export function Student360Page() {
  const { studentId = "" } = useParams<{ studentId: string }>();
  const queryClient = useQueryClient();
  const [intTitle, setIntTitle] = React.useState("");
  const [intNotes, setIntNotes] = React.useState("");

  const profileQuery = useQuery({
    queryKey: ["student-360", studentId],
    queryFn: () => getStudent360(studentId),
    enabled: !!studentId,
  });

  const riskQuery = useQuery({
    queryKey: ["student-risk", studentId],
    queryFn: () => getStudentRisk(studentId),
    enabled: !!studentId,
  });

  const logIntervention = useMutation({
    mutationFn: () =>
      createIntervention({
        student_id: studentId,
        type: "mentor_meeting",
        title: intTitle,
        notes: intNotes || undefined,
      }),
    onSuccess: () => {
      setIntTitle("");
      setIntNotes("");
      queryClient.invalidateQueries({ queryKey: ["student-risk", studentId] });
      queryClient.invalidateQueries({ queryKey: ["faculty-dashboard"] });
    },
  });

  if (!studentId) {
    return <ErrorState title="Student not found" message="No student id in the URL." />;
  }

  if (profileQuery.isLoading || riskQuery.isLoading) {
    return <LoadingState label="Loading student record…" />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Student record didn't load"
        message="The student profile couldn't be loaded. They may be outside your scope."
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;
  const assessment = riskQuery.data?.current;
  const tier = (assessment?.tier ?? "low") as Tier;
  const findings = assessment?.findings ?? [];
  const history = riskQuery.data?.history ?? [];
  const activeInterventions = riskQuery.data?.active_interventions ?? [];

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[
          { label: "Home" },
          { label: "Risk board", href: "/board" },
          { label: profile.name },
        ]}
        title={profile.name}
        description={
          <>
            <span className="fv-data">{profile.canonical_roll_no}</span>
            {profile.status && (
              <>
                {" "}
                · <span className="capitalize">{profile.status}</span>
              </>
            )}
          </>
        }
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link to="/board">
              <ArrowLeft size={14} />
              Back to board
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto]">
        <Card padding="md">
          <div className="flex flex-wrap items-center gap-4">
            {assessment ? (
              <>
                <div>
                  <div className="fv-eyebrow mb-1">Risk score</div>
                  <div
                    className="fv-data text-4xl font-extrabold tabular-nums"
                    style={{ color: sevForTier(tier).ink }}
                  >
                    {Math.round(assessment.overall_score)}
                  </div>
                </div>
                <TierBadge tier={tier} size="md" />
                <p className="text-sm text-[var(--text-muted)]">
                  Computed {formatDate(assessment.computed_at)}
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No current risk assessment.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Findings</h2>
          {findings.length === 0 ? (
            <Card padding="md">
              <p className="text-sm text-[var(--text-muted)]">No active findings.</p>
            </Card>
          ) : (
            <ul className="flex flex-col gap-3">
              {findings.map((f) => (
                <FindingCard key={`${f.code}-${f.risk_type}`} finding={f} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Attendance</h2>
          <Card padding="none">
            {profile.attendance_summary.length === 0 ? (
              <CardContent className="py-4 text-sm text-[var(--text-muted)]">
                No attendance registered.
              </CardContent>
            ) : (
              <ul>
                {profile.attendance_summary.map((row) => (
                  <li
                    key={row.course_id}
                    className="border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0"
                  >
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium text-[var(--text-strong)]">Course</span>
                      <span className="tabular-nums font-semibold">{row.percentage}%</span>
                    </div>
                    <Progress value={row.percentage} />
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {row.present_sessions} / {row.total_sessions} sessions
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Internal marks</h2>
          <Card padding="none">
            {profile.marks.length === 0 ? (
              <CardContent className="py-4 text-sm text-[var(--text-muted)]">No marks on file.</CardContent>
            ) : (
              <ul>
                {profile.marks.map((mark, i) => {
                  const pct =
                    Number(mark.max_marks) > 0
                      ? Math.round((Number(mark.obtained) / Number(mark.max_marks)) * 100)
                      : 0;
                  return (
                    <li
                      key={`${mark.assessment_type}-${mark.attempt}-${i}`}
                      className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-strong)]">
                          {mark.assessment_type}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">Attempt {mark.attempt}</div>
                      </div>
                      <span className="fv-data text-lg font-bold tabular-nums">
                        {mark.obtained}/{mark.max_marks}
                        <span className="ml-2 text-sm font-medium text-[var(--text-muted)]">({pct}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">Interventions</h2>
          <Card padding="md" className="mb-4">
            {activeInterventions.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No active interventions logged.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {activeInterventions.map((i) => (
                  <li key={i.id} className="rounded-md border border-[var(--border-subtle)] px-3 py-2">
                    <p className="font-medium">{i.title}</p>
                    <p className="text-[var(--text-muted)]">{i.status} · {i.type}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card padding="md">
            <p className="mb-3 text-sm font-semibold">Log intervention</p>
            <div className="space-y-2">
              <Input value={intTitle} onChange={(e) => setIntTitle(e.target.value)} placeholder="Title" />
              <Input value={intNotes} onChange={(e) => setIntNotes(e.target.value)} placeholder="Notes (optional)" />
              <Button
                size="sm"
                disabled={!intTitle.trim() || logIntervention.isPending}
                onClick={() => logIntervention.mutate()}
              >
                {logIntervention.isPending ? "Saving…" : "Log intervention"}
              </Button>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-strong)]">History</h2>
          {history.length === 0 ? (
            <Card padding="md">
              <p className="text-sm text-[var(--text-muted)]">No prior assessments.</p>
            </Card>
          ) : (
            <ul className="flex flex-col gap-2">
              {history.slice(0, 8).map((h) => (
                <li
                  key={h.id}
                  className={cn(
                    "flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3",
                  )}
                >
                  <div>
                    <TierBadge tier={h.tier as Tier} size="sm" />
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {formatDate(h.computed_at)}
                    </p>
                  </div>
                  <span
                    className="fv-data text-xl font-extrabold tabular-nums"
                    style={{ color: sevForTier(h.tier as Tier).ink }}
                  >
                    {Math.round(h.overall_score)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
