import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { PERSONAS, DEFAULT_PERSONA } from "./config.js";
import { Memory } from "./memory.js";
import { streamReply, countTokens } from "./llm.js";
import { handleCommand } from "./commands.js";

const rl = readline.createInterface({ input, output });

// Everything the app needs to remember while running
const state = {
  memory: new Memory(),
  persona: DEFAULT_PERSONA,
};

console.log("🤖 CodeBuddy CLI is ready! Type /help to see commands.\n");

while (true) {
  const userInput = (await rl.question("You: ")).trim();
  if (!userInput) continue; // ignore empty input

  // Commands
  if (userInput.startsWith("/")) {
    const result = await handleCommand(userInput, state);
    if (result === "exit") break;
    continue;
  }

  // Normal chat
  try {
    if (await state.memory.summarizeIfNeeded()) {
      console.log("📝 (Older messages were summarized to save tokens.)\n");
    }

    state.memory.addUser(userInput);
    const systemInstruction = state.memory.buildSystemInstruction(PERSONAS[state.persona]);

    process.stdout.write("\nAI: ");
    const reply = await streamReply(state.memory.history, systemInstruction, (text) =>
      process.stdout.write(text)
    );

    state.memory.addModel(reply);

    const tokens = await countTokens(state.memory.history);
    console.log(`\n(${state.persona} | ${state.memory.history.length} messages | ${tokens} tokens)\n`);
  } catch (error) {
    state.memory.removeLastUser();
    console.log("\n⚠️ Error:", error.message, "\n");
  }
}

rl.close();
console.log("👋 Bye!");