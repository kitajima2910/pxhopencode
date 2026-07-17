# Contracts — Giao tiếp giữa các tầng

| Contract | Hướng | Fields | Ghi chú |
|----------|-------|--------|---------|
| Request | T1→T2 | `type, target, context` | Từ user |
| Task | T2→T3 | `phase, target, skills, workflow` | Giao việc |
| Result | T3→T2 | `status, artifacts[]` | Kết quả |
| Response | T2→T1 | `status, summary` | Output cuối |
| Event | any→T4 | `type, phase, reflection` | Log |
| State | T4→T2 | `checkpoint, session_id` | Recovery |

Mỗi contract tóm tắt 1-2 dòng, không in raw JSON ra terminal.
