# Skill Quick Reference — Consolidated Index

Dùng để chọn skill NHANH mà không cần đọc 28 SKILL.md. Mỗi skill 1 dòng.

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

## Game Skills (11) + Chrome DevTools Preview
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

## Godot Skills (5)
| Skill | Use when | Deps | Path |
|-------|----------|------|------|
| `godot-master` | Godot project start, architecture, anti-patterns, perf budgets | — | skills/godot-master/ |
| `godot-2d` | Godot 2D: CharacterBody2D, physics, tilemap, animation, camera | godot-master | skills/godot-2d/ |
| `godot-3d` | Godot 3D: lighting, materials, world, physics, nav, procgen | godot-master | skills/godot-3d/ |
| `godot-gameplay` | Godot combat, inventory, quest, dialogue, save, abilities | godot-master | skills/godot-gameplay/ |
| `godot-ui` | Godot UI: containers, theming, rich text, input handling | godot-master | skills/godot-ui/ |
> Godot: load `godot-master` trước (3k tokens). Load domain skill cụ thể (1-1.5k tokens). NEVER load all — Context Storm. Upstream: `github.com/thedivergentai/GD-Agentic-Skills` (96 skills chi tiết).

## Templates per Skill
Chi tiết template trong `skills/<skill>/templates/`. Chỉ đọc khi cần code feature cụ thể — lazy load.
