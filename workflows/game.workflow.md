# Workflow Game — Phát triển game HTML5 Pro

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Animation state (`idle`, `run`, `jump`) = tiếng Anh.
> Chrome DevTools MCP đã connected — dùng `chrome-devtools_*` tools để preview + debug game real-time.

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
- [ ] Color palette nhất quán — dùng `games-2d/templates/color-palettes.ts`
- [ ] Particle effects (hit, collect, explosion) — dùng object pool
- [ ] Screen shake khi hit — dùng `templates/screen-shake.ts`
- [ ] Smooth camera follow — `camera.startFollow(player)`
- [ ] Tween animations (menu, UI, transitions)
- [ ] Lighting 3D: ambient + directional + hemisphere — dùng `games-3d/templates/lighting.ts`
- [ ] Shadows (bật shadow map, PCFSoft cho 3D)
- [ ] Vignette / bloom / post-processing (3D)
- [ ] Background music + SFX — dùng `games-audio/`
- [ ] Loading screen với progress bar

### UX Polish Checklist
- [ ] Touch controls (mobile) — `InputManager.justPressed` pattern
- [ ] Responsive scale — dùng `Phaser.Scale.FIT` / resize handler
- [ ] Pause menu (ESC/P key)
- [ ] Game over screen + restart
- [ ] HUD: health bar, score, ammo — dùng `HealthBar.ts`
- [ ] Tutorial / hướng dẫn đầu game
- [ ] Vibration feedback (mobile)

### Code Polish
- [ ] Object pool cho đạn/enemy/particle — `games-optimization/templates/object-pool.ts`
- [ ] FSM states đầy đủ: idle/run/jump/attack/hurt/die
- [ ] FPS counter (dev mode) — `chrome-devtools_evaluate_script`
- [ ] Memory check — `chrome-devtools_take_heapsnapshot` nếu cần

## Bước 5: Quality Gate
Dùng chrome-devtools để kiểm tra chất lượng trước release:

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

## Bước 6: Build & Deploy
```bash
npx vite build     # dist/
```
```bash
# GitHub Pages deploy
git add -A && git commit -m "game release"
git push
```
Hoặc copy `dist/` lên Vercel / Netlify.

## Game Design & References
- 2D design: `skills/games-2d/game-design-h5-2d.md`
- 3D design: `skills/games-3d/game-design-h5-3d.md`
- 2.5D design: `skills/games-isometric/game-design-h5-2.5d.md`
- Assets: `skills/games-assets/SKILL.md`
- Performance: `skills/games-optimization/SKILL.md`

## Post-code: route đến agents theo `workflows/company.workflow.md`
Sau code → test → fix → review → build → persist.
