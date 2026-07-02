import { AlertTriangle, Bookmark, ListTree, MessageSquare, Sparkles } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { OutlineItem } from "./types";

export interface OutlinePanelProps {
  sections: OutlineItem[];
  activeSectionId?: string;
  onSelect?: (id: string) => void;
  validationMessage?: string;
  className?: string;
}

/** Document outline — sections, bookmarks, validation */
export function OutlinePanel({
  sections,
  activeSectionId,
  onSelect,
  validationMessage = "1 section needs a citation before review.",
  className,
}: OutlinePanelProps) {
  return (
    <aside
      aria-label="Outline"
      className={cn(
        "flex w-[236px] shrink-0 flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--surface-card)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3.5 py-3">
        <ListTree size={16} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-deep-teal)]" />
        <span className="flex-1 text-[13px] font-bold text-[var(--text-strong)]">Outline</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2.5">
        <div className="fv-eyebrow px-2 pt-1.5 pb-1">Sections</div>
        {sections.map((section) => {
          const active = section.id === activeSectionId || section.active;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect?.(section.id)}
              className={cn(
                "mb-px flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none px-2.25 py-2 text-left",
                active ? "bg-[var(--color-teal-50)]" : "bg-transparent hover:bg-[var(--color-neutral-100)]",
              )}
            >
              <span
                className="size-[5px] shrink-0 rounded-full"
                style={{
                  background: section.aiGenerated
                    ? "var(--color-deep-teal)"
                    : "var(--color-neutral-400)",
                }}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[12.5px]",
                  active ? "font-semibold text-[var(--color-deep-teal)]" : "text-[var(--text-body)]",
                )}
              >
                {section.title}
              </span>
              {section.hasComment && (
                <MessageSquare
                  size={13}
                  strokeWidth={iconDefaults.strokeWidth}
                  className="shrink-0 text-[var(--color-amber-700)]"
                  title="Has a comment"
                />
              )}
              {section.aiGenerated && !section.hasComment && (
                <Sparkles
                  size={12}
                  strokeWidth={iconDefaults.strokeWidth}
                  className="shrink-0 text-[var(--color-deep-teal)]"
                />
              )}
            </button>
          );
        })}

        <div className="fv-eyebrow px-2 pt-3.5 pb-1">Bookmarks</div>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none bg-transparent px-2.25 py-2 text-left hover:bg-[var(--color-neutral-100)]"
        >
          <Bookmark size={13} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-neutral-500)]" />
          <span className="text-[12.5px] text-[var(--text-body)]">Key recommendation</span>
        </button>

        <div className="fv-eyebrow px-2 pt-3.5 pb-1">Validation</div>
        <div className="flex items-start gap-2 px-2.25 py-2 text-xs leading-snug text-[var(--text-body)]">
          <AlertTriangle
            size={13}
            strokeWidth={iconDefaults.strokeWidth}
            className="mt-px shrink-0 text-[var(--color-risk-watch)]"
          />
          <span>{validationMessage}</span>
        </div>
      </div>
    </aside>
  );
}
