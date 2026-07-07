# Workflow Game — Phát triển game HTML5 Pro

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Animation state (`idle`, `run`, `jump`) = tiếng Anh.
> Testing dùng Vitest headless — không cần chạy dev server. Xem `skills/games-testing/`.

## Bước 0: Download assets (AUTO)
```powershell
powershell.exe -ExecutionPolicy Bypass -File "_shared/scripts/download-games-assets.ps1" -AssetType "2d" -GameStyle "platformer"
# GameStyle: platformer, rpg, shooter, racing, puzzle, horror, shmup, strategy, adventure
```

## Bước 1: Chọn loại game & engine

| Loại | Engine | Skill |
|------|--------|-------|
| 2D | Phaser 3 | `games-2d` |
| 2.5D | Isometric + Phaser | `games-isometric` |
| 3D | Three.js | `games-3d` |

## Bước 2: Scaffold & Run
```bash
# Tạo project từ templates
cp -r skills/games-2d/templates/* src/
npm init -y
npm install phaser && npm install -D vite
# .gitignore — luôn có .opencode/ + .github/
cp _shared/templates/gitignore-template.md ../.gitignore
```
```html
<!-- index.html -->
<script src="/src/main.ts" type="module"></script>
```
Setup testing ngay:
```bash
cp skills/games-testing/templates/vitest.config.ts ./
cp skills/games-testing/templates/phaser-test-helper.ts src/test-helper.ts   # 2D/2.5D
# hoặc: cp skills/games-testing/templates/three-test-helper.ts src/test-helper.ts  # 3D
npm install -D vitest happy-dom
```

## Bước 3: Test Iteration Loop (headless)
Sau mỗi feature, viết test headless để verify logic:

| Feature xong | Verify bằng test |
|-------------|-----------------|
| Scene/Map | `npx vitest run` — check scene lifecycle (create→update→destroy) |
| Player movement | Unit test: kiểm tra x/y sau simulate input |
| Animation | state machine test — FSM transitions idle→run→jump→attack |
| UI/HUD | DOM test: check hp bar, score text rendering |
| Audio | `AudioContext` mock — play/stop/restart không throw |
| Physics | AABB collision test — edge cases overlap/separate |

## Bước 4: Polish Pipeline (làm đẹp — bắt buộc)
Sau khi game chạy, chạy polish pipeline:

### Visual Polish Checklist
- [ ] Color palette nhất quán — dùng `skills/games-2d/templates/color-palettes.ts`
- [ ] Particle effects (hit, collect, explosion) — dùng object pool
- [ ] Screen shake khi hit — dùng `skills/games-2d/templates/screen-shake.ts`
- [ ] Smooth camera follow — `camera.startFollow(player)`
- [ ] Tween animations (menu, UI, transitions)
- [ ] Lighting 3D: ambient + directional + hemisphere — dùng `skills/games-3d/templates/lighting.ts`
- [ ] Shadows (bật shadow map, PCFSoft cho 3D)
- [ ] Vignette / bloom / post-processing (3D)
- [ ] Background music + SFX — dùng `skills/games-audio/`
- [ ] Loading screen với progress bar

### UX Polish Checklist
- [ ] Touch controls (mobile) — `InputManager.justPressed` pattern
- [ ] Responsive scale — dùng `Phaser.Scale.FIT` / resize handler
- [ ] Pause menu (ESC/P key)
- [ ] Game over screen + restart
- [ ] HUD: health bar, score, ammo — dùng `skills/games-2d/templates/HealthBar.ts`
- [ ] Tutorial / hướng dẫn đầu game
- [ ] Vibration feedback (mobile)

### Code Polish
- [ ] Object pool cho đạn/enemy/particle — `skills/games-optimization/templates/object-pool.ts`
- [ ] FSM states đầy đủ: idle/run/jump/attack/hurt/die
- [ ] FPS counter (dev mode) — inject trong code, dùng `performance.now()`
- [ ] Memory check — `skills/games-testing/templates/memory-leak.test.ts`

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
```bash
npx vitest run              # Unit tests
npx vitest --coverage       # Coverage ≥ 80%
```

Test coverage yêu cầu:
- [ ] FSM state transitions
- [ ] Collision AABB edge cases
- [ ] Object pool acquire/release
- [ ] Scoring: 0, max, overflow
- [ ] Player health: damage, heal, death, invincibility
- [ ] Enemy spawn timing
- [ ] Audio: play/stop/restart không throw
- [ ] Scene lifecycle: create → update → destroy

Xem: `skills/games-testing/SKILL.md`

### Game-Specific Review Checklist
- [ ] **Draw calls** (3D): `renderer.info.render.calls < 200`
- [ ] **Texture memory**: texture atlas, không texture rời
- [ ] **Shadow map**: 1024² mobile, 2048² desktop
- [ ] **Audio**: format fallback mp3/ogg/wav, không load fail
- [ ] **Loading time**: < 3s — benchmark asset loading trong test (`skills/games-testing/templates/performance-benchmark.ts`)
- [ ] **Memory leak**: `memory-leak.test.ts` — diff < 500KB sau 5 phút simulate
- [ ] **LOD** (3D): 3 levels ở 20 và 50 units
- [ ] **Frustum culling**: `renderer.frustumCulling = true`
- [ ] **Touch**: buttons ≥ 44px, gap ≥ 8px
- [ ] **Security**: không eval, không inline script trong production

## Bước 6: PWA (Progressive Web App)
```bash
# Copy PWA templates
cp skills/games-pwa/templates/* ./
npm install -D workbox-webpack-plugin
```

- [ ] `manifest.json` — `display: fullscreen`, icons 192+512
- [ ] `service-worker.ts` — cache-first cho assets
- [ ] `registerSW()` — trong main.ts
- [ ] `setupInstallPrompt()` — nút "Cài đặt game"
- [ ] Kiểm tra Lighthouse PWA ≥ 90

Xem: `skills/games-pwa/SKILL.md`

## Bước 7: Build & Deploy (thủ công — kiểm soát hoàn toàn)

```bash
# Build production
npm run build               # dist/
```

### Deploy targets (chọn 1)

| Target | Cách deploy thủ công | Yêu cầu |
|--------|----------------------|---------|
| **GitHub Pages** | `Settings → Pages → Source: GitHub Actions` → Vào Actions tab → chọn workflow `Deploy Game` → Run workflow → Chọn branch → Run | GitHub repo |
| **Itch.io** | Vào Actions tab → workflow `Deploy to Itch.io` → Run workflow → Branch → Run. Cần setup Secrets trước. | Secrets: `BUTLER_API_KEY`, `ITCH_USER`, `ITCH_GAME` |
| **Vercel** | `npx vercel --prod` | Vercel account |
| **Netlify** | `npx netlify deploy --prod` | Netlify account |
| **Copy thủ công** | Copy `dist/` lên bất kỳ web server nào | — |

### Setup GitHub Actions (optional — chỉ khi muốn dùng CI/CD)
```bash
mkdir -p .github/workflows
cp skills/games-deploy/templates/.github/workflows/deploy-pages.yml .github/workflows/
```

> **Lưu ý**: Mặc định trigger là `workflow_dispatch` (bấm tay trên GitHub). Không auto-deploy khi push.

### Pre-deploy checklist
- [ ] `npm run build` success
- [ ] `dist/` < 10MB
- [ ] Source maps tắt (vite build tự động tắt)
- [ ] Lighthouse PWA ≥ 90
- [ ] FPS ≥ 55 desktop, ≥ 30 mobile
- [ ] Không memory leak
- [ ] Touch controls hoạt động
- [ ] Responsive: 800×600, 375×667, 1024×768

Xem: `skills/games-deploy/SKILL.md`

## Game Design & References
- 2D design: `skills/games-2d/game-design-h5-2d.md`
- 3D design: `skills/games-3d/game-design-h5-3d.md`
- 2.5D design: `skills/games-isometric/game-design-h5-2.5d.md`
- Assets: `skills/games-assets/SKILL.md`
- Performance: `skills/games-optimization/SKILL.md`
- Testing: `skills/games-testing/SKILL.md`
- PWA: `skills/games-pwa/SKILL.md`
- Deploy: `skills/games-deploy/SKILL.md`
