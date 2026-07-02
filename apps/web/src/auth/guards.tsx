import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "@/design";
import { getHomePath, isStaffOnlyPath, isStudentOnlyPath } from "@/routes/paths";
import { useAuth } from "./AuthContext";
import { hasFullVisibility, isAdmin, isHod, isPlacement, isRiskBoardStaff, isStudent } from "./roles";

// Set synchronously by the sign-out handler, read here, and cleared by LoginPage
// once mounted. A plain module flag (not React state) avoids the redirect-timing
// race documented in Architecture Bible Ch9 §11.
export const voluntarySignOut = { current: false };

export function RequireAuth() {
  const { user, isAuthenticating } = useAuth();
  const location = useLocation();
  if (isAuthenticating) {
    return <LoadingState label="Signing you in…" />;
  }
  if (!user) {
    const state = voluntarySignOut.current ? undefined : { from: location };
    return <Navigate to="/login" state={state} replace />;
  }
  return <Outlet />;
}

// UX guard only — the server is the real boundary (Ch9 §5).
export function RequirePrivileged() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasFullVisibility(user.role)) return <Navigate to={getHomePath(user.role)} replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin(user.role)) return <Navigate to={getHomePath(user.role)} replace />;
  return <Outlet />;
}

/** Faculty-only routes (home, teaching, create). */
export function RequireFaculty() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "faculty") return <Navigate to={getHomePath(user.role)} replace />;
  return <Outlet />;
}

/** Redirect students away from staff-only routes (UX guard — server enforces too). */
export function RequireStaff() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace />;
  if (!isRiskBoardStaff(user.role) && isStaffOnlyPath(location.pathname)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  if (isStudent(user.role) && isStaffOnlyPath(location.pathname)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  if (isPlacement(user.role) && (location.pathname.startsWith("/board") || location.pathname.startsWith("/students/"))) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return <Outlet />;
}

export function RequireHod() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isHod(user.role)) return <Navigate to={getHomePath(user.role)} replace />;
  return <Outlet />;
}

export function RequirePlacement() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isPlacement(user.role)) return <Navigate to={getHomePath(user.role)} replace />;
  return <Outlet />;
}

/** Keep student workspace routes limited to the student persona. */
export function RequireStudent() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent(user.role) && isStudentOnlyPath(location.pathname)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return <Outlet />;
}
