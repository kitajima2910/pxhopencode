---
name: ais-agents
description: AI Agent framework — tool registry, multi-step reasoning, memory, rate control. Không infinite loop, tự động timeout.
---

# ais-agents — AI Agents

## Files

| File | Mục đích |
|------|----------|
| `templates/tool-registry.py` | `Tool` + `ToolRegistry` — type-safe tool registration, OpenAI schema |
| `templates/agent.py` | `Agent` — ReAct loop with timeout (30s) and max steps (15), tool execution |
| `templates/agent-memory.py` | `AgentMemory` — deque short-term + dict long-term, `summarize()` for context |

## Usage

```python
from templates.tool-registry import Tool, ToolRegistry
from templates.agent import Agent

registry = ToolRegistry()
registry.register(Tool(name="search", ...))
agent = Agent(registry)
result = await agent.run("find docs about X")
```

**Security:**
- Tool results are truncated to 2000 chars to prevent token explosion
- Agent timeout prevents runaway loops
- Validate all tool arguments before execution
