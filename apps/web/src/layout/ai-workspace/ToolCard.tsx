import { Check, Loader2, Settings } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { ToolRunBlock, ToolRunState } from "./types";

const stateStyles: Record<
  ToolRunState,
  { border: string; headBg: string; accent: string; badgeBg: string; label: string }
> = {
  running: {
    border: "var(--color-teal-300)",
    headBg: "var(--color-teal-50)",
    accent: "var(--color-deep-teal)",
    badgeBg: "var(--color-teal-50)",
    label: "Running",
  },
  done: {
    border: "var(--border-subtle)",
    headBg: "var(--surface-page)",
    accent: "var(--color-risk-low)",
    badgeBg: "var(--color-risk-low-bg)",
    label: "Done",
  },
  error: {
    border: "var(--color-risk-high)",
    headBg: "var(--color-risk-high-bg)",
    accent: "var(--color-risk-high)",
    badgeBg: "var(--color-risk-high-bg)",
    label: "Failed",
  },
};

const stepIcon = {
  pending: Settings,
  active: Loader2,
  done: Check,
} as const;

/** Tool run card — AI Workspace transcript block */
export function ToolCard({ title, state, steps }: ToolRunBlock) {
  const style = stateStyles[state];

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface-card)]"
      style={{ borderColor: style.border }}
    >
      <div
        className="flex items-center gap-2.5 px-[13px] py-2.5"
        style={{ background: style.headBg }}
      >
        <span className="inline-flex text-[var(--color-deep-teal)]" style={{ color: style.accent }}>
          <Settings size={15} strokeWidth={iconDefaults.strokeWidth} />
        </span>
        <span className="flex-1 text-[12.5px] font-semibold text-[var(--text-strong)]">{title}</span>
        <span
          className="rounded-[5px] px-[7px] py-0.5 text-[10.5px] font-bold tracking-wide uppercase"
          style={{ color: style.accent, background: style.badgeBg }}
        >
          {style.label}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 px-[13px] py-1.5 pb-3">
        {steps.map((step) => {
          const Icon = stepIcon[step.status];
          return (
            <div key={step.id} className="flex items-center gap-2.5 py-1.5">
              <span
                className={cn(
                  "inline-flex size-[18px] items-center justify-center",
                  step.status === "done"
                    ? "text-[var(--color-risk-low)]"
                    : step.status === "active"
                      ? "text-[var(--color-deep-teal)]"
                      : "text-[var(--color-neutral-400)]",
                )}
              >
                <Icon
                  size={15}
                  strokeWidth={iconDefaults.strokeWidth}
                  className={step.status === "active" ? "animate-spin" : undefined}
                />
              </span>
              <span
                className={cn(
                  "flex-1 text-[12.5px]",
                  step.status === "pending" ? "text-[var(--text-muted)]" : "text-[var(--text-body)]",
                )}
              >
                {step.label}
              </span>
              {step.meta && (
                <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{step.meta}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
