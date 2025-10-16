#!/usr/bin/env node

/**
 * Auto-copy skills on project initialization
 *
 * Detects when a new project was initialized (/init-workspace) and automatically
 * copies all personal and archived skills to the new project's .claude/skills directory.
 *
 * Execution: Runs on SessionEnd as a background worker
 */

import { readFileSync, existsSync, rmSync, spawn } from 'fs';
import { join } from 'path';

// Parse input from stdin
let inputData = {};
try {
  const data = readFileSync(0, 'utf-8');
  inputData = JSON.parse(data);
} catch (error) {
  process.exit(0); // Silently exit on parse error
}

// Only process SessionEnd events
if (inputData.hook_event_name !== 'SessionEnd') {
  process.exit(0);
}

// Skip internal SDK calls to prevent recursion
if (inputData.reason === 'other') {
  process.exit(0);
}

try {
  const projectRoot = process.cwd();
  const flagFile = join(projectRoot, '.claude', '.init-workspace-flag');

  // Check if this project was just initialized
  if (!existsSync(flagFile)) {
    process.exit(0); // Not a new project, nothing to do
  }

  const skillsDir = join(projectRoot, '.claude', 'skills');

  // Log function
  const appendLog = (message) => {
    const logPath = join(process.env.HOME, '.claude', 'logs', 'hooks.log');
    try {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [auto-copy-skills-on-init] ${message}\n`;
      require('fs').appendFileSync(logPath, logMessage);
    } catch (e) {
      // Silent fail on logging errors
    }
  };

  appendLog('Detected new project initialization, copying skills...');

  // Execute fetch-skills in background with proper detachment
  const fetchSkillsPath = join(process.env.HOME, '.claude', 'bin', 'fetch-skills');

  const child = spawn(fetchSkillsPath, ['copy', skillsDir], {
    detached: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: projectRoot
  });

  // Unref to allow parent process to exit
  child.unref();

  // Track completion
  child.stdout.on('data', (data) => {
    appendLog(`fetch-skills stdout: ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    appendLog(`fetch-skills stderr: ${data.toString().trim()}`);
  });

  child.on('close', (code) => {
    appendLog(`fetch-skills completed with code ${code}`);
    if (code === 0 && existsSync(flagFile)) {
      try {
        rmSync(flagFile);
        appendLog('Cleanup: Removed initialization flag file');
      } catch (e) {
        appendLog(`Cleanup error: ${e.message}`);
      }
    }
  });

  process.exit(0);

} catch (error) {
  // Error tolerance - don't break the session
  process.exit(0);
}
