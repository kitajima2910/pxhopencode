# Skill Quick Reference — Consolidated Index

Dùng để chọn skill NHANH mà không cần đọc SKILL.md. Mỗi skill 1 dòng.

## Tổng quan: Web(7) + Game(12) + AI(5) + Tool(5) + UI/UX(1) + Virtual Office(1) = 31 skills (+1 built-in = 32 total)

## Web Skills (7)
| Skill | Use when | Deps | Path |
|-------|----------|------|------|
| `webs-auth` | Auth, OAuth, JWT, RBAC, CSRF | Auth.js, next-auth | skills/webs-auth/ |
| `webs-backend` | API, middleware, error handling, validation | Express, FastAPI | skills/webs-backend/ |
| `webs-database` | Prisma, PostgreSQL, query optimization, migration | Prisma | skills/webs-database/ |
| `webs-deployment` | Docker, CI/CD, Vercel, monitoring, canary | Docker | skills/webs-deployment/ |
| `webs-frontend` | React, components, hooks, data fetching, bundle | React, TanStack Query | skills/webs-frontend/ |
| `webs-styling` | Tailwind, design system, responsive, dark mode | Tailwind | skills/webs-styling/ |
| `webs-testing` | Vitest, Playwright, MSW, unit/integration/e2e | Vitest | skills/webs-testing/ |

## Game Skills (12) — gồm Live Preview
| Skill | Use when | Deps | Path |
|-------|----------|------|------|
| `games-2d` | 2D game, platformer, top-down, Phaser 3 | Phaser 3 | skills/games-2d/ |
| `games-3d` | 3D game, FPS, Three.js, lighting, LOD | Three.js | skills/games-3d/ |
| `games-assets` | Free assets download, sprite sheets, animation | — | skills/games-assets/ |
| `games-audio` | Web Audio API, spatial 3D, pool, format fallback | — | skills/games-audio/ |
| `games-core` | Game loop, scene manager, input, asset loader | — | skills/games-core/ |
| `games-deploy` | GitHub Pages, Itch.io Butler, Vercel deploy | — | skills/games-deploy/ |
| `games-isometric` | 2.5D isometric, tile engine, fog of war, A* | Phaser 3 | skills/games-isometric/ |
| `games-optimization` | Object pool, instancing, LOD, profiling, GC | — | skills/games-optimization/ |
| `games-physics` | AABB, spatial hash, raycast, collision response | — | skills/games-physics/ |
| `games-pwa` | Manifest, service worker, offline, install prompt | — | skills/games-pwa/ |
| `games-preview` | Live preview real-time, Vite HMR, hot-reload, browser auto-open | Vite | skills/games-preview/ |
| `games-testing` | Vitest, headless Phaser/Three.js, benchmark | Vitest | skills/games-testing/ |
> Game dev: trước khi code, đọc `skills/_shared/game-genre-reference.md` — architecture + anti-patterns theo 20+ thể loại. Test headless với `games-testing` (Vitest + Phaser.HEADLESS / headless Three.js).

## AI Skills (5)
| Skill | Use when | Deps | Path |
|-------|----------|------|------|
| `ais-agents` | AI agent framework, tool registry, multi-step | LangChain | skills/ais-agents/ |
| `ais-llm` | LLM chat, streaming SSE, function calling, cost track | OpenAI SDK | skills/ais-llm/ |
| `ais-production` | Caching, rate limit, fallback, monitoring, degradation | Redis | skills/ais-production/ |
| `ais-prompts` | Prompt templates, versioning, A/B test, injection defense | — | skills/ais-prompts/ |
| `ais-rag` | RAG pipeline, chunking, embedding, hybrid search | pgvector | skills/ais-rag/ |

## Tool Skills (5)
| Skill | Use when | Deps | Path |
|-------|----------|------|------|
| `tools-automation` | File watcher, batch processor, pipeline, retry | chokidar | skills/tools-automation/ |
| `tools-cli` | CLI app, commander/clap/click, spinner, progress | commander | skills/tools-cli/ |
| `tools-codegen` | Code scaffold, component generator, Plop.js | Plop | skills/tools-codegen/ |
| `tools-extensions` | VS Code extension, commands, views, providers | VS Code API | skills/tools-extensions/ |
| `tools-packaging` | npm/Cargo/PyPI/Docker/Homebrew packaging | — | skills/tools-packaging/ |

## Virtual Office Skill (1)
| Skill | Use when | Deps | Path |
|-------|----------|------|------|
| `virtual-office` + Bridge | Visualize 4-tier architecture real-time; auto-detect workspace activity via bridge (polling 3s) + SSE broadcast to webview | Node.js 18+ | skills/virtual-office/ |

## Templates per Skill
Chi tiết template trong `skills/<skill>/templates/`. Chỉ đọc khi cần code feature cụ thể — lazy load.
