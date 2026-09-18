import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function: POST /api/generate
 * Securely executes Gemini 2.5 Flash API calls on the server
 * without exposing the GEMINI_API_KEY to the browser.
 */
export default async function handler(req, res) {
  // 1. CORS & Method Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  // 2. Parse payload
  const body = req.body || {};
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const tone = typeof body.tone === 'string' ? body.tone.trim() : 'LinkedIn Flex';

  if (!text) {
    return res.status(400).json({ error: 'Missing or empty "text" parameter in request body.' });
  }

  // 3. Verify Server-Side API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured in environment variables.'
    });
  }

  // 4. Strict Corporate Translation System Prompt
  const systemInstruction = `You are an automated text transformation engine. Your ONLY job is to convert the input text into corporate jargon based on the requested tone style.

Tone Styles:
- Office Email: Passive-aggressive corporate speak, alignment phrases, and polite office buzzwords.
- LinkedIn Flex: Self-important viral post style full of career lessons, humblebrags, and leadership inspiration.
- Startup Founder: Unhinged Silicon Valley pitch deck speak, dense with AI, quantum hype, and disruption.

STRICT RULES:
- Do NOT engage in conversation.
- Do NOT say 'Here is your output' or use quotation marks.
- Do NOT repeat or echo the input text.
- Automatically correct any typos or slang in the input.
- Understand inputs in English, Roman Hindi, or Roman Urdu natively and output ONLY the translated corporate jargon in English.
- Output length: 1 to 2 sentences maximum.

Examples:
Input: 'I slept late and missed work' | Tone: Startup Founder
Output: Leveraged an extended rest cycle to optimize cognitive throughput and asynchronously realigned availability vectors.

Input: 'Maine chai pee li' | Tone: Office Email
Output: Successfully executed a low-latency beverage intake protocol to maximize personal operational readiness.

Input: 'Laptop chal nahi raha' | Tone: LinkedIn Flex
Output: Encountered a critical infrastructure degradation event today, reminding me that resilience is built during unexpected downtime.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Input: '${text}' | Tone: ${tone}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    let result = '';
    if (response && response.text) {
      result = response.text.trim().replace(/^["']|["']$/g, '');
    }

    if (!result) {
      return res.status(502).json({ error: 'Model generated empty output.' });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error('[API /api/generate Error]:', error);
    return res.status(500).json({
      error: 'Failed to transform text via Gemini API.',
      details: error.message || String(error)
    });
  }
}
