#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
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

  appendLog(`Processing session ${sessionId}`);

  // Check for meaningful file changes via git
  const { execSync } = await import('child_process');
  try {
    const gitStatus = execSync('git status --porcelain', { cwd, encoding: 'utf8' });
    const gitDiff = execSync('git diff --stat HEAD', { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();

    // Skip if no changes or only trivial changes (whitespace, comments)
    if (!gitStatus.trim() && !gitDiff) {
      appendLog('No file changes detected, skipping');
      process.exit(0);
    }
  } catch (error) {
    // Not a git repo or git command failed - continue anyway
    appendLog(`Git check failed: ${error.message}`);
  }

  const { userMessages, assistantMessages } = parseTranscript(transcriptPath);

  if (userMessages.length === 0 && assistantMessages.length === 0) {
    appendLog('No messages found in transcript, skipping');
    process.exit(0);
  }

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

  const systemPrompt = `You are a session historian responsible for maintaining a development history log.

Your task: Analyze the conversation and update ${cwd}/.claude/memory/history.md with a summary of substantive changes.

<requirements>
- ONLY document substantive logic, feature, or architectural changes
- IGNORE styling changes, comment additions, formatting, whitespace, or other non-functional changes
- If no substantive changes occurred, do NOT modify the history file at all
- Use past tense action verbs: implemented, added, fixed, refactored, updated, removed
- Use relative file paths from project root (e.g., src/file.ts not /absolute/path/to/src/file.ts)
- For modifications, explain what changed AND the resulting behavior
</requirements>

<output_format>
Use this nested structure:
- [past tense action verb] [feature/component/bug name]
  - added [component/function/file] to [relative/path/to/file]
  - modified [component/function] in [relative/path/to/file] so that [resulting behavior]
  - [additional file changes with paths]

Maximum 1-3 main accomplishments, each with specific file changes underneath.
</output_format>

<example>
- implemented user authentication system
  - added AuthProvider component to src/contexts/AuthContext.tsx
  - modified login form in src/pages/Login.tsx so that it validates credentials before submission
  - added token refresh logic to src/api/client.ts

- fixed memory leak in data fetching
  - modified useEffect cleanup in src/hooks/useDataFetch.ts so that subscriptions are properly cancelled
</example>

<instructions>
1. Read ${cwd}/.claude/memory/history.md
2. If substantive changes occurred: Add new entry at the top with today's date (${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })})
3. If no substantive changes: Do nothing, do not modify the file
4. History entries are ordered newest first (insert at top after frontmatter)
</instructions>
  `;

  const userPrompt = `<conversation>
${conversationContext.join('\n\n')}
</conversation>

Analyze the conversation and update the history file accordingly.`;

  try {
    query({
      prompt: userPrompt,
      cwd: cwd,
      options: {
        systemPrompt,
        model: 'claude-sonnet-4-5-20250929',
        allowedTools: ['Read', 'Edit', 'Write'],
        permissionMode: 'bypassPermissions',
        hooks: {},
        settingSources: [],
      },
    });

    appendLog(`Session history processing initiated: ${sessionId}`);
  } catch (error) {
    appendLog(`Error generating summary: ${error.message}`);
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
    appendLog('Missing transcript_path or session_id');
    process.exit(0);
  }

  appendLog(`SessionEnd triggered for ${sessionId}`);

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
