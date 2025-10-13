# Investigation Protocol

> **Project Context:** Review @.claude/memory/history.md to understand recent changes and feature implementations that may be relevant to your investigation.

## Agent Selection

**code-finder** (Haiku - fast):
- Simple location queries ("Where is X?")
- Known feature, unclear location
- Single-domain searches

**code-finder-advanced** (Sonnet - deep):
- Multi-file flows and architecture
- Tracing dependencies and relationships
- Pattern discovery

**root-cause-analyzer** (specialized):
- Performance bottlenecks
- Systematic debugging
- Hypothesis generation

**Direct tools** (Grep/Glob/Read):
- File path provided
- Simple pattern searches

---

## Investigation Strategy

**Single Agent:**
- Clear entry point
- Same domain/directory
- Sequential discovery

**Parallel Agents:**
- Multi-domain (frontend + backend + tests)
- Independent search spaces
- Launch in single function_calls block

---


## Parallel Investigation Patterns

When investigations span multiple independent domains, use parallel agents to maximize efficiency.

### Pattern 1: Backend + Frontend + Integration

**When to use:**
- Full-stack feature investigation
- End-to-end flow analysis
- Cross-layer debugging

**Focus areas for investigation:**
- Backend: Services, controllers, database models, API endpoints, business logic, external integrations
- Frontend: UI components, state management, API client calls, user interaction flow, error handling
- Integration: Test coverage, configuration files, documentation, CI/CD, deployment considerations

### Pattern 2: Multi-Service Architecture Investigation

**When to use:**
- Microservices investigation
- Distributed system analysis
- Service-to-service communication tracing

**Focus areas for service investigation:**
- Auth service: Authentication endpoints, token generation/validation, password hashing, OAuth/SSO integration
- Authorization: Middleware/guards, RBAC implementation, permission checking, token verification, session management
- User service: Profile retrieval, data synchronization, cross-service communication, caching strategy

### Pattern 3: Performance Investigation Across Layers

**When to use:**
- Performance bottleneck diagnosis across stack
- Identifying multiple optimization opportunities
- Systematic performance audit

**Focus areas for performance investigation:**
- Frontend: Component render cycles, large lists/tables, heavy computations, bundle size, asset loading
- API/Network: N+1 queries, payload sizes, sequential vs parallel requests, caching headers, response times
- Backend: Query efficiency, algorithm complexity, external service latency, caching implementation, resource-intensive operations

---

## Agent Type Selection Matrix

Detailed guidance for choosing the right agent based on investigation requirements.

### code-finder Agent

**Optimal Use Cases:**
- Finding specific functions, classes, or files
- Locating API endpoints by route
- Searching for variable/constant definitions
- Quick grep-like searches with basic filtering

**Capabilities:**
- Fast glob/grep-based searches
- Basic code structure understanding
- File location by name/pattern
- Simple relationship identification

**Limitations:**
- Cannot trace complex flows
- Limited semantic understanding
- Single-domain focus
- No architectural analysis

**Example Tasks:**
- "Find all controllers in /api directory"
- "Locate the UserService class"
- "Where is the API_KEY constant defined?"
- "Find all test files for authentication"

### code-finder-advanced Agent

**Optimal Use Cases:**
- Tracing execution flows through multiple files
- Understanding system architecture
- Mapping component relationships
- Discovering patterns and conventions
- Semantic code analysis

**Capabilities:**
- Deep multi-file analysis
- Control flow tracing
- Dependency mapping
- Design pattern recognition
- Architectural insights

**Limitations:**
- Slower than code-finder
- Higher cost per query
- Overkill for simple searches

**Example Tasks:**
- "How does authentication work end-to-end?"
- "Trace the order processing flow"
- "Map all dependencies of the PaymentService"
- "Explain the error handling strategy"

### root-cause-analyzer Agent

**Optimal Use Cases:**
- Performance degradation diagnosis
- Bug root cause identification
- Systematic debugging
- Hypothesis generation and validation
- Multi-factor problem analysis

**Capabilities:**
- Hypothesis-driven investigation
- Performance profiling analysis
- Bottleneck identification
- Root cause reasoning
- Testing recommendations

**Limitations:**
- Specialized for debugging/performance
- Not suitable for general code exploration
- Requires problem symptoms as input

**Example Tasks:**
- "Why is the dashboard loading slowly?"
- "Diagnose intermittent timeout errors"
- "Find the memory leak source"
- "Why are API calls failing randomly?"

---

## Real Investigation Examples

Practical examples showing complete investigation patterns with agent usage.

### Example 1: Payment Flow Investigation

**User Question:** "How does the payment flow work from checkout to confirmation?"

**Strategy:** Parallel multi-domain investigation

**Investigation focus areas:**
- Frontend: Checkout UI components, payment form submission, API calls, state management, error handling
- Backend: Payment API endpoints, gateway integration (Stripe/PayPal), database transactions, webhooks, security measures
- Post-payment: Confirmation emails/notifications, order status updates, webhook handlers, fulfillment integration

**Why Parallel:**
- Three distinct domains (frontend, backend API, post-payment processing)
- No dependencies between investigations
- Each agent can work independently
- Results combine into complete end-to-end picture

**Expected Output:**
- Complete payment flow diagram from all perspectives
- Clear integration points between layers
- Security and error handling documentation
- File references for every step

---

### Example 2: Performance Investigation Strategy

**User Question:** "Why is X slow?"

**Strategy:** Phased investigation approach

**Phase 1: Locate the Slow Operation**

Use code-finder-advanced to identify where slowness occurs by finding the entry point, tracing execution path, identifying all operations (DB queries, API calls, computations), and looking for obvious inefficiencies (N+1 queries, nested loops, large payloads).

**Phase 2: Root Cause Analysis (if needed)**

If Phase 1 doesn't reveal clear cause, deploy root-cause-analyzer to generate hypotheses for slowness causes, prioritize top 3 most likely causes, identify validation methods, and provide performance profiling recommendations.

**Phase 3: Implementation**

Based on findings, implement fix or add profiling instrumentation:

```
Decision tree:
├─ Root cause obvious?
│  └─ YES → Implement optimization directly
│
└─ Root cause unclear?
   └─ YES → Add instrumentation/logging and ask user to test
```

**Example: Dashboard Slowness**

Phase 1 reveals:
- 12 sequential API calls in component mount
- Each call takes 150ms
- Total: 1800ms just for data loading

Phase 2 (root-cause-analyzer) not needed - cause is clear.

Phase 3:
- Create batch API endpoint
- Update frontend to use single batched call
- Expected improvement: 1800ms → 200ms

---

### Example 3: Architecture Mapping

**User Question:** "Map the architecture of the notification system"

**Strategy:** Parallel subsystem investigation

**Investigation approach:**
- Four distinct subsystems to investigate: triggers, delivery, templates, preferences
- Each can be investigated independently
- Combining results provides complete architecture picture with data flow diagrams and integration points

---

## Performance Investigation Strategy

Systematic approach to diagnosing and resolving performance issues.

### Phase-Based Performance Investigation

#### Phase 1: Identify and Locate

**Goal:** Find where the slow operation occurs in code

**Agent:** code-finder-advanced

**Actions:**
1. Locate entry point (API endpoint, UI component, background job)
2. Trace execution path through codebase
3. Identify all operations in the flow:
   - Database queries
   - External API calls
   - Computations/algorithms
   - File I/O
   - Network requests

**Output:**
- Entry point: `file.ts:line`
- Execution flow with file:line references
- Operation inventory with types
- Initial observations (nested loops, large datasets, etc)

#### Phase 2: Analyze and Hypothesize

**Goal:** Determine root cause of slowness

**Decision:** Is root cause obvious from Phase 1?

**If YES:** Skip to Phase 3 with fix plan

**If NO:** Deploy root-cause-analyzer agent

**Actions:**
1. Generate hypotheses (5-8 potential causes)
2. Rank by likelihood and impact
3. Identify validation approach for top 3
4. Recommend profiling/instrumentation

**Common Performance Patterns:**

| Pattern | Symptoms | Investigation Focus |
|---------|----------|-------------------|
| N+1 Query | Multiple sequential DB calls | Count queries, check ORM usage |
| Algorithmic Complexity | Slowness grows with data size | Analyze loop nesting, Big-O |
| Large Payload | Network/parsing time dominates | Check response sizes, serialization |
| Missing Cache | Same data fetched repeatedly | Identify cacheable operations |
| Blocking Operations | Sequential waits | Find await chains, parallel opportunities |
| Memory Leak | Degradation over time | Check object references, event listeners |

**Output:**
- Ranked hypotheses with evidence
- Validation approach for each
- Quick wins vs comprehensive fixes
- Profiling recommendations

#### Phase 3: Fix or Gather Data

**Goal:** Resolve the performance issue

**Decision:** Is fix implementation clear?

**If YES - Fix Directly:**
1. Implement optimization
2. Provide before/after metrics
3. Test for regressions

**If NO - Add Instrumentation:**
1. Add logging/timing at key points
2. Ask user to run with profiling
3. Return with data for analysis
4. Implement fix based on profiling results

**Common Fixes:**

| Issue | Solution | Expected Impact |
|-------|----------|----------------|
| N+1 queries | Add eager loading, batch queries | 10-100× faster |
| O(n²) algorithm | Use hash map, optimize loop | 10-1000× faster |
| Sequential API calls | Parallelize with Promise.all | 2-10× faster |
| Missing index | Add database index | 10-100× faster |
| Large payload | Pagination, field filtering | 2-10× faster |
| No caching | Add memoization, cache layer | 5-50× faster |

### Performance Investigation Example

**User:** "The user dashboard is loading slowly"

**Phase 1: Locate**
```
Finding: Dashboard component makes 15 API calls sequentially on mount
Entry point: components/Dashboard.tsx:45 - useEffect hook
Calls: GET /api/user, GET /api/settings, GET /api/notifications (×12 more)
Each call: ~150ms
Total: 2,250ms in network time alone
```

**Phase 2: Analyze**
```
Root cause: OBVIOUS - Sequential API calls (N+1 pattern)
Hypothesis: Frontend fetching related data in loop instead of batch
No need for root-cause-analyzer - fix is clear
```

**Phase 3: Fix**
```
Solution:
1. Create new backend endpoint: GET /api/dashboard/initial-data
2. Return all needed data in single response
3. Update frontend to use new endpoint

Implementation:
- Backend: Create DashboardController.getInitialData()
- Batch all queries in parallel using Promise.all()
- Frontend: Replace 15 calls with 1 call to /api/dashboard/initial-data

Expected improvement: 2,250ms → 200ms (11× faster)
```

---

## Step 2: Investigation

Based on investigation type, follow appropriate approach:

---

### Type 1: Code Flow Explanation

```markdown
## How [Feature] Works

### 🎯 Purpose
[Brief description of what this feature does and why it exists]

---

### 🔄 High-Level Flow

**User journey:**
1. User triggers [action] (e.g., clicks "Login" button)
2. [Component A] captures event and validates input
3. Calls [Function B] in [file.ts:line]
4. [Function B] processes data and calls API endpoint
5. Response handled by [Function C] in [file.ts:line]
6. [Component D] updates UI with result

**Visual flow:**
```
User Action → Event Handler → Validation → API Call → Response Processing → UI Update
```

---

### 📁 Key Files & Components

**Entry point:**
- `src/components/LoginForm.tsx:45` - User interface component
- Captures form submission, triggers authentication

**Business logic:**
- `src/auth/loginService.ts:123` - Main authentication logic
- Validates credentials, manages session

**API integration:**
- `src/api/authClient.ts:67` - API communication layer
- Sends requests to backend `/auth/login` endpoint

**State management:**
- `src/store/authSlice.ts:89` - Redux/Zustand store
- Manages authentication state globally

---

### 📊 Data Flow

**Input:**
```javascript
{ email: string, password: string }
```

**Processing steps:**
1. **Validation** (loginService.ts:125)
   - Check email format
   - Check password length
   - Return early if invalid

2. **Transformation** (loginService.ts:140)
   - Hash password (if client-side hashing)
   - Add CSRF token
   - Format request body

3. **API Call** (authClient.ts:70)
   - POST to /api/auth/login
   - Include credentials + CSRF token
   - Set timeout: 5000ms

4. **Response Processing** (loginService.ts:160)
   - Extract JWT token
   - Store in secure cookie
   - Update auth state

5. **UI Update** (LoginForm.tsx:78)
   - Clear form
   - Redirect to dashboard
   - Show success message

**Output:**
```javascript
{ token: string, user: User, expiresAt: Date }
```

---

### 🔍 Important Details

**Security considerations:**
- Password never logged or stored client-side
- CSRF protection via token in headers
- JWT stored in httpOnly cookie

**Error handling:**
- Network errors: Show retry option
- 401 Unauthorized: Show "invalid credentials" message
- 500 Server error: Log error, show generic message

**Edge cases:**
- Already logged in: Skip login, redirect
- Session expired: Clear old token, proceed with login
- Rate limiting: Show "too many attempts" message

---

### 💡 Next Steps

Would you like me to:
- Explain a specific part in more detail?
- Show the actual code for any component?
- Trace a different scenario (e.g., error case)?
- Investigate performance of this flow?
```

---

### Type 2: Performance Investigation

```markdown
## Performance Analysis: [Feature/Component]

### 🐌 Symptoms Observed

**Slow scenario:**
- When: [Specific user action or condition]
- Observed: [X] seconds to complete
- Expected: [Y] seconds or less

**Fast scenario (comparison):**
- When: [Different condition]
- Observed: [Z] seconds (acceptable)

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]
- Data volume: [How much data being processed]

---

### 🔍 Investigation Steps

#### Step 1: Identify Bottleneck
**Method:** Browser DevTools Performance profiling

**Findings:**
```
Total time: 2,450ms
├─ JavaScript execution: 1,800ms (73%)
│  └─ [functionName] in [file.ts:line]: 1,500ms ⚠️
├─ Network requests: 550ms (22%)
│  └─ 50 API calls to /api/items
└─ Rendering: 100ms (4%)
```

**Bottleneck identified:** `processItems()` function taking 1.5 seconds

---

#### Step 2: Analyze Algorithm Complexity
**Current implementation:**
```javascript
// file.ts:123
function processItems(items) {
  for (let i = 0; i < items.length; i++) {      // O(n)
    for (let j = 0; j < items.length; j++) {    // O(n)
      if (items[i].id === items[j].parentId) {  // Nested loop
        // Processing...
      }
    }
  }
}
```

**Complexity:** O(n²) - Quadratic time
**With 100 items:** 10,000 iterations
**With 1,000 items:** 1,000,000 iterations (slow!)

---

#### Step 3: Check Network Activity
**Finding:** Making 50 separate API requests in a loop

```javascript
// file.ts:200
for (const item of items) {
  const details = await fetch(`/api/items/${item.id}`); // ⚠️ In loop!
}
```

**Impact:**
- 50 requests × 15ms latency = 750ms minimum
- Actual: 550ms with parallel execution
- Could be 1 request = 15ms

---

### 🎯 Root Cause

**Primary issue:** O(n²) algorithm in `processItems()`
- Nested loops create quadratic complexity
- Scales poorly with data volume

**Secondary issue:** N+1 query pattern
- Making separate API request for each item
- Network overhead compounds with item count

---

### 💡 Fix Options

#### Option A: Optimize Algorithm (HIGH IMPACT)
**Change:** Replace nested loops with hash map lookup

```javascript
// Current: O(n²)
for (let i = 0; i < items.length; i++) {
  for (let j = 0; j < items.length; j++) {
    if (items[i].id === items[j].parentId) { ... }
  }
}

// Optimized: O(n)
const itemMap = new Map(items.map(item => [item.id, item]));
for (const item of items) {
  const parent = itemMap.get(item.parentId); // O(1) lookup
  if (parent) { ... }
}
```

**Complexity:** O(n²) → O(n)
**Estimated improvement:** 1,500ms → 15ms (100× faster!)
**Risk:** Low (same behavior, different algorithm)
**Effort:** Low (10 minutes)

---

#### Option B: Batch API Calls (MEDIUM IMPACT)
**Change:** Request all item details in single batch request

```javascript
// Current: 50 requests
for (const item of items) {
  await fetch(`/api/items/${item.id}`);
}

// Optimized: 1 request
const ids = items.map(i => i.id).join(',');
const details = await fetch(`/api/items/batch?ids=${ids}`);
```

**Network:** 50 requests → 1 request
**Estimated improvement:** 550ms → 15ms (35× faster!)
**Risk:** Medium (requires backend API change)
**Effort:** Medium (requires backend work)

---

#### Option C: Add Caching (LOW IMPACT, QUICK WIN)
**Change:** Cache item details to avoid redundant requests

```javascript
const cache = new Map();

async function getItemDetails(id) {
  if (cache.has(id)) return cache.get(id);

  const details = await fetch(`/api/items/${id}`);
  cache.set(id, details);
  return details;
}
```

**Impact:** Eliminate duplicate requests (if any)
**Estimated improvement:** Variable (10-30% reduction)
**Risk:** Low
**Effort:** Low (30 minutes)

---

### 🎯 Recommendation

**Implement Option A (algorithm optimization) immediately.**

**Reason:**
- Highest impact (100× improvement)
- Lowest risk (pure code change)
- No dependencies (no backend work)
- Quickest to implement (10 minutes)

**Then consider Option B** if backend team available.

---

### 📊 Expected Results

**Before optimization:**
- Total time: 2,450ms
- User experience: Noticeably slow, frustrating

**After Option A:**
- Total time: ~565ms (1,500ms → 15ms saved)
- User experience: Feels instant

**After Option A + B:**
- Total time: ~30ms (additional 535ms saved)
- User experience: Instant, smooth

---

Should I implement Option A? (yes/explain more/different option)
```

---

### Type 3: Code Logic Explanation

```markdown
## Code Explanation: [Function/Component]

**Location:** `src/utils/validator.ts:45-120`

---

### 🎯 Purpose
This function validates user registration data according to business rules.

---

### 📥 Input
```typescript
interface RegistrationData {
  email: string;
  password: string;
  age: number;
  country: string;
}
```

---

### 📤 Output
```typescript
type ValidationResult =
  | { valid: true }
  | { valid: false, errors: string[] }
```

---

### 🔄 Step-by-Step Logic

#### Lines 45-52: Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(data.email)) {
  errors.push('Invalid email format');
}
```

**What it does:** Checks if email matches standard format
**Regex breakdown:**
- `^[^\s@]+` - Start with non-whitespace, non-@ characters
- `@` - Literal @ symbol
- `[^\s@]+` - Domain name
- `\.` - Literal dot
- `[^\s@]+$` - Top-level domain

---

#### Lines 54-60: Password Strength
```typescript
if (data.password.length < 8) {
  errors.push('Password must be at least 8 characters');
}
if (!/[A-Z]/.test(data.password)) {
  errors.push('Password must contain uppercase letter');
}
if (!/[0-9]/.test(data.password)) {
  errors.push('Password must contain number');
}
```

**What it does:** Enforces password requirements
**Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one digit (0-9)

**Why:** Security best practice (prevent weak passwords)

---

#### Lines 62-68: Age Verification
```typescript
if (data.age < 13) {
  errors.push('Must be 13 or older (COPPA compliance)');
}
if (data.age > 120) {
  errors.push('Invalid age');
}
```

**What it does:** Validates age within realistic bounds
**Business rules:**
- Minimum 13 (COPPA regulation for US)
- Maximum 120 (sanity check)

---

#### Lines 70-85: Country-Specific Rules
```typescript
const restrictedCountries = ['XX', 'YY'];
if (restrictedCountries.includes(data.country)) {
  errors.push('Service not available in your country');
}

const euCountries = ['DE', 'FR', 'IT', /* ... */];
if (euCountries.includes(data.country)) {
  if (!data.gdprConsent) {
    errors.push('GDPR consent required');
  }
}
```

**What it does:** Enforces geographic restrictions and compliance
**Logic:**
1. Check if country is in restricted list → reject
2. If EU country → require GDPR consent checkbox

---

#### Lines 87-95: Return Result
```typescript
if (errors.length > 0) {
  return { valid: false, errors };
} else {
  return { valid: true };
}
```

**What it does:** Aggregates all errors and returns result
**Pattern:** Collect all errors (don't fail fast) so user sees all issues at once

---

### 🎓 Key Concepts Used

**Regex patterns:** For email and password validation
**Array methods:** `.test()`, `.includes()` for checking conditions
**Error accumulation:** Collect all errors before returning
**Guard clauses:** Early validation checks before proceeding

---

### 🔍 Edge Cases Handled

1. **Empty strings:** Caught by regex/length checks
2. **Whitespace-only input:** Email regex rejects whitespace
3. **Boundary ages:** 13 (min) and 120 (max) both allowed
4. **Case sensitivity:** Password uppercase check is case-sensitive

---

### 💡 Possible Improvements

1. **More robust email validation:** Current regex allows some invalid emails
2. **Password entropy check:** Check for common passwords (e.g., "Password123")
3. **Async validation:** Check if email already registered (requires DB query)

---

Would you like me to explain any specific part in more detail?
```

---

### Type 4: Code Location

```markdown
## Code Location: [Functionality]

**Searching for:** [Feature/functionality description]

---

### 🎯 Main Implementation

**Primary file:** `src/features/auth/LoginService.ts`
- **Lines 45-120:** Core login logic
- **Lines 150-200:** Session management
- **Lines 220-250:** Token refresh

---

### 🧩 Related Components

**UI Components:**
- `src/components/LoginForm.tsx:25` - Login form UI
- `src/components/SessionExpiredModal.tsx:10` - Session handling

**API Layer:**
- `src/api/authClient.ts:45` - Authentication API calls
- `src/api/interceptors.ts:30` - Token injection

**State Management:**
- `src/store/authSlice.ts:15` - Auth state
- `src/store/userSlice.ts:20` - User profile state

**Utilities:**
- `src/utils/tokenStorage.ts:10` - Token storage helpers
- `src/utils/sessionTimer.ts:5` - Session timeout tracking

---

### 📊 Architecture Map

```
┌─────────────────┐
│  LoginForm.tsx  │ User Interface
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ LoginService.ts │ Business Logic
└────────┬────────┘
         │
         ├→ authClient.ts (API)
         ├→ authSlice.ts (State)
         └→ tokenStorage.ts (Persistence)
```

---

### 🔍 Entry Points

**User-initiated:**
1. `LoginForm.tsx:65` - Form submission handler
2. `App.tsx:120` - Auto-login on page load
3. `SessionExpiredModal.tsx:45` - Re-login after expiry

**System-initiated:**
1. `authClient.ts:100` - Token refresh interceptor
2. `sessionTimer.ts:30` - Automatic logout on timeout

---

### 📝 Usage Example

```typescript
import { LoginService } from '@/features/auth/LoginService';

// Login user
const result = await LoginService.login({
  email: 'user@example.com',
  password: 'password123'
});

if (result.success) {
  // Redirect to dashboard
} else {
  // Show error: result.error
}
```

---

Would you like me to show the actual code for any of these files?
```

---

## Step 3: Follow-Up Offer

After investigation, offer next steps:

```
Based on this investigation:

1. **Implement fix?** (if performance issue found)
   → I can optimize the code now

2. **Deeper dive?** (if complex)
   → Explain specific part in more detail

3. **Related investigation?** (if applicable)
   → Investigate related component/feature

4. **Documentation?** (if useful for team)
   → Create architecture diagram or docs

What would you like to do next?
```

---

## Quality Criteria

Investigation complete when:
- [ ] User's question fully answered
- [ ] Appropriate level of detail provided
- [ ] Code locations referenced with file:line
- [ ] Data flow explained if relevant
- [ ] Performance issues identified with metrics (if applicable)
- [ ] Concrete examples provided
- [ ] Next steps offered

---

## Example Session

```
Human: "Why is the dashboard loading slowly?"

LLM: I can help investigate. Is this:
1. Understanding how dashboard loading works?
2. Diagnosing why it's slow?
3. Something else?

[Human: #2 - diagnose slowness]

LLM:
## Performance Analysis: Dashboard Loading

### Investigation Steps

Step 1: Browser DevTools shows:
- Total: 3,200ms
- API requests: 2,800ms (12 separate calls)
- Rendering: 400ms

Step 2: Found N+1 query pattern
- Loading user data
- Then loading each widget separately (12 requests)

### Root Cause
Making 12 sequential API requests instead of 1 batch request

### Fix Options

**Option A: Batch API requests**
- Change 12 requests → 1 request
- Estimated improvement: 2,800ms → 200ms
- Effort: 1 hour (requires backend endpoint)

**Option B: Lazy load widgets**
- Load critical widgets first, others on demand
- Improvement: Initial load 3,200ms → 800ms
- Effort: 2 hours

**Recommendation:** Option A (14× faster)

Should I implement Option A?
```

---
