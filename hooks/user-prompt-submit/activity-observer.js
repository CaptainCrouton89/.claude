#!/usr/bin/env node

import { runAllObservers, buildContextMessage } from '../user-prompt-observers/observer-registry.js';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

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

  const prompt = hookData.prompt || '';

  if (!prompt.trim()) {
    process.exit(0);
  }

  try {
    // Run all observers in parallel
    const results = await runAllObservers(prompt);

    // Log activity tracking for monitoring
    const matchedActivities = results.activities.filter(
      (a) => a.isMatch && a.confidence >= 0.8
    );

    if (matchedActivities.length > 0) {
      const logDir = join(homedir(), '.claude', 'logs');
      const logFile = join(logDir, 'activity-tracker.log');

      try {
        mkdirSync(logDir, { recursive: true });
        const timestamp = new Date().toISOString();
        
        for (const activity of matchedActivities) {
          const logEntry = JSON.stringify({
            timestamp,
            sessionId: hookData.session_id,
            activity: activity.name,
            confidence: activity.confidence,
            effort: activity.effort,
          }) + '\n';
          appendFileSync(logFile, logEntry);
        }

        // Console output for user (not visible to LLM)
        const topActivity = matchedActivities.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );
        console.log(`[Activity Tracker] ${topActivity.emoji} ${topActivity.name} | ⚡️ ${topActivity.effort}`);
      } catch (logErr) {
        // Silently fail logging
      }
    }

    // Build combined context message
    const contextMessage = buildContextMessage(results);

    if (contextMessage) {
      const jsonOutput = {
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: contextMessage
        }
      };

      console.log(JSON.stringify(jsonOutput));
      process.exit(0);
    }

    // No guidance needed
    process.exit(0);
  } catch (err) {
    // Fail silently - don't block the prompt
    process.exit(0);
  }
}

main().catch(() => process.exit(0));

