# Company Workflow — AI Company Master Orchestration

> **LUẬT NGÔN NGỮ**: UI text = tiếng Việt. Code = tiếng Anh (biến, hàm, API, class).

## 11 BƯỚC (Runtime 4-Tầng: T1→T2→T3→T4→T2→T1)

```
1. NHẬN     [T1→T2] prompt → T2 phân loại
2. PHÂN TÍCH [T2]   loại, quy mô, công nghệ — nếu thiếu → hỏi user
3. HỌP       [T2]   @meeting: architect, expert, qa, devops → tech stack, skills
4. KẾ HOẠCH  [T2]   init structure → features → test → release
5. THIẾT KẾ  [T2→T3] @pxh-architect: schema, API, component tree
6. CODE      [T2→T3] Route: @web / @game / @ai / @pxh-expert / @pxh-fix-bugs / @pxh-mod-apk / @pxh-ui-ux
                       Sau code: .gitignore (luôn có `.opencode/`, `.github/`), favicon (`_shared/favicon-svg.md`)
7. KIỂM TRA  [T2→T3] @pxh-qa: test → pass→B9, bug→B8
8. SỬA       [T2→T3] @pxh-fix-bugs fix → test lại (max 3 lần)
9. RÀ SOÁT   [T2→T3] @pxh-review-code: security, perf, convention
10. PHÁT HÀNH [T2→T3] @pxh-devops: lint → typecheck → build → báo user
11. LƯU       [T2→T4] @pxh-save-history: session log, ADR, bug report, STATUS.md
```

Vòng lặp: Code→Test→Fix (max 3), Review→Fix→Test (max 3), Build fail→Fix (max 3). Quá → báo user.

## XỬ LÝ NGOẠI LỆ
| Tình huống | Xử lý |
|-----------|-------|
| Thiếu thông tin | Tầng 1 hỏi user |
| Bug 3 lần không fix xong | T2 escalate → báo user |
| Build fail | T2 log → T4 persist → báo user |
| User cancel giữa chừng | T2 dừng, lưu state. User muốn quay lại → Request mới |
| Conflict agents | T2 phân xử, user là sếp cuối cùng |
