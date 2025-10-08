# Investigation Protocol

## Discovery Phase: Mapping the Flow

**Before diving into investigation**, determine the optimal search strategy:

### When to Use Code-Finder Agents

**code-finder** (fast, lightweight - Haiku):
- Simple, direct code location tasks
- Finding specific functions, classes, or variables
- Known feature with unclear location
- Single-domain searches
- **Examples**: "Where is the login function?", "Find all API endpoints", "Locate the UserService class"

**code-finder-advanced** (deep analysis - Sonnet):
- Complex, multi-file investigations
- Understanding system architecture or flows
- Tracing indirect dependencies or relationships
- Semantic code understanding needed
- Pattern discovery across codebase
- **Examples**: "How does authentication work?", "Trace data validation flow", "Find all error handling patterns"

### Decision Matrix

```
Simple location query + known domain → code-finder
Complex flow + multiple files → code-finder-advanced
Direct file/path provided → Read/Grep/Glob tools directly
Architecture mapping → code-finder-advanced
Unknown codebase exploration → code-finder-advanced
```

---

## Step 1: Clarify Investigation Intent (Ask 1-2 Questions)

**Don't start investigating blindly.** Clarify what they need:

### Q1: Investigation Type
```
"I can help investigate. What specifically do you want to understand?

1. **How does [feature] work?**
   → I'll explain code flow + architecture
   → Trace execution path through the codebase
   → Uses: code-finder-advanced for complex flows

2. **Why is [thing] slow/broken?**
   → I'll profile and diagnose the issue
   → Identify bottlenecks or problems
   → Uses: code-finder-advanced + performance analysis

3. **What does [code] do?**
   → I'll explain logic step-by-step
   → Break down complex algorithms
   → Uses: Direct file reading + analysis

4. **Where is [functionality] implemented?**
   → I'll locate relevant code
   → Map feature to files/functions
   → Uses: code-finder or code-finder-advanced based on complexity

Which type of investigation do you need?"
```

### Q2: Depth (optional)
```
"How deep should I go?

- **High-level overview** (architecture, main flow)
- **Detailed explanation** (line-by-line logic)
- **Complete deep-dive** (all edge cases, internals)

This helps me give you the right level of detail."
```

---

## Investigation Strategy Selection

### Single vs Parallel Agent Decision Tree

**Use Single Agent When:**
- Investigation has clear entry point
- Related code likely in same domain/directory
- Simple dependency chain
- Sequential discovery (find A, then find B based on A)

**Use Parallel Agents When:**
- Multi-domain investigation (frontend + backend + tests)
- Independent search spaces that don't overlap
- Time-sensitive large codebase exploration
- Can clearly partition the search domain

### Multi-Domain Investigation Pattern

When launching parallel agents for multi-domain investigations, dispatch all tasks in a single function_calls block. Each Task invocation should target a distinct domain with clear boundaries.

**Example structure** (for auth investigation across multiple domains):
- Agent 1: Backend authentication (middleware, guards, sessions, tokens)
- Agent 2: Frontend authentication (UI components, API calls, state management)
- Agent 3: Test coverage (all auth-related test files)

**Integration with investigation-workflow**: The custom-reminder.py hook detects investigation keywords and injects this guidance:
- Assess scope by reading provided files
- Use code-finder for simple searches in known files
- Use code-finder-advanced for complex, multi-file investigations
- Split non-overlapping domains into parallel agents
- Launch parallel tasks in single function_calls block

**Real-world examples**:
- "How does authentication integrate with each service?" → code-finder first for discovery, then parallel code-finder-advanced for deep analysis per service
- "Investigate Stripe integration" → Parallel code-finder tasks across domains
- "Where is combat implemented?" → Single code-finder task
- "Do we have a formatDate function?" → Direct grep/glob tools

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
