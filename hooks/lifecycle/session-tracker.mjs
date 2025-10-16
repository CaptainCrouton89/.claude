#!/usr/bin/env node

import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const HOME = homedir();
const MARKERS_DIR = join(HOME, '.claude', '.session-markers');
const HOOK_NAME = 'session-tracker';

function appendLog(message) {
  const logPath = join(HOME, '.claude', 'logs', 'hooks.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}\n`;
  try {
    writeFileSync(logPath, entry, { flag: 'a' });
  } catch (error) {
    // Ignore logging failures
  }
}

async function main() {
  // Read stdin (required by hook protocol)
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');

  if (!input.trim()) {
    process.exit(0);
  }

  let hookData;
  try {
    hookData = JSON.parse(input);
  } catch (error) {
    appendLog(`Failed to parse hook input: ${error.message}`);
    process.exit(0);
  }

  // Skip if triggered by SDK query() calls to avoid nested recursion
  if (hookData.reason === 'other') {
    process.exit(0);
  }

  const eventName = hookData.hook_event_name;
  const sessionId = hookData.session_id;
  const pid = hookData.pid || process.ppid;
  const cwd = hookData.cwd || process.cwd();

  // Ensure markers directory exists
  try {
    mkdirSync(MARKERS_DIR, { recursive: true });
  } catch (error) {
    appendLog(`Failed to create markers directory: ${error.message}`);
    process.exit(0);
  }

  const markerPath = join(MARKERS_DIR, `${pid}.json`);

  if (eventName === 'SessionStart') {
    // Write session marker on SessionStart
    const marker = {
      sessionId,
      pid,
      cwd,
      startedAt: new Date().toISOString(),
    };

    try {
      writeFileSync(markerPath, JSON.stringify(marker, null, 2), 'utf-8');
      appendLog(`[SessionStart] pid=${pid}, sessionId=${sessionId}, cwd=${cwd}`);
    } catch (error) {
      appendLog(`[SessionStart] FAILED to write marker: ${error.message}`);
    }
  } else if (eventName === 'SessionEnd') {
    // Delete session marker on SessionEnd
    try {
      if (existsSync(markerPath)) {
        unlinkSync(markerPath);
        appendLog(`[SessionEnd] pid=${pid}, sessionId=${sessionId}, deleted marker`);
      } else {
        appendLog(`[SessionEnd] pid=${pid}, sessionId=${sessionId}, marker not found`);
      }
    } catch (error) {
      appendLog(`[SessionEnd] FAILED to delete marker: ${error.message}`);
    }
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
