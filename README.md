# CodeBuddy CLI 🤖

A terminal chatbot built with Node.js and the Google Gemini API.

## Features
- Streaming responses (text appears word by word)
- Conversation memory with automatic summarization for long chats
- Switchable personalities: tutor, code reviewer, casual friend
- Save conversations to JSON
- Token usage shown after every reply

## Setup
1. Clone the repo and run `npm install`
2. Create a `.env` file with `GEMINI_API_KEY=your_key_here`
3. Run `npm start`

## What I learned
- How LLMs work (tokens, context windows, temperature)
- Prompt engineering (roles, few-shot examples, structured output)
- Streaming responses
- Managing memory with summarization