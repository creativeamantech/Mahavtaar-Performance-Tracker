import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import CityPivot from "./pages/CityPivot";
import TeamPivot from "./pages/TeamPivot";
import CityTeamMatrix from "./pages/CityTeamMatrix";
import DataExplorer from "./pages/DataExplorer";
import SettingsPage from "./pages/Settings";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";
import { PermissionGate } from "./components/PermissionGate";
import { VIEWS } from "./constants/permissions";

function ProtectedRoute({ children, view }: { children: React.ReactNode; view?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (view) return <PermissionGate view={view} fallback={<Navigate to="/dashboard" replace />}>{children}</PermissionGate>;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute view={VIEWS.DASHBOARD}><Dashboard /></ProtectedRoute>} />
      <Route path="/data-entry" element={<ProtectedRoute view={VIEWS.DATA_ENTRY}><DataEntry /></ProtectedRoute>} />
      <Route path="/explorer" element={<ProtectedRoute view={VIEWS.DATA_EXPLORER}><DataExplorer /></ProtectedRoute>} />
      <Route path="/city-pivot" element={<ProtectedRoute view={VIEWS.CITY_PIVOT}><CityPivot /></ProtectedRoute>} />
      <Route path="/team-pivot" element={<ProtectedRoute view={VIEWS.TEAM_PIVOT}><TeamPivot /></ProtectedRoute>} />
      <Route path="/matrix" element={<ProtectedRoute view={VIEWS.CITY_TEAM_MATRIX}><CityTeamMatrix /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute view={VIEWS.SETTINGS}><SettingsPage /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute view={VIEWS.AUDIT_LOG}><AuditLog /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
  <AuthProvider>
    <DataProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </AuthProvider>
  </ThemeProvider>
);

export default App;
