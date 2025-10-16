#!/usr/bin/env node

import { appendFileSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const { query } = await import(join(homedir(), '.claude', 'claude-cli', 'sdk.mjs'));

// Get configuration from environment variables
const agentLogPath = process.env.AGENT_LOG_PATH;
const prompt = process.env.AGENT_PROMPT;
const cwd = process.env.AGENT_CWD;
const outputStyleContent = process.env.AGENT_OUTPUT_STYLE || null;
const allowedAgentsJson = process.env.AGENT_ALLOWED_AGENTS || 'null';
const mcpServersConfigJson = process.env.AGENT_MCP_SERVERS || 'null';
const agentId = process.env.CLAUDE_AGENT_ID;
const childDepth = parseInt(process.env.CLAUDE_AGENT_DEPTH || '1', 10);
const registryPath = process.env.CLAUDE_RUNNER_REGISTRY_PATH;
const parentPid = process.env.CLAUDE_PARENT_PID;

const allowedAgents = allowedAgentsJson === 'null' ? null : JSON.parse(allowedAgentsJson);
const mcpServersConfig = mcpServersConfigJson === 'null' ? null : JSON.parse(mcpServersConfigJson);

const blockStates = new Map();
let sessionIdCaptured = false;

const appendToLog = (text) => {
  if (!text) {
    return;
  }
  appendFileSync(agentLogPath, text, 'utf-8');
};

const resolveMessageId = (message) => {
  return (
    message.message_id ||
    message.messageId ||
    message.id ||
    message.message?.id ||
    message.message?.message_id ||
    message.message?.uuid ||
    message.uuid ||
    agentId ||
    'message'
  );
};

const getBlockKey = (message, index = 0) => {
  const messageId = resolveMessageId(message);
  const block =
    message.content_block ||
    message.contentBlock ||
    message.block ||
    (Array.isArray(message.message?.content)
      ? message.message.content[index]
      : null);

  const blockId =
    block?.id ||
    block?.block_id ||
    block?.blockId ||
    message.block_id ||
    message.blockId;

  if (blockId) {
    return `${messageId}:${blockId}`;
  }

  const derivedIndex =
    typeof message.index === 'number'
      ? message.index
      : typeof index === 'number'
        ? index
        : 0;

  return `${messageId}:${derivedIndex}`;
};

const appendFullText = (message, block, index) => {
  if (!block || block.type !== 'text' || typeof block.text !== 'string') {
    return;
  }

  const key = getBlockKey(message, index);
  const previous = blockStates.get(key) || '';
  const nextText = block.text;

  if (previous !== nextText) {
    for (const existingValue of blockStates.values()) {
      if (existingValue === nextText) {
        blockStates.set(key, nextText);
        return;
      }
    }
  }

  if (nextText === previous) {
    return;
  }

  let delta = '';

  if (nextText.startsWith(previous)) {
    delta = nextText.slice(previous.length);
  } else {
    let prefixLength = 0;
    const limit = Math.min(previous.length, nextText.length);
    while (prefixLength < limit && previous[prefixLength] === nextText[prefixLength]) {
      prefixLength += 1;
    }

    if (prefixLength < previous.length) {
      delta = `\n${nextText}`;
    } else {
      delta = nextText.slice(prefixLength);
    }
  }

  if (delta) {
    appendToLog(delta);
    blockStates.set(key, nextText);
  }
};

const appendDeltaText = (message, deltaText) => {
  if (!deltaText) {
    return;
  }

  const key = getBlockKey(message, message.index ?? 0);
  const previous = blockStates.get(key) || '';
  const next = previous + deltaText;

  // Add newline before [UPDATE] if not already at line start
  let textToAppend = deltaText;
  if (deltaText.startsWith('[UPDATE]') && previous && !previous.endsWith('\n')) {
    textToAppend = '\n' + deltaText;
  }

  appendToLog(textToAppend);
  blockStates.set(key, next);
};

/**
 * Sanitizes a cwd path to match SDK's algorithm
 * @param {string} path - Working directory path
 * @returns {string} Sanitized path
 */
const sanitizeCwd = (path) => {
  return path.replace(/^\//, '').replace(/\//g, '-');
};

/**
 * Captures session information when first message arrives
 * @param {string} sessionId - Session ID from SDK
 */
const captureSessionInfo = (sessionId) => {
  if (sessionIdCaptured || !sessionId || !registryPath || !parentPid) {
    return;
  }

  try {
    const markersDir = join(homedir(), '.claude', '.session-markers');
    const parentMarkerPath = join(markersDir, `${parentPid}.json`);

    let parentSessionId = null;
    if (existsSync(parentMarkerPath)) {
      const markerContent = readFileSync(parentMarkerPath, 'utf-8');
      const marker = JSON.parse(markerContent);
      parentSessionId = marker.sessionId || null;
    }

    // Calculate transcript path using SDK's path sanitization algorithm
    const sanitized = sanitizeCwd(cwd);
    const transcriptPath = join(homedir(), '.claude', 'transcripts', sanitized, `session_${sessionId}.jsonl`);

    // Update registry with session info
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    if (registry[agentId]) {
      registry[agentId].sessionId = sessionId;
      registry[agentId].transcriptPath = transcriptPath;
      registry[agentId].parentSessionId = parentSessionId;
      registry[agentId].parentPid = parseInt(parentPid, 10);
      writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
    }

    sessionIdCaptured = true;
  } catch (error) {
    // Silently fail - session tracking is non-critical
  }
};

(async () => {
  try {
    const queryOptions = {
      cwd,
      permissionMode: 'bypassPermissions',
      metadata: {
        agentId,
        agentDepth: childDepth
      },
      hooks: {
        PreToolUse: [
          async (input) => {
            if (input.tool_name === 'Task') {
              const requestedAgent = input.tool_input?.subagent_type;
              if (Array.isArray(allowedAgents)) {
                if (!requestedAgent || !allowedAgents.includes(requestedAgent)) {
                  const allowedList = allowedAgents.length > 0 ? allowedAgents.join(', ') : 'none';
                  return {
                    hookSpecificOutput: {
                      hookEventName: 'PreToolUse',
                      permissionDecision: 'deny',
                      permissionDecisionReason: `This agent can only spawn: ${allowedList}. '${requestedAgent || 'unknown'}' is not allowed.`
                    }
                  };
                }
              }
            }
            return {};
          }
        ]
      }
    };

    if (outputStyleContent) {
      queryOptions.customSystemPrompt = outputStyleContent;
    }

    if (mcpServersConfig !== null) {
      queryOptions.mcpServers = mcpServersConfig;
    }

    const result = query({
      prompt,
      options: queryOptions
    });

    for await (const message of result) {
      // Capture session info on first message with session_id
      if (message.session_id) {
        captureSessionInfo(message.session_id);
      }

      if (message.type === 'assistant') {
        if (Array.isArray(message.message?.content)) {
          message.message.content.forEach((block, index) => {
            appendFullText(message, block, index);
          });
        }
      } else if (message.type === 'content_block_start') {
        const blockType =
          message.content_block?.type || message.contentBlock?.type;
        if (blockType === 'text') {
          const key = getBlockKey(message, message.index ?? 0);
          if (!blockStates.has(key)) {
            blockStates.set(key, '');
          }
        }
      } else if (message.type === 'content_block_delta') {
        if (message.delta?.type === 'text_delta') {
          appendDeltaText(message, message.delta.text);
        }
      } else if (message.type === 'message_delta') {
        if (message.delta?.type === 'text_delta') {
          appendDeltaText(message, message.delta.text);
        }
      } else if (message.type === 'result') {
        const status = message.subtype === 'success' ? 'done' : 'failed';
        const endTime = new Date().toISOString();

        // Read the file and update the front matter
        const content = readFileSync(agentLogPath, 'utf-8');
        const updatedContent = content.replace(/Status: in-progress/, `Status: ${status}\nEnded: ${endTime}`);

        writeFileSync(agentLogPath, updatedContent, 'utf-8');
      }
    }
  } catch (error) {
    appendFileSync(agentLogPath, `\n\n## Status: Failed\n\nError: ${error.message}\n`, 'utf-8');
  }
})();
