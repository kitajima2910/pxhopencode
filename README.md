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

| Lệnh | Mục đích |
|------|----------|
| `/vibe` | Toàn bộ quy trình (phân tích → code → test → review → build) |
| `/web` | Web app (React, Next.js, Express, FastAPI) |
| `/game` | Game HTML5 (Phaser 2D, Isometric, Three.js 3D) |
| `/ai` | Chatbot, RAG, agent, LLM |
| `/tool` | CLI, extension, automation, package |
| `/debug` | Debug + fix bug |
| `/ui-ux` | UI/UX design & debug cho web, game, tool |
| `/meeting` | Họp agents thảo luận |
| `/release` | Build pipeline: lint → test → build |

---

## 30 Skills

Xem danh sách đầy đủ: [`_shared/skill-quickref.md`](_shared/skill-quickref.md) (Web 8, Game 11, AI 5, Tool 5, Chuyên biệt 1)

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
Prompt → T1 (Validate) → Request → T2 (Route + Retry/Recover/Reflect)
  → Task → T3 Workers (Code/Test/Fix/Review/Build) → Result
  → T2 (Eval) → OK → T1 (Response) → User
  ↕ (loops: max 3 retries)
T4 (Persist: state/checkpoint/log)
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
