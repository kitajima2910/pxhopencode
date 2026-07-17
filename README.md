# pxhopencode — AI Company cho Vibe Coding

```
ver39 · 39 commits · 10 AI agents · 4-tier runtime · 8 workflows · 30 skills · 162 templates
```

---

## Kiến trúc Runtime 4 Tầng

```
┌─────────────────────────────────────────────────────────────────────────┐
│  T1 ─ INTERFACE ─── pxh-help ─────────────────────────────────────────── │
│    ↓ Request                                                             │
│  T2 ─ ORCHESTRATION ─ pxh-pm ──────────── retry/recovery/reflection ──── │
│    ↓ Task                      ↑ Result                                  │
│  T3 ─ WORKERS ─── 7 agents ───────────────────────────────────────────── │
│    ↓ Event                                                               │
│  T4 ─ INFRASTRUCTURE ─ pxh-save-history ─ state/checkpoint/log ──────── │
└─────────────────────────────────────────────────────────────────────────┘
```

### Luồng dữ liệu

```
User Prompt → T1 (Validate) → T2 (Route) → T3 (Execute) → T2 (Eval) → T1 (Response) → User
                                                        ↘              ↙
                                                    T4 (Persist)
```

### Trách nhiệm

| Tầng | Agent | Vai trò |
|------|-------|---------|
| **T1** Interface | `pxh-help` | Validate input, format output |
| **T2** Orchestration | `pxh-pm` | Route task, track state, enforce policy |
| **T3** Workers | 7 agents | Thực thi domain (code, test, review, build...) |
| **T4** Infrastructure | `pxh-save-history` | Persist state, checkpoint, log |

---

## 10 Agents

```
T1 ──────────────────────────────────
│ pxh-help      Hướng dẫn workflow

T2 ──────────────────────────────────
│ pxh-pm        Điều phối, routing, policy

T3 ──────────────────────────────────
│ pxh-architect  pxh-expert       pxh-fix-bugs
│ pxh-qa         pxh-review-code  pxh-devops
│ pxh-ui-ux

T4 ──────────────────────────────────
│ pxh-save-history  State, checkpoint, recovery
```

### Chi tiết

| Agent | Tầng | Role | Dùng khi |
|-------|------|------|----------|
| `pxh-pm` | T2 | Điều phối, routing, policy | Chạy lệnh `/`, giao việc tự động |
| `pxh-architect` | T3 | Thiết kế tech stack, DB, API | Cần kiến trúc hệ thống |
| `pxh-expert` | T3 | Vibe code, workflow + skill | Code production, tính năng mới |
| `pxh-fix-bugs` | T3 | Root cause → fix | Bug, crash, behavior sai |
| `pxh-qa` | T3 | Test, validate | Chạy test, verify chất lượng |
| `pxh-review-code` | T3 | Security, perf, convention | Code review, audit |
| `pxh-devops` | T3 | Lint → typecheck → test → build | Build pipeline, release |
| `pxh-ui-ux` | T3 | UI/UX design (web, game HUD, CLI) | Layout, responsive, accessibility |
| `pxh-save-history` | T4 | State, checkpoint, recovery | Lưu session, phục hồi lỗi |
| `pxh-help` | T1 | Hướng dẫn workflow | Cần trợ giúp, chưa biết bắt đầu |

---

## 8 Workflows · 9 Commands

| Lệnh | Template | Mục đích |
|------|----------|----------|
| `/vibe` | `workflows/company.workflow.md` | Tự động chạy toàn bộ quy trình (phân tích → thiết kế → code → test → review → build) |
| `/web` | `workflows/web.workflow.md` | Phát triển web app (React, Next.js, Express, FastAPI) |
| `/game` | `workflows/game.workflow.md` | Phát triển game HTML5 (Phaser 2D, Isometric, Three.js 3D) |
| `/ai` | `workflows/ai.workflow.md` | Ứng dụng AI (chatbot, RAG, agent, LLM) |
| `/tool` | `workflows/tool.workflow.md` | CLI, extension, automation, package |
| `/debug` | `workflows/debug.workflow.md` | Debug + fix bug |
| `/ui-ux` | `workflows/debug.workflow.md` | UI/UX design & debug cho web, game, tool |
| `/meeting` | `workflows/meeting.workflow.md` | Họp agents thảo luận giải pháp |
| `/release` | `workflows/release.workflow.md` | Build pipeline: lint → test → build |

---

## 30 Skills

### Web (8)

| Skill | Dùng cho |
|-------|----------|
| frontend `webs-frontend` | React, component, hooks, data fetching |
| backend `webs-backend` | Next.js App Router, Express, FastAPI |
| database `webs-database` | Prisma, PostgreSQL, migration, N+1 fix |
| auth `webs-auth` | Auth.js, OAuth, JWT, RBAC, CSRF |
| styling `webs-styling` | Tailwind, design system, responsive, dark mode |
| testing `webs-testing` | Vitest, Playwright E2E, MSW mock |
| deployment `webs-deployment` | Vercel, Docker, CI/CD, canary |
| security `webs-security` | XSS, CSRF, SQLi, rate limit, secure headers |

### Game (11)

| Skill | Engine |
|-------|--------|
| core `games-core` | Game loop, scene, asset loader, input, FSM |
| 2d `games-2d` | Phaser 3: player, enemy, bullet pool, tilemap |
| 3d `games-3d` | Three.js: lighting, camera, shooting, AI |
| isometric `games-isometric` | 2.5D: tile engine, depth sort, pathfinding |
| physics `games-physics` | AABB, spatial hash, raycast, response |
| audio `games-audio` | Web Audio API pool, spatial 3D, compression |
| assets `games-assets` | Free sprites, 3D models, sounds, fonts + auto-download |
| optimization `games-optimization` | Object pool, instancing, LOD, 60 FPS mobile |
| testing `games-testing` | Vitest + headless Phaser/Three.js |
| pwa `games-pwa` | Manifest, service worker, offline, install |
| deploy `games-deploy` | GitHub Pages, Itch.io, Vercel, CI/CD |

### AI (5)

| Skill | Mục đích |
|-------|----------|
| agents `ais-agents` | Tool registry, multi-step reasoning, memory |
| llm `ais-llm` | Chat, streaming SSE, function calling, cost |
| rag `ais-rag` | Ingestion, chunking, embedding, hybrid search |
| prompts `ais-prompts` | Template, versioning, A/B test, injection defense |
| production `ais-production` | Caching, rate limit, fallback, monitoring |

### Tool (5)

| Skill | Dùng cho |
|-------|----------|
| cli `tools-cli` | Commander, clap, click, spinner, progress |
| extensions `tools-extensions` | VS Code extension: commands, views, providers |
| codegen `tools-codegen` | Scaffold, component generator, Plop.js |
| automation `tools-automation` | File watcher, batch processor, pipeline |
| packaging `tools-packaging` | npm, Cargo, PyPI, Docker, Homebrew |

### Chuyên biệt

| Skill | File | Kỹ thuật / Áp dụng |
|-------|------|-------------------|
| design | `skills/ui-ux/SKILL.md` | Web (Tailwind/React), Game (Phaser HUD), Tool (CLI output), accessibility |

---

## Cách dùng

### Prompt trực tiếp

```bash
# pxh-pm tự động phân tích → chọn workflow → code → test → release
"Làm một web app TODO list với Next.js"
```

### Lệnh `/`

```bash
/vibe   "Game bắn súng 2D, có shop, 10 level"
/debug  "Fix bug, crash, behavior sai"
/ui-ux  "Fix responsive layout và dark mode"
```

### @agent — gọi trực tiếp kèm Task contract

```bash
@pxh-expert với phase=code target=./src context="Thêm API route GET /users"
```

---

## Luồng xử lý

```
User Prompt / Lệnh / @agent
         │
         ▼
┌─────────────────┐
│  T1: pxh-help   │  Validate input
└────────┬────────┘
         │ Request
         ▼
┌─────────────────┐
│  T2: pxh-pm     │  Phân tích loại → chọn workflow
│                 │  Nếu phức tạp → họp architect + expert + qa + devops
└────────┬────────┘
         │ Task
         ▼
┌──────────────────────┐
│  T3: Worker phù hợp  │  Thực thi trong TARGET
│                      │  Tự kiểm tra → trả Result
└────────┬─────────────┘
         │ Result
         ▼
┌─────────────────┐
│  T2: pxh-pm     │  Evaluate → nếu OK thì Response
│                 │  Nếu lỗi → retry/recovery
└──┬──────────┬───┘
   │ Event     │ Response
   ▼           ▼
┌────────┐ ┌──────────┐
│  T4    │ │  T1      │ → User
│ Save   │ │ Response │
│History │ └──────────┘
└────────┘
```

### Vòng lặp Code → Test → Fix → Review → Build

```
Code → Test ── pass ──→ Review ── pass ──→ Build ✓
  ↑         │ fail              │ fail
  │         ▼                   ▼
  └── Fix ←┘         └── Fix ←┘
                    (max 3 vòng)
```

---

## Chính sách

| Policy | Cơ chế | Giới hạn |
|--------|--------|----------|
| **Retry** | Exponential backoff (1s → 2s → 4s) | Max 3 lần, lỗi tạm thời |
| **Recovery** | Checkpoint-based resume / rollback | Lỗi permanent |
| **Reflection** | 4 mức: Task → Phase → Workflow → Incident | Ghi vào session log |

---

## Key Concepts

- **Context Budget**: T0→T3 loading, lazy skill/template, batch ops
- **Genre Reference**: `_shared/game-genre-reference.md`
- **Headless testing**: Vitest + headless Phaser/Three.js, không cần server
- **Code preservation**: Chỉ tác động trong TARGET
- **Templates**: `_shared/templates/` (status, session, gitignore, bug-report, adr)
