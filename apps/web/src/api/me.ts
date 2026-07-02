import { apiClient } from "./client";

export interface MeResponse {
  user_id: string;
  tenant_id: string;
  email: string;
  role: string;
  student_id: string | null;
  department_codes: string[];
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>("/auth/me");
  return data;
}
