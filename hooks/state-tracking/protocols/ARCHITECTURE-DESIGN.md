# Architecture Design Protocol

## Step 1: Architecture Discovery (Ask 4-6 Questions)

**Don't design in a vacuum.** Understand requirements.

### Research-First Pattern (Optional)

For complex or unfamiliar systems, use parallel agents to gather discovery information before asking questions:

**Parallelize discovery research if:**
- [ ] Extending large existing system (codebase analysis needed)
- [ ] Unfamiliar domain or technology stack (research needed)
- [ ] Multiple integration points to understand (landscape mapping)

**Execution pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Analyze existing architecture patterns</parameter>
    <parameter name="subagent_type">code-finder-advanced</parameter>
    <parameter name="prompt">
      Read the codebase at [paths]. Identify:
      - Current architectural patterns (monolith, microservices, serverless)
      - Technology stack (languages, frameworks, databases)
      - Existing service boundaries and integration points
      - Scalability and deployment approach

      Summarize findings in bullet points.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Research integration requirements</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Analyze integration points at [paths]:
      - External APIs and third-party services
      - Internal microservices and dependencies
      - Database schemas and data flows
      - Message queues and event systems

      Document what needs to integrate with the new system.
    </parameter>
  </invoke>
</function_calls>
```

After research agents complete, use findings to ask more targeted discovery questions.

**Reference:** `~/.claude/guides/parallel.md` lines 117-122 (Research-First Parallelization)

---

### Discovery Questions

### Q1: System Purpose & Scope
```
"What system are we designing?

- **New system from scratch?**
- **Extending existing system?**
- **Redesigning/refactoring?**
- **Specific component/module?**

Please describe:
- What does it do? (main purpose)
- Who uses it? (users, systems, services)
- Scale expectations? (users, requests, data volume)"
```

### Q2: Requirements
```
"What are the key requirements?

**Functional:**
- What features must it support?
- What operations must it perform?
- Any critical workflows?

**Non-functional:**
- Performance targets? (response time, throughput)
- Scalability needs? (concurrent users, growth)
- Availability requirements? (uptime SLA)
- Consistency vs availability trade-offs?"
```

### Q3: Constraints
```
"What constraints must we work within?

**Technical:**
- Required technologies? (mandated stack)
- Existing systems to integrate? (APIs, databases)
- Legacy compatibility needed?

**Organizational:**
- Team size and skills?
- Development timeline?
- Budget limitations?

**Operational:**
- Deployment environment? (cloud, on-prem, hybrid)
- Maintenance capacity?
- Security/compliance requirements? (GDPR, HIPAA, SOC2)"
```

### Q4: Data & State
```
"What data will the system handle?

- **Data types:** User data, transactions, files, events?
- **Data volume:** GB, TB, PB scale?
- **Data sensitivity:** Public, internal, confidential, regulated?
- **Data relationships:** Relational, document, graph, key-value?
- **Data lifecycle:** Create, read, update, archive, delete patterns?"
```

### Q5: Integration Points
```
"What does this system need to integrate with?

- **External APIs?** (third-party services)
- **Internal services?** (existing microservices)
- **Databases?** (shared or dedicated)
- **Message queues?** (event-driven architecture)
- **Authentication providers?** (SSO, OAuth)

What integration patterns: REST, GraphQL, gRPC, events?"
```

### Q6: Quality Attributes (optional)
```
"Which quality attributes are most important?

Rank in order of priority:
- **Performance** (speed, latency)
- **Scalability** (handle growth)
- **Reliability** (uptime, fault tolerance)
- **Security** (data protection, access control)
- **Maintainability** (easy to modify, extend)
- **Observability** (monitoring, debugging)
- **Cost** (infrastructure, operations)

Top 3 priorities?"
```

---

## Step 2: Architecture Analysis & Options

Present architecture options with trade-offs:

```markdown
## Architecture Design: [System Name]

**Purpose:** [Brief system description]
**Scale:** [User/request/data volume]
**Timeline:** [Development timeframe]

---

## Requirements Summary

### Functional Requirements
1. [Requirement 1] - [Description]
2. [Requirement 2] - [Description]
3. [Requirement 3] - [Description]

### Non-Functional Requirements
| Attribute | Target | Priority |
|-----------|--------|----------|
| Performance | <200ms response time | HIGH |
| Availability | 99.9% uptime | HIGH |
| Scalability | 100K concurrent users | MEDIUM |
| Security | GDPR compliance | HIGH |

### Constraints
- Must integrate with legacy Oracle DB
- Team of 4 developers, 6-month timeline
- AWS cloud deployment
- Budget: $5K/month infrastructure

---

## Architecture Options

### Option 1: Monolithic Architecture

**Description:**
Single deployable application with all features bundled together.

**Diagram:**
```
┌─────────────────────────────────┐
│       Web Application           │
│  ┌──────────┬──────────────┐   │
│  │   API    │   Frontend   │   │
│  ├──────────┼──────────────┤   │
│  │ Business Logic Layer     │   │
│  ├──────────────────────────┤   │
│  │   Data Access Layer      │   │
│  └──────────────────────────┘   │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────┐
        │  Database   │
        └─────────────┘
```

**Technology Stack:**
- Backend: Node.js/Express
- Frontend: React (served from same app)
- Database: PostgreSQL
- Deployment: Single EC2 instance or container

**Pros:**
- ✅ Simple to develop and deploy
- ✅ Easy local development setup
- ✅ Lower operational complexity
- ✅ Good for small teams
- ✅ Faster initial development
- ✅ Easier debugging (single codebase)

**Cons:**
- ❌ Harder to scale (must scale entire app)
- ❌ Tight coupling between components
- ❌ Longer deployment times as app grows
- ❌ Single point of failure
- ❌ Technology lock-in (one language/framework)

**Best for:**
- Small to medium applications
- Limited team size
- Tight development timeline
- Predictable, moderate traffic

**Risks:**
- Medium risk of growing beyond capabilities
- Refactoring to microservices later is costly

---

### Option 2: Microservices Architecture

**Description:**
Multiple independently deployable services, each owning its domain.

**Diagram:**
```
              ┌─────────────┐
              │  API Gateway │
              └──────┬───────┘
       ┌─────────┼─────────┐
       │         │         │
  ┌────▼───┐ ┌──▼────┐ ┌──▼─────┐
  │ Auth   │ │ User  │ │ Order  │
  │Service │ │Service│ │Service │
  └────┬───┘ └──┬────┘ └──┬─────┘
       │        │         │
  ┌────▼───┐ ┌─▼────┐ ┌──▼─────┐
  │Auth DB │ │UserDB│ │OrderDB │
  └────────┘ └──────┘ └────────┘
```

**Technology Stack:**
- Services: Node.js, Python, Go (polyglot)
- API Gateway: Kong or AWS API Gateway
- Service mesh: Istio (optional)
- Databases: PostgreSQL per service
- Messaging: RabbitMQ or AWS SQS
- Deployment: Kubernetes on AWS EKS

**Pros:**
- ✅ Independent scaling per service
- ✅ Technology flexibility (polyglot)
- ✅ Fault isolation (one service failure ≠ total failure)
- ✅ Independent deployments
- ✅ Team autonomy (own services)
- ✅ Easier to understand individual services

**Cons:**
- ❌ High operational complexity
- ❌ Distributed system challenges (network, latency)
- ❌ More complex testing (integration)
- ❌ Data consistency challenges
- ❌ Requires DevOps expertise
- ❌ Higher infrastructure costs

**Best for:**
- Large, complex applications
- Multiple teams
- Need for independent scaling
- Long-term project (worth the investment)

**Risks:**
- High risk of over-engineering for small projects
- Significant operational overhead

---

### Option 3: Serverless Architecture

**Description:**
Event-driven, function-based architecture using cloud services.

**Diagram:**
```
┌──────────┐     ┌─────────────┐
│ CloudFront│────▶│  S3 (SPA)   │
└──────────┘     └─────────────┘
                        │
                 ┌──────▼──────┐
                 │ API Gateway │
                 └──────┬──────┘
           ┌────────────┼────────────┐
           │            │            │
      ┌────▼───┐  ┌────▼───┐  ┌────▼───┐
      │Lambda  │  │Lambda  │  │Lambda  │
      │(Auth)  │  │(Users) │  │(Orders)│
      └────┬───┘  └────┬───┘  └────┬───┘
           └───────────┼────────────┘
                  ┌────▼────┐
                  │DynamoDB │
                  └─────────┘
```

**Technology Stack:**
- Functions: AWS Lambda (Node.js/Python)
- API: AWS API Gateway
- Database: DynamoDB or Aurora Serverless
- Frontend: S3 + CloudFront
- Auth: AWS Cognito
- Events: EventBridge

**Pros:**
- ✅ Auto-scaling (zero to infinity)
- ✅ Pay per use (no idle costs)
- ✅ No server management
- ✅ High availability built-in
- ✅ Fast development (focus on business logic)
- ✅ Built-in observability (CloudWatch)

**Cons:**
- ❌ Vendor lock-in (AWS-specific)
- ❌ Cold start latency (100-500ms)
- ❌ Difficult local development
- ❌ Function timeout limits (15 min)
- ❌ Debugging challenges
- ❌ Stateless (requires external state management)

**Best for:**
- Variable, unpredictable traffic
- Event-driven workloads
- Cost-sensitive projects
- Rapid prototyping

**Risks:**
- Medium risk of hitting platform limitations
- Vendor lock-in makes migration difficult

---

### Option 4: Hybrid Architecture (Recommended)

**Description:**
Pragmatic mix of monolith core with selective microservices.

**Diagram:**
```
┌──────────────────────────┐
│   Monolithic Core App    │
│  ┌────────────────────┐  │
│  │  User Management   │  │
│  │  Content System    │  │
│  │  Admin Panel       │  │
│  └────────────────────┘  │
└────────┬─────────────────┘
         │
         ├──────────┬────────────┐
         │          │            │
    ┌────▼───┐ ┌───▼─────┐ ┌────▼─────┐
    │Payment │ │Analytics│ │ Notif.   │
    │Service │ │Service  │ │ Service  │
    └────────┘ └─────────┘ └──────────┘
   (Needs      (Heavy      (High
    PCI         compute)     volume)
    compliance)
```

**Technology Stack:**
- Core: Node.js/Express monolith
- Critical services: Independent microservices
- Database: PostgreSQL (main), Redis (cache)
- Queue: RabbitMQ for async operations
- Deployment: Docker Compose → Kubernetes (as needed)

**Pros:**
- ✅ Simplicity where possible (monolith)
- ✅ Flexibility where needed (microservices)
- ✅ Gradual migration path
- ✅ Balance of development speed and scalability
- ✅ Easier to start, can grow
- ✅ Lower operational complexity than full microservices

**Cons:**
- ⚠️ Requires clear boundaries
- ⚠️ Can become messy without discipline
- ⚠️ Mixed deployment strategies

**Best for:**
- Growing applications (current or expected growth)
- Teams learning microservices
- Need balance of speed and scalability
- **YOUR PROJECT** ← Matches your constraints

**Risks:**
- Low risk with clear service boundaries

---

## Recommendation Matrix

| Criterion | Monolith | Microservices | Serverless | Hybrid |
|-----------|----------|---------------|------------|--------|
| Team size (4 devs) | ✅ Perfect | ❌ Too complex | ✅ Good | ✅ Ideal |
| Timeline (6 mo) | ✅ Fast | ❌ Slow | ✅ Fast | ✅ Balanced |
| Budget ($5K/mo) | ✅ Cheap | ❌ Expensive | ✅ Efficient | ✅ Moderate |
| Scale (100K users) | ⚠️ Challenging | ✅ Excellent | ✅ Auto-scales | ✅ Good |
| Complexity | ✅ Low | ❌ High | ⚠️ Medium | ✅ Medium |
| Future growth | ⚠️ Limited | ✅ Unlimited | ✅ Great | ✅ Good |

---

## Recommended Architecture: Hybrid

**Rationale:**
1. ✅ Team size (4) fits hybrid approach
2. ✅ 6-month timeline achievable
3. ✅ Budget-friendly ($5K covers core + 2-3 services)
4. ✅ Can scale to 100K users
5. ✅ Allows gradual learning and evolution
6. ✅ Start simple, extract services as needed

**Implementation plan:**
- **Phase 1 (Months 1-3):** Build monolithic core
- **Phase 2 (Months 4-5):** Extract payment service (compliance)
- **Phase 3 (Month 6):** Add notification service (high volume)

---

**Proceed with Hybrid Architecture?** (yes/modify/choose different)
```

---

### Phase 2D: Agent Assignment Strategy

Before proceeding to detailed design, determine if parallel agent execution would accelerate architecture development:

#### When to Use Parallel Agents

**Use specialized agents for:**
- **Architecture research**: Understanding existing systems or industry patterns
- **Component design**: Designing independent architectural layers in parallel
- **Validation**: Assessing security, performance, or compliance requirements
- **Documentation**: Generating ADRs, diagrams, or specification documents

#### Agent Type Selection

| Task Type | Recommended Agent | Use Case |
|-----------|------------------|----------|
| Codebase analysis | `code-finder-advanced` | Analyze existing architecture patterns, identify integration points |
| Technology research | `backend-developer` | Evaluate technology stacks, design data layers, API structures |
| Frontend architecture | `frontend-ui-developer` | Design UI components, state management, routing patterns |
| Security assessment | `backend-developer` | Review security architecture, identify compliance requirements |
| Implementation | `implementor` | Write actual code for architecture components (Step 3+) |

#### Parallel Execution Decision Points

**Research Phase (Step 1):**
- Use `code-finder-advanced` to analyze existing codebase in parallel with user questions
- Use `backend-developer` to research integration requirements while gathering constraints

**Architecture Options (Step 2):**
- Generally sequential (present options to user for decision)
- Can parallelize research on specific architecture patterns if needed

**Detailed Design (Step 3):**
- Use `backend-developer` agents to design independent layers (data, API, business logic)
- Use `frontend-ui-developer` for UI architecture if separate from backend
- Use `implementor` agents for prototype implementations if validation needed

#### Context Provision Guidelines

When delegating to agents:
1. **Provide file paths**: Exact locations to read for background context
2. **Reference templates**: Point to specific line numbers in this protocol
3. **Set boundaries**: Clearly define what should and shouldn't be designed
4. **Include examples**: Reference similar patterns from the codebase

**Reference:** `~/.claude/guides/parallel.md` lines 39-57 (Optimal Agent Usage)

---

## Step 3: Detailed Design

After architecture selection, create detailed design.

### Layer-Based Parallelization Pattern (Optional)

For complex systems with multiple components, parallelize detailed component design:

**Parallelize component design if:**
- [ ] System has 4+ independent architectural layers or components
- [ ] Different components require specialized expertise
- [ ] Components have clear boundaries and interfaces

**Execution pattern:**
```xml
<function_calls>
  <invoke name="Task">
    <parameter name="description">Design data layer architecture</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Design the data access layer for [system]:
      - Database schema (tables, indexes, relationships)
      - Repository pattern implementation
      - Caching strategy (Redis)
      - Data migration approach

      Follow the template structure from ARCHITECTURE-DESIGN.md lines 500-600.
      Include code examples and performance considerations.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Design API layer architecture</parameter>
    <parameter name="subagent_type">backend-developer</parameter>
    <parameter name="prompt">
      Design the API layer for [system]:
      - Endpoint structure and routing
      - Authentication and authorization middleware
      - Request validation approach
      - Error handling strategy

      Follow the template from ARCHITECTURE-DESIGN.md lines 425-495.
      Provide TypeScript examples for key components.
    </parameter>
  </invoke>
  <invoke name="Task">
    <parameter name="description">Design frontend architecture</parameter>
    <parameter name="subagent_type">frontend-ui-developer</parameter>
    <parameter name="prompt">
      Design the frontend architecture for [system]:
      - Component structure and organization
      - State management approach
      - Routing and navigation
      - API integration patterns

      Include React/Next.js examples and performance optimization strategy.
    </parameter>
  </invoke>
</function_calls>
```

After component design agents complete, consolidate into unified architecture document ensuring consistency across layers.

**Reference:** `~/.claude/guides/parallel.md` lines 103-108 (Layer-Based Parallelization)

---

### Detailed Design Template

```markdown
## Detailed Design: [System Name]

### System Architecture

**High-Level Architecture:**
```
[Detailed ASCII or diagram URL]
```

---

### Component Breakdown

#### 1. API Layer

**Responsibility:** HTTP request handling, routing, authentication

**Technology:** Express.js on Node.js 18+

**Components:**
- **Router** (`src/routes/`) - Route definitions
- **Controllers** (`src/controllers/`) - Request handlers
- **Middleware** (`src/middleware/`) - Auth, validation, logging
- **Error handler** (`src/errors/`) - Centralized error handling

**Key files:**
- `src/app.js` - Express app setup
- `src/routes/index.js` - Route registration
- `src/middleware/auth.js` - JWT authentication

**Interfaces:**
```typescript
// Public API
POST   /api/auth/login       - User authentication
GET    /api/users/:id        - Get user profile
POST   /api/orders           - Create order
GET    /api/orders/:id       - Get order details
```

---

#### 2. Business Logic Layer

**Responsibility:** Domain logic, business rules, orchestration

**Technology:** Plain TypeScript classes and functions

**Components:**
- **Services** (`src/services/`) - Business logic
- **Domain models** (`src/models/`) - Entity definitions
- **Validators** (`src/validators/`) - Business rule validation

**Patterns used:**
- Service layer pattern (orchestration)
- Repository pattern (data access abstraction)
- Factory pattern (object creation)

**Example service:**
```typescript
// src/services/OrderService.ts
export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {}

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    // Validate business rules
    this.validateOrder(data);

    // Create order (transactional)
    const order = await this.orderRepo.create(data);

    // Process payment
    await this.paymentService.charge(order.amount, order.userId);

    // Send notification
    await this.notificationService.sendOrderConfirmation(order);

    return order;
  }
}
```

---

#### 3. Data Access Layer

**Responsibility:** Database operations, caching, data persistence

**Technology:**
- Primary DB: PostgreSQL 14
- Cache: Redis 7
- ORM: Prisma

**Schema design:**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Repository pattern:**
```typescript
// src/repositories/OrderRepository.ts
export class OrderRepository {
  async create(data: CreateOrderData): Promise<Order> {
    return await prisma.order.create({ data });
  }

  async findById(id: string): Promise<Order | null> {
    // Try cache first
    const cached = await redis.get(`order:${id}`);
    if (cached) return JSON.parse(cached);

    // Fetch from DB
    const order = await prisma.order.findUnique({ where: { id } });

    // Cache for 5 minutes
    await redis.setex(`order:${id}`, 300, JSON.stringify(order));

    return order;
  }
}
```

---

### Data Flow Examples

#### Flow 1: User Login

```
1. POST /api/auth/login {email, password}
   ↓
2. AuthController.login()
   ↓
3. AuthService.authenticate(email, password)
   ├─ UserRepository.findByEmail(email)
   ├─ bcrypt.compare(password, user.passwordHash)
   └─ JwtService.generateToken(user.id)
   ↓
4. Return {token, user}
```

**Time budget:** <100ms
**Database queries:** 1 (user lookup)
**Cache usage:** User info cached 1 hour

---

#### Flow 2: Create Order

```
1. POST /api/orders {items, userId}
   ↓
2. OrderController.create()
   ↓ (transaction begins)
3. OrderService.createOrder()
   ├─ Validate inventory (InventoryService)
   ├─ Calculate total (PricingService)
   ├─ Create order record (OrderRepository)
   ├─ Charge payment (PaymentService → external API)
   ├─ Update inventory (InventoryService)
   └─ Queue notification (NotificationQueue)
   ↓ (transaction commits)
4. Return {order}
5. (Async) NotificationService.sendEmail()
```

**Time budget:** <500ms (excluding async notification)
**Database queries:** 5-10 (within transaction)
**External APIs:** 1 (payment gateway)

---

### Error Handling Strategy

**Error types:**
```typescript
class ValidationError extends Error {
  statusCode = 400;
}

class NotFoundError extends Error {
  statusCode = 404;
}

class UnauthorizedError extends Error {
  statusCode = 401;
}

class ExternalServiceError extends Error {
  statusCode = 502;
}
```

**Global error handler:**
```typescript
app.use((err, req, res, next) => {
  // Log error with context
  logger.error({
    error: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      userId: req.user?.id
    }
  });

  // Return appropriate response
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
```

---

### Security Architecture

**Authentication:**
- JWT tokens (RS256 algorithm)
- Access token: 1 hour expiry
- Refresh token: 30 days expiry
- Token stored in httpOnly cookie

**Authorization:**
- Role-based access control (RBAC)
- Permissions checked in middleware
- Admin, user, guest roles

**Data protection:**
- Passwords hashed with bcrypt (cost 12)
- Sensitive data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- PII encrypted in database

**API security:**
- Rate limiting: 100 req/min per IP
- CORS: Whitelist allowed origins
- CSRF protection: Double-submit cookie
- Input validation: Zod schemas

---

### Scalability Strategy

**Current capacity:**
- Single server: 1,000 concurrent users
- Database: 50 queries/second
- Response time: <200ms (p95)

**Scaling triggers:**
- >70% CPU utilization → Scale horizontally
- >80% memory usage → Increase instance size
- >50ms database latency → Add read replicas

**Scaling approach:**

**Horizontal scaling:**
```
Load Balancer (AWS ALB)
├─ App Server 1
├─ App Server 2
├─ App Server 3 (auto-scaled)
└─ App Server N
```

**Database scaling:**
```
Primary DB (writes)
├─ Read Replica 1
├─ Read Replica 2
└─ Redis Cache (reduce DB load)
```

**Estimated capacity:**
- 3 app servers: 3,000 concurrent users
- 2 read replicas: 200 queries/second
- Redis cache: 90% cache hit rate

---

### Deployment Architecture

**Infrastructure:**
- **Cloud:** AWS
- **Compute:** ECS Fargate (containers)
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Cache:** ElastiCache Redis
- **Storage:** S3 for static files
- **CDN:** CloudFront
- **Networking:** VPC with public/private subnets

**Environments:**
```
Development → Staging → Production

Dev:     Single instance, shared DB
Staging: Production-like, lower resources
Prod:    Multi-AZ, auto-scaling, redundancy
```

**Deployment pipeline:**
```
Git push → GitHub Actions
  ├─ Lint & tests
  ├─ Build Docker image
  ├─ Push to ECR
  ├─ Deploy to staging
  ├─ Run E2E tests
  └─ Deploy to production (manual approval)
```

---

### Monitoring & Observability

**Metrics:**
- **Application:** Response time, error rate, throughput
- **Infrastructure:** CPU, memory, disk, network
- **Business:** Orders/min, revenue, user signups

**Tools:**
- **Logs:** CloudWatch Logs + structured logging
- **Metrics:** CloudWatch Metrics + Prometheus
- **Tracing:** AWS X-Ray (distributed tracing)
- **Alerts:** CloudWatch Alarms → SNS → Slack

**Key alerts:**
- Error rate >1% → Page on-call
- Response time >500ms → Warning
- Service down → Page immediately
- Database connections >80% → Warning

---

### Technology Decisions

#### Why Node.js?
**Decision:** Use Node.js for backend
**Reasoning:**
- Team expertise (all 4 devs know JS/TS)
- Great async performance (I/O-bound workload)
- Rich ecosystem (npm packages)
- Easy to hire developers

**Alternatives considered:**
- Python: Slower, but great for data processing
- Go: Faster, but learning curve for team

---

#### Why PostgreSQL?
**Decision:** Use PostgreSQL as primary database
**Reasoning:**
- ACID compliance (financial data)
- Rich query capabilities (complex queries)
- JSON support (flexible schema where needed)
- Battle-tested (proven reliability)

**Alternatives considered:**
- MongoDB: Great for flexible schema, but weak consistency
- MySQL: Similar, but Postgres has better features

---

### Performance Targets

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| API response (p95) | <200ms | 150ms | ✅ |
| Database query | <50ms | 30ms | ✅ |
| Page load (TTI) | <3s | 2.1s | ✅ |
| Throughput | 100 req/s | 120 req/s | ✅ |

---

**Design complete. Proceed with implementation?** (yes/revise)
```

---

## Step 4: Design Documentation

```markdown
## Architecture Documentation

### ADR-001: Hybrid Architecture Selection

**Date:** 2025-10-02
**Status:** Accepted
**Context:** Choosing architecture for new e-commerce platform

**Decision:** Hybrid monolith + microservices

**Reasoning:**
- Team size (4) fits approach
- Allows fast initial development
- Can extract services as needed
- Balance of simplicity and scalability

**Consequences:**
- Need clear service boundaries
- Requires discipline to avoid messy hybrid
- Migration path to full microservices if needed

**Alternatives considered:**
1. Pure monolith - Rejected (scalability concerns)
2. Full microservices - Rejected (too complex for team)
3. Serverless - Rejected (vendor lock-in)

---

### System Context Diagram

[C4 model Level 1]

---

### Component Diagram

[C4 model Level 2]

---

### Deployment Diagram

[Infrastructure visualization]

---
```

---

## Quality Criteria

Architecture design complete when:
- [ ] Requirements fully understood
- [ ] Constraints documented
- [ ] Multiple options evaluated
- [ ] Trade-offs clearly explained
- [ ] Recommendation justified
- [ ] Detailed component design provided
- [ ] Data flows documented
- [ ] Security architecture defined
- [ ] Scalability strategy planned
- [ ] Technology decisions documented with reasoning

---
