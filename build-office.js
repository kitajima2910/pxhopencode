const fs = require('fs');
const { execSync } = require('child_process');

const html = execSync('git -C D:/pxhopencode show HEAD:skills/virtual-office/extension/media/office.html', {encoding:'utf8'});

const scriptStart = html.indexOf('<script>\n');
const scriptEnd = html.lastIndexOf('</script>');
let jsContent = html.substring(scriptStart + '<script>\n'.length, scriptEnd);

console.log('Extracted JS:', jsContent.length, 'bytes');

const E = {
  bldg: '\u{1F3E2}',
  robot: '\u{1F916}',
  skull: '\u2620',
  zap: '\u26A1',
  brief: '\u{1F464}',
};

// ======================== FIXES ========================

// 1. Remove window.onerror suppressor -> add error handler + debug helpers
jsContent = jsContent.replace(
  'window.onerror=function(){return false}',
  [
    'window.onerror=function(m,f,l){',
    '  try{',
    '    console.error("' + E.skull + '\uFE0F",m,f+":"+l);',
    '    const d=document.getElementById("dbgOverlay");',
    '    if(d)d.textContent+="\\nERR: "+m',
    '  }catch(e){}',
    '}',
    'var dbgEl,dbgOn=false;',
    'function dbg(){dbgOn=true;dbgEl=document.getElementById("dbgOverlay");if(dbgEl){dbgEl.style.display="block"}}',
    'function dbgLog(){if(!dbgOn||!dbgEl)return;dbgEl.textContent=Array.prototype.join.call(arguments," ")+"\\n"+dbgEl.textContent}',
    'console.log=dbgLog;console.error=dbgLog;dbg()',
  ].join('\n')
);

// 2. Guard sndToggle (single quotes)
jsContent = jsContent.replace(
  "document.getElementById('sndToggle').addEventListener('click',toggleSound)",
  "var sndEl=document.getElementById('sndToggle');if(sndEl)sndEl.addEventListener('click',toggleSound)"
);

// 3. Guard termInput focus/blur (single quotes)
jsContent = jsContent.replace(
  "function focusTerminal(){pxhTerm.focused=true;termInput.focus()}\nfunction blurTerminal(){pxhTerm.focused=false;termInput.blur()}",
  "function focusTerminal(){if(termInput){pxhTerm.focused=true;termInput.focus()}}\nfunction blurTerminal(){if(termInput){pxhTerm.focused=false;termInput.blur()}}"
);

// 4. Guard termInput event listeners (single quotes)
jsContent = jsContent.replace(
  "termInput.addEventListener('focus',()=>{pxhTerm.focused=true})\ntermInput.addEventListener('blur',()=>{pxhTerm.focused=false})\ntermInput.addEventListener('keydown',function(e){",
  "if(!termInput){console.log('termInput MISSING')}\nif(termInput){termInput.addEventListener('focus',()=>{pxhTerm.focused=true})}\nif(termInput){termInput.addEventListener('blur',()=>{pxhTerm.focused=false})}\nif(termInput){termInput.addEventListener('keydown',function(e){"
);

// 5. Guard termInput.blur() in Escape (single quotes)
jsContent = jsContent.replace(
  "}else if(e.key==='Escape'){\n    termInput.blur()",
  "}else if(e.key==='Escape'){\n    if(termInput)termInput.blur()"
);

// 6. Close if(termInput) for keydown
jsContent = jsContent.replace(
  "  }\n})\n\nfunction executePXHCommand",
  "  }\n})}\n\nfunction executePXHCommand"
);

// 7. Guard c.addEventListener click top (single quotes)
jsContent = jsContent.replace(
  "// Click on PXHOpenCode terminal area -> focus terminal input\nc.addEventListener('click',function(e){",
  "// Click on PXHOpenCode terminal area -> focus terminal input\nif(c)c.addEventListener('click',function(e){"
);

// 8. Close if(c) for top click handler (single quotes)
jsContent = jsContent.replace(
  "  if(pxhTerm.focused)blurTerminal()\n})\n\n// ============================================================",
  "  if(pxhTerm.focused)blurTerminal()\n})}\n\n// ============================================================"
);

// 9. Hardened canvas init (single quotes)
jsContent = jsContent.replace(
  "const c=document.getElementById('c'),ctx=c.getContext('2d')\nfunction resize(){const w=document.getElementById('canvasWrap');const dpr=window.devicePixelRatio||1;c.width=w.clientWidth*dpr;c.height=w.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);W=w.clientWidth;H=w.clientHeight;calcLayout()}\nwindow.addEventListener('resize',resize);resize()",
  [
    "var c,ctx;",
    "try{c=document.getElementById('c');ctx=c.getContext('2d');console.log('canvas OK '+c.width+'x'+c.height)}catch(e){console.log('CANVAS FAIL '+e)}",
    "if(!ctx){",
    "  ctx={_fake:true,clearRect:function(){},fillRect:function(){},save:function(){},restore:function(){},beginPath:function(){},closePath:function(){},moveTo:function(){},lineTo:function(){},quadraticCurveTo:function(){},arc:function(){},fill:function(){},stroke:function(){},setTransform:function(){},translate:function(){},rotate:function(){},scale:function(){},drawImage:function(){},fillText:function(){},measureText:function(){return{width:0}},createLinearGradient:function(){return{fake:true,addColorStop:function(){}}},createRadialGradient:function(){return{fake:true,addColorStop:function(){}}},strokeRect:function(){},clip:function(){},font:''};",
    "  console.log('ctx FALLBACK active')",
    "}",
    "function resize(){",
    "  const w=document.getElementById('canvasWrap');",
    "  if(!w||!c){console.log('resize: no canvasWrap or c');return}",
    "  if(ctx._fake){W=800;H=400;console.log('resize: fake ctx');calcLayout();return}",
    "  const dpr=window.devicePixelRatio||1;",
    "  c.width=w.clientWidth*dpr;",
    "  c.height=w.clientHeight*dpr;",
    "  ctx.setTransform(dpr,0,0,dpr,0,0);",
    "  W=w.clientWidth;",
    "  H=w.clientHeight;",
    "  calcLayout()",
    "}",
    "window.addEventListener('resize',resize);",
    "resize();",
    "console.log('post-resize W='+W+' H='+H)",
  ].join('\n')
);

// 10. Hardened init()  (matches git HEAD exactly — includes playAmbient, no StateStore.onChange in SSE path)
var initOld = "function init(){try{resize()}catch(e){}try{addLog('" + E.bldg + " Error404Labs - PXH2910','#58a6ff')}catch(e){}\n  try{if(state.mode==='sse'){addLog('" + E.zap + " Pixel Agents — runtime-driven renderer','#8b949e');connectToRuntime()}else{addLog('" + E.zap + " Demo — open via server for real-time sync','#8b949e');playAmbient()}}catch(e){}";
jsContent = jsContent.replace(initOld,
  [
    "function init(){",
    "  console.log('init() called W='+W+' H='+H+' mode='+state.mode);",
    "  try{resize();console.log('init resize W='+W+' H='+H)}catch(e){console.log('init resize err '+e)}",
    "  (function _rr(){",
    "    if(!W||!H){try{resize()}catch(e){}}",
    "    if(!W||!H){console.log('_rr retry W='+W+' H='+H);setTimeout(_rr,200)}else{console.log('_rr resolved W='+W+' H='+H)}",
    "  })();",
    "  try{addLog('" + E.bldg + " Error404Labs - PXH2910','#58a6ff')}catch(e){}",
    "  try{",
    "    if(state.mode==='sse'){addLog('" + E.zap + " Pixel Agents \u2014 runtime-driven renderer','#8b949e');connectToRuntime();StateStore.onChange(applyStateDiff)}",
    "    else{addLog('" + E.robot + " Demo mode \u2014 local renderer','#8b949e')}",
    "  }catch(e){}",
    "}",
  ].join('\n')
);

// 11. Replace mode with vscode (single quotes)
jsContent = jsContent.replace(
  "mode:location.protocol==='http:'||location.protocol==='https:'?'sse':'demo'",
  "mode:'vscode'"
);

// 12. Replace connectToRuntime
jsContent = jsContent.replace(
  "function connectToRuntime(){\n  StateStore.connect('/events')\n  StateStore.onChange(applyStateDiff)\n  StateStore.onSignal(applySignal)\n}",
  "function connectToRuntime(){addLog('Extension -- VS Code sidebar','#58a6ff');StateStore.onSignal(applySignal)}"
);

// 13. jsMarker update at top
jsContent = "try{document.getElementById('jsMarker').textContent='JS: ALIVE '+new Date().toLocaleTimeString();document.body.style.background='#200'}catch(e){}\n" + jsContent;

// ======================== VSCode Bridge ========================

const bridgeJs = [
  '',
  '// ============================================================',
  '// VSCode Bridge',
  '// ============================================================',
  '(function() {',
  '  var STATE_AGENT_MAP = {',
  "    thinking: 'pxh-expert', explore: 'pxh-architect', read: 'pxh-help',",
  "    deleg: 'pxh-pm', edit: 'pxh-expert', write: 'pxh-expert',",
  "    bash: 'pxh-devops', grep: 'pxh-qa', glob: 'pxh-qa',",
  "    list: 'pxh-qa', task: 'pxh-pm', websearch: 'pxh-help',",
  "    webfetch: 'pxh-help', lsp: 'pxh-expert', skill: 'pxh-expert',",
  "    question: 'pxh-pm', doom_loop: 'pxh-fix-bugs',",
  "    review: 'pxh-review-code', test: 'pxh-qa', build: 'pxh-devops',",
  "    design: 'pxh-architect', save: 'pxh-save-history',",
  "    classify: 'pxh-help', route: 'pxh-pm',",
  "    planning: 'pxh-pm', plan: 'pxh-pm', prepare: 'pxh-expert',",
  "    todos: 'pxh-pm', todo: 'pxh-pm', outline: 'pxh-architect',",
  "    fix: 'pxh-fix-bugs', debug: 'pxh-fix-bugs',",
  "    deploy: 'pxh-devops', polish: 'pxh-ui-ux',",
  "    monitoring: 'pxh-pm',",
  '  };',
  '',
  '  function normalizeVSCodeEvent(ev) {',
  "    if (ev.type === 'clear') {",
  "      if (typeof chars !== 'undefined' && chars) {",
  '        Object.keys(chars).forEach(function(k) {',
  '          var ch = chars[k];',
  "          if (ch && typeof ch === 'object') {",
  "            ch.state = 'idle'; ch.w = false; ch.tsm = ''; ch.ts = '';",
  '            ch._msgs = []; ch._monitorLog = [];',
  '            if (ch.ti) { clearInterval(ch.ti); ch.ti = null; }',
  '          }',
  '        });',
  "        if (typeof contracts !== 'undefined') contracts.length = 0;",
  "        if (typeof doneNotifs !== 'undefined') doneNotifs.length = 0;",
  "        if (typeof sysLogs !== 'undefined') sysLogs.length = 0;",
  '      }',
  '      return null;',
  '    }',
  '',
  "    if (ev.type === 'workflow_start') {",
  '      return {',
  "        session: { active: true, phase: 'Interface', workflow: '/vibe', startTime: Date.now() },",
  '        agents: {',
  "          'pxh-help': { currentState: 'typing', badge: 'Interface', message: '', active: true, color: '#58a6ff' },",
  "          'pxh-pm': { currentState: 'typing', badge: 'Orchestration', message: '', active: true, color: '#d29922' },",
  "          'pxh-opencode': { currentState: 'typing', badge: 'Synced', message: '', active: true, color: '#00e5ff' },",
  '        },',
  "        changedAgents: ['pxh-help','pxh-pm','pxh-opencode']",
  '      };',
  '    }',
  '',
  "    if (ev.type === 'workflow_end') {",
  '      var allAgents = {};',
  "      var allIds = Object.keys(typeof AGENTS !== 'undefined' ? AGENTS : {});",
  "      if (!allIds.length) allIds = ['pxh-help','pxh-pm','pxh-architect','pxh-expert','pxh-fix-bugs','pxh-qa','pxh-review-code','pxh-devops','pxh-ui-ux','pxh-save-history','pxh-opencode'];",
  '      for (var i=0;i<allIds.length;i++) {',
  "        allAgents[allIds[i]] = { currentState: 'idle', badge: '', message: '', active: false };",
  '      }',
  '      return {',
  "        session: { active: false, phase: 'idle', workflow: '\\u2014' },",
  '        agents: allAgents,',
  '        changedAgents: allIds',
  '      };',
  '    }',
  '',
  "    if (ev.type === 'agent_state') {",
  "      var agentId = ev.agent || STATE_AGENT_MAP[ev.tuiState] || 'pxh-expert';",
  "      var st = ev.tuiState || ev.state || '';",
  "      var isIdle = st === 'idle' || !st;",
  '      var isReading = !!(st && st.match(/read|search|find|grep|glob|explore|think|classify|monitor|question/i));',
  '      return {',
  '        agents: function() { var o={}; o[agentId] = {',
  "          currentState: isIdle ? 'idle' : (isReading ? 'reading' : 'typing'),",
  "          badge: isIdle ? '' : (st || 'Working'),",
  "          message: ev.message || '',",
  '          active: !isIdle,',
  '          activeTool: isIdle ? null : st,',
  '          isReading: !isIdle && isReading,',
  "          color: '#888'",
  '        }; return o; }(),',
  '        changedAgents: [agentId]',
  '      };',
  '    }',
  '',
  "    if (ev.type === 'tui_mirror') {",
  "      var msg = (ev.message || ev.line || '').trim();",
  "      if (msg.length > 200) msg = msg.slice(0, 197) + '...';",
  '      return {',
  '        agents: function() { var o={}; o[\'pxh-opencode\'] = {',
  "          currentState: 'typing',",
  "          badge: 'Synced',",
  "          message: msg,",
  '          active: true,',
  "          color: '#00e5ff'",
  '        }; return o; }(),',
  "        changedAgents: ['pxh-opencode']",
  '      };',
  '    }',
  '',
  "    if (ev.type === 'contract' && ev.from && ev.to) {",
  "      if (typeof applySignal === 'function') {",
  '        applySignal({ from: ev.from, to: ev.to });',
  '      }',
  '      return null;',
  '    }',
  '',
  '    return null;',
  '  }',
  '',
  '  var _vscodeApi = acquireVsCodeApi();',
  '',
  "  window.addEventListener('message', function(e) {",
  '    try {',
  '      var ev = e.data;',
  "      if (!ev || !ev.type) return;",
  '',
  '      var diff = normalizeVSCodeEvent(ev);',
  "      if (diff && typeof applyStateDiff === 'function') {",
  '        applyStateDiff(diff);',
  '      }',
  '    } catch(ex) {}',
  '  });',
  '})();',
].join('\n');

jsContent = jsContent + bridgeJs;

fs.writeFileSync('D:/pxhopencode/skills/virtual-office/extension/media/office.js', jsContent, 'utf8');

console.log('Verified:');
console.log('  size:', jsContent.length);
console.log('  mode vscode:', jsContent.includes("mode:'vscode'"));
console.log('  bridge:', jsContent.includes('normalizeVSCodeEvent'));
console.log('  jsMarker:', jsContent.includes('jsMarker'));
console.log('  connectToRuntime:', jsContent.includes('Extension -- VS Code'));
console.log('  dbg helpers:', jsContent.includes('function dbg()'));
console.log('  onerror handler:', jsContent.includes('window.onerror=function(m,f,l)'));
console.log('  sndEl guard:', jsContent.includes('var sndEl'));
console.log('  termInput guard:', jsContent.includes("if(!termInput)"));
console.log('  canvas guard:', jsContent.includes('var c,ctx;'));
console.log('  fake ctx:', jsContent.includes('_fake'));
console.log('  init hardened:', jsContent.includes('function _rr()'));
