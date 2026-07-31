import { BaseGenerator } from './base.js';
export class OpenCodeGenerator extends BaseGenerator {
    name = 'opencode';
    generate(ir) {
        const lines = [
            'RULE:',
            '- Read STATUS.md if it exists.',
            '- Do not rewrite the project.',
            '- Only modify files within the TARGET.',
            '- Prefer the smallest safe changes.',
            '- Preserve existing working behavior.',
            '- Verify the TARGET after making changes.',
            '- Update STATUS.md with the completed work.',
        ];
        if (ir.safety.preserveBehavior)
            lines.push('- Giữ nguyên code đang hoạt động.');
        if (ir.constraints.includes('minimal_changes'))
            lines.push('- Ưu tiên thay đổi tối thiểu.');
        lines.push('', `TARGET:\n${ir.normalized || ir.raw}`);
        const intentStr = this.formatIntents(ir);
        const irContext = [];
        if (intentStr && intentStr !== 'unknown')
            irContext.push(`- Intents: ${intentStr}`);
        if (ir.target.frameworks.length > 0)
            irContext.push(`- Frameworks: ${ir.target.frameworks.join(', ')}`);
        if (ir.target.languages.length > 0)
            irContext.push(`- Languages: ${ir.target.languages.join(', ')}`);
        if (irContext.length > 0)
            lines.push('', 'IR Context:', ...irContext);
        const context = this.buildContext(ir);
        if (context.length > 0) {
            if (irContext.length === 0)
                lines.push('', 'IR Context:');
            for (const c of context)
                lines.push(c);
        }
        if (ir.constraints.length > 0) {
            lines.push('');
            for (const c of ir.constraints)
                lines.push(`- ${c.replace(/_/g, ' ')}`);
        }
        return lines.join('\n').trim();
    }
}
//# sourceMappingURL=opencode.js.map