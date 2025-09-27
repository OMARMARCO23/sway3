import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { ScanLesson } from "./pages/ScanLesson";
import { ScanHomework } from "./pages/ScanHomework";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { AskAI } from "./pages/AskAI";

export function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan-lesson" element={<ScanLesson />} />
          <Route path="/scan-homework" element={<ScanHomework />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ask-ai" element={<AskAI />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
