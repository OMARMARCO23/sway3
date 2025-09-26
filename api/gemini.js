// api/gemini.js
// Robust server with model fallback + retries + clear JSON errors.
// Works on Vercel Node functions (CommonJS).

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Small helpers
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeExtractText(result) {
  try {
    if (!result) return "";
    if (result.response) {
      if (typeof result.response.text === "function") return result.response.text();
      if (typeof result.response.text === "string") return result.response.text;
    }
    return JSON.stringify(result).slice(0, 4000);
  } catch (e) {
    return String(result);
  }
}

// Tries several models and retries transient overloads (503) per model
async function generateWithRetries(genAI, prompt) {
  const candidates = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "models/text-bison-001",
    "models/chat-bison-001",
  ];

  const backoffs = [0, 600, 1500]; // ms between attempts on same model
  let lastErr = null;

  for (const modelId of candidates) {
    let model;
    try {
      model = genAI.getGenerativeModel({ model: modelId });
    } catch (err) {
      lastErr = err;
      console.warn("[api/gemini] candidate init failed:", modelId, err?.message || err);
      continue;
    }

    for (let i = 0; i < backoffs.length; i++) {
      try {
        const result = await model.generateContent(prompt);
        return { result, modelId };
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || e);
        const overloaded = e?.status === 503 || /overloaded|503/i.test(msg);
        const notFound = e?.status === 404;

        console.warn(
          `[api/gemini] model ${modelId} attempt ${i + 1} failed:`,
          e?.status || "",
          e?.statusText || "",
          msg,
        );

        if (notFound) break; // try next candidate immediately

        if (overloaded && i < backoffs.length - 1) {
          await sleep(backoffs[i + 1]);
          continue; // retry same model
        }

        // any other error → try next candidate
        break;
      }
    }
  }

  throw lastErr;
}

module.exports = async function handler(req, res) {
  // CORS (mobile + web)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[api/gemini] Missing GEMINI_API_KEY");
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // TASK: SUMMARY
    if (task === "summary") {
      const textRaw = (payload && payload.text) || "";
      const language = (payload && payload.language) || "en";
      const text = textRaw.slice(0, 8000);

      let prompt = text;
      if (language === "fr") prompt = "Explique ce texte en français simplement pour un élève :\n\n" + text;
      if (language === "ar") prompt = "اشرح هذا النص بالعربية بلغة مبسطة لتلميذ:\n\n" + text;

      try {
        const { result, modelId } = await generateWithRetries(genAI, prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out, modelUsed: modelId });
      } catch (err) {
        const msg = String(err?.message || err);
        const overloaded = /503|overloaded/i.test(msg);
        console.error("[api/gemini] summary final error:", msg);
        return res.status(overloaded ? 503 : 500).json({
          error: overloaded ? "The AI service is busy. Please try again." : "Gemini API call failed (summary)",
          details: msg,
        });
      }
    }

    // TASK: CHAT
    if (task === "chat") {
      const question = (payload && payload.question) || "";
      const contextRaw = (payload && payload.context) || "";
      const language = (payload && payload.language) || "en";
      const context = contextRaw.slice(0, 8000);

      let prompt = `Lesson context:\n${context}\n\nStudent question:\n${question}\n\nAnswer clearly.`;
      if (language === "fr") prompt = `Contexte du cours:\n${context}\n\nQuestion:\n${question}\n\nRéponds clairement en français.`;
      if (language === "ar") prompt = `محتوى الدرس:\n${context}\n\nسؤال الطالب:\n${question}\n\nأجب بوضوح بالعربية.`;

      try {
        const { result, modelId } = await generateWithRetries(genAI, prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out, modelUsed: modelId });
      } catch (err) {
        const msg = String(err?.message || err);
        const overloaded = /503|overloaded/i.test(msg);
        console.error("[api/gemini] chat final error:", msg);
        return res.status(overloaded ? 503 : 500).json({
          error: overloaded ? "The AI service is busy. Please try again." : "Gemini API call failed (chat)",
          details: msg,
        });
      }
    }

    // TASK: HINT
    if (task === "hint") {
      const question = (payload && payload.question) || "";
      try {
        const { result } = await generateWithRetries(
          genAI,
          `Give a short one-sentence hint for this question (not the answer):\n\n${question}`,
        );
        const out = safeExtractText(result);
        return res.status(200).json({ result: out });
      } catch (err) {
        const msg = String(err?.message || err);
        const overloaded = /503|overloaded/i.test(msg);
        console.error("[api/gemini] hint final error:", msg);
        return res.status(overloaded ? 503 : 500).json({
          error: overloaded ? "The AI service is busy. Please try again." : "Gemini API call failed (hint)",
          details: msg,
        });
      }
    }

    // TASK: EXERCISES
    if (task === "exercises") {
      const textRaw = (payload && payload.text) || "";
      const language = (payload && payload.language) || "en";
      const text = textRaw.slice(0, 8000);

      let prompt = `From this lesson, create 3 short practice exercises (numbered):\n\n${text}`;
      if (language === "fr") prompt = `À partir de ce cours, crée 3 exercices concis (numérotés) :\n\n${text}`;
      if (language === "ar") prompt = `بناءً على هذا الدرس، أنشئ 3 تمارين قصيرة مرقمة:\n\n${text}`;

      try {
        const { result, modelId } = await generateWithRetries(genAI, prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out, modelUsed: modelId });
      } catch (err) {
        const msg = String(err?.message || err);
        const overloaded = /503|overloaded/i.test(msg);
        console.error("[api/gemini] exercises final error:", msg);
        return res.status(overloaded ? 503 : 500).json({
          error: overloaded ? "The AI service is busy. Please try again." : "Gemini API call failed (exercises)",
          details: msg,
        });
      }
    }

    // TASK: CHECK ANSWER
    if (task === "checkAnswer") {
      const question = (payload && payload.question) || "";
      const studentAnswer = (payload && payload.studentAnswer) || "";
      const language = (payload && payload.language) || "en";

      let prompt = `Question:\n${question}\n\nStudent's answer:\n${studentAnswer}\nEvaluate correctness and give a brief correction if needed.`;
      if (language === "fr") prompt = `Question:\n${question}\n\nRéponse:\n${studentAnswer}\n Évalue si c'est correct et propose une correction brève.`;
      if (language === "ar") prompt = `السؤال:\n${question}\n\nإجابة الطالب:\n${studentAnswer}\n قيّم الإجابة وقدّم تصحيحًا موجزًا إذا لزم.`;

      try {
        const { result, modelId } = await generateWithRetries(genAI, prompt);
        const out = safeExtractText(result);
        return res.status(200).json({ result: out, modelUsed: modelId });
      } catch (err) {
        const msg = String(err?.message || err);
        const overloaded = /503|overloaded/i.test(msg);
        console.error("[api/gemini] checkAnswer final error:", msg);
        return res.status(overloaded ? 503 : 500).json({
          error: overloaded ? "The AI service is busy. Please try again." : "Gemini API call failed (checkAnswer)",
          details: msg,
        });
      }
    }

    return res.status(400).json({ error: "Invalid task" });
  } catch (err) {
    console.error("[api/gemini] unexpected error:", err);
    return res.status(500).json({ error: "Server crashed", details: String(err?.message || err) });
  }
};
