import { Check, Circle, Loader2 } from "lucide-react";
import * as React from "react";

import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

import { buildMockAnswerTurn } from "./mock-data";
import type { ConversationTurn, ToolStep, ToolStepStatus } from "./types";

/** Thinking shimmer — AI Workspace streaming phase */
export function ThinkingShimmer() {
  return (
    <div className="flex flex-col gap-2">
      <div className="fv-shimmer h-3 w-[92%] rounded-md" />
      <div className="fv-shimmer h-3 w-[78%] rounded-md" />
      <div className="fv-shimmer h-3 w-[85%] rounded-md" />
    </div>
  );
}

function nextStepStatus(idx: number, activeIndex: number): ToolStepStatus {
  if (idx < activeIndex) return "done";
  if (idx === activeIndex) return "active";
  return "pending";
}

/** Mock streaming simulation — design AI Workspace send() */
export function useMockStreaming(
  setTurns: React.Dispatch<React.SetStateAction<ConversationTurn[]>>,
) {
  const [isStreaming, setIsStreaming] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  React.useEffect(() => clear, [clear]);

  const stop = React.useCallback(() => {
    clear();
    setIsStreaming(false);
    setTurns((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last.streaming) return prev.slice(0, -1);
      return prev;
    });
  }, [clear, setTurns]);

  const stream = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      clear();
      setIsStreaming(true);

      const isDraft = /draft|note|write|create/i.test(trimmed);
      const stepDefs = isDraft
        ? [
            { id: "ls1", label: "Reading ERP — mentor + student", meta: "CSE-3" },
            { id: "ls2", label: "Fetching attendance context", meta: "wk 6–9" },
            { id: "ls3", label: "Composing draft" },
          ]
        : [
            { id: "ls1", label: "Reading ERP" },
            { id: "ls2", label: "Fetching data in scope" },
            { id: "ls3", label: "Running analysis" },
            { id: "ls4", label: "Composing answer" },
          ];

      const userTurn: ConversationTurn = {
        role: "user",
        id: `u-${Date.now()}`,
        text: trimmed,
      };

      setTurns((prev) => [
        ...prev,
        userTurn,
        {
          role: "assistant",
          id: `live-${Date.now()}`,
          streaming: true,
          blocks: [
            {
              type: "tool",
              title: isDraft ? "Preparing a draft" : "Resolved across the systems you run",
              state: "running",
              steps: stepDefs.map((s, i) => ({
                ...s,
                status: i === 0 ? "active" : "pending",
              })),
            },
          ],
        },
      ]);

      let delay = 0;
      stepDefs.forEach((_, i) => {
        delay += 720;
        timers.current.push(
          setTimeout(() => {
            setTurns((prev) =>
              prev.map((t, ti) =>
                ti === prev.length - 1 && t.role === "assistant"
                  ? {
                      ...t,
                      blocks: [
                        {
                          type: "tool" as const,
                          title: isDraft
                            ? "Preparing a draft"
                            : "Resolved across the systems you run",
                          state: "running" as const,
                          steps: stepDefs.map((s, idx) => ({
                            ...s,
                            status: nextStepStatus(idx, i + 1),
                          })),
                        },
                      ],
                    }
                  : t,
              ),
            );
          }, delay),
        );
      });

      delay += 700;
      timers.current.push(
        setTimeout(() => {
          setTurns((prev) =>
            prev.map((t, ti) =>
              ti === prev.length - 1 && t.role === "assistant"
                ? { ...t, blocks: [{ type: "thinking" as const }] }
                : t,
            ),
          );
        }, delay),
      );

      delay += 900;
      timers.current.push(
        setTimeout(() => {
          setTurns((prev) => [...prev.slice(0, -1), buildMockAnswerTurn(isDraft)]);
          setIsStreaming(false);
        }, delay),
      );
    },
    [clear, setTurns],
  );

  return { stream, stop, isStreaming };
}

export function StreamingStepIcon({ status }: { status: ToolStepStatus }) {
  const className = cn(
    "inline-flex size-[18px] items-center justify-center",
    status === "done"
      ? "text-[var(--color-risk-low)]"
      : status === "active"
        ? "text-[var(--color-deep-teal)]"
        : "text-[var(--color-neutral-400)]",
  );

  if (status === "done") {
    return (
      <span className={className}>
        <Check size={14} strokeWidth={iconDefaults.strokeWidth} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className={className}>
        <Loader2 size={14} strokeWidth={iconDefaults.strokeWidth} className="animate-spin" />
      </span>
    );
  }
  return (
    <span className={className}>
      <Circle size={14} strokeWidth={iconDefaults.strokeWidth} />
    </span>
  );
}
