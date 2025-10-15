#!/usr/bin/env node

import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { query } from '/Users/silasrhyneer/.claude/claude-cli/sdk.mjs';

// Get configuration from environment variables
const agentLogPath = process.env.AGENT_LOG_PATH;
const prompt = process.env.AGENT_PROMPT;
const cwd = process.env.AGENT_CWD;
const outputStyleContent = process.env.AGENT_OUTPUT_STYLE || null;
const allowedAgentsJson = process.env.AGENT_ALLOWED_AGENTS || 'null';
const mcpServersConfigJson = process.env.AGENT_MCP_SERVERS || 'null';
const agentId = process.env.CLAUDE_AGENT_ID;
const childDepth = parseInt(process.env.CLAUDE_AGENT_DEPTH || '1', 10);

const allowedAgents = allowedAgentsJson === 'null' ? null : JSON.parse(allowedAgentsJson);
const mcpServersConfig = mcpServersConfigJson === 'null' ? null : JSON.parse(mcpServersConfigJson);

const blockStates = new Map();

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

  appendToLog(deltaText);
  blockStates.set(key, next);
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
