# Contracts — Giao tiếp giữa các tầng

**Version:** 1.0.0

| Contract | Hướng | Fields | Ví dụ |
|----------|-------|--------|-------|
| `Request` | T1→T2 | `version, type, target, context` | `{v:"1.0", type:"debug", target:"./src"}` |
| `Task` | T2→T3 | `version, phase, target, skills, workflow` | `{v:"1.0", phase:"code", target:"./src"}` |
| `Result` | T3→T2 | `version, status, artifacts[]` | `{v:"1.0", status:"pass"}` |
| `Response` | T2→T1 | `version, status, summary` | `{v:"1.0", status:"ok"}` |
| `Event` | any→T4 | `version, type, phase, reflection` | `{v:"1.0", type:"phase_end"}` |
| `State` | T4→T2 | `version, checkpoint, session_id` | `{v:"1.0", session_id:"sess_1"}` |

**Mỗi contract tóm tắt 1-2 dòng, không in raw JSON ra terminal.**

## Versioning

- `v:"1.0"` = phiên bản hiện tại
- Breaking change → bump major (2.0)
- Add field → bump minor (1.1)
- Mọi agent check `version` trước khi parse; reject nếu không compatible
