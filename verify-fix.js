const fs = require('fs');
const extDir = process.env.USERPROFILE + '\\.vscode\\extensions\\pxh.pxh-virtual-office-1.0.0';

// Check office.html
const html = fs.readFileSync(extDir + '/media/office.html', 'utf8');
console.log('=== office.html ===');
console.log('Has CSP meta:', html.includes('Content-Security-Policy'));
console.log('Has nonce placeholder:', html.includes('NONCE'));
console.log('Has RENDERER_STATE placeholder:', html.includes('RENDERER_STATE'));
console.log('Has OFFICE_JS placeholder:', html.includes('OFFICE_JS'));
console.log('Has inline script (no src):', /<script\b(?!\s*src)/i.test(html));
console.log('Has external script src:', html.includes('<script src'));

// Check provider
const prov = fs.readFileSync(extDir + '/src/officeViewProvider.js', 'utf8');
console.log('\n=== officeViewProvider.js ===');
console.log('Has crypto require:', prov.includes('require("crypto")') || prov.includes("require('crypto')"));
console.log('Has nonce generation:', prov.includes('crypto.randomBytes'));
console.log('Has fs.readFileSync renderer-state:', prov.includes('renderer-state.js'));
console.log('Has fs.readFileSync office.js:', prov.includes('office.js'));
console.log('Has NONCE replace:', prov.includes('/NONCE/g'));
