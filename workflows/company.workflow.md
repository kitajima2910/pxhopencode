# 🏢 Company Workflow — AI Company Master Orchestration

Workflow master điều phối AI Company. Khi user viết prompt, workflow tự động chạy: ý tưởng → sản phẩm.

> LUẬT NGÔN NGỮ: UI text = tiếng Việt. Code = tiếng Anh (biến, hàm, API, class).

## QUY TRÌNH 11 BƯỚC (Runtime 4-Tầng)

Mỗi bước chạy: **T1 → T2 → T3 → T4 → T2 → T1**. Sau mỗi bước, log `Event{type: status, phase: "..."}` đến `@pxh-save-history` để cập nhật STATUS.md.

```
 1. NHẬN     [T1→T2] Tiếp nhận prompt → T2 phân loại
 2. PHÂN TÍCH [T2]   PM phân tích (loại, quy mô, công nghệ)
 3. HỌP       [T2]   @meeting → architect, expert, qa, devops
 4. KẾ HOẠCH  [T2]   Lập kế hoạch chi tiết
 5. THIẾT KẾ  [T3]   @pxh-architect → schema, API, component tree
 6. CODE      [T3]    @pxh-expert → vibe code theo workflow + skill
 7. KIỂM TRA  [T3]    @pxh-qa → test → pass/fail
 8. SỬA       [T3]    @pxh-fix-bugs → fix bug → quay lại B7
 9. RÀ SOÁT   [T3]    @pxh-review-code → security, perf, convention
10. PHÁT HÀNH [T3]    @pxh-devops → lint → typecheck → build
11. LƯU       [T4]    @pxh-save-history → session log, ADR, STATUS.md
```

Nếu bất kỳ bước nào fail → tự động quay lại bước phù hợp. Vòng lặp tới khi release hoặc user cancel.

## Chi tiết các bước

### Bước 1: NHẬN
Nhận prompt từ user (dự án mới, tính năng, bug, câu hỏi kỹ thuật).
→ T2 evaluate → chuyển Bước 2.

### Bước 2: PHÂN TÍCH (PM)
Xác định: Loại (Web/Game/AI/Tool/Debug), Quy mô (S/M/L), Công nghệ, Mục tiêu (MVP/Production/Fix), Ràng buộc.
→ Nếu rõ → Bước 3. Nếu thiếu → hỏi user.

### Bước 3: HỌP
Gọi `@meeting` với kết quả phân tích. Agents: architect (phản biện), expert (khả thi), qa (test), devops (infra).
Kết quả: tech stack, workflow, skills, timeline.

### Bước 4: KẾ HOẠCH
Viết kế hoạch: Khởi tạo (project structure, .gitignore, deps) → Tính năng chính → Kiểm thử → Phát hành.

### Bước 5: THIẾT KẾ [T2→T3]
Route `Task{phase: "architect"}` → `@pxh-architect`: schema, API, component tree, data flow.
Trả về `Result{artifacts}`. Lưu ADR nếu cần.

### Bước 6: CODE [T2→T3]
Chọn workflow theo routing table và route đến worker:

| Dự án | Route |
|-------|-------|
| Web | `@web` |
| Game 2D/3D/2.5D | `@game` |
| AI | `@ai` |
| Tool/auto | `@pxh-expert` |
| Fix bug | `@pxh-fix-bugs` |

Sau code: setup `.gitignore` (ensure 3 dòng: `.opencode`, `.playwright-mcp`, `.gitignore`), setup Playwright, tạo favicon (xem `_shared/favicon-svg.md`), commit.

### Bước 7: KIỂM TRA [T2→T3]
Route `Task{phase: "test"}` → `@pxh-qa`: check test suite → run tests → `Result{pass/fail, bugs}`.
- PASS → Bước 9. CÓ BUG → Bước 8.

### Bước 8: SỬA [T2→T3]
Route `Task{phase: "fix", target: bugs}` → `@pxh-fix-bugs`. Fix → test lại.
Vòng lặp Test→Fix tối đa 3 lần, quá → báo user.

### Bước 9: RÀ SOÁT [T2→T3]
Route `Task{phase: "review"}` → `@pxh-review-code`: security, perf, convention, quality.
Có issue → fix → quay lại Bước 7. OK → Bước 10.

### Bước 10: PHÁT HÀNH [T2→T3]
Route `Task{phase: "build", gate: {qa: pass, review: pass}}` → `@pxh-devops`:
Lint + Typecheck → Build → báo user (user tự deploy).

### Bước 11: LƯU [T2→T4]
Gửi `Event{type: session_end}` → `@pxh-save-history`:
1. Lưu session log `.opencode/docs/changelog/YYYY-MM-DD.md`
2. Lưu ADR `.opencode/docs/decisions/`
3. Lưu bug report `.opencode/docs/bugs/`
4. Cập nhật STATUS.md: giai đoạn LƯU ✅

## VÒNG LẶP PHẢN HỒI
```
Code → Test → (có bug) → Fix → Test lại
Review → (có issue) → Fix → Test lại
Build fail → Fix → Test lại
```
Tối đa 3 lần/vòng. Quá → báo user.

## XỬ LÝ NGOẠI LỆ
| Tình huống | Xử lý |
|-----------|-------|
| Thiếu thông tin | Tầng 1 hỏi user |
| Bug 3 lần không fix xong | T2 escalate → báo user |
| Build fail | T2 log → T4 persist → báo user |
| User cancel giữa chừng | T2 dừng, lưu state. User muốn quay lại → Request mới |
| Conflict agents | T2 phân xử, user là sếp cuối cùng |
