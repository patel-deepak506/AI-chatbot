import { GoogleGenAI } from "@google/genai";
import { MODEL, FALLBACK_MODELS, MAX_RETRIES } from "./config.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 20000 }, // fail fast (20s) instead of hanging on an overloaded model
});

const MODELS = [MODEL, ...FALLBACK_MODELS];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 503 = model overloaded, 429 = rate limited, 500 = transient server error
function isRetryable(err) {
  const status = err?.status ?? err?.code;
  if ([429, 500, 503].includes(status)) return true;
  if (err?.name === "AbortError" || err?.name === "TimeoutError") return true;
  return /\b(429|500|503)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|timed? ?out|aborted/i.test(err?.message ?? "");
}

// Run fn(model), retrying with backoff and falling back to other models on temporary errors.
async function withRetry(fn) {
  let lastErr;
  for (const model of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn(model);
      } catch (err) {
        if (!isRetryable(err)) throw err;
        lastErr = err;
        if (process.env.DEBUG) console.error(`[${model}] attempt ${attempt + 1} failed: ${err.status ?? err.name}`);
        if (attempt < MAX_RETRIES) await sleep(1000 * 2 ** attempt); // 1s, 2s, ...
      }
    }
  }
  throw lastErr;
}

// Stream a reply, calling onChunk for every piece of text. Returns the full reply.
export async function streamReply(history, systemInstruction, onChunk) {
  return withRetry(async (model) => {
    const stream = await ai.models.generateContentStream({
      model,
      contents: history,
      config: { systemInstruction },
    });

    let fullReply = "";
    try {
      for await (const chunk of stream) {
        const text = chunk.text ?? "";
        onChunk(text);
        fullReply += text;
      }
    } catch (err) {
      // Text already printed: retrying would show the answer twice, so give up.
      if (fullReply) err.status = "STREAM_INTERRUPTED";
      throw err;
    }
    return fullReply;
  });
}

// Simple one-off request (used for summarizing)
export async function generateText(prompt, config = {}) {
  return withRetry(async (model) => {
    const response = await ai.models.generateContent({ model, contents: prompt, config });
    return response.text;
  });
}

export async function countTokens(contents) {
  return withRetry(async (model) => {
    const { totalTokens } = await ai.models.countTokens({ model, contents });
    return totalTokens;
  });
}
