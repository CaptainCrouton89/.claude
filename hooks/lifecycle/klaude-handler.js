#!/usr/bin/env node

// hook-handler.global.ts
import { appendFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
var GLOBAL_KLAUDE_DIR = join(homedir(), ".klaude");
var GLOBAL_LOGS_DIR = join(GLOBAL_KLAUDE_DIR, "logs");
var LOG_FILE = join(GLOBAL_KLAUDE_DIR, "hook.log");
function log(msg) {
  try {
    mkdirSync(GLOBAL_KLAUDE_DIR, { recursive: true });
    appendFileSync(LOG_FILE, `[${(/* @__PURE__ */ new Date()).toISOString()}] ${msg}
`);
  } catch (err) {
  }
}
async function appendJsonl(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, JSON.stringify(data) + "\n");
}
function formatNotifications(notifications) {
  return notifications.map((n) => n.message).join("\n\n---\n\n");
}
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = Buffer.concat(chunks).toString("utf-8");
  if (!input.trim()) {
    process.exit(0);
  }
  const hookData = JSON.parse(input);
  const projectRoot = hookData.cwd;
  const configPath = join(projectRoot, ".klaude.config.json");
  if (!existsSync(configPath)) {
    process.exit(0);
  }
  let config = { enabled: true };
  try {
    const configContent = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(configContent);
    config = { ...config, ...parsed };
  } catch (err) {
    log(`Warning: Invalid .klaude.config.json in ${projectRoot}: ${err}`);
  }
  if (config.enabled === false) {
    process.exit(0);
  }
  const SERVER_URL = config.server_url || process.env.KLAUDE_SERVER_URL || "http://localhost:3000";
  const sessionId = hookData.session_id;
  const eventType = hookData.hook_event_name;
  log(`Hook: ${eventType} | Session: ${sessionId} | Project: ${projectRoot}`);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const transcriptPath = join(GLOBAL_LOGS_DIR, "sessions", sessionId, "transcript.jsonl");
  const normalizedEvent = {
    timestamp,
    type: eventType,
    session_id: sessionId,
    transcript_path: transcriptPath,
    cwd: hookData.cwd,
    permission_mode: hookData.permission_mode,
    stop_hook_active: hookData.stop_hook_active
  };
  if (typeof hookData.prompt === "string") {
    normalizedEvent.prompt = hookData.prompt;
  }
  if (hookData.tool_name) {
    normalizedEvent.tool_name = hookData.tool_name;
  }
  if (hookData.tool_input != null) {
    normalizedEvent.tool_input = hookData.tool_input;
  }
  if (hookData.tool_response != null) {
    normalizedEvent.tool_response = hookData.tool_response;
  }
  if (hookData.reason) {
    normalizedEvent.reason = hookData.reason;
  }
  if (hookData.source) {
    normalizedEvent.source = hookData.source;
  }
  await appendJsonl(transcriptPath, normalizedEvent);
  const metadata = {};
  if (typeof hookData.prompt === "string" && hookData.prompt.length > 0) {
    metadata.has_prompt = true;
    metadata.prompt_length = hookData.prompt.length;
  }
  if (hookData.tool_name) {
    metadata.tool_name = hookData.tool_name;
  }
  if (hookData.tool_input != null) {
    metadata.has_tool_input = true;
  }
  if (hookData.tool_response != null) {
    metadata.has_tool_response = true;
  }
  const serverEventData = {
    session_id: sessionId,
    type: eventType,
    timestamp,
    transcript_path: transcriptPath,
    log_path: transcriptPath,
    cwd: projectRoot,
    ...Object.keys(metadata).length > 0 ? { metadata } : {}
  };
  fetch(`${SERVER_URL}/api/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverEventData)
  }).catch((err) => {
    log(`Error posting to server: ${err}`);
  });
  try {
    const response = await fetch(
      `${SERVER_URL}/api/notifications/${sessionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_message: hookData.prompt || hookData.tool_name || "",
          hook_type: hookData.hook_event_name
        })
      }
    );
    if (!response.ok) {
      log(`Error fetching notifications: HTTP ${response.status}`);
      return;
    }
    const data = await response.json();
    if (data.notifications.length > 0) {
      log(`Outputting ${data.notifications.length} notifications`);
      const formattedNotifications = formatNotifications(data.notifications);
      if (hookData.hook_event_name === "UserPromptSubmit" || hookData.hook_event_name === "PostToolUse") {
        const output = {
          hookSpecificOutput: {
            hookEventName: hookData.hook_event_name,
            additionalContext: formattedNotifications
          }
        };
        console.log(JSON.stringify(output));
      } else {
        console.log(formattedNotifications);
      }
    }
  } catch (err) {
    log(`Error fetching notifications: ${err}`);
  }
  log("Completed successfully");
  process.exit(0);
}
main().catch((err) => {
  log(`ERROR: ${err}`);
  process.exit(1);
});
