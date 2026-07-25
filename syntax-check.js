const fs = require('fs');
const path = require('path');

const ext = process.env.USERPROFILE + '\\.vscode\\extensions\\pxh.pxh-virtual-office-1.0.0';
const j = fs.readFileSync(path.join(ext, 'media', 'office.js'), 'utf8');

// Try to parse as JavaScript to detect syntax errors
try {
  // Wrap in an async function since we don't care about top-level await
  new Function(j);
  console.log('PARSES OK');
} catch (e) {
  console.log('SYNTAX ERROR:', e.message);
  console.log('At line approx:', e.stack?.split('\n')[1] || 'unknown');
  
  // Extract context around error
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const lines = j.substring(0, pos).split('\n');
    const lineNum = lines.length;
    const lineStart = Math.max(0, pos - 100);
    const lineEnd = Math.min(j.length, pos + 100);
    console.log(`Around position ${pos} (line ~${lineNum}):`);
    console.log(j.substring(lineStart, lineEnd));
  }
}

// Count all brace types
const curly = { o: (j.match(/\{/g) || []).length, c: (j.match(/\}/g) || []).length };
const paren = { o: (j.match(/\(/g) || []).length, c: (j.match(/\)/g) || []).length };
const bracket = { o: (j.match(/\[/g) || []).length, c: (j.match(/\]/g) || []).length };
console.log(`Curly braces: {={${curly.o} }=${curly.c} (${curly.o - curly.c})`);
console.log(`Parentheses: (=${paren.o} )=${paren.c} (${paren.o - paren.c})`);
console.log(`Brackets: [=${bracket.o} ]=${bracket.c} (${bracket.o - bracket.c})`);
