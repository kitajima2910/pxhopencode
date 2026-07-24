# Workflow Office — Virtual Office VSCode Extension

> Văn Phòng Ảo trong sidebar VSCode — đồng bộ real-time với workspace activity.

## Cài đặt

```powershell
.\pxh-install-extension.bat install          # VS Code Stable
.\pxh-install-extension.bat install insiders  # VS Code Insiders
.\pxh-install-extension.bat uninstall         # Gỡ cài đặt
```

Restart VS Code → mở sidebar với icon `$(organization)` "PXH Virtual Office".

## Event Sync System

Extension tự động đồng bộ với workspace qua 2 cơ chế:

1. **File watcher** (`eventWatcher.js`): Poll `_shared/office-events.log` và `_shared/opencode-state.json` mỗi 500ms, gửi event tới webview qua `postMessage`
2. **Background server** (`server.mjs`): Chạy background port 2910, xử lý POST /emit và /state, ghi vào events log

### Manual emit event

```bash
node skills/virtual-office/templates/emit-event.mjs \
  --type task_start --from pxh-pm --to pxh-expert \
  --message "→ Task routed"
```

Hoặc HTTP POST:
```bash
curl -X POST http://localhost:2910/emit -H "Content-Type: application/json" \
  -d '{"type":"task_start","from":"pxh-pm","to":"pxh-expert","message":"→ Task routed"}'
```

## File structure

| File | Vai trò |
|------|---------|
| `extension/src/extension.js` | Extension entry, activate/deactivate, spawn server |
| `extension/src/eventWatcher.js` | File watcher + state poller → webview postMessage |
| `extension/src/officeViewProvider.js` | Webview provider, HTML injection, postMessage bridge |
| `extension/media/office.html` | Webview 2D cartoon canvas |
| `templates/server.mjs` | Background API server (port 2910) |
| `templates/emit-event.mjs` | Event emitter CLI + module |
| `templates/agent-runtime.mjs` | Agent state management |
| `templates/hook-provider.mjs` | OpenCode event normalization |
| `templates/messages.mjs` | Message type definitions |

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Visual không cần thiết, CLI text là đủ" | Visual giúp hiểu ngay hệ thống 4 tầng |
| "Cần chạy browser cho webview" | Extension sidebar hoạt động trong VS Code — không cần browser riêng |
| "Animation phức tạp" | HTML/CSS/JS thuần, zero dependencies |

## Red Flags

- Cần VS Code 1.85+
- Port 2910 phải trống (server.mjs background process)
- Extension cần workspace mở để eventWatcher hoạt động

## Verification

- [ ] `pxh-install-extension.bat install` thành công
- [ ] Sidebar hiển thị icon "PXH Virtual Office"
- [ ] Webview render 11 agents + office furniture + pets
- [ ] State badges cập nhật khi có workspace activity
- [ ] `Ctrl+Shift+P` → "PXH Office: Emit Event" hoạt động
