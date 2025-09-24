import { BottomNav } from "./BottomNav";
import { useTheme } from "../contexts/ThemeContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md fixed top-0 left-0 right-0 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            {/* Logo + Title */}
            <div className="flex items-center font-bold text-xl text-white">
              <img src="/logosway3.png" alt="SWAY3" className="w-8 h-8 mr-2" />
              SWAY3
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-6 text-white font-medium">
              <a href="#/dashboard" className="hover:text-emerald-300">Dashboard</a>
              <a href="#/scan-lesson" className="hover:text-emerald-300">Scan Lesson</a>
              <a href="#/scan-homework" className="hover:text-emerald-300">Homework</a>
              <a href="#/history" className="hover:text-emerald-300">History</a>
              <a href="#/settings" className="hover:text-emerald-300">Settings</a>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-20 pb-20 px-4 max-w-6xl mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
