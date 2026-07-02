import { ChevronRight, Search, Settings } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth";
import { canAccessPath } from "@/routes/paths";
import { iconDefaults } from "@/design/tokens/icons";
import { commandNavItems } from "@/layout/nav-config";

import { useShell } from "./ShellProvider";

/** Command palette / global search — App Shell design */
export function CommandPalette() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { overlay, closeOverlay, openOverlay } = useShell();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const open = overlay === "palette";

  React.useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open || !user) return null;

  const navItems = commandNavItems(user.role).filter((item) => canAccessPath(user.role, item.to));
  const staticItems = [
    { id: "settings", group: "Pages", title: "Settings", meta: "Profile, notifications, appearance", path: "/settings" },
    { id: "notifications", group: "Actions", title: "Open notifications", meta: "Alerts, approvals, tasks", action: "notifications" as const },
    { id: "help", group: "Actions", title: "Help & support", meta: "Guides and support", action: "help" as const },
  ].filter((item) => !item.path || canAccessPath(user.role, item.path));

  const q = query.trim().toLowerCase();
  const filteredNav = navItems.filter(
    (item) => !q || item.label.toLowerCase().includes(q) || item.to.toLowerCase().includes(q),
  );
  const filteredStatic = staticItems.filter(
    (item) => !q || item.title.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q),
  );

  function selectPath(path: string) {
    closeOverlay();
    navigate(path);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(6,54,59,0.40)] pt-[11vh] animate-fv-fade"
      onClick={closeOverlay}
    >
      <div
        role="dialog"
        aria-label="Command palette"
        className="w-[min(620px,94vw)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)] animate-fv-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.75 border-b border-[var(--border-subtle)] px-[18px] py-3.5">
          <Search
            className="text-[var(--color-neutral-500)]"
            size={18}
            strokeWidth={iconDefaults.strokeWidth}
            aria-hidden
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, people, records, or run an AI action"
            className="flex-1 border-none bg-transparent text-[15.5px] text-[var(--text-strong)] outline-none placeholder:text-[var(--color-neutral-400)]"
          />
          <span className="rounded-md border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-neutral-500)]">
            esc
          </span>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {filteredNav.length > 0 && (
            <div>
              <div className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
                Workspace
              </div>
              {filteredNav.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => selectPath(item.to)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border-none bg-transparent px-2.5 py-2.5 text-left transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-neutral-100)]"
                >
                  <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                    <item.icon size={16} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--text-strong)]">{item.label}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{item.to}</span>
                  </span>
                  <ChevronRight
                    className="text-[var(--color-neutral-400)]"
                    size={15}
                    strokeWidth={iconDefaults.strokeWidth}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          )}

          {filteredStatic.length > 0 && (
            <div>
              <div className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase">
                App
              </div>
              {filteredStatic.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    closeOverlay();
                    if (item.path) navigate(item.path);
                    else if (item.action === "notifications") openOverlay("notifications");
                    else if (item.action === "help") openOverlay("help");
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border-none bg-transparent px-2.5 py-2.5 text-left transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-neutral-100)]"
                >
                  <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                    <Settings size={16} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--text-strong)]">{item.title}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{item.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && filteredStatic.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              No matches for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] bg-[var(--surface-page)] px-[18px] py-2.5 text-xs text-[var(--text-muted)]">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">Forevue surfaces — you decide</span>
        </div>
      </div>
    </div>
  );
}
