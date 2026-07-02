export const APP_ROLES = [
  "admin",
  "principal",
  "registrar",
  "iqac",
  "faculty",
  "student",
  "hod",
  "placement",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const PRIVILEGED_ROLES = ["admin", "principal", "registrar", "iqac"] as const;

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrator",
  principal: "Principal",
  registrar: "Registrar",
  iqac: "IQAC",
  faculty: "Faculty mentor",
  hod: "Head of department",
  student: "Student",
  placement: "Placement cell",
};

export function isAppRole(role: string): role is AppRole {
  return (APP_ROLES as readonly string[]).includes(role);
}

export function hasFullVisibility(role: string): boolean {
  return (PRIVILEGED_ROLES as readonly string[]).includes(role);
}

export function isAdmin(role: string): boolean {
  return role === "admin";
}

export function isHod(role: string): boolean {
  return role === "hod";
}

export function isPlacement(role: string): boolean {
  return role === "placement";
}

export function isStudent(role: string): boolean {
  return role === "student";
}

/** Faculty, HOD, and placement — staff personas excluding leadership. */
export function isOperationalStaff(role: string): boolean {
  return role === "faculty" || role === "hod" || role === "placement";
}

/** Roles that may access the risk board and student 360. */
export function isRiskBoardStaff(role: string): boolean {
  return role === "faculty" || role === "hod" || hasFullVisibility(role);
}

export function roleLabel(role: string): string {
  if (isAppRole(role)) return ROLE_LABELS[role];
  return role;
}

export function roleInitials(role: string): string {
  const label = roleLabel(role);
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
