---
name: webs-styling
description: Styling production — Tailwind, design system, responsive, dark mode, animation. Không FOUC, không layout shift.
---

# webs-styling — Styling

## Cài đặt Tailwind
Dark mode class-based. OKLCH colors, custom keyframes. `content` trỏ đúng src.
→ `templates/tailwind.config.ts`

## Design System Tokens
Spacing, radius, shadow, fontSize, breakpoint — dùng JS object để đồng bộ design system.
→ `templates/design-tokens.ts`

## Mẫu Responsive
Grid responsive + Container Query + Aspect Ratio component.
→ `templates/responsive-patterns.tsx`

## Dark Mode (không FOUC)
`useTheme` hook: localStorage → system preference fallback. Inject inline script trong `<head>` để chống FOUC: `<script>document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches))</script>`
→ `templates/use-theme.ts`
