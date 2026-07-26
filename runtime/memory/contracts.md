# Memory Engine Contracts

## MemoryQuery (T2 → Memory Engine)

```json
{
  "version": "1.0",
  "type": "memory_query",
  "intent": "bug_fix|architecture|new_feature|refactor|review|test|deploy",
  "target": "module|file|feature",
  "categories": ["bugs", "architecture", "patterns"],
  "max_results": 5,
  "min_confidence": 60
}
```

## MemoryResult (Memory Engine → T2)

```json
{
  "version": "1.0",
  "status": "success|empty|error",
  "results": [
    {
      "category": "bugs",
      "confidence": 85,
      "content": {},
      "matched": "intent_match"
    }
  ],
  "timestamp": "2026-07-26T09:27:00Z"
}
```

## MemoryUpdate (T3/T4 → Memory Engine)

```json
{
  "version": "1.0",
  "type": "memory_update",
  "category": "bugs|patterns|decisions|snapshots|preferences|workflow",
  "action": "upsert|merge|invalidate",
  "data": {},
  "confidence": 85,
  "source": "task_reflection"
}
```

## Reflection (T3 → Memory Engine)

```json
{
  "version": "1.0",
  "type": "reflection",
  "task_id": "uuid",
  "learned": ["was_wurde_gelernt"],
  "architecture_changed": false,
  "bug_fixed": false,
  "new_pattern": false,
  "preferences_changed": false,
  "workflow_improved": false,
  "confidence_delta": 5
}
```

## SessionStart (Runtime → Memory Engine)

```json
{
  "version": "1.0",
  "type": "session_start",
  "project_root": "/path/to/project",
  "git_branch": "main",
  "agent": "pxh-pm"
}
```
