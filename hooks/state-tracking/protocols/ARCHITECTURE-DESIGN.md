# Architecture Design Protocol

## Step 1: Discovery (Ask 4-6 Questions)

**For complex systems, parallelize research first:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Analyze existing codebase patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">Read [paths]. Identify architecture patterns, tech stack, service boundaries, integration points. Summarize findings.</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Research integration requirements</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">Analyze integration points at [paths]: external APIs, services, databases, message queues, auth. Document dependencies.</parameter>
  </invoke>
</function_calls>
```

### Discovery Questions

**Q1: System Purpose & Scope**
- New system or extending existing?
- Main purpose, users, scale expectations?

**Q2: Requirements**
- Functional: Features, operations, critical workflows?
- Non-functional: Performance targets, scalability, availability, consistency trade-offs?

**Q3: Constraints**
- Technical: Required stack, integration needs, legacy compatibility?
- Organizational: Team size/skills, timeline, budget?
- Operational: Deployment environment, security/compliance?

**Q4: Data & State**
- Data types, volume, sensitivity?
- Relationships (relational, document, graph, KV)?
- Lifecycle patterns (CRUD, archive)?

**Q5: Integration Points**
- External APIs, internal services, databases, message queues, auth providers?
- Integration patterns (REST, GraphQL, gRPC, events)?

**Q6: Quality Attributes (optional)**
- Rank priorities: Performance, Scalability, Reliability, Security, Maintainability, Observability, Cost

---

## Step 2: Options Analysis

Present 2-4 architecture options with trade-offs. Include:

**For each option:**
- Description (1 sentence)
- Simple ASCII diagram
- Tech stack (1-2 lines)
- Pros/Cons (3-5 key points each)
- Best for (2-3 bullets)
- Risks (1-2 lines)

**Recommendation matrix:** Compare options against key criteria (team size, timeline, budget, scale)

**Final recommendation:** State choice with 3-5 bullet rationale

---

## Step 3: Detailed Design

**For complex systems, parallelize layer design:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Design data layer</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">Design data layer for [system]: schema, repository pattern, caching, migrations. Include code examples.</parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Design API layer</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">Design API layer for [system]: endpoints, auth middleware, validation, error handling. Include TypeScript examples.</parameter>
  </invoke>
</function_calls>
```

### Design Template

Include:
1. **Component breakdown** - Layers, responsibilities, tech stack, key files
2. **Critical data flows** - 2-3 key flows with sequence, time budget, dependencies
3. **Security architecture** - Auth/authz approach, data protection, API security
4. **Scalability strategy** - Current capacity, scaling triggers, approach
5. **Deployment architecture** - Infrastructure, environments, pipeline
6. **Technology decisions** - Key choices with reasoning and alternatives

---

## Step 4: Documentation

Create ADR (Architecture Decision Record):
- **Decision** - What was chosen
- **Context** - Why it mattered
- **Reasoning** - 3-5 bullets supporting choice
- **Consequences** - 2-3 key implications
- **Alternatives considered** - What was rejected and why (1 line each)

Optional: System diagrams (C4 model), deployment diagrams

---

## Completion Checklist

- [ ] Requirements and constraints clear
- [ ] Options evaluated with trade-offs
- [ ] Recommendation justified
- [ ] Component design detailed
- [ ] Critical data flows documented
- [ ] Security and scalability addressed
- [ ] Technology decisions explained
