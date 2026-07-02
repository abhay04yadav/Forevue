import * as React from "react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { ExportOption } from "./types";

export interface ExportMenuProps {
  options: ExportOption[];
  open: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/** Export format menu — Artifact Workspace header action */
export function ExportMenu({
  options,
  open,
  onClose,
  onSelect,
  className,
}: ExportMenuProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-[55]" onClick={onClose} />
      <div
        role="menu"
        aria-label="Export as"
        className={cn(
          "absolute top-full right-0 z-[56] mt-2 w-[230px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)] animate-fv-rise",
          className,
        )}
      >
        <div className="px-[13px] pt-2 pb-1 text-[10.5px] font-bold tracking-wide text-[var(--text-muted)] uppercase">
          Export as
        </div>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelect?.(option.id);
                onClose();
              }}
              className="flex w-full cursor-pointer items-center gap-[11px] border-none bg-transparent px-[13px] py-2.5 text-left text-[13px] text-[var(--text-body)] hover:bg-[var(--color-neutral-100)]"
            >
              <span className="inline-flex text-[var(--color-deep-teal)]">
                <Icon size={15} strokeWidth={iconDefaults.strokeWidth} />
              </span>
              <span className="flex-1">{option.label}</span>
              {option.ext && (
                <span className="text-[11px] text-[var(--text-muted)]">{option.ext}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
