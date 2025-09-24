import { useEffect, useState } from "react";
import { loadSessions, Session, clearSessions } from "../utils/sessionManager";
import { Clock, BookOpen, Trash2 } from "lucide-react";
import { HistoryModal } from "../components/HistoryModal";

export function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const handleClear = () => {
    if (confirm("Clear all history?")) {
      clearSessions();
      setSessions([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📚 Learning History</h1>
        {sessions.length > 0 && (
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No sessions yet. Scan a lesson to start!</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold flex items-center text-gray-900 dark:text-gray-100">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                  {s.lessonText.substring(0, 40)}…
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(s.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">AI Summary: {s.summary.substring(0, 80)}…</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && <HistoryModal session={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
