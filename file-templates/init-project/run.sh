#!/usr/bin/env bash
# Convenience wrapper to run TypeScript scripts
# Usage: ./run.sh <script-name> [args...]
# Example: ./run.sh list-features --format stats

SCRIPT_NAME="${1%.ts}"
shift

if [[ -z "$SCRIPT_NAME" ]]; then
  echo "Usage: ./run.sh <script-name> [args...]"
  echo ""
  echo "Available scripts:"
  echo "  check-project"
  echo "  list-apis"
  echo "  generate-docs"
  echo "  list-features  (in feature-specs/)"
  echo "  list-stories   (in user-stories/)"
  echo "  list-flows     (in user-flows/)"
  exit 1
fi

# Check different locations
if [[ -f "${SCRIPT_NAME}.js" ]]; then
  exec node "${SCRIPT_NAME}.js" "$@"
elif [[ -f "feature-specs/${SCRIPT_NAME}.js" ]]; then
  exec node "feature-specs/${SCRIPT_NAME}.js" "$@"
elif [[ -f "user-stories/${SCRIPT_NAME}.js" ]]; then
  exec node "user-stories/${SCRIPT_NAME}.js" "$@"
elif [[ -f "user-flows/${SCRIPT_NAME}.js" ]]; then
  exec node "user-flows/${SCRIPT_NAME}.js" "$@"
else
  echo "Error: Script '${SCRIPT_NAME}' not found"
  echo "Make sure you've run 'pnpm build' first"
  exit 1
fi
