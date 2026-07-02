import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Users,
} from "lucide-react";

import { Badge, Tag } from "@/components/ui/badge";
import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

/** KPI icon + status indicator mapping from Faculty Dashboard design */
export const FACULTY_KPI_META: Record<
  string,
  { icon: LucideIcon; subIndicator?: "diamond" | "dot" }
> = {
  classes: { icon: CalendarDays },
  reviews: { icon: ClipboardList, subIndicator: "diamond" },
  at_risk: { icon: Users, subIndicator: "diamond" },
  attendance_pending: { icon: CheckCircle, subIndicator: "dot" },
  approvals: { icon: ClipboardCheck },
  effectiveness: { icon: Activity },
};

export function FacultyKpiCard({
  label,
  value,
  sub,
  kpiId,
}: {
  label: string;
  value: string;
  sub?: string;
  kpiId: string;
}) {
  const meta = FACULTY_KPI_META[kpiId] ?? { icon: Activity };
  const Icon = meta.icon;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-[18px] py-4 shadow-[var(--shadow-sm)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-[9px] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
          <Icon size={16} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
        </span>
        <ChevronRight size={14} className="mt-1 text-[var(--color-neutral-400)]" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <span className="fv-eyebrow text-[11px]">{label}</span>
        <span className="fv-data text-[34px] leading-none font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
          {value}
        </span>
        {sub && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--text-muted)]">
            {meta.subIndicator === "diamond" && (
              <span
                className="inline-block size-2 rotate-45 bg-[var(--color-risk-watch)]"
                aria-hidden
              />
            )}
            {meta.subIndicator === "dot" && (
              <span
                className="inline-block size-2 rounded-full bg-[var(--color-risk-low)]"
                aria-hidden
              />
            )}
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

export function HealthRing({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative size-[120px]">
        <svg width="120" height="120" className="-rotate-90" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r={normalizedRadius}
            fill="transparent"
            stroke="var(--color-neutral-100)"
            strokeWidth={stroke}
          />
          <circle
            cx="60"
            cy="60"
            r={normalizedRadius}
            fill="transparent"
            stroke="var(--color-teal-500)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="fv-data text-4xl font-extrabold tabular-nums text-[var(--text-strong)]">
            {score}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-[var(--color-risk-low)]" aria-hidden />
        <span className="text-sm font-semibold text-[var(--text-strong)]">{label}</span>
      </div>
    </div>
  );
}

export function FacultyProgress({
  value,
  tone = "teal",
  className,
}: {
  value: number;
  tone?: "teal" | "amber" | "green";
  className?: string;
}) {
  const fill =
    tone === "amber"
      ? "bg-[var(--color-amber-600)]"
      : tone === "green"
        ? "bg-[var(--color-risk-low)]"
        : "bg-[var(--color-teal-500)]";

  return (
    <div className={cn("h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-neutral-100)]", className)}>
      <div
        className={cn("h-full rounded-[var(--radius-pill)] transition-[width]", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function TimelineDot({ status, sessionType }: { status: string; sessionType: string }) {
  if (sessionType === "free") {
    return (
      <span
        className="mt-1.5 inline-block size-2.5 rounded-full border-2 border-[var(--color-neutral-300)] bg-transparent"
        aria-hidden
      />
    );
  }
  if (status === "now") {
    return <span className="mt-1.5 inline-block size-2.5 rounded-full bg-[var(--color-amber-600)]" aria-hidden />;
  }
  if (status === "done") {
    return <span className="mt-1.5 inline-block size-2.5 rounded-full bg-[var(--color-risk-low)]" aria-hidden />;
  }
  return <span className="mt-1.5 inline-block size-2.5 rounded-full bg-[var(--color-teal-500)]" aria-hidden />;
}

export function RegisterStatusBadge({ status }: { status: string }) {
  if (status === "filled") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-risk-low)]">
        <span className="size-2 rounded-full bg-[var(--color-risk-low)]" aria-hidden />
        Filled
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-risk-watch)]">
        <span className="size-2 rotate-45 bg-[var(--color-risk-watch)]" aria-hidden />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-teal-500)]">
      <span className="size-2 rounded-full bg-[var(--color-teal-500)]" aria-hidden />
      Upcoming
    </span>
  );
}

export function BasedOnTags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Tag key={item} className="text-[11px]">
          {item}
        </Tag>
      ))}
    </div>
  );
}

export function AdvisoryBadge() {
  return <Badge tone="teal">Advisory</Badge>;
}
