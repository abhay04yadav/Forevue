import { apiClient } from "./client";
import type {
  RecomputeRequest,
  RecomputeSummaryResponse,
  RiskConfigResponse,
  RiskConfigUpdateRequest,
} from "@forevue/api-client";
import type {
  AlertResponse,
  AtRiskStudentResponse,
  RiskSummaryByDepartmentResponse,
  RiskSummaryResponse,
  StudentRiskDetailResponse,
} from "./types";

export interface AtRiskStudentFilters {
  tier?: string;
  risk_type?: string;
  department?: string;
  min_score?: number;
  page?: number;
}

export async function listAtRiskStudents(
  filters: AtRiskStudentFilters,
): Promise<AtRiskStudentResponse[]> {
  const { data } = await apiClient.get<AtRiskStudentResponse[]>("/risk/students", { params: filters });
  return data;
}

export async function getStudentRisk(studentId: string): Promise<StudentRiskDetailResponse> {
  const { data } = await apiClient.get<StudentRiskDetailResponse>(`/risk/students/${studentId}`);
  return data;
}

export async function getRiskSummary(): Promise<RiskSummaryResponse> {
  const { data } = await apiClient.get<RiskSummaryResponse>("/risk/summary");
  return data;
}

export async function getRiskSummaryByDepartment(): Promise<RiskSummaryByDepartmentResponse> {
  const { data } = await apiClient.get<RiskSummaryByDepartmentResponse>(
    "/risk/summary/by-department",
  );
  return data;
}

export async function listRiskAlerts(status?: string): Promise<AlertResponse[]> {
  const { data } = await apiClient.get<AlertResponse[]>("/risk/alerts", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function markRiskAlertRead(alertId: string): Promise<AlertResponse> {
  const { data } = await apiClient.patch<AlertResponse>(`/risk/alerts/${alertId}/read`);
  return data;
}

export async function getRiskConfig(): Promise<RiskConfigResponse> {
  const { data } = await apiClient.get<RiskConfigResponse>("/risk/config");
  return data;
}

export async function updateRiskConfig(payload: RiskConfigUpdateRequest): Promise<RiskConfigResponse> {
  const { data } = await apiClient.put<RiskConfigResponse>("/risk/config", payload);
  return data;
}

export async function recompute(payload: RecomputeRequest): Promise<RecomputeSummaryResponse> {
  const { data } = await apiClient.post<RecomputeSummaryResponse>("/risk/recompute", payload);
  return data;
}

export interface InterventionPayload {
  student_id: string;
  type: string;
  title: string;
  notes?: string | null;
}

export interface InterventionRecord {
  id: string;
  student_id: string;
  type: string;
  status: string;
  title: string;
  notes: string | null;
  created_at: string;
}

export async function createIntervention(payload: InterventionPayload): Promise<InterventionRecord> {
  const { data } = await apiClient.post<InterventionRecord>("/risk/interventions", payload);
  return data;
}
