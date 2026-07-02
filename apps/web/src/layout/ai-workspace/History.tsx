import { MessageSquare, MoreHorizontal, Pin, Plus, Search } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { ConversationItem } from "./types";

export interface ConversationHistoryProps {
  conversations: ConversationItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  className?: string;
}

/** Conversation rail — AI Workspace history sidebar */
export function ConversationHistory({
  conversations,
  activeId,
  onSelect,
  onNew,
  className,
}: ConversationHistoryProps) {
  const [query, setQuery] = React.useState("");

  const q = query.trim().toLowerCase();
  const filtered = conversations.filter((c) => !q || c.title.toLowerCase().includes(q));
  const pinned = filtered.filter((c) => c.pinned);
  const recent = filtered.filter((c) => !c.pinned);

  return (
    <aside
      aria-label="Conversations"
      className={cn(
        "flex w-[250px] shrink-0 flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--surface-card)]",
        className,
      )}
    >
      <div className="px-3.5 pt-3.5 pb-2.5">
        <Button type="button" variant="primary" size="md" fullWidth onClick={onNew}>
          <Plus size={16} strokeWidth={iconDefaults.strokeWidth} />
          New conversation
        </Button>
        <label className="mt-2.5 flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-page)] px-2.5">
          <Search size={15} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-neutral-500)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[var(--text-strong)] outline-none"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {pinned.length > 0 && (
          <ConversationGroup label="Pinned" pinned items={pinned} activeId={activeId} onSelect={onSelect} />
        )}
        {recent.length > 0 && (
          <ConversationGroup label="Recent" items={recent} activeId={activeId} onSelect={onSelect} />
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-[var(--border-subtle)] px-3 py-2.5 text-[11px] text-[var(--text-muted)]">
        Multi-agent · coming soon
      </div>
    </aside>
  );
}

function ConversationGroup({
  label,
  pinned,
  items,
  activeId,
  onSelect,
}: {
  label: string;
  pinned?: boolean;
  items: ConversationItem[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-2 pt-2.5 pb-1 text-[10.5px] font-bold tracking-wide text-[var(--text-muted)] uppercase">
        {pinned && <Pin size={12} strokeWidth={iconDefaults.strokeWidth} />}
        {label}
      </div>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none px-2.5 py-2.25 text-left",
              active ? "bg-[var(--color-teal-50)]" : "bg-transparent hover:bg-[var(--color-neutral-100)]",
            )}
          >
            <MessageSquare
              size={15}
              strokeWidth={iconDefaults.strokeWidth}
              className={active ? "text-[var(--color-deep-teal)]" : "text-[var(--color-neutral-500)]"}
            />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate text-[13px] text-[var(--text-strong)]",
                  active && "font-semibold",
                )}
              >
                {item.title}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)]">{item.time}</span>
            </span>
            <MoreHorizontal
              size={15}
              strokeWidth={iconDefaults.strokeWidth}
              className="shrink-0 text-[var(--color-neutral-500)]"
            />
          </button>
        );
      })}
    </div>
  );
}
