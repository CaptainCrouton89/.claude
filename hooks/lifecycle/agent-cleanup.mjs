#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const AGENT_RESPONSES_DIR = join(homedir(), '.claude', 'agent-responses');
const REGISTRY_PATH = join(AGENT_RESPONSES_DIR, '.active-pids.json');

function updateAgentLog(agentId) {
  const agentLogPath = join(AGENT_RESPONSES_DIR, `${agentId}.md`);
  if (!existsSync(agentLogPath)) {
    return;
  }

  try {
    const content = readFileSync(agentLogPath, 'utf-8');
    const endTime = new Date().toISOString();
    const updatedContent = content.replace(
      /Status: in-progress/,
      `Status: interrupted\nEnded: ${endTime}`
    );
    writeFileSync(agentLogPath, updatedContent, 'utf-8');
  } catch {
    // Ignore errors
  }
}

function cleanupRunnerScript(agentId) {
  const runnerScriptPath = join(AGENT_RESPONSES_DIR, `${agentId}_runner.mjs`);
  if (existsSync(runnerScriptPath)) {
    try {
      unlinkSync(runnerScriptPath);
    } catch {
      // Ignore errors
    }
  }
}

async function main() {
  // Read stdin (required by hook protocol)
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');

  if (!input.trim()) {
    process.exit(0);
  }

  const hookData = JSON.parse(input);

  // Skip if triggered by SDK query() calls to avoid killing agents during execution
  if (hookData.reason === 'other') {
    process.exit(0);
  }

  if (!existsSync(REGISTRY_PATH)) {
    process.exit(0);
  }

  let registry = {};
  try {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
  } catch {
    process.exit(0);
  }

  // Kill all tracked agent processes and update their logs
  for (const [agentId, pid] of Object.entries(registry)) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch (error) {
      // Process already completed or doesn't exist - ignore
    }

    // Update agent log with interrupted status and end time
    updateAgentLog(agentId);

    // Clean up runner script
    cleanupRunnerScript(agentId);
  }

  // Clear the registry
  writeFileSync(REGISTRY_PATH, JSON.stringify({}, null, 2), 'utf-8');

  process.exit(0);
}

main().catch(() => process.exit(0));
