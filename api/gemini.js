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

    // === Handle tasks ===
    if (task === "summary") {
      const { text, language } = payload;
      let prompt = text;
      if (language === "fr") prompt = `Explique simplement le texte en français:\n\n${text}`;
      if (language === "ar") prompt = `اشرح النص بلغة عربية مبسطة:\n\n${text}`;
      const result = await model.generateContent(prompt);
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "chat") {
      const { question, context, language } = payload;
      let prompt = `Lesson:\n${context}\n\nQuestion:\n${question}`;
      if (language === "fr") prompt = `Cours:\n${context}\n\nQuestion:\n${question}`;
      if (language === "ar") prompt = `الدرس:\n${context}\n\nسؤال الطالب:\n${question}`;
      const result = await model.generateContent(prompt);
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "hint") {
      const { question } = payload;
      const result = await model.generateContent(
        `Give a very short hint (not the answer) for this:\n\n${question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "exercises") {
      const { text, language } = payload;
      let prompt = `Create 3 exercises for the student from this lesson:\n${text}`;
      if (language === "fr") prompt = `Crée 3 exercices basés sur ce cours:\n${text}`;
      if (language === "ar") prompt = `أنشئ ٣ تمارين من هذا الدرس:\n${text}`;
      const result = await model.generateContent(prompt);
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "checkAnswer") {
      const { question, studentAnswer, language } = payload;
      let prompt = `Question:\n${question}\nStudent's answer:\n${studentAnswer}\nEvaluate correctness and give short feedback.`;
      if (language === "fr") prompt = `Question:\n${question}\nRéponse:\n${studentAnswer}\nÉvalue la réponse et donne un retour.`;
      if (language === "ar") prompt = `السؤال:\n${question}\nإجابة الطالب:\n${studentAnswer}\nقيّم الإجابة وقدم ملاحظات قصيرة.`;
      const result = await model.generateContent(prompt);
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: "Invalid task" });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Server crashed", details: String(err.message) });
  }
};
