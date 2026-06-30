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

export async function askQuestion(question: string, sessionId?: string | null): Promise<AskResponse> {
  const { data } = await apiClient.post<AskResponse>("/ai/ask", {
    question,
    session_id: sessionId ?? undefined,
  });
  return data;
}
