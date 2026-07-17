---
name: godot-2d
description: Godot 4.x 2D systems — CharacterBody2D, physics, animation, tilemap, particles, camera, tweening. Token-optimized ~1.5k.
---

# godot-2d — 2D Systems

## CharacterBody2D Movement

```gdscript
extends CharacterBody2D
@export var speed := 200.0
@export var jump_velocity := -400.0

func _physics_process(delta: float) -> void:
    if not is_on_floor():
        velocity += get_gravity() * delta
    var dir := Input.get_axis("left", "right")
    if dir:
        velocity.x = dir * speed
    else:
        velocity.x = move_toward(velocity.x, 0, speed)
    move_and_slide()
```

**Pro patterns**: Coyote time (0.1s grace after leaving ledge), jump buffer (0.15s input queue), variable jump height (release early = short jump).

## 2D Physics
- `collision_layer` = what I am, `collision_mask` = what I detect
- Use `Area2D` for triggers (body_entered/body_exited)
- Use `PhysicsDirectSpaceState2D.intersect_ray()` over RayCast2D for 100x perf
- Spatial hash for 1000+ objects; avoid Area2D overlap checks at scale

## Animation
- `AnimatedSprite2D` + `SpriteFrames` for simple frame anims
- `AnimationPlayer` + `AnimationTree` + `StateMachine` for complex blending
- StringName constants for animation names: `const ANIM_IDLE := &"idle"`
- Root motion: `AnimationTree.get_root_motion_position()` for physics-synced movement

## TileMap
- Use autotiling/terrains for natural-looking levels
- Runtime tile modification: `set_cells_terrain_connect()`
- Chunk large maps into sub-TileMap nodes for culling

## Particles (2D)
- `GPUParticles2D` for 2000+ particles, `CPUParticles2D` for compatibility
- Set `visibility_aabb` manually to prevent culling
- Use `one_shot = true` for explosions, `restart()` to replay

## Camera
- `Camera2D` with `position_smoothing` for smooth follow
- Trauma shake: random offset = `trauma^2 * max_shake`, decay each frame
- Deadzone/drag margins for platformers

## Tweening
- `get_tree().create_tween().tween_property(node, "modulate", Color.TRANSPARENT, 0.5)`
- Easing: `set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)` for juice
- Kill tweens in `_exit_tree()` to prevent orphaned tweens

Upstream: `github.com/thedivergentai/GD-Agentic-Skills/skills/godot-2d-animation`, `godot-2d-physics`, `godot-characterbody-2d`, `godot-tilemap-mastery`, `godot-particles`, `godot-camera-systems`, `godot-tweening`
