---
name: webs-backend
description: Backend web production — Next.js App Router, Express, FastAPI, middleware, error handling, validation, rate limit.
---

# webs-backend — Backend

## Next.js API Routes (App Router)
Zod validation, pagination (skip/take), proper error responses.
→ `templates/api-routes.ts`

## Xử lý lỗi Middleware
`AppError` class (statusCode + message + details). `handleError` phân loại AppError / ZodError / lỗi không xử lý → response JSON.
→ `templates/error-handler.ts`

## Giới hạn tốc độ (in-memory)
Sliding window, tự cleanup khi > 10000 keys. Không cần Redis, phù hợp serverless. Dùng `rateLimiter.check(key)` → `{ allowed, remaining, resetIn }`.
→ `templates/rate-limiter.ts`
