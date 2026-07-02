import { useNavigate } from "react-router-dom";

import { STUDENT_PATHS } from "@/routes/paths";

export function useStudentNav() {
  const navigate = useNavigate();

  return {
    toMyDay: () => navigate(STUDENT_PATHS.myDay),
    toAcademics: () => navigate(STUDENT_PATHS.academics),
    toTimetable: () => navigate(STUDENT_PATHS.timetable),
    toAssignments: () => navigate(STUDENT_PATHS.assignments),
    toAttendance: () => navigate(STUDENT_PATHS.attendance),
    toExamPrep: () => navigate(STUDENT_PATHS.examPrep),
    toFees: () => navigate(STUDENT_PATHS.fees),
    toCareer: () => navigate(STUDENT_PATHS.career),
    toAi: (params?: Record<string, string>) => {
      const search = params ? `?${new URLSearchParams(params).toString()}` : "";
      navigate(`${STUDENT_PATHS.ai}${search}`);
    },
    toArtifacts: () => navigate(STUDENT_PATHS.artifacts),
  };
}
