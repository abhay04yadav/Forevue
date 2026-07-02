import { cn } from "@/lib/utils";

import type { ContextItem } from "./types";

export interface ContextPanelProps {
  items: ContextItem[];
  roleLabel?: string;
  className?: string;
}

/** Context dock tab — scoped records Forevue may use */
export function ContextPanel({ items, roleLabel = "Faculty", className }: ContextPanelProps) {
  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="fv-eyebrow flex-1">In context</span>
          <span className="text-[11px] text-[var(--text-muted)]">{roleLabel}</span>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-[11px] py-2.5"
              >
                <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[var(--text-strong)]">{item.label}</div>
                  <div className="text-[11.5px] text-[var(--text-muted)]">{item.meta}</div>
                </div>
                {item.consentRequired && (
                  <span className="rounded-full bg-[var(--color-amber-50)] px-2 py-px text-[10px] font-bold text-[var(--color-amber-700)]">
                    Consent
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] px-3 py-2.5 text-[12px] leading-normal text-[var(--text-muted)]">
        Context is scoped to your role and least-privilege. The AI only uses what is listed here,
        and you can remove any item.
      </p>
    </div>
  );
}
