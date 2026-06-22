---
name: tools-codegen
description: Code generator — scaffold project, component generator, template engine, Plop.js patterns. Tạo code chuẩn, không lỗi cú pháp.
---

# tools-codegen — Code Generation

## Scaffold Generator
See `templates/scaffold-generator.ts`.

Provides `react/component`, `react/hook`, and `express/route` templates. Extend `TEMPLATES` map to add more. The `scaffold()` function handles directory creation and file writing.

## Plop.js Generator
See `templates/plopfile.ts`.

Deps: `npm install --save-dev plop`. Run with `npx plop`. Uses Handlebars templates for file content.

## Template Engine (EJS-like)
See `templates/template-engine.ts`.

Lightweight `{{variable}}` replacement. Includes `pascalCase` and `camelCase` string helpers.
