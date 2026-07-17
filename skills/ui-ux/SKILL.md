---
name: ui-ux
description: UI/UX design production — web (React/Tailwind), game HUD (Phaser/Three.js), tool (CLI). Responsive, dark mode, animation, accessibility, FOUC-free.
---

# ui-ux — UI/UX Design cho Web, Game, Tool

**Khi dùng:** Yêu cầu UI/UX → load skill này. Agent tự chọn platform (web/game/tool) dựa trên project type.

## Quy trình (3 bước)

| Step | Làm | Output |
|------|-----|--------|
| 1. Phân tích | Xác định platform + constraints (mobile-first?, dark mode?, FOUC?, a11y?) | Platform checklist |
| 2. Áp dụng pattern | Chọn section tương ứng bên dưới, tạo component | Code + style |
| 3. Verify | Chạy cross-platform checklist, kiểm tra NO_COLOR fallback | Pass/fail |

## Web — Layout & Components

- Mobile-first: sm(640) md(768) lg(1024) xl(1280), Flexbox/Grid, container padding
- Dark mode: `class="dark"` on html, `dark:` variant
- FOUC-free: `<style>` blocking hoặc `next/dynamic` ssr:false
- A11y: `role` `aria-label` `tabIndex` `focus:ring`, keyboard nav, contrast ≥ 4.5:1

```tsx
<div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm" />
```

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Layout shift | Missing img w/h | `w-full h-auto` + aspect ratio |
| FOUC | CSS after DOM | Inline critical CSS |
| Dark flash | localStorage race | `<script>` blocking in `<head>` |

## Game — Phaser HUD

- DOM overlay cho UX phức tạp, Canvas text cho perf
- Touch zone ≥ 48×48, `pointer` event, joystick fixed bottom-left
- FSM sync: `idle→playing→paused→gameover` show/hide components

```ts
const hud = createRoot(document.getElementById('hud')!)
hud.render(<HealthBar hp={player.hp} maxHp={100} />)
const score = this.add.text(16, 16, 'Score: 0', { fontSize:'24px', color:'#fff', stroke:'#000', strokeThickness:4 }).setScrollFactor(0).setDepth(100)
```

| Bug | Fix |
|-----|-----|
| UI lệch viewport | `Phaser.Scale.FIT` + resize handler |
| Touch không phản hồi | `pointer-events:none` on overlay |
| Text nhòe | Font size chẵn (16,18,20...) |
| UI giật camera | `setScrollFactor(0)` |

## Tool / CLI

- Spinner + status icon (✓✗), NO_COLOR fallback
- Progress bar: `[#####-----] 50%`, update ≤ 5Hz
- Error: message + suggestion + retry hint, no stacktrace unless `--verbose`

| Color | Use |
|-------|-----|
| Cyan | Info, title |
| Green | Success |
| Yellow | Warning |
| Red | Error |
| Dim | Meta, timestamp |

### CLI Design System — pxhopencode Runtime

> CLI output format cho hệ thống 4 tầng. Dùng cho mọi agent output.

**1. Symbol Set (ASCII, không emoji)**

| Ý nghĩa | Symbol | Code |
|---------|--------|------|
| Success | `✓` | `\u2713` |
| Fail | `✗` | `\u2717` |
| Running | `⏳` | `\u23F3` |
| Arrow | `→` | `\u2192` |
| Box T | `┌──┐` | `\u250C\u2500\u2510` |
| Box B | `└──┘` | `\u2514\u2500\u2518` |

Fallback (`$env:NO_COLOR`): `[>]`, `[x]`, `[ ]`.

**2. Layout — 4 tầng**

```
┌─ T1 ──────────────────────────────────────────┐
│ pxh-help  Validate input                        │
│   → Request {type, target, context}             │
└────────────────────────────────────────────────┘
    ↓
┌─ T2 ──────────────────────────────────────────┐
│ pxh-pm   Phase: code→test→fix  Retry: 2/3 ⏳    │
└────────────────────────────────────────────────┘
    ↓
┌─ T3 ──────────────────────────────────────────┐
│ pxh-expert  ✓ Code generated  ✓ Tests pass      │
└────────────────────────────────────────────────┘
    ↓
┌─ T4 ──────────────────────────────────────────┐
│ pxh-save-history  ✓ Session saved               │
└────────────────────────────────────────────────┘
```

Mỗi tầng = 1 box. Prefix `[T1]`, `[T2]`, `[T3]`, `[T4]`.

**3. Contract Format**

```
Request  {version|type|target|context}           → 1 dòng
Task     {version|phase|target|skills|workflow}  → ≤2 dòng
Result   {version|status|artifacts[]}            → status + summary
Response {version|status|summary}                → 1 dòng cuối
```

Không in raw JSON — tóm tắt 1-2 dòng.

**4. Anti-Patterns**

| Anti-pattern | Thay bằng |
|-------------|-----------|
| Emoji trong output | ASCII symbols |
| Raw JSON contract | Tóm tắt 1-2 dòng |
| Spam > 10Hz | Update ≤ 5 lần/s |
| Không prefix tầng | `[T1]`, `[T2]`, ... |
| Màu tuỳ tiện | NO_COLOR fallback |

**5. Pre-delivery checklist**

- [ ] Output prefix `[Tn]` mỗi dòng
- [ ] Box ┌─┐ cho block multi-line
- [ ] Contract tóm tắt, không raw JSON
- [ ] status icon ✓/✗ đúng
- [ ] `$env:NO_COLOR` fallback hoạt động
- [ ] Progress ≤ 5Hz
- [ ] Phân cách section rõ ràng

## Anti-Rationalization

| Excuse | Reality |
|--------|---------|
| "Sẽ fix responsive sau" | Mobile-first không thể patch sau — thiết kế lại toàn bộ layout |
| "Dark mode là optional" | 30% user dùng dark mode — thiếu là UX fail |
| "Accessibility sau" | WCAG violations = legal risk, phải refactor cả component |
| "CLI màu không cần fallback" | Terminal không màu = output vô dụng |
| "Game UI trên canvas là đủ" | DOM overlay cho UX phức tạp dễ hơn 10x |
| "FOUC không đáng lo" | FOUC = perception app chậm, user thoát ngay |

## Red Flags

- Layout không test trên mobile < 375px
- Game HUD không setScrollFactor(0)
- CLI output không có NO_COLOR fallback
- Keyboard navigation không hoạt động
- Thiếu loading/error/empty states

## Verification

- [ ] Platform checklist complete (web/game/tool)
- [ ] Dark mode toggle works, no flash
- [ ] Keyboard nav: Tab/Enter/Escape
- [ ] Color contrast ≥ 4.5:1
- [ ] `$env:NO_COLOR = "1"` → plain text
- [ ] Touch zones ≥ 48×48
- [ ] prefers-reduced-motion respected
- [ ] Loading + error + empty states exist
