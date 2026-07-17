# pxhopencode — AI Company cho Vibe Coding

<p align="center">
  <b>v40</b> &nbsp;·&nbsp; 53 commits &nbsp;·&nbsp; 10 AI agents &nbsp;·&nbsp; 4-tier runtime &nbsp;·&nbsp; 8 workflows &nbsp;·&nbsp; 30 skills &nbsp;·&nbsp; 167 templates</p>

> AI Company tự động: prompt → classify → route → code → test → fix → review → build → persist. Một luồng duy nhất, không cần can thiệp tay.

> **Sync:** Sau khi CRUD agent/workflow/skill/template, chạy `powershell.exe -ExecutionPolicy Bypass -File _shared\sync-readme.ps1` để đồng bộ badge + section headers.

---

## Kiến trúc Runtime 4 Tầng

```mermaid
flowchart TD
    User((User))
    T1["T1 — INTERFACE<br/>pxh-help"]
    T2["T2 — ORCHESTRATION<br/>pxh-pm"]
    T3["T3 — WORKERS<br/>7 agents"]
    T4["T4 — INFRASTRUCTURE<br/>pxh-save-history"]

    User -->|Prompt| T1
    T1 -->|Request| T2
    T2 -->|Task| T3
    T3 -->|Result| T2
    T2 -->|Response| T1
    T1 -->|Output| User
    T3 -.->|Event| T4
    T4 -.->|State| T2
```

| Tầng | Agent | Vai trò |
|------|-------|---------|
| **T1** Interface | `pxh-help` | Validate input, classify prompt, format output |
| **T2** Orchestration | `pxh-pm` | Auto-route task, track state, enforce retry/recovery/reflection |
| **T3** Workers | 7 agents | Thực thi domain (code, test, review, build, UI/UX) |
| **T4** Infrastructure | `pxh-save-history` | Persist state, checkpoint, log, alerting |

```mermaid
flowchart LR
    P["Prompt / Lệnh / @agent"]
    T1["T1 — Validate + Classify"]
    T2["T2 — Route + Retry/Recover/Reflect"]
    T3["T3 — Workers (Code/Test/Fix/Review/Build)"]
    T4["T4 — Persist (state/checkpoint/log)"]
    U{User}

    P --> T1
    T1 -->|Request| T2
    T2 -->|Task| T3
    T3 -->|Result| T2
    T2 -->|OK| T1
    T1 -->|Response| U
    
    T2 -.->|Max 3 retries| T2
    T3 -.->|Event| T4
    T4 -.->|State| T2
```

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

```bash
# Prompt trực tiếp — pxh-pm tự động classify → route → code → test → release
"Làm một web app TODO list với Next.js"

# Lệnh / — xác định workflow rõ ràng
/vibe   "Game bắn súng 2D, có shop, 10 level"
/debug  "Fix bug, crash, behavior sai"
/ui-ux  "Fix responsive layout và dark mode"

# @agent — gọi trực tiếp kèm Task contract
@pxh-expert với phase=code target=./src context="Thêm API route GET /users"
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

---

## Changelog

### v40 — Architecture Hardening (Latest)
- **Add:** `pxh-ui-ux.md` agent file (còn thiếu từ v38)
- **Add:** `_shared/arch-check.ps1` — architecture validation test (0 errors, 0 warnings)
- **Add:** `_shared/sync-readme.ps1` — tự động đồng bộ badge + counts sau CRUD
- **Add:** Observability & Alerting system cho T4 layer (5 metrics)
- **Add:** Contract versioning (`v:"1.0"`) vào runtime
- **Add:** CLI Design System vào `skills/ui-ux/SKILL.md`
- **Add:** Mermaid flowcharts thay ASCII diagrams trong README
- **Fix:** `opencode.json` command format (string→object, schema-compliant)
- **Fix:** `company.workflow.md` thiếu Verification section
- **Fix:** `debug.workflow.md` thiếu Verification section (Pro Max)
- **Fix:** Agent permission boilerplate xoá khỏi 9 agent files (tiết kiệm ~246 tokens)
- **Update:** `pxh-pm` auto-routing: input classifier + route table + output format chuẩn
- **Update:** `pxh-help` output format chuẩn cho T2 parse
- **Update:** 4 workflow files — post-code block unified thành reference
- **Update:** README nén skills/agent tree/flow + Changelog section
- **Update:** `opencode.json` agent/command descriptions gọn
- **Update:** `runtime/README.md` — xoá duplicate tier table + flow
- **Remove:** Mod APK/XAPK khỏi toàn bộ codebase

### v39 — Pro Max
_Nâng cấp toàn diện: anti-rationalization, red flags, verification trên toàn bộ architecture._
- **Add:** Anti-Rationalization, Red Flags, Verification sections cho 47 skill/workflow/agent files
- **Add:** `_shared/arch-check.ps1` — architecture validation test
- **Add:** Observability & Alerting system cho T4 layer (5 metrics)
- **Add:** Contract versioning (`v:"1.0"`) vào runtime
- **Add:** `pxh-ui-ux` agent file (còn thiếu)
- **Add:** CLI Design System vào `skills/ui-ux/SKILL.md`
- **Fix:** `opencode.json` command format (string→object, schema-compliant)
- **Fix:** `company.workflow.md` thiếu Verification section
- **Fix:** Agent permission boilerplate xoá (tiết kiệm ~246 tokens)
- **Update:** `README.md` — nén skills table, agent tree, flow diagram (tiết kiệm ~218 tokens)
- **Update:** `opencode.json` — agent/command descriptions gọn lại
- **Update:** `pxh-pm` auto-routing: input classifier + route table + output format chuẩn
- **Update:** `pxh-help` output format chuẩn cho T2 parse (`classified_workflow`, `classified_skills`, `confidence`)
- **Update:** 4 workflow files (web/game/ai/tool) — post-code block unified thành reference
- **Remove:** Mod APK/XAPK khỏi toàn bộ codebase

### v38 — UI/UX & Workflow Polish
- **Add:** `/ui-ux` command
- **Add:** Web security checklist tích hợp review phase
- **Update:** Debug workflow với CLI Design System (symbol set, 4-tier layout, contract format)
- **Update:** README cấu trúc lại, xoá directory section
- **Update:** Streamline APK modding workflow
- **Fix:** Agent name mismatches (`@architect`→`@pxh-architect`)

### v37 — Game Racing & Security
- **Add:** Marble Racing 3D game design + implementation
- **Add:** Black-box scripts (`track-gen-physics`, `track-gen-spline`, `eval-grader`)
- **Add:** Game evaluation assertions (`game-eval-schema.ts`)
- **Add:** Web security checklist skill (`webs-security`)
- **Update:** Skills count 28→30

### v36 — Headless Testing Migration
- **Add:** Vitest headless testing cho game (Phaser/Three.js helpers)
- **Update:** Thay Chrome DevTools bằng Vitest trong mọi debug instruction
- **Update:** `.gitignore` templates (thêm `.vite/`, `.vibe/`, `.github/`)
- **Remove:** Chrome DevTools integration (không còn dependency)

### v35 — Agent Refactoring & Context Budget
- **Add:** Context Budget guidelines cho mọi agent
- **Add:** Skill Quick Reference (`_shared/skill-quickref.md`)
- **Add:** Conversation Budget section
- **Update:** Agent permissions, streamline processes
- **Update:** Feedback loop structure trong orchestration layer
- **Remove:** Chrome DevTools MCP

### v34 — Architecture Diagrams
- **Add:** Mermaid flow diagrams cho execution flow & feedback loop
- **Add:** PowerShell execution policy bypass cho build scripts
- **Update:** Game workflow — sound fallback, asset download clarity
- **Update:** OpenCode config với MCP server integration

### v33 — Game Assets & Build Pipeline
- **Add:** Asset download script với license check
- **Add:** Build scripts (`_shared/build-scripts.ps1`)
- **Update:** Asset sources documentation
- **Remove:** Obsolete `sfx-map.ts`

### v32 — Initial Foundation
- **Add:** Project scaffold với 4-tier architecture
- **Add:** 10 agents, 8 workflows, 28 skills
- **Add:** Core game engine (2D Phaser, 3D Three.js, Isometric)
- **Add:** Contract-based communication (Request/Task/Result/Response/Event/State)
- **Add:** Retry/Recovery/Reflection policies
- **Add:** Template system (`_shared/templates/`)
