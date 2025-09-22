import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";

export function ScanLesson() {
  const [lessonText, setLessonText] = useState("");
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  // function to call backend proxy for summary
  const handleAnalyze = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "summary", payload: { text: lessonText } }),
      });
      const data = await res.json();
      if (data.result) {
        setSummary(data.result);
        setMessages([{ role: "model", content: data.result }]);
      } else {
        throw new Error(data.error || "API failed");
      }
    } catch (err) {
      alert("Something went wrong while summarizing.");
    }
    setLoadingSummary(false);
  };

  // simple simulated chat handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    // Temporary fake reply so UI works (replace with real stream API later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "🤖 Thanks for your question! (AI reply here)" },
      ]);
      setStreaming(false);
    }, 1000);
  };

  // Initial state: textarea input
  if (!summary) {
    return (
      <div>
        <textarea
          className="w-full h-40 p-3 border-2 border-dashed rounded-lg dark:bg-gray-800"
          placeholder="Paste your lesson text here..."
          value={lessonText}
          onChange={(e) => setLessonText(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={!lessonText || loadingSummary}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center disabled:opacity-50"
        >
          {loadingSummary ? "Analyzing..." : "Analyze Text"}
          <BrainCircuit className="ml-2 w-5 h-5" />
        </button>
      </div>
    );
  }

  // Summary + chat UI
  return (
    <div className="flex flex-col h-[70vh]">
      <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 shadow p-4 rounded">
          <h2 className="font-semibold mb-2">Your Lesson</h2>
          <p className="whitespace-pre-wrap text-sm">{lessonText}</p>
        </div>
        <div className="bg-blue-50 dark:bg-gray-700 shadow p-4 rounded">
          <h2 className="font-semibold mb-2">AI Summary</h2>
          <p className="whitespace-pre-wrap text-sm">{summary}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 border dark:border-gray-600 rounded">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} role={m.role} content={m.content} />
        ))}
        {streaming && <TypingIndicator />}
      </div>

      <form onSubmit={handleSend} className="mt-2 flex">
        <input
          className="flex-1 border rounded-l px-3 py-2 dark:bg-gray-800 dark:text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your lesson..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </form>
    </div>
  );
}