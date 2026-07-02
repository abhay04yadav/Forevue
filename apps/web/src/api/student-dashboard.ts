import { apiClient } from "./client";

export interface KpiItem {
  id: string;
  label: string;
  value: string;
  sub?: string | null;
  delta?: string | null;
  delta_dir?: string | null;
  value_class?: string | null;
}

export interface HealthFactor {
  label: string;
  value: number;
  weight_pct: number;
}

export interface CoachItem {
  title: string;
  why: string;
  cta: string;
  coach_key: string;
}

export interface GrowthStat {
  value: string;
  label: string;
  icon: string;
}

export interface DailyBrief {
  text: string;
  bullets: string[];
}

export interface SemesterTrendItem {
  label: string;
  value_pct: number;
}

export interface SubjectHealthItem {
  course_code: string;
  course_name: string;
  status: string;
  tier: string;
}

export interface StudentDashboard {
  student_id: string;
  name: string;
  first_name: string;
  programme_name: string | null;
  semester_label: string;
  session_label: string;
  day_summary: string;
  health_score: number;
  health_label: string;
  health_factors: HealthFactor[];
  health_narrative: string;
  needs_attention: boolean;
  attention_banner: { title: string; body: string } | null;
  kpis: KpiItem[];
  daily_brief: DailyBrief;
  coach_items: CoachItem[];
  growth_stats: GrowthStat[];
  semester_trend: SemesterTrendItem[];
  subject_health: SubjectHealthItem[];
  cgpa: number | null;
  study_streak_days: number;
  on_time_submissions: number;
}

export interface TimetableSession {
  id: string;
  course_id: string | null;
  course_code: string | null;
  course_name: string | null;
  session_date: string;
  start_time: string;
  end_time: string | null;
  session_type: string;
  title: string;
  room: string | null;
  faculty_name: string | null;
  notes: string | null;
  status: string;
}

export interface TimetableDay {
  date: string;
  summary: string;
  sessions: TimetableSession[];
}

export interface Assignment {
  id: string;
  course_id: string;
  course_code: string | null;
  course_name: string | null;
  title: string;
  due_at: string;
  due_label: string;
  status: string;
  progress_pct: number;
  priority: string;
}

export interface AssignmentsList {
  open_count: number;
  items: Assignment[];
}

export interface AttendanceCourseDetail {
  course_id: string;
  course_code: string;
  course_name: string;
  percentage: number;
  present_sessions: number;
  total_sessions: number;
  below_threshold: boolean;
}

export interface AttendanceDetail {
  overall_pct: number;
  required_pct: number;
  predicted_pct: number | null;
  margin_sessions: number | null;
  note: string;
  courses: AttendanceCourseDetail[];
}

export interface ExamSubjectReadiness {
  course_id: string;
  course_code: string;
  course_name: string;
  readiness_pct: number;
  exam_name: string | null;
  exam_date: string | null;
  days_until_exam: number | null;
}

export interface ExamPrep {
  overall_readiness: number;
  headline: string;
  tip: string;
  subjects: ExamSubjectReadiness[];
}

export interface CareerOpportunity {
  title: string;
  subtitle: string;
  icon: string;
}

export interface CareerProfile {
  readiness_score: number;
  skills: string[];
  opportunities: CareerOpportunity[];
  credits_completed: number;
  credits_required: number;
  narrative: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  body: string | null;
  tone: string;
  created_at: string;
  read_at: string | null;
  time_label: string;
}

export interface StudentActivity {
  id: string;
  activity_type: string;
  summary: string;
  created_at: string;
  time_label: string;
}

export interface FeesDetail {
  total_due: string;
  total_paid: string;
  total_balance: string;
  overdue_count: number;
  note: string;
  items: {
    term: string;
    fee_head: string;
    amount_due: string | null;
    amount_paid: string | null;
    due_date: string | null;
    status: string | null;
    balance: string | null;
  }[];
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  body: string | null;
  location: string | null;
  published_at: string;
  closes_at: string | null;
  time_label: string;
}

export async function getStudentDashboard(studentId: string): Promise<StudentDashboard> {
  const { data } = await apiClient.get<StudentDashboard>(`/students/${studentId}/dashboard`);
  return data;
}

export async function getTimetable(studentId: string, date?: string): Promise<TimetableDay> {
  const { data } = await apiClient.get<TimetableDay>(`/students/${studentId}/timetable`, {
    params: date ? { date } : undefined,
  });
  return data;
}

export async function getAssignments(studentId: string, status?: string): Promise<AssignmentsList> {
  const { data } = await apiClient.get<AssignmentsList>(`/students/${studentId}/assignments`, {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getAttendanceDetail(studentId: string): Promise<AttendanceDetail> {
  const { data } = await apiClient.get<AttendanceDetail>(`/students/${studentId}/attendance`);
  return data;
}

export async function getFeesDetail(studentId: string): Promise<FeesDetail> {
  const { data } = await apiClient.get<FeesDetail>(`/students/${studentId}/fees`);
  return data;
}

export async function getExamPrep(studentId: string): Promise<ExamPrep> {
  const { data } = await apiClient.get<ExamPrep>(`/students/${studentId}/exam-prep`);
  return data;
}

export async function getCareerProfile(studentId: string): Promise<CareerProfile> {
  const { data } = await apiClient.get<CareerProfile>(`/students/${studentId}/career`);
  return data;
}

export async function getStudentNotifications(studentId: string): Promise<StudentNotification[]> {
  const { data } = await apiClient.get<StudentNotification[]>(`/students/${studentId}/notifications`);
  return data;
}

export async function getStudentActivity(studentId: string): Promise<StudentActivity[]> {
  const { data } = await apiClient.get<StudentActivity[]>(`/students/${studentId}/activity`);
  return data;
}

export async function getCampusAnnouncements(): Promise<CampusAnnouncement[]> {
  const { data } = await apiClient.get<CampusAnnouncement[]>("/campus/announcements");
  return data;
}
