# Documentation Protocol

## Step 1: Documentation Discovery (Ask 3-5 Questions)

**Don't start writing blindly.** Understand what's needed:

### Q1: Documentation Type
```
"What type of documentation do you need?

1. **README** - Project overview, getting started
2. **API Documentation** - Endpoint/function reference
3. **User Guide** - How to use the product
4. **Developer Guide** - How to contribute/extend
5. **Architecture Docs** - System design, technical decisions
6. **Code Comments** - Inline documentation
7. **Changelog** - Version history
8. **Something else?**

Please specify."
```

### Q2: Target Audience
```
"Who will read this documentation?

- **End users** (non-technical)?
- **Developers** (using your API/library)?
- **Contributors** (working on the codebase)?
- **Operations** (deploying/maintaining)?
- **Mixed audience**?

This affects language, depth, and examples."
```

### Q3: Existing Documentation
```
"Is there existing documentation?

- **Starting from scratch** - I'll create complete docs
- **Updating existing** - I'll review and enhance
- **Migrating format** - Converting to new format

If updating, what specifically needs improvement?
- Outdated information?
- Missing sections?
- Poor organization?
- Unclear explanations?"
```

### Q4: Format & Tools
```
"What format should I use?

- **Markdown** (.md files)
- **JSDoc/TSDoc** (code comments)
- **OpenAPI/Swagger** (API specs)
- **Docusaurus/GitBook** (documentation site)
- **README badges** (shields.io)
- **Other format**?

Any style guide to follow?"
```

### Q5: Scope (optional)
```
"What should be documented?

For code:
- All functions/classes?
- Public API only?
- Include examples?
- Include troubleshooting?

For project:
- Installation only?
- Full usage guide?
- Architecture overview?
- Contributing guidelines?"
```

---

## Step 2: Documentation Plan

Present plan BEFORE writing:

```markdown
## Documentation Plan: [Project/Component Name]

**Type:** [README / API Docs / Guide / etc.]
**Audience:** [End users / Developers / Contributors]
**Format:** [Markdown / JSDoc / etc.]

---

### 📋 Structure

#### Section 1: [Name] (e.g., Overview)
**Purpose:** [What this section covers]
**Content:**
- [Item 1]
- [Item 2]
**Length:** [Brief / Detailed / Comprehensive]

#### Section 2: [Name] (e.g., Installation)
**Purpose:** [Getting started instructions]
**Content:**
- Prerequisites
- Installation steps
- Verification
**Length:** Brief

#### Section 3: [Name] (e.g., Usage)
**Purpose:** [How to use the main features]
**Content:**
- Basic usage example
- Common use cases
- Configuration options
**Length:** Detailed

#### Section 4: [Name] (e.g., API Reference)
**Purpose:** [Complete function/endpoint reference]
**Content:**
- All public functions
- Parameters and return types
- Code examples
**Length:** Comprehensive

[Additional sections...]

---

### 📝 Writing Style

**Tone:** [Formal / Casual / Technical]
**Level:** [Beginner-friendly / Intermediate / Advanced]
**Examples:** [Code-heavy / Conceptual / Mixed]

---

### ✅ Quality Checklist

Documentation will include:
- [ ] Clear section headings
- [ ] Code examples that actually work
- [ ] Links to related documentation
- [ ] Troubleshooting section (if applicable)
- [ ] Version information
- [ ] Last updated date
- [ ] Table of contents (if long)
- [ ] Visual aids (diagrams, if helpful)

---

**Proceed with this plan?** (yes/modify)
```

---

## Step 3: Write Documentation

After approval, write following the plan:

### README Template

```markdown
# [Project Name]

**[Brief one-line description]**

[![npm version](badge-url)](link)
[![license](badge-url)](link)
[![build status](badge-url)](link)

[Optional: Screenshot or demo GIF]

---

## ✨ Features

- **[Feature 1]** - Brief description
- **[Feature 2]** - Brief description
- **[Feature 3]** - Brief description

---

## 📦 Installation

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Install:**
```bash
npm install [package-name]
# or
yarn add [package-name]
```

---

## 🚀 Quick Start

```javascript
// Import
import { Feature } from '[package-name]';

// Basic usage
const result = Feature.doSomething({
  option1: 'value',
  option2: true
});

console.log(result);
```

---

## 📖 Usage

### Basic Example

[Simple, complete example that users can copy-paste]

```javascript
// Practical example with explanation
const config = {
  apiKey: process.env.API_KEY,
  endpoint: 'https://api.example.com'
};

const client = new Client(config);
const data = await client.fetch();
```

### Advanced Usage

[More complex scenarios]

```javascript
// Advanced features
const result = await client.fetch({
  filters: { status: 'active' },
  pagination: { page: 1, limit: 10 },
  sort: { field: 'createdAt', order: 'desc' }
});
```

---

## 📚 API Reference

### `Class: ClassName`

Brief description of what this class does.

#### Constructor

```typescript
new ClassName(options: Options)
```

**Parameters:**
- `options` (Object) - Configuration options
  - `option1` (string) - Description
  - `option2` (boolean, optional) - Description, default: `false`

**Example:**
```javascript
const instance = new ClassName({
  option1: 'value',
  option2: true
});
```

#### Methods

##### `method(param1, param2)`

Description of what this method does.

**Parameters:**
- `param1` (string) - Description
- `param2` (number, optional) - Description, default: `0`

**Returns:** `Promise<Result>` - Description of return value

**Throws:** `Error` - When [condition]

**Example:**
```javascript
const result = await instance.method('test', 42);
```

---

## ⚙️ Configuration

[Detailed configuration options]

```javascript
const config = {
  // Core options
  apiKey: 'your-api-key',        // Required
  endpoint: 'https://...',       // Optional, default: production URL

  // Advanced options
  timeout: 5000,                 // Request timeout in ms
  retries: 3,                    // Number of retry attempts
  debug: false                   // Enable debug logging
};
```

---

## 🎯 Examples

### Example 1: [Use Case Name]

[Describe the scenario]

```javascript
// Complete working example
[code]
```

### Example 2: [Another Use Case]

[Describe the scenario]

```javascript
// Complete working example
[code]
```

---

## 🔧 Troubleshooting

### Error: [Common Error Message]

**Cause:** [Why this happens]

**Solution:**
```javascript
// How to fix
[code or steps]
```

### Issue: [Common Problem]

**Symptoms:** [What users see]

**Fix:** [Step-by-step solution]

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](link) for guidelines.

**Development setup:**
```bash
git clone [repo-url]
cd [project-name]
npm install
npm run dev
```

**Running tests:**
```bash
npm test
```

---

## 📄 License

[License name] - see [LICENSE](link) file for details.

---

## 🔗 Links

- [Documentation](link)
- [Examples](link)
- [Changelog](link)
- [Issues](link)

---

## 💬 Support

- **Discord:** [link]
- **GitHub Issues:** [link]
- **Email:** [email]

---

**Made with ❤️ by [Author/Organization]**
```

---

### API Documentation Template (JSDoc/TSDoc)

```typescript
/**
 * Brief one-line description of the class/function
 *
 * Longer description explaining:
 * - What this does
 * - When to use it
 * - Important considerations
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = doSomething('input');
 * console.log(result); // Output: "processed input"
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage
 * const result = doSomething('input', { option: true });
 * ```
 *
 * @param {string} param1 - Description of first parameter
 * @param {Object} options - Configuration options
 * @param {boolean} options.flag - Description of option
 * @param {number} [options.timeout=5000] - Optional timeout in ms
 *
 * @returns {Promise<Result>} Description of return value
 *
 * @throws {ValidationError} When input is invalid
 * @throws {NetworkError} When request fails
 *
 * @see {@link RelatedFunction} for related functionality
 * @since 1.2.0
 * @deprecated Use {@link NewFunction} instead
 */
export async function doSomething(
  param1: string,
  options?: Options
): Promise<Result> {
  // Implementation
}
```

---

### Architecture Documentation Template

```markdown
# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP/REST
       ↓
┌─────────────┐      ┌──────────────┐
│  API Layer  │─────→│  Auth Service │
└──────┬──────┘      └──────────────┘
       │
       ↓
┌─────────────┐      ┌──────────────┐
│ Business    │─────→│   Database   │
│   Logic     │      └──────────────┘
└─────────────┘
```

### Component Breakdown

#### Client Layer
**Responsibility:** User interface and interaction
**Technology:** React, TypeScript
**Key Files:**
- `src/components/` - UI components
- `src/pages/` - Page components

#### API Layer
**Responsibility:** HTTP request handling, routing
**Technology:** Express.js
**Key Files:**
- `src/routes/` - Route definitions
- `src/controllers/` - Request handlers

[Additional components...]

---

## Data Flow

### User Registration Flow

1. User submits registration form
2. Client validates input
3. POST request to `/api/auth/register`
4. Server validates data
5. Password hashed with bcrypt
6. User record created in database
7. JWT token generated
8. Response sent to client
9. Client stores token, redirects to dashboard

---

## Technology Decisions

### Why React over Vue?
**Decision:** Use React for frontend
**Reasoning:**
- Larger ecosystem
- Team experience
- Better TypeScript support

**Trade-offs:**
- Steeper learning curve
- More boilerplate

### Why PostgreSQL over MongoDB?
**Decision:** Use PostgreSQL
**Reasoning:**
- Relational data model fits our needs
- ACID compliance required
- Strong consistency guarantees

---

## Security Architecture

- Authentication: JWT with httpOnly cookies
- Authorization: Role-based access control (RBAC)
- Data encryption: At rest (AES-256) and in transit (TLS 1.3)
- Rate limiting: 100 requests/minute per IP
- CSRF protection: Double submit cookie pattern

---

## Scalability Considerations

**Current capacity:** 10,000 concurrent users
**Bottlenecks:**
- Database queries (addressed with caching)
- File uploads (moved to CDN)

**Future improvements:**
- Horizontal scaling with load balancer
- Database read replicas
- Microservices architecture for high-traffic features
```

---

## Step 4: Documentation Quality Review

After writing, verify quality:

```markdown
## Documentation Quality Checklist

### ✅ Completeness
- [ ] All major features documented
- [ ] Installation instructions clear
- [ ] Usage examples provided
- [ ] API reference complete
- [ ] Troubleshooting section included

### ✅ Accuracy
- [ ] Code examples tested and working
- [ ] Version numbers correct
- [ ] Links not broken
- [ ] Screenshots up-to-date

### ✅ Clarity
- [ ] Written for target audience
- [ ] Technical jargon explained
- [ ] Examples are realistic
- [ ] Structure is logical

### ✅ Maintainability
- [ ] Date of last update included
- [ ] Version documented
- [ ] Easy to update sections
- [ ] Clear ownership (who maintains)

### ✅ Accessibility
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Alt text for images
- [ ] Code blocks properly formatted
- [ ] Table of contents for long docs

---

**Quality Score:** [X/10]
**Status:** [READY / NEEDS REVISION]
```

---

## Step 5: Documentation Maintenance

Establish ongoing maintenance:

```markdown
## Documentation Maintenance Plan

**Update triggers:**
- New feature added → Update API docs, add example
- Bug fix → Update troubleshooting section
- Breaking change → Update migration guide
- Version release → Update changelog

**Review schedule:**
- Monthly: Check for outdated info
- Per release: Verify all examples work
- Quarterly: User feedback review

**Ownership:**
- Technical writer: [name/role]
- Maintainer: [name/role]

**Feedback channels:**
- GitHub issues with "docs" label
- Documentation edit button (if using docs site)
- Email: docs@example.com
```

---

## Documentation Best Practices

### Writing Style

**✓ Good:**
```markdown
## Installation

Install the package using npm:

\`\`\`bash
npm install package-name
\`\`\`

Verify installation:

\`\`\`bash
package-name --version
\`\`\`
```

**✗ Bad:**
```markdown
## Installation

You can install using npm or maybe yarn idk
just do npm install or something
```

---

### Code Examples

**✓ Good - Complete and working:**
```javascript
// Import required modules
import { Client } from 'api-client';

// Initialize with your API key
const client = new Client({
  apiKey: process.env.API_KEY
});

// Fetch data
const data = await client.fetch();
console.log(data);
```

**✗ Bad - Incomplete:**
```javascript
client.fetch() // this gets data
```

---

### Error Handling Documentation

**✓ Good:**
```markdown
### Error: ECONNREFUSED

**Cause:** Cannot connect to API server

**Solutions:**
1. Check if API server is running: `curl http://localhost:3000`
2. Verify `endpoint` configuration
3. Check firewall settings

**Example:**
\`\`\`javascript
try {
  await client.connect();
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('API server not reachable');
  }
}
\`\`\`
```

---

## Quality Criteria

Documentation complete when:
- [ ] All sections from plan written
- [ ] Code examples tested and working
- [ ] Target audience appropriately addressed
- [ ] Clear structure with good navigation
- [ ] Includes troubleshooting/FAQ if relevant
- [ ] Version and date information included
- [ ] Quality checklist passed
- [ ] Reviewed by another person (if possible)

---

## Example Session

```
Human: "Write documentation for our authentication API"

LLM: Let me understand what documentation you need:

1. What type?
   - API reference documentation?
   - Integration guide?
   - Both?

2. Who's the audience?
   - Developers integrating with your API?

3. Starting from scratch or updating existing?

4. Format preference?
   - Markdown README?
   - OpenAPI/Swagger spec?

[Human answers: API reference + guide, for developers, from scratch, Markdown]

LLM:
## Documentation Plan: Authentication API

**Type:** API Reference + Integration Guide
**Audience:** Developers
**Format:** Markdown

### Structure:
1. Overview - What the API does
2. Authentication - How to get API keys
3. Endpoints - Complete reference
   - POST /auth/register
   - POST /auth/login
   - POST /auth/refresh
4. Examples - Common integration patterns
5. Error Handling - All error codes
6. Rate Limits - Usage quotas

Proceed? (yes/modify)

[Human: yes]

LLM: [Writes complete API documentation...]
```

---
