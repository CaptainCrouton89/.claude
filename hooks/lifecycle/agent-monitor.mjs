#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { basename, join, relative } from 'path';

const AGENT_RESPONSES_DIR = join(homedir(), '.claude', 'agent-responses');
const STATE_FILE = join(AGENT_RESPONSES_DIR, '.monitor-state.json');
const REGISTRY_PATH = join(AGENT_RESPONSES_DIR, '.active-pids.json');

// Ensure directory exists
mkdirSync(AGENT_RESPONSES_DIR, { recursive: true });

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function removePidFromRegistry(agentId) {
  if (!existsSync(REGISTRY_PATH)) {
    return;
  }

  try {
    const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
    delete registry[agentId];
    writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
  } catch {
    // Ignore errors
  }
}

function getAgentFiles() {
  if (!existsSync(AGENT_RESPONSES_DIR)) {
    return [];
  }

  return readdirSync(AGENT_RESPONSES_DIR)
    .filter(file => file.endsWith('.md') && file.startsWith('agent_'))
    .map(file => join(AGENT_RESPONSES_DIR, file));
}

function getFileInfo(filePath) {
  const stats = statSync(filePath);
  const content = readFileSync(filePath, 'utf-8');

  // Extract status from front matter
  const statusMatch = content.match(/Status: (\S+)/);
  const status = statusMatch ? statusMatch[1] : 'unknown';

  return {
    mtime: stats.mtimeMs,
    status,
    size: stats.size
  };
}

function getRelativePath(cwd, filePath) {
  const rel = relative(cwd, filePath);
  return `@${rel}`;
}

async function main() {
  // Read stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');

  if (!input.trim()) {
    process.exit(0);
  }

  const hookData = JSON.parse(input);
  const cwd = hookData.cwd;
  const state = loadState();
  const agentFiles = getAgentFiles();
  const updates = [];

  for (const filePath of agentFiles) {
    const fileInfo = getFileInfo(filePath);
    const fileId = filePath;

    // Check if this is a new file or has been modified
    if (!state[fileId] || state[fileId].mtime !== fileInfo.mtime) {
      const previousState = state[fileId];
      const relativePath = getRelativePath(cwd, filePath);

      // Only notify if file has content (not just created)
      if (fileInfo.size > 100) {
        // Check if status changed to done/failed
        const justCompleted = (fileInfo.status === 'done' || fileInfo.status === 'failed') &&
                              previousState?.status !== fileInfo.status;

        if (justCompleted && !previousState?.notified) {
          updates.push(`Agent completed: ${relativePath}`);
          // Remove PID from registry
          const agentId = basename(filePath, '.md');
          removePidFromRegistry(agentId);
          // Mark as notified
          fileInfo.notified = true;
        } else if (fileInfo.status === 'interrupted') {
          // Agent was interrupted - notify once and track in state
          if (previousState?.status !== 'interrupted' && !previousState?.notified) {
            updates.push(`Agent interrupted: ${relativePath}`);
            const agentId = basename(filePath, '.md');
            removePidFromRegistry(agentId);
            fileInfo.notified = true;
          }
          // Keep in state to prevent re-notification
        } else if (previousState) {
          // File was updated but not completed
          updates.push(`Agent updated: ${relativePath}`);
        }
      }

      // Update state only for in-progress agents
      state[fileId] = fileInfo;
    }
  }

  // Keep all agent states to prevent re-notification
  // State cleanup happens when agent files are deleted

  // Save updated state
  saveState(state);

  // Return notifications
  if (updates.length > 0) {
    const output = {
      hookSpecificOutput: {
        hookEventName: hookData.hook_event_name,
        additionalContext: updates.join('\n')
      }
    };
    console.log(JSON.stringify(output));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
