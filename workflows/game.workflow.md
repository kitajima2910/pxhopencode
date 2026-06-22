# Workflow Game — Phát triển game H5

> **LUẬT NGÔN NGỮ**: UI game (nút, menu, HUD, hướng dẫn) = **tiếng Việt**. Animation state (`idle`, `run`, `jump`) = tiếng Anh.

## Bước 0: Download assets (AUTO — agent tự chạy)
Trước khi code, agent PHẢI chạy script download assets. Dùng `-ExecutionPolicy Bypass` để tránh lỗi policy Windows.
```powershell
# Windows — luôn dùng -ExecutionPolicy Bypass
powershell.exe -ExecutionPolicy Bypass -File "_shared/scripts/download-games-assets.ps1" -AssetType "2d" -GameStyle "platformer"
# GameStyle: platformer, rpg, shooter, racing, puzzle, horror, shmup, strategy, adventure
```
```bash
# macOS / Linux — dùng curl + unzip thủ công hoặc cài pwsh
# Xem hướng dẫn tại _shared/scripts/download-games-assets.ps1
```

## Bước 1: Chọn loại game & engine

| Loại | Engine | Skill |
|------|--------|-------|
| 2D | Phaser 3 / PixiJS | `skills/games-2d/` |
| 2.5D | Isometric + Phaser | `skills/games-isometric/` |
| 3D | Three.js / Babylon.js | `skills/games-3d/` |

## Bước 2: Setup
```bash
# 3D (mặc định)
npm install three @types/three -D vite
# 2D
npm install phaser
```
`.gitignore`: `.opencode`, `.playwright-mcp`, `.gitignore`, `node_modules/`, `dist/`, `*.log`, `.env`
Favicon: `_shared/favicon-svg.md` — `[COLOR_1]=#f43f5e, [COLOR_2]=#e11d48`

## Bước 3: Cấu trúc
```
src/scenes/ → entities/ → systems/ → ui/ → levels/ → assets/ → utils/
public/assets/ — static assets
```

## Bước 4: Flow code
```
Concept → Scene Setup → Player → Enemies → Mechanics → UI → Audio → Polish
```
Mỗi entity có FSM: `idle`, `run`, `jump`, `attack`, `hurt`, `die` (xem `skills/games-core/`).

## Bước 5: Chạy
```bash
npx vite   # live server
npm run build  # dist/
```

## Bước 6: Game Design (nếu cần)
Đọc skill design trước khi code: `skills/games-2d/game-design-h5-2d.md`, `skills/games-isometric/game-design-h5-2.5d.md`, `skills/games-3d/game-design-h5-3d.md`

## Chất lượng & Phát hành
Sau code → route đến agents theo `workflows/company.workflow.md` (test → fix → review → build → persist).
