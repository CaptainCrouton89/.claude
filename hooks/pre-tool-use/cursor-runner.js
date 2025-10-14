#!/usr/bin/env node

const { appendFileSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { spawn } = require('child_process');
const { createInterface } = require('readline');

const agentId = process.env.CURSOR_RUNNER_AGENT_ID;
const agentLogPath = process.env.CURSOR_RUNNER_LOG_PATH;
const registryPath = process.env.CURSOR_RUNNER_REGISTRY_PATH;
const workingDirectory = process.env.CURSOR_RUNNER_WORKING_DIRECTORY;
const childDepth = parseInt(process.env.CURSOR_RUNNER_CHILD_DEPTH || '1', 10) || 1;

let cursorArgs;
try {
  cursorArgs = JSON.parse(process.env.CURSOR_RUNNER_CURSOR_ARGS || '[]');
} catch (error) {
  cursorArgs = [];
}

if (!agentId || !agentLogPath || !registryPath || !workingDirectory || cursorArgs.length === 0) {
  process.exit(1);
}

const updateFrontmatter = (status) => {
  const endTime = new Date().toISOString();
  try {
    const content = readFileSync(agentLogPath, 'utf-8');
    const updatedContent = content.replace(/Status: in-progress/, `Status: ${status}\nEnded: ${endTime}`);
    writeFileSync(agentLogPath, updatedContent, 'utf-8');
  } catch {
    // ignore
  }
};

const updateRegistryPid = (pid, extra = {}) => {
  try {
    let registryData = {};
    if (existsSync(registryPath)) {
      try {
        registryData = JSON.parse(readFileSync(registryPath, 'utf-8'));
      } catch {
        registryData = {};
      }
    }
    if (!registryData[agentId]) {
      registryData[agentId] = {};
    }
    registryData[agentId].pid = pid;
    registryData[agentId] = { ...registryData[agentId], ...extra };
    writeFileSync(registryPath, JSON.stringify(registryData, null, 2), 'utf-8');
  } catch {
    // ignore registry failures
  }
};

const appendError = (message) => {
  appendFileSync(agentLogPath, `\n\n## Error\n\n${message}\n`, 'utf-8');
};

const collectTextChunks = (value, depth = 0, chunks = []) => {
  if (value == null || depth > 5) {
    return chunks;
  }

  const TEXT_KEYS = new Set(['text', 'content', 'delta', 'value', 'result', 'output_text']);
  const NESTED_KEYS = ['content', 'delta', 'message', 'value', 'parts', 'messages', 'choices', 'data', 'output_text'];

  if (typeof value === 'string') {
    if (value) {
      chunks.push(value);
    }
    return chunks;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectTextChunks(item, depth + 1, chunks);
    }
    return chunks;
  }

  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      if (TEXT_KEYS.has(key) && typeof nested === 'string' && nested) {
        chunks.push(nested);
      } else if (Array.isArray(nested) && key === 'content') {
        for (const block of nested) {
          collectTextChunks(block, depth + 1, chunks);
        }
      } else if (typeof nested === 'object' && nested !== null && NESTED_KEYS.includes(key)) {
        collectTextChunks(nested, depth + 1, chunks);
      } else if (key === 'delta' && typeof nested === 'string' && nested) {
        chunks.push(nested);
      }

      if (key === 'delta' && typeof nested === 'object') {
        collectTextChunks(nested, depth + 1, chunks);
      }
    }
  }

  return chunks;
};

process.on('uncaughtException', (error) => {
  const message = error && (error.stack || error.message) ? (error.stack || error.message) : String(error);
  appendFileSync(agentLogPath, `\n\n## Error\n\nUncaught exception: ${message}\n`, 'utf-8');
  updateFrontmatter('failed');
});

process.on('unhandledRejection', (reason) => {
  const message = reason && (reason.stack || reason.message) ? (reason.stack || reason.message) : String(reason);
  appendFileSync(agentLogPath, `\n\n## Error\n\nUnhandled rejection: ${message}\n`, 'utf-8');
  updateFrontmatter('failed');
});

let assistantContentWritten = false;
let processExited = false;
let lastAssistantText = '';

let child;
try {
  child = spawn('cursor-agent', cursorArgs, {
    env: {
      ...process.env,
      CLAUDE_AGENT_ID: agentId,
      CLAUDE_AGENT_DEPTH: String(childDepth)
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: workingDirectory
  });
} catch (error) {
  appendError(`Error spawning cursor-agent: ${error.message}`);
  updateFrontmatter('failed');
  process.exit(1);
}

if (!child || typeof child.pid !== 'number') {
  appendError('Failed to spawn cursor-agent: no PID returned.');
  updateFrontmatter('failed');
  process.exit(1);
}

updateRegistryPid(child.pid, { cursorPid: child.pid });

child.on('error', (error) => {
  appendError(`Error spawning cursor-agent: ${error.message}`);
  updateFrontmatter('failed');
});

const stdoutRl = createInterface({
  input: child.stdout,
  crlfDelay: Infinity
});

stdoutRl.on('line', (line) => {
  if (!line) {
    return;
  }

  try {
    const event = JSON.parse(line.trim());
    const eventType = typeof event.type === 'string' ? event.type.toLowerCase() : '';
    const isAssistantEvent =
      (eventType && (eventType === 'assistant' ||
                     eventType === 'assistant_delta' ||
                     eventType.includes('assistant') ||
                     eventType.includes('output_text') ||
                     eventType.includes('delta'))) ||
      event.role === 'assistant' ||
      event.message?.role === 'assistant';

    if (isAssistantEvent) {
      const deltaChunks = [];
      if (event.delta !== undefined) {
        collectTextChunks(event.delta, 0, deltaChunks);
      }

      if (deltaChunks.length > 0) {
        const deltaText = deltaChunks.join('');
        if (deltaText) {
          appendFileSync(agentLogPath, deltaText, 'utf-8');
          lastAssistantText += deltaText;
          assistantContentWritten = true;
        }
      }

      const messageChunks = [];
      if (event.message) {
        collectTextChunks(event.message, 0, messageChunks);
      }
      collectTextChunks(event.content, 0, messageChunks);
      collectTextChunks(event.text, 0, messageChunks);

      if (messageChunks.length > 0) {
        const messageText = messageChunks.join('');
        if (messageText) {
          let textToAppend = '';

          if (!lastAssistantText) {
            textToAppend = messageText;
          } else if (messageText === lastAssistantText) {
            textToAppend = '';
          } else if (messageText.startsWith(lastAssistantText)) {
            textToAppend = messageText.slice(lastAssistantText.length);
          } else {
            textToAppend = (assistantContentWritten ? '\n' : '') + messageText;
          }

          if (textToAppend) {
            appendFileSync(agentLogPath, textToAppend, 'utf-8');
            assistantContentWritten = true;
          }

          lastAssistantText = messageText;
        }
      }
    } else if (eventType === 'result' || (eventType && eventType.endsWith('.result'))) {
      const status = event.subtype === 'failure' ? 'failed' : 'done';

      if (!assistantContentWritten && typeof event.result === 'string' && event.result.trim()) {
        appendFileSync(agentLogPath, `${event.result.trim()}\n`, 'utf-8');
        assistantContentWritten = true;
      }

      updateFrontmatter(status);
      lastAssistantText = '';
    } else if (eventType === 'done' || eventType === 'complete' || event.type === 'done' || event.type === 'complete') {
      updateFrontmatter('done');
      lastAssistantText = '';
    } else if (event.type === 'error' || event.error) {
      const errorMsg = event.error || event.message || 'Unknown error';
      appendError(errorMsg);
      updateFrontmatter('failed');
      lastAssistantText = '';
    }
  } catch {
    // ignore malformed JSON
  }
});

const stderrRl = createInterface({
  input: child.stderr,
  crlfDelay: Infinity
});

stderrRl.on('line', (line) => {
  appendFileSync(agentLogPath, `\n[STDERR]: ${line}\n`, 'utf-8');
});

const finalizeFailure = (code, signal) => {
  if (processExited) return;
  processExited = true;

  const content = readFileSync(agentLogPath, 'utf-8');
  if (!content.includes('Status: done') && !content.includes('Status: failed')) {
    updateFrontmatter('failed');
    appendFileSync(agentLogPath, `\n\nProcess exited with code ${code ?? 'null'}${signal ? ` (signal: ${signal})` : ''}\n`, 'utf-8');
  }
};

child.on('exit', (code, signal) => {
  if (code !== 0) {
    finalizeFailure(code, signal);
  } else if (!processExited) {
    processExited = true;
    const content = readFileSync(agentLogPath, 'utf-8');
    if (!content.includes('Status: done') && !content.includes('Status: failed')) {
      updateFrontmatter('done');
    }
  }
});

child.on('close', (code, signal) => {
  if (code !== 0) {
    finalizeFailure(code, signal);
  }
});
