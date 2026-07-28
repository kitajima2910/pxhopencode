# pxhopencode — Vibe Coding with OpenCode

<p align="center">
  <b>v82.5</b> · 10 AI agents · 4-tier runtime · 8 workflows · 50 skills · 49 self-tests · 6 contracts · 23 commands
</p>

> Nhúng vào project → chạy 1 lệnh → gõ prompt tiếng Việt. AI team tự động code, test, fix, review.

---

## Cài đặt (30 giây)

```bash
cd project-của-bạn
git clone https://github.com/kitajima2910/pxhopencode.git .opencode
.opencode\start.bat
```

`start.bat` tự động: xoá `.git` nested, init memory, merge `.gitignore` → launch `opencode`.

---

## Cách dùng

### 1. Gõ prompt — mọi thứ tự động

Sau khi `opencode` launch, **chỉ cần gõ ý tưởng bằng tiếng Việt**:

```text
Xây dựng web blog cá nhân với React, có dark mode
```

→ pxh-pm tự động: detect project → chọn workflow → `enforce run` → route worker → `enforce pass`.

Bạn không cần biết agent nào làm gì. Mỗi phase tự động validate contract + inject context + track pipeline + detect framework.

### 2. Khi cần kiểm tra

| Bạn gõ | Kết quả |
|--------|---------|
| `/status` | Xem memory entries + pipeline đang ở phase nào |
| `/pipeline watch` | Live cập nhật real-time từng phase |
| `/context` | Xem session context (prompt gần đây) |
| `/diff` | Xem những file đã thay đổi |
| `/detect` | Phát hiện framework project (React, Phaser, ...) |

### 3. Khi cần sửa

| Bạn gõ | Kết quả |
|--------|---------|
| `/rollback src/App.tsx` | Hoàn tác file về commit cuối |
| `/diff src/App.tsx` | Xem chi tiết thay đổi trong file |

### 4. Khi cần secrets

```text
/secret set OPENAI_KEY=sk-...
```

Lưu vào `.opencode/.env`, tự động gitignored. Agent dùng `secret.mjs get` để đọc — không bao giờ hardcode.

### 5. Khi muốn góp ý

```text
/feedback Game bị chậm, nên dùng object pool
```

Ghi vào `.opencode/.memory/feedback.json`. Session sau memory engine tự động load.

---

## Luồng thực tế (agent tự động, user không thấy)

```
Bạn gõ: "Làm game platformer 2D"

Phía sau:
  1. pxh-pm classify → /game workflow
  2. enforce run architect → validate + context + pipeline + detect
  3. pxh-architect thiết kế
  4. enforce pass architect
  5. enforce run code
  6. pxh-expert code + enforce pass code
  7. enforce run test → pxh-qa test → enforce pass/fail
  8. (nếu fail) enforce run fix → pxh-fix-bugs → enforce pass/fail
  ... cho đến build → persist
```

Mỗi phase đều qua ENFORCEMENT GATE: nếu pre-hook lỗi, KHÔNG proceed.

---

## Tổng quan

| Thành phần | Số lượng |
|-----------|---------|
| Agents | 10 (T1-T4) |
| Workflows | 8 |
| Skills | 50 |
| Contracts | 6 (Zod-validated) |
| Self-tests | 49 |
| Commands | 23 |

Docs đầy đủ: `docs-vibe/index.html` · Changelog: `STATUS.md`
