#!/usr/bin/env node

const { appendFileSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require('fs');
const { spawn } = require('child_process');

const agentId = process.env.CLAUDE_RUNNER_AGENT_ID;
const agentLogPath = process.env.CLAUDE_RUNNER_LOG_PATH;
const registryPath = process.env.CLAUDE_RUNNER_REGISTRY_PATH;
const workingDirectory = process.env.CLAUDE_RUNNER_WORKING_DIRECTORY;
const agentScriptPath = process.env.CLAUDE_RUNNER_SCRIPT_PATH;
const childDepth = parseInt(process.env.CLAUDE_RUNNER_CHILD_DEPTH || '1', 10) || 1;

if (!agentId || !agentLogPath || !registryPath || !workingDirectory || !agentScriptPath) {
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

const updateFrontmatterPid = (childPid) => {
  try {
    const content = readFileSync(agentLogPath, 'utf-8');
    // Replace the PID line if it exists, or add it before the closing ---
    if (content.includes('PID:')) {
      const updatedContent = content.replace(/PID: \d+/, `PID: ${childPid}`);
      writeFileSync(agentLogPath, updatedContent, 'utf-8');
    } else {
      const updatedContent = content.replace(/^---\n/, `---\nPID: ${childPid}\n`);
      writeFileSync(agentLogPath, updatedContent, 'utf-8');
    }
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

let processExited = false;

// Read additional environment variables for the agent script
const agentPrompt = process.env.AGENT_PROMPT;
const agentCwd = process.env.AGENT_CWD;
const agentOutputStyle = process.env.AGENT_OUTPUT_STYLE;
const agentAllowedAgents = process.env.AGENT_ALLOWED_AGENTS;
const agentMcpServers = process.env.AGENT_MCP_SERVERS;

let child;
try {
  child = spawn('node', [agentScriptPath], {
    env: {
      ...process.env,
      CLAUDE_AGENT_ID: agentId,
      CLAUDE_AGENT_DEPTH: String(childDepth),
      AGENT_LOG_PATH: agentLogPath,
      AGENT_PROMPT: agentPrompt,
      AGENT_CWD: agentCwd,
      AGENT_OUTPUT_STYLE: agentOutputStyle || '',
      AGENT_ALLOWED_AGENTS: agentAllowedAgents || 'null',
      AGENT_MCP_SERVERS: agentMcpServers || 'null'
    },
    stdio: 'ignore',
    cwd: workingDirectory,
    detached: true
  });
} catch (error) {
  appendError(`Error spawning node: ${error.message}`);
  updateFrontmatter('failed');
  process.exit(1);
}

if (!child || typeof child.pid !== 'number') {
  appendError('Failed to spawn node: no PID returned.');
  updateFrontmatter('failed');
  process.exit(1);
}

updateRegistryPid(child.pid, { nodePid: child.pid });
updateFrontmatterPid(child.pid);

child.on('error', (error) => {
  appendError(`Error spawning node: ${error.message}`);
  updateFrontmatter('failed');
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

child.unref();
