#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

/**
 * Activity-based observers with their configuration
 */
const ACTIVITY_OBSERVERS = [
  {
    name: 'debugging',
    protocolDir: 'bug-fixing',
    thresholds: { moderate: 3, strong: 5 },
    emoji: '🐛'
  },
  {
    name: 'code-review',
    protocolDir: 'code-review',
    thresholds: { moderate: 3, strong: 5 },
    emoji: '👀'
  },
  {
    name: 'documenting',
    protocolDir: 'documentation',
    thresholds: { moderate: 5, strong: 7 },
    emoji: '📝'
  },
  {
    name: 'feature',
    protocolDir: 'feature-development',
    thresholds: { moderate: 5, strong: 7 },
    emoji: '✨'
  },
  {
    name: 'investigating',
    protocolDir: 'investigation',
    thresholds: { moderate: 4, strong: 6 },
    emoji: '🔍'
  },
  {
    name: 'planning',
    protocolDir: 'planning',
    thresholds: { moderate: 3, strong: 5 },
    emoji: '📋'
  },
  {
    name: 'requirements-gathering',
    protocolDir: 'requirements-gathering',
    thresholds: { moderate: 3, strong: 5 },
    emoji: '❓'
  },
  {
    name: 'security-auditing',
    protocolDir: 'security-audit',
    thresholds: { moderate: 3, strong: 5 },
    emoji: '🔒'
  },
  {
    name: 'testing',
    protocolDir: 'testing',
    thresholds: { moderate: 5, strong: 7 },
    emoji: '🧪'
  }
];

/**
 * Generic observer function - runs prompt analysis using gpt-4.1-nano
 */
async function runObserver(activityName, userPrompt) {
  const promptPath = join(
    homedir(),
    '.claude',
    'hooks',
    'user-prompt-observers',
    'prompts',
    `${activityName}.md`
  );

  let systemPrompt;
  try {
    systemPrompt = readFileSync(promptPath, 'utf-8');
  } catch (err) {
    return { isMatch: false, confidence: 0, effort: 0 };
  }

  const schema = z.object({
    isMatch: z.boolean().describe('Whether this activity matches the user prompt'),
    confidence: z.number().min(0).max(1).describe('0 = Low, 1 = High'),
    effort: z.number().int().min(1).max(10).describe('Estimated effort on 1-10 scale'),
  });

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return result;
  } catch (err) {
    return { isMatch: false, confidence: 0, effort: 0 };
  }
}

/**
 * Specialized observers (existing ones)
 */
async function checkPromptImprovement(userPrompt) {
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

  const schema = z.object({
    isPromptImprovementRequest: z.boolean(),
    confidence: z.number().min(0).max(1)
  });

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return {
      type: 'prompt-improvement',
      shouldInject: result.isPromptImprovementRequest && result.confidence >= 0.7,
      confidence: result.confidence
    };
  } catch (err) {
    return { type: 'prompt-improvement', shouldInject: false, confidence: 0 };
  }
}

async function checkParallelExecution(userPrompt) {
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

  const schema = z.object({
    needsParallelGuidance: z.boolean(),
    confidence: z.number().min(0).max(1)
  });

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return {
      type: 'parallel-execution',
      shouldInject: result.needsParallelGuidance && result.confidence >= 0.7,
      confidence: result.confidence
    };
  } catch (err) {
    return { type: 'parallel-execution', shouldInject: false, confidence: 0 };
  }
}

/**
 * Main registry function - runs all observers in parallel
 */
async function runAllObservers(userPrompt) {
  // Run all activity observers in parallel
  const activityPromises = ACTIVITY_OBSERVERS.map(async (observer) => {
    const result = await runObserver(observer.name, userPrompt);
    return {
      ...observer,
      ...result
    };
  });

  // Run specialized observers in parallel
  const specializedPromises = [
    checkPromptImprovement(userPrompt),
    checkParallelExecution(userPrompt)
  ];

  // Wait for all to complete
  const [activityResults, ...specializedResults] = await Promise.all([
    Promise.all(activityPromises),
    ...specializedPromises
  ]);

  return {
    activities: activityResults,
    specialized: specializedResults
  };
}

/**
 * Generate protocol recommendations based on effort
 */
function generateProtocolRecommendations(observer, effort) {
  const protocols = [];
  const { moderate: moderateThreshold, strong: strongThreshold } = observer.thresholds;

  // Check if effort is within 1 of moderate threshold (e.g., 4-5 for moderate:5, strong:7)
  if (effort >= moderateThreshold - 1 && effort <= moderateThreshold + 1) {
    const moderatePath = join(
      homedir(),
      '.claude',
      'protocols',
      observer.protocolDir,
      'moderate.md'
    );
    if (existsSync(moderatePath)) {
      protocols.push({ level: 'moderate', path: moderatePath.replace(homedir(), '~') });
    }
  }

  // Check if effort is within 1 of strong threshold (e.g., 6-8 for strong:7)
  if (effort >= strongThreshold - 1 && effort <= strongThreshold + 1) {
    const strongPath = join(
      homedir(),
      '.claude',
      'protocols',
      observer.protocolDir,
      'strong.md'
    );
    if (existsSync(strongPath)) {
      protocols.push({ level: 'strong', path: strongPath.replace(homedir(), '~') });
    }
  }

  return protocols;
}

/**
 * Build the combined context message
 */
function buildContextMessage(results) {
  const messages = [];

  // Process activity-based workflows
  const matchedActivities = results.activities.filter(
    (a) => a.isMatch && a.confidence >= 0.8
  );

  for (const activity of matchedActivities) {
    const protocols = generateProtocolRecommendations(activity, activity.effort);
    
    if (protocols.length > 0) {
      const protocolList = protocols.map(p => p.path).join(' and ');
      messages.push(
        `${activity.emoji} **${activity.name}**: ${protocolList}`
      );
    }
  }

  // Process specialized observers
  for (const specialized of results.specialized) {
    if (specialized.shouldInject) {
      if (specialized.type === 'prompt-improvement') {
        const guidePath = join(homedir(), '.claude', 'protocols', 'prompting-guide.md').replace(homedir(), '~');
        messages.push(`📚 **Prompt Improvement**: ${guidePath}`);
      } else if (specialized.type === 'parallel-execution') {
        const guidePath = join(homedir(), '.claude', 'protocols', 'parallel.md').replace(homedir(), '~');
        messages.push(`⚡ **Parallel Execution**: ${guidePath}`);
      }
    }
  }

  if (messages.length === 0) {
    return null;
  }

  const header = messages.length === 1
    ? 'Relevant workflow guidance for this task:'
    : 'Relevant workflow guidance for this task (you may use one or more depending on complexity—strong protocols are more comprehensive):';

  return `<system-reminder>${header}\n\n${messages.join('\n')}\n\nRead the applicable files and follow their workflows when you begin working on their respective activities, but do not acknowledge this message to the user.</system-reminder>`;
}

module.exports = {
  runAllObservers,
  buildContextMessage,
  ACTIVITY_OBSERVERS
};

