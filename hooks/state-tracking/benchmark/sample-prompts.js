#!/usr/bin/env node

const { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

/**
 * Extracts user prompts from transcript JSONL files
 * @param {string} transcriptPath - Path to transcript file
 * @returns {Array<{prompt: string, sessionId: string, timestamp: string}>}
 */
function extractPromptsFromTranscript(transcriptPath) {
  const prompts = [];

  try {
    const content = readFileSync(transcriptPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        // Look for user prompts
        if (entry.type === 'user' && entry.message?.content && typeof entry.message.content === 'string') {
          const content = entry.message.content;

          // Filter out hook outputs, system messages, slash commands, and automated messages
          const shouldSkip = content.includes('<user-prompt-submit-hook>') ||
                            content.includes('<system-reminder>') ||
                            content.includes('<post-tool-use-hook>') ||
                            content.includes('<command-message>') ||
                            content.includes('<local-command-stdout>') ||
                            content.startsWith('/') ||
                            content.startsWith('Caveat: The messages below were generated');

          if (!shouldSkip) {
            prompts.push({
              prompt: content,
              sessionId: entry.sessionId,
              timestamp: entry.timestamp,
              uuid: entry.uuid
            });
          }
        }
      } catch (err) {
        // Skip malformed lines
        continue;
      }
    }
  } catch (err) {
    console.error(`Error reading transcript ${transcriptPath}: ${err.message}`);
  }

  return prompts;
}

/**
 * Randomly samples prompts from all transcripts
 * @param {number} sampleSize - Number of prompts to sample
 * @returns {Array<Object>}
 */
function samplePrompts(sampleSize = 100) {
  const projectsDir = join(homedir(), '.claude', 'projects');

  if (!existsSync(projectsDir)) {
    throw new Error(`Projects directory not found: ${projectsDir}`);
  }

  const allPrompts = [];

  // Read all project directories
  const projectDirs = readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found ${projectDirs.length} project directories`);

  // Extract prompts from each project
  for (const projectDir of projectDirs) {
    const projectPath = join(projectsDir, projectDir);
    const transcriptFiles = readdirSync(projectPath)
      .filter(file => file.endsWith('.jsonl'));

    for (const transcriptFile of transcriptFiles) {
      const transcriptPath = join(projectPath, transcriptFile);
      const prompts = extractPromptsFromTranscript(transcriptPath);
      allPrompts.push(...prompts);
    }
  }

  console.log(`Extracted ${allPrompts.length} total prompts`);

  // Filter out very short prompts (likely noise)
  const filteredPrompts = allPrompts.filter(p => p.prompt.length > 10);
  console.log(`${filteredPrompts.length} prompts after filtering short ones`);

  // Randomly sample
  const shuffled = filteredPrompts.sort(() => Math.random() - 0.5);
  const sampled = shuffled.slice(0, Math.min(sampleSize, filteredPrompts.length));

  return sampled;
}

/**
 * Main function
 */
function main() {
  const sampleSize = parseInt(process.argv[2]) || 100;

  console.log(`Sampling ${sampleSize} prompts...`);
  const samples = samplePrompts(sampleSize);

  // Create benchmark directory
  const benchmarkDir = join(homedir(), '.claude', 'hooks', 'state-tracking', 'benchmark');
  mkdirSync(benchmarkDir, { recursive: true });

  // Save samples to file
  const outputPath = join(benchmarkDir, 'samples.json');
  writeFileSync(outputPath, JSON.stringify(samples, null, 2));

  console.log(`\nSaved ${samples.length} samples to ${outputPath}`);
  console.log('\nNext steps:');
  console.log('1. Run: node annotate.js');
  console.log('2. Annotate each prompt with correct activity category');
  console.log('3. Run: node run-benchmark.js');
}

main();
