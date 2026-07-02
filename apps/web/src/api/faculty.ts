import { apiClient } from "./client";

export interface FacultyDashboard {
  has_scope: boolean;
  first_name: string;
  department_name: string | null;
  semester_label: string;
  session_label: string;
  day_summary: string;
  health_score: number;
  health_label: string;
  health_factors: Array<{ label: string; value: number }>;
  health_narrative: string;
  health_sources: string[];
  daily_brief: { text: string; bullets: string[] };
  brief_actions: Array<{ icon: string; text: string; link_label: string }>;
  kpis: Array<{ id: string; label: string; value: string; sub?: string | null }>;
  classes_today: Array<{
    id: string;
    start_time: string;
    title: string;
    section: string | null;
    room: string | null;
    student_count: number | null;
    status: string;
    status_note: string | null;
    session_type: string;
  }>;
  coaching_items: Array<{ title: string; why: string; cta: string; coach_key: string }>;
  attendance_tasks: {
    pending: number;
    completed: number;
    overdue: number;
    filled_count: number;
    total_count: number;
    registers: Array<{ section: string; course_code: string; start_time: string; status: string }>;
  } | null;
  class_performance: {
    avg_internal_pct: number;
    delta_pts: number | null;
    internals_in_days: number | null;
    subjects: Array<{ section: string; course_code: string; avg_pct: number; tone: string }>;
    insight: string;
  } | null;
  assignment_reviews: Array<{
    id: string;
    title: string;
    priority: string;
    due_label: string;
    section: string;
    submission_count: number;
    graded_count: number;
  }>;
  pending_approvals: Array<{ id: string; kind: string; title: string; due_label: string }>;
  flagged_students: Array<{
    student_id: string;
    name: string;
    section: string;
    why: string;
    based_on: string;
    confidence_pct: number;
    confidence_label: string;
    tier: string;
  }>;
  nav_badges: { reviews: number; students: number; approvals: number };
  at_risk_students: Array<{
    student_id: string;
    name: string;
    roll_no: string;
    tier: string;
    top_finding: string | null;
  }>;
  attendance_watch: Array<{
    student_id: string;
    name: string;
    roll_no: string;
    present_rate_pct: number | null;
    note: string;
  }>;
  course_progress: Array<{
    course_id: string;
    course_code: string;
    course_name: string;
    coverage_pct: number;
    planned_sessions: number;
    delivered_sessions: number;
    slippage: boolean;
  }>;
  recent_activity: Array<{ id: string; kind: string; text: string; at: string }>;
  import_freshness: { is_stale: boolean; message: string | null } | null;
}

export interface FacultyArtifact {
  id: string;
  artifact_type: string;
  title: string;
  status: string;
  content_json: Record<string, unknown>;
  source_job_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface GenerationJob {
  id: string;
  feature: string;
  params_json: Record<string, unknown>;
  status: string;
  result_artifact_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoursePlan {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  syllabus_units: unknown[];
  planned_sessions: number;
  delivered_sessions: number;
}

export interface OfficeHourSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  status: string;
  booking_note: string | null;
}

export async function getFacultyDashboard(): Promise<FacultyDashboard> {
  const { data } = await apiClient.get<FacultyDashboard>("/faculty/dashboard");
  return data;
}

export async function listFacultyArtifacts(): Promise<FacultyArtifact[]> {
  const { data } = await apiClient.get<FacultyArtifact[]>("/faculty/artifacts");
  return data;
}

export async function getFacultyArtifact(id: string): Promise<FacultyArtifact> {
  const { data } = await apiClient.get<FacultyArtifact>(`/faculty/artifacts/${id}`);
  return data;
}

export async function updateFacultyArtifact(
  id: string,
  payload: { title?: string; status?: string; content_json?: Record<string, unknown> },
): Promise<FacultyArtifact> {
  const { data } = await apiClient.patch<FacultyArtifact>(`/faculty/artifacts/${id}`, payload);
  return data;
}

export async function generateFacultyContent(
  feature: string,
  params: Record<string, unknown> = {},
): Promise<GenerationJob> {
  const { data } = await apiClient.post<GenerationJob>("/faculty/generate", { feature, params });
  return data;
}

export async function getGenerationJob(id: string): Promise<GenerationJob> {
  const { data } = await apiClient.get<GenerationJob>(`/faculty/jobs/${id}`);
  return data;
}

export async function listCoursePlans(): Promise<CoursePlan[]> {
  const { data } = await apiClient.get<CoursePlan[]>("/faculty/course-plans");
  return data;
}

export async function listOfficeHours(): Promise<OfficeHourSlot[]> {
  const { data } = await apiClient.get<OfficeHourSlot[]>("/faculty/office-hours");
  return data;
}

export async function createOfficeHour(payload: {
  slot_date: string;
  start_time: string;
  end_time: string;
  location?: string;
}): Promise<OfficeHourSlot> {
  const { data } = await apiClient.post<OfficeHourSlot>("/faculty/office-hours", payload);
  return data;
}
