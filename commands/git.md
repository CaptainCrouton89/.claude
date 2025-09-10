I have just finished one or more features. It's time to push commits and to update the documentation.

1. Examine git changes
2. Decide approach based on scope:

   **For small changes (handle directly without agents):**

   - Single feature implementation
   - Fewer than 3 files changed
   - Multiple minor/trivial changes
     → Add files and write commit message yourself

   **For larger changes (use parallel agents):**

   - Multiple features or significant changes
   - 3+ files with substantial modifications
     → Use parallel agents (all in same invocation) for documentation updates:

   - For **each** new feature or significant change, spawn a task with the docs-git-committer. That agent should be instructed to:
     a. Review the changes in detail
     b. Update or create documentation following the appropriate templates:
     - Feature docs: `.docs/features/[name].doc.md` using `~/.claude/file-templates/feature-doc.template.md`
     - CLAUDE.md updates: Only for major architectural changes or new critical patterns. When needed, update CLAUDE.md files in the specific directories containing the changed files (never the root CLAUDE.md). Use `~/.claude/file-templates/claude.template.md` template.
     - Architecture docs: `.docs/architecture/` using `~/.claude/file-templates/arch.template.md`
     - API docs: `.docs/api/` using `~/.claude/file-templates/api.template.md`
     - Setup guide: `.docs/setup.md` using `~/.claude/file-templates/setup.template.md`
       c. Only document substantial changes (see agent's decision tree)
       d. Add the relevant file changes (along with any doc updates) and commit the code
   - The agent knows what to do, as long as you give it the high level instructions

3. Wait for documentation agents to complete before final push
4. Push changes after all add + commits have been made (including any doc updates)

After making your changes, briefly list the commits made, and link to any documentation files that got updated.
