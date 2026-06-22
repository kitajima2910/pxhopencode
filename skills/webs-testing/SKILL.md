---
name: webs-testing
description: Testing web — Vitest unit test, integration test, Playwright E2E, MSW mock. Coverage > 80%, chạy song song, không flaky.
---

# webs-testing — Testing

## Cài đặt Vitest
> jsdom, globals, forks pool, timeout 10s, coverage > 80%.
→ `templates/vitest.config.ts`

## Unit Test
Button component — render, click, loading state, variant classes. Dùng `userEvent` (không fireEvent) cho click.
→ `templates/unit-tests.ts`

## Hook Test
`useLocalStorage` — initial value, store/retrieve, invalid JSON recovery. Dùng `renderHook` + `act`.
→ `templates/hook-tests.ts`

## MSW Mock (API)
HTTP handlers GET + POST cho `/api/todos`. Dùng `HttpResponse.json`.
→ `templates/msw-handlers.ts`

## Integration Test
`setupServer` từ MSW, listen/reset/close lifecycle. Test TodoPage load + create.
→ `templates/integration-tests.ts`

## E2E với Playwright
Todo App: empty state, add + complete, persist after reload.
→ `templates/e2e-todo.spec.ts`
