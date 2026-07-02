import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import * as React from "react";

import { iconDefaults } from "@/design/tokens/icons";

import type { EvidenceBlock, EvidenceConfidence } from "./types";

const confidenceMeta: Record<
  EvidenceConfidence,
  { label: string; color: string; shape: string }
> = {
  high: {
    label: "High",
    color: "var(--color-risk-low)",
    shape: "border-radius:2px",
  },
  watch: {
    label: "Watch",
    color: "var(--color-risk-watch)",
    shape: "border-radius:2px",
  },
  low: {
    label: "Low",
    color: "var(--color-neutral-500)",
    shape: "border-radius:999px",
  },
};

export interface EvidencePanelProps extends EvidenceBlock {
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/** Evidence tray — AI Workspace grounded answer block */
export function EvidencePanel({
  confidence,
  updated,
  sources,
  reasoning,
  defaultExpanded = false,
  onToggle,
}: EvidencePanelProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const meta = confidenceMeta[confidence];

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    onToggle?.(next);
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)]">
      <div className="flex flex-wrap items-center gap-2.5 px-[13px] py-2.5">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase"
          style={{ color: meta.color }}
        >
          <span
            className="inline-block size-[9px]"
            style={{ background: meta.color, borderRadius: meta.shape.includes("999") ? "999px" : "2px" }}
          />
          {meta.label} confidence
        </span>
        <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-muted)]">
          <Clock size={13} strokeWidth={iconDefaults.strokeWidth} />
          Updated {updated}
        </span>
        <button
          type="button"
          onClick={toggle}
          className="ml-auto inline-flex items-center gap-1 border-none bg-transparent text-[12px] font-semibold text-[var(--text-link)]"
        >
          {expanded ? (
            <ChevronUp size={14} strokeWidth={iconDefaults.strokeWidth} />
          ) : (
            <ChevronDown size={14} strokeWidth={iconDefaults.strokeWidth} />
          )}
          {expanded ? "Hide reasoning" : "Show reasoning"}
        </button>
      </div>

      <div className="px-[13px] pb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="self-center text-[11.5px] text-[var(--text-muted)]">Based on</span>
          {sources.map((source) => (
            <span
              key={source.label}
              className="rounded-md border border-[var(--color-teal-100)] bg-[var(--color-teal-50)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--color-deep-teal)]"
            >
              {source.label}
              {source.meta ? ` · ${source.meta}` : ""}
            </span>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--surface-card)] px-[13px] py-3">
          <div className="fv-eyebrow mb-1.5">Reasoning summary</div>
          <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-[18px] text-[13px] leading-normal text-[var(--text-body)]">
            {reasoning.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
