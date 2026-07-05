---
name: games-deploy
description: Game deploy pipeline — GitHub Pages, Itch.io Butler, Vercel. CI/CD tự động, zero-downtime, PWA-ready.
---

# games-deploy — Game Deploy Pipeline

## Templates

| File | Mô tả |
|------|-------|
| `.github/workflows/deploy-pages.yml` | CI/CD → test → build → GitHub Pages |
| `.github/workflows/deploy-itch.yml` | CI/CD → build → Itch.io (Butler) |
| `itch-butler-setup.sh` | Cài đặt and configure Butler CLI |
| `deploy-checklist.md` | Pre-deploy checklist |

## Deploy targets

| Target | Free? | PWA? | Domain tùy chỉnh | Ghi chú |
|--------|-------|------|-----------------|---------|
| GitHub Pages | ✅ Free | ✅ Có | ✅ Custom domain | game chỉnh trong repo |
| Itch.io | ✅ Free | ❌ | ❌ | butler CLI push |
| Vercel | ✅ Free tier | ✅ Có | ✅ | `vercel --prod` |
| Netlify | ✅ Free tier | ✅ Có | ✅ | `netlify deploy` |

## Pipeline

```
Push → GitHub Actions → Lint → Test → Build → Deploy
```
