import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  MessageSquare,
  Scan,
  Settings,
} from "lucide-react";

export function BottomNav() {
  const items = [
    { to: "/dashboard", label: "Home", Icon: Home },
    { to: "/scan-lesson", label: "Lesson", Icon: BookOpen },
    { to: "/ask-ai", label: "Ask AI", Icon: MessageSquare },
    { to: "/scan-homework", label: "Homework", Icon: Scan },
    { to: "/settings", label: "Settings", Icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 shadow-lg"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)", // safe area for devices with a home indicator
        backdropFilter: "saturate(180%) blur(8px)",
      }}
      aria-label="Bottom Navigation"
    >
      <div className="flex justify-around py-2">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs px-2 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-300"
              }`
            }
            aria-label={label}
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
