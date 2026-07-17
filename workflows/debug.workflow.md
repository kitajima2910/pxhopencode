# Workflow Gỡ lỗi — Sửa lỗi & Tối ưu

> **LUẬT NGÔN NGỮ**: Khi fix UI bug, đảm bảo UI text sau fix vẫn là **tiếng Việt**.

## Quy trình

### Bước 0: Bình tĩnh — đọc lỗi kỹ trước khi làm gì.

### Bước 1: Phân loại
- **Runtime**: crash/exception → đọc stack trace từ dưới lên
- **Logic**: behavior sai → debug step-by-step, print log
- **Build**: compile error → đọc dòng báo lỗi
- **Network**: 4xx/5xx/CORS → kiểm tra request/response
- **Performance**: chậm/lag → profiling, benchmark
- **Security**: XSS/CSRF/SQLi/auth bypass → chạy security checklist (`skills/webs-security/SKILL.md`)
- **Database**: query lỗi → EXPLAIN ANALYZE
- **UX**: UI lệch/màu sai/FOUC/accessibility → responsive, dark mode, contrast, keyboard nav

### Bước 2: Tái hiện — verbose mode, minimal reproduction

### Bước 3: Khoanh vùng
`Error → File & line → Call stack → Input → Logic`

Debug frontend (không cần browser):
| Loại | Cách debug |
|------|-----------|
| DOM/UI | Kiểm tra log output + `console.log` injection vào code |
| Logic | Viết unit test reproduction → `npx vitest run --reporter=verbose` |
| Network | Mock API response trong test (`MSW` / `vi.fn()`) |
| State | Log state transitions trong FSM |
| Behaviour | Tách minimal reproduction → test từng bước |

### Bước 4: Root cause — Rubber duck / Binary search / Hypothesis testing

### Bước 5: Fix NGẮN NHẤT → Verify (repro steps → test → typecheck)

### Bước 6: Prevent — unit test, error boundary, validation, logging

## Post-fix: route đến agents theo company workflow pattern. Xem `workflows/company.workflow.md`.

## UI/UX Debug — Web, Game, Tool

> 📖 **SKILL**: `skills/ui-ux/SKILL.md` — toàn bộ kiến thức UI/UX cho web (Tailwind/React), game (Phaser HUD), tool (CLI output).

### Chuẩn đoán nhanh

| Triệu chứng | Loại | Cách debug |
|-------------|------|-----------|
| Layout lệch trên mobile | Web | Thêm border debug: `* { outline: 1px solid red }` |
| Dark mode không áp dụng | Web | Check `class="dark"` trên `<html>`, kiểm tra `dark:` variant |
| Game HUD lệch màn hình | Game | `setScrollFactor(0)` chưa? Scale mode `Phaser.Scale.FIT`? |
| Touch không hoạt động | Game | DOM overlay có `pointer-events: none`? Button zone ≥ 48×48? |
| Output CLI loãng | Tool | Nhóm section, thêm divider, màu sắc rõ ràng |
| Progress bar nhấp nháy | Tool | Update ≤ 10 lần/s, dùng `\r` đúng cách |

### Web — Debug responsive & FOUC

```bash
# Responsive: resize trình duyệt hoặc dùng DevTools device toolbar
# FOUC: thêm ?debug vào URL, kiểm tra CSS load order
# Dark mode flash: kiểm tra <script> blocking trong <head>
```

### Game — Debug HUD & touch

```typescript
// Bật debug HUD
hudContainer.style.outline = '2px solid cyan'
// Kiểm tra scroll factor
console.log(text.scrollFactorX, text.scrollFactorY) // phải = 0
// Touch zone test: thêm background màu để thấy vùng chạm
touchZone.setInteractive({ hitArea: new Phaser.Geom.Rectangle(0, 0, 48, 48), useHandCursor: true })
```

### Tool — Debug CLI output

```bash
# Test với NO_COLOR để check fallback
$env:NO_COLOR = "1"; node tool.js
# Test verbose mode
tool.js --verbose
# Kiểm tra progress bar frequency
Measure-Command { tool.js }
```

### Route đến agent
- Web UI/UX → `@pxh-ui-ux` với Task contract (context: mô tả bug + screenshot/mockup)
- Game HUD → `@pxh-ui-ux` + `@pxh-expert` (via T2)
- Tool CLI → `@pxh-ui-ux` với output sample
- Xem `skills/ui-ux/SKILL.md` cho checklist cross-platform
