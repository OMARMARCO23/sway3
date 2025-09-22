import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { task, payload } = req.body;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    if (task === "summary") {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(
        `Summarize this for a high school learner:\n\n${payload.text}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === "hint") {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(
        `Give a very short one-sentence hint (not the answer) for this homework question:\n\n${payload.question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: "Invalid task type" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error during Gemini call" });
  }
}