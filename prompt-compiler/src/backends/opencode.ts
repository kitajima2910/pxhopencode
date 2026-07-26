import { BaseGenerator } from './base.js';
import type { PromptIR } from '../types.js';

export class OpenCodeGenerator extends BaseGenerator {
  name = 'opencode' as const;

  generate(ir: PromptIR): string {
    const lines: string[] = [];

    if (ir.constraints.includes('minimal_changes') || ir.safety.preserveBehavior) {
      lines.push('RULE:');
      lines.push('- Đọc STATUS.md nếu tồn tại.');
      lines.push('- Không rewrite project.');
      if (ir.safety.preserveBehavior) lines.push('- Giữ nguyên code đang hoạt động.');
      if (ir.constraints.includes('minimal_changes')) lines.push('- Ưu tiên thay đổi tối thiểu.');
      if (ir.constraints.includes('only_requested_files')) lines.push('- Chỉ tác động trong TARGET.');
      lines.push('');
    }

    const intentStr = this.formatIntents(ir);
    if (intentStr && intentStr !== 'unknown') {
      lines.push(`TARGET:\n${intentStr}`);
    }

    const context = this.buildContext(ir);
    if (context.length > 0) {
      lines.push('');
      for (const c of context) lines.push(c);
    }

    if (ir.constraints.length > 0) {
      lines.push('');
      for (const c of ir.constraints) lines.push(`- ${c.replace(/_/g, ' ')}`);
    }

    return lines.join('\n').trim();
  }
}
