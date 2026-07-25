const fs = require('fs');
const j = fs.readFileSync(process.env.USERPROFILE + '\\.vscode\\extensions\\pxh.pxh-virtual-office-1.0.0/media/office.js', 'utf8');

// Full parse
try {
  new Function(j);
  console.log('FULL PARSE OK');
} catch (e) {
  console.log('SYNTAX ERROR:', e.message);
  // Try to find location from the error
  // Many JS engines don't give position in new Function
  // Let's try acorn or just use Node's --check
}

// Use Node's built-in syntax checking via child process
const { execSync } = require('child_process');
try {
  execSync('node --check "' + process.env.USERPROFILE + '\\.vscode\\extensions\\pxh.pxh-virtual-office-1.0.0/media/office.js"', { encoding: 'utf8', shell: 'cmd' });
  console.log('NODE --CHECK: OK');
} catch (e) {
  console.log('NODE --CHECK ERROR:', e.stderr || e.message);
}
