import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Megaphone,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

import type { TimetableSession } from "@/api/student-dashboard";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BarChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { greeting, healthTier, formatTime, StudentQueryState } from "@/components/student";
import { TierBadge, sevForTier } from "@/design";
import { iconDefaults } from "@/design/tokens/icons";
import {
  useCampusAnnouncements,
  useStudentActivity,
  useStudentAssignments,
  useStudentAttendance,
  useStudentCareer,
  useStudentDashboard,
  useStudentExamPrep,
  useStudentId,
  useStudentNotifications,
  useStudentTimetable,
} from "@/hooks/useStudentContext";
import { useStudentNav } from "@/hooks/useStudentNav";
import {
  DashboardGrid,
  DashboardWidgetProvider,
  DailyBriefCard,
  KpiLayout,
  NotificationsSummary,
  QuickActions,
  RecentActivity,
  SidebarPanel,
  WidgetGrid,
  type KpiItem,
  type WidgetDefinition,
} from "@/layout/dashboard";
import { ResponsiveGrid, Section, WidgetCard } from "@/layout";
import { PageHeader } from "@/layout/PageHeader";
import { useShell } from "@/layout/shell/ShellProvider";
import { STUDENT_PATHS } from "@/routes/paths";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS = { file: FileText, sparkles: Sparkles, calendar: Calendar } as const;
const NOTIF_ICONS = { default: Megaphone, alert: ClipboardList, ai: Sparkles } as const;

function AgendaRow({
  item,
  onAi,
}: {
  item: TimetableSession;
  onAi: () => void;
}) {
  const isNow = item.status === "now";
  return (
    <div
      className={cn(
        "flex gap-3 border-b border-[var(--border-subtle)] py-3 last:border-b-0",
        isNow && "rounded-[var(--radius-sm)] bg-[var(--color-teal-50)] px-2 -mx-2",
      )}
    >
      <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-[var(--text-muted)]">
        {formatTime(item.start_time)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-strong)]">{item.title}</span>
          {isNow && (
            <Badge tone="neutral" className="text-[10px]">
              Now
            </Badge>
          )}
          {item.status === "urgent" && (
            <Badge tone="neutral" className="text-[10px]">
              Due soon
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          {[item.room, item.faculty_name, item.notes].filter(Boolean).join(" · ")}
        </p>
        {(item.session_type === "free" || item.notes) && (
          <Button variant="ghost" size="sm" className="mt-1 h-7 px-0" onClick={onAi}>
            <Sparkles size={12} /> Ask Forevue
          </Button>
        )}
      </div>
    </div>
  );
}

function OverviewTab() {
  const nav = useStudentNav();
  const shell = useShell();
  const dashboard = useStudentDashboard();
  const timetable = useStudentTimetable();
  const assignments = useStudentAssignments("open");
  const attendance = useStudentAttendance();
  const examPrep = useStudentExamPrep();
  const campus = useCampusAnnouncements();
  const notifications = useStudentNotifications();
  const activity = useStudentActivity();

  const d = dashboard.data;
  const onAi = () => nav.toAi();

  const quickActions = [
    { id: "qa-ask", label: "Ask Forevue", icon: Sparkles, onClick: () => nav.toAi() },
    { id: "qa1", label: "Ask about today", icon: Sparkles, onClick: () => nav.toAi({ prompt: "What should I focus on today?" }) },
    { id: "qa2", label: "Check fees", icon: ClipboardList, onClick: nav.toFees },
    { id: "qa3", label: "Check attendance", icon: Check, onClick: nav.toAttendance },
    { id: "qa4", label: "Exam prep plan", icon: Target, onClick: nav.toExamPrep },
  ];

  const widgets: WidgetDefinition[] = [
    {
      id: "attendance",
      title: "Attendance intelligence",
      kind: "custom",
      footer: "Grounded in attendance register",
      render: () => (
        <StudentQueryState
          isLoading={attendance.isLoading}
          isError={attendance.isError}
          onRetry={() => attendance.refetch()}
          empty={!attendance.data}
        >
          {attendance.data && (
            <div className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] text-[var(--text-muted)]">Current</div>
                  <div className="flex items-center gap-2">
                    <span className="fv-data text-[26px] font-extrabold">{attendance.data.overall_pct}%</span>
                  </div>
                </div>
                {attendance.data.predicted_pct != null && (
                  <div className="text-right">
                    <div className="text-[11px] text-[var(--text-muted)]">Predicted</div>
                    <div className="text-lg font-bold tabular-nums">{attendance.data.predicted_pct}%</div>
                  </div>
                )}
              </div>
              <Progress value={attendance.data.overall_pct} label={`Required ${attendance.data.required_pct}%`} showValue />
              <p className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-2.5 text-[12.5px] leading-normal">
                {attendance.data.note}
              </p>
              <Button variant="secondary" size="sm" fullWidth onClick={nav.toAttendance}>
                Open attendance intelligence
              </Button>
            </div>
          )}
        </StudentQueryState>
      ),
    },
    {
      id: "exam",
      title: "Exam readiness",
      kind: "custom",
      footer: examPrep.data?.headline ?? "",
      render: () => (
        <StudentQueryState isLoading={examPrep.isLoading} isError={examPrep.isError} onRetry={() => examPrep.refetch()}>
          {examPrep.data && (
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <span className="fv-data text-[26px] font-extrabold">{examPrep.data.overall_readiness}</span>
                <span className="text-sm text-[var(--text-muted)]">/100 ready</span>
              </div>
              {examPrep.data.subjects.map((s) => (
                <div key={s.course_id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{s.course_name}</span>
                    <span className="font-semibold tabular-nums">{s.readiness_pct}%</span>
                  </div>
                  <Progress value={s.readiness_pct} />
                </div>
              ))}
              <p className="text-xs text-[var(--text-body)]">{examPrep.data.tip}</p>
              <Button variant="secondary" size="sm" fullWidth onClick={nav.toExamPrep}>
                Start revision
              </Button>
            </div>
          )}
        </StudentQueryState>
      ),
    },
    {
      id: "performance",
      title: "Performance trend",
      kind: "custom",
      footer: "Semester averages",
      span: 2,
      render: () => (
        <StudentQueryState isLoading={dashboard.isLoading} isError={dashboard.isError}>
          {d && d.semester_trend.length > 0 && (
            <BarChart
              bars={d.semester_trend.map((s) => ({
                label: s.label,
                value: `${s.value_pct}%`,
                height: `${Math.max(12, s.value_pct)}%`,
              }))}
            />
          )}
        </StudentQueryState>
      ),
    },
  ];

  if (!d) {
    return (
      <StudentQueryState
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  const tier = healthTier(d.health_score);

  return (
    <>
      {d.attention_banner && (
        <Alert tone="draft" title={d.attention_banner.title} icon={<AlertTriangle size={16} />}>
          {d.attention_banner.body}
        </Alert>
      )}

      <DailyBriefCard
        title="Your daily brief"
        text={d.daily_brief.text}
        bullets={d.daily_brief.bullets}
      />

      <Card className="mb-4 border-[var(--color-teal-200)]">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-strong)]">Ask me anything</p>
            <p className="text-xs text-[var(--text-muted)]">Grounded answers about your own record — timetable, fees, attendance.</p>
          </div>
          <Button variant="primary" onClick={() => nav.toAi()}>
            <Sparkles size={iconDefaults.size} /> Open Ask
          </Button>
        </CardContent>
      </Card>

      <ResponsiveGrid variant="dashboard" className="mb-4">
        <Card padding="none" className="overflow-hidden">
          <CardHeader eyebrow="Academic health" title={<span className="inline-flex items-center gap-2">Academic health <Badge tone="teal">AI</Badge></span>} />
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center">
                <div className="fv-data text-5xl font-extrabold tabular-nums" style={{ color: sevForTier(tier).ink }}>
                  {d.health_score}
                </div>
                <div className="mt-1">
                  <Badge tone="teal">{d.health_label}</Badge>
                </div>
              </div>
              <div className="min-w-[180px] flex-1 space-y-2">
                {d.health_factors.map((f) => (
                  <div key={f.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>{f.label}</span>
                      <span className="font-semibold tabular-nums">{f.value}</span>
                    </div>
                    <Progress value={f.value} />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-body)]">{d.health_narrative}</p>
            <Button variant="ghost" size="sm" onClick={onAi}>
              <Sparkles size={14} /> Explain in AI workspace
            </Button>
          </CardContent>
        </Card>

        <Card padding="none" className="overflow-hidden border-[var(--color-amber-200)]">
          <CardHeader eyebrow="Daily brief" title="What matters today" />
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-[var(--text-body)]">{d.daily_brief.text}</p>
            <ul className="space-y-2 text-[13px] text-[var(--text-body)]">
              {d.daily_brief.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--color-deep-teal)]" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--text-muted)]">It surfaces — you decide.</p>
          </CardContent>
        </Card>
      </ResponsiveGrid>

      <KpiLayout
        kpis={d.kpis.map(
          (k): KpiItem => ({
            id: k.id,
            label: k.label,
            value: k.value,
            sub: k.sub ?? undefined,
            delta: k.delta ?? undefined,
            deltaDir: (k.delta_dir as KpiItem["deltaDir"]) ?? undefined,
            valueClassName: k.value_class === "watch" ? "text-[var(--color-risk-watch)]" : undefined,
          }),
        )}
        className="mb-4"
      />

      <DashboardGrid
        primary={
          <div className="flex flex-col gap-4">
            <Section
              aria-label="Today's agenda"
              title="Today"
              actions={
                <Button variant="ghost" size="sm" onClick={nav.toTimetable}>
                  Timetable
                </Button>
              }
            >
              <Card padding="none">
                <CardContent className="space-y-0 pt-4">
                  <StudentQueryState isLoading={timetable.isLoading} isError={timetable.isError} empty={!timetable.data?.sessions.length}>
                    {timetable.data?.sessions.map((item) => (
                      <AgendaRow key={item.id} item={item} onAi={onAi} />
                    ))}
                  </StudentQueryState>
                </CardContent>
              </Card>
            </Section>

            <DashboardWidgetProvider widgets={widgets}>
              <WidgetGrid />
            </DashboardWidgetProvider>

            <Section aria-label="Assignments" title="Assignments" eyebrow>
              <Card padding="none">
                <StudentQueryState isLoading={assignments.isLoading} isError={assignments.isError} empty={!assignments.data?.items.length}>
                  {assignments.data?.items.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0">
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                        <FileText size={16} strokeWidth={iconDefaults.strokeWidth} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{a.title}</span>
                          <Badge tone="neutral">{a.priority}</Badge>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">{a.due_label} · {a.course_name}</p>
                        <Progress value={a.progress_pct} className="mt-2 max-w-[160px]" />
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => nav.toAi({ assignmentId: a.id })}>
                        AI help
                      </Button>
                    </div>
                  ))}
                </StudentQueryState>
                <div className="border-t border-[var(--border-subtle)] p-2">
                  <Button variant="ghost" size="sm" fullWidth onClick={nav.toAssignments}>
                    View all assignments
                  </Button>
                </div>
              </Card>
            </Section>

            <Section aria-label="Your growth" title="Your growth this term" eyebrow>
              <ResponsiveGrid variant="auto">
                {[
                  { icon: Flame, value: `${d.study_streak_days}-day`, label: "study streak" },
                  { icon: TrendingUp, value: d.cgpa ? `+${(d.cgpa - 8.2).toFixed(1)}` : "+0.2", label: "CGPA since last semester" },
                  { icon: BookOpen, value: `${d.on_time_submissions} in a row`, label: "on-time submissions" },
                ].map((g) => (
                  <Card key={g.label} padding="md" className="flex gap-3">
                    <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                      <g.icon size={16} />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold">{g.value}</div>
                      <div className="text-xs text-[var(--text-muted)]">{g.label}</div>
                    </div>
                  </Card>
                ))}
              </ResponsiveGrid>
            </Section>
          </div>
        }
        secondary={
          <div className="flex flex-col gap-4">
            <SidebarPanel title="AI Coach">
              <div className="flex flex-col gap-3">
                {d.coach_items.map((c) => (
                  <div key={c.coach_key} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-3">
                    <div className="text-[13px] font-semibold">{c.title}</div>
                    <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-body)]">Why: </span>
                      {c.why}
                    </p>
                    <Button variant="secondary" size="sm" className="mt-2" onClick={() => nav.toAi({ coach: c.coach_key })}>
                      {c.cta}
                    </Button>
                  </div>
                ))}
              </div>
            </SidebarPanel>
            <QuickActions items={quickActions} title="Quick actions" />
            <SidebarPanel title="Campus feed">
              <StudentQueryState isLoading={campus.isLoading} isError={campus.isError} empty={!campus.data?.length}>
                {campus.data?.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full gap-2.5 rounded-[var(--radius-md)] border-none bg-transparent p-2 text-left hover:bg-[var(--color-neutral-100)]"
                    onClick={onAi}
                  >
                    <Megaphone size={15} className="mt-0.5 text-[var(--color-deep-teal)]" />
                    <span>
                      <span className="block text-[12.5px] font-semibold">{item.title}</span>
                      <span className="block text-[11px] text-[var(--text-muted)]">
                        {[item.location, item.time_label].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                ))}
              </StudentQueryState>
            </SidebarPanel>
            <NotificationsSummary
              items={(notifications.data ?? []).map((n) => ({
                id: n.id,
                icon: NOTIF_ICONS[n.tone as keyof typeof NOTIF_ICONS] ?? Megaphone,
                title: n.title,
                body: n.body ?? undefined,
                time: n.time_label,
                tone: n.tone as "default" | "alert" | "ai",
              }))}
              onViewAll={() => shell.openOverlay("notifications")}
            />
            <RecentActivity
              items={(activity.data ?? []).map((a) => ({
                id: a.id,
                icon: ACTIVITY_ICONS.sparkles,
                text: a.summary,
                time: a.time_label,
              }))}
            />
          </div>
        }
      />
    </>
  );
}

function AcademicsTab() {
  const dashboard = useStudentDashboard();
  const d = dashboard.data;

  return (
    <StudentQueryState isLoading={dashboard.isLoading} isError={dashboard.isError} onRetry={() => dashboard.refetch()}>
      {d && (
        <ResponsiveGrid variant="auto">
          <WidgetCard title="Subject health">
            <ul className="space-y-2 text-sm">
              {d.subject_health.map((s) => (
                <li key={s.course_code} className="flex items-center gap-2">
                  <TierBadge tier={s.tier as "low" | "watch" | "high"} size="sm" />
                  <span className="flex-1">{s.course_name}</span>
                  <Badge tone="neutral">{s.status}</Badge>
                </li>
              ))}
            </ul>
          </WidgetCard>
          <WidgetCard title="Credits & progress">
            <div className="flex items-baseline gap-2">
              <span className="fv-data text-3xl font-extrabold">{d.kpis.find((k) => k.id === "k3")?.value ?? "—"}</span>
              <span className="text-sm text-[var(--text-muted)]">credits done</span>
            </div>
            <Progress value={72} className="mt-3" showValue />
          </WidgetCard>
          <WidgetCard title="Performance trend" className="lg:col-span-2">
            <BarChart
              bars={d.semester_trend.map((s) => ({
                label: s.label,
                value: `${s.value_pct}%`,
                height: `${Math.max(12, s.value_pct)}%`,
              }))}
            />
          </WidgetCard>
        </ResponsiveGrid>
      )}
    </StudentQueryState>
  );
}

function CareerTab() {
  const career = useStudentCareer();
  const nav = useStudentNav();

  return (
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
              <p className="mt-3 text-sm text-[var(--text-body)]">{career.data.narrative}</p>
            </WidgetCard>
            <WidgetCard title="Skills">
              <div className="flex flex-wrap gap-2">
                {career.data.skills.map((s) => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>
            </WidgetCard>
            <WidgetCard title="Opportunities" className="lg:col-span-2">
              <ul className="space-y-3 text-sm">
                {career.data.opportunities.map((o) => (
                  <li key={o.title} className="flex items-center gap-3">
                    {o.icon === "graduation" ? (
                      <GraduationCap size={16} className="text-[var(--color-deep-teal)]" />
                    ) : (
                      <Briefcase size={16} className="text-[var(--color-deep-teal)]" />
                    )}
                    <span>
                      <span className="block font-semibold">{o.title}</span>
                      <span className="text-xs text-[var(--text-muted)]">{o.subtitle}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </WidgetCard>
          </ResponsiveGrid>
          <div className="mt-4">
            <Button variant="secondary" onClick={nav.toCareer}>
              Open career workspace
            </Button>
          </div>
        </>
      )}
    </StudentQueryState>
  );
}

export function StudentDashboardPage() {
  const [tab, setTab] = React.useState("overview");
  const studentId = useStudentId();
  const dashboard = useStudentDashboard();
  const d = dashboard.data;

  const clockText = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dateText = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  if (!studentId) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-[var(--text-muted)]">
        Sign in with a linked student account or set <code>VITE_DEMO_STUDENT_ID</code>.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Brief" }]}
        title={d ? `${greeting()}, ${d.first_name}.` : "Brief"}
        description={d ? `${d.programme_name ?? ""} · ${d.semester_label}. ${d.day_summary}` : "Loading your brief…"}
        eyebrow={
          d && (
            <span className="inline-flex items-center gap-2 text-[12.5px] text-[var(--text-muted)]">
              <Clock size={14} className="text-[var(--color-deep-teal)]" />
              <span className="tabular-nums">{clockText}</span>
              <span>·</span>
              <span>{dateText}</span>
              <span>·</span>
              <span>{d.session_label}</span>
            </span>
          )
        }
      />

      <div className="mb-4 border-b border-[var(--border-subtle)]">
        <Tabs
          items={[
            { id: "overview", label: "Overview" },
            { id: "academics", label: "Academics" },
            { id: "career", label: "Career" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "academics" && <AcademicsTab />}
      {tab === "career" && <CareerTab />}

      <footer className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--border-subtle)] pt-4 text-[12.5px] text-[var(--text-muted)]">
        <span>Forevue · Clarity, early.</span>
        <Link to={STUDENT_PATHS.career} className="ml-auto text-[var(--text-link)]">
          Career workspace
        </Link>
      </footer>
    </div>
  );
}
