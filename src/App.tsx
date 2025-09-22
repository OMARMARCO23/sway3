import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ScanLesson } from "./pages/ScanLesson";
import { ScanHomework } from "./pages/ScanHomework";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { BottomNav } from "./components/BottomNav";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 shadow-md z-10">
      <div className="p-4 text-white font-bold text-xl">SWAY3</div>
    </header>
  );
}

export function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 pb-20 px-4">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan-lesson" element={<ScanLesson />} />
            <Route path="/scan-homework" element={<ScanHomework />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}