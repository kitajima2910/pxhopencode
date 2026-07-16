# pxhopencode — AI Company cho Vibe Coding

ver39 — Release · 39 commits · 11 AI agents · 4-tier runtime · 8 workflows · 31 skills · 162 templates

---

## 11 Agents

| Agent | Tầng | Role | Dùng khi |
|-------|------|------|----------|
| `pxh-pm` | T2 | Điều phối, routing, policy | Chạy lệnh `/`, giao việc tự động |
| `pxh-architect` | T3 | Thiết kế tech stack, DB, API | Cần kiến trúc hệ thống |
| `pxh-expert` | T3 | Vibe code, workflow + skill | Code production, tính năng mới |
| `pxh-fix-bugs` | T3 | Root cause → fix | Bug, crash, behavior sai |
| `pxh-qa` | T3 | Test, validate | Chạy test, verify chất lượng |
| `pxh-review-code` | T3 | Security, perf, convention | Code review, audit |
| `pxh-devops` | T3 | Lint → typecheck → test → build | Build pipeline, release |
| `pxh-mod-apk` | T3 | Reverse engineering, patch smali/dex, repack | Mod APK/XAPK game/app |
| `pxh-ui-ux` | T3 | UI/UX design (web, game HUD, CLI) | Layout, responsive, accessibility |
| `pxh-save-history` | T4 | State, checkpoint, recovery | Lưu session, phục hồi lỗi |
| `pxh-help` | T1 | Hướng dẫn workflow | Cần trợ giúp, chưa biết bắt đầu |

## Runtime 4 Tầng

```
T1 (Interface) → Request → T2 (Orchestration) → Task → T3 (Workers: 8 agents) → Result → T2 → Response → T1
Mọi tầng → Event → T4 (Infrastructure)
```

- **T1** — `pxh-help`: Validate input, format output
- **T2** — `pxh-pm`: Route task, track state, enforce policy (retry/recovery/reflection)
- **T3** — 8 workers: architect, expert, fix-bugs, qa, review-code, devops, mod-apk, ui-ux
- **T4** — `pxh-save-history`: Persist state, checkpoint, log

## 8 Workflows · 10 Commands

| Lệnh | Template | Mục đích |
|------|----------|----------|
| `/vibe` | `workflows/company.workflow.md` | Tự động chạy toàn bộ quy trình (phân tích → thiết kế → code → test → review → build) |
| `/web` | `workflows/web.workflow.md` | Phát triển web app (React, Next.js, Express, FastAPI) |
| `/game` | `workflows/game.workflow.md` | Phát triển game HTML5 (Phaser 2D, Isometric, Three.js 3D) |
| `/ai` | `workflows/ai.workflow.md` | Ứng dụng AI (chatbot, RAG, agent, LLM) |
| `/tool` | `workflows/tool.workflow.md` | CLI, extension, automation, package |
| `/debug` | `workflows/debug.workflow.md` | Debug + fix bug + mod APK |
| `/mod` | `workflows/debug.workflow.md` | Mod APK/XAPK (alias của /debug) |
| `/ui-ux` | `workflows/debug.workflow.md` | UI/UX design & debug cho web, game, tool |
| `/meeting` | `workflows/meeting.workflow.md` | Họp agents thảo luận giải pháp |
| `/release` | `workflows/release.workflow.md` | Build pipeline: lint → test → build |

## 31 Skills

### Web (8)
| Skill | File | Dùng cho |
|-------|------|----------|
| frontend | `skills/webs-frontend/SKILL.md` | React, component, hooks, data fetching |
| backend | `skills/webs-backend/SKILL.md` | Next.js App Router, Express, FastAPI |
| database | `skills/webs-database/SKILL.md` | Prisma, PostgreSQL, migration, N+1 fix |
| auth | `skills/webs-auth/SKILL.md` | Auth.js, OAuth, JWT, RBAC, CSRF |
| styling | `skills/webs-styling/SKILL.md` | Tailwind, design system, responsive, dark mode |
| testing | `skills/webs-testing/SKILL.md` | Vitest, Playwright E2E, MSW mock |
| deployment | `skills/webs-deployment/SKILL.md` | Vercel, Docker, CI/CD, canary |
| security | `skills/webs-security/SKILL.md` | XSS, CSRF, SQLi, rate limit, secure headers |

### Game (11)
| Skill | File | Engine |
|-------|------|--------|
| core | `skills/games-core/SKILL.md` | Game loop, scene, asset loader, input, FSM |
| 2d | `skills/games-2d/SKILL.md` | Phaser 3: player, enemy, bullet pool, tilemap |
| 3d | `skills/games-3d/SKILL.md` | Three.js: lighting, camera, shooting, AI |
| isometric | `skills/games-isometric/SKILL.md` | 2.5D: tile engine, depth sort, pathfinding |
| physics | `skills/games-physics/SKILL.md` | AABB, spatial hash, raycast, response |
| audio | `skills/games-audio/SKILL.md` | Web Audio API pool, spatial 3D, compression |
| assets | `skills/games-assets/SKILL.md` | Free sprites, 3D models, sounds, fonts + auto-download |
| optimization | `skills/games-optimization/SKILL.md` | Object pool, instancing, LOD, 60 FPS mobile |
| testing | `skills/games-testing/SKILL.md` | Vitest + headless Phaser/Three.js |
| pwa | `skills/games-pwa/SKILL.md` | Manifest, service worker, offline, install |
| deploy | `skills/games-deploy/SKILL.md` | GitHub Pages, Itch.io, Vercel, CI/CD |

### AI (5)
| Skill | File | Mục đích |
|-------|------|----------|
| agents | `skills/ais-agents/SKILL.md` | Tool registry, multi-step reasoning, memory |
| llm | `skills/ais-llm/SKILL.md` | Chat, streaming SSE, function calling, cost |
| rag | `skills/ais-rag/SKILL.md` | Ingestion, chunking, embedding, hybrid search |
| prompts | `skills/ais-prompts/SKILL.md` | Template, versioning, A/B test, injection defense |
| production | `skills/ais-production/SKILL.md` | Caching, rate limit, fallback, monitoring |

### Tool (5)
| Skill | File | Dùng cho |
|-------|------|----------|
| cli | `skills/tools-cli/SKILL.md` | Commander, clap, click, spinner, progress |
| extensions | `skills/tools-extensions/SKILL.md` | VS Code extension: commands, views, providers |
| codegen | `skills/tools-codegen/SKILL.md` | Scaffold, component generator, Plop.js |
| automation | `skills/tools-automation/SKILL.md` | File watcher, batch processor, pipeline |
| packaging | `skills/tools-packaging/SKILL.md` | npm, Cargo, PyPI, Docker, Homebrew |

### Mod (1)
| Skill | File | Kỹ thuật |
|-------|------|----------|
| apk | `skills/mod-apk/SKILL.md` | Reverse engineering, smali patch, anti-tamper bypass, Unity il2cpp, Frida, split APK |

### UI/UX (1)
| Skill | File | Áp dụng |
|-------|------|---------|
| design | `skills/ui-ux/SKILL.md` | Web (Tailwind/React), Game (Phaser HUD), Tool (CLI output), accessibility |

---

## Cách dùng

```
# Prompt trực tiếp — pxh-pm tự động phân tích → chọn workflow → code → test → release
"Làm một web app TODO list với Next.js"

# Lệnh / — gọi workflow cụ thể
/vibe "Game bắn súng 2D, có shop, 10 level"
/debug "APK crash ngay khi mở, check log"
/mod "Mod game online, bypass premium"
/ui-ux "Fix responsive layout và dark mode"

# @agent — gọi agent trực tiếp kèm Task contract
@pxh-expert với phase=code target=./src context="Thêm API route GET /users"
@pxh-mod-apk với phase=mod target=./mod context="Patch isPurchased return true"
```

### Luồng khi dùng prompt/lệnh
1. User gõ prompt hoặc `/lệnh`
2. `pxh-pm` (T2) phân tích loại, chọn workflow
3. Nếu phức tạp → họp `@pxh-architect` + `@pxh-expert` + `@pxh-qa` + `@pxh-devops`
4. Route task đến worker phù hợp (T3)
5. Worker thực thi trong TARGET, tự kiểm tra, trả Result
6. Lặp Code → Test → Fix → Review → Build (max 3 vòng)
7. `pxh-save-history` (T4) lưu session, ADR, bug report

### Chính sách
- **Retry**: Exponential backoff (1s, 2s, 4s), max 3 lần cho lỗi tạm thời
- **Recovery**: Checkpoint-based resume/rollback khi lỗi permanent
- **Reflection**: 4 mức (Task/Phase/Workflow/Incident) ghi vào session log

## Key
- **Context Budget**: T0→T3 loading, lazy skill/template, batch ops
- **Genre Reference**: `_shared/game-genre-reference.md`
- **Headless testing**: Vitest + headless Phaser/Three.js, không cần server
- **Code preservation**: Chỉ tác động trong TARGET
- **Templates**: `_shared/templates/` (status, session, gitignore, bug-report, adr)

## Cấu trúc thư mục

```
pxhopencode/
├── opencode.json              # Cấu hình: agents, commands, skills
├── README.md                  # Tổng quan (file này)
├── runtime/
│   ├── README.md              # Kiến trúc 4 tầng
│   ├── contracts/README.md    # 6 contract giao tiếp
│   └── layers/                # 01-interface .. 04-infrastructure
├── policies/                  # retry, recovery, reflection
├── workflows/                 # 8 workflow .md templates (10 commands)
├── skills/                    # 31 skill directories (mỗi skill có SKILL.md)
├── _shared/                   # Templates, scripts, references
```
