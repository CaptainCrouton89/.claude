# Code Finder Agent

## Overview
Code discovery agent that uses Grok for sophisticated semantic understanding and thorough code investigations across complex codebases. Designed for finding code through conceptual relationships rather than simple text matching.

## User Perspective
Users interact with this agent when they need deep code investigation that goes beyond basic search. The agent automatically recognizes when queries require semantic analysis, cross-file dependencies, or pattern recognition. Users simply ask natural language questions about code relationships, and the agent performs comprehensive discovery across the entire codebase.

## Data Flow
1. User asks question requiring deep code investigation (authentication flows, error handling patterns, etc.)
2. Agent performs intent analysis to decompose query into semantic components and variations
3. Agent executes comprehensive search using multiple parallel strategies with semantic awareness
4. Agent follows import chains, analyzes type relationships, and traces dependency graphs
5. Agent presents complete results with file paths, code snippets, context, and relevance explanations

## Implementation

### Key Files
- `agents/code-finder.md` - Agent definition with search workflows and strategies
- Uses Grok model for superior code comprehension
- Configured with orange color indicator for visual identification

### Search Workflow
- **Phase 1**: Intent Analysis - decompose query, identify search type, infer requirements
- **Phase 2**: Comprehensive Search - execute parallel semantic-aware search strategies
- **Phase 3**: Complete Results - present findings with context and relevance ranking

### Search Strategies
- **Definitions**: Check types, interfaces, implementations, abstract classes
- **Usages**: Search imports, invocations, references, indirect calls
- **Patterns**: Use semantic pattern matching, identify design patterns
- **Architecture**: Trace dependency graphs, analyze module relationships
- **Dependencies**: Follow call chains, analyze type propagation

## Configuration
- Model: `grok`
- Color: `orange`
- Tools: Bash, Glob, Grep, Read, WebFetch, TodoWrite, WebSearch, BashOutput, KillShell, mcp__ide__getDiagnostics, mcp__ide__executeCode

## Usage Example
```bash
# Agent automatically triggered for complex investigations
User: "How does the authentication flow work?"
Agent: "I'll use the code finder to trace the complete authentication flow across the codebase."

# Comprehensive results with semantic understanding
Agent finds: auth middleware, guards, services, DTOs, database functions, API routes
```

## Testing
- Manual test: Ask complex questions about code architecture, dependencies, or patterns
- Expected behavior: Agent provides comprehensive results with file paths, code snippets, and explanations for all semantically related code

## Related Documentation
- Architecture: `agents/` directory contains all available agents