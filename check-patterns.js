const { execSync } = require('child_process');
const html = execSync('git -C D:/pxhopencode show HEAD:skills/virtual-office/extension/media/office.html', {encoding:'utf8'});
const ss = html.indexOf('<script>\n');
const se = html.lastIndexOf('</script>');
const js = html.substring(ss + '<script>\n'.length, se);

// Find patterns near the code we want to change
var idx;

console.log('=== Canvas init area ===');
idx = js.indexOf('document.getElementById("c")');
console.log(js.substring(idx, idx + 200));

console.log('\n=== sndToggle area ===');
idx = js.indexOf('sndToggle');
console.log(js.substring(idx, idx + 100));

console.log('\n=== termInput keydown area ===');
idx = js.indexOf('termInput.addEventListener');
console.log(js.substring(idx, idx + 300));

console.log('\n=== c.addEventListener click area ===');
idx = js.indexOf('Click on PXHOpenCode');
console.log(js.substring(idx, idx + 300));

console.log('\n=== init() area ===');
idx = js.indexOf('function init()');
console.log(js.substring(idx, idx + 200));

console.log('\n=== bottom click area ===');
idx = js.lastIndexOf('addEventListener("click"');
console.log(js.substring(idx, idx + 300));
