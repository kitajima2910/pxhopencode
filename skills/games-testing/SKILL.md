---
name: games-testing
description: Game testing production — Vitest config, headless Phaser/Three.js test helpers, E2E game test patterns, performance benchmark, memory leak detection.
---

# games-testing — Game Testing Pipeline

> Dùng khi cần test tự động cho game. Coverage target: > 80% game logic.

## Setup

```bash
npm install -D vitest @testing-library/dom happy-dom
# Cho Phaser: npm install -D @phaserjs/phaser-testing
# Cho Three.js: npm install -D three (đã có)
```

## Templates

| File | Mô tả |
|------|-------|
| `vitest.config.ts` | Vitest config với happy-dom + coverage |
| `game-test-utils.ts` | Helper: mock game loop, assert FSM state, simulate input |
| `phaser-test-helper.ts` | Headless Phaser scene test |
| `three-test-helper.ts` | Headless Three.js render test |
| `performance-benchmark.ts` | FPS + memory benchmark test |
| `game-logic.test.ts` | Mẫu test: FSM, collision, scoring, spawn |
| `memory-leak.test.ts` | Phát hiện memory leak trong game loop |

## Chạy test

```bash
npx vitest run              # Một lần
npx vitest --coverage       # Có coverage
npx vitest                  # Watch mode
```

## Integration với CI/CD

Test tự động chạy trong GitHub Actions (xem CI/CD templates).

## Checklist test coverage

- [ ] FSM state transitions (mọi state → mọi state)
- [ ] Collision detection AABB edge cases
- [ ] Bullet/enemy pool acquire/release
- [ ] Scoring system (0, max, overflow)
- [ ] Player health (damage, heal, death, invincibility)
- [ ] Enemy spawn timing
- [ ] Audio play/stop/restart không throw
- [ ] Scene lifecycle (create → update → destroy)
- [ ] Touch input simulation
- [ ] FPS benchmark ≥ 55 desktop / ≥ 30 mobile
