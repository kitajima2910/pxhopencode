# pxhopencode — AI Company cho Vibe Coding

<p align="center">
  <b>v47</b> &nbsp;·&nbsp; 73 commits &nbsp;·&nbsp; 11 AI agents &nbsp;·&nbsp; 4-tier runtime &nbsp;·&nbsp; 9 workflows &nbsp;·&nbsp; 11 commands &nbsp;·&nbsp; 32 skills &nbsp;·&nbsp; 159 templates</p>

> AI Company tự động: prompt → classify → route → code → test → fix → review → build → persist. Một luồng duy nhất, không cần can thiệp tay.

---

## Cài đặt

Clone vào project của bạn, đổi tên thành `.opencode`:

```bash
# Trong thư mục project của bạn
git clone <repo-url> .opencode
# hoặc download zip, giải nén, rename pxhopencode → .opencode
```

Sau đó dùng opencode mở project → agent tự động load cấu hình từ `.opencode/opencode.json`.

> 📖 **Docs đầy đủ:** [docs-vibe/index.html](docs-vibe/index.html) — kiến trúc, agents, workflows, virtual office, real-time sync.

---

## Văn Phòng Ảo — Khởi động nhanh

Webview 2D Open Office — văn phòng mở với 11 nhân vật pixel-art, real-time sync với TUI:

### Cách 1: File .bat (khuyên dùng)

```powershell
# ON — Start server + mở browser
.\pxh-office.bat on

# OFF — Tắt server
.\pxh-office.bat off

# RESTART — Tắt cũ + start mới + mở browser
.\pxh-office.bat restart
```

### Cách 2: Chạy tay

```powershell
node skills/virtual-office/templates/server.mjs
start http://localhost:2910
```

### Sync real-time với TUI (tùy chọn)

```powershell
.\skills\virtual-office\templates\hook-opencode.ps1 "your prompt here"
```

Script này chạy opencode, bắt tên agent từ output TUI và gửi state real-time lên webview.

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

| Tầng | Agent | Vai trò | Rời bàn |
|------|-------|---------|---------|
| **T1** Interface | `pxh-help` | Validate & classify input | Khi TUI kết thúc |
| **T2** Orchestration | `pxh-pm` | Route, policy, retry/recovery | Khi TUI kết thúc |
| **T3** Workers | 7 agents | Code, test, fix, review, build, UI/UX | Xong việc → rời |
| **T4** Infrastructure | `pxh-save-history` | State, checkpoint, log | Xong việc → rời |

---

## 11 Agents

| Agent | Tầng | State Badge | Dùng khi |
|-------|------|-------------|----------|
| `pxh-help` | T1 | **INTERFACE** | Validate & classify input |
| `pxh-pm` | T2 | **ORCHESTRATION** | Điều phối, routing, policy |
| `pxh-architect` | T3 | **DESIGN** | Thiết kế tech stack, DB, API |
| `pxh-expert` | T3 | **CODE** | Vibe code, production |
| `pxh-fix-bugs` | T3 | **DEBUG** | Root cause → fix bug |
| `pxh-qa` | T3 | **TEST** | Viết & chạy test |
| `pxh-review-code` | T3 | **REVIEW** | Security, perf audit |
| `pxh-devops` | T3 | **BUILD** | Lint → typecheck → test → build |
| `pxh-ui-ux` | T3 | **DESIGN** | Layout, responsive, accessibility |
| `pxh-save-history` | T4 | **INFRASTRUCTURE** | State, checkpoint, recovery |
| `pxh-office` | Virtual | **VIRTUAL OFFICE** | Virtual Office — real-time 4-tier visualization |

---

## 9 Workflows · 11 Commands

| Lệnh | Mục đích |
|------|----------|
| `/vibe` | Toàn bộ quy trình (phân tích → code → test → review → build) |
| `/web` | Web app (React, Next.js, Express, FastAPI) |
| `/game` | Game HTML5 (Phaser 2D, Isometric, Three.js 3D) |
| `/ai` | Chatbot, RAG, agent, LLM |
| `/tool` | CLI, extension, automation, package |
| `/debug` | Debug + fix bug |
| `/ui-ux` | UI/UX design & debug |
| `/meeting` | Họp agents thảo luận |
| `/release` | Build pipeline: lint → test → build |
| `/preview` | Live preview game (Vite HMR) |
| `/office` | Virtual Office — real-time 4-tier visualization |

---

## Cách dùng — Vibe Code thực chiến

Có 3 cách gọi agent để vibe code. Agent tự động phân tích, code, test, fix, review, build — bạn chỉ cần mô tả ý tưởng.

### Cách 1: Prompt tự nhiên (khuyên dùng)

Gõ thẳng mô tả công việc bằng tiếng Việt. Hệ thống tự phân loại → chọn workflow → route → thực thi.

```
"Xây dựng web blog cá nhân với React, có dark mode"
"Làm game platformer 2D, nhân vật nhảy qua chướng ngại vật"
"Tạo chatbot RAG trả lời từ tài liệu PDF"
```

**Luồng tự động:**
```
Prompt → pxh-help (T1) phân loại workflow + skill
       → pxh-pm (T2) chọn worker, tạo Task contract
       → pxh-expert (T3) code trong TARGET
       → pxh-qa (T3) viết & chạy test
       → pxh-fix-bugs (T3) sửa nếu fail
       → pxh-review-code (T3) audit security + perf
       → pxh-devops (T3) build: lint → typecheck → test → build
       → pxh-save-history (T4) lưu session log, STATUS.md
```

### Cách 2: Lệnh `/` — đi thẳng vào workflow

Bỏ qua bước phân loại, route thẳng T3 theo workflow tương ứng.

| Lệnh | Ví dụ | Khi dùng |
|------|-------|----------|
| `/vibe` | `/vibe xây dựng app quản lý công việc` | Full pipeline 11 bước (phân tích → code → test → review → build) |
| `/web` | `/web làm landing page cho startup` | Web app: React, Next.js, Express, FastAPI |
| `/game` | `/game game bắn súng không gian 2D` | Game HTML5: Phaser 2D, Isometric, Three.js 3D |
| `/ai` | `/ai tạo chatbot hỗ trợ khách hàng` | Chatbot, RAG, AI agent, LLM |
| `/tool` | `/tool CLI tool đổi tên file hàng loạt` | CLI, extension, automation, package |
| `/debug` | `/debug game bị giật FPS khi nhiều enemy` | Debug + fix bug (có root cause analysis) |
| `/ui-ux` | `/ui-ux thiết kế responsive navbar` | UI/UX design & responsive layout |
| `/meeting` | `/meeting chọn tech stack cho dự án mới` | Họp agents thảo luận kiến trúc |
| `/release` | `/release` | Build pipeline: lint → test → build |
| `/preview` | `/preview` | Live preview game (Vite HMR, browser auto-open) |
| `/office` | `/office` | Virtual Office — real-time 4-tier visualization |

### Cách 3: @mention — gọi thẳng agent

Gọi agent cụ thể, bỏ qua classify và routing. Dùng khi bạn biết chính xác cần agent nào.

```
@pxh-expert viết API endpoint /api/users với CRUD
@pxh-qa chạy test coverage cho thư mục src/
@pxh-fix-bugs sửa lỗi crash khi click nút Login
@pxh-review-code audit bảo mật toàn bộ codebase
@pxh-architect thiết kế database schema cho app e-commerce
@pxh-devops build và deploy lên Vercel
@pxh-ui-ux làm responsive navbar với dark mode
```

### Quy trình `/vibe` đầy đủ (11 bước)

Pipeline hoàn chỉnh cho dự án từ ý tưởng đến production:

| # | Phase | Agent | Công việc |
|---|-------|-------|-----------|
| 1 | NHẬN | T1→T2 | Phân loại prompt, xác định loại dự án |
| 2 | PHÂN TÍCH | T2 | Chọn tech stack, đánh giá quy mô |
| 3 | HỌP | @meeting | Agent council đồng thuận kiến trúc |
| 4 | KẾ HOẠCH | T2 | Feature list, milestones, acceptance criteria |
| 5 | THIẾT KẾ | @pxh-architect | Schema DB, API contract, component tree |
| 6 | CODE | @pxh-expert | Code trong TARGET, setup .gitignore + favicon |
| 7 | KIỂM TRA | @pxh-qa | Viết test, chạy coverage ≥ 85% |
| 8 | SỬA | @pxh-fix-bugs | Root cause → fix → verify |
| 9 | RÀ SOÁT | @pxh-review-code | Security audit, perf review, quality gate |
| 10 | PHÁT HÀNH | @pxh-devops | Lint → typecheck → test → build |
| 11 | LƯU | @pxh-save-history | Session log, ADR, cập nhật STATUS.md |

**Loop mechanism:**
- Code → Test → Fix: nếu test fail → quay lại Bước 6 (max 3 lần)
- Review → Fix → Test: nếu critical issue → quay lại Bước 8 (max 3 lần)
- Build fail → quay lại Bước 6 (max 3 lần)

### Ví dụ thực tế

**Ví dụ 1: Làm web app**
```
/vibe Xây dựng ứng dụng quản lý chi tiêu cá nhân với React + Express + PostgreSQL.
Cho phép thêm/sửa/xóa giao dịch, phân loại thu/chi, xem biểu đồ thống kê theo tháng.
```
→ Hệ thống tự động: phân tích → thiết kế schema → code frontend + backend → test → review → build.

**Ví dụ 2: Làm game**
```
/game Làm game platformer 2D. Nhân vật mèo chạy nhảy qua chướng ngại vật,
thu thập coin, có 3 mạng. Enemy là chó bay qua lại. Background parallax rừng cây.
```
→ Hệ thống tự động: tải assets → scaffold Phaser 3 → code game loop → test headless → polish → build.

**Ví dụ 3: Debug**
```
/debug Game bị crash khi spawn enemy thứ 50. Console báo "pool exhausted".
```
→ `pxh-fix-bugs`: root cause analysis → fix object pool → verify → polish.

**Ví dụ 4: Gọi thẳng agent**
```
@pxh-review-code Kiểm tra bảo mật file src/api/auth.ts, đặc biệt phần JWT verification.
```

---

## Chính sách

| Policy | Cơ chế | Giới hạn |
|--------|--------|----------|
| **Retry** | Exponential backoff (1s → 2s → 4s) | Max 3 lần |
| **Recovery** | Checkpoint-based resume / rollback | Lỗi permanent |
| **Reflection** | 4 mức: Task → Phase → Workflow → Incident | Ghi session log |

---

## Virtual Office — Chi tiết

### Thiết kế văn phòng mở

Văn phòng single-floor open space, toàn bộ 11 agent làm việc chung:

- **Tường trái**: 4 server rack LED nhấp nháy
- **Trung tâm**: Bàn CEO PXH, 7 bàn worker (3 monitor + 4 laptop)
- **Góc trái dưới**: Historian
- **Góc phải dưới**: Help Desk + cửa ra vào
- **Tường phải**: Bảng trắng, water cooler, coffee machine
- **Trang trí**: Cây cảnh 3 kiểu, đồng hồ treo tường, banner PXH2910
- **Thú cưng**: Mèo vàng 🐱 + Chó nâu 🐕 đi dạo tự do

### Tính năng

| Animation | Mô tả |
|-----------|-------|
| **Walking** | Agent đi lại 4 hướng, body nảy |
| **Typing** | Ngồi vào bàn, quay lưng gõ phím, tay rung |
| **Idle breathing** | Đứng thở + nháy mắt |
| **Dashed signals** | Tín hiệu xanh nối giữa các agent |
| **Speech bubbles** | Log real-time trên đầu agent |
| **State badges** | Nhấp nháy bên phải tên chức danh |
| **Đã làm xong** | Bay lên từ agent khi hoàn thành |

### Trang phục agent

| Agent | Trang phục | Phụ kiện |
|-------|-----------|----------|
| Help Desk | Váy xanh dương A-line | Huy hiệu ★ |
| CEO PXH | Suit đen + vest kem | Cà vạt vàng + kẹp |
| Architect | Váy tím A-line | Kính tròn |
| Developer | Hoodie xanh lá | Kính tròn |
| Bug Hunter | Jacket đỏ sọc | Huy hiệu ★ |
| QA Engineer | Váy xanh ngọc chấm bi | — |
| Reviewer | Áo sơ mi vàng | Cà vạt đỏ |
| DevOps | Hoodie xanh navy | Kính tròn |
| UI/UX Designer | Váy hồng | Khăn quàng |
| Historian | Cardigan tím | Kính tròn |

### Real-time Sync

| Cơ chế | Mô tả |
|--------|-------|
| **Bridge** | Watch file changes → gửi event SSE |
| **Hook** | Bắt tên agent từ TUI output → gửi state |
| **State file** | `_shared/opencode-state.json` → server watch |
| **SSE** | Push real-time tới browser |

### Gửi event mô phỏng

```powershell
# Pipeline đầy đủ
Invoke-RestMethod -Uri "http://localhost:2910/simulate" -Method Post -Body '{"count":1}' -ContentType "application/json"

# Emit từng event
node skills/virtual-office/templates/emit-event.mjs --type agent_state --agent pxh-expert --tuiState Code --message "Test"
```

---

## Key Concepts

- **Context Budget**: T0→T3 loading, lazy skill/template, batch ops
- **Compaction**: Auto nén context cũ → summary, giữ 3 turns gần nhất
- **Tool Output**: `max_lines: 50, max_bytes: 4096` — tiết kiệm token
- **Live Preview**: `skills/games-preview/` — Vite HMR, hot-reload < 50ms
- **Code preservation**: Chỉ tác động trong TARGET
- **Portable**: Copy toàn bộ `.opencode` → hoạt động ngay trong project mới

---

## Changelog

<details>
<summary><b>v47 — Bat Merge & README Sync (Latest)</b></summary>

- **Merge:** `pxh-office-on.bat` + `pxh-office-off.bat` → `pxh-office.bat` (on/off/restart + help)
- **Update:** README virtual office section references `pxh-office.bat`
- **Remove:** `pxh-office-on.bat`, `pxh-office-off.bat`
</details>

<details>
<summary><b>v46 — Open Office & Real-time Agent Sync</b></summary>

- **Redesign:** Virtual Office thành văn phòng mở single-floor, 11 agent làm việc chung
- **Add:** 11 agent với pixel-art character, trang phục riêng, phụ kiện
- **Add:** Mèo 🐱 + Chó 🐕 đi dạo tự do trong văn phòng
- **Add:** Speech bubble real-time multi-dòng với timestamp
- **Add:** Dashed signal lines thay giấy tờ bay, nối agent theo kiến trúc
- **Add:** State badge nhấp nháy bên phải tên chức danh (Interface/Orchestration/...)
- **Add:** T1+T2 ở lại tới global idle, T3+T4 rời bàn khi xong việc
- **Add:** `pxh-office.bat` — ON/OFF/RESTART server 1 lệnh
- **Update:** Bridge per-agent idle timer + pipeline theo workflow
- **Update:** `hook-opencode.ps1` — bắt tên agent từ TUI output real-time
- **Update:** Port mặc định 2910, Cache-Control headers
- **Fix:** HiDPI layout bug, path traversal, ASI semicolon bugs
- **Fix:** `drawOutfit` váy A-line phủ kín, tóc `slick`/`sidepart`/`short`
</details>

<details>
<summary><b>v45 — Virtual Office TUI</b></summary>

- **Add:** `pxh-office` agent — Virtual Office TUI với pixel-art agents
- **Add:** Webview 2D Cartoon — văn phòng 4 tầng trên browser
- **Add:** SSE event sync + contract flow animation
</details>

<details>
<summary><b>v44 — Context Compaction & AI Studio Live Preview</b></summary>

- **Add:** Context compaction, tool output truncation, skill lazy loading
- **Add:** `games-preview` skill — Vite HMR live preview
</details>

<details>
<summary><b>v43 — Game Polish & AI Studio Quality</b></summary>

- **Add:** AI Studio debug pipeline, Polish Pipeline, game eval assertions
</details>

<details>
<summary><b>v42 — Godot Removal</b></summary>

- **Remove:** Godot agent, skills, workflow
</details>

<details>
<summary><b>v40 — Architecture Hardening</b></summary>

- **Add:** Observability & Alerting (T4), Contract versioning, Mermaid diagrams
</details>

<details>
<summary><b>v32 — Initial Foundation</b></summary>

- **Add:** 4-tier architecture, 10 agents, 8 workflows, 28 skills
- **Add:** Contract system, Retry/Recovery/Reflection policies
</details>
