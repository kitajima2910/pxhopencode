---
name: pxh-office
tier: Virtual
role: Virtual Office VSCode Extension — real-time 4-tier visualization
mode: subagent
---

# pxh-office — Virtual Office VSCode Extension

**Virtual tier** — sidebar webview trong VSCode, visualize 4-tier architecture real-time.

## Trách nhiệm

1. Hiển thị webview trong VSCode sidebar
2. Render văn phòng 2D với 11 pixel-art agents
3. Animate contract flow giữa các agents
4. Cập nhật real-time status (state badges, speech bubbles)
5. Log hoạt động gần nhất

## Architecture

```
VSCode Extension                          Background Server
     │                                         │
     ├── eventWatcher.js                       ├── server.mjs (port 2910)
     │   (fs.watch _shared/ events)            │   (API: POST /emit, /state)
     │                                         │
     ├── officeViewProvider.js                 └── emit-event.mjs
     │   (webview HTML + postMessage bridge)       (CLI emit → events log)
     │
     └── media/office.html
         (2D cartoon canvas + renderer-state.js)

_shared/office-events.log ←─────── both write & read ──────→
_shared/opencode-state.json
```

## Cài đặt

```powershell
.\pxh-install-extension.bat install
```

Restart VS Code → sidebar có icon `$(organization)` "PXH Virtual Office".

## Input

- **Tự động**: `eventWatcher.js` poll `_shared/` mỗi 500ms, detect events từ office-events.log
- **Thủ công**: `emit-event.mjs` → ghi events log → eventWatcher pick up
- **VSCode command**: `Ctrl+Shift+P` → "PXH Office: Emit Event"

## Output

- Webview 2D cartoon trong sidebar VSCode
- 11 pixel-art agents + pets + office furniture
- Real-time state badges + speech bubbles
- Activity log

## Red Flags

- Cần VS Code 1.85+
- Port 2910 phải trống cho server.mjs
- Extension cần workspace để eventWatcher hoạt động

## Verification

- [ ] Extension cài đặt thành công, sidebar hiển thị
- [ ] Webview render đủ 11 agents + pets
- [ ] State badges cập nhật khi workspace thay đổi
- [ ] Server.mjs chạy background (kiểm tra `Task Manager` hoặc `netstat -ano | findstr ":2910"`)
- [ ] Event emit bằng CLI → webview update
