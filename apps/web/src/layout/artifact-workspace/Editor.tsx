import {
  ChevronDown,
  ChevronUp,
  Database,
  GripVertical,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";
import { KpiCard } from "@/layout/KpiCard";
import { Markdown } from "@/layout/ai-workspace/Markdown";
import { cn } from "@/lib/utils";

import { MOCK_CHART_BARS, MOCK_STATS, MOCK_TABLE } from "./mock-data";
import type { ArtifactSection } from "./types";

export interface ArtifactEditorProps {
  sections: ArtifactSection[];
  onSectionChange?: (id: string, markdown: string) => void;
  className?: string;
}

/** Artifact document editor — collapsible sections with rich blocks */
export function ArtifactEditor({ sections, onSectionChange, className }: ArtifactEditorProps) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  return (
    <article className={cn("flex flex-col gap-2", className)}>
      {sections.map((section) => {
        const open = !collapsed[section.id];
        return (
          <section
            key={section.id}
            id={`section-${section.id}`}
            className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)]"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2.5">
              <GripVertical
                size={15}
                strokeWidth={iconDefaults.strokeWidth}
                className="cursor-grab text-[var(--color-neutral-400)]"
              />
              <button
                type="button"
                aria-label={open ? "Collapse section" : "Expand section"}
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                }
                className="inline-flex border-none bg-transparent p-0 text-[var(--color-neutral-500)]"
              >
                {open ? (
                  <ChevronDown size={16} strokeWidth={iconDefaults.strokeWidth} />
                ) : (
                  <ChevronUp size={16} strokeWidth={iconDefaults.strokeWidth} className="rotate-180" />
                )}
              </button>
              <h2 className="m-0 min-w-0 flex-1 text-[14.5px] font-bold text-[var(--text-strong)]">
                {section.title}
              </h2>
              {section.aiGenerated && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-[var(--color-deep-teal)] uppercase">
                  <Sparkles size={11} strokeWidth={iconDefaults.strokeWidth} />
                  AI
                </span>
              )}
              <div className="flex items-center gap-px">
                <SectionIconButton label="Move up" icon={ChevronUp} />
                <SectionIconButton label="Move down" icon={ChevronDown} />
                <SectionIconButton
                  label="Regenerate section"
                  icon={RefreshCw}
                  accent
                />
              </div>
            </div>

            {open && (
              <div className="px-[18px] py-4">
                {section.kind === "text" && (
                  <textarea
                    value={section.markdown ?? ""}
                    onChange={(e) => onSectionChange?.(section.id, e.target.value)}
                    className="min-h-[120px] w-full resize-y border-none bg-transparent text-[14.5px] leading-[1.7] text-[var(--text-body)] outline-none"
                  />
                )}

                {section.kind === "text" && section.markdown && (
                  <div className="mt-3 border-t border-dashed border-[var(--border-subtle)] pt-3">
                    <p className="fv-eyebrow mb-2">Preview</p>
                    <Markdown content={section.markdown} />
                  </div>
                )}

                {section.kind === "stats" && (
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2.5">
                    {MOCK_STATS.map((stat) => (
                      <KpiCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        sub={stat.sub}
                        className="px-3.5 py-3"
                      />
                    ))}
                  </div>
                )}

                {section.kind === "table" && (
                  <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr>
                          {MOCK_TABLE.headers.map((h) => (
                            <th
                              key={h}
                              className="border-b border-[var(--border-subtle)] px-3 py-2 text-left font-semibold text-[var(--text-muted)]"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_TABLE.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, i) => (
                              <td
                                key={i}
                                className="border-b border-[var(--border-subtle)] px-3 py-2 text-[var(--text-body)] tabular-nums"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.kind === "chart" && (
                  <div className="relative flex h-[120px] items-end gap-2.5 px-0.5 pb-5">
                    {MOCK_CHART_BARS.map((bar) => (
                      <div
                        key={bar.label}
                        className="relative flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                      >
                        <span
                          className="text-[11px] font-bold tabular-nums"
                          style={{
                            color: bar.highlight
                              ? "var(--color-amber-700)"
                              : "var(--text-muted)",
                          }}
                        >
                          {bar.value}
                        </span>
                        <div
                          className="w-full rounded-t-[5px]"
                          style={{
                            height: bar.height,
                            background: bar.highlight
                              ? "var(--color-amber)"
                              : "var(--color-teal-200)",
                          }}
                        />
                        <span className="absolute bottom-0 text-[10.5px] text-[var(--text-muted)]">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {section.hasComment && (
                  <div className="mt-3.5 flex gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-amber-200)] border-l-[3px] border-l-[var(--color-amber)] bg-[var(--color-amber-50)] px-3 py-2.5">
                    <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--color-teal-600)] text-[10.5px] font-bold text-white">
                      KI
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-xs leading-snug text-[var(--text-body)]">
                        <span className="font-semibold text-[var(--text-strong)]">K. Iyer</span> —
                        can we cite the attendance source here before review?
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        2 hours ago ·{" "}
                        <button
                          type="button"
                          className="border-none bg-transparent p-0 text-[11px] font-semibold text-[var(--text-link)]"
                        >
                          Reply
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {section.hasErpAction && (
                  <div className="mt-3.5 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-amber-200)]">
                    <div className="flex items-center gap-2 border-b border-[var(--color-amber-200)] bg-[var(--color-amber-50)] px-[13px] py-2.5">
                      <Database
                        size={15}
                        strokeWidth={iconDefaults.strokeWidth}
                        className="text-[var(--color-amber-700)]"
                      />
                      <span className="flex-1 text-[12.5px] font-bold text-[var(--color-amber-700)]">
                        ERP action — requires your approval
                      </span>
                    </div>
                    <div className="p-[13px]">
                      <div className="mb-0.5 text-[13.5px] font-semibold text-[var(--text-strong)]">
                        Save this report to the ERP record
                      </div>
                      <p className="m-0 mb-2.5 text-[12.5px] leading-normal text-[var(--text-muted)]">
                        Forevue will not write to the ERP on its own. Review the change, then
                        approve.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="primary" size="sm">
                          Approve &amp; save
                        </Button>
                        <Button variant="secondary" size="sm">
                          Preview changes
                        </Button>
                        <button
                          type="button"
                          className="ml-auto border-none bg-transparent text-[12.5px] font-semibold text-[var(--color-risk-high)]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}

      <button
        type="button"
        className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-transparent px-3 py-2.5 text-[13px] font-semibold text-[var(--text-muted)] hover:border-[var(--color-teal-300)] hover:text-[var(--color-deep-teal)]"
      >
        <Plus size={15} strokeWidth={iconDefaults.strokeWidth} />
        Add section
      </button>
    </article>
  );
}

function SectionIconButton({
  label,
  icon: Icon,
  accent,
}: {
  label: string;
  icon: typeof ChevronUp;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-[26px] items-center justify-center rounded-md border-none bg-transparent",
        accent
          ? "text-[var(--color-deep-teal)] hover:bg-[var(--color-teal-50)]"
          : "text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)]",
      )}
    >
      <Icon size={14} strokeWidth={iconDefaults.strokeWidth} />
    </button>
  );
}
