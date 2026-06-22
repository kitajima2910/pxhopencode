---
name: tools-automation
description: Automation script — file watcher, batch processor, pipeline, retry, logging. Chạy ổn định 24/7, không memory leak.
---

# tools-automation — Automation Scripts

## File Watcher (debounced, không double-fire)
See `templates/file-watcher.ts`.

Uses chokidar + lodash debounce. Detects change/add/unlink. Ignores dotfiles by default. Call `close()` to cleanup.

## Batch Processor (concurrency control)
See `templates/batch-processor.ts`.

Process items with bounded concurrency. Returns `{ results, errors }`. Optional `onProgress` callback.

## Retry với Backoff
See `templates/retry.ts`.

Exponential backoff: baseDelay * 2^attempt + jitter. Max 3 retries by default. Throws last error when exhausted.

## Logger (không blocking I/O)
See `templates/logger.ts`.

Async buffered writer with JSON output. Auto-flush every 5s or on buffer full (50). Handles exit and uncaughtException.
