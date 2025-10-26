import React, { useRef, useState } from "react";
import { BrainCircuit, Upload, Camera as CameraIcon } from "lucide-react";
import { ChatMessage } from "../components/ChatMessage";
import { TypingIndicator } from "../components/TypingIndicator";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { saveSession } from "../utils/sessionManager";
import { apiFetch } from "../utils/api";
import { useSession } from "../contexts/SessionContext";

type Lang = "en" | "fr" | "ar";

export function ScanLesson(): JSX.Element {
  // Content states
  const [lessonText, setLessonText] = useState("");
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [input, setInput] = useState("");

  // Loading states
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Language
  const { language: uiLang } = useLanguage();
  const [explainLang, setExplainLang] = useState<Lang>(uiLang as Lang);

  const { showToast, ToastContainer } = useToast();
  const { setSession } = useSession();

  // Hidden inputs (camera via capture + gallery upload)
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Tesseract language
  const tesseractLang = explainLang === "fr" ? "fra" : explainLang === "ar" ? "ara" : "eng";

  // Utils
  async function toBase64(fileOrBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(((r.result as string) || "").split(",")[1] || "");
      r.onerror = reject;
      r.readAsDataURL(fileOrBlob);
    });
  }

  const tryCloudOCR = async (blobOrFile: Blob): Promise<string> => {
    try {
      const b64 = await toBase64(blobOrFile);
      const hints = explainLang === "fr" ? ["fr"] : explainLang === "ar" ? ["ar"] : ["en"];
      const res = await apiFetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, languageHints: hints }),
      });
      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { return ""; }
      return (data?.text || "").trim();
    } catch {
      return "";
    }
  };

  // Shared OCR handler for both camera+upload inputs
  const runOcrWithFallback = async (fileOrBlob: Blob) => {
    // @ts-ignore — Tesseract via CDN in index.html
    const Tesseract = (window as any).Tesseract;
    if (!Tesseract) throw new Error("Tesseract not loaded (CDN missing)");

    // Tesseract with better defaults
    const result = await Tesseract.recognize(fileOrBlob, tesseractLang, {
      // Improve layout handling and clarity
      tessedit_pageseg_mode: 6, // Assume a block of text
      user_defined_dpi: 300,
    });

    let text = (result?.data?.text || "").trim();
    const conf = result?.data?.confidence ?? 0;

    // Quality gate: if too short or low confidence, try Cloud OCR
    if (!text || text.length < 120 || conf < 60) {
      const cloud = await tryCloudOCR(fileOrBlob);
      if (cloud && cloud.length >= 120) {
        text = cloud.trim();
      } else {
        throw new Error("Text unclear—please retake with better lighting or crop closer.");
      }
    }

    return text;
  };

  const handleImageInput = async (file: File) => {
    try {
      setLoadingOCR(true);
      const text = await runOcrWithFallback(file);
      setLessonText(text);
      showToast(
        explainLang === "fr" ? "Texte OCR extrait !" : explainLang === "ar" ? "تم استخراج النص!" : "OCR text extracted!",
        "success"
      );
    } catch (err: any) {
      console.error("OCR error:", err);
      showToast(
        err?.message ||
          (explainLang === "fr"
            ? "Échec OCR. Réessayez (éclairage / cadrage)."
            : explainLang === "ar"
            ? "فشل OCR. أعد المحاولة (إضاءة/إطار)."
            : "OCR failed. Try again with better lighting/cropping."),
        "error"
      );
    } finally {
      setLoadingOCR(false);
    }
  };

  // ===== Camera (capture) =====
  const onClickCamera = () => cameraInputRef.current?.click();
  // ===== Gallery upload =====
  const onClickUpload = () => uploadInputRef.current?.click();

  // ===== Analyze (AI summary) =====
  const handleAnalyze = async () => {
    if (!lessonText.trim()) {
      showToast(
        explainLang === "fr" ? "Veuillez saisir/scanner un texte." : explainLang === "ar" ? "الرجاء إدخال أو مسح نص." : "Please paste or scan a lesson first.",
        "error"
      );
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "summary", payload: { text: lessonText, language: explainLang } }),
      });

      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { throw new Error("Server returned non-JSON: " + raw.slice(0, 250)); }

      if (!res.ok) {
        const busy = res.status === 503 || /busy/i.test(data?.error || "");
        showToast(
          busy
            ? (explainLang === "fr" ? "Le service IA est occupé. Réessayez." : explainLang === "ar" ? "الخدمة مشغولة. أعد المحاولة." : "The AI service is busy. Please try again.")
            : (explainLang === "fr" ? "Erreur d'analyse." : explainLang === "ar" ? "خطأ أثناء التحليل." : "Error analyzing lesson."),
          "error"
        );
        throw new Error(data?.details || data?.error || "Server error");
      }

      setSummary(data.result);
      setMessages([{ role: "model", content: data.result }]);
      localStorage.setItem("lastLessonText", lessonText);
      localStorage.setItem("lastLessonLang", explainLang);
      setSession({ lessonText, summary: data.result, language: explainLang });
      setShowSaveButton(true);
      showToast(
        explainLang === "fr" ? "Leçon analysée." : explainLang === "ar" ? "تم تحليل الدرس." : "Lesson analyzed.",
        "success"
      );
    } catch (err) {
      console.error("Analyze error:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // ===== Chat (about lesson) =====
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
        body: JSON.stringify({ task: "chat", payload: { question, context: lessonText, language: explainLang } }),
      });

      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { throw new Error("Server returned non-JSON: " + raw.slice(0, 250)); }

      if (!res.ok) {
        const busy = res.status === 503 || /busy/i.test(data?.error || "");
        showToast(
          busy
            ? (explainLang === "fr" ? "Le service IA est occupé. Réessayez." : explainLang === "ar" ? "الخدمة مشغولة. أعد المحاولة." : "The AI service is busy. Please try again.")
            : (explainLang === "fr" ? "Erreur de chat." : explainLang === "ar" ? "خطأ في المحادثة." : "Chat failed."),
          "error"
        );
        setMessages((prev) => [
          ...prev,
          { role: "model", content: explainLang === "fr" ? "Erreur de chat." : explainLang === "ar" ? "خطأ في المحادثة." : "Chat failed." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "model", content: data.result || "" }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: explainLang === "fr" ? "Erreur de chat." : explainLang === "ar" ? "خطأ في المحادثة." : "Chat failed." },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  // ===== Save to history =====
  const handleSaveSession = () => {
    const newSession = {
      id: (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}`),
      timestamp: Date.now(),
      lessonText,
      summary,
      exercises: undefined,
      language: explainLang,
    };
    try {
      saveSession(newSession);
      setShowSaveButton(false);
      showToast(
        explainLang === "fr" ? "📚 Enregistré dans l'historique" : explainLang === "ar" ? "📚 تم الحفظ في السجل" : "📚 Saved to history",
        "success"
      );
    } catch {
      showToast(
        explainLang === "fr" ? "Échec enregistrement" : explainLang === "ar" ? "فشل الحفظ" : "Failed to save",
        "error"
      );
    }
  };

  // ===== UI =====
  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {uiLang === "fr" ? "Scanner / Coller la leçon" : uiLang === "ar" ? "امسح أو الصق الدرس" : "Scan or Paste Your Lesson"}
          </h1>
          {/* Per-lesson explanation language */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-800 dark:text-gray-200">
              {uiLang === "fr" ? "Expliquer en" : uiLang === "ar" ? "الشرح بـ" : "Explain in"}
            </label>
            <select
              value={explainLang}
              onChange={(e) => setExplainLang(e.target.value as Lang)}
              className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-sm text-gray-800 dark:text-white"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Camera (via capture) */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={loadingOCR}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded disabled:opacity-60"
          >
            <CameraIcon className="w-5 h-5" />
            {uiLang === "fr" ? "Caméra" : uiLang === "ar" ? "الكاميرا" : "Take Photo"}
          </button>

          {/* Upload (gallery/file) */}
          <button
            onClick={() => uploadInputRef.current?.click()}
            disabled={loadingOCR}
            className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <Upload className="w-5 h-5" />
            {uiLang === "fr" ? "Télécharger" : uiLang === "ar" ? "تحميل" : "Upload"}
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleImageInput(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageInput(e.target.files[0])}
          className="hidden"
        />

        {loadingOCR && (
          <p className="text-sm text-blue-500">
            {uiLang === "fr" ? "Extraction du texte…" : uiLang === "ar" ? "جار استخراج النص..." : "Extracting text…"}
          </p>
        )}

        <textarea
          className="w-full h-44 p-3 border rounded-lg text-gray-800 dark:text-gray-200 dark:bg-gray-900"
          placeholder={uiLang === "fr" ? "Ou collez le texte ici…" : uiLang === "ar" ? "أو الصق نص الدرس هنا…" : "Or paste your lesson text here…"}
          value={lessonText}
          onChange={(e) => setLessonText(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={!lessonText || loadingSummary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loadingSummary ? (uiLang === "fr" ? "Analyse…" : uiLang === "ar" ? "جار التحليل…" : "Analyzing…") : (uiLang === "fr" ? "Analyser la leçon" : uiLang === "ar" ? "حلّل النص" : "Analyze Lesson")}
          <BrainCircuit className="w-5 h-5" />
        </button>

        <ToastContainer />
      </div>
    );
  }

  // After summary
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {uiLang === "fr" ? "Résultat de l'analyse" : uiLang === "ar" ? "نتيجة التحليل" : "Analysis Result"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {uiLang === "fr" ? "Langue d'explication" : uiLang === "ar" ? "لغة الشرح" : "Explanation language"}: {explainLang.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-800 dark:text-gray-200">
            {uiLang === "fr" ? "Expliquer en" : uiLang === "ar" ? "الشرح بـ" : "Explain in"}
          </label>
          <select
            value={explainLang}
            onChange={(e) => setExplainLang(e.target.value as Lang)}
            className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-sm text-gray-800 dark:text-white"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Lesson & Explanation */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            {uiLang === "fr" ? "Texte de la leçon" : uiLang === "ar" ? "نص الدرس" : "Lesson Text"}
          </h3>
          <div className="text-base md:text-lg leading-7 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {lessonText}
          </div>
        </div>

        <div className="p-6 bg-blue-50 dark:bg-gray-700 rounded-xl shadow">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            {uiLang === "fr" ? "Explication IA" : uiLang === "ar" ? "الشرح بالذكاء الاصطناعي" : "AI Explanation"}
          </h3>
          <div className="max-w-[70ch] text-lg md:text-xl leading-8 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      </div>

      {/* Save to History */}
      {showSaveButton && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveSession}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded shadow"
          >
            {uiLang === "fr" ? "+ Enregistrer dans l'historique" : uiLang === "ar" ? "+ احفظ في السجل" : "+ Save to History"}
          </button>
        </div>
      )}

      {/* Chat */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-[50vh] flex flex-col">
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
            placeholder={uiLang === "fr" ? "Posez une question…" : uiLang === "ar" ? "اطرح سؤالاً…" : "Ask a question…"}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r">
            {uiLang === "fr" ? "Envoyer" : uiLang === "ar" ? "إرسال" : "Send"}
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}
