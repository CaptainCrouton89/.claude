#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync } = require('fs');
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

  // Define the Zod schema for parallel execution assessment
  const parallelAssessmentSchema = z.object({
    needsParallelGuidance: z.boolean().describe("Whether the prompt indicates the user wants parallel execution"),
    confidence: z.number().min(0).max(1).describe("0 = Low, 1 = High"),
  });

  const systemPrompt = `You are analyzing a user's prompt to determine if they are requesting parallel execution or parallelization of tasks.

Look for indicators such as:
- Explicit mentions of "parallel", "parallelize", "concurrent", "simultaneously", "at the same time"
- Phrases like "in parallel", "run in parallel", "execute in parallel"
- Requests to do multiple things "at once" or "concurrently"

Do NOT trigger on:
- Simple multi-step tasks that don't explicitly request parallel execution
- Lists of tasks without parallelization keywords
- General requests to "do multiple things" without parallel context

Return needsParallelGuidance = true ONLY if the user explicitly wants parallel execution.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema: parallelAssessmentSchema,
      messages
    });

    // Only inject guidance if high confidence and needs guidance
    if (result.needsParallelGuidance && result.confidence >= 0.7) {
      // Load the parallel execution guide
      const parallelGuidePath = join(homedir(), '.claude', 'guides', 'parallel.md');

      try {
        const parallelGuideContent = readFileSync(parallelGuidePath, 'utf-8');

        const jsonOutput = {
          hookSpecificOutput: {
            hookEventName: 'UserPromptSubmit',
            additionalContext: `<system-reminder>The user has mentioned parallel execution or parallelization.

<parallelization-guide>
${parallelGuideContent}
</parallelization-guide>

</system-reminder>`
          }
        };

        console.log(JSON.stringify(jsonOutput));
        process.exit(0);
      } catch (readErr) {
        // Parallel guide not found, fail silently
        process.exit(0);
      }
    }

    // No guidance needed
    process.exit(0);
  } catch (err) {
    // Fail silently - don't block the prompt
    process.exit(0);
  }
}

main().catch(() => process.exit(0));
