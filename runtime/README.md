# Enterprise AI Runtime — Kiến trúc 4 Tầng

> Entry point. Load `runtime/layers/` khi cần chi tiết từng tầng. Load `policies/` khi xử lý lỗi.

Kiến trúc phân tầng (Microsoft Agent Mode). Giao tiếp qua contract.

## Quy tắc cách ly

1. Giao tiếp qua contract — không @mention trực tiếp
2. Điều phối không thực thi; nhân công không điều phối
3. Hạ tầng không quyết định; chỉ ghi lại
4. Thêm tầng mới = 0 thay đổi tầng cũ

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
