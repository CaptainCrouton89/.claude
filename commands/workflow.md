---
description: Execute complete feature development lifecycle with agent delegation
argument-hint: [feature description or ID]
---

$ARGUMENTS

## Feature Development Lifecycle

Execute the complete feature development lifecycle using strategic agent delegation:

**Requirements & Investigation → Planning → Implementation → Validation**

### Phase Guidelines

**Requirements & Investigation**
- Main agent performs lightweight initial investigation to understand the feature scope
- Main agent asks clarifying questions to understand user intent and constraints
- As requirements emerge, spawn investigation agents asynchronously to document specific areas:
  - `klaude start Explore "investigate authentication patterns for feature X"`
  - `klaude start Explore "document existing API integration patterns"`
  - Each focusing on: existing patterns, related code, dependencies, technical constraints
- Investigation agents run in parallel (non-blocking by default)
- Monitor progress: `klaude sessions` shows all active agents
- Continue requirements gathering while investigations proceed in background
- Check completion: `klaude status <session-id>` or `klaude wait <session-id>` to block when needed
- Review findings: `klaude logs <session-id>` or `klaude logs <session-id> --summary`
- All investigation documents MUST use the template from `pdocs template investigation-topic`
- Output:
  - Requirements document incorporating user clarifications and high-level findings
  - Collection of investigation documents covering different aspects of the feature
- User signs off on requirements and investigation before proceeding to planning

**Planning**
- Spawn planning agent: `klaude start Plan "create implementation plan for feature X"`
- Agent has access to ALL requirements and investigation documents
- Agent creates detailed implementation plan citing specific investigation findings
- Plan breaks down work into discrete, delegatable tasks
- Review plan: `klaude logs <session-id>` when complete

**Implementation**
- Spawn implementation agents in parallel for independent tasks:
  - `klaude start programmer "<relevant investigation and plan documents> Implement phase 3"`
  - `klaude start junior-engineer "<relevant investigation and plan documents> Implement phase 4"`
- Each agent receives relevant investigation documents and plan sections
- Monitor all agents: `klaude sessions -v` shows detailed progress
- Use `klaude message <session-id> "clarification..."` for async communication
- Block on critical dependencies: `klaude wait <session-id>` when needed