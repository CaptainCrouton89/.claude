# Automatic Output Style Switching

## Overview
A hook-based system that automatically switches Claude Code's output style based on keywords detected in user prompts, enabling seamless transitions between different interaction modes.

## User Perspective
Users can naturally trigger different output styles by using relevant keywords in their prompts. For example, typing "let's brainstorm some ideas" automatically switches to Brainstorming mode, while "implement this feature" switches to Sr. Software Developer mode. The system provides user notifications when style changes occur.

## Data Flow
1. User submits a prompt via Claude Code interface
2. UserPromptSubmit hook triggers output-style-switcher.py
3. Hook analyzes prompt text for keyword patterns using regex matching
4. If matching keywords are found, hook determines appropriate output style
5. Hook reads current style from `.claude/settings.local.json`
6. If new style differs from current, hook updates settings file
7. User receives notification of style change (hidden from LLM)
8. Subsequent interactions use the new output style

## Implementation

### Key Files
- `hooks/output-style-switcher.py` - Main hook script that detects keywords and switches styles
- `.claude/settings.local.json` - Project settings file where outputStyle is stored
- `docs/guides/output-styles.md` - Documentation on output styles system
- `output-styles/*.md` - Individual output style definitions

### Database
- No database operations - uses local JSON file storage

## Configuration
The hook is triggered on UserPromptSubmit events and requires no additional configuration beyond standard hook setup. Keyword patterns are defined in the script:

- **Brainstorming**: brainstorm, ideate, creative, innovate, imagine, possibilities, alternatives, ideas
- **Business Panel**: business, strategy, executive, presentation, stakeholder, ROI, metrics, KPI
- **Deep Research**: deep research, thorough investigation, comprehensive analysis, literature review, academic, scholarly
- **Sr. Software Developer**: implement, build, code, develop, fix, refactor, optimize, debug, deploy

## Usage Example
```bash
# User prompt automatically triggers style switching
User: "Let's brainstorm some creative solutions for user onboarding"
# System switches to Brainstorming output style

User: "Now implement the login feature we discussed"
# System switches to Sr. Software Developer output style
```

## Testing
- Manual test: Use prompts with different keywords and verify style switching occurs
- Expected behavior:
  - Keywords trigger appropriate style changes
  - User receives notification of style changes
  - Settings file is updated correctly
  - No style change occurs when keywords don't match or current style is already correct

## Related Documentation
- Output Styles: `docs/guides/output-styles.md`
- Hooks: `docs/guides/hooks.md`