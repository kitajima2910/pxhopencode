const { execSync } = require('child_process');
// Check VS Code version to understand CSP behavior
const pkg = JSON.parse(require('fs').readFileSync('D:/pxhopencode/skills/virtual-office/extension/package.json','utf8'));
console.log('VS Code engine:', pkg.engines?.['vscode'] || 'unknown');

// Check office.html for any CSP meta tag
const html = require('fs').readFileSync('D:/pxhopencode/skills/virtual-office/extension/media/office.html','utf8');
console.log('Has CSP meta tag:', html.includes('Content-Security-Policy'));
console.log('Has nonce on script:', html.includes('nonce'));
console.log('Script tags:', html.match(/<script\b[^>]*>/g));
