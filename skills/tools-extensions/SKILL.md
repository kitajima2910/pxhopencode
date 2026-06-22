---
name: tools-extensions
description: VS Code extension — commands, views, providers, config. Không block UI, đúng lifecycle, production-ready.
---

# tools-extensions — IDE Extensions

## VS Code Extension (cơ bản)
See `templates/extension.ts`.

Register commands in `activate()`, push disposables to `context.subscriptions`. Cleanup in `deactivate()`.

## Tree View Provider
See `templates/tree-view.ts`.

Extend `TreeItem` for custom data. Implement `TreeDataProvider` with `getChildren` / `getTreeItem`. Call `refresh()` to update.

## Webview Panel
See `templates/webview.ts`.

Single-instance webview panel with `reveal()` on re-show. Use `getHtml()` for inline HTML. Enable `enableScripts` for JS interaction.
