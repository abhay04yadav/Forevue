import { getRefreshToken } from "../auth/tokenStorage";
import { apiClient } from "./client";
import type { TokenResponse } from "./types";

export async function login(tenantSlug: string, email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", {
    tenant_slug: tenantSlug,
    email,
    password,
  });
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  await apiClient.post("/auth/logout", { refresh_token: refreshToken });
}
