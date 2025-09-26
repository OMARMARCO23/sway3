// api/gemini.js (robust fallback + helpful errors)
// Replace existing file with this, commit & push, then wait for Vercel to redeploy.

const { GoogleGenerativeAI } = require("@google/generative-ai");

function safeExtractText(result) {
  try {
    if (!result) return "";
    if (result.response) {
      if (typeof result.response.text === "function") return result.response.text();
      if (typeof result.response.text === "string") return result.response.text;
    }
    // fallback
    return JSON.stringify(result).slice(0, 4000);
  } catch (e) {
    return String(result);
  }
}

module.exports = async function handler(req, res) {
  // CORS for mobile / web
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    console.log("[api/gemini] incoming body:", rawBody.slice(0, 2000));

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[api/gemini] Missing GEMINI_API_KEY");
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // candidate models — try in order until one works
    const candidates = [
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "models/text-bison-001",
      "models/chat-bison-001"
    ];

    let model = null;
    let lastModelErr = null;
    for (const candidate of candidates) {
      try {
        model = genAI.getGenerativeModel({ model: candidate });
        console.log("[api/gemini] using model candidate:", candidate);
        break;
      } catch (err) {
        lastModelErr = err;
        console.warn("[api/gemini] candidate not available:", candidate, err?.message || err);
      }
    }

    if (!model) {
      console.error("[api/gemini] No usable model found. lastErr:", String(lastModelErr?.message || lastModelErr));
      return res.status(500).json({ error: "No available model for this project", details: String(lastModelErr?.message || lastModelErr) });
    }

    // Handle tasks
    if (task === "summary") {
      const text = (payload && payload.text) || "";
      const language = (payload && payload.language) || "en";
      let prompt = text;
      if (language === "fr") prompt = "Explique simplement le texte suivant en français pour un(e) élève :\n\n" + text;
      if (language === "ar") prompt = "اشرح هذا النص باللغة العربية بطريقة مبسطة لتلميذ:\n\n" + text;

      try {
        const result = await model.generateContent(prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out, modelUsed: model.model || "unknown" });
      } catch (err) {
        console.error("[api/gemini] error calling generateContent:", err);
        return res.status(500).json({ error: "Gemini API call failed", details: String(err?.message || err) });
      }
    }

    if (task === "chat") {
      const { question = "", context = "", language = "en" } = payload || {};
      let prompt = `Lesson context:\n${context}\n\nStudent question:\n${question}`;
      if (language === "fr") prompt = `Contexte du cours:\n${context}\n\nQuestion:\n${question}`;
      if (language === "ar") prompt = `النص:\n${context}\n\nسؤال:\n${question}`;

      try {
        const result = await model.generateContent(prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out, modelUsed: model.model || "unknown" });
      } catch (err) {
        console.error("[api/gemini] chat generateContent error:", err);
        return res.status(500).json({ error: "Gemini API call failed (chat)", details: String(err?.message || err) });
      }
    }

    if (task === "hint") {
      const question = (payload && payload.question) || "";
      try {
        const result = await model.generateContent(`Give a short one-sentence hint, not the answer, for:\n\n${question}`);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out });
      } catch (err) {
        console.error("[api/gemini] hint error:", err);
        return res.status(500).json({ error: "Gemini API call failed (hint)", details: String(err?.message || err) });
      }
    }

    if (task === "exercises") {
      const text = (payload && payload.text) || "";
      const language = (payload && payload.language) || "en";
      let prompt = `From this lesson, create 3 short practice exercises (numbered):\n\n${text}`;
      if (language === "fr") prompt = `À partir de ce cours, crée 3 exercices concis (numérotés):\n\n${text}`;
      if (language === "ar") prompt = `بناءً على هذا الدرس، أنشئ 3 تمارين قصيرة مرقمة:\n\n${text}`;

      try {
        const result = await model.generateContent(prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out });
      } catch (err) {
        console.error("[api/gemini] exercises error:", err);
        return res.status(500).json({ error: "Gemini API call failed (exercises)", details: String(err?.message || err) });
      }
    }

    if (task === "checkAnswer") {
      const { question = "", studentAnswer = "", language = "en" } = payload || {};
      let prompt = `Question:\n${question}\n\nStudent's answer:\n${studentAnswer}\nEvaluate correctness and give a brief correction if needed.`;
      if (language === "fr") prompt = `Question:\n${question}\n\nRéponse:\n${studentAnswer}\nÉvalue si c'est correct et donne une correction si besoin.`;
      if (language === "ar") prompt = `السؤال:\n${question}\n\nإجابة الطالب:\n${studentAnswer}\nقيّم الإجابة وقدم تصحيحاً موجزاً إن لزم.`;

      try {
        const result = await model.generateContent(prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out });
      } catch (err) {
        console.error("[api/gemini] checkAnswer error:", err);
        return res.status(500).json({ error: "Gemini API call failed (checkAnswer)", details: String(err?.message || err) });
      }
    }

    return res.status(400).json({ error: "Invalid task" });
  } catch (err) {
    console.error("[api/gemini] unexpected error:", err);
    return res.status(500).json({ error: "Server crashed", details: String(err?.message || err) });
  }
};
