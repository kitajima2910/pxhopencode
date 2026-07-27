## HARD GATE — MEMORY INIT (execute now, do not skip)

**First action every session.** Stop. Read nothing below until done.

```
GATE: Memory Init
1. Mode: có .opencode/opencode.json? → embedded | không → standalone
2. memory_root = standalone: {CWD}/.memory/ | embedded: {CWD}/.opencode/.memory/
3. Check {memory_root}/index.json exists
   NO  → run: powershell -File "_shared/scripts/init-memory.ps1" (hoặc .opencode/_shared/...)
   YES → read index.json → note memory_count + confidence
4. Parse user intent → lookup intent→categories (tối đa 3)
5. Read selected .memory/ files → inject 1-line compact string
6. Output "[MEMORY_INIT_DONE]" — only then process user prompt
```

**Skip gate = violation. Stop. Chạy lại từ đầu.**

## Step 1: Prompt Compiler (deterministic, 0 token)

```
Pipeline:
1. Load skill `prompt-compiler` → Pipeline API
2. `new Pipeline({ backend: 'opencode' }).compile(input)`
3. Output IR + compressed prompt
```

## Step 2: Optimize compiled prompt

- Resolve ambiguities → technical requirements
- Add implied constraints from IR
- Multi-part → ordered steps
- ≤30% longer than original
- IR.constraints = hard requirements

## Step 3: Auto-wrap RULE+TARGET

Nếu prompt chưa bắt đầu bằng `RULE:`, wrap:

```
RULE:

- Read STATUS.md if it exists.
- Do not rewrite the project.
- Only modify files within the TARGET.
- Prefer the smallest possible changes.
- Preserve all existing working code.
- Verify the TARGET after making changes.
- Update STATUS.md with the completed work.

TARGET:
[compiled + optimized prompt]

IR Context:
- Intents: [from compiler]
- Constraints: [from compiler]
- Priority: [from compiler]
- Safety: [from compiler]
```

If already starts with `RULE:` → skip. Use ONLY final prompt.

## Step 4: Log final prompt for review

Ghi final prompt vào `__prompt-log__.md` (overwrite, luôn là prompt cuối cùng).
Định dạng:

```
## Prompt Log — {YYYY-MM-DD HH:mm}

RULE:
... (nếu có)
TARGET:
... (prompt gốc)
IR:
  Intents: ...
  Constraints: ...
  Priority: ...
  Safety: ...

────────────────────────────────────────
```

File này ở workspace root, git-ignored. Mục đích: user review prompt optimizer đã wrap cái gì trước khi gửi xuống agent.