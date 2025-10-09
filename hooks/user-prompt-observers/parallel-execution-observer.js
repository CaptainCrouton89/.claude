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

  const systemPrompt = `You are analyzing a user's prompt to determine if they want to parallelize work or execute tasks in parallel.

The key metric: Does the user indicate they want to POTENTIALLY parallelize work?

Trigger on ANY mention of parallelization intent:
- Direct keywords: "parallel", "parallelize", "concurrent", "simultaneously"
- Tentative language: "might parallelize", "could parallelize", "should parallelize"
- Implicit requests: "at the same time", "at once", "concurrently"
- Questions about parallelization: "can we parallelize", "should this be parallel"

Do NOT trigger on:
- Simple multi-step tasks without ANY parallelization keywords
- Lists of sequential tasks
- General "do multiple things" without parallel/concurrent context

Return needsParallelGuidance = true if the user mentions parallelization in ANY form.`;

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

@${parallelGuidePath}

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
