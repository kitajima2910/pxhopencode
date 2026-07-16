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
- **Mod**: APK không chạy/decompile lỗi/smali syntax → đọc log, kiểm tra cấu trúc smali/dex, verify signature
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

---

## Mod APK — Quy trình mod game/app (online & offline)

> ⚠️ **LUẬT BẮT BUỘC**: Giữ nguyên cấu trúc smali gốc. Chỉ patch đúng mục tiêu. Không xoá file lạ. Luôn backup bản gốc.
> 📖 **SKILL VIP**: `skills/mod-apk/SKILL.md` — chứa toàn bộ kiến thức hacker từ cơ bản đến nâng cao.

### CHẾ ĐỘ MẶC ĐỊNH: Edit-only
> `/mod` và `/debug` chỉ chạy **PHASE 1→5** (edit). Bỏ qua rebuild/sign/install/test (PHASE 6→10) — user có tool riêng cho các bước đó.
> Nếu user yêu cầu full pipeline, dùng `@pxh-devops` để rebuild/sign/install/test.

### PHASE 1 — Chuẩn bị & Decompile

```bash
# Tải APK/XAPK từ internet → để trong TARGET/
# Nếu XAPK: giải nén (là zip) → lấy .apk bên trong
# Nếu .apks / .apkm: giải nén → tìm base.apk

# Decompile ra smali + resources
apktool d TARGET/file.apk -o TARGET/decompiled -f

# Phân tích Java bằng jadx-gui (đọc logic, tìm class)
jadx-gui TARGET/file.apk

# Mở folder decompiled trong VSCode
code TARGET/decompiled
```

### PHASE 2 — Phân tích & Xác định mục tiêu

Trong jadx-gui, search string để tìm class cần patch:

| String search | Mục tiêu |
|--------------|----------|
| `premium`, `pro`, `unlock`, `vip` | Premium bypass |
| `purchase`, `buy`, `paid`, `iap`, `product` | In-app purchase |
| `license`, `verify`, `signature`, `integrity` | License/anti-tamper |
| `root`, `su`, `emulator`, `debug` | Root/emulator detection |
| `coin`, `diamond`, `gold`, `gem`, `cash`, `credit` | In-game currency |
| `damage`, `hp`, `health`, `mana`, `ammo` | Player stats |
| `https://`, `http://api`, `endpoint` | Server URL (có thể chặn) |
| `isPurchased`, `isPremium`, `checkLicense` | Method trả boolean |

### PHASE 3 — Vibe code (sửa smali)

Quy tắc vàng khi sửa smali:
1. **`.locals` phải ≥ số register dùng** — sai là crash ngay
2. **Chỉ dùng v0–v15** (trừ khi method có `.locals` lớn)
3. **Label không duplicate** — mỗi label unique trong method
4. **Giữ nguyên signature method** — không đổi tên method, params

Xem `skills/mod-apk/SKILL.md` #10 cho tất cả pattern smali.

### PHASE 4 — Anti-tamper bypass (nếu game crash)

Nếu mod xong → crash / tự thoát / hiện "App tampered":

1. Search `Signature`, `Integrity`, `Checksum`, `Tamper` trong jadx
2. Patch các method check đó → return success
3. Xem `skills/mod-apk/SKILL.md` #3 (Anti-Tamper Matrix)

### PHASE 5 — Online game (nếu mod số không生效)

Game online thường có server validation:
- **Client trust**: Patch smali return true là được
- **Server trust**: KHÔNG THỂ mod coin/diamond — chỉ mod hack map, auto-aim, wallhack
- **Hybrid**: Patch logic tấn công (dame x100), không mod được số dư
- Dùng Frida bypass runtime check nếu cần (xem skill #9)

### PHASE 6 — Rebuild & Sign

```bash
# Rebuild APK
apktool b TARGET/decompiled -o TARGET/modded.apk

# Sign (luôn dùng uber-apk-signer — tự động align)
uber-apk-signer --apks TARGET/modded.apk
# → ra TARGET/modded-aligned-debugSigned.apk
```

### PHASE 7 — Test & Debug

```bash
# Cài lên device
adb install TARGET/modded-aligned-debugSigned.apk

# Nếu crash, đọc log:
adb logcat -s AndroidRuntime:* *:S
# hoặc:
adb logcat | grep -E "FATAL|Exception|at |MOD_DEBUG"
```

Nếu crash → xem `skills/mod-apk/SKILL.md` #11 (Debug Crash Analyzer)

### PHASE 8 — Unity / Cocos / Flutter (game engine đặc thù)

| Engine | Cách mod | Xem skill |
|--------|---------|-----------|
| Unity Mono (Assembly-CSharp.dll) | dnSpy patch C# → recompile | Skill #4 |
| Unity il2cpp (libil2cpp.so) | Il2CppDumper → hex patch ARM64 | Skill #4 |
| Cocos2d-x (assets/*.js) | Edit JS trực tiếp | Skill #5 |
| Flutter (libapp.so) | ReFlutter hoặc Frida | Skill #6 |

### PHASE 9 — Split APK / XAPK / AAB

| Format | Cách xử lý | Xem skill |
|--------|-----------|-----------|
| XAPK (có obb) | Mod APK + copy obb riêng | Skill #8 |
| .apks / .apkm | Giải nén → mod base.apk → install-multiple | Skill #8 |
| AAB | bundletool → .apks → mod | Skill #8 |

### PHASE 10 — Lưu checkpoint

```bash
# Copy bản mod ra output
copy TARGET/modded-aligned-debugSigned.apk TARGET/output/
# Ghi lại log những file smali đã sửa
# Nếu có obb: ghi chú version obb cần copy
```

---

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
