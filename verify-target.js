const fs = require('fs');
const extDir = process.env.USERPROFILE + '\\.vscode\\extensions\\pxh.pxh-virtual-office-1.0.0';

const html = fs.readFileSync(extDir + '/media/office.html', 'utf8');
console.log('=== office.html ===');
console.log('Size:', html.length);
console.log('Has inline script (no src):', /<script>(?!\s*<\/script>)/.test(html));
console.log('Has src=office.js:', html.includes('src="office.js"') || html.includes("src='office.js'"));
console.log('Has src=renderer-state.js:', html.includes('renderer-state.js'));

const js = fs.readFileSync(extDir + '/media/office.js', 'utf8');
console.log('\n=== office.js ===');
console.log('Size:', js.length);
console.log("mode vscode:", js.includes("mode:'vscode'"));
console.log('bridge:', js.includes('normalizeVSCodeEvent'));
console.log('jsMarker ALIVE:', js.includes('JS: ALIVE'));
console.log('onerror handler:', js.includes('window.onerror=function'));
console.log('dbg helpers:', js.includes('function dbg()'));
console.log('canvas guard:', js.includes('var c,ctx;'));
console.log('fake ctx:', js.includes('_fake'));
console.log('connectToRuntime stub:', js.includes('Extension -- VS Code'));
console.log('sndEl guard:', js.includes('var sndEl'));
console.log('termInput guard:', js.includes('if(!termInput)'));

// Verify provider
const prov = fs.readFileSync(extDir + '/src/officeViewProvider.js', 'utf8');
console.log('\n=== officeViewProvider.js ===');
console.log('Size:', prov.length);
console.log('Updating office.js src:', prov.includes('office.js'));
console.log('asWebviewUri:', prov.includes('asWebviewUri'));
