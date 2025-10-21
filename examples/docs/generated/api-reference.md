# API Reference

**** - Version 

## Endpoints


### GET `/locations/nearby`

Get nearby spawn locations (F-01)

**Responses:**

- `200`: List of nearby locations

---

### POST `/locations/nearby`

Start combat encounter (F-02)

**Responses:**

- `200`: Combat session created

---

### POST `/locations/nearby`

Execute attack with timing (F-02)

**Responses:**

- `200`: Attack result

---

### POST `/locations/nearby`

Execute defense with timing

Enemy's turn - player defends with dial timing

**Responses:**

- `200`: Defense result

---

### POST `/locations/nearby`

Complete combat and claim rewards

**Responses:**

- `200`: Combat completed with rewards

---

### GET `/locations/nearby`

Get player inventory (all items) (F-09)

Returns both stacked items (base items only) and unique items (with materials applied)

**Responses:**

- `200`: Player inventory with base stacks and unique items

---

### GET `/equipment`

Get equipped items (8 slots)

Returns current UserEquipment state across 8 equipment slots

**Responses:**

- `200`: Equipped items and total stats

---

### POST `/equipment/equip`

Equip item to slot

Updates UserEquipment table. Replaces existing item in slot if occupied.

**Responses:**

- `200`: Item equipped

---

### POST `/equipment/equip`

Unequip item from slot

Sets UserEquipment.item_id = NULL for the specified slot

**Responses:**

- `200`: Item unequipped

---

### GET `/equipment/equip`

Get all loadouts for authenticated user (F-09)

Returns all saved equipment configurations with slot assignments

**Responses:**

- `200`: List of user's loadouts

---

### GET `/loadouts/{loadout_id}`

Get specific loadout with slot assignments (F-09)

**Responses:**

- `200`: Loadout details with populated slots
- `404`: Loadout not found or not owned by user

---

### DELETE `/loadouts/{loadout_id}`

Delete loadout (F-09)

Removes loadout and all associated LoadoutSlots. Cannot delete active loadout.

**Responses:**

- `204`: Loadout deleted
- `400`: Cannot delete active loadout
- `404`: Loadout not found

---

### PUT `/loadouts/{loadout_id}`

Activate loadout (F-09)

Copies LoadoutSlots to UserEquipment, sets is_active=true. Deactivates other loadouts.

**Responses:**

- `200`: Loadout activated, equipment updated
- `404`: Loadout not found

---

### PUT `/loadouts/{loadout_id}`

Update all slot assignments for loadout (F-09)

Replaces all LoadoutSlots entries for this loadout. Null values clear slots.


---

### GET `/materials`

Get all material templates (library) (F-04)

**Responses:**

- `200`: All available materials

---

### GET `/materials`

Get player's material inventory with stacking (F-04)

Returns MaterialStacks table data with quantities for each material type + style status

**Responses:**

- `200`: Material inventory with stacked quantities

---

### POST `/materials`

Apply material to item - creates crafted item (F-04)

Decrements MaterialStacks, creates MaterialInstance, triggers 20s image generation if not cached

**Responses:**

- `200`: Material applied successfully

---

### POST `/items/{item_id}/materials/replace`

Replace existing material in slot (costs gold)

Removes MaterialInstance, returns material to MaterialStacks, applies new material

**Responses:**

- `200`: Material replaced successfully

---

### GET `/items/{item_id}/upgrade-cost`

Get cost to upgrade item to next level

**Responses:**

- `200`: Upgrade cost info

---

### GET `/items/{item_id}/upgrade-cost`

Get specific item with full details (F-03)

Returns item with computed stats, applied materials, and generated image URL

**Responses:**

- `200`: Item details with image and materials
- `404`: Item not found or not owned by player

---

### POST `/items/{item_id}/upgrade-cost`

Upgrade item to next level (spend gold) (F-06)

**Responses:**

- `200`: Item upgraded

---

### GET `/items/{item_id}/upgrade-cost`

Get player profile

**Responses:**

- `200`: Player profile with stats

---

### POST `/items/{item_id}/upgrade-cost`

Initialize new player profile (after registration)

Creates starting inventory (6 level-1 items, 500 gold)

**Responses:**

- `201`: Profile created with starter items

---

### POST `/items/{item_id}/upgrade-cost`

Generate pet dialogue for combat event (F-11)

AI-powered pet personality system generates contextual trash-talk based on combat events

**Responses:**

- `200`: Generated pet dialogue
- `400`: Invalid event_type
- `404`: Combat session not found or no pet equipped
- `503`: AI service unavailable (fallback to canned phrases)

---

### GET `/items/{item_id}/upgrade-cost`

Get available pet personality types (F-11)

Returns list of personality types players can assign to their pets

**Responses:**

- `200`: List of personality types

---

### PUT `/items/{item_id}/upgrade-cost`

Assign personality to player's pet (F-11)

**Responses:**

- `200`: Personality assigned
- `400`: Invalid personality_type
- `404`: Pet not found or not owned by player

---

### POST `/items/{item_id}/upgrade-cost`

Generate enemy trash-talk for combat event (F-12)

AI-powered enemy personality system generates contextual trash-talk based on enemy type, combat state, and player history

**Responses:**

- `200`: Generated enemy dialogue
- `400`: Invalid event_type
- `404`: Combat session not found or expired
- `503`: AI service unavailable (fallback to example taunt with was_ai_generated=false)

---

### GET `/items/{item_id}/upgrade-cost`

Get available enemy types with personality traits (F-12)

Returns list of enemy types players can encounter with their personality characteristics

**Responses:**

- `200`: List of enemy types

---

### GET `/items/{item_id}/upgrade-cost`

Get player's combat history at specific location (F-12)

Returns player's performance metrics at a location (used for enemy AI context)

**Responses:**

- `200`: Combat history at location
- `404`: Location not found (returns zeroed stats if player never attempted)

---
