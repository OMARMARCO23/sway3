import React from "react";
import { Link } from "react-router-dom";
import { Camera, BookOpen, MessageSquare, FileClock, Settings, ArrowRight } from "lucide-react";
import { useSession } from "../contexts/SessionContext";

export function Dashboard() {
  const { current } = useSession();

  const quickActions = [
    { to: "/scan-lesson", label: "Scan Lesson", Icon: Camera, color: "from-indigo-500 via-indigo-400 to-indigo-300" },
    { to: "/ask-ai", label: "Ask AI", Icon: MessageSquare, color: "from-fuchsia-500 via-pink-400 to-rose-300" },
  ];

  const features = [
    {
      to: "/scan-lesson",
      Icon: BookOpen,
      title: "Scan Lesson",
      desc: "Camera or image → OCR → clear AI explanation.",
      color: "from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
    },
    {
      to: "/ask-ai",
      Icon: MessageSquare,
      title: "Ask AI (Study Only)",
      desc: "Academic Q&A, strictly on-topic.",
      color: "from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600",
    },
    {
      to: "/history",
      Icon: FileClock,
      title: "History",
      desc: "Revisit saved sessions anytime.",
      color: "from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
    },
    {
      to: "/settings",
      Icon: Settings,
      title: "Settings",
      desc: "Theme, language, privacy, and more.",
      color: "from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero (neutral, no blue background) */}
      <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
        <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-fuchsia-300/30 to-indigo-300/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-rose-300/30 to-cyan-300/30 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-wide">
            SWAY3 — Learn faster, practice smarter
          </h1>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
            Scan lessons for clear AI explanations, ask study‑only questions, and practice with exercises.
            Multilingual and mobile‑friendly.
          </p>

          {/* Quick actions (compact gradient pills) */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
            {quickActions.map(({ to, label, Icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center justify-center gap-2 rounded-lg bg-gradient-to-tr ${color} text-white py-2 text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Last session preview (kept) */}
          {current && (
            <Link
              to="/history"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-white/10 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:bg-gray-200 dark:hover:bg-white/15"
              title="Open History"
            >
              <span className="truncate">
                Last session:{" "}
                <em className="opacity-80">
                  {current.summary.slice(0, 70)}
                  {current.summary.length > 70 ? "…" : ""}
                </em>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Feature grid (smaller cards, colorful borders) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ to, Icon, title, desc, color }) => (
          <Link
            key={to}
            to={to}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${color} p-[1px] shadow-md transition-transform hover:-translate-y-0.5 focus:outline-none`}
          >
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
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-white/30 to-transparent blur-md" />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
