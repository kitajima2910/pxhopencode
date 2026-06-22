# Workflow Tool — CLI, Automation, Extension, Package

> **LUẬT NGÔN NGỮ**: UI text = tiếng Việt. Code = tiếng Anh.

## Bước 1: Xác định loại tool

| Loại | Ngôn ngữ | Build | Publish | Skill |
|------|----------|-------|---------|-------|
| CLI (Node) | TypeScript | npm | npm | `tools-cli` |
| CLI (Rust) | Rust | cargo | cargo | `tools-cli` |
| CLI (Python) | Python | pip | PyPI | `tools-cli` |
| Automation | TypeScript/Python | — | npm/PyPI | `tools-automation` |
| VS Code Extension | TypeScript | vsce | Marketplace | `tools-extensions` |
| Code Generator | TypeScript | npm | npm | `tools-codegen` |
| Docker Package | Dockerfile | docker | Docker Hub | `tools-packaging` |

## Bước 2: Setup & Structure
- Node CLI: `npm init && npm install commander`
- Rust CLI: `cargo init && cargo add clap`
- Python CLI: `pip install click`
- VS Code: `yo code` scaffold hoặc dùng template

## Bước 3: Flow code
```
CLI: Parse args → Validate → Core logic → Output → Error handling
Extension: Command → View/Webview → Provider → Config → Activation
Automation: Watcher → Pipeline → Retry → Log
Codegen: Template → Scaffold → Generate
```

## Bước 4: Chất lượng & Phát hành
Sau code → route đến agents theo `workflows/company.workflow.md` (test → fix → review → build → persist).
