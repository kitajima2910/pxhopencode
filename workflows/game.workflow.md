# Workflow Game — Phát triển game HTML5 Pro

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Animation state (`idle`, `run`, `jump`) = tiếng Anh.
> Chrome DevTools MCP đã connected (config: `--autoConnect`). Nếu chưa dùng được: mở Brave/Chrome → vào `chrome://inspect/#remote-debugging` → bật "Enable remote debugging". Dùng `chrome-devtools_*` tools để preview + debug game real-time.

## Bước 0: Download assets (AUTO)
```powershell
powershell.exe -ExecutionPolicy Bypass -File "_shared/scripts/download-games-assets.ps1" -AssetType "2d" -GameStyle "platformer"
# GameStyle: platformer, rpg, shooter, racing, puzzle, horror, shmup, strategy, adventure
```

## Bước 1: Chọn loại game & engine

| Loại | Engine | Skill | Preview |
|------|--------|-------|---------|
| 2D | Phaser 3 | `games-2d` | `chrome-devtools_new_page(url:http://localhost:5173)` |
| 2.5D | Isometric + Phaser | `games-isometric` | `chrome-devtools_new_page(url:http://localhost:5173)` |
| 3D | Three.js | `games-3d` | `chrome-devtools_new_page(url:http://localhost:5173)` |

## Bước 2: Scaffold & Run
```bash
# Tạo project từ templates
cp -r skills/games-2d/templates/* src/
npm init -y
npm install phaser && npm install -D vite
```
```html
<!-- index.html -->
<script src="/src/main.ts" type="module"></script>
```
Chạy ngay: `npx vite` — sau đó dùng chrome-devtools:
```
chrome-devtools_new_page(url:http://localhost:5173)         # Mở preview
chrome-devtools_take_screenshot                              # Chụp màn hình kiểm tra
chrome-devtools_list_console_messages(types:error)           # Bắt lỗi JS
```

## Bước 3: Visual Iteration Loop (quan trọng nhất)
Sau mỗi feature, dùng chrome-devtools để verify TRỰC QUAN:

| Feature xong | Verify bằng |
|-------------|-------------|
| Scene/Map | `chrome-devtools_take_screenshot` + check console |
| Player movement | `chrome-devtools_evaluate_script(() => player.x)` |
| Animation | `chrome-devtools_take_screenshot` (bắt khoảnh khắc) |
| UI/HUD | `chrome-devtools_take_screenshot` + check layout |
| Audio | `chrome-devtools_evaluate_script(() => { /* test audio */ })` |
| Physics | `chrome-devtools_evaluate_script(() => game.physics.)` |

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
- [ ] FPS counter (dev mode) — `chrome-devtools_evaluate_script`
- [ ] Memory check — `chrome-devtools_take_heapsnapshot` nếu cần

## Bước 5: Quality Gate

### Runtime Checks (Chrome DevTools)
```javascript
// Inject FPS counter
const fpsEl = document.createElement('div');
fpsEl.style.cssText = 'position:fixed;top:0;left:0;z-index:9999;color:lime;font:16px monospace';
document.body.appendChild(fpsEl);
let frames = 0, last = performance.now();
function count() { frames++; requestAnimationFrame(count) }
requestAnimationFrame(count);
setInterval(() => {
  const now = performance.now();
  fpsEl.textContent = `FPS: ${Math.round(frames * 1000 / (now - last))}`;
  frames = 0; last = now;
}, 1000);
```

Quality passes khi:
- ✅ FPS ≥ 55 (desktop) | ≥ 30 (mobile)
- ✅ Console không có error
- ✅ Network: assets load 200, không 404
- ✅ Screenshot: UI hiển thị đúng, không overlap

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
- [ ] **Loading time**: < 3s trên 3G (Chrome DevTools emulate Slow 3G)
- [ ] **Memory leak**: heap snapshot trước/sau 5 phút chơi, diff < 500KB
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
