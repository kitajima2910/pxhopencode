---
name: godot-3d
description: Godot 4.x 3D systems — lighting, materials, world building, physics, navigation, procedural generation. Token-optimized ~1.5k.
---

# godot-3d — 3D Systems

## Lighting
- `DirectionalLight3D` for sun — shadow cascades, bias tuning to avoid acne
- `AreaLight3D` (4.7+) for rectangular soft lights — better than emissive+GI hacks
- GI choice: VoxelGI for interiors, SDFGI for open world, LightmapGI for static baked
- Max 2 shadow-casting DirectionalLights; use fake bounce for mobile

## Materials (PBR)
- `StandardMaterial3D`: ORM texture packing (AO+Roughness+Metal) saves GPU cache
- Transparency: `ALPHA_SCISSOR` for cutout (leaves/fences), `ALPHA` for glass
- `ShaderMaterial` for custom effects; use shader params for runtime tuning

## World Building
- `GridMap` + `MeshLibrary` for modular levels — `set_cell_item()` for runtime edits
- `CSG` for prototyping — NEVER animate CSG nodes (CPU-heavy geometry recalc)
- `WorldEnvironment` + `ProceduralSkyMaterial` + volumetric fog for atmosphere

## 3D Physics
- `CharacterBody3D` for player/NPC — `move_and_slide()`, `is_on_floor()`
- `RigidBody3D` for physics objects — Jolt physics (4.7 default) for stability
- Raycasts: `PhysicsDirectSpaceState3D.intersect_ray()` over RayCast3D nodes
- Ragdolls: `PhysicalBone3D` + `Skeleton3D` — trigger on death

## Navigation
- `NavigationAgent3D` + `NavigationRegion3D` for pathfinding
- Async NavMesh baking: `NavigationServer3D.parse_source_geometry_data()` + `bake_from_source_geometry_data_async()`
- RVO avoidance built into NavigationAgent — set `target_position` every frame
- NEVER bake NavMesh on main thread; NEVER query path for all units every frame

## Procedural Generation
- `FastNoiseLite` with fixed seed for deterministic worlds
- Chunk loading off main thread via `WorkerThreadPool`
- Dirty Chunk system: only regenerate changed chunks, not entire map
- `MultiMeshInstance` for thousands of static objects (grass, rocks, trees)

Upstream: `github.com/thedivergentai/GD-Agentic-Skills/skills/godot-3d-lighting`, `godot-3d-materials`, `godot-3d-world-building`, `godot-physics-3d`, `godot-navigation-pathfinding`, `godot-procedural-generation`
