## Agent Types & Responsibilities

### Memory & Context Agents
- [ ] Memory agent surfacing important information in real time
- [ ] Memory bank that logs what's been done, selectively pulled into context as necessary
- [ ] Compress trace in real time for efficient context management
- [ ] Compaction should be instant—compress history as it goes

### Documentation & Knowledge Management
- [ ] Note taking into documentation
- [ ] Retrieving from documentation
- [x] Document as it goes—create Claude.md files that are great
- [x] Memory documents are maintained
- [x] Claude.md updates when file updates automatically
- [x] Smart Claude.md growth
- [ ] Change log of recent changes in Claude.md
- [ ] Create documentation in folder, and agent intelligently includes documentation as needed—injected
- [ ] More automatic documentation beyond current background writing

### Validation & Quality Assurance
- [ ] Validation in real time
- [x] Smart validation after features completed

- [ ] Library verification
- [ ] Post feature verification
- [ ] Validate existing features is good, compare patterns
- [ ] Lint fixing
- [x] Claude.md rule following monitor

### Instruction & Pattern Following
- [ ] Instruction following agent surfacing information in real time
- [ ] Conflict with design pattern agent
- [ ] Instruction following injection
- [ ] Learning as it goes

### Research & Verification
- [ ] "Any claims made in previous statement that are speculative? If so, what additional research would be necessary" - then kicks it off itself
- [ ] "Which of these things were assumptions, let's find and validate them." Then useful ones get saved (new agent)

## Context Management System

### Background Agent Context Structure


When implementing 3rd part library, it should validate/research.
When its debugging or investigating a hard problem, should intelligently suggest ideas:
- Debugging: Suggest 5 possibilities, 

Could have it be aware 


When it's investigating, it should fire off multiple agents
When it's planning, it should:
- proactively find 3rd party documentation
- find existing documentation from codebase



A context  collection. Agents keep adding relevant context to this file/json. 

When todo list is super long, it fires off research for later tasks!!

When plan mode is on, it alerts main agent "I'll investigate this stuff—just hold tight". Or "Right before exitingPlanMOde, read planContext.md. If there is more context there that's relevant to what you need to do, read it and understand it first before exiting plan mode"

Inside, a "3rd party library" agent has researched. Codebase research. Documentation research. Patterns research. Each then just submits relevant additional files that might be worth reading. Their documentation is just automatically injected as documentation if it arrives in time. Ideally, just injects "@documentation-file-path" or "research results" or "change log recent changes"

We inject ideally after updating todo list. 

Writes to a document all the @files (saves all the research in .claude). Then a ho


We build code-guidelines: a json array of rules that must be followed. This is all that gets checked by the validator. 

Light model just classifies effort. Determines how many agents are made in parallel. 

It classifies what's going on. Light model outputs a classification and an effort: {effort: 1-3, classification: debugging|answering|implementing|researching}. Classification can be overwritten by planmode, for example.


---------------

Basic, always helpful parallelism:

Global:

- Save everything to memory.
- Memory finder agent—surfaces important memories
- Pays attention to what you're working on, solves problems you didn't realize you had
- 
  
Per Conversation:

- Performs deeper analysis on user queries. Insight, problems, research, etc.
- "Pick through this idea. Deeply reason through each one—does it make sense? Will it work? What am I missing? And how can I solve those missing pieces? Be a brilliant collaborator—find the flaws, then brainstorm solutions to each." the idea is that the agent is spending more compute on your question, in the background.
- "How much brainpower does this question warrant?" 
  1. skip
  2. "Think of 5 different ideas. Etc."
  3. "Approach this problem from 5 personas"
  4. "Collaborate with me. Deeply consider different options—what am I missing, and what can we incorporate?"
  5. "[crazy]"

Creativity, brainstorming, reasoning, researching... (could I theoretically have endless? video-workflow agent would just be something that turned itself on, based on prompt. It would inject something like, "I'm working on this, I'll let you know when its done.")

Codebases:

- Unit-tests in the background
- Writes unit tests in background
- Identifies bugs/refactoring opportunities in background
- Finds insights in repeated conversations (we need to refactor XYZ)

---------------




# State:

- One haiku model outputs phase: Implementing/Investigating/Validating/Debugging. This is based on assistant message and tool call headers since phase began.
- Recent context is kept by looking at 5 most recent files that have been read

{
    phase: Implementing/Investigating/Validating/Debugging/Architecting/none
    actionHistory: [{user: "user message", assistant: [BashToolCall, Write(FileName), Read(file)], files: [filepath, filepath, filepath]}]
}

- phase: debugging (for investigating and SOLVing a bug). Investigating: research and answering questions and planning. Validating: Writing tests, verifying something works, etc. Implementing: Writing code, performing actions that change state
- actionhistory: Contains every action since session start. Each object has usermessage and all assistant toolcalls, with inputs and outputs (or pending). 

# Message Queue:

{message: "content of message", priority: 1|2|3, phase: Implementing/Investigating/Validating/Debugging, timestamp: isostamp}

Priority determines when message injected:

**Priority 1**: waits until marking a todo item done, as long as phase matches
**Priority 2**: does as soon as possible, as long as pahse matches.
**Priority 3**: injected asap, no matter what

# Phase Triggers

Whenever the phase changes, it creates a phase trigger. This uses the user's message and the contents of the action history. Most will just use the most recent actionHistory item, specifically the userPrompt, though will potentially use the files from recent messages as well.

Plan mode auto-triggers investigation phase

Each task has a priority. If the task priority is 2 or less, it gets stopped early if the phase changes.

## Investigating
_research, answering questions, planning_

Looks at most recent actionHistory user messsage.

### Effects

Task, P2: Online research - "using web resources, get any documentation relevant to this if it's from a newer library". Custom context on what libraries are already installed, what library documentation already exists.

Task P2: Three haiku code-finders put together relevant code. Each starts out with more complete documentation on project layout added to its context. Custom prompted by agent.

Task P3: Edge case finder agent - "Find edgecases/strangeness in the answer. Look for the nonobvious. Find side effects, etc". Starts with more architectural context than usual.

## Debugging
_investigating and implementing fixes to bugs_

Looks at most recent actionHistory user messsage, 5 most recent files (no matter how old).

### Effects

Task, P2: What are the 5 most likely possible causes? Read any related files in their entirety before answering. 

Task, P2: For each of the 5 possibilities, validate it step by step, starting with the most likely.

## Implementing
_writing code, anything else_


## Validating
_testing code, writing tests_

# Other Triggers

### Stopping After Bash/Edits
_state of repo has changed_

Orchestration task: It determines what was accomplished, and therefore what needs to get done:

Workflows:
- Validate/test feature
- Document update
- Review code (consider assumptions, validate them)
- Update claude.md preferences
- Save to work logs

### Closing Todo List
_finished feature, finished long research, finished long refactor_

This trigger represents big tasks completing. We don't need context any more, now we just need validation, certainty, refactoring advice, updating documentation, etc.

**Arguments**: Todo list length, time duration

### Closing Todo Item
_finished step of larger feature_

### Starting Plan Phase
_planning_

### Exiting Plan Mode
_implementing plan_

### User Message
_new directive_

Task, P3: Unsolicited advice. Agent assesses what user wants, and outputs advice to the main agent based off advisory system prompt. Sent with <system-propmt> tags
- Debugging: "Don't jump into the debugging—come up with ideas first. Read files completely, and "
- Prompt improvements: "The user wants you to improve the prompt. Read the __ if you haven't already"
- Huge planning: "This seems like a big plan. You might want to parallelize research and parallelize implementation"
- Research: "The user wants to perform deeper research. You should parallelize the research"

This would be customizable

--------------------

Observer agents:

Creativity triggered: <notification>A background creativity process has begun. Alert the user that you're going to "keep thinking on it" in your response.</notification>

Research triggered: "<notification>A background research process has begun. Alert the user that you're going to "keep looking into it" in your response.</notification>


- Memory md

mcp for 0->1
learning applicationc

MCP for 0->1: need more specs. Plan it all out—all the details. Then delegate it all out. 


---

Set up your foundation:

Project structure and build system - Establish your directory layout, choose your build tools, and set up dependency management. This prevents painful restructuring later.
Version control and branching strategy - Initialize your repo, define your workflow (trunk-based, git-flow, etc.), and set up any CI/CD pipelines early.
Development environment - Containerize if needed, document setup steps, and ensure the team can get running quickly.

Build the skeleton, not the features:

Core architecture and interfaces - Define your main modules, boundaries, and how they'll communicate. Write the interfaces/contracts first, even if implementations are stubs.
Data models and schemas - Get your fundamental data structures right. Database migrations are much harder to fix later than code.
Shared utilities and conventions - Establish logging, error handling, configuration management, and coding standards before they diverge across the codebase.

Prove the risky parts:

Vertical slice or "steel thread" - Build one simple end-to-end feature that touches all layers. This validates your architecture actually works and reveals integration issues early.
Technical spikes for unknowns - If you're unsure about a technology, API, or approach, do a quick proof-of-concept now rather than discovering problems deep into development.

The key is resisting the urge to build features immediately. The foundation you lay now determines whether your massive project stays maintainable or becomes unmaintainable legacy code. What kind of project are you working on?

--- 

MCP for implementing/requirements/etc—trigger workflow, and it knows what to do?

As it goes, when things happen, guidance is injected in.


ENTER THE SUBAGENT!!! 
it can run a command to "enter" the subagent. user is now talking to the subagent. The subagent has context that it's a subagent and should run exit once the user's task is complete. Output still logged to responses.md.

After exiting, the main agent sees that the subagent has been updated. 

Claude.md files being yaml structure, so that only the relevant context is read in automatically. 
Custom pre-tool. When it reads, it automatically reads the "memory.md" and the "api.md" in that directory or wtvr depending on the type of task.


## New ideas from CCA

- Close loop: 
  - Better logging
  - profile at same time
  - Better browser
  - Idea is to have an environment that is decoupled from both the code and... elsewhere? Collection of scripts it can run to view what's going on. 
  - Better browser: view network traffic coming and going from process?
  - Auto-logging traces at different levels?

- Get keys for backend quickly
- Let it use CURL and monitor traffic
- ast grep/modifications
- Should be able to take function/symbol and understand everywhere it's used and needed
- sqlite docs/user-stories/etc


Agents needed:
Grunt: (grok) Used to 