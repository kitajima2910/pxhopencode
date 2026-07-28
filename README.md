# pxhopencode — Vibe Coding with OpenCode

<p align="center">
  <b>v82.4</b> · 10 AI agents · 4-tier runtime · 8 workflows · 50 skills · 49 self-tests · 6 contracts
</p>

> Nhúng vào project → mô tả ý tưởng bằng tiếng Việt → AI team tự động phân tích, code, test, fix, review, build.

---

## Cài đặt (30 giây)

```bash
cd project-của-bạn
git clone https://github.com/kitajima2910/pxhopencode.git .opencode
.opencode\start.bat
```

Init script tự động: xoá `.opencode/.git/`, merge `.gitignore`, tạo 13 files `.opencode/.memory/`, launch `opencode`.

> **Docs đầy đủ:** [docs-vibe/index.html](docs-vibe/index.html)

---

## Sử dụng

Sau khi `start.bat` launch `opencode`, chỉ cần gõ prompt tiếng Việt:

```
"Xây dựng web blog với React, có dark mode"
"Làm game platformer 2D, mèo nhảy qua chướng ngại vật"
"Tạo chatbot RAG trả lời câu hỏi từ PDF"
```

### Lệnh `/` trong opencode

| Lệnh | Chức năng |
|------|-----------|
| `/vibe` | Full pipeline 11 bước |
| `/web` | Web app |
| `/game` | Game HTML5 |
| `/ai` | Chatbot, RAG |
| `/debug` | Debug + fix |
| `/status` | Xem memory + pipeline state |
| `/feedback` | Gửi feedback |
| `/diff` | Xem file changes |
| `/rollback <file>` | Rollback file |
| `/secret set KEY=VALUE` | Lưu secret |
| `/secret list` | Xem secrets |
| `/detect` | Auto-detect project framework |
| `/pipeline watch` | Live pipeline status |
| `/validate` | Kiểm tra engine integrity |
| `/context` | Xem session context |

---

## Runtime Engine

```
.opencode/runtime/
├── engine/           # Zod contracts, validators, pipeline, router, memory I/O
│   ├── src/          # TypeScript (28 files)
│   └── __tests__/    # 49 self-tests (vitest)
├── bin/              # CLI tools
│   ├── vibe.mjs      # init, status, resume, feedback, scaffold
│   ├── status.mjs    # Terminal dashboard
│   ├── onboard.mjs   # First-run wizard
│   ├── validate.mjs  # Engine integrity check
│   ├── pipeline.mjs  # Pipeline tracker + live watch
│   ├── diff.mjs      # Git diff + rollback
│   ├── secret.mjs    # Secrets management
│   ├── detect.mjs    # Project auto-detect
│   └── context.mjs   # Session context
```

49 tests verify contracts, pipeline, router, architecture:

```
.opencode\node_modules\.bin\vitest run .opencode\runtime\engine
```

---

## Kiến trúc 4 Tầng

```
T1 — INTERFACE      pxh-help        Validate & classify prompt
T2 — ORCHESTRATION  pxh-pm          Route, retry, recovery, context injection
T3 — WORKERS        7 agents        Code, test, fix, review, build, UI/UX
T4 — INFRASTRUCTURE pxh-save-history State, checkpoint, log, metrics
```

Giao tiếp qua typed contracts (Zod-validated):

| Contract | Hướng | Validation |
|----------|-------|-----------|
| Request | T1→T2 | version, type, target, context |
| Task | T2→T3 | version, phase, target, skills, workflow |
| Result | T3→T2 | version, status, artifacts[] |
| Response | T2→T1 | version, status, summary |
| Event | any→T4 | version, type, phase, reflection |
| State | T4→T2 | version, checkpoint, session_id |

---

## Tham khảo

| Nội dung | Xem ở |
|----------|-------|
| 10 agents | `agents/*.md` |
| 50 skills | `skills/*/SKILL.md` |
| 8 workflows | `workflows/*.md` |
| Contracts | `runtime/contracts/README.md` |
| Memory Engine | `runtime/memory/README.md` |
| Changelog | `STATUS.md` |
