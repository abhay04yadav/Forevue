import { History, Info, MessageSquare, X } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import { CommentsPanel } from "./Comments";
import { MetadataPanel } from "./Metadata";
import { VersionHistory } from "./VersionHistory";
import type { ArtifactDockTab, CommentEntry, MetadataRow, VersionEntry } from "./types";

export interface ArtifactDockProps {
  tab: ArtifactDockTab;
  onTabChange: (tab: ArtifactDockTab) => void;
  onClose?: () => void;
  comments: CommentEntry[];
  versions: VersionEntry[];
  metadata: MetadataRow[];
  showResolved?: boolean;
  onToggleResolved?: () => void;
  onResolveComment?: (id: string) => void;
  onRestoreVersion?: (id: string) => void;
  className?: string;
}

const tabs: { id: ArtifactDockTab; label: string; icon: typeof Info }[] = [
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "versions", label: "Versions", icon: History },
  { id: "metadata", label: "Details", icon: Info },
];

/** Right dock — comments, version history, metadata */
export function ArtifactDock({
  tab,
  onTabChange,
  onClose,
  comments,
  versions,
  metadata,
  showResolved,
  onToggleResolved,
  onResolveComment,
  onRestoreVersion,
  className,
}: ArtifactDockProps) {
  return (
    <aside
      aria-label="Artifact details"
      className={cn(
        "flex w-[min(340px,100%)] shrink-0 flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--surface-card)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-px overflow-x-auto border-b border-[var(--border-subtle)] px-1.5 pt-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-xs whitespace-nowrap",
                active
                  ? "border-[var(--color-deep-teal)] font-semibold text-[var(--text-strong)]"
                  : "border-transparent font-medium text-[var(--text-muted)]",
              )}
            >
              <Icon size={15} strokeWidth={iconDefaults.strokeWidth} />
              {t.label}
            </button>
          );
        })}
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto inline-flex size-[30px] items-center justify-center border-none bg-transparent text-[var(--color-neutral-500)]"
          >
            <X size={16} strokeWidth={iconDefaults.strokeWidth} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5">
        {tab === "comments" && (
          <CommentsPanel
            comments={comments}
            showResolved={showResolved}
            onToggleResolved={onToggleResolved}
            onResolve={onResolveComment}
          />
        )}
        {tab === "versions" && (
          <VersionHistory versions={versions} onRestore={onRestoreVersion} />
        )}
        {tab === "metadata" && <MetadataPanel rows={metadata} />}
      </div>
    </aside>
  );
}
