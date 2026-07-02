import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { listRiskAlerts, markRiskAlertRead } from "@/api/risk";
import type { AlertResponse } from "@/api/types";
import { roleInitials, roleLabel, useAuth } from "@/auth";
import { isRiskBoardStaff, isStudent } from "@/auth/roles";

import type { MockShellUser, NotificationKind } from "./mock-data";

export type ShellOverlay = "palette" | "notifications" | "profile" | "help" | null;

interface ShellContextValue {
  overlay: ShellOverlay;
  openOverlay: (overlay: Exclude<ShellOverlay, null>) => void;
  closeOverlay: () => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  shellUser: MockShellUser;
  alerts: AlertResponse[];
  alertsLoading: boolean;
  alertsError: boolean;
  notificationFilter: NotificationKind | "all";
  setNotificationFilter: (filter: NotificationKind | "all") => void;
  markAllNotificationsRead: () => Promise<void>;
  hasUnreadNotifications: boolean;
}

const ShellContext = React.createContext<ShellContextValue | null>(null);

const DEPT_LABELS: Record<string, string> = {
  CSE: "Computer Science",
  MECH: "Mechanical Engineering",
  ECE: "Electronics & Communication",
  CIVIL: "Civil Engineering",
};

function buildShellUser(user: ReturnType<typeof useAuth>["user"]): MockShellUser {
  if (!user) {
    return {
      name: "Signed out",
      email: "",
      title: "",
      initials: "—",
      roleLabel: "",
    };
  }

  const email = user.email ?? "";
  const name = email ? email.split("@")[0]?.replace(/\./g, " ") ?? "User" : "User";
  const formattedName = name.replace(/\b\w/g, (c) => c.toUpperCase());
  const deptCode = user.departmentCodes?.[0];
  const deptLabel = deptCode ? DEPT_LABELS[deptCode] ?? deptCode : null;
  const title =
    user.role === "faculty" && deptLabel
      ? deptLabel
      : roleLabel(user.role);

  return {
    name: formattedName,
    email,
    title,
    initials: roleInitials(user.role),
    roleLabel: roleLabel(user.role),
  };
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [overlay, setOverlay] = React.useState<ShellOverlay>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [notificationFilter, setNotificationFilter] = React.useState<NotificationKind | "all">("all");

  const alertsEnabled = !!user && isRiskBoardStaff(user.role) && !isStudent(user.role);

  const alertsQuery = useQuery({
    queryKey: ["risk-alerts"],
    queryFn: () => listRiskAlerts(),
    enabled: alertsEnabled,
  });

  const alerts = alertsEnabled ? (alertsQuery.data ?? []) : [];
  const hasUnreadNotifications = alerts.some((a) => a.status !== "read");
  const shellUser = React.useMemo(() => buildShellUser(user), [user]);

  const openOverlay = React.useCallback((next: Exclude<ShellOverlay, null>) => {
    setOverlay(next);
    setMobileDrawerOpen(false);
  }, []);

  const closeOverlay = React.useCallback(() => setOverlay(null), []);

  const toggleSidebarCollapsed = React.useCallback(
    () => setSidebarCollapsed((v) => !v),
    [],
  );

  const markAllNotificationsRead = React.useCallback(async () => {
    const unread = alerts.filter((a) => a.status !== "read");
    if (unread.length === 0) return;
    await Promise.all(unread.map((a) => markRiskAlertRead(a.id)));
    await queryClient.invalidateQueries({ queryKey: ["risk-alerts"] });
  }, [alerts, queryClient]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOverlay((current) => (current === "palette" ? null : "palette"));
        setMobileDrawerOpen(false);
      }
      if (e.key === "Escape") {
        setOverlay(null);
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (overlay) setMobileDrawerOpen(false);
  }, [overlay]);

  const value = React.useMemo<ShellContextValue>(
    () => ({
      overlay,
      openOverlay,
      closeOverlay,
      mobileDrawerOpen,
      setMobileDrawerOpen,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      shellUser,
      alerts,
      alertsLoading: alertsEnabled && alertsQuery.isLoading,
      alertsError: alertsEnabled && alertsQuery.isError,
      notificationFilter,
      setNotificationFilter,
      markAllNotificationsRead,
      hasUnreadNotifications,
    }),
    [
      overlay,
      openOverlay,
      closeOverlay,
      mobileDrawerOpen,
      sidebarCollapsed,
      toggleSidebarCollapsed,
      shellUser,
      alerts,
      alertsEnabled,
      alertsQuery.isLoading,
      alertsQuery.isError,
      notificationFilter,
      markAllNotificationsRead,
      hasUnreadNotifications,
    ],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = React.useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
