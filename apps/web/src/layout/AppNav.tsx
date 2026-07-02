import { NavLink } from "react-router-dom";

import { useAuth } from "@/auth";
import { useOpenAssignmentCount } from "@/hooks/useStudentContext";
import { useFacultyNavBadges } from "@/hooks/useFacultyNavBadges";
import { cn } from "@/lib/utils";
import { iconDefaults } from "@/design/tokens/icons";

import { visibleNavItems } from "./nav-config";

export function AppNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const { user } = useAuth();
  const openAssignments = useOpenAssignmentCount();
  const facultyBadges = useFacultyNavBadges();
  if (!user) return null;

  const items = visibleNavItems(user.role);

  return (
    <nav className="mt-3 flex flex-col gap-0.5">
      {items.map((item) => {
        const facultyBadge =
          user.role === "faculty" && item.badgeKey
            ? facultyBadges[item.badgeKey]
            : undefined;
        const badge =
          item.badge ??
          facultyBadge ??
          (item.badgeKey === "assignments" && openAssignments > 0 ? String(openAssignments) : undefined);
        const isFacultyCount = user.role === "faculty" && item.badgeKey && facultyBadge;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-2.5 rounded-[var(--radius-md)] border-none px-2.75 py-2.25 text-sm font-medium transition-colors duration-[var(--duration-fast)]",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-[var(--color-teal-50)] font-semibold text-[var(--color-deep-teal)] shadow-[inset_3px_0_0_0_var(--color-deep-teal)]"
                  : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--text-strong)]",
              )
            }
          >
            <item.icon
              className="shrink-0"
              size={iconDefaults.size}
              strokeWidth={iconDefaults.strokeWidth}
              aria-hidden
            />
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && badge && (
              <span
                className={cn(
                  "min-w-[20px] rounded-full px-1.5 py-px text-center text-[11px] font-bold tabular-nums",
                  isFacultyCount
                    ? "bg-[var(--color-teal-500)] text-white"
                    : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]",
                )}
              >
                {badge}
              </span>
            )}
            {collapsed && <span className="sr-only">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
