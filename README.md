# pxhopencode — AI Company cho Vibe Coding

<p align="center">
  <b>v40</b> &nbsp;·&nbsp; 53 commits &nbsp;·&nbsp; 10 AI agents &nbsp;·&nbsp; 4-tier runtime &nbsp;·&nbsp; 8 workflows &nbsp;·&nbsp; 30 skills &nbsp;·&nbsp; 167 templates</p>

> AI Company tự động: prompt → classify → route → code → test → fix → review → build → persist. Một luồng duy nhất, không cần can thiệp tay.

---

## Cài đặt

Clone vào project của bạn, đổi tên thành `.opencode`:

```bash
# Trong thư mục project của bạn
git clone <repo-url> .opencode
# hoặc download zip, giải nén, rename pxhopencode → .opencode
```

Sau đó dùng opencode (hoặc Cursor, Windsurf, etc.) mở project → agent tự động load cấu hình từ `.opencode/opencode.json`.

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

Có 3 cách tương tác với AI Company — tất cả đều tự động route qua T1→T2→T3:

| Cách | Cú pháp | Luồng |
|------|---------|-------|
| **Prompt tự nhiên** | Gõ thẳng mô tả công việc | `pxh-pm` classify → chọn workflow → route → code → test → review → build |
| **Lệnh `/`** | `/workflow` + mô tả | Load workflow template → route thẳng T3 |
| **@mention** | `@agent` + task contract | Gọi agent cụ thể, bỏ qua classify |

### Prompt tự nhiên
```bash
"Làm một web app TODO list với Next.js"
# pxh-pm tự động phân tích, chọn workflow /web, gọi agent phù hợp
```

### Lệnh `/`
```bash
/vibe   "Game bắn súng 2D, có shop, 10 level"
/debug  "Fix bug crash khi login"
/ui-ux  "Fix responsive layout và dark mode"
```

### @mention
```bash
@pxh-expert với phase=code target=./src context="Thêm API route GET /users"
@pxh-architect thiết kế schema cho hệ thống chat
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

<details>
<summary><b>v40 — Architecture Hardening</b> (Latest)</summary>

- **Add:** `pxh-ui-ux.md` agent file, `_shared/arch-check.ps1`, `_shared/sync-readme.ps1`
- **Add:** Observability & Alerting (T4), Contract versioning (`v:"1.0"`), CLI Design System
- **Add:** Mermaid flowcharts thay ASCII diagrams
- **Fix:** `opencode.json` command format (schema-compliant), thiếu Verification sections
- **Fix:** Agent permission boilerplate xoá (~246 tokens)
- **Update:** Auto-routing (pxh-pm + pxh-help), README/runtime/README nén
- **Remove:** Mod APK/XAPK khỏi toàn bộ codebase
</details>

<details>
<summary><b>v39 — Pro Max</b></summary>

- **Add:** Anti-Rationalization + Red Flags + Verification cho 47 files
- **Update:** Token optimization, workflow compression, context budget
</details>

<details>
<summary><b>v38 — UI/UX & Workflow Polish</b></summary>

- **Add:** `/ui-ux` command, Web security checklist
- **Update:** Debug workflow CLI Design System, README restructure
- **Fix:** Agent name mismatches (`@architect`→`@pxh-architect`)
</details>

<details>
<summary><b>v37 — Game Racing & Security</b></summary>

- **Add:** Marble Racing 3D, black-box scripts, game eval assertions
- **Add:** Web security checklist skill (`webs-security`)
</details>

<details>
<summary><b>v36 — Headless Testing Migration</b></summary>

- **Add:** Vitest headless testing (Phaser/Three.js)
- **Remove:** Chrome DevTools integration
</details>

<details>
<summary><b>v35 — Agent Refactoring & Context Budget</b></summary>

- **Add:** Context Budget, Skill Quick Reference
- **Remove:** Chrome DevTools MCP
</details>

<details>
<summary><b>v34 — Architecture Diagrams</b></summary>

- **Add:** Mermaid flow diagrams, PowerShell build scripts
</details>

<details>
<summary><b>v33 — Game Assets & Build Pipeline</b></summary>

- **Add:** Asset download script, build scripts
</details>

<details>
<summary><b>v32 — Initial Foundation</b></summary>

- **Add:** 4-tier architecture, 10 agents, 8 workflows, 28 skills
- **Add:** Contract system, Retry/Recovery/Reflection policies, templates
</details>
