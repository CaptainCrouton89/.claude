#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync, writeFileSync, existsSync } = require('fs');
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
 * Run activity tracker logic on a single prompt
 * This replicates the logic from activity-tracker.js
 */
async function categorizePrompt(prompt) {
  const systemPrompt = `You are analyzing a developer's conversation to categorize their current activity. Focus on what type of work is actually being done, not just keywords mentioned.

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

<decision_guidelines>
- Asking "why did you categorize that" = investigating, NOT the previous category
- Verifying if changes work = testing
- Focus on the PRIMARY work being done, not peripheral mentions
</decision_guidelines>

<effort_scoring>
Assess effort based on actual implementation complexity and time required. Be realistic about scope.

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

Based on the conversation, categorize the current development activity using the 10 categories above.`;

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
    confidence: z.number().min(0).max(1).describe("0 = Low, 1 = High"),
    effort: z
      .number()
      .int()
      .min(1)
      .max(10)
      .describe(
        "1-10 scale: 1-3 = trivial, 4-6 = moderate, 7-10 = complex/significant"
      ),
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: activitySchema,
      messages
    });

    return result;
  } catch (err) {
    throw new Error(`Failed to categorize prompt: ${err.message}`);
  }
}

/**
 * Calculate confusion matrix
 */
function buildConfusionMatrix(results) {
  const matrix = {};

  // Initialize matrix
  for (const actual of ACTIVITIES) {
    matrix[actual] = {};
    for (const predicted of ACTIVITIES) {
      matrix[actual][predicted] = 0;
    }
  }

  // Populate matrix
  for (const result of results) {
    const actual = result.annotation.activity;
    const predicted = result.prediction.activity;
    matrix[actual][predicted]++;
  }

  return matrix;
}

/**
 * Calculate per-category metrics
 */
function calculateMetrics(confusionMatrix) {
  const metrics = {};

  for (const activity of ACTIVITIES) {
    // True Positives
    const tp = confusionMatrix[activity][activity];

    // False Positives (predicted as this activity but was actually something else)
    let fp = 0;
    for (const actualActivity of ACTIVITIES) {
      if (actualActivity !== activity) {
        fp += confusionMatrix[actualActivity][activity];
      }
    }

    // False Negatives (actually this activity but predicted as something else)
    let fn = 0;
    for (const predictedActivity of ACTIVITIES) {
      if (predictedActivity !== activity) {
        fn += confusionMatrix[activity][predictedActivity];
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    metrics[activity] = {
      precision: precision.toFixed(3),
      recall: recall.toFixed(3),
      f1: f1.toFixed(3),
      support: tp + fn
    };
  }

  return metrics;
}

/**
 * Calculate effort correlation
 */
function calculateEffortCorrelation(results) {
  const differences = results.map(r =>
    Math.abs(r.annotation.effort - r.prediction.effort)
  );

  const avgDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
  const maxDifference = Math.max(...differences);

  return {
    avgDifference: avgDifference.toFixed(2),
    maxDifference,
    withinOne: differences.filter(d => d <= 1).length / differences.length * 100,
    withinTwo: differences.filter(d => d <= 2).length / differences.length * 100
  };
}

/**
 * Generate report
 */
function generateReport(results, confusionMatrix, metrics, effortStats) {
  const correctPredictions = results.filter(r =>
    r.annotation.activity === r.prediction.activity
  ).length;

  const accuracy = (correctPredictions / results.length * 100).toFixed(2);

  let report = '\n' + '='.repeat(80) + '\n';
  report += 'ACTIVITY TRACKER BENCHMARK REPORT\n';
  report += '='.repeat(80) + '\n\n';

  report += `Total Samples: ${results.length}\n`;
  report += `Overall Accuracy: ${accuracy}% (${correctPredictions}/${results.length})\n\n`;

  // Per-category metrics
  report += '─'.repeat(80) + '\n';
  report += 'PER-CATEGORY METRICS\n';
  report += '─'.repeat(80) + '\n';
  report += 'Activity'.padEnd(25) + 'Precision'.padEnd(12) + 'Recall'.padEnd(12) + 'F1'.padEnd(12) + 'Support\n';
  report += '─'.repeat(80) + '\n';

  for (const activity of ACTIVITIES) {
    const m = metrics[activity];
    report += activity.padEnd(25);
    report += m.precision.padEnd(12);
    report += m.recall.padEnd(12);
    report += m.f1.padEnd(12);
    report += m.support.toString() + '\n';
  }

  // Effort analysis
  report += '\n' + '─'.repeat(80) + '\n';
  report += 'EFFORT SCORING ACCURACY\n';
  report += '─'.repeat(80) + '\n';
  report += `Average Difference: ${effortStats.avgDifference}\n`;
  report += `Maximum Difference: ${effortStats.maxDifference}\n`;
  report += `Within ±1: ${effortStats.withinOne.toFixed(1)}%\n`;
  report += `Within ±2: ${effortStats.withinTwo.toFixed(1)}%\n`;

  // Confusion matrix
  report += '\n' + '─'.repeat(80) + '\n';
  report += 'CONFUSION MATRIX (Actual → Predicted)\n';
  report += '─'.repeat(80) + '\n';

  // Header
  report += 'Actual \\ Predicted'.padEnd(25);
  for (const predicted of ACTIVITIES) {
    report += predicted.slice(0, 8).padEnd(9);
  }
  report += '\n' + '─'.repeat(80) + '\n';

  // Rows
  for (const actual of ACTIVITIES) {
    report += actual.padEnd(25);
    for (const predicted of ACTIVITIES) {
      const count = confusionMatrix[actual][predicted];
      report += count.toString().padEnd(9);
    }
    report += '\n';
  }

  // Top confusions
  report += '\n' + '─'.repeat(80) + '\n';
  report += 'TOP CONFUSION PAIRS\n';
  report += '─'.repeat(80) + '\n';

  const confusions = [];
  for (const actual of ACTIVITIES) {
    for (const predicted of ACTIVITIES) {
      if (actual !== predicted && confusionMatrix[actual][predicted] > 0) {
        confusions.push({
          actual,
          predicted,
          count: confusionMatrix[actual][predicted]
        });
      }
    }
  }

  confusions.sort((a, b) => b.count - a.count);
  confusions.slice(0, 10).forEach(c => {
    report += `${c.actual} → ${c.predicted}: ${c.count}\n`;
  });

  report += '\n' + '='.repeat(80) + '\n';

  return report;
}

/**
 * Main function
 */
async function main() {
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  const annotationsPath = join(benchmarkDir, 'annotations.json');

  if (!existsSync(annotationsPath)) {
    throw new Error('No annotations found. Run: node annotate.js first');
  }

  const annotations = JSON.parse(readFileSync(annotationsPath, 'utf-8'));
  console.log(`Running benchmark on ${annotations.length} annotated prompts...\n`);

  const results = [];

  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];

    process.stdout.write(`\rProcessing ${i + 1}/${annotations.length}...`);

    try {
      const prediction = await categorizePrompt(annotation.prompt);

      results.push({
        uuid: annotation.uuid,
        prompt: annotation.prompt,
        annotation: annotation.annotation,
        prediction
      });
    } catch (err) {
      console.error(`\nError processing prompt ${annotation.uuid}: ${err.message}`);
    }
  }

  console.log('\n\nAnalyzing results...\n');

  // Build confusion matrix
  const confusionMatrix = buildConfusionMatrix(results);

  // Calculate metrics
  const metrics = calculateMetrics(confusionMatrix);

  // Calculate effort stats
  const effortStats = calculateEffortCorrelation(results);

  // Generate report
  const report = generateReport(results, confusionMatrix, metrics, effortStats);

  console.log(report);

  // Save results
  const resultsPath = join(benchmarkDir, 'results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  const reportPath = join(benchmarkDir, 'report.txt');
  writeFileSync(reportPath, report);

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log(`Report saved to: ${reportPath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
