# Game Design 3D H5

## Tổng quan
Skill design cho game 3D HTML5 (Three.js / Babylon.js). Bao gồm level design 3D, lighting, camera, environment art, và UX cho không gian 3D.

## 1. Camera Systems

### Third-Person
```
      Camera
        🎥
         \
          \
        [Player] → Direction
```
- **Distance**: 5-8 units từ player
- **Height**: 2-4 units phía trên
- **Lerp**: Smooth follow với lerp 0.05-0.1
- **Collision**: Camera không xuyên tường (dùng raycast)

### First-Person (FPS)
```
    [Camera] ← → (mouse look)
       |
    [Body]
```
- **FOV**: 70-90 (mặc định 75)
- **Sensitivity**: 0.001-0.003
- **Head bob**: Nhẹ khi chạy (sin wave ±0.02)
- **Weapon offset**: Góc dưới phải màn hình

### Top-Down / Isometric 3D
```
        🎥
         |
    [Game World]
```
- **Orthographic camera** cho chiến thuật
- **Perspective** cho 3D thật
- Góc 45-60 độ cho strategy

## 2. Level Design 3D

### Environment Layout
```
[Player Spawn] → [Corridor] → [Open Area] → [Boss Arena]
      ↑                            ↑              ↑
  Tutorial zone              Combat zone     Challenge zone
```

### Modular pieces
```
Tạo level từ các module ghép lại:
├── Floor (4×4, 8×8, 16×16)
├── Wall (4×2, 8×2, 4×4)
├── Corner
├── Doorway
├── Window
├── Stair (up/down)
└── Pillar
```

### Height map cho terrain

Xem: `templates/terrain-generator.ts`

## 3. Lighting Design

### Time of day system

Xem: `templates/time-of-day.ts`

### Lighting mood guide
| Mood | Setup | Use case |
|------|-------|----------|
| Sáng, vui | Sun cao, ambient 0.5, bóng mềm | Outdoor, platformer |
| Tối, horror | Sun thấp, ambient 0.1, fog dày | Horror, dungeon |
| Ấm cúng | Point light vàng, ambient 0.3 | Indoor, hub |
| Neon | Multiple point lights màu, ambient 0.2 | Cyberpunk, sci-fi |
| Huyền ảo | Hemisphere + rim light | Fantasy, magical |

## 4. UI trong không gian 3D

### World-space UI (billboard)

Xem: `templates/ui-billboard.ts`

## 5. Sound Design cho 3D

### Positional audio

Xem: `templates/PositionalAudio3D.ts`

## 6. Performance Targets (WebGL)

| Target | Desktop | Mobile |
|--------|---------|--------|
| FPS | 60 | 30+ |
| Draw calls | < 500 | < 200 |
| Triangles | < 200K | < 50K |
| Textures | < 2048×2048 | < 1024×1024 |
| Lights | < 4 dynamic | < 2 dynamic |
| Shadows | 2048 map | 1024 map |

### Optimization tips
- **Instancing**: Dùng `InstancedMesh` cho nhiều object giống nhau (cây, đá)
- **Texture atlas**: Gộp nhiều texture nhỏ vào 1 atlas
- **Compression**: Dùng Draco compressed geometry
- **LOD**: 3 levels, fade ở 20 và 50 units
- **Occlusion culling**: Không render object bị che khuất

## 7. Testing Checklist

- [ ] FPS ổn định trên target device
- [ ] Camera không xuyên tường / floor
- [ ] Collision detection chính xác
- [ ] Lighting + shadows đẹp
- [ ] Audio 3D hoạt động (trái/phải, xa/gần)
- [ ] UI billboard luôn hướng về camera
- [ ] Resize mượt
- [ ] Touch controls (joystick ảo) cho mobile

### Tham khảo
- Implementation: `game-h5-3d.md`
- Main game skill: `skills/games-core/SKILL.md`
