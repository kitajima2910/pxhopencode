# Workflow Gỡ lỗi — Sửa lỗi & Tối ưu

> **LUẬT:** UI text sau fix vẫn là **tiếng Việt**.

## Quy trình (6 bước + verify gate)

| # | Bước | Làm | Verify Gate |
|---|------|-----|-------------|
| 0 | Bình tĩnh | Đọc lỗi kỹ, đừng vội fix | Xác định được loại lỗi |
| 1 | Phân loại | Xác định loại (bên dưới) | Chọn đúng workflow phụ |
| 2 | Tái hiện | Minimal reproduction + log | Reproduce 100% với input biết trước |
| 3 | Khoanh vùng | Error→File→Stack→Input→Logic | Tìm đúng function gây lỗi |
| 4 | Root cause | Rubber duck / Binary search / Hypothesis | Giải thích được "tại sao" |
| 5 | Fix ngắn nhất | Sửa + verify (test, typecheck) | Test pass, không break code khác |
| 6 | Prevent | Unit test, error boundary, validation | Bug không tái phát với test |

### Bước 1 — Phân loại chi tiết

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

Debug frontend (không cần browser):

| Loại | Cách debug |
|------|-----------|
| DOM/UI | Log output + console.log injection |
| Logic | Unit test reproduction → `npx vitest run --reporter=verbose` |
| Network | Mock API (`MSW` / `vi.fn()`) |
| State | Log FSM transitions |
| Behaviour | Minimal reproduction → test từng bước |

## Anti-Rationalization (cấm)

| Excuse | Reality |
|--------|---------|
| "Chỉ là warning nhỏ, không sao" | Warning hôm nay = crash ngày mai ở edge case |
| "Sẽ viết test sau" | Không ai viết test sau — trust me bro |
| "Log là đủ, không cần minimal repro" | Log không cho thấy input → không reproduce → guess fix |
| "Fix một dòng, không cần typecheck" | Typecheck catch 70% bugs — skip = Russian roulette |
| "Lỗi UI không ảnh hưởng logic" | UX fail = user không dùng được tính năng |
| "Debug performance không cần benchmark" | "Cảm giác chậm" không phải data |

## Red Flags

- Lỗi runtime mà không đọc stack trace
- Fix mà không verify (test/typecheck)
- Bug tái phát → thiếu root cause analysis
- Minimal reproduction > 30 dòng
- Sửa 1 file nhưng ảnh hưởng 5 file khác
- Log output không có prefix layer `[T1]`, `[T2]`, ...

## CLI Design System — pxhopencode Runtime

> Thiết kế output cho hệ thống CLI 4 tầng. Dựa trên pattern: **Symbol Set + Layout + Contract Format → Pre-delivery checklist**.
> 📖 SKILL: `skills/ui-ux/SKILL.md`

### 1. Symbol Set (không emoji, dùng ASCII)

| Ý nghĩa | Symbol | Code |
|---------|--------|------|
| Success | `✓` | `\u2713` |
| Fail | `✗` | `\u2717` |
| Running | `⏳` | `\u23F3` |
| Arrow | `→` | `\u2192` |
| Separator | `─` x 50 | `\u2500` |
| Box T | `┌──┐` | `\u250C\u2500\u2510` |
| Box B | `└──┘` | `\u2514\u2500\u2518` |

Không dùng emoji. Fallback: `$env:NO_COLOR` = `[>]`, `[x]`, `[ ]`.

### 2. Layout cho 4 tầng

```
┌─ T1 ──────────────────────────────────────────┐
│ pxh-help  Validate input                       │
│   → /debug "Fix crash on login"                │
│   → Request {type:"debug", target:"./app.js"}   │
└────────────────────────────────────────────────┘
    ↓
┌─ T2 ──────────────────────────────────────────┐
│ pxh-pm   Analyze → Route → Track               │
│   Phase: code → test → fix                     │
│   Retry: 2/3  ⏳                                │
└────────────────────────────────────────────────┘
    ↓
┌─ T3 ──────────────────────────────────────────┐
│ pxh-expert  Execute in TARGET                   │
│   ✓ Code generated (src/app.js)                 │
│   ✓ Tests pass (12/12)                          │
└────────────────────────────────────────────────┘
    ↓
┌─ T4 ──────────────────────────────────────────┐
│ pxh-save-history  Persist state                 │
│   ✓ Session saved (session_abc123.json)         │
└────────────────────────────────────────────────┘
```

Mỗi tầng = 1 box riêng. Dùng `console.log` với prefix `[T1]`, `[T2]`, `[T3]`, `[T4]`.

### 3. Contract Format — chuẩn output

```
Request:  {type|target|context}            → 1 dòng
Task:     {phase|target|skills|workflow}   → tối đa 2 dòng
Result:   {status|artifacts[]}             → status + summary
Response: {status|summary}                 → 1 dòng output cuối
Event:    {type|phase|reflection}          → log ẩn (T4)
State:    {checkpoint|session_id}          → JSON file
```

Quy tắc: Không in contract raw JSON ra terminal—tóm tắt thành 1-2 dòng text.

### 4. Anti-Patterns (cấm)

| Anti-pattern | Hậu quả | Thay bằng |
|-------------|---------|-----------|
| Emoji trong output | Lỗi font trên terminal cũ | ASCII symbols |
| Contract raw JSON | Nhiễu, khó đọc | Tóm tắt 1-2 dòng |
| Spam progress > 10Hz | Rối terminal | Update ≤ 5 lần/s |
| Không prefix tầng | Không biết ai output | `[T1]`, `[T2]`, ... |
| Màu sắc tuỳ tiện | Khó đọc trên terminal đen/trắng | Dùng NO_COLOR fallback |

### 5. Pre-delivery checklist

- [ ] Output có prefix `[Tn]` ở mỗi dòng
- [ ] Box ┌─┐ cho block multi-line (không cho 1 dòng)
- [ ] Contract tóm tắt, không raw JSON
- [ ] status icon (✓/✗) hiển thị đúng
- [ ] `$env:NO_COLOR` fallback hoạt động
- [ ] Progress update ≤ 5 lần/s
- [ ] Phân cách section rõ ràng (─── dòng)

### 6. Route debug UI
- CLI output sai format → `@pxh-ui-ux` với sample output + mô tả lỗi
- Web/Game UI bug → `skills/ui-ux/SKILL.md` + `@pxh-ui-ux`
