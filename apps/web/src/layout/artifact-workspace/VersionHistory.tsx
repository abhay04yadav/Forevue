import { GitCompare, RotateCcw } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { VersionEntry } from "./types";

const tagToneClass: Record<VersionEntry["tagTone"], { color: string; bg: string; dot: string }> = {
  human: {
    color: "var(--color-deep-teal)",
    bg: "var(--color-teal-50)",
    dot: "var(--color-deep-teal)",
  },
  approved: {
    color: "var(--color-risk-low)",
    bg: "var(--color-risk-low-bg)",
    dot: "var(--color-risk-low)",
  },
  ai: {
    color: "var(--color-amber-700)",
    bg: "var(--color-amber-50)",
    dot: "var(--color-amber)",
  },
};

export interface VersionHistoryProps {
  versions: VersionEntry[];
  onCompare?: () => void;
  onRestore?: (id: string) => void;
  className?: string;
}

/** Version history timeline — Artifact Workspace dock */
export function VersionHistory({
  versions,
  onCompare,
  onRestore,
  className,
}: VersionHistoryProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2">
        <span className="fv-eyebrow flex-1">Version history</span>
        {onCompare && (
          <button
            type="button"
            onClick={onCompare}
            className="inline-flex items-center gap-1 border-none bg-transparent text-[12px] font-semibold text-[var(--text-link)]"
          >
            <GitCompare size={13} strokeWidth={iconDefaults.strokeWidth} />
            Compare
          </button>
        )}
      </div>

      {versions.map((version, index) => {
        const tone = tagToneClass[version.tagTone];
        const isLast = index === versions.length - 1;

        return (
          <div key={version.id} className="flex gap-[11px]">
            <div className="flex flex-col items-center">
              <span
                className="size-[11px] rounded-full border-2 border-[var(--surface-card)]"
                style={{ background: tone.dot, boxShadow: `0 0 0 1px ${tone.dot}` }}
              />
              {!isLast && (
                <span className="my-0.5 w-px flex-1 bg-[var(--border-default)]" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[12.5px] font-bold text-[var(--text-strong)]">
                  {version.label}
                </span>
                <span
                  className="rounded-[5px] px-1.5 py-px text-[10px] font-bold tracking-wide uppercase"
                  style={{ color: tone.color, background: tone.bg }}
                >
                  {version.tag}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] text-[var(--text-muted)]">
                {version.who} · {version.time}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-[var(--text-body)]">
                {version.note}
              </div>
              {version.restorable && onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(version.id)}
                  className="mt-1.5 inline-flex items-center gap-1 border-none bg-transparent p-0 text-[11.5px] font-semibold text-[var(--text-link)]"
                >
                  <RotateCcw size={12} strokeWidth={iconDefaults.strokeWidth} />
                  Restore
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
