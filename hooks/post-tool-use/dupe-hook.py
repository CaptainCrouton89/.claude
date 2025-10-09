#!/usr/bin/env python3
import sys
import json
import subprocess
import os

def main():
    # Read the prompt from stdin
    input_data = json.load(sys.stdin)
    prompt = input_data.get('prompt', '')
    
    # Check if this is the /dupe command
    if prompt.strip() == '/dupe':
        # Run the new-cursor-terminal.sh script
        script_path = '/Users/silasrhyneer/Code/ASI/new-cursor-terminal.sh'
        try:
            subprocess.run([script_path], check=True)
            # Block the prompt from going to Claude by returning error
            sys.exit(1)
        except subprocess.CalledProcessError:
            # If script fails, let the prompt through
            pass
    
    # For all other prompts, let them through unchanged
    sys.exit(0)

if __name__ == '__main__':
    main()