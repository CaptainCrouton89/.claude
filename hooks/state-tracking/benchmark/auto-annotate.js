#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const ACTIVITIES = [
  'debugging',
  'code-review',
  'documenting',
  'feature',
  'investigating',
  'planning',
  'requirements-gathering',
  'security-auditing',
  'testing',
  'other'
];

/**
 * Auto-annotate prompts using Claude Sonnet 4.5
 */
async function autoAnnotate(prompt) {
  const systemPrompt = `You are an expert at categorizing developer activities. Analyze the user prompt and determine the correct activity category and effort level.

<activity_categories>
1. **debugging**: Actively diagnosing and fixing broken functionality, investigating why something isn't working as expected
   - Pattern: "Fix the bug", "why is this failing", "the output is wrong", examining error messages

2. **code-review**: Evaluating existing code for quality, security, performance, or best practices
   - Pattern: "Review this code", "is this secure", "check for vulnerabilities", quality assessment

3. **documenting**: Writing documentation, READMEs, guides, API docs, or explanatory comments
   - Pattern: "Write the README", "document the API", "add usage guide", creating explanations for others

4. **feature**: Building new functionality or capabilities that didn't exist before
   - Pattern: "Add ability to", "implement new feature", "build a system for", "implement this [file path]", creating new user-facing capabilities

5. **investigating**: Understanding how existing code works, tracing logic flow, exploring unfamiliar code
   - Pattern: "How does this work", "where is X implemented", "explain this code", learning existing systems

6. **requirements-gathering**: Defining what to build, clarifying specifications, asking discovery questions about desired functionality
    - Pattern: "What should this do", "help me figure out the requirements", "what features do we need"

7. **planning**: Creating implementation plans, breaking down features into steps, designing system architecture, making high-level design decisions
    - Pattern: "Make a plan", "create a plan for", "how should we structure this", "what's the best architecture for", designing multi-component solutions

8. **security-auditing**: Analyzing code for security vulnerabilities, penetration testing, threat modeling
    - Pattern: "Check for SQL injection", "audit security", "find vulnerabilities", proactive security analysis

9. **testing**: Writing test code, improving test coverage, or verifying functionality through tests
   - Pattern: "Write tests for", "add test coverage", "verify with tests", creating automated test suites

10. **other**: Ambiguous requests, casual conversation, or work that doesn't fit other categories
    - Pattern: "thoughts?", "hmm", "continue", unclear single-word prompts, general discussion
    - Use when confidence is low or the request doesn't match any specific category
</activity_categories>

<effort_scoring>
**1-2: Trivial** (under 10 minutes)
- Single command execution (ls, cat, grep, tail)
- One-line code changes or typo fixes
- Reading single file or checking status
- Simple questions with immediate answers

**3-4: Simple** (10-30 minutes)
- Few file reads or simple edits
- Basic config changes
- Straightforward explanations
- Quick clarifications

**5-6: Moderate** (30-90 minutes)
- Multi-file coordination
- New features following existing patterns
- Standard debugging across several files
- Writing test suites
- Creating new components/modules
- Feature documentation

**7-8: Complex** (2-4 hours)
- Novel feature development
- Complex debugging requiring investigation
- Multi-system integration
- Comprehensive security reviews

**9-10: Major** (multiple hours to days)
- Architectural decisions affecting core systems
- Critical production deployments with high risk
- Major system migrations
- Large features spanning many systems
- Deep security audits of entire codebase
- Emergency production incidents
</effort_scoring>

Categorize the developer activity and effort level based ONLY on what the user is asking for in their prompt.`;

  const schema = z.object({
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
    effort: z.number().int().min(1).max(10)
  });

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-5-mini', {
        structuredOutputs: true,
        reasoningEffort: 'low',
        textVerbosity: 'low'
      }),
      schema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    });

    return result;
  } catch (err) {
    throw new Error(`Failed to annotate: ${err.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  const samplesPath = join(benchmarkDir, 'samples.json');
  const annotationsPath = join(benchmarkDir, 'annotations.json');

  const samples = JSON.parse(readFileSync(samplesPath, 'utf-8'));
  console.log(`Auto-annotating ${samples.length} prompts using GPT-5 Mini with reasoning...\n`);

  const annotations = [];

  // Process in batches with parallelization
  const batchSize = 10;
  for (let i = 0; i < samples.length; i += batchSize) {
    const batch = samples.slice(i, Math.min(i + batchSize, samples.length));

    process.stdout.write(`\rProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(samples.length / batchSize)}...`);

    // Run batch in parallel
    const batchPromises = batch.map(async (sample) => {
      try {
        const result = await autoAnnotate(sample.prompt);
        return {
          uuid: sample.uuid,
          sessionId: sample.sessionId,
          timestamp: sample.timestamp,
          prompt: sample.prompt,
          annotation: {
            activity: result.activity,
            effort: result.effort
          }
        };
      } catch (err) {
        console.error(`\nError annotating prompt ${sample.uuid}: ${err.message}`);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    annotations.push(...batchResults.filter(r => r !== null));

    // Save progress after each batch
    writeFileSync(annotationsPath, JSON.stringify(annotations, null, 2));
  }

  // Final save
  writeFileSync(annotationsPath, JSON.stringify(annotations, null, 2));

  console.log(`\n\nDone! Annotated ${annotations.length} prompts`);
  console.log(`Saved to: ${annotationsPath}`);
  console.log(`\nNext: Run 'node run-benchmark.js' to test accuracy`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
