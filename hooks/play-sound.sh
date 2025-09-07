#!/bin/bash

# Play a sound when Claude Code requests permission
# Uses macOS's built-in 'say' command or 'afplay' for sound files

# Option 1: Use system beep
# osascript -e 'beep'

# Option 2: Use text-to-speech
# echo "Claude needs permission" | say

# Option 3: Play a system sound (choose one)
afplay /System/Library/Sounds/Glass.aiff

# Option 4: Play a custom sound file (uncomment and update path)
# afplay ~/path/to/your/sound.wav