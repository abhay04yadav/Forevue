import { ArrowRight, Sparkles } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { QuickActionItem } from "./types";

export interface QuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: QuickActionItem[];
  title?: string;
}

/** AI quick actions rail — Dashboard Framework side panel */
export function QuickActions({
  items,
  title = "AI quick actions",
  className,
  ...props
}: QuickActionsProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)]",
        className,
      )}
      {...props}
    >
      <h2 className="fv-eyebrow m-0 mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2.5 text-left text-[13.5px] text-[var(--text-body)] transition-colors hover:border-[var(--color-teal-300)]"
          >
            <span className="inline-flex shrink-0 text-[var(--color-deep-teal)]">
              <Sparkles size={15} strokeWidth={iconDefaults.strokeWidth} />
            </span>
            <span className="flex-1">{item.label}</span>
            <span className="inline-flex text-[var(--color-neutral-400)]">
              <ArrowRight size={14} strokeWidth={iconDefaults.strokeWidth} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
