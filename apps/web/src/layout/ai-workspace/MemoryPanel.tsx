import { X } from "lucide-react";
import * as React from "react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { MemoryItem } from "./types";

const tagTone: Record<NonNullable<MemoryItem["tone"]>, { color: string; bg: string }> = {
  preference: { color: "var(--color-deep-teal)", bg: "var(--color-teal-50)" },
  context: { color: "var(--color-amber-700)", bg: "var(--color-amber-50)" },
  temporary: { color: "var(--text-muted)", bg: "var(--color-neutral-100)" },
};

export interface MemoryPanelProps {
  items: MemoryItem[];
  onClearAll?: () => void;
  onForget?: (id: string) => void;
  className?: string;
}

/** Memory dock tab — visible, revocable AI memory */
export function MemoryPanel({ items, onClearAll, onForget, className }: MemoryPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <span className="fv-eyebrow flex-1">AI memory</span>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="border-none bg-transparent text-[12px] font-semibold text-[var(--color-risk-high)]"
          >
            Clear all
          </button>
        )}
      </div>

      {items.map((item) => {
        const tone = tagTone[item.tone ?? "temporary"];
        return (
          <div
            key={item.id}
            className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2.5"
          >
            <div className="mb-1 flex items-center gap-2">
              <span
                className="rounded-[5px] px-[7px] py-px text-[10.5px] font-bold tracking-wide uppercase"
                style={{ color: tone.color, background: tone.bg }}
              >
                {item.tag}
              </span>
              {onForget && (
                <button
                  type="button"
                  aria-label="Forget"
                  onClick={() => onForget(item.id)}
                  className="ml-auto inline-flex size-6 items-center justify-center rounded-md border-none bg-transparent text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)]"
                >
                  <X size={13} strokeWidth={iconDefaults.strokeWidth} />
                </button>
              )}
            </div>
            <div className="text-[13px] leading-snug text-[var(--text-body)]">{item.text}</div>
          </div>
        );
      })}

      <p className="px-0.5 text-[12px] leading-normal text-[var(--text-muted)]">
        Memory is visible and revocable. Temporary context clears when the conversation ends.
      </p>
    </div>
  );
}
