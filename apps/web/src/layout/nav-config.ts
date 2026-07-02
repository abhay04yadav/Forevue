import type { LucideIcon } from "lucide-react";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FileUp,
  LayoutDashboard,
  LayoutGrid,
  Settings2,
  Sparkles,
  Target,
  Users,
  Wallet,
} from "lucide-react";

import { isAdmin, type AppRole } from "@/auth/roles";
import { ADMIN_PATHS, STAFF_PATHS, STUDENT_PATHS } from "@/routes/paths";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeKey?: "reviews" | "students" | "approvals" | "assignments";
}

const STUDENT_NAV: NavItem[] = [
  { to: STUDENT_PATHS.myDay, label: "Brief", icon: CalendarDays },
  { to: STUDENT_PATHS.academics, label: "Academics", icon: BookOpen },
  { to: STUDENT_PATHS.timetable, label: "Timetable", icon: CalendarDays },
  { to: STUDENT_PATHS.fees, label: "Fees", icon: Wallet },
  { to: STUDENT_PATHS.career, label: "Career", icon: Briefcase },
  { to: STUDENT_PATHS.ai, label: "Ask", icon: Sparkles },
];

const FACULTY_NAV: NavItem[] = [
  { to: STAFF_PATHS.home, label: "My teaching", icon: LayoutGrid },
  { to: STAFF_PATHS.teaching, label: "Classes", icon: CalendarDays },
  { to: `${STAFF_PATHS.create}/assignment`, label: "Reviews", icon: ClipboardList, badgeKey: "reviews" },
  { to: STAFF_PATHS.board, label: "Students", icon: Users, badgeKey: "students" },
  { to: `${STAFF_PATHS.teaching}/progress`, label: "Attendance", icon: CheckCircle },
  { to: STAFF_PATHS.create, label: "Approvals", icon: ClipboardCheck, badgeKey: "approvals" },
];

const HOD_NAV: NavItem[] = [
  { to: STAFF_PATHS.department, label: "Brief", icon: Building2 },
  { to: STAFF_PATHS.board, label: "Students", icon: Users },
  { to: STAFF_PATHS.departmentReports, label: "Reports", icon: FileText },
];

const PLACEMENT_NAV: NavItem[] = [
  { to: STAFF_PATHS.placement, label: "Dashboard", icon: LayoutDashboard },
  { to: `${STAFF_PATHS.placement}/drives`, label: "Drives", icon: Briefcase },
  { to: STAFF_PATHS.placementReadiness, label: "Readiness", icon: Target },
  { to: STAFF_PATHS.placementAnalytics, label: "Analytics", icon: BarChart3 },
];

const PRIVILEGED_NAV: NavItem[] = [
  { to: STAFF_PATHS.dashboard, label: "Dashboard", icon: LayoutDashboard, badge: "Leadership" },
  { to: STAFF_PATHS.board, label: "Risk board", icon: Users },
];

const ADMIN_NAV: NavItem[] = [
  { to: ADMIN_PATHS.config, label: "Risk config", icon: Settings2 },
  { to: ADMIN_PATHS.imports, label: "Imports", icon: FileUp },
];

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  student: STUDENT_NAV,
  faculty: FACULTY_NAV,
  hod: HOD_NAV,
  placement: PLACEMENT_NAV,
  principal: PRIVILEGED_NAV,
  registrar: PRIVILEGED_NAV,
  iqac: PRIVILEGED_NAV,
  admin: [...PRIVILEGED_NAV, ...ADMIN_NAV],
};

export function visibleNavItems(role: string): NavItem[] {
  if (role in NAV_BY_ROLE) return NAV_BY_ROLE[role as AppRole];
  return FACULTY_NAV;
}

export function navSectionLabel(role: string): string {
  if (role === "faculty") return "Teaching";
  return "Workspace";
}

/** Command palette entries derived from nav plus shared destinations. */
export function commandNavItems(role: string): NavItem[] {
  const items = visibleNavItems(role);
  if (isAdmin(role)) {
    return [...items, ...ADMIN_NAV.filter((item) => !items.some((nav) => nav.to === item.to))];
  }
  return items;
}
