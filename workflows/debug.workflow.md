# Workflow Gỡ lỗi — Sửa lỗi & Tối ưu

> **LUẬT:** UI text sau fix vẫn là **tiếng Việt**.
> Debug game: dùng headless test — không cần browser. Xem `skills/games-testing/`.
> Eval assertions: `skills/games-testing/templates/game-eval-schema.ts` để verify chất lượng.

## Quy trình (7 bước + verify gate)

| # | Bước | Làm | Verify Gate |
|---|------|-----|-------------|
| 0 | Bình tĩnh | Đọc lỗi kỹ, đừng vội fix | Xác định được loại lỗi |
| 1 | Phân loại | Xác định loại (bên dưới) | Chọn đúng workflow phụ |
| 2 | Tái hiện | Minimal reproduction + log | Reproduce 100% với input biết trước |
| 3 | Khoanh vùng | Error→File→Stack→Input→Logic | Tìm đúng function gây lỗi |
| 4 | Root cause | Rubber duck / Binary search / Hypothesis | Giải thích được "tại sao" |
| 5 | Fix ngắn nhất | Sửa + verify (test, typecheck) | Test pass, không break code khác |
| 6 | **Làm đẹp** | Polish visual, animation, UX, performance | Game nhìn chuyên nghiệp, mượt |
| 7 | Prevent | Unit test, error boundary, validation | Bug không tái phát với test |

### Bước 1 — Phân loại chi tiết (General)

| Loại | Cách debug | Công cụ |
|------|-----------|---------|
| Runtime | Stack trace từ dưới lên | Error log |
| Logic | Step-by-step, print log | Unit test |
| Build | Đọc dòng báo lỗi | Compiler output |
| Network | Kiểm tra request/response | MSW mock |
| Performance | Profiling, benchmark | `console.time` |
| Security | Chạy security checklist | `skills/webs-security/SKILL.md` |
| Database | EXPLAIN ANALYZE | Query log |
| UX | Responsive, dark mode, a11y | DevTools |

### Bước 1 — Phân loại game (2D / 2.5D / 3D)

| Loại game bug | Cách debug | Skill + Eval |
|---------------|-----------|-------------|
| Physics (AABB, raycast, gravity) | Log collision pairs, velocity debug | `games-physics`, `assertPhysicsStable` |
| FSM animation (idle/run/jump/attack) | Log state transitions, check edge cases | `games-2d`, `assertFSM` |
| Rendering (camera, lighting, shader) | Check frustum, LOD levels, draw calls | `games-3d`, `games-optimization` |
| Asset (sprite missing, texture broken) | Network tab, file path, format support | `games-assets` |
| Audio (pool, spatial, format) | Mock AudioContext, check fallback | `games-audio`, `assertAudioPlay` |
| Pool (bullet, enemy, object) | Count acquire/release, max overflow | `games-optimization`, pool test |
| Scene lifecycle (create→update→destroy) | Hook lifecycle hooks, check clean up | `games-core` |
| Performance (FPS drop, memory leak) | Benchmark test, diff memory | `games-testing`, `assertFPS`, `assertMemoryLeak` |
| Input (touch, keyboard, gamepad) | Simulate input, check responsiveness | `games-core`, `assertInputResponsive` |
| Isometric (tile coord, depth sort) | Log coord conversion, sort order | `games-isometric` |
| Racing (physics drift, spline, cam clip) | Check CCD, velocity, camera bounds | `games-3d`, `assertCheckpointTrigger` |

### Bước 6 — Làm đẹp (Polish Pipeline — bắt buộc cho game)

Sau khi fix bug, **bắt buộc** phải chạy polish để game đẹp như AI Studio làm:

| Hạng mục | Hành động | Verify |
|----------|-----------|--------|
| **Visual** | Check color palette, lighting, particles, screen shake | Load `color-palettes.ts`, `lighting.ts` |
| **UI/HUD** | Health bar, score, timer, pause menu, game over | DOM test — đẹp, responsive, font hợp |
| **Animation** | FSM transitions mượt (idle→run→jump→attack→hurt→die) | `assertFSM` — không giật, không treo |
| **Camera** | Follow player mượt, không clip, screen shake | `assertPhysicsStable` — camera bounds |
| **Audio** | SFX + BGM, fallback format, spatial 3D, pool | `assertAudioPlay` — không silent |
| **Performance** | 60 FPS desktop, 30 FPS mobile, no memory leak | `assertFPS`, `assertMemoryLeak` |
| **Input** | Touch (44px min), keyboard, gamepad, justPressed | `assertInputResponsive` — 0 delay |
| **Particle** | Hit, explosion, trail, heal — đẹp, pool reuse | Visual inspect — không leak |
| **Tilemap** (2D) | Collision layers, parallax, sorting | Tilemap test — không gap |
| **Lighting** (3D) | Shadow 1024²/2048², ambient + directional + point | Draw calls < 200 |
| **Screen Shake** | Hit, explosion, landing — nhẹ, không rung quá | Not dizzy |
| **Loading** | Progress bar, preload scene, PWA offline | Load < 3s trên 3G |

### Eval Assertions — Kiểm tra game không "cùi"

Dùng `game-eval-schema.ts` để verify chất lượng sau fix:

```typescript
import { assertGameInit, assertPhysicsStable, assertCheckpointTrigger, assertFPS, assertMemoryLeak, assertFSM, assertAudioPlay, assertInputResponsive, generateReport } from "skills/games-testing/templates/game-eval-schema";
```

Chạy grader để auto-verify:
```bash
npx vitest run --reporter=json > eval-report.json
node _shared/scripts/game-gen/eval-grader.js --input eval-report.json --threshold 0.85
```

### Debug frontend (không cần browser)

| Loại | Cách debug |
|------|-----------|
| DOM/UI | Log output + console.log injection |
| Logic | Unit test reproduction → `npx vitest run --reporter=verbose` |
| Network | Mock API (`MSW` / `vi.fn()`) |
| State | Log FSM transitions |
| Behaviour | Minimal reproduction → test từng bước |
| **Game** | Headless test: Phaser.HEADLESS / Three.js headless renderer |

## AI Studio Quality Standard

Mọi fix game **phải đạt** các tiêu chuẩn này trước khi báo done:

| Tiêu chí | 2D | 2.5D Isometric | 3D |
|----------|-----|-----------------|-----|
| FPS | ≥ 58 desktop / ≥ 30 mobile | ≥ 55 desktop / ≥ 28 mobile | ≥ 55 desktop / ≥ 25 mobile |
| Draw calls | — | — | < 200 |
| Load time | < 2s | < 2.5s | < 3s |
| Memory leak | < 300KB/5min | < 400KB/5min | < 500KB/5min |
| Animation | FSM mượt, 8 state | FSM mượt, 6 state | FSM mượt, blend tree |
| UI | Responsive, touch 44px | Responsive, font rõ | Responsive, HUD 3D |
| Audio | Pool 16, fallback ogg/mp3 | Pool 16, spatial 2.5D | Pool 32, spatial 3D |
| Eval threshold | ≥ 0.9 | ≥ 0.85 | ≥ 0.85 |

### Checklist làm đẹp style AI Studio
- [ ] Game không lỗi visual (missing texture, z-fighting, flicker)
- [ ] Animation mượt, không treo state, không giật
- [ ] HUD/UI đẹp: font đọc được, icon rõ, responsive
- [ ] Audio không silent, có fallback format
- [ ] Performance: FPS đạt chuẩn, không giật
- [ ] Camera mượt, không clip, follow đúng
- [ ] Input responsive, touch đủ lớn
- [ ] Loading có progress bar / spinner
- [ ] Eval assertions pass threshold ≥ 0.85
- [ ] Game nhìn chuyên nghiệp — "like AI Studio made this"

## Anti-Rationalization (cấm)

| Excuse | Reality |
|--------|---------|
| "Chỉ là warning nhỏ, không sao" | Warning hôm nay = crash ngày mai ở edge case |
| "Sẽ viết test sau" | Không ai viết test sau — trust me bro |
| "Log là đủ, không cần minimal repro" | Log không cho thấy input → không reproduce → guess fix |
| "Fix một dòng, không cần typecheck" | Typecheck catch 70% bugs — skip = Russian roulette |
| "Lỗi UI không ảnh hưởng logic" | UX fail = user không dùng được tính năng |
| "Debug performance không cần benchmark" | "Cảm giác chậm" không phải data |
| "Game 2D không cần polish, đơn giản mà" | Không polish = game xấu, ai cũng làm được |
| "Physics fix xong, không cần test" | Physics bug không test = production crash |
| "FPS thấp nhưng chơi được" | < 30 FPS = user không muốn chơi |
| "Skip eval assertions, nhìn đẹp rồi" | Eval phát hiện bug mắt thường không thấy |

## Red Flags

- Lỗi runtime mà không đọc stack trace
- Fix mà không verify (test/typecheck)
- Bug tái phát → thiếu root cause analysis
- Minimal reproduction > 30 dòng
- Sửa 1 file nhưng ảnh hưởng 5 file khác
- Log output không có prefix layer `[T1]`, `[T2]`, ...
- **Game**: FPS < threshold, eval < 0.85, bỏ qua polish
- **Game**: Physics bug fix không viết test → 100% tái phát

## CLI Output
Xem `skills/ui-ux/SKILL.md` (CLI Design System section) — symbol set, 4-tier layout, contract format, anti-patterns, pre-delivery checklist.

## Verification
- [ ] Bug loại đã xác định, workflow phụ đúng
- [ ] Minimal reproduction step-by-step
- [ ] Root cause doc + fix ngắn nhất
- [ ] Test confirm fix, không regression
- [ ] **Game: polish pipeline đã chạy** — visual, performance, UX
- [ ] **Game: eval assertions pass threshold ≥ 0.85**
- [ ] CLI output format theo skills/ui-ux/SKILL.md
