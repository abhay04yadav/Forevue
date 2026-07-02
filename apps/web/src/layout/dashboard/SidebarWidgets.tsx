import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { ActivityItem, NotificationItem, NotificationTone } from "./types";

const notificationToneClass: Record<
  NotificationTone,
  { bg: string; color: string }
> = {
  default: {
    bg: "bg-[var(--color-teal-50)]",
    color: "text-[var(--color-deep-teal)]",
  },
  alert: {
    bg: "bg-[var(--color-risk-watch-bg)]",
    color: "text-[var(--color-risk-watch)]",
  },
  ai: {
    bg: "bg-[var(--color-teal-50)]",
    color: "text-[var(--color-deep-teal)]",
  },
};

export interface SidebarPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

/** Generic side-rail card — Dashboard Framework secondary column */
export function SidebarPanel({
  title,
  badge,
  action,
  className,
  children,
  ...props
}: SidebarPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)]",
        className,
      )}
      {...props}
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="fv-eyebrow m-0 flex-1">{title}</h2>
        {badge}
        {action}
      </div>
      {children}
    </div>
  );
}

export interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[];
}

/** Recent activity feed — Dashboard Framework side rail */
export function RecentActivity({ items, className, ...props }: RecentActivityProps) {
  return (
    <SidebarPanel title="Recent activity" className={className} {...props}>
      <div className="flex flex-col">
        {items.map((item) => (
          <ActivityRow key={item.id} icon={item.icon} text={item.text} time={item.time} />
        ))}
      </div>
    </SidebarPanel>
  );
}

function ActivityRow({
  icon: Icon,
  text,
  time,
}: {
  icon: LucideIcon;
  text: string;
  time: string;
}) {
  return (
    <div className="flex gap-[11px] py-2.5">
      <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
        <Icon size={15} strokeWidth={iconDefaults.strokeWidth} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] leading-snug text-[var(--text-body)]">{text}</div>
        <div className="mt-px text-[11.5px] text-[var(--text-muted)]">{time}</div>
      </div>
    </div>
  );
}

export interface NotificationsSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NotificationItem[];
  onViewAll?: () => void;
}

/** Notifications summary — Dashboard Framework side rail */
export function NotificationsSummary({
  items,
  onViewAll,
  className,
  ...props
}: NotificationsSummaryProps) {
  return (
    <SidebarPanel
      title="Notifications"
      badge={
        <span className="rounded-full bg-[var(--color-amber-50)] px-2 py-px text-[11px] font-bold text-[var(--color-amber-700)]">
          {items.length}
        </span>
      }
      className={className}
      {...props}
    >
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const tone = notificationToneClass[item.tone ?? "default"];
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-[11px]">
              <span
                className={cn(
                  "inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg",
                  tone.bg,
                  tone.color,
                )}
              >
                <Icon size={15} strokeWidth={iconDefaults.strokeWidth} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-[var(--text-strong)]">
                  {item.title}
                </div>
                {item.body && (
                  <div className="text-[11.5px] text-[var(--text-muted)]">{item.body}</div>
                )}
                <div className="mt-px text-[11.5px] text-[var(--text-muted)]">{item.time}</div>
              </div>
            </div>
          );
        })}
      </div>
      {onViewAll && (
        <Button variant="secondary" size="sm" fullWidth className="mt-3" onClick={onViewAll}>
          View all
        </Button>
      )}
    </SidebarPanel>
  );
}
