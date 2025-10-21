# System Architecture

## Overview

Build a location-based mobile RPG with real-time GPS tracking, combat mechanics, and crafting progression. System must handle location queries, combat sessions, AI item generation, and persistent user data. Designed for thousands of concurrent mobile clients with low latency (<500ms API response).


## Components

### iOS/macOS Client (SwiftUI)

Native mobile app for iOS 17+ and macOS 14+. Handles UI rendering, GPS tracking, map display, combat animations, and local data caching with SwiftData. Communicates with backend via REST APIs.

### API Gateway (Express.js)

RESTful API backend serving all client requests. Routes to service modules, enforces authentication via JWT middleware, handles error responses. Deployed on Railway with auto-scaling.

### Location Service

Manages spawn locations and level-aware pool system for enemy/loot assignments. Handles /locations/nearby queries with geospatial distance calculations. Implements tag/filter-based pool system where pools are level-specific and apply based on location attributes (location_type, state, country, coordinates). Returns locations within radius sorted by distance with dynamically assigned enemies from matching pools.

### Combat Service

Manages combat sessions in-memory (Redis) with TTL expiration. Calculates damage based on player stats, enemy stats, and timing multiplier. Awards items/pets on victory. Uses level-aware pool system to dynamically select enemies and loot drops based on player level and location attributes. Enemies with style_id drop materials with matching style_id for visual consistency.

### Inventory Service

Manages player-owned items and pets. Handles equipping/unequipping via UserEquipment table, stat aggregation from ItemMaterials and UserEquipment joins. Validates item ownership before mutations.

### Material Application Service

Handles applying up to 3 materials to items (F-04). Manages material stacking (MaterialStacks keyed by user_id, material_id, style_id), creates MaterialInstances when applied, updates ItemMaterials junction table. Computes deterministic combo_hash including style_ids for image lookup. Sets item.is_styled=true if ANY applied material has style_id != 'normal'. If image not cached in ItemImageCache, synchronously generates unique composite image (20s via AI) showing item + materials with style effects, uploads to R2, caches globally for reuse.

### AI Generation Service

Generates unique item descriptions and stat distributions via AI (OpenAI/Anthropic). Also generates pet personality dialogue (F-11) and enemy trash-talk (F-12) during combat. Validates stat distributions sum to 1.0. Caches generated items to avoid regeneration. For pet chatter (F-11), uses personality prompts and combat context to generate supportive dialogue. For enemy chatter (F-12), uses enemy type traits and player history to generate antagonistic trash-talk.

### Style System (StyleDefinitions)

Manages visual style variants for items and materials (F-05). StyleDefinitions table defines available styles with spawn_rate, style_name, and visual_modifier. Enemies with style_id drop materials with matching style_id. Items inherit styled status (is_styled=true) when ANY applied material has style_id != 'normal'. MaterialStacks keyed by (user_id, material_id, style_id) to separate inventory by style. Style inheritance ensures visual consistency across combat→materials→items.

### Supabase PostgreSQL

Primary database for all persistent data including core entities (Users, Items, ItemTypes, Materials, MaterialInstances), normalized equipment (UserEquipment, Loadouts, LoadoutSlots), materials system (ItemMaterials), style system (StyleDefinitions, MaterialStacks with style_id), pet system (Pets, PetPersonalities), enemy AI (EnemyTypes with style_id, PlayerCombatHistory), and analytics (CombatChatterLog, EnemyChatterLog). Full schema documented in data-plan.yaml including style inheritance architecture. Provides geospatial queries via PostGIS, ACID transactions, and row-level security.

### Supabase Auth

Manages user authentication, password hashing, email verification, and JWT token issuance. Integrates with backend via JWT validation middleware.

### Redis Cache

In-memory cache for combat sessions, active location markers, and frequently accessed data. Reduces database load and improves API response time.


## Tech Stack

- **frontend:** SwiftUI (native iOS/macOS), SwiftData (local persistence), CoreLocation (GPS), Google Maps SDK (map rendering)
- **backend:** Express.js 4.16.x (Node.js), Supabase SDK (auth + database), Redis (session cache), OpenAI/Anthropic SDK (AI generation)
- **database:** Supabase PostgreSQL with PostGIS (geospatial queries), Redis (in-memory cache for sessions)
- **infrastructure:** Railway (backend hosting with auto-deploy), Supabase Cloud (database + auth), Redis Cloud (cache), Google Cloud (Maps API), OpenAI/Anthropic (AI API)
