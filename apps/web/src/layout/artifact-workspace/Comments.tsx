import { CheckCheck, Send } from "lucide-react";
import * as React from "react";

import { iconDefaults } from "@/design/tokens/icons";
import { Markdown } from "@/layout/ai-workspace/Markdown";
import { cn } from "@/lib/utils";

import type { CommentEntry } from "./types";

const avatarBg: Record<NonNullable<CommentEntry["avatarTone"]>, string> = {
  teal: "var(--color-teal-600)",
  deep: "var(--color-deep-teal)",
  neutral: "var(--color-neutral-500)",
};

export interface CommentsPanelProps {
  comments: CommentEntry[];
  showResolved?: boolean;
  onToggleResolved?: () => void;
  onResolve?: (id: string) => void;
  onAddComment?: (text: string) => void;
  className?: string;
}

/** Comments panel — Artifact Workspace dock */
export function CommentsPanel({
  comments,
  showResolved = false,
  onToggleResolved,
  onResolve,
  onAddComment,
  className,
}: CommentsPanelProps) {
  const [draft, setDraft] = React.useState("");

  const visible = comments.filter((c) => showResolved || !c.resolved);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddComment?.(text);
    setDraft("");
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <span className="fv-eyebrow flex-1">Comments</span>
        {onToggleResolved && (
          <button
            type="button"
            onClick={onToggleResolved}
            className="border-none bg-transparent text-[12px] font-semibold text-[var(--text-link)]"
          >
            {showResolved ? "Hide resolved" : "Show resolved"}
          </button>
        )}
      </div>

      {visible.map((comment) => (
        <div
          key={comment.id}
          className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2.5"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: avatarBg[comment.avatarTone ?? "teal"] }}
            >
              {comment.initials}
            </span>
            <span className="flex-1 text-[12.5px] font-semibold text-[var(--text-strong)]">
              {comment.name}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">{comment.time}</span>
          </div>
          <div className="text-[12.5px] leading-normal text-[var(--text-body)]">
            <Markdown content={comment.body} />
          </div>
          {comment.resolved ? (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-risk-low)]">
              <CheckCheck size={13} strokeWidth={iconDefaults.strokeWidth} />
              Resolved
            </div>
          ) : (
            <div className="mt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => onResolve?.(comment.id)}
                className="border-none bg-transparent p-0 text-[11.5px] font-semibold text-[var(--text-link)]"
              >
                Resolve
              </button>
              <button
                type="button"
                className="border-none bg-transparent p-0 text-[11.5px] font-semibold text-[var(--text-muted)]"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Comment or @mention…"
          className="h-9 min-w-0 flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-[11px] text-[12.5px] text-[var(--text-strong)] outline-none"
        />
        <button
          type="button"
          aria-label="Send comment"
          onClick={submit}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border-none bg-[var(--action-primary)] text-white"
        >
          <Send size={15} strokeWidth={iconDefaults.strokeWidth} />
        </button>
      </div>
    </div>
  );
}
