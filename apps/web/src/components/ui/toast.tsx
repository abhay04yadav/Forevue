import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

import { type ToastItem, type ToastTone, useToastStore } from "./toast-store";

const toastTones: Record<
  ToastTone,
  { bg: string; border: string; title: string; icon?: string }
> = {
  info: {
    bg: "bg-[var(--color-teal-50)]",
    border: "border-[var(--color-teal-100)]",
    title: "text-[var(--color-deep-teal)]",
  },
  success: {
    bg: "bg-[var(--color-risk-low-bg)]",
    border: "border-[var(--color-risk-low)]",
    title: "text-[var(--color-risk-low)]",
  },
  abstain: {
    bg: "bg-[var(--color-neutral-100)]",
    border: "border-[var(--border-subtle)]",
    title: "text-[var(--color-neutral-700)]",
  },
  draft: {
    bg: "bg-[var(--color-amber-50)]",
    border: "border-[var(--color-amber-200)]",
    title: "text-[var(--color-amber-700)]",
  },
  caution: {
    bg: "bg-[var(--color-risk-high-bg)]",
    border: "border-[var(--color-risk-high)]",
    title: "text-[var(--color-risk-high)]",
  },
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const tone = toastTones[item.tone ?? "info"];

  React.useEffect(() => {
    const ms = item.duration ?? 4000;
    const timer = window.setTimeout(onDismiss, ms);
    return () => window.clearTimeout(timer);
  }, [item.duration, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-[min(360px,calc(100vw-2rem))] gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 shadow-[var(--shadow-lg)] animate-fv-rise",
        tone.bg,
        tone.border,
      )}
    >
      <div className="min-w-0 flex-1">
        {item.title && (
          <div className={cn("text-sm font-semibold", tone.title)}>{item.title}</div>
        )}
        <div className="text-[13px] leading-snug text-[var(--text-body)]">{item.message}</div>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent text-[var(--color-neutral-500)] hover:text-[var(--text-strong)]"
      >
        <X size={iconDefaults.size} strokeWidth={iconDefaults.strokeWidth} />
      </button>
    </div>
  );
}

function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col gap-2"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
      ))}
    </div>
  );
}

export { Toaster, toastTones };
export { toast } from "./toast-store";
