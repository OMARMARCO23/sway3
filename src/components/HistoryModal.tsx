import { Session } from "../utils/sessionManager";
import { X } from "lucide-react";

export function HistoryModal({ session, onClose }: { session: Session; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 dark:text-gray-300">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Lesson Review
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {new Date(session.timestamp).toLocaleString()} · {session.language.toUpperCase()}
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📄 Lesson Text</h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{session.lessonText}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🤖 AI Summary</h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{session.summary}</p>
          </div>

          {session.exercises && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📝 Exercises</h3>
              <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                {session.exercises.map((ex, idx) => (
                  <li key={idx}>{ex}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
