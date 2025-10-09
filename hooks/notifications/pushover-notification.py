#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path


def load_env():
    """Load .env file from hooks directory"""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    os.environ[key] = value


def send_pushover_notification(message):
    """Send a notification via Pushover API"""
    api_token = os.environ.get("PUSHOVER_APP_TOKEN")
    user_key = os.environ.get("PUSHOVER_USER_KEY")
    
    if not api_token or not user_key:
        print("Warning: PUSHOVER_APP_TOKEN or PUSHOVER_USER_KEY not set", file=sys.stderr)
        return False
    
    data = urllib.parse.urlencode({
        "token": api_token,
        "user": user_key,
        "message": message,
        "title": "Claude Code Task Finished",
        "device": "iphone15",
        "priority": -1  # Low priority
    }).encode()
    
    try:
        req = urllib.request.Request("https://api.pushover.net/1/messages.json", data=data)
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            return result.get("status") == 1
    except Exception as e:
        print(f"Error sending notification: {e}", file=sys.stderr)
        return False

def main():
    # Load environment variables from .env file
    load_env()
    
    # Read the event from stdin
    event = json.load(sys.stdin)
    
    # Only trigger on assistant messages (Claude's responses)
    if event.get("type") == "message" and event.get("role") == "assistant":
        # Get the last message content
        content = event.get("content", "Task completed")
        
        # Truncate if too long (Pushover has a 1024 char limit for messages)
        if len(content) > 500:
            content = content[:497] + "..."
        
        send_pushover_notification(content)
    
    # Always output the event unchanged
    json.dump(event, sys.stdout)

if __name__ == "__main__":
    main()