import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  User,
  Users,
} from "lucide-react";

export interface MockShellUser {
  name: string;
  email: string;
  title: string;
  initials: string;
  roleLabel: string;
}

export const MOCK_SHELL_USER: MockShellUser = {
  name: "R. Menon",
  email: "meera.iyer@demo-eng.edu",
  title: "Dean, Academics",
  initials: "RM",
  roleLabel: "Principal",
};

export type NotificationKind = "all" | "alerts" | "approvals" | "ai" | "tasks";

export interface MockNotification {
  id: string;
  kind: NotificationKind;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  actionLabel?: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "n1",
    kind: "alerts",
    icon: AlertTriangle,
    iconBg: "var(--color-risk-high-bg)",
    iconColor: "var(--color-risk-high)",
    title: "Attendance threshold crossed",
    body: "Six students in CSE-3 slipped below the line this week, based on the attendance register.",
    time: "12 min ago",
    unread: true,
    actionLabel: "Open risk board",
  },
  {
    id: "n2",
    kind: "approvals",
    icon: FileText,
    iconBg: "var(--color-amber-50)",
    iconColor: "var(--color-amber-700)",
    title: "Report waiting for review",
    body: "A department summary draft needs your approval before it can be shared.",
    time: "1 hr ago",
    unread: true,
    actionLabel: "Review draft",
  },
  {
    id: "n3",
    kind: "ai",
    icon: Sparkles,
    iconBg: "var(--color-teal-50)",
    iconColor: "var(--color-deep-teal)",
    title: "Forevue surfaced a pattern",
    body: "Internal marks dipped after week 6 in three sections. Evidence is attached in AI workspace.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n4",
    kind: "tasks",
    icon: Users,
    iconBg: "var(--color-neutral-100)",
    iconColor: "var(--color-neutral-700)",
    title: "Mentor check-in due",
    body: "Two follow-ups from last week's watch list are still open.",
    time: "2 days ago",
    unread: false,
    actionLabel: "View tasks",
  },
];

export interface CommandPaletteItem {
  id: string;
  group: string;
  title: string;
  meta: string;
  icon: LucideIcon;
  path?: string;
  action?: "palette" | "notifications" | "settings" | "help";
}

export const MOCK_COMMAND_ITEMS: CommandPaletteItem[] = [
  {
    id: "c1",
    group: "Pages",
    title: "Risk board",
    meta: "Students who need attention",
    icon: Users,
    path: "/board",
  },
  {
    id: "c2",
    group: "Pages",
    title: "Dashboard",
    meta: "Institution overview",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "c3",
    group: "Pages",
    title: "Settings",
    meta: "Profile, notifications, appearance",
    icon: Settings,
    path: "/settings",
  },
  {
    id: "c4",
    group: "Actions",
    title: "Open notifications",
    meta: "Alerts, approvals, tasks",
    icon: Bell,
    action: "notifications",
  },
  {
    id: "c5",
    group: "Records",
    title: "CSE-3 attendance register",
    meta: "Dataset · current term",
    icon: BarChart3,
    path: "/board",
  },
  {
    id: "c6",
    group: "People",
    title: "Aarav Sharma",
    meta: "Roll 21CSE042 · CSE-3",
    icon: User,
    path: "/board",
  },
];

export const NOTIFICATION_FILTERS: { id: NotificationKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "alerts", label: "Alerts" },
  { id: "approvals", label: "Approvals" },
  { id: "ai", label: "AI" },
  { id: "tasks", label: "Tasks" },
];
