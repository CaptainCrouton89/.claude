#!/usr/bin/env python3
import sys
import json
import subprocess

def run_git_command(cmd):
    """Run a git command and return its output."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout
    except subprocess.TimeoutExpired:
        return f"Command timed out: {cmd}"
    except Exception as e:
        return f"Error running {cmd}: {str(e)}"

def main():
    # Read the prompt from stdin
    input_data = json.load(sys.stdin)
    prompt = input_data.get('prompt', '')
    
    # Check if this is exactly the /git command
    if prompt.strip() == '/git':
        # Get recent commit messages as style guide
        recent_commits = run_git_command('git log --oneline -8')
        
        # Run git commands in sequence
        git_status = run_git_command('git status')
        git_diff_cached = run_git_command('git diff --cached')
        git_diff = run_git_command('git diff')
        
        # Get git status short
        git_status_short = run_git_command('git status --short')
        
        # Build the enhanced prompt with git information
        enhanced_prompt = f"""{prompt}

## Commit Message Style Guide
Recent commits for style reference:
```
{recent_commits}
```

## Current Git State

### Status:
```
{git_status}
```

### Staged changes (git diff --cached):
```
{git_diff_cached if git_diff_cached else '(No staged changes)'}
```

### Unstaged changes (git diff):
```
{git_diff if git_diff else '(No unstaged changes)'}
```

### Status summary:
```
{git_status_short if git_status_short else '(No changes)'}
```
"""
        
        # Output the modified prompt
        print(enhanced_prompt)
        sys.exit(0)
    
    # For all other prompts, let them through unchanged
    sys.exit(0)

if __name__ == '__main__':
    main()