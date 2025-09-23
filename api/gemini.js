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

    if (task === "exercises") {
      const txt = payload.text;
      const result = await model.generateContent(
        `Based on this lesson text, generate 3 concise practice exercises for a student. 
         Format as plain questions, one per line. 
         Lesson:\n\n${txt}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "checkAnswer") {
      const { question, studentAnswer } = payload;
      const result = await model.generateContent(
        `The exercise question was:\n${question}\n
         Student answered:\n${studentAnswer}\n
         Evaluate if it's correct, give short feedback and corrections if needed.`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    // keep summary / chat / hint support
    if (task === "summary" || task === "chat" || task === "hint") {
      // ... your existing branches
    }

    return res.status(400).json({ error: "Invalid task type" });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
