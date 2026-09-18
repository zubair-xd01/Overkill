import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, tone } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Transform this text: "${text}"`,
      config: {
        systemInstruction: `You are an automated text transformation engine. Convert the input into corporate jargon for tone: ${tone}. Do not use quotes. Output 1-2 sentences in English only.`
      }
    });

    return res.status(200).json({ result: response.text.trim() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
