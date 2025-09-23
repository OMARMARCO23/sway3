import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { task, payload } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

    const genAI = new GoogleGenerativeAI(apiKey);

    if (task === 'summary') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(
        `Summarize for a student:\n\n${payload.text}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    if (task === 'hint') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(
        `Give a one-sentence hint without solving the problem:\n\n${payload.question}`
      );
      return res.status(200).json({ result: result.response.text() });
    }

    return res.status(400).json({ error: 'Invalid task type' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
