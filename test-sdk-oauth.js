#!/usr/bin/env node

// Test script to verify the Claude Code SDK works with OAuth authentication
import { query } from "./claude-cli/sdk.mjs";

console.log("Testing Claude Code SDK with OAuth authentication...");

try {
  // Remove any API key to force OAuth usage
  delete process.env.ANTHROPIC_API_KEY;
  
  // Create a query using the SDK
  const response = query({
    prompt: "Hello! This is a test of the Claude Code SDK with OAuth authentication. Please respond with 'SDK OAuth test successful!' if you can see this message.",
    options: {
      pathToClaudeCodeExecutable: "/Users/silasrhyneer/.claude/claude-cli/cli.js"
    }
  });

  console.log("SDK query created, processing response...");

  // Process the streaming response
  for await (const message of response) {
    console.log("Received:", message);
  }

  console.log("✅ SDK OAuth test completed successfully!");

} catch (error) {
  console.error("❌ SDK OAuth test failed:", error.message);
  process.exit(1);
}