const { execSync } = require('child_process');
const html = execSync('git -C D:/pxhopencode show HEAD:skills/virtual-office/extension/media/office.html', {encoding:'utf8'});
const ss = html.indexOf('<script>\n');
const se = html.lastIndexOf('</script>');
const js = html.substring(ss + '<script>\n'.length, se);

let idx = js.indexOf('function init()');
console.log('=== Found at', idx);
console.log('=== Content (hex):');
const slice = js.substring(idx, idx + 300);
for (let i = 0; i < slice.length; i++) {
  const ch = slice.charCodeAt(i);
  if (ch > 127 || ch < 32) {
    console.log('  pos', i, 'U+' + ch.toString(16).toUpperCase(), 'char:', ch >= 32 ? slice[i] : '(ctrl)');
  }
}
console.log('=== Preview:');
console.log(slice);
