const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Summary
    if (task === "summary") {
      const { text, language } = payload;
      let prompt = `Explain this lesson for a student:\n\n${text}`;
      if (language === "fr") prompt = `Explique simplement le cours:\n\n${text}`;
      if (language === "ar") prompt = `اشرح هذا الدرس بلغة مبسطة:\n\n${text}`;

      const result = await model.generateContent(prompt);
      return res.status(200).json({ result: result.response.text() });
    }

    // ✅ Hint
    if (task === "hint") {
      const { question } = payload;
      const result = await model.generateContent(
        `Give a short one-sentence hint for this question without giving away the answer:\n\n${question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    // ✅ Chat
    if (task === "chat") {
      const { question, context, language } = payload;
      let prompt = `Lesson context:\n${context}\nStudent's question:\n${question}`;
      if (language === "fr") prompt = `Contexte du cours:\n${context}\nQuestion:\n${question}`;
      if (language === "ar") prompt = `النص:\n${context}\nسؤال الطالب:\n${question}`;

      const result = await model.generateContent(prompt);
      return res.status(200).json({ result: result.response.text() });
    }

    // ✅ Exercises
    if (task === "exercises") {
      const { text } = payload;
      const result = await model.generateContent(
        `Based on this lesson:\n${text}\n\nCreate 3 concise practice exercises (numbered).`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    // ✅ Check student answer
    if (task === "checkAnswer") {
      const { question, studentAnswer } = payload;
      const result = await model.generateContent(
        `Question:\n${question}\nStudent's answer: ${studentAnswer}\nEvaluate if it's correct. Explain briefly and provide corrections if needed.`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    // ❌ Invalid Task
    return res.status(400).json({ error: "Invalid task type" });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message || "Unknown error",
    });
  }
};
