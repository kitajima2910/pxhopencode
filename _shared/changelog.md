# Changelog

## v72 — Fix bugs + Clean project
Xoá 23 dev artifact files (11 root .js + 12 _shared/), clear 3 runtime logs (free ~1.5MB), fix `/ui-ux` command bug (đang trỏ sai vào debug workflow), runtime logs thêm vào `.gitignore`.

## v71 — Review + Refactor + Optimize
Fix `pxh-expert.md` QUY_TRÌNH section bị split; sửa STATUS.md agent count (12) + skills count (33); thêm memory reflection step vào T3 worker layer; thêm step load skill vào memory startup.

## v70 — Vibe Coding Memory Engine v1.0
13 file `.memory/` storage, 10 memory categories (project, architecture, patterns, bugs, decisions, preferences, workflow, prompt, vibe, snapshots), timeline + stats, `runtime/memory/` module with README + 5 contracts, `skills/vibe-memory/SKILL.md` for agent integration, Startup-Pipeline, Reflection Engine, Confidence System, Token-Optimierung, auto-project-detection.

## v69 — Per-agent log dialog boxes
Thêm function `drawAgentLogDialog()` vẽ panel log trong suốt gần desk mỗi agent, hiển thị 5 dòng log gần nhất. `drawComicBubble` mở rộng từ 2 lên 5 dòng. Timeout speech bubble kéo dài 8s cho active agents. Fix v69a: Sitting agents hiển thị `drawAgentLogDialog`. Fix v69b: Fix missing `drawMonitor()`. Fix v69c: Fix animation không xảy ra — root cause `opencode-state.json` idle.

## v68 — Fix agents không ngồi bàn
Thêm 2 cơ chế fallback eventWatcher: watcher `opencode-activity.log` + detector temp file. Tạo `_shared/workflow-hook.md`. Thêm instruction vào `opencode.json`.

## v67 — Fix màn hình đen Virtual Office
2 bugs: (1) Build script tạo `office.js` thiếu `}` → syntax error. (2) CSP không nonce → VS Code 1.130+ chặn inline script.

## v66 — Fix không thấy Virtual Office trên VS Code 1.130+
VS Code 1.130 dùng `extensions.json` manifest. Fix: thêm bước PowerShell register entry vào `extensions.json`.

## v65 — Fix batch tạo file `]`
`^^>` trong 2 lệnh `echo` ở `pxh-install-extension.bat` khiến cmd.exe hiểu `>` là redirect. Fix: `^^^>`.

## v64 — Fix không thấy Virtual Office sau install
`.obsolete` file chứa `pxh.pxh-virtual-office-1.0.0:true` khiến VS Code bỏ qua. Fix: xoá entry khỏi `.obsolete`.

## v59 — Redesign desk/furniture
chair vẽ TRƯỚC body, desk có chân + roundRect, laptop row vẽ clamshell, đồng bộ desk styling, `var`→`const`.

## v57 — Colorize logs theo agent
Agent logs dùng màu `AGENTS[agentId].c` thay vì keyword-match, fallback keyword cho system entries.

## v56 — Mở rộng PXHOpenCode mirror
Bỏ guard `currentState==='typing'`, ALL messages đẩy vào `_monitorLog`.

## v55 — Clean dead code
Xóa 5 functions không dùng (~50 dòng) + flag `hrw` + comment disabled + file `test-eventwatcher.js` rỗng.

## v54 — Fix 4 agent bugs
Walking agents về desk khi session start, stale timeout speech bubble, `isIdle` bắt `active:false`, `startTyping` không leak interval.

## v53 — Render layer fix + Audit
PXHOpenCode vẽ sau terminal screen, fix vô hình khi wandering, audit agent logic.

## v52 — PXHOpenCode vào desk khi session active
Thêm `state._sessionActive` trigger, guard `poc._lastEvt!==0`.

## v51 — PXHOpenCode Terminal Re-enable
Banner hiển thị task logs, `_monitorLog` re-enabled, `addLog()` đẩy logs, fix duplicate log.

## v50 — Release
Extension-only Virtual Office, remove standalone browser/TUI, arch check 0 errors, tagged release v50.

## v49 — User Guide Rewrite
README repositioned as user guide, 3 cách vibe code front-and-center, commit count sync.

## v48 — Prompt Optimizer
`prompt-optimizer.md` — auto-rewrite prompt mơ hồ, collapsible `<details>` panel, integration vào opencode.json.

## v47 — Bat Merge
`pxh-office-on.bat` + `pxh-office-off.bat` → `pxh-office.bat`, xóa 2 file cũ.

## v46 — Open Office & Real-time Agent Sync
Single-floor open space, 11 pixel-art agents, mèo+chó, speech bubbles, dashed signals, state badges, `pxh-office.bat`.

## v45 — Virtual Office TUI
`pxh-office` agent, pixel-art agents, contract flow animation, webview 2D Cartoon, SSE event sync.

## v32–v44 — Foundation & Hardening
- v44: Context compaction, tool output truncation, skill lazy loading, live preview
- v43: AI Studio debug pipeline, Polish Pipeline, game eval assertions
- v42: Godot removal
- v40: Observability & Alerting, Contract versioning, Mermaid diagrams
- v32: Initial foundation — 4-tier architecture, 10 agents, 8 workflows, 28 skills
