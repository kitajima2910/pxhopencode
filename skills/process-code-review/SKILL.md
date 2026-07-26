---
name: process-code-review
description: Dùng khi nhận hoặc yêu cầu code review — quy trình structured review cả 2 phía
---

# Code Review Process

## Core Principle

**Review code, not author. Every comment is a question, not an order.**

## Khi nào dùng

- Trước khi merge bất kỳ branch nào
- Khi nhận review từ agent khác
- Khi review code của đồng nghiệp

## Quy trình Requesting Review

1. **Self-review trước**: diff self-review, check linter/typecheck/test
2. **Context tối thiểu**: gửi kèm spec/plan reference, files thay đổi, testing done
3. **Focus areas**: chỉ rõ phần cần review kỹ

## Quy trình Receiving Review

1. **Đọc từng comment**: hiểu rationale, không defensive
2. **Phân loại**: critical (fix ngay), suggestion (discuss), nitpick (optional)
3. **Fix hoặc reply**: mỗi comment phải có action

## Luật sắt

```
KHÔNG merge NẾU CHƯA có ít nhất 1 review pass
KHÔNG review NẾU CHƯA self-review trước
```

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Merge trước, review sau" | Merge trước = technical debt |
| "Code của tôi không cần review" | Everyone needs review |
