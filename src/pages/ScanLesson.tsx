import { useState } from "react";
import { BrainCircuit, Upload } from "lucide-react";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import Tesseract from "tesseract.js";

export function ScanLesson() {
  const [lessonText, setLessonText] = useState("");
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
// Inside ScanLesson.tsx
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { createWorker } = await import("tesseract.js"); // 👈 lazy load
    // or: const Tesseract = await import("tesseract.js");

    const { data: { text } } = await (await import("tesseract.js")).default.recognize(file, "eng");
    setLessonText(text);
  };
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(file, "eng");
      setLessonText(result.data.text);
    } catch (err) {
      console.error(err);
      alert("OCR failed. Try again.");
    }
  };
  /** 📸 Step 1. OCR Extract from Image */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingOCR(true);
    try {
      const result = await Tesseract.recognize(file, "eng");
      setLessonText(result.data.text);
    } catch (err) {
      alert("OCR failed. Try again.");
      console.error(err);
    }
    setLoadingOCR(false);
  };

  /** 📘 Step 2. Send OCR text to AI for Explanation */
  const handleAnalyze = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "summary", payload: { text: lessonText, language: "en" } }),
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
      console.error(err);
    }
    setLoadingSummary(false);
  };

  /** 💬 Step 3. AI Chat after summary */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "chat", payload: { question: input, context: lessonText, language: "en" } }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", content: data.result || "⚠️ AI did not respond." }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "model", content: "⚠️ Chat failed." }]);
    }
    setStreaming(false);
  };

  /** ✨ Initial State: choose how to input */
  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4">Scan or Paste Your Lesson</h1>

        <label className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <Upload className="w-6 h-6 mr-2 text-blue-500" />
          <span className="text-sm">Click to upload an image (English only for now)</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {loadingOCR && <p className="mt-2 text-sm text-blue-500">Extracting text from image…</p>}

        <textarea
          className="w-full h-40 p-3 mt-4 border rounded-lg dark:bg-gray-900"
          placeholder="Or paste your lesson text here…"
          value={lessonText}
          onChange={(e) => setLessonText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={!lessonText || loadingSummary}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loadingSummary ? "Analyzing…" : "Analyze Lesson"}
        </button>
      </div>
    );
  }

  /** ✨ After summary: show results + chat */
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">📄 Your Lesson</h2>
          <p className="whitespace-pre-wrap text-sm">{lessonText}</p>
        </div>
        <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded shadow">
          <h2 className="font-semibold mb-2">🤖 AI Explanation</h2>
          <p className="whitespace-pre-wrap text-sm">{summary}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-[50vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
          {streaming && <TypingIndicator />}
        </div>
        <form onSubmit={handleSend} className="mt-2 flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 dark:bg-gray-900 dark:text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this lesson…"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
