# Workflow Game — Phát triển game HTML5 Pro

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Animation state (`idle`, `run`, `jump`) = tiếng Anh.
> Testing dùng Vitest headless — không cần chạy dev server. Xem `skills/games-testing/`.
> **Genre Reference**: trước khi code bất kỳ game nào, đọc `skills/_shared/game-genre-reference.md` → dùng Decision Tree để chọn đúng category.
> **Black-box scripts**: `_shared/scripts/game-gen/` — chạy `--help` để dùng (không đọc source). Sinh physics config, spline track, eval grading.
> **Eval assertions**: dùng `game-eval-schema.ts` + `eval-grader.js` để verify quality.

## Bước 0: Download assets (AUTO)
```powershell
powershell.exe -ExecutionPolicy Bypass -File "_shared/scripts/download-games-assets.ps1" -AssetType "2d" -GameStyle "platformer"
# GameStyle: platformer, rpg, shooter, racing, puzzle, horror, shmup, strategy, adventure
```

## Bước 1: Chọn loại game & engine

| Loại | Engine | Skill | Ghi chú |
|------|--------|-------|---------|
| 2D | Phaser 3 | `games-2d` | Platformer, top-down, shooter |
| 2.5D | Isometric + Phaser | `games-isometric` | Strategy, RPG |
| 3D | Three.js | `games-3d` | FPS, TPS, adventure |
| 3D Racing | Three.js + Cannon-es | `games-3d` | **Marble racing**, physics-based ball, spline track. Xem `game-design-h5-marble-racing.md` |

## Bước 2: Scaffold & Run
```bash
# Tạo project từ templates
npm init -y
npm install -D vite
# .gitignore — luôn có .opencode/ + .github/
cp _shared/templates/gitignore-template.md ../.gitignore
```

Tuỳ thể loại:

| Loại | Install | Templates |
|------|---------|-----------|
| 2D (Phaser) | `npm install phaser` | `cp -r skills/games-2d/templates/* src/` |
| 3D (Three.js) | `npm install three @types/three` | `cp -r skills/games-3d/templates/* src/` |
| **3D Racing** | `npm install three cannon-es` | Dùng `game-h5-3d-marble-racing.md` làm reference |

```html
<!-- index.html -->
<script src="/src/main.ts" type="module"></script>
```
Setup testing ngay:
```bash
cp skills/games-testing/templates/vitest.config.ts ./
cp skills/games-testing/templates/three-test-helper.ts src/test-helper.ts  # 3D
npm install -D vitest happy-dom
```

## Bước 3: Test Iteration Loop (headless)
Sau mỗi feature, viết test headless để verify logic:

| Feature xong | Verify bằng test |
|-------------|-----------------|
| Scene/Map | `npx vitest run` — check scene lifecycle (create→update→destroy) |
| Player movement | Unit test: kiểm tra x/y sau simulate input |
| Animation | state machine test — FSM transitions idle→run→jump→attack |
| UI/HUD | DOM test: check hp bar, score text, timer, speed |
| Audio | `AudioContext` mock — play/stop/restart không throw |
| Physics | AABB collision test — edge cases overlap/separate |
| **Racing: Ball force** | Kiểm tra velocity > 0 sau khi apply force |
| **Racing: Fall respawn** | Ball Y < -5 → reset về checkpoint gần nhất |
| **Racing: Checkpoint** | Ball gần checkpoint → trigger event "checkpoint" |
| **Racing: Timer** | elapsed ≈ real time sau simulate |
| **Racing: Spline track** | Track curve generated, wall + floor mesh tồn tại |

## Bước 4: Polish Pipeline (làm đẹp — bắt buộc)

| Hạng mục | Chi tiết trong skill |
|----------|---------------------|
| Visual Polish | `games-2d/templates/color-palettes.ts`, `screen-shake.ts`, `games-3d/templates/lighting.ts`, `games-optimization/templates/object-pool.ts` |
| UX Polish | `InputManager.justPressed`, `Phaser.Scale.FIT`, pause menu, game over, HUD (`HealthBar.ts`), tutorial, vibration |
| Racing Polish | Timer (mm:ss.ms), speed (km/h), checkpoint progress, countdown 3-2-1-GO, touch tilt |
| Code Polish | Object pool, FSM, FPS counter (`performance.now()`), memory check (`memory-leak.test.ts`) |

Xem chi tiết: `skills/games-2d/SKILL.md`, `skills/games-3d/SKILL.md`, `skills/games-optimization/SKILL.md`, `skills/games-audio/SKILL.md`

## Bước 5: Quality Gate

### Runtime Checks (Headless)
```bash
npx vitest run              # Unit tests
npx vitest --coverage       # Coverage ≥ 80%
npx vitest src/performance-benchmark.test.ts  # FPS + memory benchmark
```

Quality passes khi:
- ✅ Unit tests pass
- ✅ Coverage ≥ 80%
- ✅ Performance benchmark: FPS ≥ 55 (desktop) | ≥ 30 (mobile)
- ✅ Memory leak test: diff < 500KB sau 5 phút simulate
- ✅ No console.error thrown trong test

### Automation Tests
Xem `skills/games-testing/SKILL.md` — checklist đầy đủ: FSM, collision, pool, scoring, health, spawn, audio, lifecycle.

### Game-Specific Review Checklist
Xem `skills/games-testing/SKILL.md` + `skills/games-optimization/SKILL.md`:
- **Performance**: Draw calls < 200 (3D), texture atlas, shadow map 1024²/2048², LOD, frustum culling
- **Quality**: Loading < 3s, memory leak < 500KB, audio fallback, touch ≥ 44px
- **Racing**: Physics stability (CCD), camera không clip, track không gap

## Bước 6: PWA + Build & Deploy
```bash
npm run build  # dist/
```

Xem: `skills/games-pwa/SKILL.md`, `skills/games-deploy/SKILL.md`

Targets: GitHub Pages (Actions), Itch.io (Butler), Vercel, Netlify, hoặc copy `dist/` thủ công.

Pre-deploy: build success, < 10MB, source maps tắt, PWA ≥ 90, FPS ≥ 55/30, responsive 3 sizes.

## Anti-Rationalization
| Excuse | Reality |
|--------|---------|
| "Bỏ qua genre reference, game đơn giản mà" | Thiết kế sai thể loại → core loop không fun |
| "Polish pipeline sau, MVP trước" | Không polish = game xấu, user không chơi |
| "Headless test không cần, chơi tay đủ" | Bug physics/collision lên production |

## Red Flags
- Genre reference không đọc trước khi code
- Asset download script không chạy
- Quality gate: FPS < 55 hoặc coverage < 80%

## Verification
- [ ] Genre reference đọc, đúng category
- [ ] Asset downloaded, animation states (idle/run/jump/attack/hurt/die)
- [ ] Quality pass: unit test, coverage, FPS, memory leak

## Game Design & References
- **Genre Reference (mọi thể loại)**: `skills/_shared/game-genre-reference.md`
- 2D design: `skills/games-2d/game-design-h5-2d.md`
- 3D design: `skills/games-3d/game-design-h5-3d.md`
- 3D Racing design: `skills/games-3d/game-design-h5-marble-racing.md`
- 3D Racing implementation: `skills/games-3d/game-h5-3d-marble-racing.md`
- 2.5D design: `skills/games-isometric/game-design-h5-2.5d.md`
- Assets: `skills/games-assets/SKILL.md`
- Performance: `skills/games-optimization/SKILL.md`
- Testing: `skills/games-testing/SKILL.md`
- PWA: `skills/games-pwa/SKILL.md`
- Deploy: `skills/games-deploy/SKILL.md`
