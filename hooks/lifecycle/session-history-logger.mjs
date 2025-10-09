#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { query } from '/Users/silasrhyneer/.claude/claude-cli/sdk.mjs';

const HOOK_NAME = 'session-history-logger';

function appendLog(message) {
  const homeDir = process.env.HOME;
  if (!homeDir) {
    return;
  }
  const logPath = join(homeDir, '.claude', 'logs', 'hooks.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${HOOK_NAME}] ${message}\n`;
  try {
    writeFileSync(logPath, entry, { flag: 'a' });
  } catch (error) {
    // Ignore logging failures
  }
}

/**
 * Parse transcript JSONL file and extract user/assistant messages
 */
function parseTranscript(transcriptPath) {
  if (!existsSync(transcriptPath)) {
    return { userMessages: [], assistantMessages: [] };
  }

  const lines = readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  const userMessages = [];
  const assistantMessages = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      if (entry.type === 'user' && entry.message?.content) {
        const content = typeof entry.message.content === 'string'
          ? entry.message.content
          : entry.message.content;

        if (typeof content === 'string' && content.trim()) {
          userMessages.push(content.trim());
        }
      } else if (entry.type === 'assistant' && entry.message?.content) {
        let textContent = '';

        if (Array.isArray(entry.message.content)) {
          textContent = entry.message.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n');
        } else if (typeof entry.message.content === 'string') {
          textContent = entry.message.content;
        }

        if (textContent.trim()) {
          assistantMessages.push(textContent.trim());
        }
      }
    } catch (error) {
      // Skip malformed lines
      continue;
    }
  }

  return { userMessages, assistantMessages };
}

/**
 * Background worker that generates and saves the history entry
 */
async function backgroundWorker() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');
  const { transcriptPath, sessionId, cwd } = JSON.parse(input);

  // Check for meaningful file changes via git
  const { execSync } = await import('child_process');
  let gitStatus = '';
  let gitDiff = '';
  let gitCheckFailed = false;
  try {
    gitStatus = execSync('git status --porcelain', { cwd, encoding: 'utf8' });
    gitDiff = execSync('git diff --stat HEAD', { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();

    // Skip if no changes or only trivial changes (whitespace, comments)
    if (!gitStatus.trim() && !gitDiff) {
      appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] No file changes detected`);
      process.exit(0);
    }
  } catch (error) {
    // Not a git repo or git command failed - continue anyway
    gitCheckFailed = true;
  }

  const { userMessages, assistantMessages } = parseTranscript(transcriptPath);

  if (userMessages.length === 0 && assistantMessages.length === 0) {
    appendLog(`[START] session=${sessionId}, cwd=${cwd} | [SKIP] No messages in transcript`);
    process.exit(0);
  }

  appendLog(`[START] session=${sessionId}, cwd=${cwd}, messages=${userMessages.length}u/${assistantMessages.length}a${gitCheckFailed ? ', git-check-failed' : ''}`);


  // Build conversation context for summary
  const conversationContext = [];
  const maxUserMessages = 10;
  const maxAssistantMessages = 10;

  // Take up to 10 of each type of message
  const recentUser = userMessages.slice(-maxUserMessages);
  const recentAssistant = assistantMessages.slice(-maxAssistantMessages);

  for (let i = 0; i < Math.max(recentUser.length, recentAssistant.length); i++) {
    if (i < recentUser.length) {
      conversationContext.push(`User: ${recentUser[i]}`);
    }
    if (i < recentAssistant.length) {
      const truncated = recentAssistant[i].length > 500
        ? recentAssistant[i].slice(0, 500) + '...'
        : recentAssistant[i];
      conversationContext.push(`Assistant: ${truncated}`);
    }
  }

  const systemPrompt = `You are a session historian analyzing development conversations.

Your task: Identify substantive changes and log them using the logHistoryEntry tool.

<requirements>
- ONLY log substantive logic, feature, or architectural changes
- IGNORE styling, comments, formatting, whitespace, or non-functional changes
- Call logHistoryEntry once per major feature/change (usually 1-2 times per session)
- If no substantive changes occurred, do NOT call any tools
- Use past tense action verbs: implemented, added, fixed, refactored, updated, removed
- Use relative file paths from project root (e.g., src/file.ts)
- For modifications, explain what changed AND the resulting behavior
</requirements>

<tool_usage>
Call logHistoryEntry with:
- title: Past tense description of the change (e.g., "implemented user authentication")
- bullets: Array of specific file changes with paths
  - text: "added [component] to [path]" or "modified [component] in [path] so that [behavior]"
  - subbullets: Optional nested details (1 level deep max)

Example:
{
  title: "implemented user authentication system",
  bullets: [
    { text: "added AuthProvider component to src/contexts/AuthContext.tsx" },
    { text: "modified login form in src/pages/Login.tsx so that it validates credentials before submission" },
    { text: "added token refresh logic to src/api/client.ts" }
  ]
}
</tool_usage>

<instructions>
1. Analyze the conversation below
2. Identify substantive changes (ignore trivial/formatting changes)
3. Call logHistoryEntry once per major accomplishment
4. If no substantive work, do nothing
</instructions>

Project working directory: ${cwd}
  `;

  const userPrompt = `<conversation>
${conversationContext.join('\n\n')}
</conversation>

Analyze the conversation and log substantive changes using logHistoryEntry.`;

  try {
    const generator = query({
      prompt: userPrompt,
      cwd: cwd,
      options: {
        systemPrompt,
        model: 'claude-sonnet-4-5-20250929',
        allowedTools: ['Read'],
        permissionMode: 'bypassPermissions',
        hooks: {},
        settingSources: [],
        mcpServers: {
          history: {
            type: 'stdio',
            command: 'node',
            args: ['/Users/silasrhyneer/.claude/hooks/lifecycle/history-mcp.mjs'],
          }
        }
      },
    });

    let resultMessage;
    let toolCallCount = 0;
    for await (const message of generator) {
      if (message.type === 'tool_use') {
        toolCallCount++;
      }
      if (message.type === 'result') {
        resultMessage = message;
      }
    }

    if (resultMessage?.subtype === 'success') {
      if (toolCallCount > 0) {
        appendLog(`[DONE] session=${sessionId} | logged ${toolCallCount} history entries`);
      } else {
        appendLog(`[DONE] session=${sessionId} | no substantive changes to log`);
      }
    } else {
      appendLog(`[DONE] session=${sessionId} | completed with status: ${resultMessage?.subtype || 'unknown'}`);
    }
  } catch (error) {
    appendLog(`[ERROR] session=${sessionId} | ${error.message}`);
  }

  process.exit(0);
}

/**
 * Main hook execution
 */
async function main() {
  if (process.argv.includes('--background')) {
    await backgroundWorker();
    return;
  }

  const stdin = readFileSync(0, 'utf-8');
  const inputData = JSON.parse(stdin);

  if (inputData.hook_event_name !== 'SessionEnd') {
    process.exit(0);
  }

  // Skip if reason is other (e.g. triggered by query in hook itself)
  if (inputData.reason === 'other') {
    appendLog(`SessionEnd reason: ${inputData.reason}, skipping`);
    process.exit(0);
  }

  const transcriptPath = inputData.transcript_path;
  const sessionId = inputData.session_id;
  const cwd = inputData.cwd || process.cwd();

  if (!transcriptPath || !sessionId) {
    process.exit(0);
  }

  // Spawn detached background process
  const { spawn } = await import('child_process');

  const workerData = JSON.stringify({
    transcriptPath,
    sessionId,
    cwd,
  });

  const child = spawn(process.execPath, [
    import.meta.url.replace('file://', ''),
    '--background'
  ], {
    detached: true,
    stdio: ['pipe', 'ignore', 'ignore']
  });

  child.stdin.write(workerData);
  child.stdin.end();
  child.unref();

  process.exit(0);
}

main();
