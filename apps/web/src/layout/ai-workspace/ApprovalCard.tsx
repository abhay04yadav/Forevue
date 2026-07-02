import { ArrowRight, Check, Shield, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { ApprovalBlock, ApprovalStatus } from "./types";

const resolvedMeta: Record<
  Exclude<ApprovalStatus, "pending">,
  { label: string; color: string; icon: typeof Check }
> = {
  approved: { label: "Approved", color: "var(--color-risk-low)", icon: Check },
  rejected: { label: "Rejected", color: "var(--color-risk-high)", icon: X },
};

export interface ApprovalCardProps extends ApprovalBlock {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPreview?: (id: string) => void;
  onEdit?: (id: string) => void;
}

/** Human approval card — AI Workspace gated write-back */
export function ApprovalCard({
  id,
  title,
  summary,
  changes,
  status,
  onApprove,
  onReject,
  onPreview,
  onEdit,
}: ApprovalCardProps) {
  const resolved = status !== "pending" ? resolvedMeta[status] : null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-amber-200)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-amber-200)] bg-[var(--color-amber-50)] px-3.5 py-2.5">
        <span className="inline-flex text-[var(--color-amber-700)]">
          <Shield size={16} strokeWidth={iconDefaults.strokeWidth} />
        </span>
        <span className="flex-1 text-[13px] font-bold text-[var(--color-amber-700)]">
          Human approval required
        </span>
      </div>
      <div className="p-3.5">
        <div className="mb-1 text-sm font-semibold text-[var(--text-strong)]">{title}</div>
        <p className="m-0 mb-3 text-[13.5px] leading-normal text-[var(--text-muted)]">{summary}</p>
        <div className="mb-3.5 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
          {changes.map((change) => (
            <div
              key={change.label}
              className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-3 py-2.5 text-[12.5px] last:border-b-0"
            >
              <span className="inline-flex text-[var(--color-deep-teal)]">
                <ArrowRight size={13} strokeWidth={iconDefaults.strokeWidth} />
              </span>
              <span className="flex-1 text-[var(--text-body)]">{change.label}</span>
              <span className="text-[var(--text-muted)]">{change.value}</span>
            </div>
          ))}
        </div>

        {status === "pending" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => onApprove?.(id)}>
              Approve
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onPreview?.(id)}>
              Preview changes
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit?.(id)}>
              Edit before apply
            </Button>
            <button
              type="button"
              onClick={() => onReject?.(id)}
              className="ml-auto border-none bg-transparent text-[12.5px] font-semibold text-[var(--color-risk-high)]"
            >
              Reject
            </button>
          </div>
        ) : resolved ? (
          <div
            className="flex items-center gap-2 text-[13px] font-semibold"
            style={{ color: resolved.color }}
          >
            <resolved.icon size={15} strokeWidth={iconDefaults.strokeWidth} />
            {resolved.label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
