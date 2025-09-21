It is time to perform a review of a recent implementation, related to $ARGUMENTS

1. Determine what the change was trying to accomplish. Use git diffs to determine recent changes. There may be other git changes, so focus just on the ones relevant to the feature.
2. Specify implied goals and completion criteria of the feature or changes. Use your best judgement, and write them out.
3. Determine if those goals were met. Identify implementation gaps, edge cases, weaknesses, or other failures. The goal is to have clean, maintainable, high quality code that follows best practices. Verify that it:
   - Extends existing functionality rather than creating duplicate code
   - Follows existing conventions
   - Obeys DRY, YAGNI, and other SWE principles
4. Give me a report. Cite findings with specific file paths, and symbols. 

Remember:
- Examine implementations with a critical eye. Read files completely to understand edgecases.
- Look at surrounding context—a complete understanding is more important than a quick answer
- Use @code-finder and @code-finder-advanced agents (in parallel if necessary) to investigate related files and data flows.
- Do not make assumptions—the results of this code review determine what gets pushed to production, and failures result in real harm.
