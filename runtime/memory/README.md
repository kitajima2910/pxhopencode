# Vibe Coding Memory Engine — DETERMINISTIC

> ***BẮT BUỘC. Đọc và thực thi ngay đầu session. Bỏ qua = violation.***

## STARTUP PIPELINE (execute in order — DO NOT SKIP)

> ⚠️ **pxh-pm chạy bước này tự động đầu mỗi session.**
> Nếu bạn là agent khác và thấy `.memory/` chưa có → chạy ngay lệnh bên dưới.

```
Step 1: workspace_root = dir containing .opencode/ (hoặc CWD nếu standalone)
Step 2: Check {workspace_root}/.memory/
  EXISTS → read index.json → check memory_count + confidence
  MISSING → chạy lệnh dưới đây (luôn chạy được — script tự detect mode)
Step 3: Parse user prompt intent (dùng Prompt Compiler → IR → intent map bên dưới)
Step 4: Lookup intent→categories (bảng bên dưới) → max 3 categories
Step 5: Read selected .memory/ files → produce compact injection (định dạng bên dưới)
Step 6: Inject compact string vào context → thực thi task
Step 7: SAU task → reflection → ghi .memory/ (xem ## MEMORY REFLECTION trong agent file)
```

### LỆNH AUTO-INIT (copy-paste — chạy 1 lần)

Chỉ 1 lệnh duy nhất — script tự detect mode dựa trên vị trí của nó:

```powershell
powershell.exe -ExecutionPolicy Bypass -File "_shared/scripts/init-memory.ps1"
```

**Không cần đổi path.** Script ở `_shared/scripts/init-memory.ps1` tự động:
- Tìm `runtime/memory/init.json` dựa trên vị trí của script
- Đọc template → tạo 13 file JSON trong `.memory/` ở workspace root
- Detect project type từ `package.json` / `Cargo.toml` / `pyproject.toml`
- Điền `project_id`, `project_name`, `framework`, `language`, `runtime`, `folder_structure`, `build_tools`
- Kiểm tra `.gitignore` ở workspace root — nếu chưa có `.opencode/` entry → thêm vào
- Idempotent: chạy lại không sao

> Embedded mode: script path `.opencode/_shared/scripts/init-memory.ps1` cũng dùng chung lệnh trên khi CWD là workspace root (= thư mục chứa `.opencode/`).

### Nếu script lỗi (fallback)

Init thủ công từng file theo `init.json`:
- Standalone: `{workspace_root}/runtime/memory/init.json`
- Embedded: `{workspace_root}/.opencode/runtime/memory/init.json`

Copy từng file object trong `init.json.files` vào `.memory/` tương ứng.

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
`MEMORY [{cat}] {key}={val} {key}={val}`

```
MEMORY [project] lang=TS fw=opencode tools=npm,powershell | [patterns] naming=snake_case err=2 | [bugs] count=0
MEMORY empty   ← khi memory_count = 0
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

- memory_count = 0 nhưng không inject "MEMORY empty"
- Load > 3 categories
- Inject > 1 dòng/category
- Confidence < 60 nhưng vẫn inject
- Quên Step 7 (reflection) sau task

## VERIFICATION

- [ ] Intent matched ≥ 1 category (fallback: unknown)
- [ ] Injected ≤ 3 categories, ≤ 1 dòng/category
- [ ] Confidence filter applied (skip < 60)
- [ ] .memory/ updated sau task
