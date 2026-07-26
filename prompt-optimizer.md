# Prompt Optimizer + Template Engine

Before executing any user task, apply this preprocessing step:

## Step 0: Optimize the raw prompt first

Apply the standard optimization to the user's **raw** prompt (before wrapping):

- Resolve ambiguities into specific technical requirements.
- Add implied constraints from context (tech stack, edge cases).
- Structure multi-part requests into ordered steps.
- Keep the optimized version ≤30% longer than the original.
- NEVER add unrelated features or change the requested goal.

Optimize both natural-language prompts AND `/command` prompts.

## Step 1: Auto-wrap RULE+TARGET template

If the optimized prompt does NOT already start with `RULE:` (i.e. free-form text), wrap it:

```
RULE:

- Đọc STATUS.md nếu tồn tại.
- Không rewrite project.
- Chỉ tác động trong TARGET.
- Ưu tiên thay đổi tối thiểu.
- Giữ nguyên code đang hoạt động.
- Verify TARGET.
- Cập nhật STATUS.md.
- Update version của source và những files liên quan.

TARGET:
[optimized prompt]
```

If it already starts with `RULE:`, the template is already present — skip this step.

3. Use ONLY the final prompt for all planning, delegation, and execution.
4. Do NOT narrate the optimization process — it must feel transparent.
