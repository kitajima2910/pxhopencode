# Enterprise AI Runtime — Kiến trúc 4 Tầng

> Entry point. Load `runtime/layers/` khi cần chi tiết từng tầng. Load `policies/` khi xử lý lỗi.

Kiến trúc phân tầng (Microsoft Agent Mode). Giao tiếp qua contract.

## Tổng quan

| Tầng | Tên | Agent | Load khi |
|------|-----|-------|----------|
| 1 | Giao diện | `pxh-help` | Validate input / format output |
| 2 | Điều phối | `pxh-pm` | Route task, state, policy |
| 3 | Nhân công | 7 agents | Execute domain work |
| 4 | Hạ tầng | `pxh-save-history` | Lưu state, checkpoint, log |

## Quy tắc cách ly

1. Giao tiếp qua contract — không @mention trực tiếp
2. Điều phối không thực thi; nhân công không điều phối
3. Hạ tầng không quyết định; chỉ ghi lại
4. Thêm tầng mới = 0 thay đổi tầng cũ

## Luồng

```
User → T1(validate) → T2(route) → T3(execute) → T2(eval) → T1(response) → User
                                        ↘              ↙
                                      T4(persist)
```

## Contracts (tóm tắt)

```
Request  T1→T2  {type, target, context}
Task     T2→T3  {phase, target, skills, workflow}
Result   T3→T2  {status, artifacts[]}
Response T2→T1  {status, summary}
Event    any→T4 {type, phase, reflection}
State    T4→T2  {checkpoint, session_id}
```

Chi tiết: `runtime/layers/` (4 tầng), `policies/` (retry, recovery, reflection)

## Workers: tự kiểm tra, không tự quyết định

Workers không retry/recovery — trả `Result{status:"failure"}` → T2 quyết định.
