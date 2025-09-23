const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const genAI = new GoogleGenerativeAI(apiKey);

    if (task === "summary") {
      const { text, language } = payload;
      let instr = text;
      if (language === "fr") instr = "Explique ce texte: \n\n" + text;
      if (language === "ar") instr = "اشرح هذا النص بالعربية:\n\n" + text;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(instr);
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "hint") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        `Give a one-sentence hint for this question:\n\n${payload?.question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "chat") {
      const { question, context, language } = payload;
      let instr = `The student has this lesson:\n${context}\n\nNow answer this question: ${question}`;
      if (language === "fr") instr = `Le cours est:\n${context}\n\nQuestion de l'élève: ${question}`;
      if (language === "ar") instr = `النص:\n${context}\n\nسؤال الطالب: ${question}`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(instr);
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: "Invalid task type" });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
