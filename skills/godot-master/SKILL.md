---
name: godot-master
description: Godot 4.x orchestrator — architecture, anti-patterns, performance budgets, Layer Cake pattern. ~3k tokens. For deep dives: upstream GD-Agentic-Skills (96 skills, 982 scripts).
---

# godot-master — Godot 4.x Lead Architect

Upstream: `github.com/thedivergentai/GD-Agentic-Skills`. Load domain skills (`godot-2d`, `godot-3d`, etc.) for specific features. NEVER load all 96 skills — causes Context Storm.

## Layer Cake Architecture (Signal Up, Call Down)

```
PRESENTATION (UI/VFX/Audio) → signals ↑ LOGIC (State Machines/Controllers) → signals ↑ DATA (Resources/.tres) → signals ↑ INFRASTRUCTURE (Autoloads/Signal Bus)
```

**CRITICAL**: Presentation NEVER modifies Data directly. Infrastructure speaks ONLY through signals.

## Signal Bus Tiering

| Bus | When | Limit |
|-----|------|-------|
| Global (Autoload) | Lifecycle events (match_started, player_died) | < 15 events |
| Scoped Feature | Feature-level (CombatBus for combat only) | Per feature folder |
| Direct | Parent-child within single scene | Never across scene boundaries |

## Expert NEVER List (30 condensed)

1. **NEVER** `get_tree().root.get_node("...")` — use `%UniqueName` or `@export NodePath`
2. **NEVER** `load()` in loop/`_process` — use `preload` or `ResourceLoader.load_threaded_request()`
3. **NEVER** `queue_free()` with external refs alive — clean refs in `_exit_tree()`
4. **NEVER** gameplay logic in `_draw()` — race condition with rendering thread
5. **NEVER** `Area2D` for 1000+ objects — use `intersect_shape()` or Server APIs
6. **NEVER** mutate external state from component — emit signal, listeners react
7. **NEVER** `await` in `_physics_process` — skips physics frames
8. **NEVER** `String` keys in hot-path dicts — use `StringName (&"key")` for O(1)
9. **NEVER** store `Callable` to freed objects — disconnect in `_exit_tree()`
10. **NEVER** `_process` for 1000+ entities — use single Manager loop or Server APIs
11. **NEVER** `Tween` on node that may be freed — kill tweens in `_exit_tree()`
12. **NEVER** request data FROM `RenderingServer`/`PhysicsServer` in `_process` — async stall
13. **NEVER** `call_deferred()` as band-aid — fix actual dependency order
14. **NEVER** circular signal connections — use mediator (Signal Bus)
15. **NEVER** inheritance > 3 levels — use composition
16. **NEVER** `_process` for movement — use `_physics_process`
17. **NEVER** print in `_process` — use `push_error()` or Debugger
18. **NEVER** scale `CollisionShape` node — scale Shape resource
19. **NEVER** save whole Object/Node — extract to Dictionary
20. **NEVER** pass Node refs in Signal Bus — use RIDs or IDs
21. **NEVER** modify `.tres` at runtime without `.duplicate()` — corrupts disk file
22. **NEVER** `get_nodes_in_group()` in `_process` — cache in `_ready()`
23. **NEVER** `float` for currency — use int cents
24. **NEVER** use `Forward+` renderer on mobile — use Mobile/Compatibility
25. **NEVER** trust client for game state — server validates
26. **NEVER** `Reliable` RPCs for movement — use `UnreliableOrdered`
27. **NEVER** use `OS.get_name()` for features — use `OS.has_feature("mobile")`
28. **NEVER** sync every projectile — client-side predict, RPC only "Fire" event
29. **NEVER** `JSON` for typed Godot data — use `var_to_bytes` or `ConfigFile`
30. **NEVER** accumulate rotation on Transform directly — store yaw/pitch separately

## Performance Budgets

| Metric | Mobile | Desktop |
|--------|--------|---------|
| Draw Calls | < 100 (2D), < 200 (3D) | < 500 |
| Triangles | < 100K | < 1M |
| Texture VRAM | < 512MB | < 2GB |
| Script Time | < 4ms/frame | < 8ms/frame |
| Physics Bodies | < 200 | < 1000 |
| Particles | < 2000 | < 10000 |
| Scene Load | < 500ms | < 2s |

## SceneTree vs Server APIs

| Metric | Node | RID |
|--------|------|-----|
| Object Limit | ~1K-5K | 50K+ |
| Mem overhead | ~2-10KB/node | < 200B/RID |
| Threading | Main only | Thread-safe |
| Lifecycle | Auto | Manual (alloc/free) |

Use Server APIs (RenderingServer, PhysicsServer) for 10K+ instances, bullet-hell, mass physics.

## GDScript Pro Tips

- `@export Resource` is SHARED by default — use `duplicate()` in `_ready()` or "Local to Scene"
- Signal syntax: `signal_name.connect(callable)` — old `connect("signal", ...)` silently fails in Godot 4
- `Tween` is no longer Node — use `get_tree().create_tween()` for persistent tweens
- `collision_layer` = "what I am", `collision_mask` = "what I scan"
- `move_and_slide()` returns bool now; `velocity` is property, not parameter
- `@onready` runs AFTER `_init()` but DURING `_ready()` — don't use for constructor-time setup

## Domain Skills (load when needed)

| Skill | When | Tokens |
|-------|------|--------|
| `godot-2d` | 2D physics, animation, tilemap, particles, camera | ~1.5k |
| `godot-3d` | 3D lighting, materials, world, physics, nav, procgen | ~1.5k |
| `godot-gameplay` | Combat, inventory, quests, dialogue, save/load, abilities | ~1.5k |
| `godot-ui` | Containers, theming, rich text, input handling | ~1k |

Master reference with 96 full skills: `github.com/thedivergentai/GD-Agentic-Skills`

## Red Flags
- `get_node()` with absolute paths
- `load()` in `_process`
- Resources shared across instances without `duplicate()`
- `_process` used for movement
- Circular signal connections
