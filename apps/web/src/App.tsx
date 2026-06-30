import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAdmin, RequireAiRole, RequireAuth, RequirePrivileged } from "./auth/RequireAuth";
import { AppLayout } from "./layout/AppLayout";
import { AskPage } from "./pages/AskPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ImportsPage } from "./pages/ImportsPage";
import { LoginPage } from "./pages/LoginPage";
import { RiskBoardPage } from "./pages/RiskBoardPage";
import { RiskConfigPage } from "./pages/RiskConfigPage";
import { StudentPage } from "./pages/StudentPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/board" element={<RiskBoardPage />} />
          <Route path="/students/:studentId" element={<StudentPage />} />
          <Route element={<RequireAiRole />}>
            <Route path="/ask" element={<AskPage />} />
          </Route>
          <Route element={<RequirePrivileged />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route element={<RequireAdmin />}>
            <Route path="/config" element={<RiskConfigPage />} />
            <Route path="/imports" element={<ImportsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/board" replace />} />
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
