import { GoogleGenAI } from '@google/genai';

const FALLBACK_MATRIX = {
  "i drank a cup of coffee": {
    "Office Email": "Successfully executed a low-latency beverage intake protocol to maximize personal operational readiness.",
    "LinkedIn Flex": "Brewing my morning coffee reminded me that deliberate habits compound into transformational leadership value.",
    "Startup Founder": "Deploying an autonomous thermal extraction matrix to disrupt cognitive latency across distributed workstreams."
  },
  "maine chai pee li": {
    "Office Email": "Successfully executed a low-latency beverage intake protocol to maximize personal operational readiness.",
    "LinkedIn Flex": "Taking time for a single cup of tea taught me that sustainable velocity starts with intentional pauses.",
    "Startup Founder": "Architected a zero-overhead bio-infusion pipeline to scale executive clarity ahead of our next funding cycle."
  },
  "i slept late and missed work": {
    "Office Email": "Due to an unscheduled latency buffer overnight, I am asynchronously realigning my calendar to meet today's milestones.",
    "LinkedIn Flex": "Missing morning standup forced me to reflect on radical rest as a prerequisite for sustainable elite performance.",
    "Startup Founder": "Leveraged an extended rest cycle to optimize cognitive throughput and asynchronously realigned availability vectors."
  },
  "laptop chal nahi raha": {
    "Office Email": "Presently liaising with technical support following an unanticipated hardware degradation event.",
    "LinkedIn Flex": "Encountered a critical infrastructure degradation event today, reminding me that resilience is built during unexpected downtime.",
    "Startup Founder": "Mitigating an edge compute node failure while hot-swapping local workloads to cloud-native fault-tolerant instances."
  },
  "mera code phat gaya": {
    "Office Email": "Our release build registered an unanticipated edge-case anomaly; triage measures are currently underway.",
    "LinkedIn Flex": "A production failure tested our squad today, proving that blameless culture converts downtime into compounding wisdom.",
    "Startup Founder": "Executed automated rollback telemetry after our distributed microservices encountered an adversarial state collision."
  },
  "boss ne meeting rakh li": {
    "Office Email": "Leadership has scheduled an ad-hoc synchronization sync to circulate high-priority strategic directives.",
    "LinkedIn Flex": "An impromptu executive sync challenged our status quo and reaffirmed our commitment to mission-critical alignment.",
    "Startup Founder": "Summoned to an urgent governance forum to re-index our burn rate and accelerate enterprise acquisition velocity."
  },
  "i restarted my router": {
    "Office Email": "Initiated a targeted telemetry reset on local telecommunications infrastructure to remediate degraded packet flow.",
    "LinkedIn Flex": "Power-cycling the network reminded me that visionary leadership sometimes requires clearing cached paradigms.",
    "Startup Founder": "Orchestrated a hard reboot of distributed edge ingress gateways to recover sub-millisecond network parity."
  }
};

function generateLocalJargon(text, tone) {
  const normalized = text.toLowerCase().trim();
  if (FALLBACK_MATRIX[normalized] && FALLBACK_MATRIX[normalized][tone]) {
    return FALLBACK_MATRIX[normalized][tone];
  }

  const cleaned = text
    .replace(/chai/gi, "bio-active tannin infusion")
    .replace(/tea/gi, "bio-active tannin infusion")
    .replace(/walk/gi, "pedestrian mobility session")
    .replace(/coffee/gi, "caffeine-driven performance boost")
    .replace(/slept/gi, "rested during an off-peak recovery cycle")
    .replace(/sleep/gi, "strategic rest window");

  if (tone === "Office Email") {
    return `Per my last update regarding how we executed "${cleaned}", cross-functional bandwidth has been successfully re-indexed.`;
  } else if (tone === "Startup Founder") {
    return `We engineered a low-latency "${cleaned}" framework to aggressively disrupt legacy operational bottlenecks.`;
  } else {
    return `Executing "${cleaned}" today reiterated that sustainable high-impact velocity starts with deliberate micro-optimizations.`;
  }
}

/**
 * Vercel Serverless Function: POST /api/generate
 * Securely executes Gemini Flash API calls on the server
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
    const fallback = generateLocalJargon(text, tone);
    return res.status(200).json({ result: fallback });
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

  // Candidate models in prioritized order (high capacity & speed first)
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.6-flash'
  ];

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const prompt = `Input: '${text}' | Tone: ${tone}`;

    let result = '';

    for (const model of candidateModels) {
      try {
        const config = {
          systemInstruction: systemInstruction,
          temperature: 0.7
        };
        if (model === 'gemini-3.8-flash') {
          config.thinkingConfig = { thinkingLevel: 'LOW' };
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config
        });

        if (response && response.text) {
          result = response.text.trim().replace(/^["']|["']$/g, '');
          if (result) break; // Succeeded!
        }
      } catch (modelErr) {
        // Expected transient high-demand (503) or rate-limit (429); quietly cascade to next candidate
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (!result) {
      // Graceful fallback if upstream models are all experiencing peak load
      result = generateLocalJargon(text, tone);
    }

    return res.status(200).json({ result });
  } catch (error) {
    const fallback = generateLocalJargon(text, tone);
    return res.status(200).json({ result: fallback });
  }
                                                         }
