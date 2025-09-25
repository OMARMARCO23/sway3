import React, { useState } from "react";
import { BrainCircuit, Upload } from "lucide-react";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { saveSession } from "../utils/sessionManager";
import { apiFetch } from "../utils/api";

export function ScanLesson(): JSX.Element {
  const [lessonText, setLessonText] = useState("");
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  const { language } = useLanguage();
  const { showToast, ToastContainer } = useToast();

  // OCR (uses CDN Tesseract loaded in index.html)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingOCR(true);
    try {
      // @ts-ignore
      const Tesseract = (window as any).Tesseract;
      if (!Tesseract) throw new Error("Tesseract not loaded (make sure CDN script in index.html)");
      const lang = language === "fr" ? "fra" : language === "ar" ? "ara" : "eng";
      const result = await Tesseract.recognize(file, lang, { logger: (m: any) => console.log("Tesseract", m) });
      const text = result?.data?.text ?? "";
      setLessonText(text);
      showToast(language === "fr" ? "Texte extrait (OCR) !" : language === "ar" ? "تم استخراج النص (OCR)!" : "OCR text extracted!", "success");
    } catch (err) {
      console.error("OCR failed:", err);
      showToast(language === "fr" ? "OCR a échoué." : language === "ar" ? "فشل OCR." : "OCR failed. Please try again.", "error");
    } finally {
      setLoadingOCR(false);
    }
  };

  // Summarize (AI)
  const handleAnalyze = async () => {
    if (!lessonText.trim()) {
      showToast(language === "fr" ? "Veuillez saisir ou scanner un texte." : language === "ar" ? "الرجاء إدخال أو مسح نص." : "Please paste or scan a lesson text first.", "error");
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "summary", payload: { text: lessonText, language } }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned non-JSON response");
      }

      if (!res.ok) {
        const errMsg = data?.error ?? "Server error";
        throw new Error(errMsg);
      }

      if (data.result) {
        setSummary(data.result);
        setMessages([{ role: "model", content: data.result }]);
        localStorage.setItem("lastLessonText", lessonText);
        localStorage.setItem("lastLessonLang", language);
        setShowSaveButton(true);
        showToast(language === "fr" ? "Leçon analysée — enregistrez si vous voulez." : language === "ar" ? "تم تحليل الدرس - احفظه إن أردت." : "Lesson analyzed — save if you want.", "success");
      } else {
        throw new Error(data.error || "No result");
      }
    } catch (err: any) {
      console.error("Analyze error:", err);
      showToast(language === "fr" ? "Erreur lors de l'analyse." : language === "ar" ? "حدث خطأ أثناء التحليل." : "Error analyzing lesson.", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Chat using lesson context
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    const userMsg = { role: "user" as const, content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "chat", payload: { question, context: lessonText, language } }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned non-JSON response");
      }

      if (!res.ok) {
        const errMsg = data?.error ?? "Server error";
        throw new Error(errMsg);
      }

      setMessages((prev) => [...prev, { role: "model", content: data.result ?? (language === "fr" ? "Aucune réponse." : language === "ar" ? "لا توجد استجابة." : "No response from AI.") }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "model", content: language === "fr" ? "Erreur du chat." : language === "ar" ? "خطأ في المحادثة." : "Chat failed." }]);
      showToast(language === "fr" ? "Erreur de chat" : language === "ar" ? "فشل الدردشة" : "Chat failed", "error");
    } finally {
      setStreaming(false);
    }
  };

  // Save explicit session
  const handleSaveSession = () => {
    const newSession = {
      id: (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}`),
      timestamp: Date.now(),
      lessonText,
      summary,
      exercises: undefined,
      language,
    };
    try {
      saveSession(newSession);
      setShowSaveButton(false);
      showToast(language === "fr" ? "📚 Enregistré dans l'historique" : language === "ar" ? "📚 تم الحفظ في السجل" : "📚 Saved to history", "success");
    } catch (err) {
      console.error("Save session failed", err);
      showToast(language === "fr" ? "Échec de l'enregistrement" : language === "ar" ? "فشل الحفظ" : "Failed to save session", "error");
    }
  };

  // -------- UI ----------
  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">📷 {language === "fr" ? "Scanner ou coller votre leçon" : language === "ar" ? "امسح أو الصق الدرس" : "Scan or Paste Your Lesson"}</h1>

        <label className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <Upload className="w-6 h-6 mr-2 text-blue-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{language === "fr" ? "Télécharger une image (OCR)" : language === "ar" ? "حمّل صورة (OCR)" : "Upload an image (OCR)"}</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>

        {loadingOCR && <p className="mt-2 text-sm text-blue-500">{language === "fr" ? "Extraction du texte…" : language === "ar" ? "جار استخراج النص..." : "Extracting text…"}</p>}

        <textarea
          className="w-full h-40 p-3 mt-4 border rounded-lg text-gray-800 dark:text-gray-200 dark:bg-gray-900"
          placeholder={language === "fr" ? "Ou collez votre texte ici…" : language === "ar" ? "أو الصق نص الدرس هنا…" : "Or paste your lesson text here…"}
          value={lessonText}
          onChange={(e) => setLessonText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={!lessonText || loadingSummary}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {loadingSummary ? (language === "fr" ? "Analyse…" : language === "ar" ? "جار التحليل…" : "Analyzing…") : (language === "fr" ? "Analyser la leçon" : language === "ar" ? "حلل النص" : "Analyze Lesson")}
          <BrainCircuit className="ml-2 w-5 h-5 inline" />
        </button>

        <ToastContainer />
      </div>
    );
  }

  // After summary: show summary, Save to history button and chat
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">📄 {language === "fr" ? "Texte de la leçon" : language === "ar" ? "نص الدرس" : "Lesson Text"}</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{lessonText}</p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-gray-700 rounded shadow">
          <h2 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">🤖 {language === "fr" ? "Résumé IA" : language === "ar" ? "ملخص الذكاء الاصطناعي" : "AI Explanation"}</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{summary}</p>
        </div>
      </div>

      {showSaveButton && (
        <button
          onClick={handleSaveSession}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded shadow"
        >
          {language === "fr" ? "+ Enregistrer l'historique" : language === "ar" ? "+ احفظ في السجل" : "+ Save to History"}
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
            placeholder={language === "fr" ? "Posez une question…" : language === "ar" ? "اطرح سؤالاً…" : "Ask a question…"}
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
