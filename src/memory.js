import { generateText } from "./llm.js";
import { MAX_MESSAGES, KEEP_RECENT } from "./config.js";

export class Memory {
  constructor() {
    this.history = [];
    this.summary = "";
  }

  addUser(text) {
    this.history.push({ role: "user", parts: [{ text }] });
  }

  addModel(text) {
    this.history.push({ role: "model", parts: [{ text }] });
  }

  // Undo a user message if the API call failed
  removeLastUser() {
    if (this.history.at(-1)?.role === "user") this.history.pop();
  }

  clear() {
    this.history = [];
    this.summary = "";
  }

  // Returns true if a summary happened
  async summarizeIfNeeded() {
    if (this.history.length <= MAX_MESSAGES) return false;

    const oldMessages = this.history.splice(0, this.history.length - KEEP_RECENT);
    const transcript = oldMessages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.parts[0].text}`)
      .join("\n");

    this.summary = (
      await generateText(
        `Update the summary of this conversation.
Keep important facts about the user (name, goals, preferences, projects) and key topics discussed.
Keep it under 100 words.

Current summary:
"""${this.summary || "(none yet)"}"""

New messages to add:
"""${transcript}"""`,
        { temperature: 0 }
      )
    ).trim();

    return true;
  }

  buildSystemInstruction(basePrompt) {
    return this.summary
      ? `${basePrompt}\n\nSummary of the earlier conversation:\n${this.summary}`
      : basePrompt;
  }
}