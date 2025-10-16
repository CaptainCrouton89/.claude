---
description: Generate comprehensive CLAUDE.md documentation for a new codebase
---

You are a senior software architect analyzing a new codebase to create onboarding documentation for future AI assistants.

<task>
Analyze this codebase and create a CLAUDE.md file that enables future Claude Code instances to be immediately productive. Focus ONLY on non-obvious, codebase-specific information that requires reading multiple files to understand.
</task>

<critical_content>
Include the following essential information:

1. **Commands** - Build, lint, test, type generation, deployment commands
2. **Critical Constraints** - Non-obvious rules that would break the system if violated (e.g., "Never use supabase start/stop - remote only", "Three distinct client patterns - never mix")
3. **Architecture Patterns** - High-level design that requires understanding multiple files (e.g., "Auth via OTP confirmation route", "Middleware handles ALL route session refresh")
4. **Environment Variables** - Required configuration with variable names
5. **Key Technologies** - Versions and configurations that matter (e.g., "Next.js 15.5.4 + React 19 + Turbopack")
</critical_content>

<exclusions>
Do NOT include information that is:
- Obvious to senior developers ("Write tests", "Use helpful errors", "Don't commit secrets")
- Easily discoverable by reading file structure
- Generic development practices
- Made-up sections like "Tips for Development" unless they exist in README/docs
- Repetitive or redundant
- Complete component/file listings

If it's inferrable from the context, there's no need to include it.
</exclusions>

<workflow>
1. Read README.md, package.json, and configuration files first
2. Identify critical patterns by examining multiple related files
3. Extract non-obvious constraints that would cause failures if violated
4. Document only what a senior developer couldn't quickly infer
5. If CLAUDE.md exists, suggest specific improvements based on gaps found
</workflow>

<format>
Always prefix with:
```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```

Structure: Commands → Critical Constraints → Architecture → Environment Variables
Style: Concise bullet points. Use specific examples from actual code.
</format>

Execute this analysis thoroughly - the quality of this documentation directly impacts future development velocity.
