import { BookOpen, Scan, FileClock, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    to: "/scan-lesson",
    Icon: BookOpen,
    title: "Scan Lesson",
    desc: "Upload notes or textbook pages for an AI-powered summary.",
  },
  {
    to: "/scan-homework",
    Icon: Scan,
    title: "Scan Homework",
    desc: "Get hints and step-by-step guidance.",
  },
  {
    to: "/history",
    Icon: FileClock,
    title: "History",
    desc: "Review past sessions and progress.",
  },
  {
    to: "/settings",
    Icon: Settings,
    title: "Settings",
    desc: "Customize the app and preferences.",
  },
];

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome!</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map(({ to, Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 hover:-translate-y-1 transition"
          >
            <Icon className="w-8 h-8 mb-2 text-blue-500" />
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}