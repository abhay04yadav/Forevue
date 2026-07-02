import { apiClient } from "./client";
import type { Student360Response } from "./types";

/** Student 360 — includes `attendance_summary` from the attendance register */
export async function getStudent360(studentId: string): Promise<Student360Response> {
  const { data } = await apiClient.get<Student360Response>(`/students/${studentId}`);
  return data;
}
