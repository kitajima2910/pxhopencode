---
name: ui-ux
description: UI/UX design production — web (React/Tailwind), game HUD (Phaser/Three.js), tool (CLI). Responsive, dark mode, animation, accessibility, FOUC-free.
---

# ui-ux — UI/UX Design cho Web, Game, Tool

## Web UI/UX

### Layout & Responsive
- Mobile-first, breakpoints: sm (640), md (768), lg (1024), xl (1280)
- Flexbox/Grid, không dùng float
- Max-width container, padding consistent
- Dark mode: `class="dark"` trên `<html>`, dùng `dark:` variant

### Tailwind patterns
```tsx
// Component với dark mode + responsive
<div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm" />
```

### Animation (FOUC-free)
- `useAnimate()` hoặc CSS `@keyframes`
- `prefers-reduced-motion` tôn trọng
- Không FOUC: dùng `<style>` blocking hoặc `next/dynamic` với `ssr: false`

### Accessibility
- `role`, `aria-label`, `tabIndex`, `focus:ring`
- Keyboard navigation: `onKeyDown` cho Enter/Escape
- Color contrast ≥ 4.5:1

### Debug UI
| Vấn đề | Nguyên nhân | Fix |
|--------|-------------|-----|
| Layout shift | Thiếu width/height cho ảnh | Thêm `w-full h-auto` + aspect ratio |
| FOUC | CSS load sau DOM | Inline critical CSS, preload fonts |
| Dark mode flash | localStorage chưa kịp đọc | `<script>` blocking trong `<head>` |
| Scroll không mượt | `overflow-x` sai | `overflow-x-hidden` đúng chỗ |

---

## Game UI/UX (Phaser, Three.js)

### Game HUD principles
- HUD là DOM overlay hoặc canvas render texture
- DOM overlay: dùng React component chồng lên canvas → dễ style, responsive
- Canvas HUD: dùng Phaser text/graphics, không scaling distortion

### Phaser HUD pattern
```typescript
// DOM overlay (khuyên dùng cho UX phức tạp)
const hudContainer = document.getElementById('hud')!
const hud = createRoot(hudContainer)
hud.render(<HealthBar hp={player.hp} maxHp={100} />)

// Canvas text (cho performance)
const scoreText = this.add.text(16, 16, 'Score: 0', {
  fontSize: '24px', color: '#ffffff',
  stroke: '#000000', strokeThickness: 4
}).setScrollFactor(0).setDepth(100)
```

### FSM-Driven UX
- Dùng state machine sync UI với game state
- `idle → playing → paused → gameover`
- Mỗi transition show/hide UI component tương ứng

### Mobile touch UX
- Touch zone tối thiểu 48×48px, tránh overlap
- `pointer` event thay `click` cho latency thấp hơn
- Joystick: zone cố định góc trái màn hình

### Debug game UI
| Vấn đề | Nguyên nhân | Fix |
|--------|-------------|-----|
| UI lệch trên màn hình khác | Không scale theo viewport | Dùng `Phaser.Scale.FIT` + resize handler |
| Touch không phản hồi | DOM overlay chặn canvas input | `pointer-events: none` trên overlay, chỉ component cần mới `auto` |
| Text nhòe | Font size lẻ | Dùng size chẵn: 16, 18, 20, 24... |
| UI giật khi camera move | Canvas HUD không setScrollFactor(0) | Luôn set `setScrollFactor(0)` |

---

## Tool / CLI UI/UX

### Output patterns
```bash
# Loading spinner
⠋ Đang xử lý...
# Sau khi xong
✓ Hoàn thành (1.2s)
# Error
✗ Lỗi: kết nối thất bại
```

### Color convention
| Màu | Dùng |
|-----|------|
| Cyan | Thông tin, tiêu đề |
| Green | Thành công |
| Yellow | Cảnh báo |
| Red | Lỗi |
| Dim/Gray | Mô tả phụ, timestamp |

### Error UX
- Lỗi → message rõ ràng + suggestion + `.help` command
- Không stack trace trừ khi `--verbose`
- Retry hint: `Thử lại với --retry 3`

### Progress UX
```bash
# Progress bar cho task dài
[##########--------] 50% (2/4 files)

# Thời gian ước tính
⏳ Còn khoảng 30s...
```

### Debug CLI
| Vấn đề | Nguyên nhân | Fix |
|--------|-------------|-----|
| Output loãng | Thiếu grouping | Nhóm theo section, dùng divider `---` |
| Màu không hiển thị | Terminal không hỗ trợ | `NO_COLOR` env, fallback plain text |
| Progress nhấp nháy | `\r` sai frequency | Update tối đa 10 lần/giây |

---

## Cross-platform checklist

- [ ] Dark mode
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Keyboard navigation
- [ ] Screen reader (aria)
- [ ] Touch support
- [ ] Loading skeleton / spinner
- [ ] Error state + empty state
- [ ] Animation (reduced-motion safe)
- [ ] Font loading không FOUC
- [ ] Color contrast ≥ 4.5:1
