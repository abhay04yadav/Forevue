import { useQuery } from "@tanstack/react-query";

import { getFacultyDashboard } from "@/api/faculty";

export function useFacultyDashboard() {
  return useQuery({
    queryKey: ["faculty-dashboard"],
    queryFn: getFacultyDashboard,
  });
}
