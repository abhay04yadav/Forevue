import { Plus, Settings, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";
import { ResponsiveGrid } from "@/layout/ResponsiveGrid";
import { Section } from "@/layout/Section";
import { WidgetCard } from "@/layout/WidgetCard";

import { ChartLayout } from "./ChartLayout";
import { useDashboardLayout } from "./useDashboardLayout";
import type { WidgetDefinition } from "./types";

export interface DashboardWidgetContextValue {
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  toggleEditMode: () => void;
  removedIds: string[];
  removeWidget: (id: string) => void;
  addWidget: (widget?: Partial<WidgetDefinition>) => void;
  filter: string;
  setFilter: (value: string) => void;
  visibleWidgets: WidgetDefinition[];
}

const DashboardWidgetContext = React.createContext<DashboardWidgetContextValue | null>(null);

export function useDashboardWidgets() {
  const ctx = React.useContext(DashboardWidgetContext);
  if (!ctx) {
    throw new Error("useDashboardWidgets must be used within DashboardWidgetProvider");
  }
  return ctx;
}

export interface DashboardWidgetProviderProps {
  widgets: WidgetDefinition[];
  children: React.ReactNode;
}

/** Widget state — edit mode, add/remove, and title filter */
export function DashboardWidgetProvider({ widgets, children }: DashboardWidgetProviderProps) {
  const [editMode, setEditMode] = React.useState(false);
  const [removedIds, setRemovedIds] = React.useState<string[]>([]);
  const [added, setAdded] = React.useState<WidgetDefinition[]>([]);
  const [filter, setFilter] = React.useState("");

  const allWidgets = React.useMemo(
    () => [...widgets, ...added].filter((w) => !removedIds.includes(w.id)),
    [widgets, added, removedIds],
  );

  const visibleWidgets = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return allWidgets;
    return allWidgets.filter((w) => w.title.toLowerCase().includes(q));
  }, [allWidgets, filter]);

  const value = React.useMemo<DashboardWidgetContextValue>(
    () => ({
      editMode,
      setEditMode,
      toggleEditMode: () => setEditMode((v) => !v),
      removedIds,
      removeWidget: (id) => setRemovedIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      addWidget: (partial) => {
        const index = added.length + 1;
        setAdded((prev) => [
          ...prev,
          {
            id: partial?.id ?? `added-${Date.now()}`,
            title: partial?.title ?? `New widget ${index}`,
            kind: partial?.kind ?? "chart",
            footer: partial?.footer ?? "Placeholder widget",
            ...partial,
          },
        ]);
      },
      filter,
      setFilter,
      visibleWidgets,
    }),
    [editMode, removedIds, added.length, filter, visibleWidgets],
  );

  return (
    <DashboardWidgetContext.Provider value={value}>{children}</DashboardWidgetContext.Provider>
  );
}

export interface WidgetGridProps extends React.HTMLAttributes<HTMLElement> {
  emptyAction?: React.ReactNode;
}

/** Responsive widget grid with edit chrome — Dashboard Framework */
export function WidgetGrid({ className, emptyAction, ...props }: WidgetGridProps) {
  const { editMode, visibleWidgets, removeWidget } = useDashboardWidgets();
  const { mode } = useDashboardLayout();

  return (
    <Section aria-label="Widgets" title="Widgets" eyebrow className={className} {...props}>
      {visibleWidgets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] px-11 py-11 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No widgets match. Try clearing the filter or add a widget.
          </p>
          {emptyAction}
        </div>
      ) : (
        <ResponsiveGrid
          variant="widget"
          className={cn(mode === "mobile" && "grid-cols-1")}
        >
          {visibleWidgets.map((widget) => (
            <WidgetCell
              key={widget.id}
              widget={widget}
              editMode={editMode}
              span={mode === "wide" ? widget.span : 1}
              onRemove={() => removeWidget(widget.id)}
            />
          ))}
        </ResponsiveGrid>
      )}
    </Section>
  );
}

interface WidgetCellProps {
  widget: WidgetDefinition;
  editMode: boolean;
  span?: 1 | 2;
  onRemove: () => void;
}

function WidgetCell({ widget, editMode, span = 1, onRemove }: WidgetCellProps) {
  return (
    <WidgetCard
      className={cn(span === 2 && "lg:col-span-2")}
      title={widget.title}
      dashed={editMode}
      footer={widget.footer}
      actions={
        editMode ? (
          <button
            type="button"
            aria-label={`Remove ${widget.title}`}
            onClick={onRemove}
            className="flex size-[26px] items-center justify-center rounded-[7px] border-none bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high)]"
          >
            <X size={15} strokeWidth={iconDefaults.strokeWidth} />
          </button>
        ) : (
          <button
            type="button"
            aria-label={`${widget.title} options`}
            className="flex size-[26px] items-center justify-center rounded-[7px] border-none bg-transparent text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)]"
          >
            <Settings size={15} strokeWidth={iconDefaults.strokeWidth} />
          </button>
        )
      }
    >
      {widget.render ? (
        widget.render()
      ) : widget.kind === "custom" ? null : (
        <ChartLayout kind={widget.kind} />
      )}
    </WidgetCard>
  );
}

export interface WidgetToolbarProps {
  onExport?: () => void;
  className?: string;
}

/** Page actions for customize / export / add widget */
export function WidgetToolbar({ onExport, className }: WidgetToolbarProps) {
  const { editMode, toggleEditMode, addWidget } = useDashboardWidgets();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button variant={editMode ? "primary" : "ghost"} size="md" onClick={toggleEditMode}>
        {editMode ? "Done" : "Customize"}
      </Button>
      <Button variant="secondary" size="md" onClick={onExport}>
        Export
      </Button>
      <Button variant="primary" size="md" onClick={() => addWidget()}>
        <Plus size={16} strokeWidth={iconDefaults.strokeWidth} />
        Add widget
      </Button>
    </div>
  );
}

export interface WidgetFilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  timeRange: string;
  scope: string;
  timeOptions?: string[];
  scopeOptions?: string[];
  onTimeRangeChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onReset: () => void;
}

/** Filter bar above the widget grid */
export function WidgetFilterBar({
  timeRange,
  scope,
  timeOptions = ["Last 7 days", "Last 30 days", "This term", "This year"],
  scopeOptions = ["All", "My items", "Shared with me"],
  onTimeRangeChange,
  onScopeChange,
  onReset,
  className,
  ...props
}: WidgetFilterBarProps) {
  const { filter, setFilter, visibleWidgets } = useDashboardWidgets();

  return (
    <div
      className={cn(
        "mb-[18px] flex flex-wrap items-center gap-2.5",
        className,
      )}
      {...props}
    >
      <FilterSelect value={timeRange} onChange={onTimeRangeChange} options={timeOptions} />
      <FilterSelect value={scope} onChange={onScopeChange} options={scopeOptions} />
      <label className="flex h-[38px] min-w-40 max-w-[280px] flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter widgets"
          className="flex-1 border-none bg-transparent text-[13.5px] text-[var(--text-strong)] outline-none"
        />
      </label>
      <button
        type="button"
        onClick={onReset}
        className="h-[38px] border-none bg-transparent px-3 text-[13px] font-semibold text-[var(--text-link)]"
      >
        Reset
      </button>
      <span className="ml-auto text-[12.5px] font-medium text-[var(--text-muted)] tabular-nums">
        {visibleWidgets.length} widget{visibleWidgets.length === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options = ["Last 7 days", "Last 30 days", "This term", "This year"],
}: {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}) {
  return (
    <div className="flex h-[38px] items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer border-none bg-transparent text-[13.5px] font-medium text-[var(--text-strong)] outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
