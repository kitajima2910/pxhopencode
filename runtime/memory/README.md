# Vibe Coding Memory Engine — DETERMINISTIC

> ***BẮT BUỘC. Đọc và thực thi ngay đầu session. Bỏ qua = violation.***

## STARTUP PIPELINE (execute in order)

```
Step 1: workspace_root = dir containing .opencode/
Step 2: Check {workspace_root}/.memory/
  EXISTS → read index.json → check memory_count + confidence
  MISSING → init from runtime/memory/init.json → write all files → log
Step 3: Parse user prompt intent (regex match bảng bên dưới)
Step 4: Lookup intent→categories (bảng bên dưới) → max 3 categories
Step 5: Read selected .memory/ files → produce compact injection (định dạng bên dưới)
Step 6: Inject compact string vào context → thực thi task
Step 7: SAU task → reflection → ghi .memory/ (xem ## MEMORY REFLECTION trong agent file)
```

## INTENT → CATEGORIES MAP

| Intent | Load .memory/ |
|--------|---------------|
| fix_bug, debug, find_root_cause | bugs.json + patterns.json |
| generate_feature, generate_game, generate_api, generate_ui | patterns.json + decisions.json + project.json |
| architecture_design | architecture.json + decisions.json + project.json |
| write_tests | bugs.json + patterns.json |
| review_code, security_audit | patterns.json + decisions.json |
| performance_optimization | patterns.json + bugs.json |
| deployment, release, packaging | project.json + decisions.json |
| explain, read_codebase, search, analyze_project | index.json + project.json |
| unknown (no match) | index.json + project.json (minimal) |

## COMPACT INJECTION FORMAT

1 dòng/category, tối đa 3 categories. Skip category nếu confidence < 60 hoặc data rỗng.
📦 `MEMORY [{cat}] {key}={val} {key}={val}`

```
📦 MEMORY [project] lang=TS fw=opencode tools=npm,powershell | [patterns] naming=snake_case err=2 | [bugs] count=0
📦 MEMORY empty   ← khi memory_count = 0
```

## ANTI-RATIONALIZATION

| Excuse | Reality |
|--------|---------|
| "Memory empty, không cần inject" | Vẫn inject "empty" → agent biết không có memory |
| "Load hết categories cho chắc" | Token waste, tràn context |
| "Inject verbose cho rõ" | 1 dòng/category. Dài hơn = mất focus |
| "Không cần parse intent, biết ngay" | Intent sai → load sai memory → context sai |
| "Skip reflection, task nhỏ mà" | Không ghi → session sau mất context |

## RED FLAGS

- memory_count = 0 nhưng không inject "📦 MEMORY empty"
- Load > 3 categories
- Inject > 1 dòng/category
- Confidence < 60 nhưng vẫn inject
- Quên Step 7 (reflection) sau task

## VERIFICATION

- [ ] Intent matched ≥ 1 category (fallback: unknown)
- [ ] Injected ≤ 3 categories, ≤ 1 dòng/category
- [ ] Confidence filter applied (skip < 60)
- [ ] .memory/ updated sau task
