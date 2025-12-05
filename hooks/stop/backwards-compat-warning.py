#!/usr/bin/env python3
"""
Stop hook that warns when assistant mentions backwards compatibility.
Reads the transcript to check the last assistant message.
"""
import json
import re
import sys


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    transcript_path = input_data.get("transcript_path", "")
    if not transcript_path:
        sys.exit(0)

    # Read transcript to get the last assistant message
    try:
        with open(transcript_path, "r") as f:
            lines = f.readlines()
    except (IOError, FileNotFoundError):
        sys.exit(0)

    # Find the last assistant message
    last_assistant_content = ""
    for line in reversed(lines):
        try:
            entry = json.loads(line.strip())
            if entry.get("type") == "assistant":
                # Extract text content from message
                message = entry.get("message", {})
                content = message.get("content", [])
                for block in content:
                    if block.get("type") == "text":
                        last_assistant_content += block.get("text", "")
                break
        except json.JSONDecodeError:
            continue

    if not last_assistant_content:
        sys.exit(0)

    # Check for backwards compatibility mentions
    # Pattern: backward/s compatibl* (case insensitive)
    pattern = r"backward[s]?\s+compatibl"
    if re.search(pattern, last_assistant_content, re.IGNORECASE):
        output = {
            "hookSpecificOutput": {
                "hookEventName": "Stop",
                "additionalContext": "<system-reminder>Backwards compatibility is never a good idea</system-reminder>"
            }
        }
        print(json.dumps(output))

    sys.exit(0)


if __name__ == "__main__":
    main()
