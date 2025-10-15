#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { dirname, join } from 'path';

const LOG_PATH = '~/.claude/mcp-server-debug.log';
function log(message) {
  const logLine = `[${new Date().toISOString()}] ${message}\n`;
  appendFileSync(LOG_PATH, logLine, 'utf-8');
  console.error(logLine.trim()); // Also log to stderr for debugging
}

const VALIDATION_FILE = '.claude/validation.json';

function getValidationPath(cwd) {
  return join(cwd, VALIDATION_FILE);
}

function loadValidations(cwd) {
  const path = getValidationPath(cwd);
  if (!existsSync(path)) {
    return [];
  }
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveValidations(cwd, validations) {
  const path = getValidationPath(cwd);
  const dir = dirname(path);
  console.error(`[validation-mcp] saveValidations called - path: ${path}, cwd: ${cwd}`);
  if (!existsSync(dir)) {
    console.error(`[validation-mcp] Creating directory: ${dir}`);
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(path, JSON.stringify(validations, null, 2), 'utf-8');
  console.error(`[validation-mcp] Successfully wrote ${validations.length} validations`);
}

const server = new Server(
  {
    name: 'validation',
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
        name: 'saveValidationFailure',
        description: 'Save a validation failure to validation.json with timestamp',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Description of the validation failure',
            },
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional array of file paths related to this failure',
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'removeValidationFailure',
        description: 'Remove a validation failure by its timestamp',
        inputSchema: {
          type: 'object',
          properties: {
            timestamp: {
              type: 'string',
              description: 'ISO timestamp of the validation failure to remove',
            },
          },
          required: ['timestamp'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  log(`tools/call request: ${request.params.name}`);
  log(`args: ${JSON.stringify(request.params.arguments)}`);

  if (request.params.name === 'saveValidationFailure') {
    try {
      log('saveValidationFailure handler executing');
      const validations = loadValidations(cwd);
      log(`Loaded ${validations.length} existing validations`);

      validations.push({
        timestamp: new Date().toISOString(),
        content: request.params.arguments.content,
        ...(request.params.arguments.files && request.params.arguments.files.length > 0
          ? { files: request.params.arguments.files }
          : {}),
      });

      log(`About to save ${validations.length} validations to ${getValidationPath(cwd)}`);
      saveValidations(cwd, validations);
      log('Save completed successfully');

      return {
        content: [
          {
            type: 'text',
            text: `Saved to ${getValidationPath(cwd)}`,
          },
        ],
      };
    } catch (error) {
      log(`ERROR: ${error.message}`);
      log(`Stack: ${error.stack}`);
      throw error;
    }
  }

  if (request.params.name === 'removeValidationFailure') {
    log('removeValidationFailure handler executing');
    const validations = loadValidations(cwd);
    const filtered = validations.filter(v => v.timestamp !== request.params.arguments.timestamp);

    if (filtered.length === validations.length) {
      return {
        content: [
          {
            type: 'text',
            text: `No validation failure found with timestamp ${request.params.arguments.timestamp}`,
          },
        ],
      };
    }

    saveValidations(cwd, filtered);

    return {
      content: [
        {
          type: 'text',
          text: `Removed validation failure with timestamp ${request.params.arguments.timestamp}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start stdio server
log('MCP server starting...');
const transport = new StdioServerTransport();
await server.connect(transport);
log('MCP server connected successfully');
