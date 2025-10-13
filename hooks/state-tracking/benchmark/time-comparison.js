#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const MODELS = [
  { name: 'gpt-4.1-mini', model: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { name: 'gpt-5-nano', model: 'gpt-5-nano', label: 'GPT-5 Nano', config: { reasoningEffort: 'low', textVerbosity: 'low' } }
];

const activitySchema = z.object({
  activity: z.enum([
    "debugging",
    "code-review",
    "documenting",
    "feature",
    "investigating",
    "planning",
    "requirements-gathering",
    "security-auditing",
    "testing",
    "other",
  ]),
  confidence: z.number().min(0).max(1),
  effort: z.number().int().min(1).max(10)
});

async function timeModel(modelConfig, prompt, systemPrompt) {
  const start = Date.now();

  await generateObject({
    model: openai(modelConfig.model, modelConfig.config || {}),
    schema: activitySchema,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]
  });

  const elapsed = Date.now() - start;
  return elapsed;
}

async function main() {
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  const annotationsPath = join(benchmarkDir, 'annotations.json');
  const promptPath = join(benchmarkDir, '..', 'improved-prompt.txt');

  const annotations = JSON.parse(readFileSync(annotationsPath, 'utf-8'));
  const systemPrompt = readFileSync(promptPath, 'utf-8');

  // Use first prompt
  const testPrompt = annotations[0].prompt;

  console.log('Testing latency with single prompt...\n');
  console.log(`Prompt: ${testPrompt.slice(0, 100)}...\n`);

  for (const modelConfig of MODELS) {
    console.log(`${modelConfig.label}:`);

    const elapsed = await timeModel(modelConfig, testPrompt, systemPrompt);

    console.log(`  Time: ${elapsed}ms\n`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
