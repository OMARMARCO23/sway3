import React, { useEffect, useMemo, useState } from "react";
import { Loader2, BookOpenCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { apiFetch } from "../utils/api";
import { useSession } from "../contexts/SessionContext";
import { Link } from "react-router-dom";

interface Exercise {
  question: string;
  aiAnswer?: string;
  studentAnswer?: string;
  checking?: boolean;
}

export function ScanHomework(): JSX.Element {
  const { language } = useLanguage();
  const { showToast, ToastContainer } = useToast();
  const { current } = useSession();

  // Fallback: if SessionContext is empty but we have persisted values
  const persisted = useMemo(() => {
    try {
      const raw = localStorage.getItem("sway3_current_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const lessonText: string = current?.lessonText || persisted?.lessonText || "";
  const lessonSummary: string = current?.summary || persisted?.summary || "";
  const lessonLang: string = current?.language || persisted?.language || language;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate exercises only if we have a current lesson
  const handleGenerateExercises = async () => {
    if (!lessonText.trim()) {
      showToast(
        lessonLang === "fr" ? "Aucune leçon trouvée. Analysez une leçon d’abord." :
        lessonLang === "ar" ? "لا يوجد درس. حلّل درسًا أولاً." :
        "No lesson found. Please analyze a lesson first.",
        "error"
      );
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "exercises",
          payload: { text: lessonText, summary: lessonSummary, language: lessonLang },
        }),
      });

      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { throw new Error("Server returned non-JSON: " + raw.slice(0, 250)); }

      if (!res.ok) {
        const busy = res.status === 503 || /busy/i.test(data?.error || "");
        showToast(
          busy
            ? (lessonLang === "fr" ? "Le service IA est occupé. Réessayez." : lessonLang === "ar" ? "الخدمة مشغولة. أعد المحاولة." : "The AI service is busy. Please try again.")
            : (lessonLang === "fr" ? "Échec génération." : lessonLang === "ar" ? "فشل الإنشاء." : "Failed to generate."),
          "error"
        );
        return;
      }

      const list = (data.result || "")
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .map((q: string) => ({ question: q }));

      if (!list.length) {
        showToast(
          lessonLang === "fr" ? "Aucun exercice généré pour ce contenu." :
          lessonLang === "ar" ? "لم يتم إنشاء تمارين لهذا المحتوى." :
          "No exercises generated for this content.",
          "error"
        );
        return;
      }

      setExercises(list);
      showToast(
        lessonLang === "fr" ? "Exercices générés." : lessonLang === "ar" ? "تم إنشاء التمارين." : "Exercises generated.",
        "success"
      );
    } catch (err) {
      console.error("Generate exercises error:", err);
      showToast(
        lessonLang === "fr" ? "Échec génération." : lessonLang === "ar" ? "فشل الإنشاء." : "Failed to generate exercises.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = async (index: number) => {
    const ex = exercises[index];
    if (!ex?.studentAnswer?.trim()) {
      showToast(
        lessonLang === "fr" ? "Entrez une réponse." : lessonLang === "ar" ? "أدخل إجابة." : "Enter an answer.",
        "error"
      );
      return;
    }
    setExercises((prev) => prev.map((e, i) => (i === index ? { ...e, checking: true } : e)));
    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "checkAnswer", payload: { question: ex.question, studentAnswer: ex.studentAnswer, language } }),
      });

      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { throw new Error("Server returned non-JSON: " + raw.slice(0, 250)); }

      if (!res.ok) {
        const busy = res.status === 503 || /busy/i.test(data?.error || "");
        showToast(
          busy
            ? (lessonLang === "fr" ? "Le service IA est occupé. Réessayez." : lessonLang === "ar" ? "الخدمة مشغولة. أعد المحاولة." : "The AI service is busy. Please try again.")
            : (lessonLang === "fr" ? "Erreur de vérification." : lessonLang === "ar" ? "خطأ في التحقق." : "Failed to check answer."),
          "error"
        );
        setExercises((prev) => prev.map((e, i) => (i === index ? { ...e, checking: false } : e)));
        return;
      }

      setExercises((prev) =>
        prev.map((e, i) => (i === index ? { ...e, checking: false, aiAnswer: data.result } : e))
      );
    } catch (err) {
      console.error("Check answer error:", err);
      showToast(
        lessonLang === "fr" ? "Erreur de vérification." : lessonLang === "ar" ? "خطأ في التحقق." : "Failed to check answer.",
        "error"
      );
      setExercises((prev) => prev.map((e, i) => (i === index ? { ...e, checking: false } : e)));
    }
  };

  // UI
  const noLesson = !lessonText.trim();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {lessonLang === "fr" ? "Exercices" : lessonLang === "ar" ? "الواجب" : "Homework Practice"}
      </h1>

      {/* No lesson → show friendly CTA */}
      {noLesson ? (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <p className="text-gray-800 dark:text-gray-200 mb-3">
            {lessonLang === "fr" ? "Aucune leçon active. Analysez une leçon pour générer des exercices liés." :
             lessonLang === "ar" ? "لا يوجد درس نشط. حلّل درسًا لإنشاء تمارين مرتبطة." :
             "No active lesson. Analyze a lesson to generate related exercises."}
          </p>
          <Link
            to="/scan-lesson"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {lessonLang === "fr" ? "Aller à Scanner la leçon" :
             lessonLang === "ar" ? "اذهب إلى مسح الدرس" :
             "Go to Scan Lesson"}
          </Link>
          <ToastContainer />
        </div>
      ) : (
        <>
          {/* Generate button */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="mb-3 text-gray-800 dark:text-gray-200">
              {lessonLang === "fr" ? "Générez des exercices à partir de la leçon actuelle." :
               lessonLang === "ar" ? "أنشئ تمارين من الدرس الحالي." :
               "Generate exercises from the current lesson."}
            </p>
            <button
              onClick={handleGenerateExercises}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
            >
              {loading
                ? (lessonLang === "fr" ? "Génération…" : lessonLang === "ar" ? "جارِ الإنشاء…" : "Generating…")
                : (lessonLang === "fr" ? "Générer les exercices" : lessonLang === "ar" ? "إنشاء التمارين" : "Generate Exercises")}
              <BookOpenCheck className="ml-2 w-4 h-4" />
            </button>
          </div>

          {/* Exercises list */}
          {exercises.length > 0 && (
            <div className="space-y-4">
              {exercises.map((ex, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                  <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">{ex.question}</p>
                  <input
                    type="text"
                    value={ex.studentAnswer || ""}
                    onChange={(e) =>
                      setExercises((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, studentAnswer: e.target.value } : p))
                      )
                    }
                    placeholder={
                      lessonLang === "fr"
                        ? "Tapez votre réponse…"
                        : lessonLang === "ar"
                        ? "اكتب إجابتك…"
                        : "Type your answer…"
                    }
                    className="w-full border rounded px-3 py-2 mb-2 dark:bg-gray-900 dark:text-gray-200"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCheckAnswer(idx)}
                      disabled={ex.checking}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      {ex.checking
                        ? (lessonLang === "fr" ? "Vérification…" : lessonLang === "ar" ? "جار التحقق…" : "Checking…")
                        : (lessonLang === "fr" ? "Vérifier la réponse" : lessonLang === "ar" ? "تحقق" : "Check Answer")}
                    </button>
                    {ex.aiAnswer && (
                      <div className="text-sm text-gray-800 dark:text-gray-200 pl-3 border-l-4 border-green-500">
                        {ex.aiAnswer}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <ToastContainer />
        </>
      )}
    </div>
  );
}
