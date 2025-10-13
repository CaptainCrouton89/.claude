#!/usr/bin/env node

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const readline = require('readline');

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

const ACTIVITY_DESCRIPTIONS = {
  'debugging': 'Actively diagnosing and fixing broken functionality',
  'code-review': 'Evaluating existing code for quality, security, performance',
  'documenting': 'Writing documentation, READMEs, guides, API docs',
  'feature': 'Building new functionality or capabilities',
  'investigating': 'Understanding how existing code works, tracing logic flow',
  'planning': 'Creating implementation plans, breaking down features into steps',
  'requirements-gathering': 'Defining what to build, clarifying specifications',
  'security-auditing': 'Analyzing code for security vulnerabilities',
  'testing': 'Writing test code, improving test coverage',
  'other': 'Ambiguous requests, casual conversation, or unclear work'
};

const EFFORT_SCALE = `
1-2: Trivial (under 10 minutes)
3-4: Simple (10-30 minutes)
5-6: Moderate (30-90 minutes)
7-8: Complex (2-4 hours)
9-10: Major (multiple hours to days)
`;

/**
 * Truncate prompt for display
 */
function truncatePrompt(prompt, maxLength = 200) {
  if (prompt.length <= maxLength) {
    return prompt;
  }
  return prompt.slice(0, maxLength) + '...';
}

/**
 * Interactive annotation session
 */
async function annotate() {
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  const samplesPath = join(benchmarkDir, 'samples.json');
  const annotationsPath = join(benchmarkDir, 'annotations.json');

  if (!existsSync(samplesPath)) {
    throw new Error(`Samples file not found. Run: node sample-prompts.js first`);
  }

  const samples = JSON.parse(readFileSync(samplesPath, 'utf-8'));

  // Load existing annotations if they exist
  let annotations = [];
  if (existsSync(annotationsPath)) {
    annotations = JSON.parse(readFileSync(annotationsPath, 'utf-8'));
    console.log(`\nLoaded ${annotations.length} existing annotations\n`);
  }

  const annotatedUuids = new Set(annotations.map(a => a.uuid));
  const remaining = samples.filter(s => !annotatedUuids.has(s.uuid));

  if (remaining.length === 0) {
    console.log('All prompts have been annotated!');
    return;
  }

  console.log(`\n${remaining.length} prompts remaining to annotate\n`);
  console.log('Commands: q=quit, s=skip, ?=help\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question) => new Promise(resolve => rl.question(question, resolve));

  let currentIndex = 0;

  while (currentIndex < remaining.length) {
    const sample = remaining[currentIndex];

    console.log('\n' + '='.repeat(80));
    console.log(`\nPrompt ${currentIndex + 1}/${remaining.length}`);
    console.log('─'.repeat(80));
    console.log(truncatePrompt(sample.prompt, 300));
    console.log('─'.repeat(80));

    // Show categories
    console.log('\nActivity Categories:');
    ACTIVITIES.forEach((activity, idx) => {
      console.log(`  ${idx + 1}. ${activity.padEnd(25)} - ${ACTIVITY_DESCRIPTIONS[activity]}`);
    });

    const activityAnswer = await ask('\nActivity (1-10, or q/s/?): ');

    if (activityAnswer.toLowerCase() === 'q') {
      console.log('\nSaving annotations...');
      break;
    }

    if (activityAnswer.toLowerCase() === 's') {
      currentIndex++;
      continue;
    }

    if (activityAnswer === '?') {
      console.log('\nHelp:');
      console.log('  1-10: Select activity category');
      console.log('  q: Quit and save');
      console.log('  s: Skip this prompt');
      console.log('  ?: Show this help');
      continue;
    }

    const activityIdx = parseInt(activityAnswer) - 1;
    if (isNaN(activityIdx) || activityIdx < 0 || activityIdx >= ACTIVITIES.length) {
      console.log('Invalid selection. Try again.');
      continue;
    }

    const activity = ACTIVITIES[activityIdx];

    // Get effort level
    console.log(EFFORT_SCALE);
    const effortAnswer = await ask('Effort (1-10): ');

    const effort = parseInt(effortAnswer);
    if (isNaN(effort) || effort < 1 || effort > 10) {
      console.log('Invalid effort level. Try again.');
      continue;
    }

    // Save annotation
    annotations.push({
      uuid: sample.uuid,
      sessionId: sample.sessionId,
      timestamp: sample.timestamp,
      prompt: sample.prompt,
      annotation: {
        activity,
        effort
      }
    });

    writeFileSync(annotationsPath, JSON.stringify(annotations, null, 2));
    console.log(`\n✓ Saved (${annotations.length} total annotations)`);

    currentIndex++;
  }

  rl.close();

  console.log(`\n\nAnnotation session complete!`);
  console.log(`Total annotations: ${annotations.length}`);
  console.log(`\nSaved to: ${annotationsPath}`);
  console.log(`\nNext: Run 'node run-benchmark.js' to test accuracy`);
}

annotate().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
