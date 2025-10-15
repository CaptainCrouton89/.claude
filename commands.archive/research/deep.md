I want you to perform strategic, multi-perspective research on the following subject using the Asymmetric Research Squad methodology:

$ARGUMENTS

## Phase 0: Research Definition & Setup

1. **Evaluate Research Definition**. A well-defined research subject has:

   - Clear scope with defined boundaries
   - Specific depth requirements (comprehensiveness level, evidence standards)
   - Desired output format (strategic report, evidence portfolio, analytical essay)
   - Key questions that need answering

2. **Clarification Protocol**: If the subject needs refinement, ask only critical questions while making reasonable assumptions. State all assumptions explicitly.

3. **Research Infrastructure**:

   - Create directory: `/[research-subject]`
   - Create subdirectories:
     - `/[research-subject]/persona-findings` (for each persona's raw research)
     - `/[research-subject]/synthesis` (for cross-persona analysis)
     - `/[research-subject]/evidence` (for primary sources and contradictions)

4. **Strategic Objective Documentation**: Write to `/[research-subject]/objective.md`:
   - Core research questions
   - Success criteria
   - Evidence standards required
   - Key stakeholders and perspectives to consider
   - Potential biases to guard against

## Phase 1: Asymmetric Persona Deployment

5. **Deploy Research Personas in Parallel**:

   - Break research into 8 distinct persona-based investigations
   - Use Task tool to assign each persona to parallel subagents
   - Each subagent receives:
     - The objective.md file
     - Their specific persona mandate and search strategies
     - Instructions for evidence quality standards

   **Persona Assignments**:

   - **The Historian**: Historical evolution, failed attempts, forgotten alternatives
   - **The Contrarian**: Disconfirming evidence, expert critiques, documented failures
   - **The Analogist**: Cross-domain parallels, biological/military/economic analogies
   - **The Systems Thinker**: Second-order effects, stakeholder mapping, causal chains
   - **The Journalist**: Current state, key players, latest developments
   - **The Archaeologist**: Past solutions (10-50 years ago), obsolete approaches worth revisiting
   - **The Futurist**: Patents, speculative research, 2030+ predictions
   - **The Negative Space Explorer**: What's NOT being discussed, adoption barriers, missing features

   **Subagent Requirements**:

   - Use 8-10 parallel searches per persona minimum
   - Apply SCAMPER method for query variation
   - Document findings to `/[research-subject]/persona-findings/[persona-name]-[subtopic].md`
   - Include confidence ratings and evidence quality assessments
   - Capture contradictions and uncertainties explicitly

## Phase 2: The Crucible - Structured Analysis

6. **Cross-Persona Synthesis** (New parallel task deployment):

   - Deploy analysis agents to examine ALL persona findings
   - Execute Analysis of Competing Hypotheses (ACH):
     - Generate 5+ mutually exclusive hypotheses
     - Search for disconfirming evidence
     - Document hypothesis survival analysis
   - Map contradictions between personas
   - Identify emergent patterns
   - Write synthesis to `/[research-subject]/synthesis/crucible-analysis.md`

7. **Evidence Triangulation**:
   - Verify critical findings across multiple sources
   - Use WebFetch batches (5-10 URLs) for rapid validation
   - Deploy mcp\_\_scrape for complete primary source capture
   - Document to `/[research-subject]/evidence/verification-log.md`

## Phase 3: Emergent Insight Generation

8. **Strategic Analysis Tasks** (Final parallel deployment):
   - **Tension Mapping Agent**: Identify maximum disagreement points
   - **Pattern Recognition Agent**: Find unexpected historical echoes
   - **Negative Space Agent**: Document unanswered questions
   - **Innovation Agent**: Generate novel hypotheses from persona combinations
9. **Expert Validation**:
   - Use mcp**zen**chat for strategic thinking validation
   - Test emergent insights against additional evidence
   - Document to `/[research-subject]/synthesis/emergent-insights.md`

## Phase 4: Strategic Report Synthesis

10. **Final Report Generation**: Read ALL content from subdirectories and synthesize to `/[research-subject]/report.md` with:
    - **Executive Synthesis**: Most valuable/surprising discoveries
    - **Multi-Perspective Analysis**: Organized by persona with conflicts highlighted
    - **Evidence Portfolio**: Primary sources, confidence ratings, contradictions
    - **Strategic Implications**: Second/third-order effects, stakeholder impacts
    - **Research Gaps**: What remains unknown, future research needs

## Quality Assurance Checklist

Before finalizing, verify:

- [ ] All 8 personas deployed with distinct search strategies
- [ ] Minimum 8-10 parallel searches per persona executed
- [ ] Contradictions and disagreements captured, not smoothed over
- [ ] Evidence hierarchy applied (primary > secondary > synthetic > speculative)
- [ ] Negative space and absences documented
- [ ] Cross-domain analogies explored
- [ ] Temporal range covered (past, present, future)
- [ ] Novel insights emerged from persona interactions

The goal is strategic intelligence gathering that uncovers unexpected insights, challenges assumptions, and reveals hidden connections. Execute all persona research in parallel for maximum efficiency and discovery potential.
