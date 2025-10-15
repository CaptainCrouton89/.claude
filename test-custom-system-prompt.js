#!/usr/bin/env node

// Test script to verify custom system prompt works with the Claude Code SDK
import { query } from "~/.claude/claude-cli/sdk.mjs";

try {
  // Create a query using the SDK with custom system prompt
  const response = query({
    prompt: "What tools do you have access to?",
    options: {
      pathToClaudeCodeExecutable: "~/.claude/claude-cli/cli.js",
      customSystemPrompt: "Respond with as few words as possible."
    }
  });

  console.log("SDK query created, processing response...");

  // Process the streaming response
  for await (const message of response) {
    if (message.type === 'assistant') {
      console.log("Assistant response:", message.message.content[0]?.text);
    } else if (message.type === 'result') {
      console.log("Result:", message.result);
    }
  }

  console.log("✅ Custom system prompt test completed successfully!");

} catch (error) {
  console.error("❌ Custom system prompt test failed:", error.message);
  process.exit(1);
}