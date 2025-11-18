# Agent Session Entry System: Architecture & Solutions

## Current System Architecture

### How It Works Today

1. **Wrapper Loop** (`bin/claude-wrapper`)
   - Launches Claude in foreground
   - When Claude exits, checks for `.next-session` marker file
   - If marker exists, loops and runs `claude --resume [sessionId]`
   - Otherwise exits normally

2. **Enter Agent** (`bin/enter-agent`)
   - Reads registry (`.active-pids.json`) to find spawned agent's sessionId
   - Writes `.current-agent-id` file with agent ID
   - Writes marker file `.next-session` with agent's sessionId
   - Walks process tree to find Claude and kills it
   - Exit-agent runs exit code 0

3. **Exit Agent** (`bin/exit-agent`)
   - Reads `.current-agent-id` to determine current agent
   - Looks up parentSessionId in registry
   - Writes marker file `.next-session` with parent sessionId
   - Walks process tree to find Claude and kills it
   - Cleans up `.current-agent-id`

4. **Registry** (`.active-pids.json`)
   - JSON file with agent entries: `{ agent_ID: { sessionId, parentSessionId, parentPid, status, ... } }`
   - Populated when klaude spawns an agent
   - Persists for agent lifecycle

### Current Flow Example

```
User in Parent Session S1 (PID 100)
  ↓
Task spawns agent → Agent Session S2 created (PID 200) in registry
  ↓
User runs enter-agent
  - Finds S2 in registry
  - Writes marker: S2
  - Kills Claude PID 100
  - Wrapper detects marker
  ↓
Wrapper runs: claude --resume S2
  - Creates FORKED session S2' (different instance)
  - S2' is interactive in terminal
  ↓
User in agent (S2') now
  ↓
User runs exit-agent
  - Finds parent S1 in registry (via agent entry)
  - Writes marker: S1
  - Kills Claude (managing S2')
  - Wrapper detects marker
  ↓
Wrapper runs: claude --resume S1
  - Creates FORKED session S1' (different instance)
  - Problem: Original Task spawned in S1 is still expecting S1, not S1'
  - Task sees orphaned/forked state
```

## The Problem

### Session Forking Issue

**What `--resume` does:**
- Loads transcript from a session ID
- Creates a NEW session instance that replays that transcript
- The new session is a divergence point—separate instance from original

**The Symptom:**
- When you exit-agent and wrapper runs `claude --resume S1`, you get S1' (a fork)
- Original S1 is still in memory/running, waiting for agent task completion
- You interact with S1', which is a new divergence
- Original S1 and spawned agent Task T1 are orphaned/stuck

**Why This Breaks Agent Management:**
1. Parent spawns Task T1, expects to manage it via Session S1
2. You enter-agent → Session switches to S2'
3. You exit-agent → Session switches to S1'
4. But T1 is still registered as child of S1, not S1'
5. S1' has no record of spawning T1
6. Task management state is split across two instances

## Desired Outcome

### What Should Happen

1. **Single Session Instance Throughout:**
   - Parent spawns agent → Creates Session S2 in registry
   - User enters agent (S2) → Same S2 instance becomes interactive
   - User exits agent → Same S1 instance becomes interactive again
   - No session forking or divergence

2. **Transparent Terminal Switching:**
   - `enter-agent` switches terminal control from S1 to S2
   - `exit-agent` switches terminal control from S2 back to S1
   - User sees smooth session transitions, but same underlying session instances

3. **Preserved Task State:**
   - Task T1 spawned by S1 remains aware of S1 (not forked version)
   - Registry relationships stay consistent
   - No orphaned tasks or split state

## Root Cause Analysis

### Why `--resume` Doesn't Work For This

`claude --resume [sessionId]` is designed for:
- Replaying a completed session transcript
- Forking to continue from a known point
- Human review of past interactions

It's **not** designed for:
- Handing off terminal control to an existing session instance
- Keeping multiple session instances synchronized
- Transparent session switching

### Why Process Killing Alone Isn't Enough

Current approach:
- Kill Claude process → Wrapper detects and resumes next session
- But this creates a new session fork via `--resume`

What's needed:
- Session lifecycle management that doesn't fork
- A way to pause/resume a session without diverging

## Proposed Solutions

### Solution 1: Session State Management (No Forking)

**Core Idea:**
Instead of using `--resume` (which forks), manage session state directly in the registry:
- Mark parent session S1 as "suspended" (waiting for agent)
- Mark agent session S2 as "active"
- When switching back, mark S2 as done and S1 as "active" again
- Resume running Claude with the same session ID (no `--resume` fork)

**Implementation Approach:**
1. Modify registry to track session states: `active`, `suspended`, `completed`
2. When enter-agent runs:
   - Mark S1 as `suspended`
   - Mark S2 as `active`
   - Kill Claude
   - Wrapper detects marker and runs `claude --resume-active S2` (NEW FLAG)
     - Instead of `--resume` (fork), this resumes the *same* S2 instance
3. When exit-agent runs:
   - Mark S2 as `completed`
   - Mark S1 as `active`
   - Kill Claude
   - Wrapper runs `claude --resume-active S1`

**Pros:**
- Single session instance per context (no forking)
- Clean state management in registry
- Task relationships preserved
- Transparent to user

**Cons:**
- Requires new Claude flag: `--resume-active` (or similar)
- Requires registry state tracking
- More complex session lifecycle management

**Key Changes Needed:**
- Claude CLI needs new `--resume-active [sessionId]` flag that resumes same instance (not fork)
- Registry needs session state field
- enter-agent/exit-agent update registry before writing markers

---

### Solution 2: Keep All Processes Alive (Terminal Muxing)

**Core Idea:**
Instead of killing processes, keep both parent and agent Claude instances running, but only one interactive at a time.

**Implementation Approach:**
1. Parent session S1 starts normally
2. When spawning agent: Start agent Claude process for S2 in background (suspended)
3. When enter-agent runs:
   - Suspend S1 (mute/pause its terminal)
   - Activate S2 (give it terminal control)
   - No process killing
4. When exit-agent runs:
   - Suspend S2
   - Activate S1
   - No process killing

**Pros:**
- No forking involved
- Both session instances stay alive and aware
- Simpler state transitions

**Cons:**
- Multiple Claude processes running (resource overhead)
- More complex wrapper to manage multiple processes
- Terminal control/multiplexing is tricky
- Harder to implement cleanly

**Key Changes Needed:**
- Wrapper manages multiple Claude processes instead of one
- Wrapper multiplexes terminal input/output between them
- enter-agent/exit-agent signal wrapper to switch active process (not kill)

---

### Solution 3: Hybrid Approach (Recommended)

**Core Idea:**
Use registry-based state management (Solution 1) but keep implementation simpler by starting with Claude CLI support.

**Phases:**
1. **Phase 1:** Add `--resume-active [sessionId]` flag to Claude CLI
   - Loads session state but doesn't fork transcript
   - Returns to exact same session instance

2. **Phase 2:** Update enter-agent/exit-agent to use registry states
   - Update registry with `suspended`/`active` states
   - Write markers pointing to session IDs
   - Wrapper uses `--resume-active` instead of `--resume`

3. **Phase 3:** Optional optimization
   - If needed later, migrate to process muxing (Solution 2)

**Pros:**
- Minimal changes to existing architecture
- No major rewrites
- Uses Claude CLI features properly
- Scales to future complexity

**Cons:**
- Requires Claude CLI enhancement
- Intermediate complexity

---

## Recommendation

**Go with Solution 1 (Session State Management) + Phase 1/2 of Hybrid:**

**Why:**
1. Solves the forking problem directly
2. Doesn't require resource overhead of multiple processes
3. Preserves task relationship state
4. Can be implemented step-by-step

**Next Steps:**
1. Determine if Claude CLI can support `--resume-active` or similar flag
2. If yes: Implement registry state tracking, update enter-agent/exit-agent
3. If no: Consider Solution 2 or request Claude CLI enhancement
