import { PanelLeft, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth";
import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

import { AppNav } from "../AppNav";
import { navSectionLabel } from "../nav-config";
import { useShell } from "./ShellProvider";
import { ShellIconButton } from "./ShellIconButton";

export interface AppSidebarProps {
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
  className?: string;
}

/** Forevue app sidebar — App Shell design */
export function AppSidebar({
  onNavigate,
  showCollapseToggle = true,
  className,
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shellUser, sidebarCollapsed, toggleSidebarCollapsed, openOverlay } = useShell();
  const collapsed = sidebarCollapsed && showCollapseToggle;
  const isSettings = location.pathname.startsWith("/settings");
  const sectionLabel = navSectionLabel(user?.role ?? "");

  return (
    <aside
      className={cn(
        "fv-shell-card relative flex h-full shrink-0 flex-col border-r transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
        collapsed ? "w-[72px]" : "w-[var(--app-sidebar)]",
        className,
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "flex h-[52px] items-center border-b border-[var(--border-subtle)]",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4",
        )}
      >
        <img src="/forevue-icon.svg" alt="" className="h-[26px] w-[26px] shrink-0" />
        {!collapsed && (
          <span className="text-lg font-bold tracking-[-0.01em] text-[var(--text-strong)]">
            Forevue
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col px-3 py-4", collapsed && "px-2")}>
        <Button
          type="button"
          variant="primary"
          size="md"
          className={cn("mt-0.5", collapsed && "h-10 w-10 px-0")}
          title="AI workspace"
          onClick={() => {
            navigate("/ai");
            onNavigate?.();
          }}
        >
          <Sparkles size={iconDefaults.size} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
          {!collapsed && <span className="flex-1 text-left">AI workspace</span>}
        </Button>

        {!collapsed && <p className="fv-eyebrow mt-[18px] px-2.5 pb-2">{sectionLabel}</p>}
        {collapsed && <div className="h-3.5" />}

        <AppNav collapsed={collapsed} onNavigate={onNavigate} />

        <div className="mt-auto flex flex-col gap-0.5 pt-2">
          <SidebarFooterButton
            collapsed={collapsed}
            label="Help"
            onClick={() => openOverlay("help")}
          />
          <SidebarFooterButton
            collapsed={collapsed}
            label="Settings"
            active={isSettings}
            onClick={() => {
              navigate("/settings");
              onNavigate?.();
            }}
          />
          <button
            type="button"
            title={shellUser.name}
            onClick={() => openOverlay("profile")}
            className={cn(
              "mt-2 flex w-full cursor-pointer items-center gap-2.5 border-none border-t border-[var(--border-subtle)] bg-transparent pt-2.5 text-left",
              collapsed ? "justify-center px-0" : "px-2",
            )}
          >
            <Avatar initials={shellUser.initials} size="md" tone="teal" />
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-[var(--text-strong)]">
                  {shellUser.name}
                </span>
                <span className="block truncate text-[11.5px] text-[var(--text-muted)]">
                  {shellUser.title}
                </span>
              </span>
            )}
          </button>
        </div>
      </div>

      {showCollapseToggle && (
        <ShellIconButton
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebarCollapsed}
          className="absolute top-[18px] -right-3 z-[5] h-6 w-6 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-xs)] hover:bg-[var(--surface-card)]"
        >
          <PanelLeft
            className={cn("h-3.5 w-3.5", collapsed && "rotate-180")}
            strokeWidth={iconDefaults.strokeWidth}
          />
        </ShellIconButton>
      )}
    </aside>
  );
}

function SidebarFooterButton({
  collapsed,
  label,
  active,
  onClick,
}: {
  collapsed: boolean;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none px-2.75 py-2.25 text-left text-sm font-medium transition-colors duration-[var(--duration-fast)]",
        collapsed && "justify-center px-0",
        active
          ? "bg-[var(--color-teal-50)] font-semibold text-[var(--color-deep-teal)]"
          : "bg-transparent text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]",
      )}
    >
      {!collapsed ? <span className="flex-1">{label}</span> : <span className="sr-only">{label}</span>}
    </button>
  );
}
