import {
  AlertTriangle,
  Check,
  ClipboardList,
  FileText,
  Sparkles,
  User,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { PageHeader } from "@/layout/PageHeader";
import {
  DashboardGrid,
  DashboardWidgetProvider,
  KpiLayout,
  QuickActions,
  RecentActivity,
  NotificationsSummary,
  WidgetFilterBar,
  WidgetGrid,
  WidgetToolbar,
  baseWidgets,
  defaultKpis,
  defaultQuickActionLabels,
  useDashboardWidgets,
} from "@/layout/dashboard";
import { useShell } from "@/layout/shell/ShellProvider";

const activityItems = [
  { id: "a1", icon: FileText, text: "A report was generated", time: "12 min ago" },
  { id: "a2", icon: ClipboardList, text: "An approval was requested", time: "1 hour ago" },
  { id: "a3", icon: Sparkles, text: "Forevue surfaced a new pattern", time: "2 hours ago" },
  { id: "a4", icon: Check, text: "A task was marked complete", time: "4 hours ago" },
  { id: "a5", icon: User, text: "A member joined the workspace", time: "Yesterday" },
];

const notificationItems = [
  {
    id: "n1",
    icon: ClipboardList,
    title: "Approval requested",
    body: "An item is waiting for your sign-off.",
    time: "4 min ago",
    tone: "default" as const,
  },
  {
    id: "n2",
    icon: AlertTriangle,
    title: "Threshold crossed",
    body: "Two items moved past a line this week.",
    time: "3 hours ago",
    tone: "alert" as const,
  },
  {
    id: "n3",
    icon: Sparkles,
    title: "Recommendation ready",
    body: "A grounded summary is ready to review.",
    time: "Yesterday",
    tone: "ai" as const,
  },
];

function DashboardOverview() {
  const shell = useShell();
  const [timeRange, setTimeRange] = React.useState("Last 7 days");
  const [scope, setScope] = React.useState("All");
  const { setFilter } = useDashboardWidgets();

  const quickActions = defaultQuickActionLabels.map((label, i) => ({
    id: `qa-${i}`,
    label,
    onClick: () => shell.openOverlay("help"),
  }));

  return (
    <>
      <WidgetFilterBar
        timeRange={timeRange}
        scope={scope}
        onTimeRangeChange={setTimeRange}
        onScopeChange={setScope}
        onReset={() => {
          setTimeRange("Last 7 days");
          setScope("All");
          setFilter("");
        }}
      />

      <DashboardGrid
        primary={
          <>
            <KpiLayout kpis={defaultKpis} />
            <WidgetGrid
              emptyAction={
                <Button variant="ghost" size="sm" onClick={() => setFilter("")}>
                  Clear filters
                </Button>
              }
            />
          </>
        }
        secondary={
          <div className="flex flex-col gap-4">
            <QuickActions items={quickActions} />
            <RecentActivity items={activityItems} />
            <NotificationsSummary
              items={notificationItems}
              onViewAll={() => shell.openOverlay("notifications")}
            />
          </div>
        }
      />
    </>
  );
}

/** Dashboard Framework shell page — reusable overview every role inherits */
export function DashboardFrameworkPage() {
  const [tab, setTab] = React.useState("overview");

  return (
    <DashboardWidgetProvider widgets={baseWidgets}>
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Dashboard" }]}
        title="Dashboard"
        description="A reusable overview every role inherits."
        actions={<WidgetToolbar />}
      />

      <div className="mb-4 border-b border-[var(--border-subtle)]">
        <Tabs
          items={[
            { id: "overview", label: "Overview" },
            { id: "activity", label: "Activity" },
            { id: "reports", label: "Reports" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === "overview" && <DashboardOverview />}

      {tab === "activity" && (
        <div className="max-w-[760px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-2 shadow-[var(--shadow-sm)]">
          {activityItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex gap-3 border-b border-[var(--border-subtle)] py-3.5 last:border-b-0"
              >
                <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-[var(--text-body)]">{item.text}</div>
                  <div className="mt-0.5 text-xs text-[var(--text-muted)]">{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "reports" && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3.5">
          {["Report A", "Report B", "Report C", "Report D"].map((title) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[18px] shadow-[var(--shadow-sm)]"
            >
              <span className="inline-flex size-[38px] items-center justify-center rounded-[10px] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                <FileText size={19} />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-[var(--text-strong)]">{title}</div>
                <div className="mt-0.5 text-[13px] text-[var(--text-muted)]">
                  Placeholder · on demand
                </div>
              </div>
              <Button variant="secondary" size="sm" className="mt-auto w-fit">
                Open
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardWidgetProvider>
  );
}
