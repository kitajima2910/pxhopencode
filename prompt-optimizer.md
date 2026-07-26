# Prompt Optimizer + Template Engine + Compiler

> **BẮT BUỘC:** Trước khi xử lý user task, chạy các bước dưới đây theo đúng thứ tự.

## Step 0: Memory Init — Deterministic (0 token)

Kiểm tra và khởi tạo Vibe Coding Memory. Chạy NGAY ở prompt đầu tiên của session:

```
1. Detect mode:
   - Có file `.opencode/opencode.json` trong CWD? → embedded
   - Không? → standalone
2. Xác định memory_root:
   - Standalone: {CWD}/.memory/
   - Embedded:   {CWD}/.opencode/.memory/
3. Nếu chưa có file {memory_root}/index.json → chạy:
   Standalone: powershell.exe -ExecutionPolicy Bypass -File "_shared/scripts/init-memory.ps1"
   Embedded:   powershell.exe -ExecutionPolicy Bypass -File ".opencode/_shared/scripts/init-memory.ps1"
4. Verify:
   - [ ] .memory/ tồn tại ở đúng path
   - [ ] .memory/ có ≥ 13 file *.json
   - [ ] .gitignore tồn tại cùng cấp với .opencode/ (nếu embedded)
   - [ ] .opencode/.git đã bị xoá (nếu embedded)
5. Inject compact memory string vào context.
```

**Script tự động:** tạo 13 file JSON, cập nhật `.gitignore`, xoá `.opencode/.git` (nếu embedded).

**Red flag:** Bỏ qua Step 0 = violation. Không được xử lý user prompt nếu chưa verify.

## Step 1: Prompt Compiler (deterministic, 0 token)

Run the prompt through the compiler BEFORE any AI optimization:

```
1. Load skill `prompt-compiler` → Pipeline API
2. `new Pipeline({ backend: 'opencode' }).compile(input)`
3. Output IR: { intents, constraints, target, actions, priority, safety }
4. Output compiled: compressed, normalized, filler-free prompt
```

**What the compiler does:**
- Normalize Unicode, emoji→text
- Remove filler words (hãy, giúp tôi, please, vui lòng)
- Detect intent (fix_bug, generate_game, security_audit...)
- Extract constraints (preserve_behavior, minimal_changes...)
- Resolve technical terms (three.js, react native, typescript)
- Normalize developer slang (đừng phá code→preserve existing behavior)
- Token reduction without losing semantics

**IR is injected into the TARGET context.**

## Step 2: Optimize the compiled prompt

Apply the standard optimization to the **compiled** prompt:

- Resolve any remaining ambiguities into specific technical requirements.
- Add implied constraints from context (tech stack, edge cases, IR intents).
- Structure multi-part requests into ordered steps.
- Keep the optimized version ≤30% longer than the original.
- NEVER add unrelated features or change the requested goal.
- Use IR.constraints as hard requirements — do not soften them.

Optimize both natural-language prompts AND `/command` prompts.

## Step 3: Auto-wrap RULE+TARGET template

If the optimized prompt does NOT already start with `RULE:` (i.e. free-form text), wrap it:

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

If it already starts with `RULE:`, the template is already present — skip this step.

4. Use ONLY the final prompt for all planning, delegation, and execution.
5. Do NOT narrate the optimization process — it must feel transparent.
