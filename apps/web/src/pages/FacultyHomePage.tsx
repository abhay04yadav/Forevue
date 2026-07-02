import {
  Activity,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  FileText,
  Megaphone,
  PenLine,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { listRiskAlerts } from "@/api/risk";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { FacultyEmptyScopeState } from "@/components/faculty/FacultyEmptyScopeState";
import {
  AdvisoryBadge,
  BasedOnTags,
  FacultyKpiCard,
  FacultyProgress,
  HealthRing,
  RegisterStatusBadge,
  TimelineDot,
} from "@/components/faculty/FacultyDashboardUi";
import { greeting, formatTime } from "@/components/student";
import { ErrorState, LoadingState, TierBadge, type Tier } from "@/design";
import { iconDefaults } from "@/design/tokens/icons";
import {
  DashboardGrid,
  NotificationsSummary,
  RecentActivity,
  SidebarPanel,
} from "@/layout/dashboard";
import { ResponsiveGrid, Section } from "@/layout";
import { PageHeader } from "@/layout/PageHeader";
import { useFacultyDashboard } from "@/hooks/useFacultyDashboard";
import { useShell } from "@/layout/shell/ShellProvider";
import { cn } from "@/lib/utils";
import { STAFF_PATHS, STUDENT_PATHS } from "@/routes/paths";

const BRIEF_ICONS = {
  calendar: Calendar,
  clipboard: ClipboardList,
  users: Users,
  file: FileText,
} as const;

const COACH_ICONS: Record<string, typeof TrendingDown> = {
  performance: TrendingDown,
  coverage: Clock,
  attendance: Clock,
  stable: Activity,
};

function ClassTimelineRow({
  item,
  onAi,
  isLast,
}: {
  item: {
    id: string;
    start_time: string;
    title: string;
    section: string | null;
    room: string | null;
    student_count: number | null;
    status: string;
    status_note: string | null;
    session_type: string;
  };
  onAi: () => void;
  isLast: boolean;
}) {
  const isNow = item.status === "now";
  const isDone = item.status === "done";
  const isFree = item.session_type === "free";
  const isTeaching = ["lecture", "lab", "tutorial"].includes(item.session_type);

  return (
    <div
      className={cn(
        "grid grid-cols-[52px_20px_1fr] gap-x-2 px-4 py-3",
        isNow && "bg-[var(--color-teal-50)]",
        !isLast && "border-b border-[var(--border-subtle)]",
      )}
    >
      <span className="pt-0.5 text-right text-xs font-semibold tabular-nums text-[var(--text-muted)]">
        {formatTime(item.start_time)}
      </span>
      <div className="relative flex flex-col items-center">
        <TimelineDot status={item.status} sessionType={item.session_type} />
        {!isLast && <span className="mt-1 w-px flex-1 bg-[var(--border-subtle)]" aria-hidden />}
      </div>
      <div className="min-w-0 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-strong)]">{item.title}</span>
          {isNow && (
            <Badge tone="amber" className="text-[10px] uppercase tracking-wide">
              Now · 40 min left
            </Badge>
          )}
        </div>
        {(item.section || item.room || item.student_count) && (
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {[item.section, item.room, item.student_count ? `${item.student_count} students` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {isDone && item.status_note && (
          <p className="mt-1 text-xs text-[var(--text-body)]">
            {item.status_note}{" "}
            <button type="button" className="font-semibold text-[var(--color-deep-teal)]" onClick={onAi}>
              View
            </button>
          </p>
        )}
        {isFree && item.status_note && (
          <p className="mt-1 text-xs text-[var(--text-body)]">
            {item.status_note}{" "}
            <button type="button" className="font-semibold text-[var(--color-deep-teal)]" onClick={onAi}>
              Plan
            </button>
          </p>
        )}
        {isTeaching && !isDone && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="primary" size="sm" className="h-7 text-xs">
              Take attendance
            </Button>
            <Button variant="secondary" size="sm" className="h-7 text-xs">
              Material
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onAi}>
              <Sparkles size={12} /> Ask AI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewTab() {
  const navigate = useNavigate();
  const shell = useShell();
  const dashboard = useFacultyDashboard();
  const alertsQuery = useQuery({ queryKey: ["risk-alerts"], queryFn: () => listRiskAlerts() });
  const [viewMode, setViewMode] = React.useState<"typical" | "attention">("typical");

  const d = dashboard.data;
  const onAi = () => navigate(STUDENT_PATHS.ai);

  if (!d?.has_scope) return null;

  const unreadAlerts = (alertsQuery.data ?? []).filter((a) => a.status !== "read");
  const notificationItems = unreadAlerts.slice(0, 4).map((a) => ({
    id: a.id,
    icon: Megaphone,
    title: a.reason,
    body: a.channel,
    time: new Date(a.created_at).toLocaleString(),
    tone: "alert" as const,
  }));

  const activityItems = d.recent_activity.map((a) => ({
    id: a.id,
    icon: FileText,
    text: a.text,
    time: new Date(a.at).toLocaleString(),
  }));

  const teachingCount = d.classes_today.filter((c) =>
    ["lecture", "lab", "tutorial"].includes(c.session_type),
  ).length;

  const quickActionGrid = [
    { id: "q1", label: "Generate quiz", icon: Sparkles, onClick: () => navigate(`${STAFF_PATHS.create}/assessment`) },
    { id: "q2", label: "Generate notes", icon: PenLine, onClick: () => navigate(`${STAFF_PATHS.create}/assessment`) },
    { id: "q3", label: "Create assignment", icon: FileText, onClick: () => navigate(`${STAFF_PATHS.create}/assignment`) },
    { id: "q4", label: "Take attendance", icon: Check, onClick: () => navigate(`${STAFF_PATHS.teaching}/progress`) },
    { id: "q5", label: "AI workspace", icon: Sparkles, onClick: onAi },
    { id: "q6", label: "Create artifact", icon: PenLine, onClick: () => navigate(STAFF_PATHS.create) },
  ];

  const flaggedStudents = viewMode === "attention" ? d.flagged_students : d.flagged_students.slice(0, 3);

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" className="text-[var(--text-muted)]">
          Preview
        </Button>
        <Button
          variant={viewMode === "typical" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setViewMode("typical")}
        >
          Typical day
        </Button>
        <Button
          variant={viewMode === "attention" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setViewMode("attention")}
        >
          Attention needed
        </Button>
      </div>

      <ResponsiveGrid variant="dashboard" className="mb-4">
        <Card padding="none" className="overflow-hidden">
          <CardHeader
            eyebrow={
              <span className="inline-flex items-center gap-1.5">
                <Activity size={14} className="text-[var(--color-deep-teal)]" />
                Class health
              </span>
            }
            title={
              <span className="inline-flex items-center gap-2">
                Class health <Badge tone="teal">AI</Badge>
              </span>
            }
          />
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-6">
              <HealthRing score={d.health_score} label={d.health_label} />
              <div className="min-w-[200px] flex-1 space-y-2.5">
                {d.health_factors.map((f) => (
                  <div key={f.label}>
                    <div className="mb-1 flex justify-between text-xs text-[var(--text-body)]">
                      <span>{f.label}</span>
                      <span className="font-semibold tabular-nums">{f.value}%</span>
                    </div>
                    <FacultyProgress value={f.value} tone="teal" />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-body)]">{d.health_narrative}</p>
            <div>
              <p className="fv-eyebrow mb-2 text-[10px]">Based on</p>
              <BasedOnTags items={d.health_sources} />
            </div>
            <Button variant="ghost" size="sm" className="text-[var(--color-deep-teal)]" onClick={onAi}>
              <Sparkles size={14} className="text-[var(--color-amber-600)]" /> Explain
            </Button>
          </CardContent>
        </Card>

        <Card padding="none" className="overflow-hidden border-[var(--color-amber-200)] bg-[var(--color-amber-50)]/30">
          <CardHeader
            eyebrow={
              <span className="inline-flex items-center gap-1.5 text-[var(--color-amber-700)]">
                <Sparkles size={14} className="text-[var(--color-amber-600)]" />
                Daily brief
              </span>
            }
            title="Daily brief"
            trailing={
              <button type="button" className="text-xs font-semibold text-[var(--color-deep-teal)]" onClick={onAi}>
                Open full brief
              </button>
            }
          />
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-[var(--text-body)]">{d.daily_brief.text}</p>
            <ul className="space-y-2.5">
              {d.brief_actions.map((action) => {
                const Icon = BRIEF_ICONS[action.icon as keyof typeof BRIEF_ICONS] ?? Calendar;
                return (
                  <li key={action.text} className="flex items-center gap-2.5 text-[13px]">
                    <Icon size={15} className="shrink-0 text-[var(--color-deep-teal)]" strokeWidth={iconDefaults.strokeWidth} />
                    <span className="flex-1 text-[var(--text-body)]">{action.text}</span>
                    <button type="button" className="font-semibold text-[var(--color-deep-teal)]">
                      {action.link_label}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div>
              <p className="fv-eyebrow mb-2 text-[10px]">Based on</p>
              <BasedOnTags items={["Your timetable", "Attendance registers", "Submission queue"]} />
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
              <Button variant="ghost" size="sm" className="text-[var(--color-deep-teal)]" onClick={onAi}>
                <Sparkles size={14} /> Ask AI
              </Button>
              <span className="text-xs text-[var(--text-muted)]">It surfaces — you decide.</span>
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        {d.kpis.map((kpi) => (
          <FacultyKpiCard
            key={kpi.id}
            kpiId={kpi.id}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub ?? undefined}
          />
        ))}
      </div>

      <DashboardGrid
        primary={
          <div className="flex flex-col gap-4">
            <Section
              aria-label="Today's classes"
              title="Today's classes"
              actions={
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--text-muted)]">{teachingCount} classes · on pace</span>
                  <button type="button" className="font-semibold text-[var(--color-deep-teal)]">
                    Full schedule
                  </button>
                </div>
              }
            >
              <Card padding="none">
                {d.classes_today.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-[var(--text-muted)]">No sessions scheduled today.</p>
                ) : (
                  d.classes_today.map((item, index) => (
                    <ClassTimelineRow
                      key={item.id}
                      item={item}
                      onAi={onAi}
                      isLast={index === d.classes_today.length - 1}
                    />
                  ))
                )}
              </Card>
            </Section>

            <ResponsiveGrid variant="auto">
              {d.attendance_tasks && (
                <Card padding="none">
                  <CardHeader title="Attendance tasks" trailing={<span className="text-xs text-[var(--text-muted)]">Today</span>} />
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <div className="text-lg font-bold text-[var(--color-amber-700)]">{d.attendance_tasks.pending}</div>
                        <div className="text-[var(--text-muted)]">Pending</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[var(--color-risk-low)]">{d.attendance_tasks.completed}</div>
                        <div className="text-[var(--text-muted)]">Completed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-[var(--text-muted)]">{d.attendance_tasks.overdue}</div>
                        <div className="text-[var(--text-muted)]">Overdue</div>
                      </div>
                    </div>
                    <FacultyProgress
                      value={
                        d.attendance_tasks.total_count > 0
                          ? Math.round((d.attendance_tasks.filled_count / d.attendance_tasks.total_count) * 100)
                          : 0
                      }
                    />
                    <p className="text-xs text-[var(--text-muted)]">
                      Today&apos;s registers · {d.attendance_tasks.filled_count} of {d.attendance_tasks.total_count} filled
                    </p>
                    <ul className="space-y-2.5 text-sm">
                      {d.attendance_tasks.registers.map((r) => (
                        <li key={`${r.section}-${r.start_time}`} className="flex items-center justify-between gap-2">
                          <span className="text-[var(--text-body)]">
                            {r.section} — {r.course_code} ({formatTime(r.start_time)})
                          </span>
                          <RegisterStatusBadge status={r.status} />
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm">
                        Take attendance
                      </Button>
                      <Button variant="secondary" size="sm" onClick={onAi}>
                        AI analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {d.class_performance && (
                <Card padding="none">
                  <CardHeader
                    title="Class performance"
                    trailing={
                      d.class_performance.internals_in_days != null && (
                        <span className="text-xs text-[var(--text-muted)]">
                          Internals in {d.class_performance.internals_in_days} days
                        </span>
                      )
                    }
                  />
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="fv-data text-3xl font-extrabold text-[var(--text-strong)]">
                        {d.class_performance.avg_internal_pct}%
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">avg internal</span>
                      {d.class_performance.delta_pts != null && (
                        <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-[var(--color-risk-low)]">
                          <TrendingUp size={14} /> + {d.class_performance.delta_pts} pts
                        </span>
                      )}
                    </div>
                    {d.class_performance.subjects.map((s) => (
                      <div key={s.course_code}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-[var(--text-body)]">
                            {s.section} — {s.course_code}
                          </span>
                          <span className="font-semibold tabular-nums">{s.avg_pct}%</span>
                        </div>
                        <FacultyProgress value={s.avg_pct} tone={s.tone === "watch" ? "amber" : "green"} />
                      </div>
                    ))}
                    <p className="text-xs leading-relaxed text-[var(--text-body)]">{d.class_performance.insight}</p>
                  </CardContent>
                </Card>
              )}

              <Card padding="none">
                <CardHeader eyebrow title="Quick actions" />
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {quickActionGrid.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={action.onClick}
                        className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3 text-center text-xs font-medium text-[var(--text-body)] transition-colors hover:border-[var(--color-teal-300)] hover:bg-[var(--color-teal-50)]"
                      >
                        <action.icon size={18} className="text-[var(--color-deep-teal)]" strokeWidth={iconDefaults.strokeWidth} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>

            <Section
              aria-label="Assignment reviews"
              title="Assignment reviews"
              actions={
                d.assignment_reviews.length > 0 && (
                  <span className="text-xs text-[var(--text-muted)]">Avg 6 min / submission</span>
                )
              }
            >
              <Card padding="none">
                {d.assignment_reviews.length === 0 ? (
                  <p className="p-4 text-sm text-[var(--text-muted)]">No open reviews in your scope.</p>
                ) : (
                  d.assignment_reviews.map((review) => (
                    <div key={review.id} className="border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{review.title}</span>
                        <Badge tone={review.priority === "soon" ? "amber" : "neutral"}>
                          {review.priority.toUpperCase()}
                        </Badge>
                        <span className="ml-auto text-xs text-[var(--text-muted)]">{review.due_label}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {review.section} · {review.submission_count} submissions
                      </p>
                      <FacultyProgress
                        value={
                          review.submission_count > 0
                            ? Math.round((review.graded_count / review.submission_count) * 100)
                            : 0
                        }
                        className="mt-2"
                      />
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {review.graded_count}/{review.submission_count} graded
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="primary" size="sm">
                          Review
                        </Button>
                        <Button variant="secondary" size="sm" onClick={onAi}>
                          AI eval
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <div className="border-t border-[var(--border-subtle)] p-2">
                  <Button variant="ghost" size="sm" fullWidth asChild>
                    <Link to={`${STAFF_PATHS.create}/assignment`}>View all reviews →</Link>
                  </Button>
                </div>
              </Card>
            </Section>

            {(viewMode === "attention" || flaggedStudents.length > 0) && (
              <Section
                aria-label="Students who need attention"
                title="Students who need attention"
                actions={<Badge tone="amber">{d.flagged_students.length} flagged</Badge>}
              >
                <div className="space-y-3">
                  {flaggedStudents.map((student) => (
                    <Card key={student.student_id} padding="md">
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{student.name}</span>
                            <span className="text-sm text-[var(--text-muted)]">{student.section}</span>
                            <TierBadge tier={student.tier as Tier} size="sm" />
                          </div>
                          <p className="mt-2 text-sm text-[var(--text-body)]">
                            <span className="font-semibold">Why: </span>
                            {student.why}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            <span className="font-semibold uppercase tracking-wide">Based on </span>
                            {student.based_on}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/students/${student.student_id}`}>View student</Link>
                            </Button>
                            <Button variant="primary" size="sm" onClick={onAi}>
                              Create intervention
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onAi}>
                              Open in AI
                            </Button>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-risk-watch)]">
                          {student.confidence_label} — {student.confidence_pct}% confidence
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-2" asChild>
                  <Link to={STAFF_PATHS.board}>View all students →</Link>
                </Button>
              </Section>
            )}

            {d.pending_approvals.length > 0 && (
              <Section
                aria-label="Pending approvals"
                title="Pending approvals"
                actions={<Badge tone="amber">{d.pending_approvals.length}</Badge>}
              >
                <Card padding="none">
                  {d.pending_approvals.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{item.kind}</div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {item.title} · {item.due_label}
                        </p>
                      </div>
                      <Button variant="primary" size="sm">
                        Approve
                      </Button>
                      <Button variant="secondary" size="sm">
                        Review
                      </Button>
                    </div>
                  ))}
                  <div className="border-t border-[var(--border-subtle)] p-2">
                    <Button variant="ghost" size="sm" fullWidth asChild>
                      <Link to={STAFF_PATHS.create}>Open approval center →</Link>
                    </Button>
                  </div>
                </Card>
              </Section>
            )}
          </div>
        }
        secondary={
          <div className="flex flex-col gap-4">
            <SidebarPanel
              title={
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[var(--color-deep-teal)]" />
                  AI insights
                </span>
              }
              badge={<AdvisoryBadge />}
            >
              <div className="flex flex-col gap-3">
                {d.coaching_items.map((c) => {
                  const CoachIcon = COACH_ICONS[c.coach_key] ?? Activity;
                  return (
                    <div
                      key={c.coach_key}
                      className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3"
                    >
                      <div className="flex items-start gap-2">
                        <CoachIcon size={15} className="mt-0.5 shrink-0 text-[var(--color-deep-teal)]" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-[var(--text-strong)]">{c.title}</div>
                          <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">
                            <span className="font-semibold text-[var(--text-body)]">Why: </span>
                            {c.why}
                          </p>
                          <div className="mt-2 flex gap-3">
                            <button type="button" className="text-xs font-semibold text-[var(--color-deep-teal)]" onClick={onAi}>
                              Open in AI
                            </button>
                            <button type="button" className="text-xs font-medium text-[var(--text-muted)]" onClick={onAi}>
                              View evidence
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SidebarPanel>
            <NotificationsSummary
              items={notificationItems}
              onViewAll={() => shell.openOverlay("notifications")}
            />
            <RecentActivity items={activityItems} />
          </div>
        }
      />
    </>
  );
}

export function FacultyHomePage() {
  const [tab, setTab] = React.useState("overview");
  const dashboard = useFacultyDashboard();
  const d = dashboard.data;

  const clockText = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dateText = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  if (dashboard.isLoading) return <LoadingState label="Loading your brief…" />;

  if (dashboard.isError || !d) {
    return (
      <ErrorState title="Brief didn't load" message="Try again in a moment." onRetry={() => dashboard.refetch()} />
    );
  }

  if (!d.has_scope) {
    return (
      <div className="pb-16">
        <PageHeader eyebrow="My teaching" title="Daily brief" description="Your scoped teaching command surface." />
        <FacultyEmptyScopeState />
      </div>
    );
  }

  const displayName = d.first_name ? `Dr. ${d.first_name}` : "Faculty";

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[{ label: "Home", href: STAFF_PATHS.home }, { label: "My teaching" }]}
        title={`${greeting()}, ${displayName}.`}
        description={
          <>
            {d.department_name ?? "Teaching"} · {d.semester_label}. {d.day_summary}
          </>
        }
        eyebrow={
          <span className="inline-flex items-center gap-2 text-[12.5px] text-[var(--text-muted)]">
            <Clock size={14} className="text-[var(--color-deep-teal)]" />
            <span className="tabular-nums">{clockText}</span>
            <span>·</span>
            <span>{dateText}</span>
            <span>·</span>
            <span>{d.session_label}</span>
          </span>
        }
      />

      <div className="mb-4 border-b border-[var(--border-subtle)]">
        <Tabs
          items={[
            { id: "overview", label: "Overview" },
            { id: "students", label: "Students" },
            { id: "reviews", label: "Reviews" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "overview" && <OverviewTab />}

      {tab === "students" && d.flagged_students.length > 0 && (
        <Section title="Students who need attention">
          <div className="space-y-3">
            {d.flagged_students.map((student) => (
              <Card key={student.student_id} padding="md">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{student.name}</span>
                      <span className="text-sm text-[var(--text-muted)]">{student.section}</span>
                      <TierBadge tier={student.tier as Tier} size="sm" />
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-body)]">
                      <span className="font-semibold">Why: </span>
                      {student.why}
                    </p>
                  </div>
                  <Button variant="primary" size="sm" asChild>
                    <Link to={`/students/${student.student_id}`}>View student</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {tab === "reviews" && (
        <Section title="Assignment reviews">
          <Card padding="none">
            {d.assignment_reviews.map((review) => (
              <div key={review.id} className="border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0">
                <div className="text-sm font-semibold">{review.title}</div>
                <p className="text-xs text-[var(--text-muted)]">
                  {review.section} · {review.submission_count} submissions · {review.due_label}
                </p>
              </div>
            ))}
          </Card>
        </Section>
      )}
    </div>
  );
}
