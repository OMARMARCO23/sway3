import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";

const sampleQuestions = [
  "What is the powerhouse of the cell?",
  "Explain Newton's third law of motion.",
  "What is the Pythagorean theorem?",
  "Why do we see different phases of the moon?",
];

interface HWItem {
  question: string;
  hint?: string;
  loading: boolean;
  error?: string;
  show: boolean;
}

export function ScanHomework() {
  const [questions, setQuestions] = useState<HWItem[]>(
    sampleQuestions.map((q) => ({
      question: q,
      loading: false,
      show: false,
    }))
  );

  const handleToggleHint = async (index: number) => {
    setQuestions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, show: !item.show } : item
      )
    );

    const item = questions[index];
    // if hint or error already exists, do nothing (just toggling)
    if (item.hint || item.error) return;

    // fetch new hint
    setQuestions((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, loading: true, error: undefined } : it
      )
    );

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "hint",
          payload: { question: item.question },
        }),
      });
      const data = await res.json();

      if (data.result) {
        setQuestions((prev) =>
          prev.map((it, i) =>
            i === index
              ? { ...it, hint: data.result, loading: false, show: true }
              : it
          )
        );
      } else {
        throw new Error(data.error || "No hint returned");
      }
    } catch (err) {
      setQuestions((prev) =>
        prev.map((it, i) =>
          i === index
            ? {
                ...it,
                error: "⚠️ Failed to fetch hint.",
                loading: false,
                show: true,
              }
            : it
        )
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Homework Help</h1>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-4 shadow rounded"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.question}</p>
              <button
                disabled={item.loading}
                onClick={() => handleToggleHint(index)}
                className="flex items-center bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {item.loading ? (
                  <>
                    Getting Hint...
                    <Loader2 className="ml-2 animate-spin w-4 h-4" />
                  </>
                ) : (
                  <>
                    {item.show ? "Hide Hint" : "Get Hint"}
                    <Lightbulb className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {item.show && (
              <div className="mt-3 pl-4 border-l-4 border-yellow-400">
                {item.loading && (
                  <p className="text-sm text-gray-500">Loading...</p>
                )}
                {item.error && (
                  <p className="text-sm text-red-500">{item.error}</p>
                )}
                {item.hint && !item.loading && !item.error && (
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {item.hint}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}