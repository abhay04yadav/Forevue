import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  width?: number | string;
  children: React.ReactNode;
  className?: string;
}

/** Forevue Drawer — App Shell mobile nav / Dashboard right panel */
function Drawer({
  open,
  onOpenChange,
  side = "left",
  width,
  children,
  className,
}: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const resolvedWidth =
    width ?? (side === "left" ? 264 : "min(440px, 100vw)");

  return createPortal(
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-[rgba(6,54,59,0.45)] animate-fv-fade"
        onClick={() => onOpenChange(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed top-0 bottom-0 z-[41] flex flex-col border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 px-3",
          side === "left"
            ? "left-0 border-r animate-fv-slide-in-left"
            : "right-0 border-l shadow-[var(--shadow-lg)] animate-fv-slide-in-right",
          className,
        )}
        style={{ width: resolvedWidth }}
      >
        {children}
      </aside>
    </>,
    document.body,
  );
}

function DrawerHeader({
  className,
  title,
  onClose,
  children,
}: {
  className?: string;
  title?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between px-1.5 pt-1 pb-2.5", className)}>
      {title ? (
        <div className="text-[17px] font-bold text-[var(--text-strong)]">{title}</div>
      ) : (
        children
      )}
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent text-[var(--color-neutral-500)] hover:text-[var(--text-strong)]"
        >
          <X size={18} strokeWidth={iconDefaults.strokeWidth} />
        </button>
      )}
    </div>
  );
}

function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto", className)} {...props} />;
}

export { Drawer, DrawerBody, DrawerHeader };
