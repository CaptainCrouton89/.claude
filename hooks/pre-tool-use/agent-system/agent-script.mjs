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

const normalizeText = (value) => {
  if (!value) {
    return '';
  }
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .trim();
};

let lastNormalizedText = null;

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
        for (const block of message.message.content) {
          if (block.type === 'text') {
            const normalized = normalizeText(block.text);
            if (!normalized || normalized === lastNormalizedText) {
              continue;
            }
            appendFileSync(agentLogPath, block.text + '\n', 'utf-8');
            lastNormalizedText = normalized;
          }
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

