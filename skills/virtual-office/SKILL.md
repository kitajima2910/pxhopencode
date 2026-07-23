---
name: virtual-office
description: Virtual Office — Webview TUI with 2D cartoon agents in office environment. Visualize 4-tier architecture real-time. Zero dependencies.
---

# Virtual Office — Văn Phòng Ảo

> Văn phòng AI 2D với nhân vật hoạt hình — xem các agent làm việc trong văn phòng 4 tầng, có bàn ghế, máy tính, contract bay giữa các tầng.

## Event Sync — Đồng bộ Real-time với TUI

Virtual Office có cơ chế **Event Log Bridge** đồng bộ real-time với thao tác trên TUI (terminal).

### Kiến trúc Event Sync

```
Agent (T2/T3)                          Office Viewer
     │                                       │
     ├── CLI: node emit-event.mjs ───────────┤
     │   --type task_start                   │
     │   --from pxh-pm                       │
     │   --to pxh-expert                     │
     │   --message "Task{code} sent"         │
     │                                       │
     └──→ office-events.log ←────────────────┘
              (append-only)     │
                               ├──→ office.mjs (fs.watch → ANSI TUI)
                               └──→ server.mjs (SSE → browser)
```

### Cách emit event

**CLI** (từ terminal — agents gọi):
```bash
node skills/virtual-office/templates/emit-event.mjs \
  --type task_start \
  --from pxh-pm \
  --to pxh-expert \
  --tier_from T2 \
  --tier_to T3 \
  --phase code \
  --message "→ Task{code} sent to pxh-expert"
```

**Module** (import trong JS/TS):
```javascript
import { emit } from './emit-event.mjs'
emit({ type: 'task_start', from: 'pxh-pm', to: 'pxh-expert', message: '...' })
```

**HTTP POST** (từ script/skill khác):
```bash
curl -X POST http://localhost:3000/emit \
  -H "Content-Type: application/json" \
  -d '{"type":"task_start","from":"pxh-pm","to":"pxh-expert","message":"..."}'
```

### Event types

| type | Khi nào | Effect |
|------|---------|--------|
| `phase_change` | T2 chuyển phase | Cập nhật phase bar, chuyển agent |
| `task_start` | T2 gửi task cho T3 | Highlight agent, animate contract |
| `task_end` | T3 hoàn thành task | Log kết quả, remove highlight |
| `contract` | Contract flow giữa tầng | Bay giấy giữa floors |
| `agent_status` | Agent thay đổi trạng thái | Log + update |
| `system` | Sự kiện hệ thống | Log message |

## Hai giao diện

| Giao diện | File | Yêu cầu |
|-----------|------|---------|
| **Webview** (2D Cartoon) | `templates/office.html` | Browser + server cho real-time |
| **TUI** (Terminal) | `templates/office.mjs` | Node.js 18+ |

## Webview — Văn Phòng Hoạt Hình 2D

Mở qua server (khuyên dùng — có real-time sync):

```bash
node skills/virtual-office/templates/server.mjs
# Browser → http://localhost:3000
# SSE events: http://localhost:3000/events
# POST emit:  http://localhost:3000/emit
```

Hoặc mở trực tiếp (chỉ demo, không sync):
```bash
start skills/virtual-office/templates/office.html
```

### Tính năng

- **4 tầng văn phòng**: T1 Lễ tân → T2 CEO → T3 Open Space → T4 Server room
- **11 nhân vật hoạt hình**: Mỗi agent có ngoại hình, màu sắc, kiểu tóc riêng
- **Trang bị văn phòng**: Bàn làm việc, máy tính, server rack, cây xanh, bàn họp
- **Animation**: Character động (gõ máy, vẫy tay), contract bay giữa tầng, server LED nhấp nháy
- **Status bar**: Workflow, Phase, Active agent, Elapsed time
- **Activity log**: Log real-time góc phải
- **Click vào agent** để focus
- **Chạy trên browser**: Không cần cài đặt, zero dependency

## TUI — Terminal UI

Chạy trong terminal riêng (song song với opencode):

```bash
node skills/virtual-office/templates/office.mjs
```

Hoặc dùng lệnh `/office`:

```
/office
```

## Kiến trúc

| Thành phần | Mô tả |
|-----------|-------|
| **T1 — Interface** | pxh-help — Lễ tân, tiếp nhận yêu cầu |
| **T2 — Orchestration** | pxh-pm — CEO điều phối công việc |
| **T3 — Workers** | 7 nhân viên (ARCH, CODE, FIX, QA, RVW, DEVOPS, UIUX) |
| **T4 — Infrastructure** | pxh-save-history — Quản lý server, lưu trữ |

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Không cần visual, CLI text là đủ" | Visual giúp hiểu ngay hệ thống 4 tầng, đặc biệt với người mới |
| "Animation phức tạp quá" | CSS animation + JS setTimeout — đơn giản, hiệu quả |
| "Cần framework để vẽ 2D" | HTML/CSS/JS thuần — đủ cho cartoon characters |
| "Webview cần server" | Mở file .html trực tiếp trên browser |

## Red Flags

- Webview: Cần browser hiện đại (Chrome/Edge/Firefox)
- Webview: file:// protocol không fetch được STATUS.md
- TUI: Terminal không hỗ trợ Unicode/ANSI
- TUI: Cần Node.js 18+

## Verification

### Webview
- [ ] `office.html` mở được trên browser
- [ ] 4 tầng hiển thị với nhân vật + đồ đạc
- [ ] Nhân vật animation (thở, gõ máy)
- [ ] Contract bay giữa các tầng
- [ ] Status bar cập nhật
- [ ] Activity log hiển thị
- [ ] Click agent → focus + speech bubble

### TUI
- [ ] `node office.mjs` chạy không lỗi
- [ ] 4 tầng + agent cards + status bar
