import type { FacultyDashboard } from "@/api/faculty";
import { useAuth } from "@/auth";
import { useFacultyDashboard } from "@/hooks/useFacultyDashboard";

function badgesFromData(data: FacultyDashboard | undefined): Partial<Record<"reviews" | "students" | "approvals", string>> {
  if (!data?.has_scope) return {};
  const { nav_badges } = data;
  const out: Partial<Record<"reviews" | "students" | "approvals", string>> = {};
  if (nav_badges.reviews > 0) out.reviews = String(nav_badges.reviews);
  if (nav_badges.students > 0) out.students = String(nav_badges.students);
  if (nav_badges.approvals > 0) out.approvals = String(nav_badges.approvals);
  return out;
}

export function useFacultyNavBadges(): Partial<Record<"reviews" | "students" | "approvals", string>> {
  const { user } = useAuth();
  const dashboard = useFacultyDashboard();

  if (user?.role !== "faculty") return {};
  return badgesFromData(dashboard.data);
}
