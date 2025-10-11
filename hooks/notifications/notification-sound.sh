#!/bin/bash

# Read JSON input and log the notification message
input=$(cat)
message=$(echo "$input" | jq -r '.message // "no message"')
timestamp=$(date -Iseconds)
echo "[$timestamp] [notification-sound] Notification triggered: $message" >> ~/.claude/logs/hooks.log

# Play a more attention-grabbing sound when Claude needs attention/permission
afplay /System/Library/Sounds/Tink.aiff -v 8 &
sleep 0.03
afplay /System/Library/Sounds/Tink.aiff -v 5 &
sleep 0.07
afplay /System/Library/Sounds/Tink.aiff -v 3 &
sleep 0.08
afplay /System/Library/Sounds/Tink.aiff -v 8 &