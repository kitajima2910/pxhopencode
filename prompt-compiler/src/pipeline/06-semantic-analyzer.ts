import type { Constraint, StageMetric } from '../types.js';
import { DictionaryManager } from '../dictionaries/index.js';

const dict = new DictionaryManager();

export function analyzeSemantics(
  input: string,
  _lexemes: unknown[],
  constraints: Constraint[]
): { normalized: string; actions: string[]; metric: StageMetric } {
  const t0 = performance.now();
  const matches = dict.getPhraseMatcher().searchUnique(input);

  let normalized = input;
  const actions: string[] = [];
  const applied = new Set<string>();

  for (const match of matches.sort((a, b) => b.confidence - a.confidence)) {
    if (applied.has(match.output)) continue;
    applied.add(match.output);

    const mapping = inferMapping(match.output);

    if (mapping.category === 'action' || mapping.category === 'intent') {
      actions.push(match.output);
    }

    if (mapping.category === 'constraint') {
      const constraintMatch = constraints.find(c => c.toLowerCase().includes(match.output.slice(0, 10)));
      if (!constraintMatch) actions.push(match.output);
    }
  }

  const ms = performance.now() - t0;
  return {
    normalized,
    actions: [...new Set(actions)],
    metric: { name: 'SemanticAnalyzer', ms, inputLength: input.length, outputLength: actions.length },
  };
}

function inferMapping(output: string): { phrase: string; output: string; category: 'intent' | 'constraint' | 'action' } {
  const intentPhrases = [
    'analyze project', 'analyze codebase', 'read codebase', 'examine',
    'fix bug', 'debug', 'identify root cause', 'review code',
    'add feature', 'new feature', 'write tests', 'generate API',
    'implement API', 'build API', 'generate UI', 'implement UI',
    'generate game', 'implement game', 'build web app', 'build application',
    'optimize', 'refactor', 'deploy', 'publish', 'release', 'build',
    'package', 'migrate', 'upgrade', 'security audit', 'explain',
    'write documentation', 'search codebase', 'find file',
  ];

  if (intentPhrases.includes(output)) {
    return { phrase: output, output, category: 'intent' };
  }

  const constraintPhrases = [
    'preserve existing behavior', 'do not modify', 'do not touch',
    'minimal changes', 'modify only', 'avoid new dependencies',
    'use existing utilities', 'backward compatible', 'no breaking changes',
    'offline only', 'token efficient', 'keep coding style',
    'follow architecture', 'mobile first', 'cross platform',
    'modularization', 'split into modules',
  ];

  if (constraintPhrases.includes(output)) {
    return { phrase: output, output, category: 'constraint' };
  }

  return { phrase: output, output, category: 'action' };
}

export function normalizeDevPhrases(input: string): { output: string; replacements: number } {
  let output = input;
  let replacements = 0;

  const devPhrases: Array<[RegExp, string]> = [
    [/đừng phá code/gi, 'preserve existing behavior'],
    [/không (?:được )?phá (?:code|code cũ)/gi, 'preserve existing behavior'],
    [/không (?:được )?làm hỏng/gi, 'preserve existing behavior'],
    [/giữ nguyên (?:hành vi|chức năng|code|behavior)/gi, 'preserve existing behavior'],
    [/không (?:được )?(?:đụng|chạm|sửa) (?:tới|vào|đến) (?:test|code khác)/gi, 'do not touch'],
    [/chỉ (?:sửa|thay đổi) (?:trong|ở) (?:file|những)/gi, 'modify only'],
    [/thay đổi tối thiểu/gi, 'minimal changes'],
    [/tìm (?:ra )?nguyên nhân/gi, 'identify root cause'],
    [/chia nhỏ/gi, 'modularization'],
    [/đọc (?:project|source|code|mã nguồn)/gi, 'analyze codebase'],
    [/sửa (?:bug|lỗi)/gi, 'fix bug'],
    [/rà soát/gi, 'review'],
  ];

  for (const [pattern, replacement] of devPhrases) {
    const before = output;
    output = output.replace(pattern, replacement);
    if (output !== before) replacements++;
  }

  return { output, replacements };
}
