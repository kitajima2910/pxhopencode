# Workflow Office — Virtual Office với Real-time Event Sync

> Văn Phòng Ảo đồng bộ real-time với thao tác TUI qua Event Log Bridge.

## Cách dùng

```bash
# Server + Webview (real-time sync — khuyên dùng)
node skills/virtual-office/templates/server.mjs
# Browser → http://localhost:2910

# TUI (real-time sync với fs.watch)
node skills/virtual-office/templates/office.mjs

# Webview offline (chỉ demo)
start skills/virtual-office/templates/office.html
```

## Event Sync System

Mọi thao tác trên TUI (task routing, phase change, contract flow) đều ghi vào `_shared/office-events.log`. Cả TUI và Webview đều watch file này để animate real-time.

### Agent gọi event

Khi agent làm việc, emit event qua CLI:
```bash
node skills/virtual-office/templates/emit-event.mjs \
  --type task_start --from pxh-pm --to pxh-expert \
  --tier_from T2 --tier_to T3 \
  --phase code --workflow /vibe \
  --message "→ Task{code} sent to pxh-expert"
```

Hoặc import module:
```javascript
import { emit } from './emit-event.mjs'
emit({ type: 'phase_change', phase: 'Code', workflow: '/web' })
```

Hoặc HTTP POST từ bất kỳ đâu:
```bash
curl -X POST http://localhost:2910/emit -H "Content-Type: application/json" \
  -d '{"type":"task_start","from":"pxh-pm","to":"pxh-expert","tier_from":"T2","tier_to":"T3","phase":"code","message":"→ Task routed"}'
```

### Event types

| type | Mô tả | Fields quan trọng |
|------|-------|-------------------|
| `phase_change` | Chuyển phase | phase, workflow |
| `task_start` | Gửi task đến agent | from, to, tier_from, tier_to, phase |
| `task_end` | Task hoàn thành | from, status (ok/fail) |
| `contract` | Contract flow giữa tầng | tier_from, tier_to |
| `agent_status` | Agent thay đổi | from, message |

## 3 chế độ

| Chế độ | Cách chạy | Cơ chế |
|--------|-----------|--------|
| **Live** | `server.mjs` → browser | Watch events log + SSE push |
| **Real** | `office.mjs` (có events) | fs.watch events log |
| **Demo** | `office.html` trực tiếp / `office.mjs` (không events) | Auto-simulate |

## File structure

| File | Vai trò |
|------|---------|
| `templates/office.html` | Webview 2D cartoon office |
| `templates/office.mjs` | Terminal TUI |
| `templates/server.mjs` | HTTP + SSE server cho webview |
| `templates/emit-event.mjs` | Shared event emitter (CLI + module) |
| `_shared/office-events.log` | Event log (append-only, auto-created) |

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Chạy office.html trực tiếp, không cần server" | Thiếu SSE sync → webview tĩnh, không real-time |
| "Không cần emit event, office tự animate" | Agent sẽ không hiển thị đúng trạng thái thực tế |
| "Một chế độ là đủ" | Live/Real/Demo mỗi chế độ phục vụ mục đích khác nhau |

## Red Flags

- Server chạy nhưng webview trắng (check port 2910)
- Event emitted nhưng webview không update (SSE connection?)
- Bridge không watch được file (permission denied)
- TUI không emit event (thiếu `--type` flag)

## Verification

- [ ] `server.mjs` chạy → `http://localhost:2910` hiển thị office
- [ ] Emit event → webview update real-time
- [ ] Emit event → TUI update real-time
- [ ] 3 chế độ (live/real/demo) đều hoạt động
- [ ] Ctrl+C server → cleanup sạch
