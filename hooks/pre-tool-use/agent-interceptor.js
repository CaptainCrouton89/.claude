#!/usr/bin/env node

const { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

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

  const agentId = `agent_${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  // Create agents directory structure
  const agentsDir = join(homedir(), '.claude', 'agent-responses');
  mkdirSync(agentsDir, { recursive: true });

  const agentLogPath = join(agentsDir, `${agentId}.md`);

  // Create initial log file
  const toolInput = hookData.tool_input || {};
  const description = toolInput.description || 'Unnamed task';
  const prompt = toolInput.prompt || '';
  const subagentType = toolInput.subagent_type || 'general-purpose';

  // Extract agent content for outputStyle
  let outputStyleContent = null;
  try {
    const agentFilePath = join(homedir(), '.claude', 'agents', `${subagentType}.md`);
    if (existsSync(agentFilePath)) {
      const agentFileContent = readFileSync(agentFilePath, 'utf-8');
      const frontmatterMatch = agentFileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (frontmatterMatch) {
        outputStyleContent = frontmatterMatch[2].trim();
      } else {
        outputStyleContent = agentFileContent.trim();
      }
    }
  } catch (error) {
    // Fall back to no outputStyle if agent file reading fails
  }

  const initialLog = `---
Task: ${description}
Instructions: ${prompt}
Started: ${new Date().toISOString()}
Status: in-progress
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

(async () => {
  try {
    const queryOptions = {
      cwd,
      permissionMode: 'bypassPermissions'
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

  const { spawn } = require('child_process');
  const childProcess = spawn('node', [agentScriptPath], {
    detached: true,
    stdio: 'ignore'
  });

  // Track PID in registry
  const registryPath = join(agentsDir, '.active-pids.json');
  let registry = {};
  if (existsSync(registryPath)) {
    try {
      registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    } catch {
      registry = {};
    }
  }
  registry[agentId] = childProcess.pid;
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');

  childProcess.unref();

  // Calculate relative path from cwd
  const { relative } = require('path');
  const relativePath = relative(hookData.cwd, agentLogPath);
  const displayPath = `@${relativePath}`;

  // Block the Task tool and return message to Claude
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `Delegated to agent. Response logged to: ${displayPath}

A hook will alert when complete. To wait: \`./wait-for-agent.sh ${agentId}\` (or \`--watch\` for first update).`
    }
  };

  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => process.exit(0));
