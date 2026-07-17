# Company Workflow — Master Orchestration

> **LUẬT:** UI text = tiếng Việt. Code = tiếng Anh.

## 11 bước (T1→T2→T3→T4→T2→T1)

| # | Phase | Agent | Output | Verification Gate |
|---|-------|-------|--------|------------------|
| 1 | NHẬN | T1→T2 | Prompt classified | Type + scope xác định rõ |
| 2 | PHÂN TÍCH | T2 | Tech stack, quy mô | Đủ info để chọn workflow? Thiếu→hỏi |
| 3 | HỌP | T2→@meeting | Đồng thuận tech stack | ADR ghi lại quyết định |
| 4 | KẾ HOẠCH | T2 | Feature list, milestones | Mọi feature có acceptance criteria |
| 5 | THIẾT KẾ | @pxh-architect | Schema, API, component tree | Thiết kế review bởi T2 trước code |
| 6 | CODE | @pxh-expert/@pxh-ui-ux | Code trong TARGET | .gitignore + favicon + lint pass |
| 7 | KIỂM TRA | @qa | Test results | Coverage ≥ 80%, all green |
| 8 | SỬA | @fix-bugs | Bug fix | Root cause doc, test confirm fix |
| 9 | RÀ SOÁT | @review-code | Review issues | Critical=0, max 3 nit còn lại |
| 10 | PHÁT HÀNH | @devops | Build artifact | lint→typecheck→test→build pass |
| 11 | LƯU | @save-history | Session log, ADR | STATUS.md updated |

### Loop mechanism
- Code→Test→Fix: nếu test fail → quay lại Bước 6 (max 3 lần)
- Review→Fix→Test: nếu critical issue → quay lại Bước 8 (max 3 lần)
- Build fail → quay lại Bước 6 (max 3 lần)
- Quá 3 lần → báo user

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Code trước, thiết kế sau" | Thiếu architect → N+1 queries, wrong schema, rewrite |
| "Test chạy thủ công, không cần unit" | Mỗi bug manual = 10x cost so với automated |
| "Review chỉ hình thức" | Security hole không review = production incident |
| "Skip build, deploy thẳng" | Lint/typecheck fails ở CI = mất thời gian hơn |
| "ADR không cần, sau này viết" | 2 tuần sau không ai nhớ tại sao chọn tech đó |

## Red Flags

- Phase bị skip không có lý do chính đáng
- Test pass nhưng coverage < 60%
- Build warning bị ignore
- Bug tái phát > 2 lần (thiếu root cause)
- Critical review issue bị postpone

## Verification
- [ ] Task contract đủ fields: phase, target, context, skills
- [ ] Loop mechanism applied (max 3 retries per phase)
- [ ] Mỗi phase có output artifact tương ứng
- [ ] Event ghi lại mọi decision cho T4

## XỬ LÝ NGOẠI LỆ
| Tình huống | Xử lý |
|-----------|-------|
| Thiếu thông tin | T1 hỏi user |
| Bug 3 lần không fix | T2 escalate → báo user |
| Build fail | T2 log → T4 persist → báo user |
| User cancel | T2 lưu state, resume sau |
| Conflict agents | T2 phân xử, user cuối cùng |
