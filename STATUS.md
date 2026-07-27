# 📊 pxhopencode — AI Company cho Vibe Coding

## 🎯 Tổng quan

| Trường | Giá trị |
|--------|---------|
| Giai đoạn | 10/10 TOÀN DIỆN ✅ |
| Mô hình | AI Company — 4-Tầng Enterprise AI Runtime |
| Phiên bản | v81.1 |
| Agents | 10 (Tầng 1-4) |
| Workflows | 8 theo lĩnh vực |
| Skills | 50 skills (8 Process + 8 Web + 1 3D Web + 12 Game + 7 Game Principle + 1 Game Orchestrator + 5 AI + 5 Tool + 1 UI/UX + 1 Prompt Compiler + 1 Vibe Memory) |
| Contracts | 6 cấu trúc |
| Policies | 3 (Thử lại, Phục hồi, Phản ánh) |

## 🔗 Ma trận liên kết

| Thành phần | Agents | Runtime | Workflows | Skills | Contracts | Policies |
|-----------|--------|---------|-----------|--------|-----------|----------|
| **agents/** | — | ✅ Thẻ layer | ✅ Liên kết giai đoạn | ✅ Tham chiếu | ✅ Tham chiếu | ✅ Tham chiếu |
| **runtime/** | ✅ Agents | — | ✅ Luồng | — | ✅ Sơ đồ | ✅ Thi hành |
| **workflows/** | ✅ Tham chiếu | ✅ Luồng | — | ✅ Tham chiếu | ✅ Tham chiếu | ✅ Tham chiếu |
| **skills/** | ✅ Agent dùng | ✅ Ngữ cảnh | ✅ Được gọi | — | ✅ Tham chiếu | — |
| **runtime/contracts/** | ✅ | ✅ Hướng | ✅ Luồng | — | — | ✅ Tương tác |
| **runtime/policies/** | ✅ Agent | ✅ Tầng thi hành | — | — | ✅ Tham chiếu | — |

## 📁 Cấu trúc

```
.opencode/
├── opencode.json           # Config: agents, commands, skills
├── README.md / STATUS.md   # Tổng quan + Dashboard
├── agents/                 # 10 agents (Tầng 1-4)
├── runtime/                # 4 tầng, memory, contracts, policies
├── workflows/              # 8 workflow templates
├── skills/                 # 50 skills + templates/
└── _shared/                # Dùng chung: templates, scripts, agent-listing
```

## ✅ Process Skill Upgrade — Superpowers Reference
- **Tham khảo**: [obra/superpowers/skills](https://github.com/obra/superpowers/tree/main/skills) — 14 process skills
- **New skills (8)**: `process-driven-development`, `process-parallel-agents`, `process-systematic-debugging`, `process-writing-plans`, `process-tdd`, `process-verification`, `process-code-review`, `process-finishing-branch`
- **Pattern adopted**: Iron Law (Luật sắt), Core Principle, Anti-Rationalization, When-to-Use decision
- **Existing skills upgraded (6)**: ais-agents, ais-llm, ais-production, webs-frontend, webs-backend, webs-testing — thêm Iron Law + Core Principle
- **Agents updated (4)**: pxh-pm, pxh-expert, pxh-fix-bugs, pxh-qa, pxh-review-code — reference process skills
- **Total skill count**: 33 → **39** (+8 process skills, -2 merged)

## ✅ Token Optimization

| Cải tiến | Savings |
|----------|---------|
| Code SKILL.md → templates/ (22 files) | -3.171 dòng |
| Game implementation → templates/ (6 files) | -1.714 dòng |
| Agent normalization (9 files) | -837 dòng |
| Workflow trim + shared includes | -400 dòng |
| runtime/README.md, README.md trim | -179 dòng |
| **V2.0: Agent slim (9 files)** | **-227 dòng (-39%)** |

| **V2.0: Contracts schema concise** | **-29 dòng** |
| **V2.0: Skill quickref → 29 SKILL.md reads avoided** | **-728 dòng (-96%)** |
| **V2.0: Context budget + tiered loading** | **~-50% token/phiên** |
| **V3.0: contracts.md merge → xoá file** | **-76 dòng + 1 read** |
| **V3.0: prompt-optimizer.md trim (53→35 dòng)** | **-18 dòng (-34%)** |
| **V3.0: README.md changelog → _shared/** | **-124 dòng (-35% README)** |
| **V4.0: Ultra compression (10 files)** | **-1.600+ dòng** |
| **Total** | **~9.102 dòng khỏi prompt context** |

## ✅ Vibe Coding Memory Engine v1.0

- [x] `.memory/` — 13 initialisierte Speicherdateien (Index, Projekt, Architektur, Patterns, Bugs, Decisions, Preferences, Workflow, Prompt, Vibe, Snapshots, Timeline, Stats)
- [x] `runtime/memory/README.md` — Memory Engine Dokumentation + Kategorien + Startup-Pipeline
- [x] Contracts merged into `runtime/memory/README.md` — 5 Memory-Contracts (Query, Result, Update, Reflection, SessionStart)
- [x] `skills/vibe-memory/SKILL.md` — Skill für Agents: API, Token-Optimierung, Verification
- [x] `opencode.json` — Instructions registriert, Skill-Pfad aktiviert
- [x] `runtime/README.md` — Memory Engine in Übersicht referenziert
- [x] Memory speichert NUR strukturiertes Wissen, keine Chat-Verläufe
- [x] `.gitignore` chặn `.memory/` — mỗi user có memory riêng, không lẫn với pxhopencode dev
- [x] `runtime/memory/init.json` — seed template cho agents auto-create `.memory/` ở workspace root
- [x] 10 Memory-Kategorien | 5 Contracts | Startup-Pipeline | Reflection Engine | Confidence-System | Token-Optimierung
- [x] Instruction `runtime/memory/README.md` viết lại dạng imperative — buộc agent thực thi startup pipeline mỗi session

## 🚀 Changelog

| Ngày | Phiên bản | Thay đổi |
|------|-----------|----------|
| 2026-07-27 | v79 | **Architecture Integrity Fix** — 6 violations fixed: storage paths (→.memory/), reflection dual-path resolved, STATUS.md aligned, architecture.json populated, Event→T4 chain complete, cross-ref audit. Future-proof. |
| 2026-07-27 | v79.1 | **GitGuard — auto .gitignore for .opencode/** — init-memory.ps1 now also ensures parent project's `.gitignore` has `.opencode/` entry. Creates if missing, appends if present, skips if covered. AI Company never leaked to GitHub. |
| 2026-07-27 | v80 | **10/10 Audit Cleanup** — Fixed all 29 issues: C1-C6, H1-H10, M1-M7. Score: 10/10. |
| 2026-07-27 | v80.1 | **Embedded mode path fix** — init-memory.ps1 now derives pxhopencode root from `$PSScriptRoot` instead of `$WorkspaceRoot`. Works correctly when cloned into `.opencode/` (Scenario B). README documents both standalone + embedded paths. |
| 2026-07-27 | v81 | **Prompt Compiler 10/10 — Vibe Vocabulary + Architecture Sync** — 4 new intents (`enhance_ui`, `rapid_prototype`, `integrate_systems`, `refactor_vibe`) added to `types.ts`, `intents.ts`, `04-intent-parser.ts`. 40+ vibe slang entries (EN+VI) in `phrases.ts` + `06-semantic-analyzer.ts`. Refactored `inferMapping` → `classifyOutput()` dictionary-driven (xóa 50 dòng hardcode). `11-ir-builder.ts` priority + outputStyle cho vibe intents. `DictionaryManager` exposes `classifyOutput` + `getPhraseEntries`. `skills/prompt-compiler/SKILL.md` full vibe vocab. 59/59 tests pass. |
| 2026-07-27 | v81.1 | **Memory Init Hard Gate — 100% enforce** — `prompt-optimizer.md` mở đầu bằng `HARD GATE` (không tiêu đề, không giải thích trước). `pxh-pm.md` MEMORY INIT GATE ở dòng đầu tiên. `runtime/memory/README.md` thêm guard token `[MEMORY_INIT_DONE]`. Đồng bộ 5 references cả 3 files. Agent không thể skip memory init — chưa output token = chưa được xử lý prompt. |
| 2026-07-26 | v77 | **Token Optimization V4.0 — Ultra Compression** — Compress `game-genre-reference.md` 733→78d (-89%), `game-h5-3d-marble-racing.md` 494→72d (-85%), `3d-web-experience/SKILL.md` 252→100d (-60%), `game.workflow.md` 235→94d (-60%), `game-design-h5-2d.md` 183→63d (-66%), `game-design-h5-marble-racing.md` 147→63d (-57%), `game-design-h5-3d.md` 125→52d (-58%), `init.json` 136→30d (-78%), `debug.workflow.md` 131→60d (-54%), `ui-ux/SKILL.md` checklist trim (-39d). **Total savings: ~1.600+ dòng khỏi prompt context.** |
| 2026-07-26 | v76 | **Agent Skills Hub Game Upgrade** — Tham khảo [agent-skills-hub/game-development](https://github.com/agent-skills-hub/agent-skills-hub/tree/main/skills/game-development). Tạo orchestrator `skills/game-development/SKILL.md` bridge implementation (pxhopencode) + principles (agent-skills-hub). Tạo 7 principle sub-skills mới: `game-art`, `game-design`, `multiplayer`, `vr-ar`, `web-games`, `mobile-games`, `pc-games`. Update `/game` command, `game.workflow.md`, `opencode.json`. Skill count: 39→46. |
| 2026-07-26 | v75 | **UI/UX Pro Max Upgrade** — Tham khảo [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). Nâng cấp `skills/ui-ux/SKILL.md`: priority-based rule categories (1-10, Critical→Low), design system workflow (Analyze → Tokens → Supplement), design dials (variance/motion/density), design tokens section, pre-delivery checklist merge. Giữ nguyên game HUD, CLI design system, anti-rationalization. |
| 2026-07-26 | v74 | **Superpowers Skill Upgrade** — Tham khảo [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills). Tạo 8 process skills mới (driven-development, parallel-agents, systematic-debugging, writing-plans, tdd, verification, code-review, finishing-branch). Nâng cấp 6 existing skills với Iron Law + Core Principle. Update 5 agents reference process skills. Skill count: 33→39. |
| 2026-07-26 | v73 | **Token Optimization V3.0** — merge `contracts.md` vào README (xóa file), trim `prompt-optimizer.md` 53→35 dòng (-34%), move README changelog → `_shared/changelog.md` (-124 dòng). Tổng savings: ~218 dòng + 1 file read mỗi session. |
| 2026-07-26 | v72 | **Fix bugs + Clean project** — Xoá 23 dev artifact files (11 root .js + 12 _shared/), clear 3 runtime logs (free ~1.5MB), fix `/ui-ux` command bug (đang trỏ sai vào debug workflow), runtime logs thêm vào `.gitignore` |
| 2026-07-26 | v71 | **Review + Refactor + Optimize** — Fix `pxh-expert.md` QUY_TRÌNH section bị split; sửa STATUS.md agent count (12) + skills count (33); thêm memory reflection step vào T3 worker layer; thêm step load skill vào memory startup |
| 2026-07-26 | v70 | **Vibe Coding Memory Engine v1.0** — 13 file `.memory/` storage, 10 memory categories (project, architecture, patterns, bugs, decisions, preferences, workflow, prompt, vibe, snapshots), timeline + stats, `runtime/memory/` module with README + 5 contracts, `skills/vibe-memory/SKILL.md` for agent integration, Startup-Pipeline, Reflection Engine, Confidence System, Token-Optimierung, auto-project-detection |
| 2026-07-25 | v50 | **Release v50** — Arch check 0 errors, tagged release, fix Anti-Rationalization warnings |
| 2026-07-24 | v49 | **User Guide Rewrite** — README repositioned as user guide, 3 cách vibe code front-and-center, commit count sync |
| 2026-07-24 | v48 | **Prompt Optimizer** — `prompt-optimizer.md` auto-rewrite prompt mơ hồ, collapsible details panel, integration vào opencode.json |
| 2026-06-23 | v44 | Context budget, skill quickref, agent slim (-39%), contracts concise, tiered loading, build script thật, workflow, favicon, fix cross-refs |

## ✅ Điều kiện hoàn thành

- [x] 10 agents với thẻ layer + tham chiếu chéo
- [x] Runtime 4 layer, 6 contracts, 3 policies
- [x] 8 workflows theo lĩnh vực
- [x] 50 skills với templates/ riêng (30 implementation + 20 principle/process/design)
- [x] _shared/ dùng chung (templates, scripts, agent-listing)
- [x] Chrome DevTools MCP tích hợp (--autoConnect)
- [x] README hướng dẫn copy vào `.opencode/`
- [x] **Prompt auto-classification** — T1/T2/T3 tự động phân tích prompt → workflow+skill
- [x] **Permission đúng** — Architect/DevOps `edit: deny`
- [x] **Skill integration** — Worker bắt buộc đọc SKILL.md + templates trước khi code
- [x] **Contract-only communication** — QA→Fix-Bugs dùng Task contract, không @mention trần
- [x] **Feedback loop** — Worker→T2→Worker qua Result/Task contract
- [x] **Architecture integrity** — 6 violations fixed: storage consolidation, reflection single-path, STATUS.md alignment, architecture memory populated, Event→T4 chain complete, zero orphaned references
- [x] **Future-proof** — New agents/skills/workflows can be added with 0 architectural drift; all cross-refs auto-validated
- [x] **GitGuard** — init script auto-creates/updates `.gitignore` with `.opencode/` entry → AI Company không bị commit lên GitHub

## ✅ Release Readiness

| Hạng mục | Trạng thái |
|----------|-----------|
| package.json (name, version, description) | ✅ v80.1.0 |
| README (setup, usage, architecture) | ✅ Đầy đủ |
| LICENSE | ✅ MIT/ Apache 2.0 |
| .gitignore | ✅ Đầy đủ |
| opencode.json (agents, commands, skills) | ✅ 10 agents, 8 commands, 50 skills |
| Agents (10 files) | ✅ Đầy đủ, role-defined |
| Workflows (8 files) | ✅ Đầy đủ |
| Skills (50 skills, 11 sections fixed) | ✅ Đầy đủ, 50/50 hoàn chỉnh |
| Runtime (4 tầng + contracts + policies + memory) | ✅ Đầy đủ |
| Token optimization | ✅ ~9.102 dòng saved khỏi prompt context |
| Compaction config | ✅ auto, summary strategy |
| Cross-references integrity | ✅ Tất cả tham chiếu hợp lệ |
| Architecture integrity | ✅ Single storage path (.memory/), Event→T4 chain, zero violations |
| GitGuard | ✅ Auto .gitignore with .opencode/ entry on init |
| Skill quality | ✅ All 50 skills have Anti-Rationalization + Red Flags + Verification |
| Workflow resilience | ✅ All 8 workflows have loop/failover + language rules + post-code routing |
| T4 protocol | ✅ Event contracts, .memory/ storage, no custom commands |
| Memory engine | ✅ 13/13 files active, no dead paths, compiler-aligned |
