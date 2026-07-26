# Vibe Coding Memory Engine

> ***QUAN TRỌNG: Đây là instruction bắt buộc. Đọc và thực thi ngay đầu mỗi session.***

## STARTUP BẮT BUỘC — Thực thi ngay khi session bắt đầu

```yaml
Bước 0: Load skills/vibe-memory/SKILL.md để có API reference
Bước 1: Xác định workspace_root
  - workspace_root = thư mục chứa .opencode/
  - Nếu không tìm thấy .opencode/ → dùng thư mục hiện tại

Bước 2: Kiểm tra {workspace_root}/.memory/
  - Nếu TỒN TẠI → đọc .memory/index.json, load index
  - Nếu KHÔNG TỒN TẠI → TẠO NGAY:
    a. Đọc runtime/memory/init.json (seed template)
    b. Tạo .memory/ tại workspace_root
    c. Điền project_id, project_name, timestamps
    d. Ghi index.json → ghi các file còn lại
    e. Log: "Memory initialized at {workspace_root}/.memory/"

Bước 3: Xác định task intent từ prompt user

Bước 4: Semantic search trong .memory/
  - Nếu task liên quan bug → load bugs.json
  - Nếu task liên quan architecture → load architecture.json
  - Nếu task feature mới → load patterns.json + decisions.json
  - Chỉ load Top-K (tối đa 3 categories), không load tất cả

Bước 5: Inject context compact → thực thi task

Bước 6: SAU KHI task hoàn tất → chạy reflection:
  - Học được gì? → update patterns / preferences
  - Có bug mới? → ghi bugs.json
  - Có decision mới? → ghi decisions.json
  - Architecture thay đổi? → update architecture.json
  - Snapshot context hiện tại → snapshots.json
```

## File storage

| File | Mục đích |
|------|----------|
| `.memory/index.json` | Index nhẹ, load đầu tiên |
| `.memory/project.json` | Framework, language, runtime, tools |
| `.memory/architecture.json` | Modules, services, dependencies, flows |
| `.memory/patterns.json` | Coding conventions, recurring patterns |
| `.memory/bugs.json` | Bug đã fix + root cause + solution |
| `.memory/decisions.json` | Architectural decisions + rationale |
| `.memory/preferences.json` | User coding habits (language, style) |
| `.memory/workflow.json` | Recurring workflows |
| `.memory/prompt.json` | Repeated instructions, optimized templates |
| `.memory/vibe.json` | Coding philosophy, inferred style |
| `.memory/snapshots.json` | Context snapshots after completed tasks |
| `.memory/timeline.json` | Chronological history |
| `.memory/stats.json` | Usage statistics |

## Contracts (5)

```json
MemoryQuery   {version, type:"memory_query", intent, target, categories, max_results, min_confidence}
MemoryResult  {version, status:"success|empty|error", results[{category, confidence, content}], timestamp}
MemoryUpdate  {version, type:"memory_update", category, action:"upsert|merge|invalidate", data, confidence, source}
Reflection    {version, type:"reflection", task_id, learned[], architecture_changed, bug_fixed, ...}
SessionStart  {version, type:"session_start", project_root, git_branch, agent}
```

Đã merge từ `runtime/memory/contracts.md` — file cũ đã xóa.

## Performance rules

- Memory lookup < 100ms
- Incremental save — never rewrite entire file
- Confidence filter: chỉ inject memory có confidence >= 60
- Snapshot < 500 bytes mỗi entry
- KHÔNG lưu chat history, password, secrets, API keys
