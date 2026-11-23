import { writeFile } from "node:fs/promises";
import { PERSONAS } from "./config.js";

const HELP_TEXT = `
Commands:
  /help              Show this menu
  /clear             Erase the conversation memory
  /summary           Show the summary of older messages
  /persona           List available personalities
  /persona <name>    Switch personality (e.g. /persona reviewer)
  /save              Save the conversation to a JSON file
  /exit              Quit
`;

// Returns "exit" when the app should stop
export async function handleCommand(input, state) {
  const [command, argument] = input.split(" ");

  switch (command.toLowerCase()) {
    case "/help":
      console.log(HELP_TEXT);
      break;

    case "/clear":
      state.memory.clear();
      console.log("🧹 Memory cleared.\n");
      break;

    case "/summary":
      console.log(`\n📝 Summary:\n${state.memory.summary || "(empty)"}\n`);
      break;

    case "/persona":
      if (!argument) {
        console.log(`\nCurrent: ${state.persona}`);
        console.log(`Available: ${Object.keys(PERSONAS).join(", ")}\n`);
      } else if (PERSONAS[argument]) {
        state.persona = argument;
        console.log(`🎭 Switched to "${argument}".\n`);
      } else {
        console.log(`❌ Unknown persona "${argument}". Type /persona to see options.\n`);
      }
      break;

    case "/save": {
      const fileName = `chat-${Date.now()}.json`;
      const data = {
        savedAt: new Date().toISOString(),
        persona: state.persona,
        summary: state.memory.summary,
        history: state.memory.history,
      };
      await writeFile(fileName, JSON.stringify(data, null, 2));
      console.log(`💾 Saved to ${fileName}\n`);
      break;
    }

    case "/exit":
      return "exit";

    default:
      console.log(`❓ Unknown command. Type /help to see all commands.\n`);
  }
}