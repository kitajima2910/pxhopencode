# pxhopencode — Vibe Coding with OpenCode

> **Nhúng vào project → `opencode` → mô tả ý tưởng bằng tiếng Việt.**
> AI team tự động phân tích, code, test, fix, review, build.

---

## Cài đặt

```bash
cd project-của-bạn
git clone <url> .opencode
.opencode\start.bat
```

Sau lệnh cuối, `start.bat` tự động:
1. Init `.opencode/.memory/` (13 files)
2. Merge `.gitignore` entries
3. Launch `opencode` — bạn chỉ cần gõ prompt.

## Sử dụng

Sau khi `start.bat` launch `opencode`, bạn chỉ cần **mô tả ý tưởng bằng tiếng Việt**:

```
"Xây dựng web blog cá nhân với React, có dark mode"
"Làm game platformer 2D, nhân vật mèo nhảy qua chướng ngại vật"
"Tạo chatbot RAG trả lời câu hỏi từ tài liệu PDF nội bộ"
```

Hoặc dùng lệnh `/` để route thẳng vào workflow:

| Lệnh | Ví dụ |
|------|-------|
| `/vibe` | `/vibe xây dựng app quản lý công việc` |
| `/web` | `/web làm landing page` |
| `/game` | `/game game bắn súng 2D` |
| `/ai` | `/ai tạo chatbot` |
| `/debug` | `/debug game bị giật FPS` |
| `/status` | Xem trạng thái memory + pipeline |
| `/feedback` | Gửi feedback |

## Lần chạy đầu tiên

Nếu muốn scaffold project mẫu trước:

```bash
.opencode\start.bat
# Trong opencode, gõ:
/init
```

---

## Thông tin thêm

| Nội dung | Xem ở |
|----------|-------|
| Kiến trúc 4 tầng | `docs-vibe/index.html` |
| 10 agents | `agents/*.md` |
| 50 skills | `skills/*/SKILL.md` |
| 8 workflows | `workflows/*.md` |
| 49 self-tests | `runtime/engine/__tests__/` |
| Changelog | `STATUS.md` |
