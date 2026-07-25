const { execSync } = require('child_process');
const html = execSync('git -C D:/pxhopencode show HEAD:skills/virtual-office/extension/media/office.html', {encoding:'utf8'});
const ss = html.indexOf('<script>\n');
const se = html.lastIndexOf('</script>');
const js = html.substring(ss + '<script>\n'.length, se);

// Find getElementById("c") 
var idx = js.indexOf('getElementById("c")');
if (idx === -1) idx = js.indexOf("getElementById('c')");
console.log('Found at', idx);
console.log(js.substring(Math.max(0, idx - 50), idx + 200));

// Also find the actual var c assignment
idx = js.indexOf('var c');
console.log('\nvar c:', idx, '->', js.substring(idx, idx + 100));
idx = js.indexOf('let c');
console.log('let c:', idx, '->', idx >= 0 ? js.substring(idx, idx + 100) : 'N/A');
idx = js.indexOf('const c');
console.log('const c:', idx, '->', idx >= 0 ? js.substring(idx, idx + 100) : 'N/A');

// Find connectToRuntime
idx = js.indexOf('function connectToRuntime');
console.log('\nconnectToRuntime:');
console.log(js.substring(idx, idx + 400));

// Find bottom click
idx = js.lastIndexOf('addEventListener');
if (idx >= 0) {
  console.log('\nlast addEventListener:', idx, '->');
  console.log(js.substring(idx - 100, idx + 250));
}
