import { useState, useEffect } from "react";
import { Loader2, BookOpenCheck } from "lucide-react";

// We'll pull lesson text from localStorage (set after ScanLesson)
function getLastLesson() {
  return localStorage.getItem("lastLessonText") || "";
}

interface Exercise {
  question: string;
  aiAnswer?: string;
  studentAnswer?: string;
  checking?: boolean;
}

export function ScanHomework() {
  const [lessonText, setLessonText] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  /** Load last scanned lesson */
  useEffect(() => {
    setLessonText(getLastLesson());
  }, []);

  /** Generate exercises from AI */
  const handleGenerateExercises = async () => {
    if (!lessonText) {
      alert("No lesson found. Please scan a lesson first!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "exercises",
          payload: {
            text: lessonText,
            language: "en", // later we connect to Settings.lang
          },
        }),
      });
      const data = await res.json();
      if (data.result) {
        // Expect result as multiline questions
        const list = data.result
          .split("\n")
          .filter((line: string) => line.trim().length > 2)
          .map((q: string) => ({ question: q.trim() }));
        setExercises(list);
      } else {
        throw new Error(data.error || "No exercises returned.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate exercises.");
    }
    setLoading(false);
  };

  /** Check a student answer with AI */
  const handleCheckAnswer = async (index: number) => {
    const ex = exercises[index];
    if (!ex.studentAnswer) return;

    setExercises((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, checking: true } : e
      )
    );

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "checkAnswer",
          payload: {
            question: ex.question,
            studentAnswer: ex.studentAnswer,
          },
        }),
      });
      const data = await res.json();
      setExercises((prev) =>
        prev.map((e, i) =>
          i === index
            ? { ...e, checking: false, aiAnswer: data.result }
            : e
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to check answer.");
      setExercises((prev) =>
        prev.map((e, i) =>
          i === index ? { ...e, checking: false } : e
        )
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Homework Practice</h1>

      {!exercises.length ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="mb-2">Generate exercises from your last lesson.</p>
          <button
            onClick={handleGenerateExercises}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <>
                Generating…
                <Loader2 className="ml-2 w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                Generate Exercises
                <BookOpenCheck className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow"
            >
              <p className="font-medium mb-2">{ex.question}</p>
              <input
                type="text"
                value={ex.studentAnswer || ""}
                onChange={(e) =>
                  setExercises((prev) =>
                    prev.map((en, i) =>
                      i === index
                        ? { ...en, studentAnswer: e.target.value }
                        : en
                    )
                  )
                }
                placeholder="Type your answer…"
                className="w-full border rounded px-3 py-2 mb-2 dark:bg-gray-900 dark:text-white"
              />
              <button
                onClick={() => handleCheckAnswer(index)}
                disabled={ex.checking}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {ex.checking ? "Checking…" : "Check Answer"}
              </button>

              {ex.aiAnswer && (
                <div className="mt-2 pl-3 border-l-4 border-green-500 text-sm">
                  <p>{ex.aiAnswer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
