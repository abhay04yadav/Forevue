import { HelpCircle, LogOut, Moon, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { voluntarySignOut, useAuth } from "@/auth";
import { Avatar } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { iconDefaults } from "@/design/tokens/icons";

import { useShell } from "./ShellProvider";

/** Profile dropdown menu — App Shell design */
export function ProfileMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { overlay, closeOverlay, openOverlay, shellUser } = useShell();
  const { resolved, setMode } = useTheme();

  if (overlay !== "profile") return null;

  async function signOut() {
    voluntarySignOut.current = true;
    closeOverlay();
    await logout();
    navigate("/login", { replace: true });
  }

  function toggleTheme() {
    setMode(resolved === "dark" ? "light" : "dark");
  }

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={closeOverlay} aria-hidden />
      <div
        role="menu"
        className="fixed top-[62px] right-[18px] z-[56] w-64 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)] animate-fv-rise"
      >
        <div className="flex items-center gap-2.75 border-b border-[var(--border-subtle)] px-4 py-3.75">
          <Avatar initials={shellUser.initials} size="lg" tone="teal" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--text-strong)]">{shellUser.name}</div>
            <div className="truncate text-xs text-[var(--text-muted)]">{shellUser.email}</div>
            {shellUser.roleLabel && (
              <div className="mt-0.5 text-[11px] font-semibold tracking-wide text-[var(--color-deep-teal)] uppercase">
                {shellUser.roleLabel}
              </div>
            )}
          </div>
        </div>

        <div className="p-1.5">
          <ProfileMenuItem
            icon={User}
            label="Account & profile"
            onClick={() => {
              closeOverlay();
              navigate("/settings");
            }}
          />
          <ProfileMenuItem
            icon={resolved === "dark" ? Sun : Moon}
            label={resolved === "dark" ? "Switch to light" : "Switch to dark"}
            onClick={toggleTheme}
          />
          <ProfileMenuItem
            icon={HelpCircle}
            label="Help & support"
            onClick={() => openOverlay("help")}
          />
        </div>

        <div className="border-t border-[var(--border-subtle)] p-1.5">
          <ProfileMenuItem
            icon={LogOut}
            label="Sign out"
            danger
            onClick={signOut}
          />
        </div>
      </div>
    </>
  );
}

function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-2.75 rounded-lg border-none bg-transparent px-2.5 py-2 text-left text-[13.5px] transition-colors hover:bg-[var(--color-neutral-100)]"
      style={{ color: danger ? "var(--color-risk-high)" : "var(--text-body)" }}
    >
      <Icon size={16} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
      <span className="flex-1">{label}</span>
    </button>
  );
}
