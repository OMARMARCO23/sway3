// api/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

function extractText(result) {
  // Try common shapes that library may return
  try {
    if (!result) return "";
    if (result.response) {
      if (typeof result.response.text === "function") return result.response.text();
      if (typeof result.response.text === "string") return result.response.text;
      if (typeof result.response === "string") return result.response;
    }
    // Fallback deep lookup
    if (result.output && Array.isArray(result.output) && result.output[0]) {
      const out = result.output[0];
      if (out.content && Array.isArray(out.content) && out.content[0]) {
        return out.content[0].text || JSON.stringify(result);
      }
    }
    return JSON.stringify(result);
  } catch (err) {
    return String(result);
  }
}

module.exports = async function handler(req, res) {
  // CORS for mobile/web
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (task === "summary") {
      const { text, language } = payload || {};
      let prompt = `Explain this lesson for a high school student in clear, simple language:\n\n${text}`;
      if (language === "fr") prompt = `Explique ce texte simplement pour un élève :\n\n${text}`;
      if (language === "ar") prompt = `اشرح هذا النص بلغة عربية مبسطة لتلميذ:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const out = extractText(result);
      return res.status(200).json({ result: out });
    }

    if (task === "chat") {
      const { question, context, language } = payload || {};
      let prompt = `Lesson context:\n${context}\n\nStudent question:\n${question}\n\nAnswer clearly and kindly in ${language || "English"}.`;
      if (language === "fr") prompt = `Contexte du cours:\n${context}\n\nQuestion:\n${question}\n\nRéponds clairement en français.`;
      if (language === "ar") prompt = `محتوى الدرس:\n${context}\n\nسؤال الطالب:\n${question}\n\nأجب بلغة عربية مبسطة.`;

      const result = await model.generateContent(prompt);
      const out = extractText(result);
      return res.status(200).json({ result: out });
    }

    if (task === "hint") {
      const { question } = payload || {};
      const prompt = `Give a short one-sentence hint (do NOT give the full answer) for this homework question:\n\n${question}`;
      const result = await model.generateContent(prompt);
      const out = extractText(result);
      return res.status(200).json({ result: out });
    }

    if (task === "exercises") {
      const { text, language } = payload || {};
      let prompt = `Based on this lesson text, create 3 concise practice exercises for a student (numbered, plain text):\n\n${text}`;
      if (language === "fr") prompt = `À partir de ce texte de cours, crée 3 exercices concis (numérotés) :\n\n${text}`;
      if (language === "ar") prompt = `بناءً على هذا الدرس، أنشئ 3 تمارين قصيرة مرقمة:\n\n${text}`;

      const result = await model.generateContent(prompt);
      const out = extractText(result);
      return res.status(200).json({ result: out });
    }

    if (task === "checkAnswer") {
      const { question, studentAnswer, language } = payload || {};
      let prompt = `Question:\n${question}\nStudent answer:\n${studentAnswer}\nEvaluate if correct, give brief feedback and correction if needed.`;
      if (language === "fr") prompt = `Question:\n${question}\nRéponse de l'élève:\n${studentAnswer}\nÉvalue et donne un retour bref.`;
      if (language === "ar") prompt = `السؤال:\n${question}\nإجابة الطالب:\n${studentAnswer}\nقيّم الإجابة وقدم ملاحظات وتصحيحًا إن لزم.`;

      const result = await model.generateContent(prompt);
      const out = extractText(result);
      return res.status(200).json({ result: out });
    }

    return res.status(400).json({ error: "Invalid task" });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
};
