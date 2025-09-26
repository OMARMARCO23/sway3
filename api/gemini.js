// api/gemini.js - DEBUG version (temporary)
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // CORS (allow mobile/web)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    // Log incoming body for debugging
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    console.log("[api/gemini] incoming raw body:", rawBody.slice(0, 2000));

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};

    // Check if key exists (do not log the key itself)
    const hasKey = !!process.env.GEMINI_API_KEY;
    console.log("[api/gemini] has GEMINI_API_KEY:", hasKey);

    if (!hasKey) {
      // helpful message to see in logs and response
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    // Very simple handling of a test task so we can quickly verify
    if (task === "summary") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Compose prompt (multilingual)
      const { text = "", language = "en" } = payload || {};
      let prompt = text;
      if (language === "fr") prompt = "Explique en français pour un élève: " + text;
      if (language === "ar") prompt = "اشرح هذا النص بالعربية: " + text;

      // Call the API (wrap in try/catch)
      try {
        const result = await model.generateContent(prompt);
        // extract text safely
        let out = "";
        if (result && result.response) {
          if (typeof result.response.text === "function") out = result.response.text();
          else if (typeof result.response.text === "string") out = result.response.text;
          else out = JSON.stringify(result.response).slice(0, 2000);
        } else {
          out = JSON.stringify(result).slice(0, 2000);
        }
        console.log("[api/gemini] success, result length:", out.length);
        return res.status(200).json({ result: out });
      } catch (e) {
        console.error("[api/gemini] error calling Gemini:", e);
        return res.status(500).json({ error: "Gemini API call failed", details: String(e?.message || e) });
      }
    }

    return res.status(400).json({ error: "Invalid task (debug): " + String(task) });
  } catch (err) {
    console.error("[api/gemini] unexpected error:", err);
    return res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
};
