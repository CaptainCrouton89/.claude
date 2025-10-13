# Agent Definition Standards

This directory contains specialized agent definitions used by the Task tool. Each agent operates asynchronously and writes results to `agent-responses/{id}.md`.

## Structure Requirements

Every agent definition must include:

1. **Purpose Statement**: Clear description of when to use this agent vs working directly
2. **Tool Access**: Explicit list of available tools (use `*` for all tools)
3. **Execution Model**: State whether agent executes async and where results appear
4. **Delegation Rules**: Whether agent can spawn sub-agents and which types
5. **Examples**: Concrete usage scenarios showing proper delegation patterns

## Critical Patterns

**Async-First Design**: All agents execute asynchronously. Never block on agent completion unless results are prerequisites for next steps. Use `./agent-responses/await {agent_id}` only when necessary.

**Shared Dependencies**: When spawning parallel agents, implement shared types/interfaces/schemas FIRST, then launch agents with clear boundaries and references to shared code.

**Scope Clarity**: Define precise boundaries between "use this agent" vs "work directly". Single-file edits and quick fixes almost never justify agent delegation.

**Parallel Execution**: Structure prompts to enable parallel agent launches. Include shared dependency requirements and clear task boundaries in examples.

**Model Selection**: Haiku for speed (simple searches), Sonnet for comprehension (complex analysis). Specify model implications in agent description.

## Delegation Philosophy

Agents exist to parallelize complex work, not to avoid using tools directly. Use agents when:
- Task complexity justifies focused context (3+ files, intricate logic)
- Parallel execution opportunities exist (2+ independent tasks)
- Deep investigation required (architectural analysis, pattern tracing)

Work directly when:
- Single file modifications
- Rapid iteration debugging
- Small scope changes

## Output Standards

Agents must specify exact output location and format. Results should be actionable without requiring follow-up clarification.

## Anti-Patterns

- Vague "use for complex tasks" descriptions
- Missing tool access specifications
- Unclear async behavior documentation
- Examples without shared dependency patterns
- Delegation without clear boundaries
