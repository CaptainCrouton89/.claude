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
- As requirements emerge, delegate investigation agents asynchronously to document specific areas:
  - Existing patterns and conventions
  - Related code structures
  - Dependencies and integration points
  - Technical constraints and considerations
- Each agent writes real-time responses to `agent-responses/{agent_id}.md` files
- Use `./agent-responses/await {agent_id}` to monitor specific agents or continue other work until completion alerts
- Investigation agents run in parallel, each producing focused documentation
- All investigation documents MUST use the template from `pdocs template investigation-topic`
- Main agent continues requirements gathering while investigations proceed
- Output: 
  - Requirements document incorporating user clarifications high-level findings
  - Collection of investigation documents covering different aspects of the feature
- User signs off on requirements and investigation before proceeding to planning

**Planning**
- Delegate a planning agent with access to ALL requirements and investigation documents
- Agent creates detailed implementation plan citing specific investigation findings
- Plan should break down work into discrete, delegatable tasks

**Implementation**
- Delegate individual implementation agents for each task
- Each agent receives relevant investigation documents and plan sections for their task (you can pass them the plan file)
- Validate implementation continuously: spawn validation agents one step behind implementation
- Validation agents run asynchronously while next implementation steps proceed
- Each validation agent has access to requirements, investigation, plans, and the specific implementation being validated

**Final Validation**
- After all implementation complete, perform one comprehensive validation round
- Final validation agent has access to everything: requirements, investigation, plans, all implementations
- Systematically verify all requirements have been met across the entire feature
