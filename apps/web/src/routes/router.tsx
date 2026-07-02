import { createBrowserRouter, Navigate } from "react-router-dom";

import {
  RequireAdmin,
  RequireAuth,
  RequireFaculty,
  RequireHod,
  RequirePlacement,
  RequirePrivileged,
  RequireStaff,
  RequireStudent,
} from "@/auth/guards";
import { ProtectedLayout } from "@/layout/ProtectedLayout";
import { AdminImportsPage } from "@/pages/admin/AdminImportsPage";
import { AdminRiskConfigPage } from "@/pages/admin/AdminRiskConfigPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import { AiWorkspacePage } from "@/pages/AiWorkspacePage";
import { ArtifactWorkspacePage } from "@/pages/ArtifactWorkspacePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FacultyHomePage } from "@/pages/FacultyHomePage";
import {
  FacultyAssessmentGeneratorPage,
  FacultyAssignmentGeneratorPage,
  FacultyCourseProgressPage,
  FacultyCreateHubPage,
  FacultyEmailGeneratorPage,
  FacultyLecturePlannerPage,
  FacultyNoticeGeneratorPage,
  FacultyOfficeHoursPage,
} from "@/pages/faculty/FacultyPages";
import { FacultyTeachingPage } from "@/pages/faculty/FacultyTeachingHubPage";
import { HodDashboardPage } from "@/pages/HodDashboardPage";
import { HodReportsPage } from "@/pages/HodReportsPage";
import { PlacementAnalyticsPage, PlacementReadinessPage } from "@/pages/placement/PlacementPlaceholderPages";
import { PlacementDashboardPage } from "@/pages/PlacementDashboardPage";
import { PlacementDrivesPage } from "@/pages/PlacementDrivesPage";
import { RiskBoardPage } from "@/pages/RiskBoardPage";
import { Student360Page } from "@/pages/Student360Page";
import { StudentAcademicsPage } from "@/pages/StudentAcademicsPage";
import { StudentAssignmentsPage } from "@/pages/StudentAssignmentsPage";
import { StudentAttendancePage } from "@/pages/StudentAttendancePage";
import { StudentCareerPage } from "@/pages/StudentCareerPage";
import { StudentDashboardPage } from "@/pages/StudentDashboardPage";
import { StudentExamPrepPage } from "@/pages/StudentExamPrepPage";
import { StudentFeesPage } from "@/pages/StudentFeesPage";
import { StudentTimetablePage } from "@/pages/StudentTimetablePage";
import { HomeRedirect } from "@/routes/HomeRedirect";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          {
            element: <RequireStudent />,
            children: [
              { path: "my-day", element: <StudentDashboardPage /> },
              { path: "academics", element: <StudentAcademicsPage /> },
              { path: "timetable", element: <StudentTimetablePage /> },
              { path: "assignments", element: <StudentAssignmentsPage /> },
              { path: "attendance", element: <StudentAttendancePage /> },
              { path: "exam-prep", element: <StudentExamPrepPage /> },
              { path: "fees", element: <StudentFeesPage /> },
              { path: "career", element: <StudentCareerPage /> },
            ],
          },
          {
            element: <RequireFaculty />,
            children: [
              { path: "home", element: <FacultyHomePage /> },
              { path: "teaching", element: <FacultyTeachingPage /> },
              { path: "teaching/lecture-planner", element: <FacultyLecturePlannerPage /> },
              { path: "teaching/progress", element: <FacultyCourseProgressPage /> },
              { path: "teaching/office-hours", element: <FacultyOfficeHoursPage /> },
              { path: "create", element: <FacultyCreateHubPage /> },
              { path: "create/assessment", element: <FacultyAssessmentGeneratorPage /> },
              { path: "create/assignment", element: <FacultyAssignmentGeneratorPage /> },
              { path: "create/notice", element: <FacultyNoticeGeneratorPage /> },
              { path: "create/email", element: <FacultyEmailGeneratorPage /> },
            ],
          },
          {
            path: "artifacts/:artifactId?",
            element: <ArtifactWorkspacePage />,
          },
          {
            path: "ai",
            element: <AiWorkspacePage />,
          },
          {
            element: <RequireStaff />,
            children: [
              { path: "board", element: <RiskBoardPage /> },
              { path: "students/:studentId", element: <Student360Page /> },
            ],
          },
          {
            element: <RequireHod />,
            children: [
              { path: "department", element: <HodDashboardPage /> },
              { path: "department/reports", element: <HodReportsPage /> },
            ],
          },
          {
            element: <RequirePlacement />,
            children: [
              { path: "placement", element: <PlacementDashboardPage /> },
              { path: "placement/drives", element: <PlacementDrivesPage /> },
              { path: "placement/readiness", element: <PlacementReadinessPage /> },
              { path: "placement/analytics", element: <PlacementAnalyticsPage /> },
            ],
          },
          {
            element: <RequirePrivileged />,
            children: [{ path: "dashboard", element: <DashboardPage /> }],
          },
          {
            element: <RequireAdmin />,
            children: [
              { path: "admin/config", element: <AdminRiskConfigPage /> },
              { path: "admin/imports", element: <AdminImportsPage /> },
            ],
          },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
