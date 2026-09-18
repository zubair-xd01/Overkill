import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, tone } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: "Input text is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Transform this everyday input into over-engineered jargon: "${text}"`,
      config: {
        systemInstruction: `You are "Overkill", an extreme corporate jargon generator. Your sole job is to transform simple human thoughts—whether in plain English, Hinglish, or Roman Urdu—into ridiculous, over-engineered corporate jargon.

Rules:
1. Target Tone: "${tone || 'LinkedIn Flex'}".
2. Output ONLY the transformed result in 1 to 2 sentences.
3. Do NOT wrap the result in quotation marks.
4. Do NOT include meta-commentary, greetings, or conversational filler.`
      }
    });

    const result = response.text ? response.text.trim() : "";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Vercel API Route Error:", error);
    return res.status(500).json({ error: "Failed to generate corporate jargon" });
  }
}
