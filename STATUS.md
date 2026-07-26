# 📊 pxhopencode — AI Company cho Vibe Coding

## 🎯 Tổng quan

| Trường | Giá trị |
|--------|---------|
| Giai đoạn | PHÁT HÀNH ✅ |
| Mô hình | AI Company — 4-Tầng Enterprise AI Runtime + Virtual Office |
| Phiên bản | v76 |
| Agents | 12 (10 Tầng 1-4 + Virtual + Mirror) |
| Workflows | 9 theo lĩnh vực |
| Skills | 49 skills (8 Process + 8 Web + 12 Game + 7 Game Principle + 1 Game Orchestrator + 5 AI + 5 Tool + 1 UI/UX + 1 Virtual Office + 1 Vibe Memory) |
| Contracts | 6 cấu trúc |
| Policies | 3 (Thử lại, Phục hồi, Phản ánh) |

## 🔗 Ma trận liên kết

| Thành phần | Agents | Runtime | Workflows | Skills | Contracts | Policies |
|-----------|--------|---------|-----------|--------|-----------|----------|
| **agents/** | — | ✅ Thẻ layer | ✅ Liên kết giai đoạn | ✅ Tham chiếu | ✅ Tham chiếu | ✅ Tham chiếu |
| **runtime/** | ✅ Agents | — | ✅ Luồng | — | ✅ Sơ đồ | ✅ Thi hành |
| **workflows/** | ✅ Tham chiếu | ✅ Luồng | — | ✅ Tham chiếu | ✅ Tham chiếu | ✅ Tham chiếu |
| **skills/** | ✅ Agent dùng | ✅ Ngữ cảnh | ✅ Được gọi | — | ✅ Tham chiếu | — |
| **runtime/contracts/** | ✅ | ✅ Hướng | ✅ Luồng | — | — | ✅ Tương tác |
| **runtime/policies/** | ✅ Agent | ✅ Tầng thi hành | — | — | ✅ Tham chiếu | — |

## 📁 Cấu trúc

```
.opencode/
├── opencode.json           # Config: agents, commands, skills
├── README.md / STATUS.md   # Tổng quan + Dashboard
├── agents/                 # 12 agents (Tầng 1-4 + Virtual + Mirror)
├── runtime/                # 4 tầng, memory, contracts, policies
├── workflows/              # 9 workflow templates
├── skills/                 # 5 lĩnh vực, 33 skills + templates/
└── _shared/                # Dùng chung: templates, scripts, agent-listing
```

## ✅ Process Skill Upgrade — Superpowers Reference
- **Tham khảo**: [obra/superpowers/skills](https://github.com/obra/superpowers/tree/main/skills) — 14 process skills
- **New skills (8)**: `process-driven-development`, `process-parallel-agents`, `process-systematic-debugging`, `process-writing-plans`, `process-tdd`, `process-verification`, `process-code-review`, `process-finishing-branch`
- **Pattern adopted**: Iron Law (Luật sắt), Core Principle, Anti-Rationalization, When-to-Use decision
- **Existing skills upgraded (6)**: ais-agents, ais-llm, ais-production, webs-frontend, webs-backend, webs-testing — thêm Iron Law + Core Principle
- **Agents updated (4)**: pxh-pm, pxh-expert, pxh-fix-bugs, pxh-qa, pxh-review-code — reference process skills
- **Total skill count**: 33 → **39** (+8 process skills, -2 merged)

## ✅ Token Optimization

| Cải tiến | Savings |
|----------|---------|
| Code SKILL.md → templates/ (22 files) | -3.171 dòng |
| Game implementation → templates/ (6 files) | -1.714 dòng |
| Agent normalization (9 files) | -837 dòng |
| Workflow trim + shared includes | -400 dòng |
| runtime/README.md, README.md trim | -179 dòng |
| **V2.0: Agent slim (9 files)** | **-227 dòng (-39%)** |

| **V2.0: Contracts schema concise** | **-29 dòng** |
| **V2.0: Skill quickref → 29 SKILL.md reads avoided** | **-728 dòng (-96%)** |
| **V2.0: Context budget + tiered loading** | **~-50% token/phiên** |
| **V3.0: workflow-hook.md slim (159→43 dòng)** | **-116 dòng (-73%)** |
| **V3.0: contracts.md merge → xoá file** | **-76 dòng + 1 read** |
| **V3.0: prompt-optimizer.md trim (53→35 dòng)** | **-18 dòng (-34%)** |
| **V3.0: README.md changelog → _shared/** | **-124 dòng (-35% README)** |
| **Total** | **~7.284 + 334 = ~7.618 dòng khỏi prompt context** |

## ✅ Vibe Coding Memory Engine v1.0

- [x] `.memory/` — 13 initialisierte Speicherdateien (Index, Projekt, Architektur, Patterns, Bugs, Decisions, Preferences, Workflow, Prompt, Vibe, Snapshots, Timeline, Stats)
- [x] `runtime/memory/README.md` — Memory Engine Dokumentation + Kategorien + Startup-Pipeline
- [x] Contracts merged into `runtime/memory/README.md` — 5 Memory-Contracts (Query, Result, Update, Reflection, SessionStart)
- [x] `skills/vibe-memory/SKILL.md` — Skill für Agents: API, Token-Optimierung, Verification
- [x] `opencode.json` — Instructions registriert, Skill-Pfad aktiviert
- [x] `runtime/README.md` — Memory Engine in Übersicht referenziert
- [x] Memory speichert NUR strukturiertes Wissen, keine Chat-Verläufe
- [x] `.gitignore` chặn `.memory/` — mỗi user có memory riêng, không lẫn với pxhopencode dev
- [x] `runtime/memory/init.json` — seed template cho agents auto-create `.memory/` ở workspace root
- [x] 10 Memory-Kategorien | 5 Contracts | Startup-Pipeline | Reflection Engine | Confidence-System | Token-Optimierung
- [x] Instruction `runtime/memory/README.md` viết lại dạng imperative — buộc agent thực thi startup pipeline mỗi session

## 🚀 Changelog

| Ngày | Phiên bản | Thay đổi |
|------|-----------|----------|
| 2026-07-26 | v76 | **Agent Skills Hub Game Upgrade** — Tham khảo [agent-skills-hub/game-development](https://github.com/agent-skills-hub/agent-skills-hub/tree/main/skills/game-development). Tạo orchestrator `skills/game-development/SKILL.md` bridge implementation (pxhopencode) + principles (agent-skills-hub). Tạo 7 principle sub-skills mới: `game-art`, `game-design`, `multiplayer`, `vr-ar`, `web-games`, `mobile-games`, `pc-games`. Update `/game` command, `game.workflow.md`, `opencode.json`. Skill count: 39→46. |
| 2026-07-26 | v75 | **UI/UX Pro Max Upgrade** — Tham khảo [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). Nâng cấp `skills/ui-ux/SKILL.md`: priority-based rule categories (1-10, Critical→Low), design system workflow (Analyze → Tokens → Supplement), design dials (variance/motion/density), design tokens section, pre-delivery checklist merge. Giữ nguyên game HUD, CLI design system, anti-rationalization. |
| 2026-07-26 | v74 | **Superpowers Skill Upgrade** — Tham khảo [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills). Tạo 8 process skills mới (driven-development, parallel-agents, systematic-debugging, writing-plans, tdd, verification, code-review, finishing-branch). Nâng cấp 6 existing skills với Iron Law + Core Principle. Update 5 agents reference process skills. Skill count: 33→39. |
| 2026-07-26 | v73 | **Token Optimization V3.0** — Slim `workflow-hook.md` 159→43 dòng (-73%), merge `contracts.md` vào README (xóa file), trim `prompt-optimizer.md` 53→35 dòng (-34%), move README changelog → `_shared/changelog.md` (-124 dòng). Tổng savings: ~334 dòng + 1 file read mỗi session. |
| 2026-07-26 | v72 | **Fix bugs + Clean project** — Xoá 23 dev artifact files (11 root .js + 12 _shared/), clear 3 runtime logs (free ~1.5MB), fix `/ui-ux` command bug (đang trỏ sai vào debug workflow), runtime logs thêm vào `.gitignore` |
| 2026-07-26 | v71 | **Review + Refactor + Optimize** — Fix `pxh-expert.md` QUY_TRÌNH section bị split; sửa STATUS.md agent count (12) + skills count (33); thêm memory reflection step vào T3 worker layer; thêm step load skill vào memory startup |
| 2026-07-26 | v70 | **Vibe Coding Memory Engine v1.0** — 13 file `.memory/` storage, 10 memory categories (project, architecture, patterns, bugs, decisions, preferences, workflow, prompt, vibe, snapshots), timeline + stats, `runtime/memory/` module with README + 5 contracts, `skills/vibe-memory/SKILL.md` for agent integration, Startup-Pipeline, Reflection Engine, Confidence System, Token-Optimierung, auto-project-detection |
| 2026-07-25 | v69 | **Per-agent log dialog boxes khi agents ngồi bàn làm việc** — Thêm function `drawAgentLogDialog()` vẽ panel log trong suốt gần desk mỗi agent, hiển thị 5 dòng log gần nhất từ `_monitorLog` kết hợp speech bubble. `drawComicBubble` mở rộng từ 2 lên 5 dòng. Timeout speech bubble kéo dài 8s cho active agents (giữ nguyên 3s cho idle). `_msgs` tăng từ 2 lên 5 entry. Restore office.js từ git HEAD~1 + VSCode Bridge. **Fix v69a**: Sitting agents (ngồi bàn) cũng hiển thị `drawAgentLogDialog` — trước đó chỉ standing/walking agents mới có enhanced dialog, agents tại desk chỉ dùng `drawComicBubble` cũ thiếu `_monitorLog`.
| 2026-07-25 | v69b | **Fix missing `drawMonitor()` function** — `office.js` gọi `drawMonitor()` để vẽ màn hình lớn tại desk CEO và PXHOpenCode, nhưng function chưa từng được định nghĩa → `ReferenceError`. Thêm function vẽ màn hình 68x44 với dark screen + label "PXH2910 • Terminal". |
| 2026-07-25 | v69c | **Fix animation không xảy ra trong Virtual Office** — Root cause: `opencode-state.json` ở trạng thái `idle` → eventWatcher không phát hiện activity → `applyStateDiff` không được gọi → agents không nhận lệnh ngồi bàn. Fix: ghi state `workflow_start` và activity log markers. Ngoài ra fix `_lastEvt:performance.now()` thành `Date.now()` để đồng bộ timebase với `applyStateDiff` (dù speech bubble timeout đang bị comment out). | |
| 2026-07-25 | v68 | **Fix agents không ngồi bàn khi xử lý prompt** — Root cause: không có process nào ghi state update vào `_shared/opencode-state.json` khi TUI xử lý prompt → eventWatcher không detect activity → agents không được lệnh ngồi bàn. Fix: (1) Thêm 2 cơ chế fallback trong `eventWatcher.js`: watcher `opencode-activity.log` (phát hiện content mới + marker `[workflow_start]/[workflow_end]`) + detector temp file (`opencode-out*.txt`). (2) Tạo `_shared/workflow-hook.md` — instruction cho AI agent tự ghi state vào `opencode-state.json`. (3) Thêm instruction vào `opencode.json`. Agents giờ sẽ ngồi bàn khi phát hiện hoạt động qua bất kỳ kênh nào. |
| 2026-07-25 | v67 | **Fix màn hình đen Virtual Office + JS không chạy** — 2 bugs chồng: (1) Build script tạo `office.js` bị thiếu `}` đóng `function init()` do replacement không bao gồm `state.startTime=Date.now();requestAnimationFrame(animate)` → syntax error → toàn bộ inline script không execute. (2) CSP không nonce → VS Code 1.130+ chặn inline script. Fix: nonce-based CSP + inline JS, sửa syntax error init closure, thêm resize retry loop. Thêm nút 🐛 toggle debug overlay. Đổi banner terminal thành "PXH2910 - AI Company --- Task Logs" |
| 2026-07-25 | v66 | **Fix không thấy Virtual Office trên VS Code 1.130+** — VS Code 1.130 dùng `extensions.json` manifest thay vì scan directory để liệt kê extension. Batch copy file vào thư mục extensions nhưng không đăng ký trong manifest → extension vô hình. Fix: thêm bước PowerShell register entry vào `extensions.json` |
| 2026-07-25 | v65 | **Fix batch tạo file `]` (spurious redirect)** — `^^>` trong 2 lệnh `echo` ở `pxh-install-extension.bat` khiến cmd.exe hiểu `>` là redirect, tạo file `]`. Fix: `^^^>` — caret thứ 3 escape `>` |
| 2026-07-25 | v64 | **Fix không thấy Virtual Office sau install** — `.obsolete` file chứa `pxh.pxh-virtual-office-1.0.0:true` khiến VS Code bỏ qua extension dù đã copy vào extensions folder. Fix: xoá entry khỏi `.obsolete` khi install, thêm cleanup step vào `pxh-install-extension.bat` |
| 2026-07-25 | v59 | **Redesign desk/furniture + fix agent direction** — chair vẽ TRƯỚC body (depth đúng), desk có chân + roundRect, laptop row vẽ laptop clamshell thay monitor, đồng bộ desk styling (PM/Help/Historian), `var`→`const` |
| 2026-07-25 | v57 | **Colorize logs theo agent** — `drawAgentMonitor()` + PXHOpenCode terminal dùng `AGENTS[entry.s].c` thay vì keyword-match, fallback keyword cho system entries |
| 2026-07-25 | v56 | **Mở rộng PXHOpenCode mirror** — bỏ guard `currentState==='typing'`, ALL messages từ PXHOpenCode đẩy vào `_monitorLog` terminal bất kể state |
| 2026-07-25 | v55 | **Clean dead code** — xóa 5 functions không dùng (~50 dòng) + flag `hrw` + comment disabled + file `test-eventwatcher.js` rỗng |
| 2026-07-25 | v54 | **Fix 4 agent bugs** — (1) walking agents về desk khi session start, (2) stale timeout không xóa speech bubble khi active, (3) `isIdle` bắt `active:false`, (4) `startTyping` không leak interval |
| 2026-07-25 | v53 | **Render layer fix + Audit** — PXHOpenCode character vẽ sau terminal screen (ngồi sau màn hình), fix vô hình khi wandering, audit toàn bộ agent logic |
| 2026-07-25 | v52 | **PXHOpenCode vào desk khi session active** — thêm `state._sessionActive` vào trigger PXHOpenCode đi làm, fix infinite loop với `poc._lastEvt!==0` guard |
| 2026-07-25 | v51 | **PXHOpenCode Terminal Re-enable** — banner hiển thị task logs, PXHOpenCode terminal screen vẽ lại, _monitorLog agents re-enabled, addLog() đẩy tất cả logs vào PXHOpenCode terminal, fix duplicate log |
| 2026-07-25 | v50 | Extension-only Virtual Office + **Release v50** — remove standalone browser/TUI, clean server.mjs API-only, VSCE extension focus. Arch check 0 errors, root package.json fixed, build script handles meta-projects + VSCE packaging, tagged release, fix Anti-Rationalization warnings |
| 2026-07-24 | v48 | Prompt Optimizer — auto-rewrite prompt mơ hồ thành implementation-ready spec, panel `<details>` transparent, integrate vào opencode.json instructions, README Key Concepts + version + commit count sync |
| 2026-07-24 | v47 | Bat merge — pxh-office.bat hợp nhất on/off/restart + help, xóa pxh-office-on.bat và pxh-office-off.bat, cập nhật README |
| 2026-07-24 | v46 | Open Office & Real-time Agent Sync — single-floor open space, 11 pixel-art agents, cat+dog pets, speech bubbles, dashed signals, state badges, T1+T2 stay/T3+T4 leave, pxh-office.bat, hook-opencode.ps1, port 2910, README vibe code guide |
| 2026-07-23 | v45 | Virtual Office TUI — pxh-office agent, virtual-office skill, /office command, pixel-art agents, contract flow animation |
| 2026-06-23 | v44 | Context budget, skill quickref, agent slim (-39%), contracts concise, tiered loading, build script thật, workflow, favicon, fix cross-refs |

## ✅ Điều kiện hoàn thành

- [x] 12 agents với thẻ layer + tham chiếu chéo
- [x] Runtime 4 layer, 6 contracts, 3 policies
- [x] 9 workflows theo lĩnh vực
- [x] 33 skills với templates/ riêng
- [x] _shared/ dùng chung (templates, scripts, agent-listing)
- [x] Chrome DevTools MCP tích hợp (--autoConnect)
- [x] README hướng dẫn copy vào `.opencode/`
- [x] **Prompt auto-classification** — T1/T2/T3 tự động phân tích prompt → workflow+skill
- [x] **Permission đúng** — Architect/DevOps `edit: deny`
- [x] **Skill integration** — Worker bắt buộc đọc SKILL.md + templates trước khi code
- [x] **Contract-only communication** — QA→Fix-Bugs dùng Task contract, không @mention trần
- [x] **Feedback loop** — Worker→T2→Worker qua Result/Task contract
