import { FileClock, BookOpen, Scan } from "lucide-react";

const mockHistory = [
  { type: "Lesson", title: "Biology - Cells", time: "2 days ago", Icon: BookOpen },
  { type: "Homework", title: "Physics Q&A", time: "5 days ago", Icon: Scan },
  { type: "Lesson", title: "Algebra II - Chapter 3", time: "1 week ago", Icon: BookOpen },
];

export function History() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">History</h1>
      <div className="space-y-4">
        {mockHistory.map(({ type, title, time, Icon }, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center">
            <Icon className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {type} • {time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}