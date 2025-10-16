---
description: Debug and diagnose issues using systematic investigation
argument-hint: [issue description]
---

# Debug Issue

You are debugging an issue in the codebase:

$ARGUMENTS

Follow this systematic approach:

## Step 0: Understand the Bug

If you already know _exactly_ what's causing the bug, fix it immediately and ignore the rest of the steps.

## Step 1: Document the Problem

1. If you do not yet understand the code relating to the bug, quickly launch an @agent-code-finder and tell it to understand the code related to the bug request. Prompt it with something brief, and tell it to give you a concise understanding of related documents and data-flow. It should _not_ attempt to find a solution.
2. While this runs in the background, verify your understanding of the bug. Perform some brief investigation of your own and respond with your own understanding of the issue. Do not hypothesize a solution, just clarify the issue with the user.

Based on the issue, clarify:
- **Expected behavior** — What should happen (cite spec or story AC if known)
- **Actual behavior** — What's broken
- **Reproduction steps** — How to trigger the issue
- **Context** — Feature ID (F-##), story ID (US-###), error messages, or conditions
- 
## Step 2: Initial Investigation
**Default approach: Investigate yourself first unless you specify "use-agents" or this follows a major feature implementation, in which case delegate to a root-cause-analyzer agent.**

When investigating, read files completely. Fully understand the issue before trying to fix it.

## Step 3: Identify the problem

#### Root Cause is Obvious

Skip to step 5.

#### Rootcause Is Uncertain

- Name 3-5 ideas about what could be going wrong
- Name 3-5 assumptions that you might be making

Report the _exact_ flow of information, or the _exact_ hierarchy of elements in the UI, which will often illuminate hard-to-discover issues.

If this doesn't solve it, continue validating hypothesis and assumptions until you have quoted the _exact_ issue.

Then continue to step 5.

## Step 4 (optional): Next steps if still unsolved

Delegate debugging to agents. In large codebases, use one or more root-cause-analyzer agents. Return control to the user so they can provide guidance while the agent works in the background.

## Step 5: Fix Implementation
Once root cause is confirmed:
- Keep changes minimal and focused
- Follow existing patterns in the codebase
- Maintain API stability unless approved
- If major changes are required, explain the situation and give guidance to the user on next steps.