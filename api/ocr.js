// api/ocr.js
// Cloud OCR fallback using Google Vision API (DOCUMENT_TEXT_DETECTION).
// Env: VISION_API_KEY

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { imageBase64, languageHints } = body || {};
    if (!imageBase64) return res.status(400).json({ error: "Missing imageBase64" });

    const key = process.env.VISION_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing VISION_API_KEY" });

    const payload = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: languageHints && Array.isArray(languageHints) ? { languageHints } : undefined,
        },
      ],
    };

    const r = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    const text = data?.responses?.[0]?.fullTextAnnotation?.text || "";
    return res.status(200).json({ text });
  } catch (e) {
    console.error("[api/ocr] error:", e);
    return res.status(500).json({ error: "OCR failed", details: String(e?.message || e) });
  }
};
