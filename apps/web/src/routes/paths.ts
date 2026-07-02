import {

  hasFullVisibility,

  isAdmin,

  isAppRole,

  isHod,

  isPlacement,

  isRiskBoardStaff,

  isStudent,

  type AppRole,

} from "@/auth/roles";



export const STUDENT_PATHS = {

  myDay: "/my-day",

  academics: "/academics",

  timetable: "/timetable",

  assignments: "/assignments",

  attendance: "/attendance",

  examPrep: "/exam-prep",

  fees: "/fees",

  career: "/career",

  ai: "/ai",

  artifacts: "/artifacts",

} as const;



export const STAFF_PATHS = {

  home: "/home",

  board: "/board",

  teaching: "/teaching",

  create: "/create",

  department: "/department",

  departmentReports: "/department/reports",

  placement: "/placement",

  placementReadiness: "/placement/readiness",

  placementAnalytics: "/placement/analytics",

  dashboard: "/dashboard",

} as const;



export const ADMIN_PATHS = {

  config: "/admin/config",

  imports: "/admin/imports",

} as const;



export const ROLE_HOME: Record<AppRole, string> = {

  admin: STAFF_PATHS.dashboard,

  principal: STAFF_PATHS.dashboard,

  registrar: STAFF_PATHS.dashboard,

  iqac: STAFF_PATHS.dashboard,

  faculty: STAFF_PATHS.home,

  hod: STAFF_PATHS.department,

  placement: STAFF_PATHS.placement,

  student: STUDENT_PATHS.myDay,

};



const STUDENT_ONLY_PREFIXES = [

  STUDENT_PATHS.myDay,

  STUDENT_PATHS.academics,

  STUDENT_PATHS.timetable,

  STUDENT_PATHS.assignments,

  STUDENT_PATHS.attendance,

  STUDENT_PATHS.examPrep,

  STUDENT_PATHS.fees,

  STUDENT_PATHS.career,

] as const;



const SHARED_AUTHENTICATED_PREFIXES = ["/ai", "/artifacts", "/settings"] as const;



function matchesPrefix(pathname: string, prefix: string): boolean {

  return pathname === prefix || pathname.startsWith(`${prefix}/`);

}



export function isStudentOnlyPath(pathname: string): boolean {

  return STUDENT_ONLY_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));

}



export function isStaffOnlyPath(pathname: string): boolean {

  return (

    matchesPrefix(pathname, STAFF_PATHS.home) ||

    matchesPrefix(pathname, STAFF_PATHS.board) ||

    matchesPrefix(pathname, STAFF_PATHS.dashboard) ||

    matchesPrefix(pathname, STAFF_PATHS.department) ||

    matchesPrefix(pathname, STAFF_PATHS.placement) ||

    matchesPrefix(pathname, STAFF_PATHS.teaching) ||

    matchesPrefix(pathname, STAFF_PATHS.create) ||

    matchesPrefix(pathname, "/students/") ||

    matchesPrefix(pathname, "/admin/")

  );

}



export function getHomePath(role: string): string {

  if (isAppRole(role)) return ROLE_HOME[role];

  if (hasFullVisibility(role)) return STAFF_PATHS.dashboard;

  if (isStudent(role)) return STUDENT_PATHS.myDay;

  return STAFF_PATHS.board;

}



export function canAccessPath(role: string, pathname: string): boolean {

  if (pathname === "/login" || pathname === "/") return true;



  if (SHARED_AUTHENTICATED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {

    return true;

  }



  if (isStudentOnlyPath(pathname)) {

    return isStudent(role);

  }



  if (matchesPrefix(pathname, ADMIN_PATHS.config) || matchesPrefix(pathname, ADMIN_PATHS.imports)) {

    return isAdmin(role);

  }



  if (matchesPrefix(pathname, STAFF_PATHS.home) || matchesPrefix(pathname, STAFF_PATHS.teaching) || matchesPrefix(pathname, STAFF_PATHS.create)) {

    return role === "faculty";

  }



  if (matchesPrefix(pathname, STAFF_PATHS.departmentReports)) {

    return isHod(role);

  }



  if (matchesPrefix(pathname, STAFF_PATHS.placementReadiness) || matchesPrefix(pathname, STAFF_PATHS.placementAnalytics)) {

    return isPlacement(role);

  }



  if (matchesPrefix(pathname, STAFF_PATHS.dashboard)) {

    return hasFullVisibility(role);

  }



  if (matchesPrefix(pathname, STAFF_PATHS.department)) {

    return isHod(role);

  }



  if (matchesPrefix(pathname, STAFF_PATHS.placement)) {

    return isPlacement(role);

  }



  if (matchesPrefix(pathname, STAFF_PATHS.board) || matchesPrefix(pathname, "/students/")) {

    return isRiskBoardStaff(role);

  }



  return false;

}



export function resolvePostLoginPath(role: string, from?: string): string {

  const home = getHomePath(role);

  if (!from || from === "/login") return home;

  if (canAccessPath(role, from)) return from;

  return home;

}


