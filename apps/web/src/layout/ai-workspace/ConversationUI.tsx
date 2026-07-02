import { ArrowRight, Copy, RefreshCw, Share2, Sparkles } from "lucide-react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import { ApprovalCard } from "./ApprovalCard";
import { EvidencePanel } from "./EvidencePanel";
import { Markdown } from "./Markdown";
import { ThinkingShimmer } from "./Streaming";
import { ToolCard } from "./ToolCard";
import type { AiBlock, AiTurn, ApprovalBlock, ConversationTurn, UserTurn } from "./types";

export interface ConversationUIProps {
  turns: ConversationTurn[];
  onFollowup?: (text: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  emptyBrief?: string;
  suggestedPrompts?: string[];
  className?: string;
}

/** Conversation transcript — AI Workspace canvas log */
export function ConversationUI({
  turns,
  onFollowup,
  onApprove,
  onReject,
  emptyBrief,
  suggestedPrompts,
  className,
}: ConversationUIProps) {
  if (turns.length === 0) {
    return (
      <div className={cn("py-6", className)}>
        {emptyBrief && (
          <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-left text-sm text-[var(--text-body)]">
            <p className="mb-1 font-semibold text-[var(--text-strong)]">Daily brief</p>
            <p>{emptyBrief}</p>
          </div>
        )}
        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {suggestedPrompts.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => onFollowup?.(text)}
                className="rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-1.5 text-[12.5px] hover:border-[var(--color-teal-300)]"
              >
                {text}
              </button>
            ))}
          </div>
        )}
        <p className="text-center text-sm text-[var(--text-muted)]">
          Ask a question to start. Forevue surfaces what it finds with evidence — nothing is written
          back until you approve it.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-[22px] pb-2", className)}>
      {turns.map((turn) =>
        turn.role === "user" ? (
          <UserBubble key={turn.id} turn={turn} />
        ) : (
          <AiBubble
            key={turn.id}
            turn={turn}
            onFollowup={onFollowup}
            onApprove={onApprove}
            onReject={onReject}
          />
        ),
      )}
    </div>
  );
}

function UserBubble({ turn }: { turn: UserTurn }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-[16px_16px_4px_16px] bg-[var(--color-teal-600)] px-[15px] py-[11px] text-[14.5px] leading-normal text-white">
        {turn.text}
      </div>
    </div>
  );
}

function AiBubble({
  turn,
  onFollowup,
  onApprove,
  onReject,
}: {
  turn: AiTurn;
  onFollowup?: (text: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  return (
    <div className="flex gap-[11px]">
      <span className="mt-0.5 inline-flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
        <Sparkles size={16} strokeWidth={iconDefaults.strokeWidth} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {turn.blocks.map((block, i) => (
          <BlockRenderer
            key={`${turn.id}-${i}`}
            block={block}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}

        {turn.followups && turn.followups.length > 0 && !turn.streaming && (
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            {turn.followups.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => onFollowup?.(text)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-card)] px-3 py-1.5 text-[12.5px] text-[var(--text-body)] hover:border-[var(--color-teal-300)]"
              >
                <ArrowRight size={13} strokeWidth={iconDefaults.strokeWidth} />
                {text}
              </button>
            ))}
          </div>
        )}

        {!turn.streaming && (
          <div className="mt-0.5 flex items-center gap-0.5">
            <TurnAction icon={Copy} label="Copy" />
            <TurnAction icon={RefreshCw} label="Regenerate" />
            <TurnAction icon={Share2} label="Share" />
          </div>
        )}
      </div>
    </div>
  );
}

function TurnAction({ icon: Icon, label }: { icon: typeof Copy; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-[7px] border-none bg-transparent px-2.5 py-1.5 text-[12px] text-[var(--text-muted)] hover:bg-[var(--color-neutral-100)]"
    >
      <Icon size={14} strokeWidth={iconDefaults.strokeWidth} />
      {label}
    </button>
  );
}

function BlockRenderer({
  block,
  onApprove,
  onReject,
}: {
  block: AiBlock;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  switch (block.type) {
    case "tool":
      return <ToolCard {...block} />;
    case "text":
      return <Markdown content={block.markdown} streaming={block.streaming} />;
    case "thinking":
      return <ThinkingShimmer />;
    case "evidence":
      return <EvidencePanel {...block} />;
    case "approval":
      return (
        <ApprovalCard
          {...(block as ApprovalBlock)}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
    default:
      return null;
  }
}
