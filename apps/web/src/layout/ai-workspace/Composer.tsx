import { Clock, Mic, Paperclip, Send, Shield, Slash, Square } from "lucide-react";
import * as React from "react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import type { PromptHistoryItem, SlashCommand } from "./types";

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isStreaming?: boolean;
  slashCommands?: SlashCommand[];
  promptHistory?: PromptHistoryItem[];
  placeholder?: string;
  className?: string;
}

/** AI Workspace composer — textarea, slash menu, prompt history, send/stop */
export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming = false,
  slashCommands = [],
  promptHistory = [],
  placeholder = "Ask Forevue…",
  className,
}: ComposerProps) {
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !isStreaming;

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  React.useEffect(resize, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        setSlashOpen(false);
        setHistoryOpen(false);
        onSend();
      }
    }
    if (e.key === "Escape") {
      setSlashOpen(false);
      setHistoryOpen(false);
    }
  };

  const pickHistory = (text: string) => {
    onChange(text);
    setHistoryOpen(false);
    textareaRef.current?.focus();
  };

  const runSlash = (cmd: SlashCommand) => {
    onChange(`${cmd.cmd} `);
    setSlashOpen(false);
    textareaRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      {slashOpen && slashCommands.length > 0 && (
        <ComposerMenu title="Slash commands" className="left-0 w-[300px]">
          {slashCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                type="button"
                onClick={() => runSlash(cmd)}
                className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2.5 text-left hover:bg-[var(--color-neutral-100)]"
              >
                <span className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                  <Icon size={14} strokeWidth={iconDefaults.strokeWidth} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[var(--text-strong)]">
                    {cmd.cmd}
                  </span>
                  <span className="block text-[11.5px] text-[var(--text-muted)]">{cmd.desc}</span>
                </span>
              </button>
            );
          })}
        </ComposerMenu>
      )}

      {historyOpen && promptHistory.length > 0 && (
        <ComposerMenu title="Prompt history" className="right-0 w-[320px]">
          {promptHistory.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pickHistory(item.text)}
              className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2.5 text-left hover:bg-[var(--color-neutral-100)]"
            >
              <Clock size={14} strokeWidth={iconDefaults.strokeWidth} className="shrink-0 text-[var(--color-neutral-500)]" />
              <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--text-body)]">
                {item.text}
              </span>
            </button>
          ))}
        </ComposerMenu>
      )}

      <div
        className={cn(
          "overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-card)] shadow-[var(--shadow-xs)] transition-colors",
          value.trim() ? "border-[var(--color-teal-300)]" : "border-[var(--border-default)]",
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="block max-h-40 w-full resize-none border-none bg-transparent px-[15px] pt-3.5 pb-1 text-[14.5px] leading-normal text-[var(--text-strong)] outline-none"
        />
        <div className="flex items-center gap-1 px-2.5 pt-1.5 pb-2.5">
          <ComposerIconButton
            label="Slash commands"
            onClick={() => {
              setSlashOpen((v) => !v);
              setHistoryOpen(false);
            }}
          >
            <Slash size={17} strokeWidth={iconDefaults.strokeWidth} />
          </ComposerIconButton>
          <ComposerIconButton label="Attach file (coming soon)" disabled>
            <Paperclip size={17} strokeWidth={iconDefaults.strokeWidth} />
          </ComposerIconButton>
          <ComposerIconButton label="Voice (coming soon)" disabled>
            <Mic size={17} strokeWidth={iconDefaults.strokeWidth} />
          </ComposerIconButton>
          <ComposerIconButton
            label="Prompt history"
            onClick={() => {
              setHistoryOpen((v) => !v);
              setSlashOpen(false);
            }}
          >
            <Clock size={17} strokeWidth={iconDefaults.strokeWidth} />
          </ComposerIconButton>
          <span className="ml-auto text-[11px] whitespace-nowrap text-[var(--text-muted)]">
            {isStreaming ? "Generating…" : "Enter to send · Shift+Enter for newline"}
          </span>
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="ml-2 inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3.5 text-[13px] font-semibold text-[var(--text-strong)]"
            >
              <Square size={14} strokeWidth={iconDefaults.strokeWidth} />
              Stop
            </button>
          ) : (
            <button
              type="button"
              aria-label="Send"
              disabled={!canSend}
              onClick={onSend}
              className={cn(
                "ml-2 inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] border-none text-white",
                canSend
                  ? "cursor-pointer bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)]"
                  : "cursor-not-allowed bg-[var(--color-neutral-300)]",
              )}
            >
              <Send size={17} strokeWidth={iconDefaults.strokeWidth} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
        <Shield size={12} strokeWidth={iconDefaults.strokeWidth} />
        Advisory &amp; grounded · least-privilege · nothing is written back until you approve.
      </p>
    </div>
  );
}

function ComposerMenu({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute bottom-[calc(100%+8px)] z-[6] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)] animate-fv-rise",
        className,
      )}
    >
      <div className="px-3 pt-2 pb-1 text-[10.5px] font-bold tracking-wide text-[var(--text-muted)] uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}

function ComposerIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-[34px] items-center justify-center rounded-lg border-none bg-transparent",
        disabled
          ? "cursor-not-allowed text-[var(--color-neutral-500)]"
          : "cursor-pointer text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]",
      )}
    >
      {children}
    </button>
  );
}
