# pxhopencode / .opencode — AI Company cho Vibe Coding

Hệ thống AI agents tự động vibe code như một AI Company. Copy vào `.opencode/` → viết prompt → agents tự động thảo luận → code → test → fix → release. Enterprise AI Runtime 4-layer, structured contracts, retry/recovery/reflection policies.

---

## 🤖 9 AI Agents chuyên biệt

| Agent | Tầng | Nhiệm vụ |
|-------|------|----------|
| `pxh-pm` | T2 — Điều phối | CEO: điều phối, routing, thi hành chính sách |
| `pxh-architect` | T3 — Kiến trúc | Thiết kế tech stack, DB, API |
| `pxh-expert` | T3 — Lập trình | Vibe code, chọn workflow + skill |
| `pxh-fix-bugs` | T3 — Sửa lỗi | Stack trace → root cause → fix |
| `pxh-qa` | T3 — Kiểm thử | Chạy test, xác thực chất lượng |
| `pxh-review-code` | T3 — Rà soát | Bảo mật, hiệu năng, quy ước |
| `pxh-devops` | T3 — Build | Lint → typecheck → test → build |
| `pxh-save-history` | T4 — Hạ tầng | Lưu state, checkpoint, phục hồi |
| `pxh-help` | T1 — Giao diện | Hướng dẫn chọn workflow |

## 🏛 Enterprise AI Runtime (4 Tầng)

```
T1 (Giao diện) → xác thực → T2 (Điều phối) → route → T3 (Nhân công) → execute → T4 (Hạ tầng) → persist
```

Giao tiếp qua 6 contract: Request, Task, Result, Response, Event, State.
Chính sách: Thử lại (exp backoff, max 3), Phục hồi (checkpoint), Phản ánh (4 mức).

## 🌐 7 Workflow

`/vibe` (full company) | `/web` | `/game` (2D/2.5D/3D) | `/ai` | `/debug` | `/meeting` | `/release`

## 🛠 25 Skills

`webs-*` (7) | `games-*` (8) | `ais-*` (5) | `tools-*` (5)

## 🎯 Tính năng
- `.opencode/STATUS.md` real-time dashboard
- **Context Budget**: tiered loading T0→T3, lazy skill/template, batch ops — ~50% token/phiên
- **Skill Quick Reference**: 1 read thay 25 SKILL.md, chỉ load template khi cần code
- **Conversation Budget**: max rounds/task, chặn infinite loop tốn token
- `.gitignore` tự động (`.opencode`, `.playwright-mcp`, `.gitignore`)
- Playwright MCP debug UI browser
- Favicon SVG tự động
- UI text = tiếng Việt, code = tiếng Anh
- Bảo toàn code: chỉ tác động trong TARGET

---

## Cài đặt & Cấu trúc

```bash
# macOS / Linux
cp -r ../pxhopencode .opencode

# Windows (PowerShell)
Copy-Item -Recurse ../pxhopencode .opencode
```

```
.opencode/
├── opencode.json   # Config
├── README.md       # File này
├── STATUS.md       # Dashboard real-time
├── LICENSE         # MIT
├── .gitignore      # Tự động
├── agents/         # 9 agents
├── runtime/        # 4 tầng, contracts, policies
├── workflows/      # 7 workflow templates
├── skills/         # 4 lĩnh vực, 25 skills + templates/
└── _shared/        # Dùng chung: context-budget, skill-quickref, templates, scripts
```

## Cách dùng
- **Prompt trực tiếp**: pxh-pm tự động phân tích → meeting → code → release
- **Lệnh `/`**: `/vibe`, `/web`, `/game`, `/ai`, `/debug`, `/release`, `/meeting`
- **Gọi `@agent`** (kèm Task contract): `@pxh-expert` với task rõ ràng, `@pxh-architect`, etc.

---

**Tác giả: Phạm Xuân Hoài - Error404-Labs.Info.Vn**
