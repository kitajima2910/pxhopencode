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
- **Database**: query lỗi → EXPLAIN ANALYZE

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
