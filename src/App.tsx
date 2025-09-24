import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ScanLesson } from "./pages/ScanLesson";
import { ScanHomework } from "./pages/ScanHomework";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { BottomNav } from "./components/BottomNav";

function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md fixed top-0 left-0 right-0 z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center font-bold text-xl text-white">
          <img src="/logo.png" alt="SWAY3" className="w-8 h-8 mr-2" />
          SWAY3
        </div>
        <nav className="hidden md:flex space-x-6 text-white">
          <a href="#/dashboard" className="hover:text-emerald-300">Dashboard</a>
          <a href="#/scan-lesson" className="hover:text-emerald-300">Scan Lesson</a>
          <a href="#/scan-homework" className="hover:text-emerald-300">Homework</a>
          <a href="#/history" className="hover:text-emerald-300">History</a>
          <a href="#/settings" className="hover:text-emerald-300">Settings</a>
        </nav>
      </div>
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
