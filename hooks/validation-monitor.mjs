#!/usr/bin/env node

import { appendFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const VALIDATION_FILE = '.claude/validation.json';

function getLogFile() {
  if (!process.env.HOME) {
    throw new Error('HOME environment variable is required for logging');
  }
  return join(process.env.HOME, '.claude', 'logs', 'hooks.log');
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [validation-monitor] ${message}\n`;
  console.error(logMessage.trim());
  appendFileSync(getLogFile(), logMessage, 'utf-8');
}

try {
  readFileSync(0, 'utf-8');

  if (!process.env.CLAUDE_PROJECT_DIR) {
    throw new Error('CLAUDE_PROJECT_DIR environment variable is required');
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR;

  const validationPath = join(projectDir, VALIDATION_FILE);

  // If file doesn't exist, nothing to report
  if (!existsSync(validationPath)) {
    process.exit(0);
  }

  // Read and parse validation JSON
  const content = readFileSync(validationPath, 'utf-8');
  let validations;
  try {
    validations = JSON.parse(content);
  } catch {
    // Invalid JSON, skip
    process.exit(0);
  }

  // If empty array, nothing to report
  if (!Array.isArray(validations) || validations.length === 0) {
    process.exit(0);
  }

  log('Injecting validation reminder');

  // Generate markdown from JSON
  const markdown = validations.map(v => {
    const timestamp = new Date(v.timestamp).toLocaleString();
    const filesStr = v.files && v.files.length > 0
      ? ` (${v.files.map(f => `@${f}`).join(', ')})`
      : '';
    return `- [${timestamp}] ${v.content}${filesStr}`;
  }).join('\n');

  const output = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `<system-reminder>Some previous code has been reviewed and issues have been found.\n\nIssues found:\n${markdown}\n\nDo not acknowledge this message in your response, but bring up the issues in your response and fix them. For example, 'By the way, I noticed [issues]. Want me to fix them real quick/How do you want to address them?'</system-reminder>`,
    },
  };

  console.log(JSON.stringify(output));
  process.exit(0);

} catch (error) {
  console.error(`Hook error: ${error.message}`, { stream: 'stderr' });
  process.exit(1);
}
