import { Brain, Layers, Lock, Wrench, X } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import { ContextPanel } from "./ContextPanel";
import { MemoryPanel } from "./MemoryPanel";
import type {
  CapabilityItem,
  ConnectedTool,
  ContextItem,
  DockTab,
  MemoryItem,
  SkillItem,
} from "./types";

export interface ContextDockProps {
  tab: DockTab;
  onTabChange: (tab: DockTab) => void;
  onClose?: () => void;
  contextItems: ContextItem[];
  capabilities: CapabilityItem[];
  connectedTools: ConnectedTool[];
  skills: SkillItem[];
  memoryItems: MemoryItem[];
  roleLabel?: string;
  onClearMemory?: () => void;
  onForgetMemory?: (id: string) => void;
  className?: string;
}

const tabs: { id: DockTab; label: string; icon: typeof Brain }[] = [
  { id: "context", label: "Context", icon: Brain },
  { id: "capabilities", label: "Capabilities", icon: Layers },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "memory", label: "Memory", icon: Brain },
];

/** Right context dock — context, capabilities, tools, memory tabs */
export function ContextDock({
  tab,
  onTabChange,
  onClose,
  contextItems,
  capabilities,
  connectedTools,
  skills,
  memoryItems,
  roleLabel,
  onClearMemory,
  onForgetMemory,
  className,
}: ContextDockProps) {
  return (
    <aside
      aria-label="Context and tools"
      className={cn(
        "flex w-[min(340px,100%)] shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--surface-card)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-[var(--border-subtle)] px-2 pt-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-[12.5px] whitespace-nowrap",
                active
                  ? "border-[var(--action-primary)] font-semibold text-[var(--color-deep-teal)]"
                  : "border-transparent font-medium text-[var(--color-neutral-600)]",
              )}
            >
              <Icon size={14} strokeWidth={iconDefaults.strokeWidth} />
              {t.label}
            </button>
          );
        })}
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto inline-flex size-8 items-center justify-center border-none bg-transparent text-[var(--color-neutral-500)]"
          >
            <X size={17} strokeWidth={iconDefaults.strokeWidth} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5">
        {tab === "context" && <ContextPanel items={contextItems} roleLabel={roleLabel} />}
        {tab === "capabilities" && (
          <CapabilitiesPanel items={capabilities} />
        )}
        {tab === "tools" && (
          <ToolsPanel connectedTools={connectedTools} skills={skills} />
        )}
        {tab === "memory" && (
          <MemoryPanel
            items={memoryItems}
            onClearAll={onClearMemory}
            onForget={onForgetMemory}
          />
        )}
      </div>
    </aside>
  );
}

function CapabilitiesPanel({ items }: { items: CapabilityItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="fv-eyebrow mb-0.5">Capabilities</div>
      {items.map((cap) => {
        const Icon = cap.icon;
        return (
          <button
            key={cap.id}
            type="button"
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2.5 text-left hover:border-[var(--color-teal-300)]"
          >
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
              <Icon size={16} strokeWidth={iconDefaults.strokeWidth} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-[var(--text-strong)]">
                {cap.label}
              </span>
              <span className="block text-[11.5px] text-[var(--text-muted)]">{cap.desc}</span>
            </span>
            {cap.gated && (
              <Lock size={14} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-amber-700)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ToolsPanel({
  connectedTools,
  skills,
}: {
  connectedTools: ConnectedTool[];
  skills: SkillItem[];
}) {
  const statusColor = {
    connected: "var(--color-risk-low)",
    degraded: "var(--color-risk-watch)",
    offline: "var(--color-neutral-400)",
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <div className="fv-eyebrow mb-2">Connected tools</div>
        <div className="flex flex-col gap-2">
          {connectedTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-[11px] py-2.5"
              >
                <span className="inline-flex size-[30px] items-center justify-center rounded-lg bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]">
                  <Icon size={15} strokeWidth={iconDefaults.strokeWidth} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[var(--text-strong)]">{tool.label}</div>
                  <div className="text-[11.5px] text-[var(--text-muted)]">{tool.meta}</div>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold capitalize"
                  style={{ color: statusColor[tool.status] }}
                >
                  <span
                    className="size-[7px] rounded-full"
                    style={{ background: statusColor[tool.status] }}
                  />
                  {tool.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="fv-eyebrow mb-2">Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => {
            const Icon = skill.icon;
            return (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-2.5 py-1.5 text-[12px] text-[var(--text-body)]"
              >
                <Icon size={13} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-deep-teal)]" />
                {skill.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
