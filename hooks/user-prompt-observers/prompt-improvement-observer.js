#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { join } = require('path');
const { homedir } = require('os');

async function main() {
  // Read input from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');

  if (!input.trim()) {
    process.exit(0);
  }

  const hookData = JSON.parse(input);

  // Only run on UserPromptSubmit
  if (hookData.hook_event_name !== 'UserPromptSubmit') {
    process.exit(0);
  }

  const prompt = hookData.prompt || '';

  if (!prompt.trim()) {
    process.exit(0);
  }

  // Define the Zod schema for prompt improvement assessment
  const promptImprovementSchema = z.object({
    isPromptImprovementRequest: z.boolean().describe("Whether the prompt is requesting help with improving or enhancing prompts/prompting"),
    confidence: z.number().min(0).max(1).describe("0 = Low, 1 = High"),
  });

  const systemPrompt = `You are analyzing a user's prompt to determine if they are requesting help with improving, enhancing, or working on prompts/prompting.

Look for indicators such as:
- Explicit mentions of "improve prompt", "enhance prompt", "better prompt", "optimize prompt"
- Phrases like "prompting guide", "prompt engineering", "refine prompt"
- Requests to make prompts better, more effective, or clearer
- Questions about prompting techniques or best practices

Do NOT trigger on:
- General requests that happen to mention the word "prompt" in a different context (like "prompt the user")
- CLI/terminal prompts (command line prompts)
- Requests to create content that isn't specifically about prompt improvement

Return isPromptImprovementRequest = true ONLY if the user is specifically working on improving prompts or learning about prompting.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema: promptImprovementSchema,
      messages
    });

    // Only inject guidance if high confidence and is a prompt improvement request
    if (result.isPromptImprovementRequest && result.confidence >= 0.7) {
      const promptingGuidePath = join(homedir(), '.claude', 'guides', 'prompting-guide.md');

      const jsonOutput = {
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: `<system-reminder>The user has mentioned improving or enhancing prompts/prompting.

CRITICAL: You MUST read ${promptingGuidePath} for comprehensive guidance on writing effective prompts before proceeding with any prompt-related suggestions.

Only after reading and understanding this guide should you provide prompt improvement recommendations.
</system-reminder>`
        }
      };

      console.log(JSON.stringify(jsonOutput));
      process.exit(0);
    }

    // No guidance needed
    process.exit(0);
  } catch (err) {
    // Fail silently - don't block the prompt
    process.exit(0);
  }
}

main().catch(() => process.exit(0));
