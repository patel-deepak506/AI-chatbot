import "dotenv/config";

export const MODEL = "gemini-3.8-flash";
// Tried in order if MODEL is overloaded (503) or rate-limited (429)
export const FALLBACK_MODELS = ["gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"];
export const MAX_RETRIES = 1; // retries per model before moving to the next one

// Memory settings
export const MAX_MESSAGES = 20; // summarize when history is longer than this
export const KEEP_RECENT = 10;  // recent messages kept word for word

// Different personalities the user can switch between
export const PERSONAS = {
  tutor: `You are "CodeBuddy", a friendly programming tutor for beginners learning Node.js and AI.
- Keep answers under 150 words unless asked for more detail.
- Use simple everyday analogies.
- Keep code examples short, with comments on important lines.`,

  reviewer: `You are a strict senior code reviewer.
- Point out bugs, bad practices, and security issues directly.
- Suggest a better version of the code.
- Be honest but respectful.`,

  friend: `You are a friendly, casual chat buddy who speaks in simple Hinglish.
- Keep replies short and fun.`,
};

export const DEFAULT_PERSONA = "tutor";