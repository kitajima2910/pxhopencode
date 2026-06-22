# Contract Giao tiếp

Giao tiếp giữa các tầng qua JSON contracts. Mọi contract có `type`, `version`, `metadata{trace_id}` — snake_case.

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
1. `trace_id` lan truyền qua mọi tầng
2. Contract được xác thực tại biên giới tầng — invalid bị từ chối kèm lỗi schema
3. Thêm trường optional mới, không xóa/đổi tên trường cũ

## Lược đồ

### 1. Request (T1→T2)
```json
{"type":"request","version":"1.0","payload":{"project_type":"web|game|ai|tool|debug","description":"","scope":"new|feature|fix|refactor","target":"","constraints":{"tech_stack":[],"deadline":null}},"metadata":{"timestamp":"ISO8601","source":"user|pxh-help","trace_id":"uuid"}}
```

### 2. Task (T2→T3)
```json
{"type":"task","version":"1.0","task_id":"uuid","workflow":"company|web|game|ai|debug|release","phase":"architect|code|fix|test|review|build","payload":{"input":{},"context":{"status_md":"","artifacts":[]},"target":""},"policies":{"retry":{"max_attempts":3,"backoff":"exponential"},"timeout_ms":300000},"metadata":{"trace_id":"uuid","parent_task_id":null}}
```

### 3. Result (T3→T2)
```json
{"type":"result","version":"1.0","task_id":"uuid","status":"success|failure|partial","artifacts":{"files_changed":[],"tests_passed":null,"test_results":null},"errors":[{"code":"","message":"","severity":"critical|warning|info"}],"state":{"phase_complete":true,"next_phase":"test"},"metadata":{"duration_ms":0,"trace_id":"uuid"}}
```

### 4. Response (T2→T1)
```json
{"type":"response","version":"1.0","status":"success|failure|partial","summary":{"project":"","phases_completed":[],"artifacts":[],"duration_ms":0},"errors":[],"next_steps":[],"metadata":{"trace_id":"uuid","timestamp":"ISO8601"}}
```

### 5. Event (Mọi tầng→T4)
```json
{"type":"event","version":"1.0","source_layer":1|2|3|4,"event_type":"phase_start|phase_end|error|decision|checkpoint|reflection","payload":{},"metadata":{"timestamp":"ISO8601","trace_id":"uuid"}}
```

### 6. State (T4→T2)
```json
{"type":"state","version":"1.0","current_phase":"code|test|...","completed_phases":[],"last_checkpoint":"ISO8601","artifacts":[],"errors":[]}
```

## Luồng
```
T2→Event{phase_start}→T4 → T2→Task→T3 → T3→Result→T2 → T2→Event{phase_end}→T4
Lỗi: T3→Result{failure}→T2 → retry/recovery policy → T2→Event{error}→T4
```

## Version
semver: `major.minor` — major bump = phá vỡ, minor bump = thêm optional. Tầng từ chối major không biết, chấp nhận minor mới hơn.
