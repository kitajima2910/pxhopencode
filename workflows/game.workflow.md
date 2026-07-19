# Workflow Game — Phát triển game HTML5 Pro

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Animation state (`idle`, `run`, `jump`) = tiếng Anh.
> Testing dùng Vitest headless — không cần chạy dev server. Xem `skills/games-testing/`.
> **Genre Reference**: trước khi code bất kỳ game nào, đọc `skills/_shared/game-genre-reference.md` → dùng Decision Tree để chọn đúng category.
> **Black-box scripts**: `_shared/scripts/game-gen/` — chạy `--help` để dùng (không đọc source). Sinh physics config, spline track, eval grading.
> **Eval assertions**: dùng `skills/games-testing/templates/game-eval-schema.ts` + `eval-grader.js` để verify quality.

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
| 3D Racing | Three.js + Cannon-es | `games-3d` | Marble racing, physics-based ball, spline track |

## Bước 2: Scaffold & Run
```bash
npm init -y
npm install -D vite
cp _shared/templates/gitignore-template.md ../.gitignore
```

Tuỳ thể loại:

| Loại | Install | Templates |
|------|---------|-----------|
| 2D (Phaser) | `npm install phaser` | `cp -r skills/games-2d/templates/* src/` |
| 3D (Three.js) | `npm install three @types/three` | `cp -r skills/games-3d/templates/* src/` |
| 3D Racing | `npm install three cannon-es` | Dùng game design reference |

```html
<script src="/src/main.ts" type="module"></script>
```

Setup testing ngay:
```bash
cp skills/games-testing/templates/vitest.config.ts ./
npm install -D vitest happy-dom
cp skills/games-testing/templates/game-eval-schema.ts src/eval.ts
```

## Bước 3: Test Iteration Loop (headless)
Sau mỗi feature, viết test headless để verify logic:

| Feature xong | Verify bằng test |
|-------------|-----------------|
| Scene/Map | `npx vitest run` — check scene lifecycle (create→update→destroy) |
| Player movement | Unit test: kiểm tra x/y sau simulate input |
| Animation | FSM test — transitions idle→run→jump→attack→hurt→die |
| UI/HUD | DOM test: check hp bar, score text, timer, speed |
| Audio | `AudioContext` mock — play/stop/restart không throw |
| Physics | AABB collision test — edge cases overlap/separate |
| Racing: Ball force | Kiểm tra velocity > 0 sau khi apply force |
| Racing: Fall respawn | Ball Y < -5 → reset về checkpoint gần nhất |
| Racing: Checkpoint | Ball gần checkpoint → trigger event checkpoint |
| Racing: Timer | elapsed ≈ real time sau simulate |
| Racing: Spline track | Track curve generated, wall + floor mesh tồn tại |

## Bước 4: AI Studio Polish Pipeline (làm đẹp — bắt buộc)

> **LUẬT**: Mọi game **phải** qua polish pipeline. Không polish = game cùi = reject.

### 4a — Visual Polish

| Engine | Templates | Bắt buộc có |
|--------|-----------|-------------|
| Phaser 2D | `color-palettes.ts`, `screen-shake.ts`, `particle-emitter.ts` | Parallax, particles, screen shake, color scheme |
| Isometric | `depth-sort.ts`, `fog-of-war.ts`, `tile-highlight.ts` | Depth sort, fog, highlight |
| Three.js 3D | `lighting.ts`, `post-processing.ts`, `skybox.ts` | 3-point lighting, shadow 1024², bloom/SMAA |

### 4b — UX Polish

| Hạng mục | Chi tiết |
|----------|----------|
| Input | `InputManager.justPressed`, touch ≥ 44px, key rebind |
| Scaling | `Phaser.Scale.FIT`, responsive 3 sizes (mobile/tablet/desktop) |
| Menu | Start screen, pause menu (ESC), game over (restart/quit), settings |
| HUD | Health bar, score, timer, speed, minimap — font đẹp, icon rõ |
| Tutorial | First-time overlay, tooltip, control hint |
| Loading | Progress bar, preload scene with animation |
| Feedback | Hit flash, damage number, coin pickup pop, screen shake |

### 4c — Audio Polish

| Hạng mục | Chi tiết |
|----------|----------|
| BGM | Loop music, crossfade giữa scene, volume setting |
| SFX | Jump, hit, coin, shoot, explosion, UI click — pool 16-32 |
| Spatial 3D | Pan + volume theo distance (Three.js) |
| Fallback | ogg/mp3, AudioContext resume on interaction |
| Vibration | Gamepad vibration on hit (nếu có) |

### 4d — Animation Polish

| Engine | Yêu cầu |
|--------|---------|
| Phaser 2D | FSM: idle→run→jump→attack→hurt→die, animation events, tween |
| Isometric | Rotation 8 hướng, tween movement, highlight tile |
| Three.js 3D | Blend tree, IK, animation transition, morph target |

### 4e — Performance Polish

| Hạng mục | Target |
|----------|--------|
| Object pool | Bullet, enemy, particle, coin — acquire/release, max cap |
| Texture atlas | 1 atlas = 1 draw call, < 2048×2048 |
| LOD (3D) | 3 levels, distance-based, transition không flicker |
| Frustum culling | Chỉ render object trong camera view |
| Draw calls (3D) | < 200 |
| GC tuning | Pool reuse ≤ 100 alloc/s, avoid closure in loop |

## Bước 5: Quality Gate — AI Studio Standard

### Runtime Checks (Headless)
```bash
npx vitest run              # Unit tests
npx vitest --coverage       # Coverage ≥ 85%
npx vitest src/performance-benchmark.test.ts  # FPS + memory benchmark
```

### Eval Assertions — Auto Verify
```bash
npx vitest run --reporter=json > eval-report.json
node _shared/scripts/game-gen/eval-grader.js --input eval-report.json --threshold 0.9
```

### Quality Matrix

| Tiêu chí | Standard | AI Studio Premium |
|----------|----------|-------------------|
| Unit test pass | ✅ All green | ✅ All green |
| Coverage | ≥ 80% | **≥ 85%** |
| FPS desktop | ≥ 55 | **≥ 58** |
| FPS mobile | ≥ 30 | **≥ 30** |
| Memory leak | < 500KB/5min | **< 300KB/5min** |
| Load time | < 3s | **< 2s** |
| Draw calls 3D | < 200 | **< 150** |
| Eval threshold | ≥ 0.8 | **≥ 0.9** |
| No console.error | ✅ | ✅ |
| PWA score | ≥ 80 | **≥ 90** |

## Bước 6: PWA + Build & Deploy
```bash
npm run build
```

Xem: `skills/games-pwa/SKILL.md`, `skills/games-deploy/SKILL.md`

Targets: GitHub Pages (Actions), Itch.io (Butler), Vercel, Netlify.

Pre-deploy: build success, < 10MB, source maps tắt, PWA ≥ 90, FPS ≥ 58/30, responsive 3 sizes.

## Anti-Rationalization
| Excuse | Reality |
|--------|---------|
| "Bỏ qua genre reference, game đơn giản mà" | Thiết kế sai thể loại → core loop không fun |
| "Polish pipeline sau, MVP trước" | Không polish = game xấu, user không chơi |
| "Headless test không cần, chơi tay đủ" | Bug physics/collision lên production |
| "Skip eval assertions, nhìn ổn rồi" | Chất lượng không đo được = không biết có tốt không |
| "Animation 3 state là đủ" | 6 state (idle/run/jump/attack/hurt/die) là minimum |
| "Audio khi nào xong game thêm" | Audio trễ = game thiếu polish = user thoát |
| "Skip loading screen, load nhanh mà" | User thấy màn hình trắng = tưởng hỏng |

## Red Flags
- Genre reference không đọc trước khi code
- Asset download script không chạy
- Quality gate: FPS < 58 hoặc coverage < 85%
- Eval threshold < 0.9
- Thiếu audio (BGM + SFX)
- Thiếu pause menu hoặc game over screen
- Animation state thiếu hurt/die
- Loading không có progress bar
- Pool không dùng (object leak)
- Camera không follow player

## Game Design & References
- **Genre Reference**: `skills/_shared/game-genre-reference.md`
- 2D design: `skills/games-2d/game-design-h5-2d.md`
- 3D design: `skills/games-3d/game-design-h5-3d.md`
- 3D Racing: `skills/games-3d/game-design-h5-marble-racing.md`
- 2.5D design: `skills/games-isometric/game-design-h5-2.5d.md`
- Assets: `skills/games-assets/SKILL.md`
- Performance: `skills/games-optimization/SKILL.md`
- Testing + Eval: `skills/games-testing/SKILL.md`
- Audio: `skills/games-audio/SKILL.md`
- PWA: `skills/games-pwa/SKILL.md`
- Deploy: `skills/games-deploy/SKILL.md`
- Polish: `skills/games-2d/SKILL.md`, `skills/games-3d/SKILL.md`, `skills/ui-ux/SKILL.md`

## Verification
- [ ] Genre reference đọc, đúng category
- [ ] Asset downloaded, animation states (idle/run/jump/attack/hurt/die)
- [ ] Polish pipeline đã chạy: visual, UX, audio, animation, performance
- [ ] Quality pass: unit test, coverage ≥ 85%, FPS ≥ 58, memory < 300KB
- [ ] Eval threshold ≥ 0.9
- [ ] PWA score ≥ 90
- [ ] Responsive: mobile/tablet/desktop
- [ ] Game đẹp — "like AI Studio made this"
