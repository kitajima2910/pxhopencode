---
name: webs-deployment
description: Deployment web — Vercel, Docker, CI/CD, monitoring, canary, rollback. Zero-downtime, tự động scale.
---

# webs-deployment — Deployment

## Triển khai Vercel
Multi-region (sin1, iad1), security headers + immutable cache cho static assets.
→ `templates/vercel.json`

## Docker (Next.js)
Multi-stage build: deps → builder → runner. Non-root user, healthcheck.
→ `templates/docker/Dockerfile`
→ `templates/docker/docker-compose.yml`

## CI/CD (GitHub Actions)
Lint → typecheck → test → deploy Vercel (amondnet/vercel-action).
→ `templates/.github/deploy.yml`

## Health Check Endpoint
`GET /api/health` — status, uptime, memory, db check → 503 nếu DB down.
→ `templates/health-check.ts`

## Giám sát (Sentry)
0.1 tracesSampleRate, filter `NavigationAbort` errors.
→ `templates/sentry-setup.ts`

## Triển khai Canary
Feature flag dựa trên userId hash (mod 100). 10% newCheckout, 5% newDashboard.
→ `templates/feature-flags.ts`
