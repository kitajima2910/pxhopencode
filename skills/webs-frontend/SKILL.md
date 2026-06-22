---
name: webs-frontend
description: Frontend React production — component patterns, custom hooks, data fetching, bundle optimization. Core Web Vitals, 90+ Lighthouse.
---

# webs-frontend — Frontend

## Mẫu Component
Polymorphic Box + Compound Tabs pattern.
→ `templates/component-patterns.tsx`

## Custom Hooks (production)
- `useAsync` — abort controller, chống memory leak.
- `useDebounce` — 300ms default delay.
- `useLocalStorage` — JSON parse/stringify, try/catch an toàn.
→ `templates/custom-hooks.ts`

## Truy vấn dữ liệu (TanStack Query)
> Cấu hình queryClient: staleTime 5m, gcTime 30m, retry 2. Dùng `keepPreviousData` cho pagination, `invalidateQueries` sau mutation.
→ `templates/data-fetching.ts`

## Tối ưu Bundle
`React.lazy()` cho route và heavy library. Import tree-shaking friendly (`date-fns`). Tailwind purge mặc định.
→ `templates/bundle-optimization.ts`
