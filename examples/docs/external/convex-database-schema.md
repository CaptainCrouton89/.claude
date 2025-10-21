# Convex Database & Schema LLM Reference

## Critical Schema Definition Syntax

### Table Definition with Validators
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    user: v.id("users"),
    channel: v.optional(v.id("channels")),
    metadata: v.object({
      priority: v.union(v.literal("high"), v.literal("low")),
      tags: v.array(v.string())
    })
  }).index("by_channel", ["channel"])
    .index("by_user_channel", ["user", "channel"]),
});
```

### Validator Types with Constraints
- `v.id("tableName")`: Document reference, must match existing table
- `v.string()`: UTF-8 Unicode, max 1MB when encoded
- `v.int64()`: BigInt between -2^63 and 2^63-1, serialized as base10 string
- `v.object({ field: v.type() })`: Max 1024 entries, nested max depth 16
- `v.record(v.string(), v.any())`: Arbitrary key-value, keys must be ASCII
- `v.union(v.type1(), v.type2())`: Multiple types allowed
- `v.optional(v.type())`: Field may be missing from document
- `v.literal("exact_value")`: Constant value constraint

### Field Name Restrictions
- Cannot start with "$" or "_" (reserved for system fields)
- System fields automatically added: `_id`, `_creationTime`
- `undefined` values stripped from objects before storage

## Index Configuration Requirements

### Index Definition Limits
- Max 16 fields per index
- Max 32 indexes per table
- Field paths support dot notation for nested objects: `"metadata.priority"`

### Index Creation Syntax
```typescript
defineTable(schema)
  .index("index_name", ["field1", "field2"])
  .index("compound_index", ["user", "channel", "createdAt"])
```

### Query Optimization Patterns
```typescript
// Efficient indexed query
await ctx.db.query("messages")
  .withIndex("by_channel", q => q.eq("channel", channelId))
  .filter(q => q.eq("metadata.priority", "high"))
  .order("desc")
  .take(20);

// Index range expressions (order matters)
await ctx.db.query("events")
  .withIndex("by_timestamp", q => q
    .eq("type", "user_action")           // 1. Equality constraints first
    .gte("timestamp", startTime)         // 2. Lower bound
    .lte("timestamp", endTime)           // 3. Upper bound
  );
```

## Document Size and Structure Limits
- Max document size: ~1MB
- Max nesting depth: 16 levels
- Max object entries: 1024 per object
- No `undefined` values (use `v.optional()` instead)

## CRUD Operations with Exact Signatures

### Insert
```typescript
const id = await ctx.db.insert("tableName", {
  field1: "value",
  field2: 123
}); // Returns Id<"tableName">
```

### Update Operations
```typescript
// Shallow merge - adds/modifies/removes fields
await ctx.db.patch(documentId, {
  newField: "value",
  existingField: undefined  // Removes field
});

// Complete replacement
await ctx.db.replace(documentId, {
  // Must include all required fields
});
```

### Query Result Methods
```typescript
// Terminal query methods
.collect()        // Promise<Doc<"table">[]>
.take(n)         // Promise<Doc<"table">[]> - first n results
.first()         // Promise<Doc<"table"> | null>
.unique()        // Promise<Doc<"table">> - throws if multiple found
.paginate(opts)  // Promise<PaginationResult<Doc<"table">>>
```

## Pagination Implementation Patterns

### Query Function with Pagination
```typescript
export const listMessages = query({
  args: {
    paginationOpts: paginationOptsValidator,
    channelId: v.optional(v.id("channels"))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("messages");

    if (args.channelId) {
      query = query.withIndex("by_channel", q =>
        q.eq("channel", args.channelId)
      );
    }

    return await query
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Cursor Behavior (Non-Obvious)
- Cursors are opaque strings, only work with exact same query
- `numItems` in `paginationOpts` is initial hint only
- In reactive queries, page sizes may change due to real-time updates
- Cursors maintain consistent boundaries across data mutations

### React Pagination Hook
```typescript
const { results, status, loadMore } = usePaginatedQuery(
  api.messages.listMessages,
  { channelId: "channel123" },
  { initialNumItems: 20 }
);

// status: "CanLoadMore" | "LoadingMore" | "Exhausted"
```

## Schema Evolution and Migration Constraints

### Safe Schema Changes
```typescript
// ✅ Safe: Add optional field
defineTable({
  existing: v.string(),
  newField: v.optional(v.string())  // Add optional first
})

// ✅ Safe: Union type evolution
defineTable({
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"))
})

// ✅ Safe: Make required field optional
defineTable({
  previouslyRequired: v.optional(v.string())  // Then remove from docs
})
```

### Schema Validation Configuration
```typescript
// convex.json
{
  "schemaValidation": true,  // Default: enforces schema at runtime
  "strictTableNameTypes": true  // Default: strict TypeScript table access
}
```

### Validation Enforcement Rules
- First push after schema change validates ALL existing documents
- Push fails if any existing documents don't match schema
- Future inserts/updates validated against schema at runtime
- Set `schemaValidation: false` to disable runtime checks

## Performance Gotchas and Limitations

### Query Performance
- Always use `.withIndex()` for predictable performance on large datasets
- Index scan + `.filter()` is often more efficient than complex indexes
- Equality constraints must come before range constraints in index queries
- Use `.take()`, `.first()`, or `.unique()` to limit scans

### Transaction Boundaries
- Entire mutation function runs as single transaction
- Database operations queued and batched automatically
- No explicit transaction control needed
- Bulk operations: loop with `await` for each operation

### Document Access Patterns
```typescript
// ✅ Efficient: Single document lookup
const doc = await ctx.db.get(documentId);

// ❌ Inefficient: Scanning without index
const docs = await ctx.db.query("large_table")
  .filter(q => q.eq("unindexed_field", value))
  .collect();

// ✅ Efficient: Index-based lookup
const docs = await ctx.db.query("large_table")
  .withIndex("by_indexed_field", q => q.eq("indexed_field", value))
  .collect();
```

## Version: Latest (as of 2024)
- Schema system stable since v1.0
- Pagination API finalized in v1.2
- Migration tools available via Convex Components