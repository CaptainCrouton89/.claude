#!/usr/bin/env python3
"""
Hook that dynamically changes output style based on keywords in user messages.
Modifies the outputStyle field in .claude/settings.local.json.
"""
import json
import re
import sys
from pathlib import Path

# Define keyword patterns and their corresponding output styles
STYLE_PATTERNS = [
    # Brainstorming style triggers
    (r'\b(brainstorm)\b', 'Brainstorming'),

    # Business panel style triggers
    (r'\b(business panel)\b', 'Business Panel'),

    # Deep research style triggers
    (r'\b(deep research)\b', 'Deep Research'),

    # Planning style triggers - takes precedence over development triggers
    (r'\b(plan out|make a plan|plan this|planning|create a plan|design a plan|map out|architect)\b', 'Planning'),

    # Sr. Software Developer style triggers (default professional mode)
    (r'\b(implement|build|code|develop|fix|refactor|optimize|debug|deploy)\b', 'Sr. Software Developer')
]

def get_current_style(settings_path):
    """Read current output style from settings."""
    try:
        if settings_path.exists():
            with open(settings_path, 'r') as f:
                settings = json.load(f)
                return settings.get('outputStyle', 'Sr. Software Developer')
    except Exception:
        pass
    return 'Sr. Software Developer'

def update_output_style(settings_path, new_style):
    """Update the outputStyle in settings.local.json."""
    settings = {}

    # Read existing settings if file exists
    if settings_path.exists():
        try:
            with open(settings_path, 'r') as f:
                settings = json.load(f)
        except Exception:
            # If file is corrupted, start fresh
            settings = {}

    # Update only if style is different
    current_style = settings.get('outputStyle', 'Sr. Software Developer')
    if current_style == new_style:
        return False

    # Update the outputStyle field
    settings['outputStyle'] = new_style

    # Write back to file
    try:
        with open(settings_path, 'w') as f:
            json.dump(settings, f, indent=2)
        return True
    except Exception as e:
        print(f"Error updating settings: {e}", file=sys.stderr)
        return False

def detect_style_from_prompt(prompt):
    """Detect which output style to use based on prompt keywords."""
    prompt_lower = prompt.lower()

    # Check each pattern in order of priority
    for pattern, style in STYLE_PATTERNS:
        if re.search(pattern, prompt_lower):
            return style

    return None  # No style change needed

try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
    sys.exit(1)

# Only process UserPromptSubmit events
if input_data.get("hook_event_name") != "UserPromptSubmit":
    sys.exit(0)

prompt = input_data.get("prompt", "")
cwd = input_data.get("cwd", "")

# Construct path to settings.local.json
# The settings file is in the .claude subdirectory of the project root
project_settings_path = Path(cwd) / ".claude" / "settings.local.json"

# Detect the appropriate style
detected_style = detect_style_from_prompt(prompt)

if detected_style:
    current_style = get_current_style(project_settings_path)

    if current_style != detected_style:
        # Update the style
        if update_output_style(project_settings_path, detected_style):
            # Show message to user only (not to LLM)
            output = {
                "suppressOutput": True,  # Hide from LLM
                "systemMessage": f"Output style switched from '{current_style}' to '{detected_style}'"
            }
            print(json.dumps(output))

# Always exit 0 to allow prompt to proceed
sys.exit(0)