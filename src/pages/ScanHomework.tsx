import React, { useEffect, useState } from "react";
import { Loader2, BookOpenCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { apiFetch } from "../utils/api";

interface Exercise {
  question: string;
  aiAnswer?: string;
  studentAnswer?: string;
  checking?: boolean;
}

export function ScanHomework(): JSX.Element {
  const [lessonText, setLessonText] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    setLessonText(localStorage.getItem("lastLessonText") || "");
  }, []);

  const handleGenerateExercises = async () => {
    if (!lessonText) {
      showToast(language === "fr" ? "Aucune leçon trouvée." : language === "ar" ? "لا يوجد درس." : "No lesson found.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "exercises", payload: { text: lessonText, language } }),
      });

      let data: any;
      try { data = await res.json(); } catch { throw new Error("Server returned non-JSON."); }
      if (!res.ok) throw new Error(data?.error || "Server error");

      const list = (data.result || "")
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0)
        .map((q: string) => ({ question: q }));
      setExercises(list);
      showToast(language === "fr" ? "Exercices générés" : language === "ar" ? "تم إنشاء التمارين" : "Exercises generated", "success");
    } catch (err) {
      console.error("Generate exercises error:", err);
      showToast(language === "fr" ? "Échec génération." : language === "ar" ? "فشل الإنشاء" : "Failed to generate exercises", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = async (index: number) => {
    const ex = exercises[index];
    if (!ex || !ex.studentAnswer) {
      showToast(language === "fr" ? "Entrez une réponse." : language === "ar" ? "أدخل إجابة" : "Enter an answer", "error");
      return;
    }
    setExercises((prev) => prev.map((e, i) => (i === index ? { ...e, checking: true } : e)));
    try {
      const res = await apiFetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "checkAnswer",
          payload: { question: ex.question, studentAnswer: ex.studentAnswer, language },
        }),
      });

      let data: any;
      try { data = await res.json(); } catch { throw new Error("Server returned non-JSON"); }
      if (!res.ok) throw new Error(data?.error || "Server error");

      setExercises((prev) => prev.map((e, i) => (i === index ? { ...e, checking: false, aiAnswer: data.result } : e)));
    } catch (err) {
      console.error("Check answer error:", err);
      showToast(language === "fr" ? "Erreur de vérification" : language === "ar" ? "خطأ في التحقق" : "Failed to check answer", "error");
      setExercises((prev) => prev.map((e, i) => (i === index ? { ...e, checking: false } : e)));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {language === "fr" ? "Exercices" : language === "ar" ? "الواجب" : "Homework Practice"}
      </h1>

      {!exercises.length ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="mb-3 text-gray-800 dark:text-gray-200">{language === "fr" ? "Générez des exercices à partir de votre dernière leçon." : language === "ar" ? "انشئ تمارين من الدرس الأخير" : "Generate exercises from your last lesson."}</p>
          <button
            onClick={handleGenerateExercises}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (language === "fr" ? "Génération…" : language === "ar" ? "جارِ الإنشاء…" : "Generating…") : (language === "fr" ? "Générer les exercices" : language === "ar" ? "إنشاء التمارين" : "Generate Exercises")}
            <BookOpenCheck className="ml-2 w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">{ex.question}</p>
              <input
                type="text"
                value={ex.studentAnswer || ""}
                onChange={(e) => setExercises((prev) => prev.map((p, i) => (i === idx ? { ...p, studentAnswer: e.target.value } : p)))}
                placeholder={language === "fr" ? "Tapez votre réponse…" : language === "ar" ? "اكتب إجابتك…" : "Type your answer…"}
                className="w-full border rounded px-3 py-2 mb-2 dark:bg-gray-900 dark:text-gray-200"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCheckAnswer(idx)}
                  disabled={ex.checking}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {ex.checking ? (language === "fr" ? "Vérification…" : language === "ar" ? "جار التحقق…" : "Checking…") : (language === "fr" ? "Vérifier la réponse" : language === "ar" ? "تحقق" : "Check Answer")}
                </button>
                {ex.aiAnswer && <div className="text-sm text-gray-800 dark:text-gray-200 pl-3 border-l-4 border-green-500">{ex.aiAnswer}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
