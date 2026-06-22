# Contract Giao tiếp

## Các loại
| # | Contract | Hướng | Mục đích |
|---|----------|-------|----------|
| 1 | `Request` | T1→T2 | Yêu cầu user |
| 2 | `Task` | T2→T3 | Giao việc kèm policy |
| 3 | `Result` | T3→T2 | Kết quả + errors |
| 4 | `Response` | T2→T1 | Kết quả cuối |
| 5 | `Event` | Mọi tầng→T4 | Log/checkpoint |
| 6 | `State` | T4→T2 | Checkpoint phục hồi |

## Quy tắc
1. `trace_id` lan truyền mọi tầng. 2. Xác thực tại biên giới tầng. 3. Thêm optional, không xóa trường cũ.

## Lược đồ (concise)
- **Request**: `{type, version, payload:{project_type, description, scope, target, constraints}, metadata:{timestamp, source, trace_id}}`
- **Task**: `{type, version, task_id, workflow, phase, payload:{input, context:{status_md, artifacts}, target}, policies:{retry:{max_attempts:3, backoff:exponential}, timeout_ms:300000}, metadata:{trace_id, parent_task_id}}`
- **Result**: `{type, version, task_id, status:success|failure|partial, artifacts:{files_changed, tests_passed}, errors:[{code, message, severity}], state:{phase_complete, next_phase}, metadata:{duration_ms, trace_id}}`
- **Response**: `{type, version, status, summary:{project, phases_completed, artifacts, duration_ms}, errors, next_steps, metadata:{trace_id, timestamp}}`
- **Event**: `{type, version, source_layer:1|2|3|4, event_type:phase_start|phase_end|error|decision|checkpoint|reflection, payload, metadata:{timestamp, trace_id}}`
- **State**: `{type, version, current_phase, completed_phases[], last_checkpoint, artifacts[], errors[]}`

## Luồng
```
T2→Event{phase_start}→T4 → T2→Task→T3 → T3→Result→T2 → T2→Event{phase_end}→T4
Lỗi: T3→Result{failure}→T2 → retry/recovery → T2→Event{error}→T4
```

## Version
semver `major.minor`. Major bump = breaking. Minor = thêm optional. Tầng từ chối major lạ, chấp nhận minor mới hơn.
