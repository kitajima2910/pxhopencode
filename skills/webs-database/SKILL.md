---
name: webs-database
description: Database production — Prisma, PostgreSQL, indexing, query optimization, migration zero-downtime. Không N+1, query < 50ms.
---

# webs-database — Database

## Lược đồ Prisma (production)
User + Todo với index composite, cascade delete.
→ `templates/schema.prisma`

## Tối ưu Truy vấn (chống N+1)
Dùng `include`, `_count`, hoặc `$queryRaw` thay vì loop N+1.
→ `templates/query-optimization.ts`

## Phân trang (cursor-based)
`take: limit + 1` để phát hiện `hasMore`. Dùng `skip: 1, cursor` để lấy trang tiếp.
→ `templates/pagination.ts`

## Migration không gián đoạn
Add nullable → backfill batch → NOT NULL + default → index CONCURRENTLY.
→ `templates/migrations.sql`

## Giao dịch
`prisma.$transaction` cho atomic operations.
→ `templates/transactions.ts`
