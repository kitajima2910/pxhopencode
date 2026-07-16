# Enterprise AI Runtime — Kiến trúc 4 Tầng

Kiến trúc điều phối phân tầng (theo Microsoft Agent Mode). Mỗi tầng một trách nhiệm duy nhất, giao tiếp qua contract.

## Trách nhiệm các tầng

| Tầng | Tên | Trách nhiệm | Agent |
|------|-----|-------------|-------|
| 1 | Giao diện | Xác thực đầu vào, định dạng output | `pxh-help`, user prompt |
| 2 | Điều phối | Route tasks, quản lý luồng, theo dõi state, thi hành policy | `pxh-pm` |
| 3 | Nhân công | Thực thi domain (thiết kế, code, fix, test, review, build, mod, ui-ux) | 8 agents |
| 4 | Hạ tầng | Lưu state, log, checkpoint, artifact | `pxh-save-history` |

### Quy tắc cách ly tầng
1. Giao tiếp CHỈ qua contract — không @mention trực tiếp để giao việc
2. Điều phối không thực thi; nhân công không điều phối
3. Hạ tầng không quyết định; chỉ ghi lại
4. Thêm tầng mới không cần thay đổi tầng cũ

## Thứ tự thực thi

**User Prompt → Tầng 1 (Interface) → Tầng 2 (Orchestration) → Tầng 3 (Worker) → Tầng 4 (Infrastructure) → Tầng 2 (Evaluate) → Tầng 1 (Response) → User**

Chi tiết: `runtime/layers/` (4 files), `contracts/README.md`, `policies/` (3 files: retry, recovery, reflection)

## Contract giao tiếp

| Contract | Hướng | Mục đích |
|----------|-------|----------|
| `Request` | T1 → T2 | Yêu cầu từ user |
| `Task` | T2 → T3 | Giao việc |
| `Result` | T3 → T2 | Kết quả hoàn thành |
| `Response` | T2 → T1 | Kết quả cuối cùng |
| `Event` | Mọi tầng → T4 | Log / checkpoint |
| `State` | T4 → T2 | Checkpoint phục hồi |

## Chính sách

| Policy | Phạm vi | Thi hành bởi |
|--------|---------|-------------|
| Thử lại | Lỗi tạm thời (timeout, rate limit), exp backoff tối đa 3 lần | Tầng 2 |
| Phục hồi | Lỗi mọi tầng, dựa trên checkpoint | Tầng 2 |
| Phản ánh | Task/Phase/Workflow/Sự cố, 4 mức | Mọi tầng → T4 lưu |

Workers không tự thử lại/phục hồi — trả về `Result{status:"failure"}` để Điều phối quyết định.
