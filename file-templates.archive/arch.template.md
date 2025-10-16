# Application Architecture

## Overview
[High-level description of the application's purpose and architecture philosophy]

## Tech Stack
- **Frontend**: [Framework, version]
- **Backend**: [Framework, version]
- **Database**: [Type, provider]
- **Authentication**: [Method/provider]
- **Hosting**: [Platform(s)]

## Architecture Diagram
```
[User] → [Client] → [Server] → [Database]
          ↓           ↓           ↓
     [Components] [Actions] [Tables/Storage]
```

## Core Layers

### Presentation Layer
- Location: `src/app/`, `src/components/`
- Pattern: [Server/Client Components]
- Key decisions: [Why this approach]

### Business Logic Layer
- Services: `src/lib/services/` - [Business rules]
- Actions: `src/actions/` - [Server mutations]
- Key patterns: [Service pattern decisions]

### Data Access Layer
- Repositories: `src/lib/repositories/` - [Database abstraction]
- Client types: [Admin/Server/Client Supabase clients]
- Security: [RLS policies, access patterns]

## Data Flow Patterns

### Read Operations
1. [Component requests data]
2. [Repository fetches from DB]
3. [Data transformed if needed]
4. [Rendered in UI]

### Write Operations
1. [User action in UI]
2. [Server action invoked]
3. [Service validates/processes]
4. [Repository persists]
5. [UI updates/revalidates]

## Security Architecture
- Authentication: [How users authenticate]
- Authorization: [How permissions work]
- Data isolation: [How tenant/user data is separated]
- Sensitive data: [How secrets are handled]

## Performance Considerations
- Caching: [Strategy]
- Loading: [Suspense boundaries, streaming]
- Optimization: [Key decisions]

## Deployment Architecture
- Environments: [Dev/Staging/Prod]
- CI/CD: [Pipeline description]
- Monitoring: [Tools/approach]

## Key Design Decisions
1. **[Decision 1]**: [Why and implications]
2. **[Decision 2]**: [Why and implications]

## Further Documentation
- Features: `docs/features/`
- API: `docs/api/`
- Setup: `docs/setup.md`