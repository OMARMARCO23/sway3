import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    if (task === "summary") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        `Summarize this text for a high school student:\n\n${payload?.text}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "hint") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(
        `Give a short one-sentence hint (not answer) for:\n\n${payload?.question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: "Invalid task type" });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
}
