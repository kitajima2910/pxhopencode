---
name: virtual-office
description: Virtual Office — VSCode extension sidebar visualization with 2D cartoon agents in office environment. Real-time 4-tier architecture visualization.
---

# Virtual Office — VSCode Extension Sidebar

> Văn phòng AI 2D trong sidebar VSCode — xem các agent làm việc trong văn phòng mở, có bàn ghế, máy tính, contract bay giữa các agent.

## Kiến trúc

VSCode Extension (`skills/virtual-office/extension/`) cung cấp webview sidebar hiển thị 11 agent pixel-art real-time.

```
VSCode Extension                          Background Server
     │                                         │
     ├── eventWatcher.js                       ├── server.mjs (port 2910)
     │   (fs.watch _shared/ events)            │   (API: /emit, /state)
     │                                         │
     ├── officeViewProvider.js                 └── emit-event.mjs
     │   (webview + postMessage bridge)            (CLI emit → events log)
     │
     └── media/office.html
         (2D cartoon canvas)
```

## Cài đặt

```powershell
.\pxh-install-extension.bat install          # VS Code Stable
.\pxh-install-extension.bat install insiders  # VS Code Insiders
.\pxh-install-extension.bat uninstall         # Gỡ cài đặt
```

Restart VS Code → Virtual Office xuất hiện ở sidebar với icon `$(organization)`.

## Event Sync

Extension tự động đồng bộ với workspace activity qua 2 cơ chế:

1. **File watcher** (`eventWatcher.js`): Poll `_shared/office-events.log` và `_shared/opencode-state.json` mỗi 500ms
2. **Background server** (`server.mjs`): Xử lý event POST từ CLI tools, ghi vào events log

### Emit event từ CLI

```bash
node skills/virtual-office/templates/emit-event.mjs \
  --type agent_status \
  --from pxh-expert \
  --message "Code completed"
```

### Emit event từ code

```javascript
import { emit } from './emit-event.mjs'
emit({ type: 'agent_status', from: 'pxh-expert', message: 'Code completed' })
```

## Tính năng

- **Văn phòng mở 2D**: 11 pixel-art agent ngồi làm việc tại bàn, mèo + chó đi dạo
- **Speech bubbles**: Real-time hiển thị activity của từng agent
- **Dashed signals**: Nối agents theo data flow
- **State badges**: Nhấp nháy cạnh tên agent — biết agent nào đang làm gì
- **Activity log**: Log corner hiển thị sự kiện gần nhất
- **Click agent**: Focus + hiển thị chi tiết

## Cấu trúc thư mục

| File | Vai trò |
|------|---------|
| `extension/src/extension.js` | Extension entry point |
| `extension/src/eventWatcher.js` | File watcher + state poller |
| `extension/src/officeViewProvider.js` | Webview provider + postMessage bridge |
| `extension/media/office.html` | Webview 2D canvas UI |
| `extension/media/renderer-state.js` | State store cho webview |
| `templates/server.mjs` | Background API server (port 2910) |
| `templates/emit-event.mjs` | Event emitter (CLI + module) |
| `templates/agent-runtime.mjs` | Agent state management |
| `templates/hook-provider.mjs` | OpenCode event normalization |
| `templates/messages.mjs` | Message type definitions |
| `templates/renderer-state.js` | State store (inlined vào webview) |

## Anti-Rationalization
| Excuse | Reality |
|--------|---------|
| "Office chỉ là visual, lỗi không sao" | User mất niềm tin vào AI team |
| "Event sync chậm vài giây cũng được" | UX tệ, agent speech bubble lag |
| "Không cần test extension, manual là đủ" | Regression mỗi lần thêm tính năng mới |

## Red Flags

- Cần VS Code 1.85+
- Extension cần workspace để hoạt động (eventWatcher cần `_shared/`)
- Port 2910 phải trống (server.mjs background process)

## Verification

- [ ] VS Code sidebar hiển thị icon `$(organization)` "PXH Virtual Office"
- [ ] Webview render đúng 11 agents + pets + office furniture
- [ ] State badges cập nhật khi agent hoạt động
- [ ] Speech bubbles hiển thị đúng message
- [ ] Activity log có sự kiện khi workspace thay đổi
- [ ] `Ctrl+Shift+P` → "PXH Office: Open Virtual Office" hoạt động
