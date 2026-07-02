import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { login as apiLogin, logout as apiLogout } from "@/api/auth";
import { getMe } from "@/api/me";
import { setOnAuthExpired } from "@/api/client";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

export interface AuthUser {
  userId: string;
  tenantId: string;
  role: string;
  email?: string;
  studentId?: string;
  departmentCodes?: string[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticating: boolean;
  login: (tenantSlug: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function loadUserFromSession(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const me = await getMe();
    return {
      userId: me.user_id,
      tenantId: me.tenant_id,
      role: me.role,
      email: me.email,
      studentId: me.student_id ?? undefined,
      departmentCodes: me.department_codes,
    };
  } catch {
    clearTokens();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    setUser(null);
    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch {
        // Server revocation is best-effort; local session is already cleared.
      }
    }
  }, []);

  useEffect(() => {
    setOnAuthExpired(() => {
      clearTokens();
      setUser(null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadUserFromSession().then((next) => {
      if (!cancelled) {
        setUser(next);
        setIsAuthenticating(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (tenantSlug: string, email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const tokens = await apiLogin({ tenant_slug: tenantSlug, email, password });
      setTokens(tokens.access_token, tokens.refresh_token);
      const me = await getMe();
      setUser({
        userId: me.user_id,
        tenantId: me.tenant_id,
        role: me.role,
        email: me.email,
        studentId: me.student_id ?? undefined,
        departmentCodes: me.department_codes,
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticating, login, logout }),
    [user, isAuthenticating, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
