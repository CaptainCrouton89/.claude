#!/usr/bin/env node

const { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const MAX_RECURSION_DEPTH = 3;

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
    const output = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Maximum agent recursion depth (${MAX_RECURSION_DEPTH}) reached. Current depth: ${currentDepth}. Cannot spawn more nested agents.`
      }
    };
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  const agentId = `agent_${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  // Create agents directory structure in the current working directory
  const agentsDir = join(hookData.cwd, 'agent-responses');
  mkdirSync(agentsDir, { recursive: true });

  // Copy wait-for-agent.sh to agent-responses directory as 'await'
  const { copyFileSync } = require('fs');
  const waitForAgentSource = join(homedir(), '.claude', 'wait-for-agent.sh');
  const awaitDest = join(agentsDir, 'await');
  try {
    copyFileSync(waitForAgentSource, awaitDest);
    const { chmodSync } = require('fs');
    chmodSync(awaitDest, 0o755);
  } catch (error) {
    // Continue if copy fails
  }

  const agentLogPath = join(agentsDir, `${agentId}.md`);
  const registryPath = join(agentsDir, '.active-pids.json');

  // Create initial log file
  const toolInput = hookData.tool_input || {};
  const description = toolInput.description || 'Unnamed task';
  const prompt = toolInput.prompt + "\n\nGive me short, information-dense updates as you finish parts of the task—even at risk of too little information.";
  const subagentType = toolInput.subagent_type || 'general-purpose';

  // Extract agent content for outputStyle and check forbidden agents
  let outputStyleContent = null;
  let forbiddenAgents = [];
  try {
    const agentFilePath = join(homedir(), '.claude', 'agents', `${subagentType}.md`);
    if (existsSync(agentFilePath)) {
      const agentFileContent = readFileSync(agentFilePath, 'utf-8');
      const frontmatterMatch = agentFileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (frontmatterMatch) {
        outputStyleContent = frontmatterMatch[2].trim();

        // Parse frontmatter YAML to get forbiddenAgents
        const frontmatter = frontmatterMatch[1];
        const forbiddenAgentsMatch = frontmatter.match(/forbiddenAgents:\s*\[(.*?)\]/);
        if (forbiddenAgentsMatch) {
          forbiddenAgents = forbiddenAgentsMatch[1]
            .split(',')
            .map(a => a.trim().replace(/['"]/g, ''))
            .filter(Boolean);
        }
      } else {
        outputStyleContent = agentFileContent.trim();
      }
    }
  } catch (error) {
    // Fall back to no outputStyle if agent file reading fails
  }

  // Always forbid an agent from spawning itself
  forbiddenAgents.push(subagentType);

  // Check if parent agent type is trying to spawn a forbidden agent (including itself)
  if (parentAgentId && existsSync(registryPath)) {
    try {
      const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
      const parentAgent = registry[parentAgentId];
      if (parentAgent?.agentType && parentAgent.agentType === subagentType) {
        const output = {
          hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: `Agent '${parentAgent.agentType}' cannot spawn itself. Self-spawning is forbidden.`
          }
        };
        console.log(JSON.stringify(output));
        process.exit(0);
      }
    } catch (error) {
      // Continue if registry read fails
    }
  }

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

  // Execute agent using SDK in background - create temp script file
  const agentScriptPath = join(agentsDir, `${agentId}_runner.mjs`);
  const agentScript = `#!/usr/bin/env node
import { appendFileSync } from 'fs';
import { query } from '/Users/silasrhyneer/.claude/claude-cli/sdk.mjs';

const agentLogPath = ${JSON.stringify(agentLogPath)};
const prompt = ${JSON.stringify(prompt)};
const cwd = ${JSON.stringify(hookData.cwd)};
const outputStyleContent = ${JSON.stringify(outputStyleContent)};
const forbiddenAgents = ${JSON.stringify(forbiddenAgents)};
const agentId = ${JSON.stringify(agentId)};
const childDepth = ${currentDepth + 1};

(async () => {
  try {
    const queryOptions = {
      cwd,
      permissionMode: 'bypassPermissions',
      metadata: {
        agentId,
        agentDepth: childDepth
      },
      hooks: {
        PreToolUse: [
          async (input) => {
            // Block forbidden agents
            if (input.tool_name === 'Task') {
              const subagentType = input.tool_input?.subagent_type;
              if (subagentType && forbiddenAgents.includes(subagentType)) {
                return {
                  hookSpecificOutput: {
                    hookEventName: 'PreToolUse',
                    permissionDecision: 'deny',
                    permissionDecisionReason: \`This agent cannot spawn a '\${subagentType}' agent. Forbidden agents: \${forbiddenAgents.join(', ')}\`
                  }
                };
              }
            }
            return {};
          }
        ]
      }
    };

    if (outputStyleContent) {
      queryOptions.customSystemPrompt = outputStyleContent;
    }

    const result = query({
      prompt,
      options: queryOptions
    });

    for await (const message of result) {
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            appendFileSync(agentLogPath, block.text + '\\n', 'utf-8');
          }
        }
      } else if (message.type === 'result') {
        const status = message.subtype === 'success' ? 'done' : 'failed';
        const endTime = new Date().toISOString();

        // Read the file and update the front matter
        const { readFileSync } = await import('fs');
        const content = readFileSync(agentLogPath, 'utf-8');
        const updatedContent = content.replace(/Status: in-progress/, \`Status: \${status}\\nEnded: \${endTime}\`);

        const { writeFileSync } = await import('fs');
        writeFileSync(agentLogPath, updatedContent, 'utf-8');
      }
    }
  } catch (error) {
    appendFileSync(agentLogPath, \`\\n\\n## Status: Failed\\n\\nError: \${error.message}\\n\`, 'utf-8');
  } finally {
    // Cleanup runner script
    import('fs').then(fs => fs.unlinkSync('${agentScriptPath}'));
  }
})();
`;

  writeFileSync(agentScriptPath, agentScript, 'utf-8');

  // Track this agent in registry BEFORE spawning so children can find it
  let registry = {};
  if (existsSync(registryPath)) {
    try {
      registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    } catch {
      registry = {};
    }
  }
  registry[agentId] = {
    pid: null, // Will update after spawn
    depth: currentDepth,
    parentId: parentAgentId,
    agentType: subagentType
  };
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');

  const { spawn } = require('child_process');
  const childProcess = spawn('node', [agentScriptPath], {
    env: {
      ...process.env,
      CLAUDE_AGENT_ID: agentId,
      CLAUDE_AGENT_DEPTH: String(currentDepth + 1)
    },
    detached: true,
    stdio: 'ignore'
  });

  // Update registry with actual PID
  registry[agentId].pid = childProcess.pid;
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');

  childProcess.unref();

  // Calculate relative path from cwd
  const { relative } = require('path');
  const relativePath = relative(hookData.cwd, agentLogPath);

  // Block the Task tool and return message to Claude
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Delegated to an agent. Response logged to @${relativePath} in real time.

A hook will alert on updates and when complete. To sleep until completion you must run \`./agent-responses/await ${agentId}\` (or \`--watch\` for first update). *The user cannot monitor progress themselves—you must either await this task _or_ perform other work until the agent is complete.* If this task is not-blocking, do not await it—perform other work until the agent is complete. Don't worry—you'll receive updates as it completes.`,
    },
  };

  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => process.exit(0));
