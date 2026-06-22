---
name: ais-prompts
description: Prompt engineering production — template system, versioning, A/B test, injection defense, cost-aware prompting.
---

# ais-prompts — Prompt Engineering

## Files

| File | Mục đích |
|------|----------|
| `templates/prompt-registry.py` | `PromptVersion` + `PromptRegistry` — versioned templates, `format()` with kwargs |
| `templates/injection-defense.py` | `detect_injection()` (6 regex patterns) + `sanitize_user_input()` |
| `templates/ab-test.py` | `ab_test_prompt()` — random variant selection, `log_result()` for analysis |
| `templates/cost-aware.py` | `estimate_tokens()` (rough 4 chars/token) + `optimize_prompt()` truncation |

## Usage

```python
from templates.prompt_registry import PromptRegistry
registry = PromptRegistry()
registry.register("qa", system, template)
messages = registry.format("qa", question="...")
```

**Security:** Always sanitize user input with `sanitize_user_input()` before passing to prompt templates. Check injection patterns on every user message.
