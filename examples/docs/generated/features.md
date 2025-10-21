# Feature Specifications

This document provides detailed specifications for all features.

---

## F-01 - Geolocation & Map System

**Status:** planned

### Summary

Integrate Google Maps to display player location and nearby enemy spawn points. Enable location-based discovery by tracking GPS position and calculating proximity to spawn locations.

### Core Logic

Track player GPS coordinates continuously. Query backend for spawn locations within radius. Display markers on map. Activate locations when player within 50m threshold. GPS permission required to proceed - show permission request popup on app launch and block progression until granted.

### API Endpoints

- **GET** `/locations/nearby`
- **GET** `/locations/:id`

---

## F-02 - Combat System

**Status:** planned

### Summary

Turn-based combat with weapon-specific timing dial mechanics. Different weapons have different dial patterns (single_arc, dual_arcs, pulsing_arc, roulette, sawtooth). Player taps moving dial with zone-based outcomes (miss/graze/normal/crit). Player accuracy stat scales zone sizes. Stats calculated from equipped items + pet. Enemy counterattacks after player turn. Combat ends when either HP reaches 0.

### Core Logic

Initiate combat when player taps active location. Load enemy data and player's equipped weapon. Display weapon-specific dial pattern (single_arc/dual_arcs/pulsing_arc/roulette/sawtooth) with zone-based hit bands. Player accuracy stat adjusts zone sizes via fn_weapon_bands_adjusted(). On tap, determine hit zone (injure/miss/graze/normal/crit). Apply zone multipliers: injure=-50%, miss=0%, graze=60%, normal=100%, crit=160%+RNG. RNG adds 0-100% bonus multiplier on crit hits. Enemy counterattacks after player turn. Victory rewards materials matching enemy's style_id.

### API Endpoints

- **POST** `/combat/start`
- **POST** `/combat/attack`
- **POST** `/combat/complete`

---

## F-03 - Base Items & Equipment System

**Status:** planned

### Summary

8 equipment slots (weapon, offhand, head, armor, feet, accessory_1, accessory_2, pet) with normalized stat blocks. Base items have stats that sum to 1.0, modified by materials and scaled by level. Equipment state tracked in normalized UserEquipment table. Players start with 8 level-1 base items (one per slot).

### Core Logic

Each player has 8 equipment slots. Base items have normalized stats {atkPower, atkAccuracy, defPower, defAccuracy} summing to 1.0. Materials modify these stats (±0.05-0.30). Item rarity provides stat multipliers (1.00-2.00). Item level multiplies base stats. Total player stats = sum of all 8 equipped items.

### API Endpoints

- **GET** `/inventory`
- **GET** `/equipment`
- **POST** `/equipment/equip`
- **POST** `/equipment/unequip`

---

## F-04 - Materials System

**Status:** planned

### Summary

Collectible materials that modify item stats with zero-sum trade-offs. Materials stack in inventory (MaterialStacks), convert to unique instances when applied (MaterialInstances). Max 3 materials per item (hard limit). Styled materials are visual variants with normal stat effectiveness. Image generation creates combo-specific visuals cached globally with craft count tracking (20s sync for MVP, async with crafting times in later MVP).

### Core Logic

Materials stack in player inventory (MaterialStacks table). Applying material decrements stack, creates MaterialInstance, links via ItemMaterials. Triggers image generation on first application of new combo (20s sync). Global ItemImageCache stores combo images with craft_count. Material removal costs gold (100 × item level) and returns material to stack. To replace material: remove old (costs gold, returns to stack) then apply new (consumes from stack).

### API Endpoints

- **GET** `/materials`
- **GET** `/materials/inventory`
- **POST** `/items/{item_id}/materials/apply`
- **POST** `/items/{item_id}/materials/remove`

---

## F-05 - Material Drop System

**Status:** planned

### Summary

Enemies drop gold (100% chance) and materials (60% chance). Material drops use tier-based rarity system with derived strength classification. Drop weights calculated as base_drop_weight × tier_multiplier from LootPoolTierWeights. Enemy level equals player's average equipped item level.

### Core Logic

On combat victory, roll for material drop (60% chance). If success, select weighted random material from location-specific LootPool using tier-based system. Materials auto-classified into tiers (common/uncommon/rare/epic) based on stat modifier magnitude. Drop weights = base_drop_weight × tier_multiplier. Always award gold (random amount in enemy's level-scaled range).

### API Endpoints

- **POST** `/combat/complete`

---

## F-06 - Item Upgrade System

**Status:** planned

### Summary

Spend gold to increase item level. Each level increases all item stats proportionally while maintaining normalized ratios. Gold cost increases exponentially with level and scales by item rarity. Upgrading contributes to vanity level progression.

### Core Logic

Player selects item and spends gold to level it up. Item level increments by 1. All stats scale by new level and rarity (base_stats × rarity_multiplier × level). Gold cost formula: base_cost × level_multiplier^(level-1) × rarity_multiplier. Vanity level increases based on total item levels across all items.

### API Endpoints

- **GET** `/items/:item_id/upgrade-cost`
- **POST** `/items/:item_id/upgrade`

---

## F-07 - User Authentication

**Status:** planned

### Summary

Secure user registration, login, and session management via Supabase Auth. Supports email/password authentication with email verification, password reset, and persistent sessions.

### Core Logic

Supabase Auth handles user accounts, password hashing, email verification, and JWT token generation. Client stores session token securely. On app launch, check for valid session and auto-login. All API requests include Authorization header with JWT token.

### API Endpoints

- **POST** `Supabase Auth: signUp`
- **POST** `Supabase Auth: signInWithPassword`
- **GET** `/profile`
- **POST** `Supabase Auth: signOut`

---

## F-09 - Inventory Management System

**Status:** planned

### Summary

Comprehensive inventory management system with item viewing, organizing, filtering, equipment management across 8 slots, and saved loadouts. Players can view all owned items, sort/filter by type/rarity/level, equip/unequip items to appropriate slots, and save/load equipment configurations for quick switching.

### Core Logic

Players accumulate items through combat rewards and can organize them in a comprehensive inventory system. Items can be filtered by equipment slot (weapon, offhand, head, armor, feet, accessory_1, accessory_2, pet), sorted by level/rarity/acquisition date, and equipped to 8 equipment slots. Post-MVP adds saved loadouts for quick equipment configuration switching. UserEquipment table is single source of truth for equipped state.

### API Endpoints

- **GET** `/inventory`
- **GET** `/equipment`
- **PUT** `/equipment/{slot_name}`
- **DELETE** `/equipment/{slot_name}`
- **GET** `/loadouts`
- **POST** `/loadouts`
- **PUT** `/loadouts/{id}/activate`
- **PATCH** `/loadouts/{id}`
- **DELETE** `/loadouts/{id}`

---

## F-10 - Premium Items & Monetization

**Status:** incomplete

### Summary

Premium currency (Gems) and special single-location items available through premium purchases. Gems currency exists alongside Gold. Premium items flagged as premium_only require Gems to purchase/obtain. Users acquire Gems through real-money purchases (future). Premium items may be exclusive to specific locations or purchasable from premium store. STATUS: PLACEHOLDER SPEC - IAP implementation not yet designed.

### Core Logic

Gems currency exists alongside Gold. Premium items flagged as premium_only require Gems to purchase/obtain. Users acquire Gems through real-money purchases (future). Premium items may be exclusive to specific locations or purchasable from premium store. Currencies table (GOLD, GEMS), UserCurrencyBalances replaces Users.gold_balance, ItemTypes.premium_only boolean field.

### API Endpoints

- **GET** `/currencies`
- **GET** `/users/me/balances`
- **POST** `/iap/purchase`

---

## F-11 - Pet Personality System

**Status:** planned

### Summary

AI-powered dynamic pet personalities that generate contextual trash-talk and commentary during combat. Each pet has personality traits that influence their dialogue style. The AI observes combat events (attacks, defenses, critical hits, misses) and generates personality-appropriate chatter in real-time.

### Core Logic

Each pet has a personality profile (traits, tone, behavior tendencies). During combat, the system tracks combat events and feeds them to an AI service along with the pet's personality profile. The AI generates contextual dialogue that appears in the combat UI as speech bubbles or text overlays. Personality traits influence dialogue style (e.g., sassy vs. encouraging, verbose vs. terse).

### API Endpoints

- **POST** `/combat/pet-chatter`
- **GET** `/pets/personalities`
- **PUT** `/pets/{pet_id}/personality`

---

## F-12 - Enemy AI Personality System

**Status:** planned

### Summary

AI-powered enemy personalities that generate contextual trash-talk during combat based on enemy type, game state, and player history. Uses GPT-4.1-nano or similar lightweight model to create dynamic, antagonistic dialogue that enhances combat engagement and creates memorable enemy interactions.

### Core Logic

Enemy personalities are ephemeral and generated fresh per combat encounter. Each enemy type (Spray Paint Goblin, Goopy Floating Eye, etc.) has personality traits that influence dialogue tone. The AI receives combat context (HP, stats, turn count, actions) plus player metadata (level attempts, win/loss history, streak) to generate taunts. Unlike pet personalities (F-11), enemy personalities are not persistent and focus on antagonistic/challenging themes.

### API Endpoints

- **POST** `/combat/enemy-chatter`
- **GET** `/enemies/types`
- **GET** `/players/combat-history/{location_id}`

---

## F-13 - Progression Balance & Endgame Content

**Status:** planned

### Summary

Long-term progression mechanics, endgame goals, and balance systems to prevent power creep and economy inflation. Includes soft level caps with diminishing returns, prestige/rebirth system for seasonal resets, additional gold sinks (cosmetics, convenience features), endgame content for max-level players, and economy balance mechanisms.

### Core Logic

Progressive XP scaling with soft cap at level 50, exponential growth beyond level 50. Optional prestige system allows level reset while keeping items/materials in exchange for permanent gold bonus. Additional gold sinks prevent economy inflation. Endgame achievement system provides long-term goals for max-level players. Seasonal content and leaderboards drive competitive engagement.

### API Endpoints

- **POST** `/progression/prestige`
- **GET** `/progression/endgame-goals`
- **POST** `/cosmetics/reroll`
- **POST** `/loadouts/expand`

---

