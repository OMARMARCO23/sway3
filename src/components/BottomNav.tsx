import { NavLink } from "react-router-dom";
import { Home, Scan, FileClock, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Home", Icon: Home },
  { to: "/scan-homework", label: "Homework", Icon: Scan },
  { to: "/history", label: "History", Icon: FileClock },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg flex justify-around py-2">
      {navItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center text-sm ${
              isActive ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
            }`
          }
        >
          <Icon className="w-6 h-6" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}