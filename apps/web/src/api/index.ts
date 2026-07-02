export { apiClient, API_BASE_URL, setOnAuthExpired } from "./client";
export { login, logout } from "./auth";
export { getMe, type MeResponse } from "./me";
export { queryClient } from "./query-client";
export { askQuestion, type AskRequest, type AskResponse } from "./ai";
export {
  getRiskSummary,
  getRiskSummaryByDepartment,
  getStudentRisk,
  listAtRiskStudents,
  listRiskAlerts,
  markRiskAlertRead,
  type AtRiskStudentFilters,
} from "./risk";
export { getStudent360 } from "./students";
export {
  getStudentDashboard,
  getTimetable,
  getAssignments,
  getAttendanceDetail,
  getExamPrep,
  getCareerProfile,
  getStudentNotifications,
  getStudentActivity,
  getCampusAnnouncements,
} from "./student-dashboard";
export type {
  AlertResponse,
  AttendanceSummary,
  AtRiskStudentResponse,
  LoginRequest,
  RiskAssessmentResponse,
  RiskFindingResponse,
  RiskSummaryByDepartmentResponse,
  RiskSummaryResponse,
  Student360Response,
  StudentRiskDetailResponse,
  TokenResponse,
} from "./types";
