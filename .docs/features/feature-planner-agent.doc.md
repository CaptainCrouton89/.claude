# Feature Planner Agent

## Overview
The feature-planner agent is a specialized agent that creates comprehensive implementation plans for large-scale software changes, major refactors, and complex system transformations in pre-production environments.

## User Perspective
Users invoke this agent AFTER they have collected all relevant files for a feature using other discovery agents. The agent analyzes the complete codebase context and produces detailed, phase-based implementation roadmaps that account for all edge cases and dependencies.

## Data Flow
1. User completes discovery phase using code-finder or similar agents to collect ALL relevant files
2. User invokes feature-planner agent with complete file context and desired outcome
3. Agent analyzes all provided code files, documentation, and external dependencies
4. Agent creates comprehensive implementation plan with phases, risks, and technical decisions
5. Agent outputs structured plan with executive summary, implementation phases, and success metrics

## Implementation

### Key Files
- `agents/feature-planner.md` - Main agent definition with role instructions and workflow
- Uses standard Claude agent tools: Bash, Glob, Grep, Read, WebFetch, TodoWrite, WebSearch, BashOutput, mcp__ide__getDiagnostics, mcp__ide__executeCode

### Agent Configuration
- Model: opus (for comprehensive analysis capabilities)
- Color: pink
- Tools: Full development toolchain for analysis and planning

## Usage Example
```markdown
Context: After finding all authentication-related files, the user wants to add OAuth2.
user: "I need to add OAuth2 authentication to our Express API"
assistant: "I've found all the authentication files. Now I'll use the feature-planner agent with these files to create a comprehensive plan for implementing OAuth2 authentication."
```

## Key Principles
- Always analyze ALL provided files thoroughly before planning
- Break existing code when it leads to better implementation (pre-production focus)
- Throw errors early and often - no error suppression
- Create incremental phases ordered by dependencies and risk
- Focus on ideal solutions without compromise
- Never use 'any' types - always specify proper types

## Output Structure
- Executive Summary: Business value overview
- Scope Analysis: Affected components, dependencies, complexity
- Implementation Phases: Ordered tasks with success criteria and risks
- Technical Decisions: Architecture patterns, technology choices, data models
- Testing Strategy: Unit, integration, and performance test approaches
- Risk Matrix: Probability, impact, and mitigation strategies
- Pre-Implementation Checklist: Verification items
- Success Metrics: Measurable completion criteria

## Testing
- Manual test: Invoke agent with a sample feature request and relevant files
- Expected behavior: Should produce comprehensive, phase-based implementation plan that covers all technical aspects and edge cases

## Related Documentation
- Other agents: `agents/code-finder-advanced.md` for discovery phase
- Agent system: Root `CLAUDE.md` for overall agent framework