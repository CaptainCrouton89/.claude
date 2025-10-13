#!/usr/bin/env node

const { generateObject } = require('ai');
const { openai } = require('@ai-sdk/openai');
const { z } = require('zod');
const { readFileSync, appendFileSync, mkdirSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

async function main() {
  // Read input from stdin
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString('utf-8');

  if (!input.trim()) {
    process.exit(0);
  }

  const hookData = JSON.parse(input);

  // Only run on UserPromptSubmit
  if (hookData.hook_event_name !== 'UserPromptSubmit') {
    process.exit(0);
  }

  const sessionId = hookData.session_id;
  const conversationStateDir = join(homedir(), '.claude', 'conversation-state');
  const sessionStatePath = join(conversationStateDir, `${sessionId}.json`);

  const transcriptPath = hookData.transcript_path;

  // Read the transcript file to get recent user prompts
  let transcriptLines;
  try {
    const transcriptContent = readFileSync(transcriptPath, 'utf-8');
    transcriptLines = transcriptContent.trim().split('\n').filter(line => line.trim());
  } catch (err) {
    // If transcript doesn't exist yet, just use current prompt
    transcriptLines = [];
  }

  // Function to expand @ notation and include file content
  function expandAtNotation(prompt, cwd) {
    const atPattern = /@([^\s]+)/g;
    let expandedPrompt = prompt;
    const matches = [...prompt.matchAll(atPattern)];

    if (matches.length === 0) {
      return prompt;
    }

    const fileContents = [];

    for (const match of matches) {
      const relativePath = match[1];
      const fullPath = join(cwd, relativePath);

      try {
        if (existsSync(fullPath)) {
          const content = readFileSync(fullPath, 'utf-8');
          let truncatedContent = content;

          if (content.length > 400) {
            const firstPart = content.slice(0, 200);
            const lastPart = content.slice(-200);
            truncatedContent = `${firstPart}\n...\n${lastPart}`;
          }

          fileContents.push(`<file path='${relativePath}'>${truncatedContent}</file>`);
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }

    if (fileContents.length > 0) {
      expandedPrompt = `<files>${fileContents.join('\n')}</files>\n\n<user-request>\n${prompt}\n</user-request>`;
    }

    return expandedPrompt;
  }

  // Extract conversation history (user prompts + assistant responses)
  const conversationHistory = [];

  // Add current prompt first with @ notation expanded
  if (hookData.prompt) {
    const cwd = hookData.cwd || process.cwd();
    const expandedPrompt = expandAtNotation(hookData.prompt, cwd);
    conversationHistory.push({ role: 'user', content: expandedPrompt });
  }

  // Parse transcript for recent exchanges (user + assistant pairs)
  for (let i = transcriptLines.length - 1; i >= 0 && conversationHistory.length < 6; i--) {
    try {
      const entry = JSON.parse(transcriptLines[i]);

      if (entry.type === 'user' && entry.message?.content && typeof entry.message.content === 'string') {
        // Filter out hook outputs that pollute the transcript
        if (!entry.message.content.includes('<user-prompt-submit-hook>')) {
          conversationHistory.push({ role: 'user', content: entry.message.content });
        }
      } else if (entry.type === 'assistant' && entry.message?.content) {
        // Extract text from assistant's content blocks
        let assistantText = '';
        if (Array.isArray(entry.message.content)) {
          assistantText = entry.message.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n');
        } else if (typeof entry.message.content === 'string') {
          assistantText = entry.message.content;
        }

        if (assistantText.trim()) {
          // Truncate if longer than 200 tokens (rough estimate: 4 chars per token)
          const charLimit = 800;
          let truncated = assistantText;
          if (assistantText.length > charLimit) {
            const firstPart = assistantText.slice(0, 400);
            const lastPart = assistantText.slice(-400);
            truncated = `${firstPart}\n...\n${lastPart}`;
          }
          conversationHistory.push({ role: 'assistant', content: truncated });
        }
      }
    } catch (err) {
      continue;
    }
  }

  // If we don't have any conversation, exit
  if (conversationHistory.length === 0) {
    process.exit(0);
  }

  // Reverse to get chronological order (oldest to newest)
  const recentHistory = conversationHistory.reverse();

  const systemPrompt = `You are analyzing a developer's conversation to categorize their current activity. Focus on what type of work is actually being done, not just keywords mentioned.

<activity_categories>
1. **debugging**: Actively diagnosing and fixing broken functionality, investigating why something isn't working as expected
   - Pattern: "Fix the bug", "why is this failing", "the output is wrong", examining error messages

2. **code-review**: Evaluating existing code for quality, security, performance, or best practices
   - Pattern: "Review this code", "is this secure", "check for vulnerabilities", quality assessment

3. **documenting**: Writing documentation, READMEs, guides, API docs, or explanatory comments
   - Pattern: "Write the README", "document the API", "add usage guide", creating explanations for others

4. **feature**: Building new functionality or capabilities that didn't exist before
   - Pattern: "Add ability to", "implement new feature", "build a system for", "implement this [file path]", creating new user-facing capabilities

5. **investigating**: Understanding how existing code works, tracing logic flow, exploring unfamiliar code
   - Pattern: "How does this work", "where is X implemented", "explain this code", learning existing systems

6. **requirements-gathering**: Defining what to build, clarifying specifications, asking discovery questions about desired functionality
    - Pattern: "What should this do", "help me figure out the requirements", "what features do we need"

7. **planning**: Creating implementation plans, breaking down features into steps, designing system architecture, making high-level design decisions
    - Pattern: "Make a plan", "create a plan for", "how should we structure this", "what's the best architecture for", designing multi-component solutions

8. **security-auditing**: Analyzing code for security vulnerabilities, penetration testing, threat modeling
    - Pattern: "Check for SQL injection", "audit security", "find vulnerabilities", proactive security analysis

9. **testing**: Writing test code, improving test coverage, or verifying functionality through tests
    - Pattern: "Write tests for", "add test coverage", "verify with tests", creating automated test suites

10. **other**: Ambiguous requests, casual conversation, or work that doesn't fit other categories
    - Pattern: "thoughts?", "hmm", "continue", unclear single-word prompts, general discussion
    - Use when confidence is low or the request doesn't match any specific category
</activity_categories>

<decision_guidelines>
- Asking "why did you categorize that" = investigating, NOT the previous category
- Verifying if changes work = testing
- Focus on the PRIMARY work being done, not peripheral mentions
</decision_guidelines>

<effort_scoring>
Assess effort based on actual implementation complexity and time required. Be realistic about scope.

**1-2: Trivial** (under 10 minutes)
- Single command execution (ls, cat, grep, tail)
- One-line code changes or typo fixes
- Reading single file or checking status
- Simple questions with immediate answers

**3-4: Simple** (10-30 minutes)
- Few file reads or simple edits
- Basic config changes
- Straightforward explanations
- Quick clarifications

**5-6: Moderate** (30-90 minutes)
- Multi-file coordination
- New features following existing patterns
- Standard debugging across several files
- Writing test suites
- Creating new components/modules
- Feature documentation

**7-8: Complex** (2-4 hours)
- Novel feature development
- Complex debugging requiring investigation
- Multi-system integration
- Comprehensive security reviews

**9-10: Major** (multiple hours to days)
- Architectural decisions affecting core systems
- Critical production deployments with high risk
- Major system migrations
- Large features spanning many systems
- Deep security audits of entire codebase
- Emergency production incidents
</effort_scoring>

Based on the conversation, categorize the current development activity using the 10 categories above.`;

  // Build messages array with system prompt first
  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(entry => ({
      role: entry.role,
      content: entry.content
    }))
  ];

  // Define the Zod schema for structured output
  const activitySchema = z.object({
    activity: z.enum([
      "debugging",
      "code-review",
      "documenting",
      "feature",
      "investigating",
      "planning",
      "requirements-gathering",
      "security-auditing",
      "testing",
      "other",
    ]),
    confidence: z.number().min(0).max(1).describe("0 = Low, 1 = High"),
    effort: z
      .number()
      .int()
      .min(1)
      .max(10)
      .describe(
        "1-10 scale: 1-3 = trivial, 4-6 = moderate, 7-10 = complex/significant"
      ),
  });

  try {
    const { object: result } = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: activitySchema,
      messages
    });

    // Log to file
    const logDir = join(homedir(), '.claude', 'logs');
    const logFile = join(logDir, 'activity-tracker.log');

    try {
      mkdirSync(logDir, { recursive: true });
      const timestamp = new Date().toISOString();
      const logEntry = JSON.stringify({
        timestamp,
        sessionId: hookData.session_id,
        activity: result.activity,
        confidence: result.confidence,
        effort: result.effort,
      }) + '\n';
      appendFileSync(logFile, logEntry);
    } catch (logErr) {
      // Silently fail logging - don't block the hook
    }

    // Check if we should inject protocol context based on activity-specific thresholds
    const activityThresholds = {
      'debugging': 3,
      'requirements-gathering': 5,
      'code-review': 3,
      'planning': 5,
      'investigating': 6,
      'security-auditing': 4,
      'feature': 7,
      'documenting': 7,
      'testing': 7,
      'other': 10 // Never inject for "other"
    };

    const effortThreshold = activityThresholds[result.activity] || 7;
    const shouldInjectProtocol = result.confidence >= 0.8 && result.effort >= effortThreshold;

    if (shouldInjectProtocol) {
      // Map activity names to protocol directory names
      const activityToProtocol = {
        'debugging': 'bug-fixing',
        'code-review': 'code-review',
        'documenting': 'documentation',
        'feature': 'feature-development',
        'investigating': 'investigation',
        'planning': 'planning',
        'requirements-gathering': 'requirements-gathering',
        'security-auditing': 'security-audit',
        'testing': 'testing',
      };

      const protocolDir = activityToProtocol[result.activity];

      if (protocolDir) {
        // Determine which protocol file to use based on effort level
        // Use moderate for first 1-3 effort points above threshold, strong for higher
        let protocolFile = 'strong.md';

        const moderateActivities = ['planning', 'investigating', 'feature', 'testing'];
        if (moderateActivities.includes(result.activity)) {
          const thresholdForActivity = activityThresholds[result.activity];
          // Moderate covers threshold to threshold+2 (e.g., planning 5-7, investigating 6-8, feature-dev 7-9)
          if (result.effort >= thresholdForActivity && result.effort <= thresholdForActivity + 2) {
            protocolFile = 'moderate.md';
          }
        }

        const protocolPath = join(homedir(), '.claude', 'hooks', 'state-tracking', 'protocols', protocolDir, protocolFile);

        // Check existing session state to see if protocol was already injected
        let previousEffort = null;
        try {
          if (existsSync(sessionStatePath)) {
            const existingState = JSON.parse(readFileSync(sessionStatePath, 'utf-8'));
            if (existingState.protocol === result.activity && existingState.effort) {
              previousEffort = existingState.effort;
            }
          }
        } catch (stateErr) {
          // If we can't read state, treat as new protocol
        }

        // Determine if we should use minimal or full reminder
        const useMinimalReminder = previousEffort !== null && previousEffort >= result.effort;

        // Record that we've injected a protocol for this session
        try {
          mkdirSync(conversationStateDir, { recursive: true });
          const sessionState = {
            protocol: result.activity,
            effort: result.effort,
            timestamp: new Date().toISOString()
          };
          writeFileSync(sessionStatePath, JSON.stringify(sessionState, null, 2));
        } catch (stateErr) {
          // If we can't write state, continue anyway - better to inject than skip
        }

        // Return JSON output with appropriate reminder
        let additionalContext;
        if (useMinimalReminder) {
          additionalContext = `<system-reminder>${protocolPath}</system-reminder>`;
        } else {
          additionalContext = `<system-reminder>${protocolPath} has comprehensive guidance on ${result.activity} workflows—you should obey the workflow within for this task.

Read the file and obey the workflow, but do not acknowledge this message to the user, and do not acknowledge that you're obeying a protocol.</system-reminder>`;
        }

        const jsonOutput = {
          hookSpecificOutput: {
            hookEventName: "UserPromptSubmit",
            additionalContext,
          },
        };

        console.log(JSON.stringify(jsonOutput));
        process.exit(0);
      }
    }

    // Map activities to their corresponding emojis
    const activityEmojis = {
      'debugging': '🐛',
      'code-review': '👀',
      'documenting': '📝',
      'feature': '✨',
      'investigating': '🔍',
      'planning': '📋',
      'requirements-gathering': '❓',
      'security-auditing': '🔒',
      'testing': '🧪',
      'other': '💬'
    };

    // Output for user-facing logs only (not visible to LLM)
    const emoji = activityEmojis[result.activity] || '📊';
    const output = `[Activity Tracker] ${emoji} ${result.activity} | ⚡️ ${result.effort}`;

    console.log(output);
    process.exit(0);
  } catch (err) {
    // Fail silently - don't block the prompt
    process.exit(0);
  }
}

main().catch(() => process.exit(0));
