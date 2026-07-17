---
name: godot-gameplay
description: Godot 4.x gameplay mechanics — combat, inventory, quests, dialogue, save/load, abilities, economy. Token-optimized ~1.5k.
---

# godot-gameplay — Gameplay Mechanics

## Combat System
- Hitbox/Hurtbox architecture: Area3D/2D on separate collision layers
- `DamageData` Resource: damage, type, source, knockback
- HealthComponent emits `health_changed` signal — HUD NEVER references player directly
- Invincibility frames: timer-based, prevent multi-hit from one attack

## Inventory System
- Slot-based containers with `Resource`-backed items (`ItemData.tres`)
- Stacking: max stack size per item type, overflow = new slot
- Equipment: weapon/armor slots, stat modifiers on equip/unequip
- Drag-drop UI: `Control` with `get_global_mouse_position()` + `Tween` for snap

## Quests & Dialogue
- Quest graph: `Resource`-based nodes with prerequisites and rewards
- Dialogue: branching via `DialogueLine` Resources with choice arrays
- Typewriter effect: `RichTextLabel` + `Timer` character reveal
- Flags system: Dictionary of `StringName → bool` for quest/Dialogue state

## Save/Load
- Dictionary serialization: extract Node state → Dictionary → `var_to_bytes()` / JSON
- Delta-save for procedural worlds: save Seed + modification list, not full map
- NEVER save whole Object/Node — only data Dictionaries
- Auto-save on background thread: `WorkerThreadPool` for serialization
- Use `user://` for saves, NEVER `res://`

## Ability System
- Cooldown: Timer per ability, `cooldown_ratio` for UI fill bar
- Combo: buffer recent inputs, match against combo pattern array
- Skill tree: prerequisite DAG, unlock via resource nodes
- Resource cost: mana/energy/fuel — validate `can_use()` before `execute()`

## Economy
- Multi-currency: Dictionary of `currency_id → int` (use int cents)
- Weighted loot tables: `randf() < drop_chance → pick from weighted list`
- Dynamic pricing: supply/demand multiplier on base price
- Currency sinks: repair costs, fast travel, shop refresh

Upstream: `github.com/thedivergentai/GD-Agentic-Skills/skills/godot-combat-system`, `godot-inventory-system`, `godot-quest-system`, `godot-dialogue-system`, `godot-save-load-systems`, `godot-ability-system`, `godot-economy-system`
