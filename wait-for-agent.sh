#!/usr/bin/env bash

# Parse flags
WATCH_MODE=false
AGENT_IDS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --watch)
      WATCH_MODE=true
      shift
      ;;
    *)
      AGENT_IDS+=("$1")
      shift
      ;;
  esac
done

if [ ${#AGENT_IDS[@]} -eq 0 ]; then
  echo "Usage: ./wait-for-agent.sh [--watch] <agent_id> [agent_id...]"
  echo ""
  echo "Options:"
  echo "  --watch    Exit on first update from any agent (agents continue in background)"
  echo ""
  echo "Examples:"
  echo "  ./wait-for-agent.sh agent_001                 # wait for completion"
  echo "  ./wait-for-agent.sh agent_001 agent_002       # wait for both to complete"
  echo "  ./wait-for-agent.sh --watch agent_001         # exit on first update"
  exit 1
fi

AGENTS_DIR="$HOME/.claude/agent-responses"

# Validate all agent files exist
for AGENT_ID in "${AGENT_IDS[@]}"; do
  AGENT_FILE="$AGENTS_DIR/${AGENT_ID}.md"
  if [ ! -f "$AGENT_FILE" ]; then
    echo "Error: No agent file found for agent ID: $AGENT_ID"
    exit 1
  fi
done

# Display monitoring info
if [ ${#AGENT_IDS[@]} -eq 1 ]; then
  if [ "$WATCH_MODE" = true ]; then
    echo "⏳ Monitoring agent ${AGENT_IDS[0]} (will exit on first update)..."
  else
    echo "⏳ Waiting for agent ${AGENT_IDS[0]} to complete..."
  fi
else
  if [ "$WATCH_MODE" = true ]; then
    echo "⏳ Monitoring ${#AGENT_IDS[@]} agents (will exit on first update from any)..."
  else
    echo "⏳ Waiting for ${#AGENT_IDS[@]} agents to complete..."
  fi
  for AGENT_ID in "${AGENT_IDS[@]}"; do
    echo "   - $AGENT_ID"
  done
fi
echo ""

# Initialize tracking arrays
declare -A LAST_MTIMES
declare -A LAST_CONTENTS
declare -A COMPLETED

for AGENT_ID in "${AGENT_IDS[@]}"; do
  AGENT_FILE="$AGENTS_DIR/${AGENT_ID}.md"
  LAST_MTIMES[$AGENT_ID]=$(stat -f "%m" "$AGENT_FILE" 2>/dev/null || stat -c "%Y" "$AGENT_FILE" 2>/dev/null)
  LAST_CONTENTS[$AGENT_ID]=$(cat "$AGENT_FILE")
  COMPLETED[$AGENT_ID]=false
done

# Poll for changes
while true; do
  ALL_DONE=true

  for AGENT_ID in "${AGENT_IDS[@]}"; do
    if [ "${COMPLETED[$AGENT_ID]}" = true ]; then
      continue
    fi

    AGENT_FILE="$AGENTS_DIR/${AGENT_ID}.md"
    CURRENT_MTIME=$(stat -f "%m" "$AGENT_FILE" 2>/dev/null || stat -c "%Y" "$AGENT_FILE" 2>/dev/null)

    # Check if file was modified
    if [ "$CURRENT_MTIME" != "${LAST_MTIMES[$AGENT_ID]}" ]; then
      CURRENT_CONTENT=$(cat "$AGENT_FILE")

      # Show only new content (lines added since last check)
      NEW_LINES=$(diff <(echo "${LAST_CONTENTS[$AGENT_ID]}") <(echo "$CURRENT_CONTENT") | grep "^>" | sed 's/^> //')

      if [ -n "$NEW_LINES" ]; then
        if [ ${#AGENT_IDS[@]} -gt 1 ]; then
          echo "📝 Update from $AGENT_ID:"
        else
          echo "📝 Agent update:"
        fi
        echo "$NEW_LINES"
        echo ""

        # Exit immediately in watch mode
        if [ "$WATCH_MODE" = true ]; then
          echo "✨ First update received!"
          if [ ${#AGENT_IDS[@]} -gt 1 ]; then
            echo "Note: Other agents continue running in background"
          else
            echo "Note: Agent continues running in background"
          fi
          exit 0
        fi
      fi

      LAST_MTIMES[$AGENT_ID]=$CURRENT_MTIME
      LAST_CONTENTS[$AGENT_ID]=$CURRENT_CONTENT
    fi

    # Check if agent completed
    if grep -q "Status: done\|Status: failed" "$AGENT_FILE" 2>/dev/null; then
      COMPLETED[$AGENT_ID]=true
      if [ ${#AGENT_IDS[@]} -gt 1 ]; then
        echo "✅ Agent $AGENT_ID completed!"
        echo ""
      fi
    else
      ALL_DONE=false
    fi
  done

  if [ "$ALL_DONE" = true ]; then
    break
  fi

  sleep 2
done

# All agents completed
if [ ${#AGENT_IDS[@]} -eq 1 ]; then
  echo "✅ Agent completed!"
else
  echo "✅ All agents completed!"
fi
echo ""
echo "Full output:"
echo "---"
for AGENT_ID in "${AGENT_IDS[@]}"; do
  if [ ${#AGENT_IDS[@]} -gt 1 ]; then
    echo ""
    echo "=== $AGENT_ID ==="
    echo ""
  fi
  cat "$AGENTS_DIR/${AGENT_ID}.md"
done
