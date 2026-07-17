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

## CLI Output
Xem `skills/ui-ux/SKILL.md` (CLI Design System section) — symbol set, 4-tier layout, contract format, anti-patterns, pre-delivery checklist.

## Verification
- [ ] Bug loại đã xác định, workflow phụ đúng
- [ ] Minimal reproduction step-by-step
- [ ] Root cause doc + fix ngắn nhất
- [ ] Test confirm fix, không regression
- [ ] CLI output format theo skills/ui-ux/SKILL.md
