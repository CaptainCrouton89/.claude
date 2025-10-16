# Skills Management System

Cross-project skill discovery, deduplication, and automatic copying for new projects.

## Overview

The skills management system provides three key capabilities:

1. **Fetch all skills** - Discover skills across personal and archived directories
2. **Deduplicate** - Identify and manage duplicate skills
3. **Smart skill discovery on init** - Shows available archived skills when initializing projects, prompts for selective copying

**Key concept**: Skills in `~/.claude/skills/` are available everywhere automatically. Only archived skills and project-specific skills need to be explicitly copied.

## Usage

### Fetch All Skills

Display all available skills in a formatted markdown table:

```bash
fetch-skills              # Shows table format (default)
fetch-skills table        # Explicit table mode
fetch-skills json         # JSON output for programmatic use
```

**Output**: Markdown table with columns:
- Skill Name (marked with ⚠️ if duplicated)
- Description (from SKILL.md)
- Path (location on disk)

If duplicates are found, the script exits with code 1 and displays:

```
## ⚠️ Duplicate Skills Detected

**Skill Name** appears in multiple locations:
  - /path/to/version1
  - /path/to/version2

Consider deduplication with: fetch-skills deduplicate
```

### Copy Skills to Target Directory

Manually copy all personal and archived skills to a target location:

```bash
fetch-skills copy /path/to/target
```

This is useful when:
- Setting up a new project manually
- Consolidating skills from multiple sources
- Creating a backup

**Example**: Copy skills to a new project:

```bash
fetch-skills copy ./.claude/skills
```

### Deduplication

Interactive tool to handle duplicate skills:

```bash
fetch-skills deduplicate
```

Shows each duplicate and prompts you to choose which version to keep.

## How It Works

### Directory Structure

The system scans three locations:

```
~/.claude/skills/              # Personal skills (active)
~/.claude/skills.archive/      # Archived skills (backup)
./.claude/skills/              # Project-specific skills (optional)
```

### Skill Metadata

Skills are identified by reading `SKILL.md` frontmatter:

```yaml
---
name: Skill Display Name
description: What this skill does and when to use it
---
```

The script extracts `name` and `description` fields for display and deduplication logic.

## Automatic Skill Discovery on Project Init

When you initialize a new project with `/init-workspace`, the system automatically discovers and presents available skills:

### How It Works

1. **Detection** (`user-prompt-submit/auto-copy-skills.mjs`):
   - Monitors for `/init-workspace` command
   - Runs `fetch-skills table` to fetch all available skills
   - Injects the skill list as additional context to the agent
   - Provides instructions to copy and curate skills

2. **Agent Guidance**:
   - Agent receives full list of available skills in the prompt
   - Instructions to copy only relevant skills
   - Guidance on which skills to keep vs. delete for project type
   - Agent completes MCP/agent setup, then optionally runs skill copy

3. **Result**:
   - Agent-guided selective skill copying
   - Only project-relevant skills retained
   - Manual control over which skills are active
   - Cleaner, more focused project environment

### Hook Configuration

Registered in `~/.claude/settings.json`:

```json
{
  "UserPromptSubmit": [
    {
      "command": "~/.claude/hooks/user-prompt-submit/auto-copy-skills.mjs",
      "timeout": 5000
    }
  ]
}
```

## File Locations

- **Script**: `~/.claude/bin/fetch-skills` (executable)
- **Hooks**:
  - `~/.claude/hooks/user-prompt-submit/auto-copy-skills.mjs` — Injects skills context on `/init-workspace`
- **Commands**:
  - `~/.claude/commands/init-workspace.md` — Includes skill curation instructions
- **Configuration**: `~/.claude/settings.json`
- **Documentation**: `~/.claude/docs/external/skills-management.md`

## Examples

### See all available skills

```bash
$ fetch-skills

# Available Skills

| Skill Name | Description | Path |
|------------|-------------|------|
| Investigating Code Patterns | Systematically trace code flows... | ~/.claude/skills/investigating |
| Fixing Bugs Systematically | Diagnose and fix bugs through... | ~/.claude/skills/bug-fixing-protocol |
| Auditing Security | Identify and remediate vulnerabilities... | ~/.claude/skills.archive/security-auditing |
...
```

### Export skills as JSON

```bash
$ fetch-skills json

[
  {
    "name": "Investigating Code Patterns",
    "description": "Systematically trace code flows...",
    "path": "~/.claude/skills/investigating"
  },
  ...
]
```

### Copy skills to a new project

```bash
$ mkdir my-new-project/.claude
$ fetch-skills copy my-new-project/.claude/skills

Copying skills to my-new-project/.claude/skills...

  ✓ Copying investigating
  ✓ Copying bug-fixing-protocol
  ✓ Copying planning
  ...

Successfully copied 10 skills to my-new-project/.claude/skills
```

### Skill discovery on project initialization

```bash
$ cd my-new-project
$ claude /init-workspace

# Hook detects /init-workspace command
# Hook runs: fetch-skills table
# Skill list injected into agent prompt
#
# Agent receives:
# - Available skills table
# - Instructions to copy and curate
# - Guidance on which skills to keep for project type
#
# Agent completes MCP + agent setup, then runs:
# $ fetch-skills copy ./.claude/skills
#
# Agent deletes irrelevant skills, keeps only project-appropriate ones
# Result: my-new-project/.claude/skills/ contains only relevant skills
```

## Debugging

### Check if hooks are registered

```bash
cat ~/.claude/settings.json | grep "auto-copy-skills"
```

### Monitor hook execution

```bash
tail -f ~/.claude/logs/hooks.log | grep auto-copy-skills
```

### Manually test hook detection

```bash
echo '{"userMessage": "/init-workspace"}' | ~/.claude/hooks/user-prompt-submit/auto-copy-skills.mjs
```

### Verify script functionality

```bash
# Test fetch mode
fetch-skills table

# Test JSON mode
fetch-skills json

# Test copy to temp directory
mkdir -p /tmp/test-skills
fetch-skills copy /tmp/test-skills
ls /tmp/test-skills
```

## Extending the System

### Add new skills to be auto-copied

Simply add a `SKILL.md` file to:
- `~/.claude/skills/my-new-skill/SKILL.md` for personal skills
- Or any project's `.claude/skills/` for project-specific skills

The system will automatically discover and include them.

### Customize deduplication behavior

Edit `interactive_deduplicate()` function in `~/.claude/bin/fetch-skills` to:
- Auto-select preferred versions
- Merge skill versions
- Archive older versions

### Integrate with your workflow

The `fetch-skills` script can be called from:
- CI/CD pipelines (use `json` mode)
- Other hooks (parse output)
- Manual workflows (use `table` mode)

## Technical Details

### Skill Parsing

Skills are identified using:
- Directory name (fallback if metadata missing)
- YAML frontmatter extraction via `sed`
- Deduplication by exact name match

### Hook Architecture

- **Pre-detection** (UserPromptSubmit): Non-blocking flag creation
- **Post-execution** (SessionEnd): Background worker for actual copy
- **Error tolerance**: Hooks fail silently to prevent session interruption
- **Logging**: All operations logged to `~/.claude/logs/hooks.log`

### Performance

- File I/O minimal (only `find` + `sed`)
- Deduplication O(n log n) via `sort` + `uniq`
- Background execution prevents UI blocking
- Suitable for 10-100+ skills

## Future Enhancements

Potential improvements:

1. **Smart matching**: Detect similar skills with different names
2. **Version control**: Track skill modifications across projects
3. **Inheritance**: Project-specific skill overrides
4. **Tags**: Categorize skills by type/domain
5. **Metrics**: Track which skills are most used
6. **Sync**: Bidirectional skill updates between projects
