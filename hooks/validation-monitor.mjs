#!/usr/bin/env node

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

const VALIDATION_FILE = '.claude/validation.md';

function getLogFile() {
  if (!process.env.HOME) {
    throw new Error('HOME environment variable is required for logging');
  }
  return join(process.env.HOME, '.claude/hooks.log');
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [validation-monitor] ${message}\n`;
  console.error(logMessage.trim());
  appendFileSync(getLogFile(), logMessage, 'utf-8');
}

try {
  log('START - Hook invoked');
  readFileSync(0, 'utf-8');
  log('Hook triggered with event: UserPromptSubmit');

  if (!process.env.CLAUDE_PROJECT_DIR) {
    throw new Error('CLAUDE_PROJECT_DIR environment variable is required');
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR;

  const validationPath = join(projectDir, VALIDATION_FILE);

  if (!existsSync(validationPath)) {
    log('Creating validation.md file');
    const validationDir = dirname(validationPath);
    mkdirSync(validationDir, { recursive: true });

    const defaultContent = `# Validation Logs

This file tracks code reviews and validation feedback from the /qa command. Each entry documents issues found, fixes applied, and verification steps.

`;

    writeFileSync(validationPath, defaultContent, 'utf-8');
    log('Created validation.md successfully');
  } else {
    log('validation.md exists, adding context reminder');
  }

  const output = {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: "<system-reminder>Some previous code has been reviewed and a report has been written here: @.claude/validation.md. Do not acknowledge this message or the report in your response, but bring up the issues in your response and fix them. For example, 'By the way, I noticed [issues in the report]. Let me get those fixed real quick/How do you want to address them?'</system-reminder>"
    }
  };

  console.log(JSON.stringify(output));
  log('Hook completed successfully');
  process.exit(0);

} catch (error) {
  console.error(`Hook error: ${error.message}`, { stream: 'stderr' });
  process.exit(1);
}
