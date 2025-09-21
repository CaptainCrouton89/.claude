# Output Styles

## Overview
Output styles customize how Claude Code responds and interacts with users by modifying the system prompt to provide different personalities and approaches for various use cases beyond software engineering.

## User Perspective
Users can switch between different Claude Code personalities that maintain all core capabilities (file operations, tool usage, task management) while adapting communication style, thought processes, and interaction patterns for specific domains like brainstorming, business analysis, or research.

## Data Flow
1. User triggers style change via `/output-style` command or keyword detection
2. System modifies `.claude/settings.local.json` to set the `outputStyle` field
3. Claude Code loads the corresponding markdown file from output styles directory
4. System prompt is replaced with custom instructions from the style file
5. All subsequent interactions use the new personality while retaining tool access

## Implementation

### Key Files
- `output-styles/brainstorming.md` - Creative ideation and collaborative discovery mode
- `output-styles/business-panel.md` - Multi-expert business analysis with 9 thought leaders
- `output-styles/deep-research.md` - Systematic investigation with evidence-based reasoning
- `.docs/guides/output-styles.md` - User guide explaining the feature and usage
- `hooks/output-style-switcher.py` - Automatic style detection from prompt keywords

### Database
- Configuration stored in `.claude/settings.local.json`
- Style definitions in markdown files with YAML frontmatter

## Configuration
- Style selection: `/output-style [style-name]` or `/output-style` for menu
- Auto-switching: Configured via hook that detects keywords in user prompts
- Storage locations:
  - User-level: `~/.claude/output-styles/`
  - Project-level: `.claude/output-styles/`

## Usage Example
```bash
# Manual style switching
/output-style brainstorming

# Automatic switching via keywords
"Let's brainstorm some ideas for this feature"
# → Automatically switches to Brainstorming mode

# Custom style creation
/output-style:new I want an output style that acts like a senior architect
```

## Testing
- Manual test: Switch to each style and verify personality changes
- Expected behavior:
  - Brainstorming: Uses 🤔 🔍 📝 emojis, asks discovery questions
  - Business Panel: Channels specific thought leaders (Porter, Christensen, etc.)
  - Deep Research: Uses confidence levels, structured reports, citations
  - All styles retain access to Read, Write, Edit, Bash, and other tools

## Related Documentation
- Architecture: `.docs/guides/output-styles.md`
- Hook configuration: `hooks/output-style-switcher.py`
- Settings management: `.claude/settings.local.json`