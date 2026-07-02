import { apiClient } from "./client";

export interface AskRequest {
  question: string;
  session_id?: string | null;
}

export interface AskResponse {
  abstained: boolean;
  interpretation: string | null;
  metric: string | null;
  columns: string[];
  rows: Record<string, unknown>[];
  narration: string | null;
  cached: boolean;
  session_id: string;
  evidence_sources: string[];
}

export async function askQuestion(payload: AskRequest): Promise<AskResponse> {
  const { data } = await apiClient.post<AskResponse>("/ai/ask", payload);
  return data;
}
