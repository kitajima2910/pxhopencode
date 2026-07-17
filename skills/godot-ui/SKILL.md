---
name: godot-ui
description: Godot 4.x UI/UX — containers, theming, rich text, input handling, responsive layouts. Token-optimized ~1k.
---

# godot-ui — UI/UX

## Containers & Layout
- Use `Container` nodes (HBox/VBox/Grid/Margin) — NEVER absolute pixel offsets
- Anchor presets for responsive scaling: `Expand` + `Keep Aspect` for safe areas
- `add_theme_constant_override("separation", X)` over manual padding
- Minimum touch target: 44px physical size on mobile

## Theming
- `.theme` resources for global skinning — style inheritance via parent chain
- NEVER deep-nest MarginContainers — use single Theme for project margins
- Runtime seasonal theming: StyleBox.duplicate() + material swapping (safe injection)

## Rich Text
- `RichTextLabel` + BBCode: `[color=red][b]Warning![/b][/color]`
- Custom effects: `CustomEffect` with `_process_custom_fx()` for typewriter/rainbow
- `append_text()` for incremental content — use `clear()` before full rebuild

## Input Handling
- `InputMap` for all actions — NEVER read `Input.is_key_pressed()` directly
- Translate ALL input types → normalized actions via `InputManager` autoload
- Controller support: deadzones on analog sticks (`abs(value) < 0.2 → 0`)
- Input rebinding: `InputMap.action_erase_events()` + `action_add_event()`

## Signal Safety
- UI buttons NEVER connect to gameplay logic directly — UI emits signal, Controller listens
- `mouse_filter`: use `STOP` only on background, `PASS` on transparent overlays
- `MOUSE_FILTER_STOP` on transparent containers eats clicks — set to `PASS` if not interactive

Upstream: `github.com/thedivergentai/GD-Agentic-Skills/skills/godot-ui-containers`, `godot-ui-theming`, `godot-ui-rich-text`, `godot-input-handling`
