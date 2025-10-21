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

function getCurrentAgentId() {
  return process.env.CLAUDE_AGENT_ID || null;
}

function loadRegistry(registryPath) {
  if (!existsSync(registryPath)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(registryPath, 'utf-8'));
  } catch {
    return {};
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

function isPidActive(pid) {
  if (!pid || typeof pid !== 'number') {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error && error.code === 'EPERM') {
      return true;
    }
    return false;
  }
}

function extractUpdateContent(content, lastNotifiedLine = -1) {
  // Only scan lines after the last notified update
  const lines = content.split('\n');
  const updateLines = [];
  let highestUpdateLine = lastNotifiedLine;

  for (let i = lastNotifiedLine + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('[UPDATE]')) {
      // Extract content after the marker
      const contentAfter = line.substring(line.indexOf('[UPDATE]') + 8).trim();
      if (contentAfter) {
        updateLines.push(contentAfter);
        highestUpdateLine = i;
      }
    }
  }

  return {
    text: updateLines.join('\n'),
    lastLine: highestUpdateLine
  };
}

function getRelativePath(cwd, filePath) {
  // Remove cwd prefix if present, otherwise use basename
  if (filePath.startsWith(cwd)) {
    return `${filePath.slice(cwd.length).replace(/^\//, '')}`;
  }
  return `${basename(filePath)}`;
}

function markAgentAsInterrupted(filePath, currentContent) {
  if (!currentContent.includes('Status: in-progress')) {
    return null;
  }

  const endTime = new Date().toISOString();
  const updatedContent = currentContent.replace(
    /Status: in-progress/,
    `Status: interrupted\nEnded: ${endTime}`
  );

  if (updatedContent === currentContent) {
    return null;
  }

  try {
    writeFileSync(filePath, updatedContent, 'utf-8');
    return updatedContent;
  } catch {
    return null;
  }
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

  const currentAgentId = getCurrentAgentId();
  const registry = loadRegistry(registryPath);
  const interruptionReasons = new Set([
    'user_interrupt',
    'prompt_input_exit',
    'cancelled',
    'user_cancel'
  ]);
  const reason = hookData.reason || null;
  const shouldCheckForInterruption =
    interruptionReasons.has(reason) ||
    hookData.hook_event_name === 'SubagentStop';

  for (const filePath of agentFiles) {
    let fileInfo = getFileInfo(filePath);
    const fileId = filePath;
    const previousState = state[fileId];
    const relativePath = getRelativePath(cwd, filePath);
    const agentId = basename(filePath, '.md');
    const registryEntry = registry[agentId];

    if (
      shouldCheckForInterruption &&
      fileInfo.status === 'in-progress' &&
      (!registryEntry || !isPidActive(registryEntry.pid))
    ) {
      const updatedContent = markAgentAsInterrupted(filePath, fileInfo.content);
      if (updatedContent) {
        fileInfo = getFileInfo(filePath);
        fileInfo.notified = true;

        if (!(previousState?.status === 'interrupted' && previousState?.notified)) {
          updates.push(`Agent interrupted: ${relativePath}`);
        }

        removePidFromRegistry(registryPath, agentId);

        state[fileId] = {
          mtime: fileInfo.mtime,
          status: fileInfo.status,
          size: fileInfo.size,
          content: fileInfo.content,
          notified: true
        };
        continue;
      }
    }

    // Check if this is a new file or has been modified
    if (
      !previousState ||
      previousState.mtime !== fileInfo.mtime ||
      previousState.status !== fileInfo.status
    ) {

      // Only notify if file has content (not just created)
      if (fileInfo.size > 100) {
        // Check if status changed to done/failed
        const justCompleted = (fileInfo.status === 'done' || fileInfo.status === 'failed') &&
                              previousState?.status !== fileInfo.status;

        if (justCompleted && !previousState?.notified) {
          // Skip if not our direct child
          if (registryEntry && registryEntry.parentId !== currentAgentId) {
            continue;
          }

          updates.push(`Agent completed: ${relativePath}`);
          // Remove PID from registry
          removePidFromRegistry(registryPath, agentId);
          // Mark as notified
          fileInfo.notified = true;
        } else if (fileInfo.status === 'interrupted') {
          // Agent was interrupted - notify once and track in state
          if (previousState?.status !== 'interrupted' && !previousState?.notified) {
            // Extract agent ID and check if it's our direct child
            // Skip if not our direct child
            if (registryEntry && registryEntry.parentId !== currentAgentId) {
              continue;
            }

            updates.push(`Agent interrupted: ${relativePath}`);
            removePidFromRegistry(registryPath, agentId);
            fileInfo.notified = true;
          }
          // Keep in state to prevent re-notification
        } else if (previousState) {
          // Extract agent ID and check if it's our direct child
          // Skip if not our direct child
          if (registryEntry && registryEntry.parentId !== currentAgentId) {
            continue;
          }

          // File was updated but not completed - extract update content
          const result = extractUpdateContent(fileInfo.content, previousState.lastUpdateLine ?? -1);
          if (result.text) {
            updates.push(`${agentId} update: ${result.text}`);
            fileInfo.lastUpdateLine = result.lastLine;
          }
        }
      }

      // Update state with content for next comparison
      state[fileId] = {
        mtime: fileInfo.mtime,
        status: fileInfo.status,
        size: fileInfo.size,
        content: fileInfo.content,
        notified: fileInfo.notified,
        lastUpdateLine: fileInfo.lastUpdateLine ?? previousState?.lastUpdateLine ?? -1
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
