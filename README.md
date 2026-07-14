# pxhopencode — AI Company cho Vibe Coding

9 AI agents, 4-tier runtime, 8 workflows, 29 skills, 162 templates.

## 9 Agents

| Agent | Tầng | Việc |
|-------|------|------|
| `pxh-pm` | T2 | Điều phối, routing, thi hành policy |
| `pxh-architect` | T3 | Thiết kế tech stack, DB, API |
| `pxh-expert` | T3 | Vibe code, workflow + skill |
| `pxh-fix-bugs` | T3 | Root cause → fix |
| `pxh-qa` | T3 | Test, validate |
| `pxh-review-code` | T3 | Security, perf, convention |
| `pxh-devops` | T3 | Lint → typecheck → test → build |
| `pxh-save-history` | T4 | State, checkpoint, recovery |
| `pxh-help` | T1 | Hướng dẫn workflow |

## Runtime 4 Tầng

T1 (Interface) → Request → T2 (Orchestration) → Task → T3 (Workers: 6 agents) → Result → T2 → Response → T1. Mọi tầng → Event → T4 (Infrastructure). Giao tiếp qua 6 contract: Request, Task, Result, Response, Event, State. Policy: Retry (exp backoff max 3), Recovery (checkpoint), Reflection (4 mức).

## 8 Workflows

`vibe` | `web` | `game` | `ai` | `tool` | `debug` | `meeting` | `release`

## 29 Skills

- **Web (8)**: frontend, backend, database, auth, styling, testing, deployment, security
- **Game (11)**: core, 2d, 3d, isometric, physics, audio, assets, optimization, testing, pwa, deploy
- **AI (5)**: agents, llm, rag, prompts, production
- **Tool (5)**: cli, extensions, codegen, automation, packaging

## Cách dùng

- Prompt trực tiếp: `pxh-pm` tự động phân tích → workflow → code → test → release
- Lệnh `/`: `/vibe` `/web` `/game` `/ai` `/tool` `/debug` `/release` `/meeting`
- Gọi `@agent`: `@pxh-expert` với Task contract

## Key

- **Context Budget**: T0→T3 loading, lazy skill/template, batch ops
- **Genre Reference**: `skills/_shared/game-genre-reference.md`
- **Headless testing**: Vitest + headless Phaser/Three.js, không cần server
- **Code preservation**: Chỉ tác động trong TARGET
