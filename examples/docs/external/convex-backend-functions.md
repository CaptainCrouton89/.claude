# Convex Backend Functions LLM Reference

## Function Type Signatures

### Query Functions (Read-Only)
```typescript
export const functionName = query({
  args?: Record<string, Validator>,
  handler: async (ctx: QueryCtx, args: ArgsType) => Promise<ReturnType>
});
```

**Critical Context Properties:**
- `ctx.db` - Database access (read-only, transactional)
- `ctx.storage` - File storage access
- `ctx.auth` - Authentication context
- `ctx.auth.getUserIdentity()` - Returns user identity or null

**Constraints:**
- Must be deterministic
- Automatically cached
- Reactive updates supported
- Consistent database reads at single logical timestamp
- Read volume limits apply
- `undefined` return values become `null` on client

### Mutation Functions (Write Operations)
```typescript
export const functionName = mutation({
  args?: Record<string, Validator>,
  handler: async (ctx: MutationCtx, args: ArgsType) => Promise<ReturnType>
});
```

**Critical Context Properties:**
- `ctx.db` - Full database access (read/write, transactional)
- `ctx.storage` - File storage access
- `ctx.auth` - Authentication context

**Constraints:**
- Runs transactionally (all-or-nothing)
- Must be deterministic
- Cannot call external APIs directly
- Sequential execution when called from clients
- Limited data read/write volume

### Action Functions (External Integration)
```typescript
export const functionName = action({
  args?: Record<string, Validator>,
  handler: async (ctx: ActionCtx, args: ArgsType) => Promise<ReturnType>
});
```

**Critical Context Properties:**
- `ctx.runQuery(api.module.queryName, args)` - Indirect database reads
- `ctx.runMutation(api.module.mutationName, args)` - Indirect database writes
- `ctx.storage` - File storage access
- `ctx.auth` - Authentication context

**Constraints:**
- 10-minute timeout
- 512MB memory limit (Node.js) / 64MB (Convex runtime)
- 1000 concurrent operations maximum
- Cannot directly access database
- Can call external APIs via `fetch`

## Database Operations

### Insert
```typescript
const documentId = await ctx.db.insert("tableName", {
  field1: "value1",
  field2: 42
});
// Returns: Id<"tableName">
```

### Patch (Partial Update)
```typescript
await ctx.db.patch(documentId, {
  field1: "newValue",
  newField: "addedValue"
  // Setting field to undefined removes it
});
```

### Replace (Full Update)
```typescript
await ctx.db.replace(documentId, {
  field1: "newValue",
  field2: 100
  // All previous fields are removed
});
```

### Delete
```typescript
await ctx.db.delete(documentId);
```

### Query Patterns
```typescript
// Get single document
const doc = await ctx.db
  .query("tableName")
  .withIndex("by_field", (q) => q.eq("field", value))
  .first(); // Returns document or null

// Get multiple documents with limit
const docs = await ctx.db
  .query("tableName")
  .filter((q) => q.eq(q.field("status"), "active"))
  .order("desc")
  .take(100); // Max 100 documents

// Paginated queries
const result = await ctx.db
  .query("tableName")
  .paginate(paginationOpts);
```

## Schema Definition

### Basic Schema Structure
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tableName: defineTable({
    requiredField: v.string(),
    optionalField: v.optional(v.number()),
    unionField: v.union(v.literal("option1"), v.literal("option2")),
    referenceField: v.id("otherTable"),
    nestedObject: v.object({
      nested1: v.string(),
      nested2: v.number()
    }),
    arrayField: v.array(v.string())
  })
    .index("by_field", ["requiredField"])
    .index("by_compound", ["field1", "field2"])
});
```

**Validation Types:**
- `v.string()`, `v.number()`, `v.boolean()`
- `v.id("tableName")` - Reference to document in table
- `v.optional(validator)` - Optional field
- `v.union(validator1, validator2)` - Union types
- `v.literal("value")` - Exact value constraint
- `v.object({...})` - Nested object validation
- `v.array(validator)` - Array validation
- `v.any()` - No validation (avoid in production)

**System Fields (Auto-added):**
- `_id: Id<"tableName">` - Unique document identifier
- `_creationTime: number` - Unix timestamp

## Authentication Patterns

### User Context Access
```typescript
// In any function
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated");
}

// Common helper pattern
async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
}
```

### Authorization Patterns
```typescript
export const updateProfile = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser._id !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.userId, { name: args.name });
  }
});
```

## File Storage Operations

### Generate Upload URL
```typescript
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  }
});
```

**Constraints:**
- Upload URLs expire in 1 hour
- POST requests have 2-minute timeout
- No file size limit

### Store File (Server-side)
```typescript
export const storeFile = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(args.url);
    const blob = await response.blob();

    const storageId = await ctx.storage.store(blob);

    await ctx.runMutation(internal.files.saveReference, {
      storageId,
      originalUrl: args.url
    });

    return storageId;
  }
});
```

### Serve Files via HTTP Action
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/files/{storageId}",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const storageId = request.pathParams.storageId as Id<"_storage">;

    const blob = await ctx.storage.get(storageId);
    if (!blob) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(blob);
  })
});
```

### Save Storage ID to Database
```typescript
export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    description: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", {
      storageId: args.storageId,
      description: args.description,
      uploadedBy: await getCurrentUserId(ctx)
    });
  }
});
```

## Scheduled Jobs (Cron)

### Static Cron Definition (convex/crons.ts)
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Interval-based
crons.interval(
  "cleanup-sessions",
  { minutes: 30 },
  internal.cleanup.expiredSessions
);

// Daily at specific time (UTC)
crons.daily(
  "daily-report",
  { hourUTC: 9, minuteUTC: 0 },
  internal.reports.generateDaily,
  { reportType: "summary" } // Args passed to function
);

// Unix cron syntax
crons.cron(
  "weekly-backup",
  "0 2 * * 0", // Every Sunday at 2 AM UTC
  internal.backup.createWeekly
);

export default crons;
```

**Schedule Methods:**
- `crons.interval(name, {seconds|minutes|hours}, function, args?)`
- `crons.hourly(name, {minuteUTC}, function, args?)`
- `crons.daily(name, {hourUTC, minuteUTC}, function, args?)`
- `crons.weekly(name, {dayOfWeek, hourUTC, minuteUTC}, function, args?)`
- `crons.monthly(name, {day, hourUTC, minuteUTC}, function, args?)`
- `crons.cron(name, cronExpression, function, args?)`

**Constraints:**
- Only one instance of each cron runs at a time
- Long-running functions may cause skipped executions
- Scheduled functions must be mutations or actions

### Dynamic Cron Registration
```typescript
// Using convex-crons component
export const scheduleDynamicJob = mutation({
  args: { userId: v.id("users"), reminderTime: v.string() },
  handler: async (ctx, args) => {
    const cronId = await crons.register(
      ctx,
      { kind: "cron", cronspec: args.reminderTime },
      internal.notifications.sendReminder,
      { userId: args.userId }
    );

    await ctx.db.insert("scheduled_jobs", {
      cronId,
      userId: args.userId,
      type: "reminder"
    });
  }
});
```

## Error Handling Patterns

### Function-Level Error Handling
```typescript
export const safeOperation = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    try {
      // Convex automatically retries on transient failures
      const result = await ctx.db.insert("items", { data: args.data });
      return { success: true, id: result };
    } catch (error) {
      // Log error but don't expose internal details
      console.error("Operation failed:", error);
      throw new Error("Unable to complete operation");
    }
  }
});
```

### Validation Error Patterns
```typescript
export const validateAndInsert = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Custom validation beyond schema
    if (!args.email.includes("@")) {
      throw new Error("Invalid email format");
    }

    // Check for duplicates
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email already registered");
    }

    return await ctx.db.insert("users", { email: args.email });
  }
});
```

## Performance Considerations

### Efficient Query Patterns
```typescript
// GOOD: Use indexes for fast lookups
const user = await ctx.db
  .query("users")
  .withIndex("by_email", q => q.eq("email", userEmail))
  .unique(); // Use unique() when expecting exactly one result

// GOOD: Batch operations in single transaction
export const batchUpdate = mutation({
  handler: async (ctx) => {
    const items = await ctx.db.query("items").collect();
    for (const item of items) {
      await ctx.db.patch(item._id, { updated: Date.now() });
    }
  }
});

// AVOID: Multiple separate database calls from actions
// Instead, create mutations that batch operations
```

### Pagination for Large Datasets
```typescript
export const getPaginatedItems = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .order("desc")
      .paginate(args.paginationOpts);
  }
});
```

## Swift Mobile Integration Patterns

### Client-Side Function Calling
```swift
// Query (reactive)
let messages = try await convex.watchQuery(
  query: "messages:list",
  args: ["channel": channelId]
)

// Mutation (one-time)
let messageId = try await convex.mutation(
  "messages:send",
  with: ["text": messageText, "author": userId]
)

// Action (one-time, may be slow)
let result = try await convex.action(
  "ai:generateResponse",
  with: ["prompt": userInput]
)
```

### File Upload Flow for Mobile
```typescript
// 1. Generate upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  }
});

// 2. Save file after upload
export const saveUploadedFile = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);

    return await ctx.db.insert("files", {
      storageId: args.storageId,
      filename: args.filename,
      contentType: args.contentType,
      uploadedBy: userId,
      uploadedAt: Date.now()
    });
  }
});
```

## Version: 2024.12
Last updated: December 2024
Source: docs.convex.dev