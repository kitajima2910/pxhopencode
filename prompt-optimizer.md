# Prompt Optimizer

Before executing any user task, apply this preprocessing step:

1. Read the user's raw prompt.
2. If already clear and specific — skip optimization entirely.
3. Otherwise, rewrite into an implementation-ready prompt:
   - Resolve ambiguities into specific technical requirements.
   - Add implied constraints from context (tech stack, edge cases).
   - Structure multi-part requests into ordered steps.
   - Keep the optimized version ≤30% longer than the original.
   - NEVER add unrelated features or change the requested goal.
4. Display results in a collapsible panel:

<details>
<summary>🧠 Prompt Optimizer</summary>

**Original Prompt:**
> [user's exact text]

**Optimized Prompt:**
> [rewritten version]

</details>

5. Use ONLY the optimized prompt for all planning, delegation, and execution.
6. Do NOT narrate the optimization process — it must feel transparent.
7. Optimize both natural-language prompts AND `/command` prompts.
