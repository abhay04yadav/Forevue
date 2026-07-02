import { Check } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import { WORKFLOW_LABELS } from "./mock-data";
import type { WorkflowStage } from "./types";

const STAGES: WorkflowStage[] = ["draft", "review", "approved", "published"];

export interface ApprovalBarProps {
  stage: WorkflowStage;
  className?: string;
}

/** Workflow approval stepper — Draft → Review → Approved → Published */
export function ApprovalBar({ stage, className }: ApprovalBarProps) {
  const currentIndex = STAGES.indexOf(stage);

  return (
    <div
      className={cn("flex items-center gap-0 overflow-x-auto px-[18px] pb-2.5", className)}
      aria-label="Approval workflow"
    >
      {STAGES.map((id, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const upcoming = index > currentIndex;

        return (
          <div key={id} className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex size-[22px] items-center justify-center rounded-full border-[1.5px] text-[10.5px] font-bold",
                done && "border-[var(--color-deep-teal)] bg-[var(--color-deep-teal)] text-white",
                current &&
                  "border-[var(--color-deep-teal)] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]",
                upcoming &&
                  "border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-muted)]",
              )}
            >
              {done ? (
                <Check size={12} strokeWidth={iconDefaults.strokeWidth} />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                current && "font-bold text-[var(--text-strong)]",
                done && "font-medium text-[var(--text-body)]",
                upcoming && "font-medium text-[var(--text-muted)]",
              )}
            >
              {WORKFLOW_LABELS[id]}
            </span>
            {index < STAGES.length - 1 && (
              <span
                className="mx-2.5 h-px w-[34px] shrink-0"
                style={{
                  background: index < currentIndex ? "var(--color-deep-teal)" : "var(--border-default)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
