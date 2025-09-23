const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (task === "summary") {
      const { text, language } = payload;
      let instr = `Explain this lesson for a high school student:\n\n${text}`;
      if (language === "fr") instr = `Explique le texte simplement pour un élève:\n\n${text}`;
      if (language === "ar") instr = `اشرح هذا النص بلغة مبسطة:\n\n${text}`;

      const result = await model.generateContent(instr);
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "hint") {
      const { question } = payload;
      const result = await model.generateContent(
        `Give a short one‑sentence hint for this question, without solving it:\n\n${question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "chat") {
      const { question, context, language } = payload;
      let instr = `Student's lesson context:\n${context}\n\nStudent question:\n${question}\n\nAnswer clearly in ${language || "English"}.`;
      const result = await model.generateContent(instr);
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: "Invalid task type" });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
