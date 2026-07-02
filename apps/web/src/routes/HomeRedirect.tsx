import { Navigate } from "react-router-dom";

import { useAuth } from "@/auth";
import { getHomePath } from "@/routes/paths";

export function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getHomePath(user.role)} replace />;
}
