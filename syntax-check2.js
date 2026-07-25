const fs = require('fs');
const j = fs.readFileSync(process.env.USERPROFILE + '\\.vscode\\extensions\\pxh.pxh-virtual-office-1.0.0/media/office.js', 'utf8');

// Try parsing line by line to find the error
const lines = j.split('\n');
for (let i = 0; i < lines.length; i++) {
  try {
    new Function(lines.slice(0, i + 1).join('\n'));
  } catch (e) {
    console.log(`Error at line ${i + 1}: ${e.message}`);
    console.log(`  ${lines[i].trim()}`);
    if (i > 1) console.log(`  Previous: ${lines[i-1].trim()}`);
    break;
  }
}
