import { useQuery } from "@tanstack/react-query";

import {
  getAssignments,
  getAttendanceDetail,
  getCampusAnnouncements,
  getCareerProfile,
  getExamPrep,
  getFeesDetail,
  getStudentActivity,
  getStudentDashboard,
  getStudentNotifications,
  getTimetable,
} from "@/api/student-dashboard";
import { useAuth } from "@/auth";

export function useStudentId(): string | undefined {
  const { user } = useAuth();
  const envStudentId = import.meta.env.VITE_DEMO_STUDENT_ID as string | undefined;
  return user?.studentId ?? envStudentId;
}

export function useStudentDashboard() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-dashboard", studentId],
    queryFn: () => getStudentDashboard(studentId!),
    enabled: !!studentId,
  });
}

export function useStudentTimetable(date?: string) {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-timetable", studentId, date],
    queryFn: () => getTimetable(studentId!, date),
    enabled: !!studentId,
  });
}

export function useStudentAssignments(status?: string) {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-assignments", studentId, status],
    queryFn: () => getAssignments(studentId!, status),
    enabled: !!studentId,
  });
}

export function useStudentAttendance() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-attendance-detail", studentId],
    queryFn: () => getAttendanceDetail(studentId!),
    enabled: !!studentId,
  });
}

export function useStudentFees() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-fees", studentId],
    queryFn: () => getFeesDetail(studentId!),
    enabled: !!studentId,
  });
}

export function useStudentExamPrep() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-exam-prep", studentId],
    queryFn: () => getExamPrep(studentId!),
    enabled: !!studentId,
  });
}

export function useStudentCareer() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-career", studentId],
    queryFn: () => getCareerProfile(studentId!),
    enabled: !!studentId,
  });
}

export function useStudentNotifications() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-notifications", studentId],
    queryFn: () => getStudentNotifications(studentId!),
    enabled: !!studentId,
  });
}

export function useStudentActivity() {
  const studentId = useStudentId();
  return useQuery({
    queryKey: ["student-activity", studentId],
    queryFn: () => getStudentActivity(studentId!),
    enabled: !!studentId,
  });
}

export function useCampusAnnouncements() {
  return useQuery({
    queryKey: ["campus-announcements"],
    queryFn: getCampusAnnouncements,
  });
}

export function useOpenAssignmentCount() {
  const q = useStudentAssignments("open");
  return q.data?.open_count ?? 0;
}
