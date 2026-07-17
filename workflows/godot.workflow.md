# Workflow Godot — Phát triển game Godot 4.x Pro

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Code GDScript = tiếng Anh.
> **Token Efficiency**: Load `godot-master` trước. Load domain skill cụ thể (không load all). Upstream: `github.com/thedivergentai/GD-Agentic-Skills` (96 skills chi tiết).

## Bước 0: Init project
```bash
mkdir my_game && cd my_game
# Tạo project.godot với Godot 4.x
# Feature-driven folder: features/player/, features/enemies/, features/ui/
# .gitignore có .godot/, export/, .opencode/
```

## Bước 1: Chọn skill

| Feature | Skill | Upstream ref |
|---------|-------|-------------|
| 2D player, physics, tilemap | `godot-2d` | characterbody-2d, 2d-physics, tilemap-mastery |
| 3D world, lighting, nav | `godot-3d` | 3d-lighting, physics-3d, navigation-pathfinding |
| Combat, inventory, save | `godot-gameplay` | combat-system, inventory-system, save-load-systems |
| UI, menus, input | `godot-ui` | ui-containers, input-handling, ui-theming |

## Bước 2: Architecture (Layer Cake)

```
features/player/
  player.tscn
  player.gd          # extends CharacterBody2D/3D
  player_stats.tres  # Resource data
  components/
    health_component.gd
    movement_component.gd
features/ui/
  hud.tscn
  hud.gd              # Listens to signals, NEVER references player directly
autoload/
  global_signal_bus.gd  # < 15 events (player_died, score_changed, etc.)
  save_manager.gd
```

## Bước 3: Code Loop
1. Load skill SKILL.md (batch read — không load từng file)
2. Code entity → signal → data → test
3. F6 test: "Run Current Scene" không crash
4. Mỗi feature xong → kiểm tra bằng Godot unit test (GUT framework)

## Bước 4: Performance Check
- Profiler open: script time < 8ms (desktop) / < 4ms (mobile)
- Draw calls < 500 (desktop 3D) / < 200 (mobile)
- Không có orphan nodes trong Profiler → Objects tab
- `load()` chỉ dùng ngoài hot-path — `preload` trong mọi vòng lặp

## Bước 5: Quality Gate
- [ ] F6 test pass: mỗi scene chạy độc lập được
- [ ] Signal Bus < 15 events
- [ ] No absolute `get_node()` paths — dùng `%UniqueName`
- [ ] `_process` không chứa `load()`, `get_nodes_in_group()`, physics logic
- [ ] Resources không shared giữa instances (kiểm tra "Local to Scene")

## Bước 6: Build & Export
```bash
godot --headless --export-release "Windows Desktop" ./build/game.exe
```
Xem `skills/godot-master` → Export Builds (upstream refs)

## Anti-Rationalization
| Excuse | Reality |
|--------|---------|
| "Skip architecture, code nhanh" | Scene coupling = bug chain, không scale được |
| "Không cần signal bus" | 5 node call chéo nhau = debug nightmare |
| "Load hết skill cho chắc" | Context Storm = agent mất focus, tốn tokens |

## Red Flags
- `get_node()` absolute path
- `_process` chứa `load()` hoặc physics
- Resources shared mà không duplicate
- UI gọi trực tiếp `player.health -= 1`

## References
- **Master**: `skills/godot-master/SKILL.md`
- **2D**: `skills/godot-2d/SKILL.md` → upstream: characterbody-2d, 2d-physics, tilemap
- **3D**: `skills/godot-3d/SKILL.md` → upstream: 3d-lighting, physics-3d, navigation
- **Gameplay**: `skills/godot-gameplay/SKILL.md` → upstream: combat, inventory, quest, save
- **UI**: `skills/godot-ui/SKILL.md` → upstream: containers, theming, input
- **Upstream full library**: `github.com/thedivergentai/GD-Agentic-Skills`
