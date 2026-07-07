# Marble Racing 3D — Game Design

## 1. Core Gameplay Loop

| Phase | Mô tả |
|-------|-------|
| Start | Ball ở vạch xuất phát, đếm ngược 3-2-1-GO |
| Play | Điều khiển ball lăn qua track, vượt chướng ngại vật |
| Checkpoint | Ball đi qua checkpoint → lưu progress + hiệu ứng |
| Fall | Rớt khỏi track → respawn ở checkpoint gần nhất |
| Finish | Qua vạch đích → hiện thời gian + unlock country mới |
| Menu | Chọn country, xem best time, settings |

## 2. Controls

| Platform | Điều khiển |
|----------|-----------|
| Desktop | WASD / Arrow keys — force đẩy ball theo hướng camera |
| Mobile | Touch tilt — nghiêng điện thoại để đổi hướng |
| UI | Pause (ESC), Restart (R), Camera toggle (C) |

Camera-relative steering: nhấn W = ball lăn về phía trước theo hướng camera đang nhìn, không phải theo world axis.

## 3. Physics System (Cannon-es)

| Property | Value | Purpose |
|----------|-------|---------|
| Ball mass | 1 | Cảm giác nặng nhẹ |
| Ball radius | 0.5 | Kích thước chuẩn |
| Linear damping | 0.05 | Giảm tốc tự nhiên |
| Angular damping | 0.1 | Chống xoay vô hạn |
| Friction | 0.3 | Bám mặt đường |
| Restitution | 0.2 | Nảy nhẹ khi va chạm |
| Max speed | 15 | Giới hạn tốc độ |
| Force | 0-20 | Tỉ lệ với input |

**Anti-bounce**: Khi ball ở trên mặt phẳng và vận tốc Y gần 0 → lock Y velocity = 0 để ball không nảy lẻ tẻ.

## 4. Camera System

| Mode | Behavior |
|------|----------|
| Follow | Behind ball + height offset 3, distance 6, lerp 0.05 |
| Look-ahead | Camera nhìn về phía trước theo hướng ball + velocity |
| Respawn | Camera teleport về ball khi respawn |
| Finish | Camera orbit quanh ball khi qua đích |

```typescript
// Smooth follow với look-ahead
const targetPos = ball.position.clone()
  .add(new THREE.Vector3(0, 3, 0))
  .sub(forward.clone().multiplyScalar(6));
camera.position.lerp(targetPos, 0.05);
camera.lookAt(ball.position);
```

## 5. Track Design

| Type | Mô tả |
|------|-------|
| Straight | Đường thẳng, tăng tốc |
| Curve | Rẽ trái/phải, giảm tốc + drift |
| Ramp | Nhảy lên cao, ball bay |
| Loop | Vòng xoay 360°, cần đủ speed |
| Obstacle | Barrel, cone, wall — né hoặc đập vỡ |
| Tunnel | Đường hầm tối + lighting effect |
| Off-road | Giảm friction → trơn trượt |

Track được xây dựng từ **spline curve** — array các control point → CatmullRomCurve3 → sinh mesh wall + floor dọc theo curve.

### Track Components
```
[Start] → [Straight] → [Curve L] → [Ramp] → [Obstacle] → [Tunnel] → [Loop] → [Straight] → [Finish]
```

Mỗi segment có: width 4, wall height 1.5, wall thickness 0.3. Wall tự động sinh dọc theo curve normal.

## 6. Country Theming

| Country | Palette | Decorations | Music Style |
|---------|---------|-------------|-------------|
| Việt Nam | Đỏ + Vàng | Cờ đỏ sao vàng, nón lá, lúa | Nhạc dân gian |
| Nhật Bản | Đỏ + Trắng | Cờ Nhật, đèn lồng, hoa anh đào | Traditional |
| Pháp | Xanh + Trắng + Đỏ | Tháp Eiffel mini, baguette | Accordion |
| Ai Cập | Vàng + Nâu | Kim tự tháp, tượng, sa mạc | Middle Eastern |
| Brazil | Xanh + Vàng + Xanh lá | Tượng Christ, rừng | Samba |
| Bắc Cực | Trắng + Xanh nhạt | Tuyết, băng, đèn aurora | Ambient |

Track decoration: các model nhỏ đặt dọc track theo theme. Dùng instancing để performance.

## 7. UI/HUD

| Element | Vị trí | Mô tả |
|---------|--------|-------|
| Timer | Top-center | Đếm giờ:mm:ss.ms |
| Speed | Bottom-right | Tốc độ hiện tại (km/h) |
| Lap / Checkpoint | Top-right | Checkpoint X / Tổng |
| Best time | Top-left | Best time của track này |
| Progress bar | Top | % đường đã đi |
| Countdown | Center | 3-2-1-GO overlay |

## 8. Feedback Systems

| Sự kiện | Visual | Audio |
|---------|--------|-------|
| Ball roll | Particle trail theo ball | Rolling sound (loop) |
| Checkpoint | Green flash + text "+CP" | Checkpoint ding |
| Fall off camera | Red flash + slow-mo 0.3s | Whoosh down |
| Respawn | Fade in + particle burst | Teleport sound |
| Finish | Confetti + camera orbit | Victory fanfare |
| Speed boost | Speed line VFX | Wind sound |
| Wall hit | Spark particle | Bump sound |

## 9. Level Design Progression

| Level | Difficulty | Features mới |
|-------|-----------|-------------|
| 1-1 (VN) | Tutorial | Straight + gentle curve |
| 1-2 (VN) | Easy | Curve + ramp |
| 2-1 (JP) | Medium | Obstacle + tighter curve |
| 2-2 (JP) | Medium | Tunnel + loop |
| 3-1 (FR) | Hard | Narrow track + off-road |
| 3-2 (FR) | Hard | Complex obstacles + ramps |
| 4 (EG) | Expert | Long track, all mechanics |
| 5 (BR) | Master | Marathon track, no checkpoint |

Mỗi country có 2-3 track. Unlock: hoàn thành track trước với time < par time.

## 10. Technical Constraints

| Metric | Target |
|--------|--------|
| FPS | 60 (desktop) / 30+ (mobile) |
| Draw calls | < 100 |
| Physics steps | 60 Hz fixed timestep |
| Ball mesh | < 500 triangles |
| Track segment | 200 max per track |
| Decoration instances | < 1000 per track |
| Audio sources | < 8 concurrent |
| Load time | < 3s (3G) |

## References
- Implementation: `game-h5-3d-marble-racing.md`
- 3D base: `game-h5-3d.md`
- Physics: `skills/games-physics/SKILL.md`
- Testing: `skills/games-testing/SKILL.md`
- Performance: `skills/games-optimization/SKILL.md`
