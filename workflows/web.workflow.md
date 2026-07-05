# Workflow Web — Phát triển web app

> **LUẬT NGÔN NGỮ**: UI text (nút, tiêu đề, label, placeholder, menu, error message) = **tiếng Việt**.

## Bước 1: Tech stack

| Stack | Khi nào |
|-------|---------|
| React + Vite + TypeScript | Mặc định |
| Next.js 14+ App Router | Cần SEO/SSR |
| Tailwind CSS | Mặc định styling |
| SCSS / CSS Modules | Design system phức tạp / isolation |
| Next.js + Prisma + PostgreSQL | Mặc định full-stack |
| FastAPI + SQLAlchemy | Python project |
| Node.js + Express + Prisma | Node API thuần |
| tRPC | Type-safe end-to-end |

## Bước 2: Setup
```bash
npm create vite@latest ./ -- --template react-ts
npm install -D tailwindcss @tailwindcss/vite
```
`.gitignore`: `.opencode`, `.gitignore`, `node_modules/`, `.env`, `dist/`, `*.log`. Nếu Next.js: thêm `.next/`, `out/`.
Favicon: `_shared/favicon-svg.md` — `[COLOR_1]=#6366f1, [COLOR_2]=#8b5cf6`

## Bước 3: Cấu trúc
```
src/components/ui/ → shared/ → pages/ → features/auth|billing/ → lib/ → hooks/ → types/ → styles/ → server/
```

## Bước 4: Flow code
```
Setup → Components UI → Pages → API Routes → Database → Auth → Deploy
```

## Chất lượng & Phát hành
Sau code → route đến agents theo `workflows/company.workflow.md` (test → fix → review → build → persist).
