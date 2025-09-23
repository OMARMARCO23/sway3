import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { task, payload } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in env' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    if (task === 'summary') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Summarize this for a high school student:\n\n${payload.text}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === 'hint') {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Provide a very short one-sentence hint for this question, without giving the answer:\n\n${payload.question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: 'Invalid task type' });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
