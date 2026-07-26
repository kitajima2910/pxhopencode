---
name: prompt-compiler
description: "Prompt Compiler — transforms natural language to optimized LLM prompts via canonical IR. Zero AI, zero cloud, zero token consumption. Use when: cần tối ưu prompt, compile prompt, phân tích intent, extract constraints."
---

# Prompt Compiler — Deterministic Prompt Engine

> Biến prompt tự nhiên thành IR canonical → sinh prompt tối ưu cho từng LLM backend.
> Chạy local, không token, không API, không AI.

## Cách dùng với pxh-pm

### Cách 1: Lệnh `/compile`

```
/compile [prompt của bạn]
```

→ Tự động chạy pipeline 14 stages → output IR + prompt optimized.

### Cách 2: Tích hợp auto-routing

pxh-pm tự động chạy Prompt Compiler **trước khi route** nếu:

```
1. Input là prompt tự nhiên (không phải /command hay @mention)
2. Compiler phát hiện intent rõ ràng (fix_bug, generate_game, ...)
3. IR có constraints (preserve_behavior, minimal_changes, ...)
```

Luồng: `User Prompt → Compiler → IR → pxh-pm analyze → Route T3`

### Cách 3: Gọi thủ công từ agent

```markdown
Load `skills/prompt-compiler/SKILL.md` → dùng Pipeline API:
- `prompt-compiler/src/pipeline/orchestrator.ts` → `new Pipeline().compile(prompt)`
- Output: `{ ir: PromptIR, prompt: string, metrics: CompilerMetrics }`
```

## Pipeline (14 stages)

| Stage | Module | Output |
|-------|--------|--------|
| Unicode Normalizer | `01-unicode-normalizer.ts` | NFC, emoji→text, whitespace |
| Tokenizer | `02-tokenizer.ts` | Tokens: word, CJK, path, code |
| Lexer | `03-lexer.ts` | Lexemes: framework, lang, intent |
| Intent Parser | `04-intent-parser.ts` | Intents: fix_bug, generate_game... |
| Constraint Extractor | `05-constraint-extractor.ts` | Constraints: preserve_behavior... |
| Semantic Analyzer | `06-semantic-analyzer.ts` | Developer slang→canonical |
| Technical Resolver | `07-technical-resolver.ts` | React→React, three.js→Three.js |
| Phrase Normalizer | `08-phrase-normalizer.ts` | đọc project→analyze project |
| Rule Engine | `09-rule-engine.ts` | Remove fillers, greetings |
| Compressor | `10-prompt-compressor.ts` | Token reduction |
| IR Builder | `11-ir-builder.ts` | Canonical Intermediate Representation |
| Backend Generator | backends/*.ts | DeepSeek/Claude/GPT/Gemini/OpenCode |

## Backends hỗ trợ (6)

| Backend | File | Output style |
|---------|------|-------------|
| `deepseek` | `backends/deepseek.ts` | Concise + constraints |
| `claude` | `backends/claude.ts` | Structured sections |
| `gpt` | `backends/gpt.ts` | Role + Objective + Constraints |
| `gemini` | `backends/gemini.ts` | Flat + direct |
| `opencode` | `backends/opencode.ts` | RULE+TARGET format |
| `codex` | `backends/codex.ts` | Commented code |

## IR Schema (PromptIR)

```typescript
interface PromptIR {
  version: string;
  raw: string;                           // Input gốc
  normalized: string;                    // Sau normalization
  intents: Intent[];                     // fix_bug, generate_game...
  constraints: Constraint[];             // preserve_behavior, minimal_changes...
  target: { frameworks, languages, platforms, libraries };
  files: { path, action }[];             // File refs
  actions: string[];                     // Normalized action phrases
  priority: 'critical' | 'high' | 'medium' | 'low';
  safety: { preserveBehavior, noBreakingChanges, ... };
  outputStyle: 'concise' | 'detailed' | 'standard';
  optimizationLevel: 0 | 1 | 2;
  context: { projectType?, workspaceRoot?, branch? };
}
```

## Ví dụ

### Input: "sửa bug trong component login với React TypeScript, đừng phá code cũ"

→ IR output:
```json
{
  "intents": ["fix_bug"],
  "constraints": ["preserve_behavior", "minimal_changes"],
  "target": { "frameworks": ["React"], "languages": ["TypeScript"] },
  "priority": "critical",
  "safety": { "preserveBehavior": true, "noBreakingChanges": false }
}
```

### Input: "Làm game platformer 2D với Phaser 3"

→ IR output:
```json
{
  "intents": ["generate_game"],
  "target": { "frameworks": ["Phaser"] },
  "context": { "projectType": "game" }
}
```

## Verification
- [ ] Pipeline chạy < 50ms cho medium prompt
- [ ] Intent detected correctly for target language
- [ ] Constraints extracted from implicit phrases (đừng phá code → preserve_behavior)
- [ ] Technical terms normalized (three.js, react native, typescript)
- [ ] Fillers removed (hãy, giúp tôi, please)
- [ ] Prompt có compression ratio > 1.5x cho verbose input
