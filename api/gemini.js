// api/gemini.js — DEBUG version (temporary)
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // quick CORS so mobiles can call it
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    console.log("[DEBUG api/gemini] incoming raw body:", raw.slice(0, 2000));

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};

    const hasKey = !!process.env.GEMINI_API_KEY;
    console.log("[DEBUG api/gemini] has GEMINI_API_KEY:", hasKey);

    if (!hasKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    // minimal test: if task === "ping" we return OK, otherwise attempt summary
    if (task === "ping") {
      return res.status(200).json({ result: "pong" });
    }

    if (task === "summary") {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const text = (payload && payload.text) || "test";
      const result = await model.generateContent(`Summarize: ${text}`);
      let out = "";
      if (result && result.response) {
        if (typeof result.response.text === "function") out = result.response.text();
        else if (typeof result.response.text === "string") out = result.response.text;
        else out = JSON.stringify(result.response).slice(0,2000);
      }
      return res.status(200).json({ result: out });
    }

    return res.status(400).json({ error: "Invalid task (debug)" });
  } catch (err) {
    console.error("[DEBUG api/gemini] Error:", err);
    return res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
};
