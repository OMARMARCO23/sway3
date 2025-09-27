import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { apiFetch } from "../utils/api";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";

const SUBJECTS = [
  "General",
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "French",
  "Arabic",
  "History",
  "Geography",
  "Computer Science",
];

export function AskAI(): JSX.Element {
  const { language } = useLanguage();
  const { showToast, ToastContainer } = useToast();

  const [subject, setSubject] = useState<string>("General");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [streaming, setStreaming] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "studyChat",
          payload: { question, subject, language },
        }),
      });

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Server returned non-JSON: " + raw.slice(0, 250));
      }

      if (!res.ok) {
        const busy = res.status === 503 || /busy/i.test(data?.error || "");
        showToast(
          busy
            ? language === "fr"
              ? "Le service IA est occupé. Réessayez."
              : language === "ar"
              ? "الخدمة مشغولة. أعد المحاولة."
              : "The AI service is busy. Please try again."
            : language === "fr"
            ? "Erreur de chat."
            : language === "ar"
            ? "خطأ في المحادثة."
            : "Chat failed.",
          "error"
        );
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content:
              data?.error ||
              (language === "fr"
                ? "Erreur."
                : language === "ar"
                ? "حدث خطأ."
                : "An error occurred."),
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "model", content: data.result || "" }]);
    } catch (err) {
      console.error("StudyChat error:", err);
      showToast(
        language === "fr" ? "Erreur de chat." : language === "ar" ? "خطأ في المحادثة." : "Chat failed.",
        "error"
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            language === "fr"
              ? "Erreur. Réessayez un peu plus tard."
              : language === "ar"
              ? "خطأ. حاول لاحقًا."
              : "Error. Please try again later.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {language === "fr" ? "Questions d’étude" : language === "ar" ? "أسئلة دراسية" : "Study Chat"}
      </h1>

      {/* Subject selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center gap-3">
        <label className="text-gray-800 dark:text-gray-200">
          {language === "fr" ? "Sujet:" : language === "ar" ? "المادة:" : "Subject:"}
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-gray-200 dark:bg-gray-700 rounded px-3 py-1 text-gray-800 dark:text-white"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Chat area */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {streaming && <TypingIndicator />}
        </div>

        <form onSubmit={handleSend} className="mt-2 flex">
          <input
            className="flex-1 border rounded-l px-3 py-2 text-gray-800 dark:text-gray-200 dark:bg-gray-900"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === "fr"
                ? "Pose une question (académique seulement)…"
                : language === "ar"
                ? "اسأل سؤالًا (دراسي فقط)…"
                : "Ask a question (study-only)…"
            }
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r">
            {language === "fr" ? "Envoyer" : language === "ar" ? "إرسال" : "Send"}
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}
