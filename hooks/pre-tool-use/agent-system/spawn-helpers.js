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
 * @param {number|null} pid - Process ID of the agent
 */
function writeInitialLog(agentLogPath, description, prompt, currentDepth, parentAgentId, pid) {
  const agentId = agentLogPath.match(/agent_[\w]+/)?.[0];
  let promptRef = '';
  let pidRef = '';

  // Store prompt separately so response file doesn't need to retain it
  if (agentId && prompt) {
    const agentDir = agentLogPath.replace(/agent_[\w]+\.md$/, '');
    const promptsDir = join(agentDir, '.agent-prompts');
    mkdirSync(promptsDir, { recursive: true });
    const promptPath = join(promptsDir, `${agentId}.txt`);
    writeFileSync(promptPath, prompt, 'utf-8');
    promptRef = `\nPrompt: .agent-prompts/${agentId}.txt`;
  }

  if (pid) {
    pidRef = `\nPID: ${pid}`;
  }

  const initialLog = `---
Task: ${description}
Started: ${new Date().toISOString()}
Status: in-progress
Depth: ${currentDepth}
ParentAgent: ${parentAgentId || 'root'}${promptRef}${pidRef}
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
      permissionDecisionReason: `Delegated to an agent. Response logged to ${relativePath} in real time.

A hook will alert you on updates and when complete. To sleep until completion you must run \`./agent-responses/await ${agentId}\` with a 10 minute timeout. *It is never acceptable to simply inform the user that they will be notified when the task is complete, since they WON'T be notified—only you will. You must await the agent, sleep and check agent responses, or work on other tasks until the agent is complete.* If this task is not-blocking, do not await it—perform other work until the agent is complete.`,
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
  resolvedMcpServers,
  modelName
}) {
  if (!modelName) {
    throw new Error(`Agent ${agentId} is missing required model configuration in agent definition`);
  }

  // Normalize haiku to full model name (fix so that old sdk works with new haiku model)
  const normalizedModelName = modelName && modelName.toLowerCase() === 'haiku'
    ? 'claude-haiku-4-5-20251001'
    : modelName;

  const claudeRunnerPath = join(__dirname, 'claude-runner.js');
  const allowedAgentsForScript = normalizedAllowedAgents === null
    ? 'null'
    : JSON.stringify(normalizedAllowedAgents);
  const mcpServersConfigForScript = resolvedMcpServers !== null
    ? JSON.stringify(resolvedMcpServers)
    : 'null';
  const rootSessionId = process.env.CLAUDE_ROOT_SESSION_ID
    ? process.env.CLAUDE_ROOT_SESSION_ID
    : hookData.session_id;
  if (!rootSessionId) {
    throw new Error('Missing session ID - cannot create agent context');
  }

  const outputStyle = typeof outputStyleContent === 'string' ? outputStyleContent : '';

  const runnerEnv = {
    ...process.env,
    CLAUDE_AGENT_ID: agentId,
    CLAUDE_AGENT_DEPTH: String(currentDepth + 1),
    CLAUDE_PARENT_PID: String(process.ppid),
    CLAUDE_ROOT_SESSION_ID: rootSessionId,
    CLAUDE_RUNNER_AGENT_ID: agentId,
    CLAUDE_RUNNER_LOG_PATH: agentLogPath,
    CLAUDE_RUNNER_REGISTRY_PATH: registryPath,
    CLAUDE_RUNNER_WORKING_DIRECTORY: hookData.cwd,
    CLAUDE_RUNNER_SCRIPT_PATH: agentScriptPath,
    CLAUDE_RUNNER_CHILD_DEPTH: String(currentDepth + 1),
    CLAUDE_RUNNER_MODEL: normalizedModelName,
    AGENT_PROMPT: prompt,
    AGENT_CWD: hookData.cwd,
    AGENT_OUTPUT_STYLE: outputStyle,
    AGENT_ALLOWED_AGENTS: allowedAgentsForScript,
    AGENT_MCP_SERVERS: mcpServersConfigForScript
  };

  const child = spawn(process.execPath, [claudeRunnerPath], {
    env: runnerEnv,
    cwd: hookData.cwd,
    detached: true,
    stdio: 'ignore'
  });

  // Store PID in environment for log file
  runnerEnv.CLAUDE_RUNNER_PID = String(child.pid);

  return child;
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
    CLAUDE_ROOT_SESSION_ID: process.env.CLAUDE_ROOT_SESSION_ID || hookData.session_id || '',
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

