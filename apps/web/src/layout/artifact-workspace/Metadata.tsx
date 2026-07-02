import { cn } from "@/lib/utils";

import type { MetadataRow } from "./types";

export interface MetadataPanelProps {
  rows: MetadataRow[];
  className?: string;
}

/** Artifact metadata — Details dock tab */
export function MetadataPanel({ rows, className }: MetadataPanelProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="fv-eyebrow mb-2">Metadata</div>
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <div
            key={row.id}
            className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-0.5 py-2"
          >
            <span className="inline-flex shrink-0 text-[var(--color-neutral-500)]">
              <Icon size={14} />
            </span>
            <span className="flex-1 text-xs text-[var(--text-muted)]">{row.label}</span>
            {row.variant === "tag" ? (
              <span
                className="rounded-[5px] px-2 py-px text-[11px] font-semibold"
                style={{ color: row.tagColor, background: row.tagBg }}
              >
                {row.value}
              </span>
            ) : (
              <span className="text-right text-xs font-semibold text-[var(--text-strong)]">
                {row.value}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
