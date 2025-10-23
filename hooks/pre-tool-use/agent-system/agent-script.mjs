#!/usr/bin/env node

import {
  appendFileSync,
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  readdirSync,
  promises as fsPromises
} from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { setTimeout as delay } from 'timers/promises';

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
const processedMessageIds = new Set();
let sessionIdCaptured = false;
let transcriptPath = null;
let transcriptPathCandidates = [];
let sessionMarkerPath = null;
let exitLogged = false;

const { open } = fsPromises;

const appendToLog = (text) => {
  if (!text) {
    return;
  }
  appendFileSync(agentLogPath, text, 'utf-8');
};

const resolveMessageId = (message) => {
  const resolvedId =
    message.message_id ||
    message.messageId ||
    message.id ||
    message.message?.id ||
    message.message?.message_id ||
    message.message?.uuid ||
    message.uuid ||
    null;

  if (resolvedId) {
    return resolvedId;
  }

  const timestamp =
    message.timestamp ||
    message.message?.timestamp ||
    (Array.isArray(message.message?.content)
      ? message.message.content.find((block) => typeof block?.timestamp === 'string')?.timestamp
      : null);

  const fallback = timestamp || `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  return `${agentId || 'agent'}:${fallback}`;
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

  // If we've already accumulated this text via deltas, skip the full text append
  // The deltas have already been written incrementally
  if (previous === nextText && blockStates.has(key)) {
    return;
  }

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

  // Add newline before [UPDATE] if not already at line start
  let textToAppend = deltaText;
  if (deltaText.startsWith('[UPDATE]') && previous && !previous.endsWith('\n')) {
    textToAppend = '\n' + deltaText;
  }

  const next = previous + textToAppend;

  appendToLog(textToAppend);
  blockStates.set(key, next);
};

/**
 * Sanitizes a cwd path to match SDK's algorithm
 * @param {string} path - Working directory path
 * @returns {string} Sanitized path
 */
const sanitizeCwd = (path) => {
  return path.replace(/^\//, '-').replace(/\//g, '-').replace(/\./g, '-');
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
    const transcriptDir = join(homedir(), '.claude', 'projects', sanitized);
    const legacyTranscriptDir = join(homedir(), '.claude', 'transcripts', sanitized);

    const candidatePaths = [
      join(transcriptDir, `session_${sessionId}.jsonl`),
      join(transcriptDir, `${sessionId}.jsonl`),
      join(legacyTranscriptDir, `session_${sessionId}.jsonl`)
    ];

    const resolvedTranscriptPath = candidatePaths.find((candidate) => {
      try {
        return existsSync(candidate);
      } catch {
        return false;
      }
    }) || candidatePaths[0];

    // Update registry with session info
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    if (registry[agentId]) {
      registry[agentId].sessionId = sessionId;
      registry[agentId].transcriptPath = resolvedTranscriptPath;
      registry[agentId].parentSessionId = parentSessionId;
      registry[agentId].parentPid = parseInt(parentPid, 10);
      writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
    }

    transcriptPath = resolvedTranscriptPath;
    transcriptPathCandidates = candidatePaths;

    // Attempt to locate the active session marker for this session
    try {
      const markersDir = join(homedir(), '.claude', '.session-markers');
      const markerEntries = readdirSync(markersDir, { withFileTypes: true });
      for (const entry of markerEntries) {
        if (!entry.isFile() || !entry.name.endsWith('.json')) {
          continue;
        }
        const markerFile = join(markersDir, entry.name);
        try {
          const markerContent = JSON.parse(readFileSync(markerFile, 'utf-8'));
          if (markerContent?.sessionId === sessionId) {
            sessionMarkerPath = markerFile;
            break;
          }
        } catch {
          // Ignore malformed marker files
        }
      }
    } catch {
      // Marker discovery best-effort only
    }

    sessionIdCaptured = true;
  } catch (error) {
    // Silently fail - session tracking is non-critical
  }
};

const updateEndedTimestamp = () => {
  try {
    const content = readFileSync(agentLogPath, 'utf-8');
    let updated = content;
    const timestamp = new Date().toISOString();

    if (updated.includes('Ended:')) {
      updated = updated.replace(/Ended: .*\n/, `Ended: ${timestamp}\n`);
    } else {
      updated = updated.replace(/Status: ([^\n]+)/, `Status: $1\nEnded: ${timestamp}`);
    }

    if (updated !== content) {
      writeFileSync(agentLogPath, updated, 'utf-8');
    }
  } catch {
    // Best effort only
  }
};

const appendSpeakerLine = (label, text) => {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed) {
    return;
  }

  try {
    const currentContent = readFileSync(agentLogPath, 'utf-8');
    if (currentContent.includes(`**${label}:** ${trimmed}`)) {
      return;
    }
  } catch {
    // Ignore read errors and attempt to append anyway
  }

  appendToLog(`\n\n**${label}:** ${trimmed}\n`);
  updateEndedTimestamp();
};

const extractMessageText = (content) => {
  if (!content) {
    return '';
  }

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  if (typeof content === 'object' && typeof content.text === 'string') {
    return content.text.trim();
  }

  return '';
};

const registerMessageId = (message) => {
  try {
    const messageId = resolveMessageId(message);
    if (messageId) {
      processedMessageIds.add(messageId);
    }
  } catch {
    // Ignore ID registration failures
  }
};

const shouldSkipUserEcho = (text) => {
  if (!text) {
    return true;
  }

  const normalizedText = text.trim();
  const normalizedPrompt = (prompt || '').trim();
  return normalizedText === normalizedPrompt;
};

const shouldSkipUserTranscript = (text) => {
  if (!text) {
    return true;
  }

  const normalized = text.trim();
  if (!normalized) {
    return true;
  }

  const lower = normalized.toLowerCase();
  if (lower.startsWith('caveat: the messages below were generated by the user while running local commands')) {
    return true;
  }

  const commandTagPatterns = [
    '<command-name>',
    '</command-name>',
    '<command-message>',
    '</command-message>',
    '<command-args>',
    '</command-args>',
    '<local-command-stdout>',
    '</local-command-stdout>'
  ];

  return commandTagPatterns.some((tag) => normalized.includes(tag));
};

const processTranscriptRecord = (line) => {
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    return;
  }

  let record;
  try {
    record = JSON.parse(trimmedLine);
  } catch {
    return;
  }

  if (!record || typeof record !== 'object') {
    return;
  }

  const messageId = resolveMessageId(record);
  if (processedMessageIds.has(messageId)) {
    return;
  }

  if (record.type === 'user') {
    const text = extractMessageText(record.message?.content);
    if (shouldSkipUserEcho(text)) {
      processedMessageIds.add(messageId);
      return;
    }

    if (shouldSkipUserTranscript(text)) {
      processedMessageIds.add(messageId);
      return;
    }

    if (text) {
      appendSpeakerLine('User', text);
      processedMessageIds.add(messageId);
    }
  } else if (record.type === 'assistant') {
    const text = extractMessageText(record.message?.content);
    if (text) {
      appendSpeakerLine('Assistant', text);
      processedMessageIds.add(messageId);
    }
  }
};

const sessionMarkerActive = () => {
  if (!sessionMarkerPath) {
    return true;
  }

  try {
    return existsSync(sessionMarkerPath);
  } catch {
    return true;
  }
};

const updateRegistryTranscriptPath = (updatedPath) => {
  if (!updatedPath) {
    return;
  }

  try {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    if (registry[agentId] && registry[agentId].transcriptPath !== updatedPath) {
      registry[agentId].transcriptPath = updatedPath;
      writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
    }
  } catch {
    // Ignore registry update failures
  }
};

const transcriptExists = () => {
  const resolveCandidate = () => {
    if (transcriptPathCandidates.length === 0) {
      return;
    }

    for (const candidate of transcriptPathCandidates) {
      try {
        if (existsSync(candidate)) {
          transcriptPath = candidate;
          updateRegistryTranscriptPath(candidate);
          break;
        }
      } catch {
        // Ignore candidate failures and continue scanning
      }
    }
  };

  if (!transcriptPath) {
    resolveCandidate();
  }

  if (!transcriptPath) {
    return false;
  }

  try {
    if (existsSync(transcriptPath)) {
      return true;
    }
  } catch {
    // Fall through to candidate resolution
  }

  // Current path missing—try again to find a new candidate (file may have been created under a different name)
  const previousPath = transcriptPath;
  resolveCandidate();

  if (!transcriptPath) {
    return false;
  }

  if (transcriptPath !== previousPath) {
    try {
      return existsSync(transcriptPath);
    } catch {
      return false;
    }
  }

  try {
    return existsSync(transcriptPath);
  } catch {
    return false;
  }
};

const ensureExitLogged = () => {
  if (exitLogged) {
    return;
  }

  appendSpeakerLine('Assistant', '[exited]');
  exitLogged = true;
};

const tailTranscript = async () => {
  if (!transcriptPath) {
    return;
  }

  let lastSize = 0;
  let bufferRemainder = '';
  let idleMs = 0;
  const pollIntervalMs = 1000;
  const maxIdleMs = 5 * 60 * 1000; // 5 minutes safety cap

  while (true) {
    if (!transcriptExists()) {
      idleMs += pollIntervalMs;
      if (!sessionMarkerActive() && idleMs > 10_000) {
        break;
      }
      if (idleMs >= maxIdleMs) {
        break;
      }
      await delay(pollIntervalMs).catch(() => {});
      continue;
    }

    idleMs += pollIntervalMs;

    let stats;
    try {
      stats = statSync(transcriptPath);
    } catch {
      await delay(pollIntervalMs).catch(() => {});
      continue;
    }

    if (stats.size < lastSize) {
      lastSize = 0;
      bufferRemainder = '';
    }

    if (stats.size > lastSize) {
      const readLength = stats.size - lastSize;
      try {
        const file = await open(transcriptPath, 'r');
        const buffer = Buffer.alloc(readLength);
        await file.read(buffer, 0, readLength, lastSize);
        await file.close();

        lastSize = stats.size;
        idleMs = 0;

        const combined = bufferRemainder + buffer.toString('utf-8');
        const lines = combined.split('\n');
        bufferRemainder = lines.pop() || '';

        for (const line of lines) {
          processTranscriptRecord(line);
        }
      } catch {
        // Ignore read failures and retry on next loop
      }
    }

    if (!sessionMarkerActive() && idleMs > 10_000) {
      break;
    }

    if (idleMs >= maxIdleMs) {
      break;
    }

    await delay(pollIntervalMs).catch(() => {});
  }

  if (bufferRemainder.trim().length > 0) {
    processTranscriptRecord(bufferRemainder);
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
        registerMessageId(message);
      } else if (message.type === 'user') {
        registerMessageId(message);
      } else if (message.type === 'content_block_start') {
        const blockType =
          message.content_block?.type || message.contentBlock?.type;
        if (blockType === 'text') {
          const key = getBlockKey(message, message.index ?? 0);
          if (!blockStates.has(key)) {
            // Add separator if this is not the first content block
            if (blockStates.size > 0) {
              appendToLog('\n\n');
            }
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
        registerMessageId(message);
      }
    }

    await tailTranscript();
    ensureExitLogged();
  } catch (error) {
    appendFileSync(agentLogPath, `\n\n## Status: Failed\n\nError: ${error.message}\n`, 'utf-8');
    ensureExitLogged();
  }
})();
