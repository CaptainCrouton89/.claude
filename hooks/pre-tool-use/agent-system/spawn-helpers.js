const { mkdirSync, writeFileSync, copyFileSync, chmodSync, unlinkSync } = require('fs');
const { join, relative } = require('path');
const { homedir } = require('os');
const { spawn } = require('child_process');

/**
 * Checks if a model is an Anthropic model
 * @param {string} modelString - Model name string
 * @returns {boolean} True if Anthropic model
 */
function isAnthropicModel(modelString) {
  if (!modelString) return true; // Default to Anthropic
  const model = modelString.toLowerCase();
  return model.startsWith('sonnet') ||
         model.startsWith('opus') ||
         model.startsWith('haiku') ||
         model.includes('claude');
}

/**
 * Sets up the agent environment (directories and files)
 * @param {Object} hookData - Hook data object
 * @param {string} agentId - Unique agent ID
 * @returns {Object} Object with agentsDir, agentLogPath, and registryPath
 */
function setupAgentEnvironment(hookData, agentId) {
  const agentsDir = join(hookData.cwd, 'agent-responses');
  mkdirSync(agentsDir, { recursive: true });

  // Copy await script to agent-responses directory
  const awaitSource = join(homedir(), '.claude', 'await');
  const awaitDest = join(agentsDir, 'await');
  try {
    copyFileSync(awaitSource, awaitDest);
    chmodSync(awaitDest, 0o755);
  } catch (error) {
    // Continue if copy fails
  }

  const agentLogPath = join(agentsDir, `${agentId}.md`);
  const registryPath = join(agentsDir, '.active-pids.json');

  return { agentsDir, agentLogPath, registryPath };
}

/**
 * Writes the initial log file for an agent
 * @param {string} agentLogPath - Path to agent log file
 * @param {string} description - Task description
 * @param {string} prompt - Agent prompt
 * @param {number} currentDepth - Current recursion depth
 * @param {string|null} parentAgentId - Parent agent ID
 */
function writeInitialLog(agentLogPath, description, prompt, currentDepth, parentAgentId) {
  const initialLog = `---
Task: ${description}
Instructions: ${prompt}
Started: ${new Date().toISOString()}
Status: in-progress
Depth: ${currentDepth}
ParentAgent: ${parentAgentId || 'root'}
---

`;
  writeFileSync(agentLogPath, initialLog, 'utf-8');
}

/**
 * Creates the delegation message to return to the user
 * @param {Object} hookData - Hook data object
 * @param {string} agentLogPath - Path to agent log file
 * @param {string} agentId - Agent ID
 * @returns {Object} Delegation message object
 */
function createDelegationMessage(hookData, agentLogPath, agentId) {
  const relativePath = relative(hookData.cwd, agentLogPath);
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Delegated to an agent. Response logged to @${relativePath} in real time.

A hook will alert you (not the user) on updates and when complete. To sleep until completion you must run \`./agent-responses/await ${agentId}\`. *The user cannot monitor progress or see updates themselves—you must either await this task _or_ perform other work until the agent is complete.* If this task is not-blocking, do not await it—perform other work until the agent is complete. Don't worry—you'll receive updates as it completes.`,
    },
  };
}

/**
 * Spawns a Claude agent using the SDK
 * @param {Object} options - Spawn options
 * @returns {Object} Spawned process
 */
function spawnClaudeAgent({
  agentId,
  currentDepth,
  hookData,
  agentLogPath,
  registryPath,
  agentScriptPath,
  prompt,
  outputStyleContent,
  normalizedAllowedAgents,
  resolvedMcpServers
}) {
  const claudeRunnerPath = join(__dirname, 'claude-runner.js');
  const allowedAgentsForScript = normalizedAllowedAgents === null 
    ? 'null' 
    : JSON.stringify(normalizedAllowedAgents);
  const mcpServersConfigForScript = resolvedMcpServers !== null 
    ? JSON.stringify(resolvedMcpServers) 
    : 'null';

  const runnerEnv = {
    ...process.env,
    CLAUDE_AGENT_ID: agentId,
    CLAUDE_AGENT_DEPTH: String(currentDepth + 1),
    CLAUDE_PARENT_PID: String(process.ppid),
    CLAUDE_RUNNER_AGENT_ID: agentId,
    CLAUDE_RUNNER_LOG_PATH: agentLogPath,
    CLAUDE_RUNNER_REGISTRY_PATH: registryPath,
    CLAUDE_RUNNER_WORKING_DIRECTORY: hookData.cwd,
    CLAUDE_RUNNER_SCRIPT_PATH: agentScriptPath,
    CLAUDE_RUNNER_CHILD_DEPTH: String(currentDepth + 1),
    AGENT_PROMPT: prompt,
    AGENT_CWD: hookData.cwd,
    AGENT_OUTPUT_STYLE: outputStyleContent || '',
    AGENT_ALLOWED_AGENTS: allowedAgentsForScript,
    AGENT_MCP_SERVERS: mcpServersConfigForScript
  };

  return spawn(process.execPath, [claudeRunnerPath], {
    env: runnerEnv,
    cwd: hookData.cwd,
    detached: true,
    stdio: 'ignore'
  });
}

/**
 * Spawns a Cursor agent using the CLI
 * @param {Object} options - Spawn options
 * @returns {Object} Spawned process
 */
function spawnCursorAgent({
  agentId,
  currentDepth,
  hookData,
  agentLogPath,
  registryPath,
  modelName,
  prompt,
  outputStyleContent
}) {
  const cursorRunnerPath = join(__dirname, 'cursor-runner.js');
  
  const cursorPrompt = outputStyleContent
    ? `${outputStyleContent}\n\n${prompt}`
    : prompt;

  const cursorArgs = [
    '--print',
    '--output-format', 'stream-json',
    '--stream-partial-output',
    '--force',
    '--model', modelName || 'auto'
  ];

  const cursorApiKey = process.env.CURSOR_API_KEY?.trim();
  if (cursorApiKey) {
    cursorArgs.push('--api-key', cursorApiKey);
  }

  cursorArgs.push(cursorPrompt);

  const runnerEnv = {
    ...process.env,
    CLAUDE_AGENT_ID: agentId,
    CLAUDE_AGENT_DEPTH: String(currentDepth + 1),
    CLAUDE_PARENT_PID: String(process.ppid),
    CURSOR_RUNNER_AGENT_ID: agentId,
    CURSOR_RUNNER_LOG_PATH: agentLogPath,
    CURSOR_RUNNER_REGISTRY_PATH: registryPath,
    CURSOR_RUNNER_WORKING_DIRECTORY: hookData.cwd,
    CURSOR_RUNNER_CURSOR_ARGS: JSON.stringify(cursorArgs),
    CURSOR_RUNNER_CHILD_DEPTH: String(currentDepth + 1)
  };

  const rawStreamPath = agentLogPath.replace(/\.md$/, '.cursor.ndjson');
  try {
    unlinkSync(rawStreamPath);
  } catch {
    // File may not exist
  }

  return spawn(process.execPath, [cursorRunnerPath], {
    env: runnerEnv,
    cwd: hookData.cwd,
    detached: true,
    stdio: 'ignore'
  });
}

module.exports = {
  isAnthropicModel,
  setupAgentEnvironment,
  writeInitialLog,
  createDelegationMessage,
  spawnClaudeAgent,
  spawnCursorAgent
};

