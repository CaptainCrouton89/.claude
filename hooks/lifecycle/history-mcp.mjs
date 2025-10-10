#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LOG_PATH = '/Users/silasrhyneer/.claude/mcp-server-debug.log';
function log(message) {
  const logLine = `[${new Date().toISOString()}] [history-mcp] ${message}\n`;
  appendFileSync(LOG_PATH, logLine, 'utf-8');
  console.error(logLine.trim()); // Also log to stderr for debugging
}

const HISTORY_FILE = '.claude/memory/history.md';

function getHistoryPath(cwd) {
  return join(cwd, HISTORY_FILE);
}

function getMemoryDir(cwd) {
  return join(cwd, '.claude/memory');
}

function ensureHistoryFile(cwd) {
  const memoryDir = getMemoryDir(cwd);
  const historyPath = getHistoryPath(cwd);

  if (!existsSync(memoryDir)) {
    log(`Creating directory: ${memoryDir}`);
    mkdirSync(memoryDir, { recursive: true });
  }

  if (!existsSync(historyPath)) {
    const now = new Date().toISOString();
    const template = `---
created: ${now}
last_updated: ${now}
---

`;
    log(`Creating history file: ${historyPath}`);
    writeFileSync(historyPath, template, 'utf-8');
  }
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid history.md format: missing frontmatter');
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function updateFrontmatterTimestamp(frontmatter) {
  const now = new Date().toISOString();
  const lines = frontmatter.split('\n');
  const updatedLines = lines.map(line => {
    if (line.startsWith('last_updated:')) {
      return `last_updated: ${now}`;
    }
    return line;
  });
  return updatedLines.join('\n');
}

function formatEntry(title, bullets) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  let entry = `## ${dateStr}: ${title}\n\n`;

  for (const bullet of bullets) {
    entry += `- ${bullet.text}\n`;
    if (bullet.subbullets && bullet.subbullets.length > 0) {
      for (const subbullet of bullet.subbullets) {
        entry += `  - ${subbullet}\n`;
      }
    }
  }

  entry += '\n';
  return entry;
}

function logHistoryEntry(cwd, title, bullets) {
  ensureHistoryFile(cwd);

  const historyPath = getHistoryPath(cwd);
  const content = readFileSync(historyPath, 'utf-8');

  const { frontmatter, body } = parseFrontmatter(content);
  const updatedFrontmatter = updateFrontmatterTimestamp(frontmatter);

  const newEntry = formatEntry(title, bullets);

  // Enforce 250-line limit: trim oldest entries if necessary
  const MAX_LINES = 250;
  const frontmatterText = `---\n${updatedFrontmatter}\n---\n`;
  const fullContent = frontmatterText + newEntry + body;
  const totalLines = fullContent.split('\n').length;

  let trimmedBody = body;
  if (totalLines > MAX_LINES) {
    // Calculate how many lines to keep from body (oldest entries get removed)
    const frontmatterLines = frontmatterText.split('\n').length;
    const newEntryLines = newEntry.split('\n').length;
    const maxBodyLines = MAX_LINES - frontmatterLines - newEntryLines;

    if (maxBodyLines <= 0) {
      // New entry alone exceeds limit - keep only new entry
      trimmedBody = '';
      log(`WARNING: New entry uses ${newEntryLines} lines, removing all old entries`);
    } else {
      // Keep most recent entries from body (trim from end, which contains oldest entries)
      const bodyLines = body.split('\n');
      trimmedBody = bodyLines.slice(0, maxBodyLines).join('\n');
      log(`Trimmed history from ${bodyLines.length} to ${maxBodyLines} body lines (total: ${MAX_LINES} lines)`);
    }
  }

  const newContent = `---\n${updatedFrontmatter}\n---\n${newEntry}${trimmedBody}`;

  writeFileSync(historyPath, newContent, 'utf-8');
  log(`Successfully added entry: ${title}`);

  return historyPath;
}

const server = new Server(
  {
    name: 'history',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('tools/list request received');
  return {
    tools: [
      {
        name: 'logHistoryEntry',
        description: 'Log a history entry to .claude/memory/history.md with title and structured bullets',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Entry title (e.g., "implemented user authentication system")',
            },
            bullets: {
              type: 'array',
              description: 'Array of bullet points with optional nested subbullets',
              items: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'Bullet point text (e.g., "added AuthProvider component to src/contexts/AuthContext.tsx")',
                  },
                  subbullets: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional nested details (max 1 level deep)',
                  },
                },
                required: ['text'],
              },
            },
          },
          required: ['title', 'bullets'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  log(`tools/call request: ${request.params.name}`);
  log(`args: ${JSON.stringify(request.params.arguments)}`);

  if (request.params.name === 'logHistoryEntry') {
    try {
      log('logHistoryEntry handler executing');

      const { title, bullets } = request.params.arguments;

      if (!title || typeof title !== 'string') {
        throw new Error('title is required and must be a string');
      }

      if (!Array.isArray(bullets) || bullets.length === 0) {
        throw new Error('bullets is required and must be a non-empty array');
      }

      for (const bullet of bullets) {
        if (!bullet.text || typeof bullet.text !== 'string') {
          throw new Error('Each bullet must have a text property that is a string');
        }
        if (bullet.subbullets && !Array.isArray(bullet.subbullets)) {
          throw new Error('bullet.subbullets must be an array if provided');
        }
      }

      const historyPath = logHistoryEntry(cwd, title, bullets);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully logged history entry "${title}" to ${historyPath}`,
          },
        ],
      };
    } catch (error) {
      log(`ERROR: ${error.message}`);
      log(`Stack: ${error.stack}`);
      throw error;
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start stdio server
log('MCP server starting...');
const transport = new StdioServerTransport();
await server.connect(transport);
log('MCP server connected successfully');
