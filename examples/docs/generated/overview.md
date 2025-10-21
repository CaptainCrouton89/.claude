# New Mystica Overview

## Summary

A location-based mobile RPG where players explore real-world locations to discover enemies, collect items and pets, and engage in tactical combat. Players navigate using maps, craft powerful equipment, and build their collection through location-specific gameplay.

## Goal

Create an engaging location-based RPG that combines exploration, collection, and strategic combat to drive daily active play sessions

## Features

- **F-01:** Geolocation & Map System - Google Maps integration for real-world navigation and location-based item/enemy discovery
- **F-02:** Combat System - Timing-based combat with attack multiplier dial, stat calculations, and turn-based flow
- **F-03:** Base Items & Equipment System - 8 equipment slots (weapon, offhand, head, armor, feet, accessory_1, accessory_2, pet) with normalized stat blocks and level progression
- **F-04:** Materials System - Collectible materials that modify item stats (max 3 per item, hard limit), with normal and styled variants, removable for gold (100 × item level). Global image cache with craft count tracking.
- **F-05:** Material Drop System - Enemies drop gold (always) and materials (60% chance), with 5% styled rate and level-scaled rewards
- **F-06:** Item Upgrade System - Spend gold to level up items, increasing stat values while maintaining normalized ratios
- **F-07:** User Authentication - Secure registration, login, and persistent user profiles
- **F-08:** Design System - Consistent UI components (buttons, typography, colors) across all screens
- **F-09:** Inventory Management - View, filter, and sort all owned items; equip/unequip items to 8 equipment slots; save up to 5 loadout configurations for quick switching (post-MVP)
- **F-10:** Premium Items & Monetization - Multi-currency system (GOLD active, GEMS reserved for future IAP); premium item catalog and special content (placeholder spec - IAP not yet implemented)
- **F-11:** Pet Personality System - AI-powered dynamic pet personalities that generate contextual trash-talk and commentary during combat based on pet traits and battle events
- **F-12:** Enemy AI Personality System - AI-powered enemy personalities that generate contextual trash-talk during combat based on enemy type, game state, and player history (attempts, win/loss record, streaks)
- **F-13:** Progression Balance & Endgame Content - Long-term progression with soft level caps, prestige/rebirth system, additional gold sinks, and endgame achievement goals
