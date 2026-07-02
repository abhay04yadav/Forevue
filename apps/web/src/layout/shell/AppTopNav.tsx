import { Bell, HelpCircle, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

import { useShell } from "./ShellProvider";
import { ShellIconButton } from "./ShellIconButton";

function cmdKeyLabel() {
  if (typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)) {
    return "⌘K";
  }
  return "Ctrl+K";
}

/** Forevue top navigation bar — App Shell design */
export function AppTopNav({ className }: { className?: string }) {
  const { resolved, setMode } = useTheme();
  const {
    openOverlay,
    closeOverlay,
    overlay,
    setMobileDrawerOpen,
    shellUser,
    hasUnreadNotifications,
  } = useShell();

  function toggleTheme() {
    setMode(resolved === "dark" ? "light" : "dark");
  }

  return (
    <header
      className={cn(
        "fv-shell-card sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b px-4 py-3 md:px-5",
        className,
      )}
    >
      <ShellIconButton
        className="border border-[var(--border-default)] bg-[var(--surface-card)] md:hidden"
        aria-label="Open menu"
        onClick={() => {
          closeOverlay();
          setMobileDrawerOpen(true);
        }}
      >
        <Menu size={19} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
      </ShellIconButton>

      <button
        type="button"
        onClick={() => openOverlay("palette")}
        className="flex h-[38px] max-w-[520px] flex-1 cursor-text items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-page)] px-3 text-sm text-[var(--text-muted)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--border-strong)]"
      >
        <Search size={16} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
        <span className="flex-1 text-left">Search or run a command</span>
        <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-neutral-500)]">
          {cmdKeyLabel()}
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <ShellIconButton aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme}>
          {resolved === "dark" ? (
            <Moon size={18} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
          ) : (
            <Sun size={18} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
          )}
        </ShellIconButton>
        <ShellIconButton
          aria-label="Help"
          title="Help"
          active={overlay === "help"}
          onClick={() => openOverlay("help")}
        >
          <HelpCircle size={18} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
        </ShellIconButton>
        <ShellIconButton
          aria-label="Notifications"
          title="Notifications"
          active={overlay === "notifications"}
          badge={hasUnreadNotifications}
          onClick={() => openOverlay("notifications")}
        >
          <Bell size={18} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
        </ShellIconButton>
        <button
          type="button"
          aria-label="Profile"
          onClick={() => openOverlay("profile")}
          className="ml-1 inline-flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-teal-600)] p-0 text-xs font-bold text-white"
        >
          {shellUser.initials}
        </button>
      </div>
    </header>
  );
}
