#!/usr/bin/env node

const { join } = require('path');
const { loadAgentDefinition } = require('./agent-system/agent-loader');
const { loadMcpServerLibrary, selectMcpServers } = require('./agent-system/mcp-manager');
const { readRegistry, writeRegistry, createAgentRegistryEntry, updateAgentPid } = require('./agent-system/registry-manager');
const {
  isAnthropicModel,
  setupAgentEnvironment,
  writeInitialLog,
  createDelegationMessage,
  spawnClaudeAgent,
  spawnCursorAgent
} = require('./agent-system/spawn-helpers');

const MAX_RECURSION_DEPTH = 3;

/**
 * Denies the spawn request and exits
 * @param {string} reason - Reason for denial
 */
function denySpawn(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

/**
 * Checks if the current agent has permission to spawn the subagent
 * @param {string|null} parentAgentId - Parent agent ID
 * @param {string} subagentType - Type of subagent to spawn
 * @param {Object} registry - Agent registry
 */
function checkAgentPermissions(parentAgentId, subagentType, registry) {
  const parentAgent = parentAgentId ? registry[parentAgentId] : null;

  if (parentAgent && parentAgent.agentType === subagentType) {
    const allowedForParent = Array.isArray(parentAgent.allowedAgents)
      ? parentAgent.allowedAgents
      : [];
    if (!allowedForParent.includes(subagentType)) {
      const parentType = parentAgent.agentType || parentAgentId;
      const allowedList = allowedForParent.length > 0 ? allowedForParent.join(', ') : 'none';
      denySpawn(`Agent '${parentType}' cannot spawn another '${subagentType}' instance. Same-type delegation requires listing the agent in allowedAgents (currently: ${allowedList}).`);
    }
  }

  if (parentAgent && Array.isArray(parentAgent.allowedAgents) && !parentAgent.allowedAgents.includes(subagentType)) {
    const allowedList = parentAgent.allowedAgents.length > 0 ? parentAgent.allowedAgents.join(', ') : 'none';
    const parentType = parentAgent.agentType || parentAgentId;
    denySpawn(`Agent '${parentType}' can only spawn: ${allowedList}. '${subagentType}' is not permitted.`);
  }

  if (!parentAgentId) {
    const rootDefinition = loadAgentDefinition('root');
    if (Array.isArray(rootDefinition.allowedAgents) && !rootDefinition.allowedAgents.includes(subagentType)) {
      const allowedList = rootDefinition.allowedAgents.length > 0 ? rootDefinition.allowedAgents.join(', ') : 'none';
      denySpawn(`Root session can only spawn: ${allowedList}. '${subagentType}' is not permitted.`);
    }
  }
}

/**
 * Generates a unique agent ID
 * @returns {string} Agent ID
 */
function generateAgentId() {
  return `agent_${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');

  if (!input.trim()) {
    process.exit(0);
  }

  const hookData = JSON.parse(input);

  // Only intercept Task tool calls
  if (hookData.tool_name !== 'Task') {
    process.exit(0);
  }

  // Get current depth from environment or hookData metadata
  const currentDepth = parseInt(process.env.CLAUDE_AGENT_DEPTH || '0', 10);
  const parentAgentId = process.env.CLAUDE_AGENT_ID || null;

  // Block if max depth reached
  if (currentDepth >= MAX_RECURSION_DEPTH) {
    denySpawn(`Maximum agent recursion depth (${MAX_RECURSION_DEPTH}) reached. Current depth: ${currentDepth}. Cannot spawn more nested agents.`);
  }

  const agentId = generateAgentId();
  const { agentLogPath, registryPath } = setupAgentEnvironment(hookData, agentId);

  // Parse tool input
  const toolInput = hookData.tool_input || {};
  const description = toolInput.description || 'Unnamed task';
  const prompt = toolInput.prompt + "\n\nGive me short, information-dense updates as you finish parts of the task (1-2 sentences, max. Incomplete sentences are fine). Only give these updates if you have important information to share. Prepend updates with: [UPDATE]";
  const subagentType = toolInput.subagent_type || 'general-purpose';

  // Load agent definition
  const agentDefinition = loadAgentDefinition(subagentType);
  const outputStyleContent = agentDefinition.systemPrompt;
  const modelName = agentDefinition.modelName;
  const agentAllowedAgents = agentDefinition.allowedAgents;
  const agentAllowedMcpServers = agentDefinition.allowedMcpServers;

  // Load and select MCP servers
  const { servers: availableMcpServers } = loadMcpServerLibrary({
    cwd: hookData.cwd,
    projectDir: hookData.project_dir || null
  });

  let resolvedMcpServers = null;
  let missingMcpServers = [];
  if (Array.isArray(agentAllowedMcpServers)) {
    const selection = selectMcpServers(agentAllowedMcpServers, availableMcpServers);
    resolvedMcpServers = selection.servers;
    missingMcpServers = selection.missing;
  }

  const normalizedAllowedAgents = Array.isArray(agentAllowedAgents) ? [...agentAllowedAgents] : null;
  const normalizedAllowedMcpServers = Array.isArray(agentAllowedMcpServers) ? [...agentAllowedMcpServers] : null;

  // Check permissions and initialize
  let registry = readRegistry(registryPath);
  checkAgentPermissions(parentAgentId, subagentType, registry);
  writeInitialLog(agentLogPath, description, prompt, currentDepth, parentAgentId);

  // Track this agent in registry BEFORE spawning so children can find it
  registry[agentId] = createAgentRegistryEntry(
    agentId,
    currentDepth,
    parentAgentId,
    subagentType,
    normalizedAllowedAgents,
    normalizedAllowedMcpServers,
    missingMcpServers
  );
  writeRegistry(registryPath, registry);

  // Check if model is Anthropic or non-Anthropic for routing
  if (!isAnthropicModel(modelName)) {
    // Non-Anthropic model: delegate to Cursor CLI via background runner script
    const runnerProcess = spawnCursorAgent({
      agentId,
      currentDepth,
      hookData,
      agentLogPath,
      registryPath,
      modelName,
      prompt,
      outputStyleContent
    });

    updateAgentPid(registryPath, agentId, runnerProcess.pid);
    runnerProcess.unref();

    const output = createDelegationMessage(hookData, agentLogPath, agentId);
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // Anthropic model: use existing SDK flow
  const agentScriptPath = join(__dirname, 'agent-system', 'agent-script.mjs');
  
  const runnerProcess = spawnClaudeAgent({
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
  });

  updateAgentPid(registryPath, agentId, runnerProcess.pid);
  runnerProcess.unref();

  const output = createDelegationMessage(hookData, agentLogPath, agentId);
  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => process.exit(0));
