import { useState } from "react";
import { BrainCircuit, Upload } from "lucide-react";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { saveSession } from "../utils/sessionManager";

export function ScanLesson() {
  const [lessonText, setLessonText] = useState("");
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false); // ✅ control Save button

  const { language } = useLanguage();
  const { showToast, ToastContainer } = useToast();

  /** 📸 OCR from Image (using Tesseract via CDN script in index.html) */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingOCR(true);
    try {
      // @ts-ignore
      const result = await (window as any).Tesseract.recognize(
        file,
        language === "fr" ? "fra" : language === "ar" ? "ara" : "eng"
      );
      setLessonText(result.data.text);
      showToast("✅ OCR text extracted!", "success");
    } catch (err) {
      console.error("OCR failed:", err);
      showToast("❌ OCR failed, please try again", "error");
    }
    setLoadingOCR(false);
  };

  /** 📘 Analyze Lesson with Gemini */
  const handleAnalyze = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "summary", payload: { text: lessonText, language } })
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server did not return JSON");
      }

      if (data.result) {
        setSummary(data.result);
        setMessages([{ role: "model", content: data.result }]);
        localStorage.setItem("lastLessonText", lessonText);
        localStorage.setItem("lastLessonLang", language);

        setShowSaveButton(true); // ✅ show button after AI summary
        showToast("✅ Lesson analyzed! Save to History?", "success");
      } else {
        throw new Error(data.error || "AI failed");
      }
    } catch (err) {
      console.error("Analyze error:", err);
      showToast("❌ Error analyzing lesson", "error");
    }
    setLoadingSummary(false);
  };

  /** 💬 Chat after summary */
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
        body: JSON.stringify({ task: "chat", payload: { question: input, context: lessonText, language } })
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server non‑JSON");
      }

      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.result || "⚠️ no AI response" }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      showToast("❌ Chat failed", "error");
      setMessages((prev) => [...prev, { role: "model", content: "⚠️ Chat failed." }]);
    }

    setStreaming(false);
  };

  /** ✨ Initial state */
  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          📷 Scan or Paste Your Lesson
        </h1>

        <label className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <Upload className="w-6 h-6 mr-2 text-blue-500" />
          <span className="text-sm">Upload an image (OCR in {language.toUpperCase()})</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {loadingOCR && <p className="mt-2 text-sm text-blue-500">Extracting text…</p>}

        <textarea
          className="w-full h-40 p-3 mt-4 border rounded-lg text-gray-800 dark:text-gray-200 dark:bg-gray-900"
          placeholder="Or paste your lesson text here…"
          value={lessonText}
          onChange={(e) => setLessonText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={!lessonText || loadingSummary}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loadingSummary ? "Analyzing…" : "Analyze Lesson"}
          <BrainCircuit className="ml-2 w-5 h-5 inline" />
        </button>

        <ToastContainer />
      </div>
    );
  }

  /** After summary — show lesson + explanation + save button + chat */
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📄 Lesson Text</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{lessonText}</p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-gray-700 rounded shadow">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🤖 AI Explanation</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{summary}</p>
        </div>
      </div>

      {/* ✅ Button to save session */}
      {showSaveButton && (
        <button
          onClick={() => {
            const newSession = {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              lessonText,
              summary,
              language,
            };
            saveSession(newSession);
            setShowSaveButton(false);
            showToast("📚 Saved to history!", "success");
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded shadow"
        >
          + Save to History
        </button>
      )}

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-[50vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
          {streaming && <TypingIndicator />}
        </div>
        <form onSubmit={handleSend} className="mt-2 flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-gray-800 dark:text-gray-200 dark:bg-gray-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a question (${language.toUpperCase()})…`}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r">
            Send
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}
