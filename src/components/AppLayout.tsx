import React from "react";
import { NavLink } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Upper App Bar */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          {/* Brand */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="SWAY3"
              className="w-8 h-8 mr-2"
              onError={(e) => {
                // fallback if logo not found
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-white font-bold text-xl tracking-wide">SWAY3</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-white">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `hover:text-emerald-300 ${isActive ? "text-emerald-200 font-semibold" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/scan-lesson"
              className={({ isActive }) =>
                `hover:text-emerald-300 ${isActive ? "text-emerald-200 font-semibold" : ""}`
              }
            >
              Scan Lesson
            </NavLink>
            <NavLink
              to="/ask-ai"
              className={({ isActive }) =>
                `hover:text-emerald-300 ${isActive ? "text-emerald-200 font-semibold" : ""}`
              }
            >
              Ask AI
            </NavLink>
            <NavLink
              to="/scan-homework"
              className={({ isActive }) =>
                `hover:text-emerald-300 ${isActive ? "text-emerald-200 font-semibold" : ""}`
              }
            >
              Homework
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `hover:text-emerald-300 ${isActive ? "text-emerald-200 font-semibold" : ""}`
              }
            >
              History
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `hover:text-emerald-300 ${isActive ? "text-emerald-200 font-semibold" : ""}`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main
        className="pt-20 pb-24 px-4 max-w-6xl mx-auto"
        style={{
          // extra room for devices with a home indicator
          paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
