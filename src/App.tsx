import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ScanLesson } from "./pages/ScanLesson";
import { ScanHomework } from "./pages/ScanHomework";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { AppLayout } from "./components/AppLayout";

export function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan-lesson" element={<ScanLesson />} />
          <Route path="/scan-homework" element={<ScanHomework />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
