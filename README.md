# pxhopencode — Vibe Coding with OpenCode

<p align="center">
  <b>v82.4</b> · 10 AI agents · 4-tier runtime · 8 workflows · 50 skills · 49 self-tests · 6 contracts
</p>

> Nhúng vào project → `opencode` → mô tả ý tưởng bằng tiếng Việt. AI team tự động phân tích, code, test, fix, review, build.

---

## Mục lục

- [Cài đặt](#cài-đặt)
- [Lần chạy đầu tiên](#lần-chạy-đầu-tiên)
- [3 Cách Vibe Code](#3-cách-vibe-code)
- [Runtime CLI](#runtime-cli)
- [Self-Tests](#self-tests)
- [Feedback Loop](#feedback-loop)
- [Kiến trúc 4 Tầng](#kiến-trúc-4-tầng)
- [Tham khảo Agents](#tham-khảo-agents)
- [Cấu trúc source](#cấu-trúc-source)
- [Changelog](#changelog)

---

## Cài đặt

### Nhúng vào project của bạn (khuyên dùng)

```bash
cd project-của-bạn
git clone <url> .opencode
cd .opencode
.\start.bat
cd ..
```

Init script tự động:
- Xoá `.opencode/.git/` (tránh nested repo)
- Tạo 13 file `.opencode/.memory/` với project info
- Merge `.gitignore` entries (`.opencode/`, `.github/`, `.vibe/`, `.memory/`, `__prompt-log__.md`)

Sau đó chạy:

```bash
opencode
```

## Lần chạy đầu tiên

```bash
node .opencode\runtime\bin\onboard.mjs
```

Wizard hiện ra hỏi bạn muốn làm web/game/ai/tool — chọn xong là có project scaffold sẵn.

Sau đó chạy:

```bash
opencode
```

Output kỳ vọng:

```
[MEMORY_INIT_DONE]
→ Memory loaded: 13 categories, confidence 70%
→ Ready. Mô tả ý tưởng của bạn bằng tiếng Việt.
```

## 3 Cách Vibe Code

### Cách 1: Prompt tự nhiên (khuyên dùng)

Gõ thẳng mô tả bằng tiếng Việt. Hệ thống tự phân loại → chọn workflow → route agent:

```
"Xây dựng web blog cá nhân với React, có dark mode"
"Làm game platformer 2D, nhân vật mèo nhảy qua chướng ngại vật"
"Tạo chatbot RAG trả lời câu hỏi từ tài liệu PDF"
```

### Cách 2: Lệnh `/` — đi thẳng vào workflow

Bỏ qua phân loại, route thẳng vào workflow:

| Lệnh | Ví dụ | Dùng khi |
|------|-------|----------|
| `/vibe` | `/vibe xây dựng app quản lý công việc` | Full pipeline 11 bước |
| `/web` | `/web làm landing page` | Web app |
| `/3d` | `/3d tạo product configurator Three.js` | 3D web experience |
| `/game` | `/game game bắn súng 2D` | Game HTML5 |
| `/ai` | `/ai tạo chatbot hỗ trợ khách hàng` | AI/LLM |
| `/tool` | `/tool CLI tool đổi tên file` | CLI, automation |
| `/debug` | `/debug game bị giật FPS` | Debug + root cause |
| `/ui-ux` | `/ui-ux thiết kế responsive navbar` | UI/UX design |
| `/meeting` | `/meeting chọn tech stack` | Họp agents |
| `/release` | `/release` | Build pipeline |
| `/init` | Khởi tạo project mới | Scaffold wizard |
| `/status` | Xem trạng thái session | Dashboard |

### Cách 3: @mention — gọi thẳng agent

```
@pxh-expert       viết API endpoint /api/users với CRUD
@pxh-qa           chạy test coverage cho thư mục src/
@pxh-fix-bugs     sửa lỗi crash khi click nút Login
@pxh-review-code  audit bảo mật toàn bộ codebase
@pxh-architect    thiết kế database schema cho app e-commerce
@pxh-devops       build và deploy lên Vercel
@pxh-ui-ux        làm responsive navbar với dark mode
```

---

## Runtime CLI

Các lệnh CLI chạy độc lập, không cần opencode:

```bash
node .opencode\runtime\bin\vibe.mjs init       # Tạo project mới
node .opencode\runtime\bin\vibe.mjs status     # Dashboard: memory + pipeline
node .opencode\runtime\bin\vibe.mjs resume     # Tiếp tục session dang dở
node .opencode\runtime\bin\vibe.mjs feedback   # Gửi feedback
node .opencode\runtime\bin\vibe.mjs scaffold   # Scaffold từ template
node .opencode\runtime\bin\status.mjs           # Terminal dashboard
```

**Ví dụ output `vibe status`:**

```
> vibe status -- Session status

  architecture    count:0    conf:0    updated:2026-07-28
  project         count:5    conf:70   updated:2026-07-28
  patterns        count:3    conf:85   updated:2026-07-28
  bugs            count:1    conf:90   updated:2026-07-28
  ...

  Pipeline:
  OK architect -> pxh-architect
  OK code     -> pxh-expert
  -- fix      -> pxh-fix-bugs
```

---

## Self-Tests

49 tests verify architecture integrity — agents, workflows, contracts, skills, config:

```bash
node .opencode\runtime\engine\node_modules\.bin\vitest run .opencode\runtime\engine
```

Kỳ vọng:

```
> vitest run
  ✓ __tests__/contracts.test.ts   (13 tests)
  ✓ __tests__/pipeline.test.ts    (6 tests)
  ✓ __tests__/router.test.ts      (14 tests)
  ✓ __tests__/architecture.test.ts (16 tests)
  Test Files  4 passed (4)
  Tests       49 passed (49)
```

Các tests kiểm tra:
- **Contracts**: 6 contract schemas (Request, Task, Result, Response, Event, State) — validation pass/fail
- **Pipeline**: Phase order, agent mapping, no duplicates
- **Router**: Intent classification, workflow routing, phase sequencing
- **Architecture**: 10 agents có đủ sections, 8 workflows có Anti-Rationalization + Loop, opencode.json hợp lệ

---

## Feedback Loop

Sau mỗi session, bạn có thể gửi feedback:

```bash
node .opencode\runtime\bin\vibe.mjs feedback
# "Cái game bị chậm, nên dùng object pool cho đạn"
```

Feedback được ghi vào `.memory/feedback.json`. Lần session sau, memory engine tự động load context — agent biết project bạn đang ở đâu, patterns gì, bugs gì.

---

## Kiến trúc 4 Tầng

```
T1 — INTERFACE      pxh-help        Validate & classify prompt
T2 — ORCHESTRATION  pxh-pm          Route, retry, recovery, reflection
T3 — WORKERS        7 agents        Code, test, fix, review, build, UI/UX
T4 — INFRASTRUCTURE pxh-save-history State, checkpoint, log, alerting
```

Giao tiếp qua typed contracts (Zod-validated):

| Contract | Hướng | Fields |
|----------|-------|--------|
| Request | T1→T2 | version, type, target, context |
| Task | T2→T3 | version, phase, target, skills, workflow |
| Result | T3→T2 | version, status, artifacts[] |
| Response | T2→T1 | version, status, summary |
| Event | any→T4 | version, type, phase, reflection |
| State | T4→T2 | version, checkpoint, session_id |

---

## Tham khảo Agents

| Agent | Tầng | Chuyên môn | @mention khi |
|-------|------|-----------|-------------|
| `pxh-help` | T1 | Interface | (tự động) |
| `pxh-pm` | T2 | Orchestration | (tự động) |
| `pxh-architect` | T3 | Thiết kế | Cần DB schema, API design |
| `pxh-expert` | T3 | Code | Cần code production |
| `pxh-fix-bugs` | T3 | Debug | Có bug, cần root cause |
| `pxh-qa` | T3 | Test | Cần viết test |
| `pxh-review-code` | T3 | Review | Cần security audit |
| `pxh-devops` | T3 | Build | Cần build pipeline |
| `pxh-ui-ux` | T3 | UI/UX | Cần layout, responsive |
| `pxh-save-history` | T4 | Infrastructure | (tự động) |

---

## Cấu trúc source

```
pxhopencode/
├── opencode.json          # Config: agents, commands, skills, MCP
├── package.json           # Scripts: test, vibe, onboard, status
├── README.md              # Hướng dẫn sử dụng
├── STATUS.md              # Dashboard tiến độ
├── start.bat              # Init script (cmd / double-click)
├── prompt-optimizer.md     # Prompt optimization pipeline
├── runtime/
│   ├── engine/            # Runtime engine: types, contracts, pipeline, router
│   │   ├── src/           # TypeScript: Zod schemas, validators, memory I/O
│   │   └── __tests__/     # 49 self-tests (vitest)
│   ├── bin/               # CLI: vibe.mjs, status.mjs, onboard.mjs
│   ├── layers/            # 4 tầng (spec)
│   ├── contracts/         # 6 contracts (spec)
│   ├── memory/            # Memory engine docs
│   └── policies/          # Retry, recovery, reflection
├── agents/                # 10 AI agents (T1-T4)
├── workflows/             # 8 workflow templates
├── skills/                # 50 skills theo lĩnh vực
├── prompt-compiler/       # TypeScript Prompt Compiler
├── dashboard/             # Web dashboard (HTML + JS + CSS)
├── docs-vibe/             # Tài liệu kiến trúc
├── _shared/               # Scripts, templates, design-system
│   └── scripts/           # init-memory.ps1, scaffold.ps1
│   └── design-system/     # OKLCH design tokens
├── .memory/               # Vibe Coding Memory Engine (tự động)
└── .opencode/
    └── mcp.json            # MCP server config (filesystem, GitHub)
```

---

## Changelog

Xem chi tiết: `_shared/changelog.md` · `STATUS.md`
