---
name: tools-cli
description: CLI app production — commander, clap, click. Spinner, progress bar, error handling, auto-completion, cross-platform.
---

# tools-cli — CLI Apps

## Node.js CLI (commander + inquirer + ora)
See `templates/node-cli.ts`.

Deps: `npm install commander @inquirer/prompts chalk ora`

## Rust CLI (clap + indicatif)
See `templates/rust-cli.rs`.

Deps: clap (features = ["derive"]), indicatif, anyhow in Cargo.toml

## Python CLI (click + rich)
See `templates/python-cli.py`.

Deps: `pip install click rich`

## Error handling
See `templates/error-handling.ts`.

Wrap main entry point; throw `CLIError` for known failures, let unexpected errors bubble to the catch-all.
