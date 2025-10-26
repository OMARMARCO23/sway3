import React, { useRef, useState } from "react";
import { BrainCircuit, Upload, Camera as CameraIcon, PlusCircle } from "lucide-react";
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

  // Languages
  const { language: uiLang } = useLanguage();
  const [explainLang, setExplainLang] = useState<Lang>(uiLang as Lang);

  const { showToast, ToastContainer } = useToast();
  const { setSession } = useSession();

  // Hidden inputs for camera-like capture and gallery upload
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Map to Tesseract traineddata
  const tesseractLang = explainLang === "fr" ? "fra" : explainLang === "ar" ? "ara" : "eng";

  // Convert File/Blob -> preprocessed Blob
  async function preprocessImage(fileOrBlob: Blob): Promise<Blob> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(fileOrBlob);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });

    // Scale to a reasonable max size for OCR clarity
    const MAX = 2000;
    const scale = Math.min(1, MAX / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    // Draw image
    ctx.drawImage(img, 0, 0, w, h);

    // Get pixels and apply simple enhancements:
    // 1) Grayscale
    // 2) Contrast stretch
    // 3) Adaptive-ish (coarse) threshold using global mean
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    // Grayscale and compute mean
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const gray = (r * 0.299 + g * 0.587 + b * 0.114);
      d[i] = d[i + 1] = d[i + 2] = gray;
      sum += gray;
    }
    const mean = sum / (d.length / 4);

    // Contrast stretch
    const low = mean - 40;
    const high = mean + 40;
    const range = Math.max(1, high - low);

    for (let i = 0; i < d.length; i += 4) {
      let val = d[i];
      val = ((val - low) / range) * 255;
      val = Math.min(255, Math.max(0, val));
      // Simple threshold around mean
      const bin = val > 128 ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = bin;
      // Keep alpha
    }

    ctx.putImageData(imgData, 0, 0);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b as Blob), "image/png", 1);
    });
  }

  // Recognize with Tesseract (two-pass if low quality)
  async function recognizeWithTesseract(blob: Blob, psm: number): Promise<{ text: string; conf: number }> {
    // @ts-ignore — Tesseract via CDN in index.html
    const Tesseract = (window as any).Tesseract;
    if (!Tesseract) throw new Error("Tesseract not loaded (CDN missing)");

    const res = await Tesseract.recognize(blob, tesseractLang, {
      // improve layout: assume block of text
      tessedit_pageseg_mode: psm, // 6=block, 3=auto
      user_defined_dpi: 300,
    });
    const text = (res?.data?.text || "").trim();
    const conf = res?.data?.confidence ?? 0;
    return { text, conf };
  }

  async function runOcrFree(file: File | Blob): Promise<string> {
    // Preprocess
    const pre = await preprocessImage(file);

    // First pass PSM 6
    let { text, conf } = await recognizeWithTesseract(pre, 6);

    // Quality gate: if too short or low conf, second pass PSM 3
    if (!text || text.length < 120 || conf < 60) {
      const second = await recognizeWithTesseract(pre, 3);
      if (second.text.length > text.length || second.conf > conf) {
        text = second.text;
        conf = second.conf;
      }
    }

    if (!text || text.length < 120 || conf < 55) {
      throw new Error(
        explainLang === "fr"
          ? "Texte peu clair. Reprenez la photo (meilleure lumière / cadrage)."
          : explainLang === "ar"
          ? "النص غير واضح. التقط صورة أوضح (إضاءة/تسطيح أفضل)."
          : "Text unclear. Retake with better lighting and straight page."
      );
    }
    return text;
  }

  const handleImageInput = async (file: File, append = false) => {
    try {
      setLoadingOCR(true);
      const text = await runOcrFree(file);
      setLessonText((prev) => (append && prev ? prev + "\n\n" + text : text));
      showToast(
        explainLang === "fr" ? "Texte OCR extrait !" : explainLang === "ar" ? "تم استخراج النص!" : "OCR text extracted!",
        "success"
      );
    } catch (err: any) {
      console.error("OCR error:", err);
      showToast(err?.message || "OCR failed.", "error");
    } finally {
      setLoadingOCR(false);
    }
  };

  // Camera-like capture (mobile browsers) and gallery
  const onClickCamera = () => cameraInputRef.current?.click();
  const onClickUpload = () => uploadInputRef.current?.click();

  // Add another page (append to lessonText)
  const onAddAnotherPage = () => cameraInputRef.current?.click();

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
          {/* Camera-like (capture) */}
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

          {/* Add another page */}
          <button
            onClick={onAddAnotherPage}
            disabled={loadingOCR}
            className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
            title={uiLang === "fr" ? "Ajouter une autre page" : uiLang === "ar" ? "إضافة صفحة أخرى" : "Add another page"}
          >
            <PlusCircle className="w-5 h-5" />
            {uiLang === "fr" ? "Ajouter une page" : uiLang === "ar" ? "أضف صفحة" : "Add page"}
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleImageInput(e.target.files[0], true /* append */)}
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
