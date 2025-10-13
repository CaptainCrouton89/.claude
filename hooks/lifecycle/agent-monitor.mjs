#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

function loadState(stateFile) {
  if (!existsSync(stateFile)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(stateFile, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(stateFile, state) {
  writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf-8');
}

function removePidFromRegistry(registryPath, agentId) {
  if (!existsSync(registryPath)) {
    return;
  }

  try {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    delete registry[agentId];
    writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
  } catch {
    // Ignore errors
  }
}

function getAgentFiles(agentResponsesDir) {
  if (!existsSync(agentResponsesDir)) {
    return [];
  }

  return readdirSync(agentResponsesDir)
    .filter(file => file.endsWith('.md') && file.startsWith('agent_'))
    .map(file => join(agentResponsesDir, file));
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
    size: stats.size,
    content
  };
}

function extractUpdateContent(content, previousContent) {
  // Get new lines added since last check
  const currentLines = content.split('\n');
  const previousLines = previousContent ? previousContent.split('\n') : [];

  // Find lines with 📝 emoji that are new
  const updateLines = [];
  for (let i = 0; i < currentLines.length; i++) {
    const line = currentLines[i];
    if (line.includes('📝') && (i >= previousLines.length || previousLines[i] !== line)) {
      // Extract content after the emoji
      const contentAfter = line.substring(line.indexOf('📝') + 1).trim();
      if (contentAfter) {
        updateLines.push(contentAfter);
      }
    }
  }

  return updateLines.join('\n');
}

function getRelativePath(cwd, filePath) {
  // Remove cwd prefix if present, otherwise use basename
  if (filePath.startsWith(cwd)) {
    return `@${filePath.slice(cwd.length).replace(/^\//, '')}`;
  }
  return `@${basename(filePath)}`;
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

  // Use cwd-relative agent-responses directory
  const agentResponsesDir = join(cwd, 'agent-responses');
  const stateFile = join(agentResponsesDir, '.monitor-state.json');
  const registryPath = join(agentResponsesDir, '.active-pids.json');

  // Ensure directory exists
  mkdirSync(agentResponsesDir, { recursive: true });

  const state = loadState(stateFile);
  const agentFiles = getAgentFiles(agentResponsesDir);
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
          removePidFromRegistry(registryPath, agentId);
          // Mark as notified
          fileInfo.notified = true;
        } else if (fileInfo.status === 'interrupted') {
          // Agent was interrupted - notify once and track in state
          if (previousState?.status !== 'interrupted' && !previousState?.notified) {
            updates.push(`Agent interrupted: ${relativePath}`);
            const agentId = basename(filePath, '.md');
            removePidFromRegistry(registryPath, agentId);
            fileInfo.notified = true;
          }
          // Keep in state to prevent re-notification
        } else if (previousState) {
          // File was updated but not completed - extract update content
          const updateContent = extractUpdateContent(fileInfo.content, previousState.content);
          if (updateContent) {
            updates.push(`Agent update (${relativePath}): ${updateContent}`);
          } else {
            updates.push(`Agent updated: ${relativePath}`);
          }
        }
      }

      // Update state with content for next comparison
      state[fileId] = {
        mtime: fileInfo.mtime,
        status: fileInfo.status,
        size: fileInfo.size,
        content: fileInfo.content,
        notified: fileInfo.notified
      };
    }
  }

  // Keep all agent states to prevent re-notification
  // State cleanup happens when agent files are deleted

  // Save updated state
  saveState(stateFile, state);

  // Return notifications
  if (updates.length > 0) {
    const eventName = hookData.hook_event_name;
    let output;

    if (eventName === 'PostToolUse') {
      output = {
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: updates.join('\n')
        }
      };
    } else {
      // For Stop and other events, use systemMessage (shown to user only)
      output = {
        systemMessage: updates.join('\n')
      };
    }

    console.log(JSON.stringify(output));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
