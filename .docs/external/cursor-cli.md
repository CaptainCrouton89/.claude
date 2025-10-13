# Cursor CLI Docs

⸻

# Set API key (headless automation)
export CURSOR_API_KEY="pk_…"

# Simple non-interactive run, choose model (-m / --model), produce structured JSON
cursor-agent -p "Add unit tests for src/lib/*.ts" -m gpt-5 --output-format json > cursor-output.json

# Force file writes (bypass interactive confirmations / permission prompts)
cursor-agent -p "Refactor src/utils to use async/await" -m gpt-5 -f --output-format json > changes.json

# Stream JSON events (real-time) and also write to file using tee
cursor-agent -p "Explain module boundaries for src/" -m gpt-5 --output-format stream-json --stream-partial-output | tee cursor-stream.ndjson

# Stream character-level deltas (partial output) to a file
cursor-agent -p "Generate tests for src/api" -m gpt-5 --output-format stream-json --stream-partial-output | jq -c . > cursor-partials.ndjson


⸻

1) Prerequisites / auth
	1.	Install the Cursor CLI (follow official install instructions). See the CLI overview.  ￼
	2.	For headless/scripted usage export your API key into the environment (recommended):
export CURSOR_API_KEY="pk_..." (the headless docs describe using API keys for CI / automation).  ￼

⸻

2) Important flags you will use
	•	-p or --print — run the agent non-interactively and print the result to stdout (good for scripts).  ￼
	•	-m / --model <model> — choose which model the agent should use (e.g. gpt-5, opus-4.1, sonnet-4, auto, etc.). The CLI is model-agnostic and lets you pick any model your Cursor subscription covers.  ￼
	•	-f / --force — bypass interactive confirmations (required for headless writes) and allow the agent to actually write files in non-interactive mode. When using --print and writing files, --force is required to apply changes.  ￼
	•	--output-format <format> — controls structured output (text, json, markdown, stream-json, etc.). Use json or stream-json for programmatic parsing.  ￼
	•	--stream-partial-output — emits partial text deltas in real time (works with --print + stream-json) for character-level streaming. Useful to update a UI or to tail progress as the agent composes.  ￼

⸻

3) Bypass permissions safely (how to let the agent write files from a script)

Cursor enforces permission tokens/confirmations by default. For automation/CI you typically want the agent to make edits without interactive confirmation. To do that:
	1.	Ensure CURSOR_API_KEY (or other CI auth) is set in the environment.  ￼
	2.	Use --print to run non-interactive and --output-format for structured output.  ￼
	3.	Add -f / --force to permit file writes and bypass prompts. Example:

# will apply edits directly (be careful)
cursor-agent -p "Fix lint errors in src/" -m gpt-5 -f --output-format json > apply-result.json

Note: --force is powerful — it tells the CLI you accept the agent making modifications autonomously. The CLI permissions system still exists and you should configure permissions tokens / project rule files (.cursor/rules, etc.) appropriately if you want finer-grained control.  ￼

⸻

4) Streaming output to a file — approaches

A — Simple redirect (batch JSON)

If you only need the final output once the agent completes:

cursor-agent -p "Summarize repository architecture" -m gpt-5 --output-format json > cursor-result.json
# cursor-result.json contains structured JSON

B — Real-time NDJSON / stream-json (recommended for long runs)

Use --output-format stream-json to receive a machine-friendly stream (one JSON object per line). Combined with --stream-partial-output you get character/text deltas in real time.

# Stream into a newline-delimited JSON file while watching progress
cursor-agent -p "Run an autonomous code improvement pass across src/" -m gpt-5 \
  --output-format stream-json --stream-partial-output | tee cursor-stream.ndjson

tee both shows live output and writes it to cursor-stream.ndjson for later parsing. Use jq -c or a line-by-line JSON parser to process the file.

Example to filter for assistant messages as they arrive:

cursor-agent -p "Create unit tests" -m gpt-5 --output-format stream-json --stream-partial-output \
  | jq -c 'select(.type=="assistant")' > assistant-messages.ndjson

C — Capture partial (character-level) deltas

If you need live partial text updates (for an editor pane or progress UI):

cursor-agent -p "Generate tests for src/api" -m gpt-5 --output-format stream-json --stream-partial-output \
  | jq -c . > cursor-character-deltas.ndjson


⸻

5) Example: headless script that runs multiple tasks and saves each stream

#!/usr/bin/env bash
export CURSOR_API_KEY="pk_..."

tasks=(
  "Add tests for src/auth"
  "Refactor src/db connection to use pooled client"
  "Find and fix top 5 performance issues in src/"
)

for i in "${!tasks[@]}"; do
  outfile="cursor_task_${i}.ndjson"
  echo "=== Running: ${tasks[$i]} -> $outfile ==="
  cursor-agent -p "${tasks[$i]}" -m gpt-5 --output-format stream-json --stream-partial-output \
    | tee "$outfile"
done


⸻

6) Parsing the streamed output
	•	stream-json typically emits event objects (tool calls, assistant messages, partial text deltas). Process them with jq -c or a Node/Python reader that consumes NDJSON line-by-line. The Cursor docs and community tools show this pattern.  ￼

Example: extract final assistant content objects:

jq -c 'select(.type=="assistant" and .event=="final") | .message' cursor-stream.ndjson

(Adjust the jq filter to the exact schema you observe — stream-json schema is stable but implementations sometimes include small differences.)

⸻

7) Model switching programmatically
	•	Use -m / --model per invocation to pick the model for that run:
cursor-agent -p "..." -m gpt-5 ... or -m auto to let Cursor pick. The CLI accepts model names available to your subscription.  ￼
	•	You can also wrap the CLI in scripts or small MCP helper wrappers (examples and community wrappers demonstrate injecting -m and -f automatically). See cursor-agent-mcp community repo for example wrappers.  ￼

⸻

8) Caveats, limits, and billing
	•	CLI usage consumes the same model requests / quota as the Cursor subscription — each invocation counts against your plan (fast requests / premium model quotas). If you switch to very large models often you might hit plan limits or overage rules. Check your Cursor plan quotas.  ￼
	•	Some advanced or “max” model modes may be gated by plan or usage billing — choose models with awareness of your plan.  ￼

⸻

9) Security & safety warnings (must read)
	•	Letting an autonomous agent edit files and run shell commands (--force + headless automation) is powerful but risky. The agent can open PRs, edit CI files, or run arbitrary shell commands if allowed. Carefully restrict permissions and run such automation in isolated CI environments and/or ephemeral VMs. Cursor docs and community posts emphasize careful permission configuration.  ￼
	•	Academic / security research shows agentic code tools can be manipulated via prompt injection to run unexpected commands or exfiltrate secrets. Treat any automated agent with the same threat model as any code runner that has access to your repository or credentials — restrict secrets, run in least-privilege CI, and audit outputs. (Recent analysis highlights risks for agentic coding editors).  ￼

⸻

10) Troubleshooting tips
	•	If the agent appears to “hang” in CI but not locally, check TTY / stdio buffering and consider using explicit --print / --output-format stream-json flags; there are community bug reports about hanging in some CI contexts — often fixed by forcing a non-interactive mode and using streaming output.  ￼
	•	If you need deterministic edits rather than autonomous runs, run with dry_run/--no-force (propose patches) and then apply them with a controlled step. Use the repo cookbook examples for GitHub Actions (Cursor CLI code review cookbook).  ￼

⸻

Useful links (docs / examples)
	•	Using Agent in CLI (overview + examples): Cursor docs.  ￼
	•	Headless CLI (CI / automation): Cursor docs.  ￼
	•	Output formats & streaming: Cursor docs (stream-json, --stream-partial-output).  ￼
	•	Permissions reference (what --force affects): CLI permissions docs.  ￼
	•	Model list & capabilities: Cursor models page.  ￼
	•	Community wrapper & MCP example (shows programmatic invocation & streaming): cursor-agent-mcp repo.  ￼

⸻

Final example (complete, copy-paste)

# 1) export API key
export CURSOR_API_KEY="pk_... (CI secret manager recommended)"

# 2) run a headless, forced edit and stream the run into an NDJSON file
cursor-agent -p "Autonomously: fix failing tests and if tests pass, create a small CHANGELOG.md summarizing changes" \
  -m gpt-5 \
  -f \
  --output-format stream-json \
  --stream-partial-output \
  | tee /tmp/cursor_run_$(date +%s).ndjson

# 3) Post-run: extract final assistant messages
jq -c 'select(.type=="assistant" and (.event=="final" or .event=="message"))' /tmp/cursor_run_*.ndjson
