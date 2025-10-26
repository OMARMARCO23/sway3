import React from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  BookOpen,
  MessageSquare,
  Scan,
  FileClock,
  Settings,
  ArrowRight,
} from "lucide-react";
import { useSession } from "../contexts/SessionContext";

export function Dashboard() {
  const { current } = useSession();

  const quickActions = [
    {
      to: "/scan-lesson",
      label: "Scan Lesson",
      Icon: Camera,
      color:
        "from-indigo-500 via-indigo-400 to-indigo-300 text-white shadow-indigo-300/40",
    },
    {
      to: "/ask-ai",
      label: "Ask AI",
      Icon: MessageSquare,
      color:
        "from-rose-500 via-pink-400 to-fuchsia-300 text-white shadow-rose-300/40",
    },
    {
      to: "/scan-homework",
      label: "Homework",
      Icon: Scan,
      color:
        "from-emerald-500 via-teal-400 to-cyan-300 text-white shadow-emerald-300/40",
    },
  ];

  const features = [
    {
      to: "/scan-lesson",
      Icon: BookOpen,
      title: "Scan Lesson",
      desc: "Camera or upload → OCR → clear AI explanation.",
      color:
        "from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
    },
    {
      to: "/ask-ai",
      Icon: MessageSquare,
      title: "Ask AI (Study Only)",
      desc: "Academic Q&A, focused and on-topic.",
      color:
        "from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600",
    },
    {
      to: "/scan-homework",
      Icon: Scan,
      title: "Homework",
      desc: "Generate exercises linked to your lesson.",
      color:
        "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
    },
    {
      to: "/history",
      Icon: FileClock,
      title: "History",
      desc: "Revisit saved sessions anytime.",
      color:
        "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
    },
    {
      to: "/settings",
      Icon: Settings,
      title: "Settings",
      desc: "Theme, language, privacy, and more.",
      color:
        "from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-6 sm:p-8 shadow-lg">
        <div className="absolute -top-16 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            SWAY3 — Learn faster, practice smarter
          </h1>
          <p className="text-white/90 leading-relaxed max-w-2xl">
            Scan lessons for clean AI explanations, ask study‑only questions, and
            practice with exercises. Multilingual and mobile‑friendly.
          </p>

          {/* Quick actions */}
          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
            {quickActions.map(({ to, label, Icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center justify-center gap-2 rounded-lg bg-gradient-to-tr ${color} py-2 text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Last session preview */}
          {current && (
            <Link
              to="/history"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/20 hover:bg-white/20"
              title="Open History"
            >
              <span className="truncate">
                Last session:{" "}
                <em className="opacity-90">
                  {current.summary.slice(0, 70)}
                  {current.summary.length > 70 ? "…" : ""}
                </em>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Feature grid (compact, colorful cards) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ to, Icon, title, desc, color }) => (
          <Link
            key={to}
            to={to}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${color} p-[1px] shadow-md transition-transform hover:-translate-y-0.5 focus:outline-none`}
          >
            {/* Inner card */}
            <div className="h-full rounded-xl bg-white/95 p-4 backdrop-blur dark:bg-gray-900/95">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-white/70 to-white/30 shadow-sm ring-1 ring-black/5 dark:from-white/10 dark:to-white/5 dark:ring-white/10">
                  <Icon className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                    {desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Glow on hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-white/30 to-transparent blur-md" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
