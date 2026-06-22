---
name: games-assets
description: Free game assets + auto-download. 2D sprites, 3D models, 2.5D tiles, sounds, fonts. Animation-ready — idle/run/jump/attack/hurt/death states.
---

# games-assets — Free Game Assets & Auto-Download

Skill này cung cấp nguồn assets free hợp pháp và script tự động download, setup animation states cho game 2D/2.5D/3D.

## Nguồn Asset
Xem danh sách đầy đủ: `templates/asset-sources.md`

Nguồn chính: **Kenney** (CC0, sprites/audio/3D), **OpenGameArt** (CC0), **Poly Pizza** (CC0, 3D), **Quaternius** (CC0, 3D), **Sketchfab** (CC0/CC-BY), **Mixamo** (free animations), **Freesound** (audio).

## Script Tự động Tải xuống
```
# 2D: _shared/scripts/download-games-assets.ps1 -AssetType "2d" -GameStyle "platformer"
# 3D: _shared/scripts/download-games-assets.ps1 -AssetType "3d"
# 2.5D: _shared/scripts/download-games-assets.ps1 -AssetType "2.5d"
```
Fallback: procedural generation — vẽ shape bằng code, Web Audio API sinh âm thanh.

## Animation States
Mọi entity: `idle`, `run`, `jump`, `attack`, `hurt`, `die`.

### 2D Spritesheet
```
player.png: idle(0-3) → run(4-9) → jump(10-12) → attack(13-17) → hurt(18-19) → die(20-23)
```
Xem: `templates/animation-config.ts`, `templates/entity-fsm.ts`

### 3D
| State | Clip | Looping |
|-------|------|---------|
| idle | Idle | Yes |
| run | Running/Walk | Yes |
| jump | Jump | No |
| attack | Punch/Slash | No |
| hurt | Hit/Hurt | No |
| die | Death/Dying | No |

Xem: `templates/animation-controller.ts`

## Templates
- `templates/sound-manager.ts` — SoundManager load + fallback
- `templates/sound-integration.ts` — Gắn vào game loop
- `templates/sfx-map.ts` — Audio mapping theo state
- `templates/placeholders.ts` — Procedural fallback khi không có assets
