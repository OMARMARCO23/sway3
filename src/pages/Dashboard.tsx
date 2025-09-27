import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Scan, FileClock, Settings, MessageSquare } from "lucide-react";

const features = [
  {
    to: "/scan-lesson",
    Icon: BookOpen,
    title: "Scan Lesson",
    desc: "Upload a photo or paste text, let AI explain simply for you.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    to: "/scan-homework",
    Icon: Scan,
    title: "Homework Practice",
    desc: "Generate exercises and test your understanding.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    to: "/history",
    Icon: FileClock,
    title: "History",
    desc: "Review previous study sessions and track your progress.",
    color: "from-purple-500 to-pink-500",
  },
  {
    to: "/settings",
    Icon: Settings,
    title: "Settings",
    desc: "Switch theme, language, and customize your experience.",
    color: "from-orange-500 to-red-500",
  },
  {
    to: "/ask-ai",
    Icon: MessageSquare,
    title: "Ask AI (Study Only)",
    desc: "Ask academic questions without scanning a lesson.",
    color: "from-indigo-500 to-violet-500",
  },
];

export function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        👋 Welcome back!
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {features.map(({ to, Icon, title, desc, color }) => (
          <Link
            key={to}
            to={to}
            className={`
              group relative p-6 rounded-xl shadow-md
              bg-gradient-to-r ${color} text-white
              transform transition duration-200 hover:-translate-y-1 hover:shadow-lg
            `}
          >
            {/* Overlay ensures readability on all gradients */}
            <div className="absolute inset-0 rounded-xl bg-black/20 group-hover:bg-black/10"></div>

            <div className="relative">
              <Icon className="w-10 h-10 mb-3 text-white opacity-90" />
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm text-gray-100/90">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
