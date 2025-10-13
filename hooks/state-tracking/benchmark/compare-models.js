#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const MODELS = [
  { name: 'gpt-4.1-mini', model: 'gpt-4.1-mini', label: 'GPT-4.1 Mini (Current)' },
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

/**
 * Load improved prompt
 */
function loadImprovedPrompt() {
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  const promptPath = join(benchmarkDir, '..', 'improved-prompt.txt');
  return readFileSync(promptPath, 'utf-8');
}

/**
 * Categorize prompt with specific model
 */
async function categorizeWithModel(prompt, modelConfig, systemPrompt) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  const { object: result } = await generateObject({
    model: openai(modelConfig.model, modelConfig.config || {}),
    schema: activitySchema,
    messages
  });

  return result;
}

/**
 * Calculate metrics
 */
function calculateMetrics(results, groundTruth) {
  const confusionMatrix = {};
  const activities = [...new Set([...results.map(r => r.activity), ...groundTruth.map(g => g.activity)])];

  // Initialize matrix
  for (const actual of activities) {
    confusionMatrix[actual] = {};
    for (const predicted of activities) {
      confusionMatrix[actual][predicted] = 0;
    }
  }

  // Populate matrix
  for (let i = 0; i < results.length; i++) {
    const actual = groundTruth[i].activity;
    const predicted = results[i].activity;
    confusionMatrix[actual][predicted]++;
  }

  // Calculate per-category metrics
  const metrics = {};
  for (const activity of activities) {
    const tp = confusionMatrix[activity][activity] || 0;
    let fp = 0, fn = 0;

    for (const other of activities) {
      if (other !== activity) {
        fp += confusionMatrix[other][activity] || 0;
        fn += confusionMatrix[activity][other] || 0;
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    metrics[activity] = { precision, recall, f1, support: tp + fn };
  }

  // Overall accuracy
  const correct = results.filter((r, i) => r.activity === groundTruth[i].activity).length;
  const accuracy = correct / results.length;

  // Effort metrics
  const effortDiffs = results.map((r, i) => Math.abs(r.effort - groundTruth[i].effort));
  const avgEffortDiff = effortDiffs.reduce((a, b) => a + b, 0) / effortDiffs.length;
  const withinOne = effortDiffs.filter(d => d <= 1).length / effortDiffs.length;

  return { accuracy, metrics, avgEffortDiff, withinOne, confusionMatrix };
}

/**
 * Main comparison
 */
async function main() {
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  const annotationsPath = join(benchmarkDir, 'annotations.json');

  if (!existsSync(annotationsPath)) {
    throw new Error('No annotations found. Run sample and annotate first.');
  }

  const annotations = JSON.parse(readFileSync(annotationsPath, 'utf-8'));
  const improvedPrompt = loadImprovedPrompt();

  console.log('Comparing models with improved prompt...\n');
  console.log(`Testing ${annotations.length} prompts\n`);

  const results = {};

  for (const modelConfig of MODELS) {
    console.log(`\n${modelConfig.label}:`);
    console.log('─'.repeat(60));

    const modelResults = [];
    const batchSize = 10;

    // Process in parallel batches
    for (let i = 0; i < annotations.length; i += batchSize) {
      const batch = annotations.slice(i, Math.min(i + batchSize, annotations.length));
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(annotations.length / batchSize);

      process.stdout.write(`\rProcessing batch ${batchNum}/${totalBatches}...`);

      // Run batch in parallel
      const batchPromises = batch.map(async (annotation) => {
        try {
          return await categorizeWithModel(annotation.prompt, modelConfig, improvedPrompt);
        } catch (err) {
          console.error(`\nError: ${err.message}`);
          return null;
        }
      });

      const batchPredictions = await Promise.all(batchPromises);
      modelResults.push(...batchPredictions);
    }

    console.log('\n');

    // Calculate metrics
    const groundTruth = annotations.map(a => a.annotation);
    const validResults = modelResults.filter((r, i) => r !== null);
    const validGroundTruth = groundTruth.filter((_, i) => modelResults[i] !== null);

    const stats = calculateMetrics(validResults, validGroundTruth);

    results[modelConfig.name] = {
      model: modelConfig.label,
      accuracy: (stats.accuracy * 100).toFixed(2),
      avgEffortDiff: stats.avgEffortDiff.toFixed(2),
      withinOne: (stats.withinOne * 100).toFixed(1),
      metrics: stats.metrics,
      confusionMatrix: stats.confusionMatrix,
      predictions: modelResults
    };

    console.log(`Accuracy: ${results[modelConfig.name].accuracy}%`);
    console.log(`Avg Effort Diff: ${results[modelConfig.name].avgEffortDiff}`);
    console.log(`Within ±1: ${results[modelConfig.name].withinOne}%`);
  }

  // Generate comparison report
  console.log('\n' + '='.repeat(80));
  console.log('MODEL COMPARISON REPORT');
  console.log('='.repeat(80) + '\n');

  console.log('Model'.padEnd(30) + 'Accuracy'.padEnd(15) + 'Effort Diff'.padEnd(15) + 'Within ±1');
  console.log('─'.repeat(80));

  for (const modelName of Object.keys(results)) {
    const r = results[modelName];
    console.log(
      r.model.padEnd(30) +
      `${r.accuracy}%`.padEnd(15) +
      r.avgEffortDiff.padEnd(15) +
      `${r.withinOne}%`
    );
  }

  // Save results
  const outputPath = join(benchmarkDir, 'model-comparison.json');
  writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n\nResults saved to: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
