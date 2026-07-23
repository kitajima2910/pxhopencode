---
name: pxh-office
tier: Virtual
role: Virtual Office TUI — real-time 4-tier visualization
mode: subagent
---

# pxh-office — Virtual Office TUI

**Virtual tier** — chạy song song với opencode, visualize 4-tier architecture real-time.

## Trách nhiệm

1. Mở Văn Phòng Ảo trong terminal riêng
2. Hiển thị 4 tầng (T1-T4) với pixel-art agent cards
3. Animate contract flow giữa các tầng
4. Cập nhật real-time status (workflow, phase, elapsed, active agent)
5. Log hoạt động gần nhất

## Architecture

```
Terminal (TUI)                    Browser (Webview)
     │                                  │
     ├── office.mjs (TUI)               ├── server.mjs (HTTP + SSE)
     │   │                              │   │
     │   └── office-events.log ←────────┤   └── office.html (2D cartoon)
     │       (fs.watch)                 │
     │                                  │
     └── office-bridge.mjs ─────────────┘
         (file watcher + polling → emit event)
```

## Cách dùng

```bash
/office
```

Hoặc chạy tay:

**Webview + Bridge (khuyên dùng)** — real-time sync với workspace activity:
```bash
node skills/virtual-office/templates/server.mjs
# Browser → http://localhost:2910
# Tự động detect file changes → emit event → webview animation
```

**TUI** — terminal UI:
```bash
node skills/virtual-office/templates/office.mjs
```

**Bridge standalone** — nếu muốn chạy bridge riêng:
```bash
node skills/virtual-office/templates/office-bridge.mjs
```

## Input

- **Tự động**: `office-bridge.mjs` phát hiện thay đổi file trong workspace (polling 3s)
- **Thủ công**: `emit-event.mjs --type task_start --from X --to Y`
- **Demo mode**: Tự simulate khi không có real events

## Output

- Terminal UI (TUI) với box-drawing characters + ANSI colors
- Webview 2D cartoon (browser) với nhân vật, bàn ghế, contract bay
- Real-time status bar: workflow, phase, active agent, elapsed, retry
- Activity log

## Bridge — Cơ chế tự động emit event

`office-bridge.mjs` chạy tích hợp trong `server.mjs`:
1. Poll mỗi 3s quét workspace (skills/, workflows/, agents/, _shared/)
2. Phân loại file theo extension → map tới agent + tier
3. Emit `phase_change` → `task_start` → `task_end` sequence
4. Trực tiếp broadcast qua SSE (không cần HTTP)

Manual emit qua CLI:
```bash
node skills/virtual-office/templates/emit-event.mjs --type task_start --from pxh-pm --to pxh-expert --message "Code task"
```

Hoặc HTTP POST:
```bash
curl -X POST http://localhost:2910/emit -H "Content-Type: application/json" -d '{"type":"task_start","from":"pxh-pm","to":"pxh-expert"}'
```

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Visual không cần thiết" | Giúp hiểu architecture ngay lập tức |
| "Dùng thư viện TUI" | Zero dep, Node.js thuần, chạy mọi nơi |
| "Phải emit event tay" | Bridge tự động detect workspace activity |

## Red Flags

- Cần Node.js 18+
- Terminal cần hỗ trợ ANSI + Unicode
- Polling 3s — độ trễ tối đa 3s khi phát hiện thay đổi

## Verification

- [ ] `node server.mjs` → Bridge: ✓ Active
- [ ] Webview http://localhost:2910 hiển thị 4 tầng
- [ ] Tạo/sửa file .ts/.md/.css → webview animate real-time
- [ ] Activity log cập nhật
- [ ] Status bar hiển thị workflow + phase + agent
- [ ] Ctrl+C thoát sạch
