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
