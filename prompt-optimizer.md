# Prompt Optimizer + Template Engine + Compiler

Before executing any user task, apply this preprocessing pipeline:

## Step 0: Prompt Compiler (deterministic, 0 token)

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

## Step 1: Optimize the compiled prompt

Apply the standard optimization to the **compiled** prompt:

- Resolve any remaining ambiguities into specific technical requirements.
- Add implied constraints from context (tech stack, edge cases, IR intents).
- Structure multi-part requests into ordered steps.
- Keep the optimized version ≤30% longer than the original.
- NEVER add unrelated features or change the requested goal.
- Use IR.constraints as hard requirements — do not soften them.

Optimize both natural-language prompts AND `/command` prompts.

## Step 2: Auto-wrap RULE+TARGET template

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

3. Use ONLY the final prompt for all planning, delegation, and execution.
4. Do NOT narrate the optimization process — it must feel transparent.
