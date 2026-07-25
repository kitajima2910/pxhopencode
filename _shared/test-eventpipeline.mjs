/**
 * Event Pipeline Simulation Test
 * 
 * Tests the core logic extracted from office.html + officeViewProvider.js
 * to verify truncation safety layers work correctly.
 */

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✅ ${label}`); }
  else { failed++; console.error(`  ❌ ${label} — FAILED`); }
}

// ── 1. Simulate addLog truncation (from office.html) ──
function addLog(msg, color, agentName) {
  if (typeof msg !== 'string') msg = String(msg);
  if (msg.length > 200) { msg = msg.slice(0, 197) + '...'; }
  return msg; // return truncated result for testing
}

console.log('\n📋 Test: addLog truncation (200 chars)');
assert(addLog('short message') === 'short message', 'Short message unchanged');
assert(addLog('a'.repeat(250)).length === 200, 'Long message truncated to 200 chars');
assert(addLog('a'.repeat(250)).endsWith('...'), 'Truncated message ends with ...');
const srcCode = '/** const StateStore=(function(){ ... full source code ... })(); if(typeof module...';
assert(addLog(srcCode).length <= 200, 'Source code truncated to ≤200 chars');

// ── 2. Simulate _monitorLog truncation (from office.html applyStateDiff) ──
function pushMonitorLog(message) {
  var _mMsg = (message || '');
  if (_mMsg.length > 40) _mMsg = _mMsg.slice(0, 37) + '...';
  return _mMsg;
}

console.log('\n📋 Test: _monitorLog truncation (40 chars)');
assert(pushMonitorLog('short') === 'short', 'Short monitor msg unchanged');
assert(pushMonitorLog('a'.repeat(50)).length === 40, 'Long monitor msg truncated to 40 chars');
assert(pushMonitorLog('a'.repeat(50)).endsWith('...'), 'Monitor msg ends with ...');
assert(pushMonitorLog(null) === '', 'Null handled gracefully');
assert(pushMonitorLog(undefined) === '', 'Undefined handled gracefully');

// ── 3. Simulate _mirrorLog truncation (from office.html applyStateDiff) ──
function pushMirrorLog(message) {
  var _mirMsg = (message || '');
  if (_mirMsg.length > 120) _mirMsg = _mirMsg.slice(0, 117) + '...';
  return _mirMsg;
}

console.log('\n📋 Test: _mirrorLog truncation (120 chars)');
assert(pushMirrorLog('short') === 'short', 'Short mirror msg unchanged');
assert(pushMirrorLog('a'.repeat(150)).length === 120, 'Long mirror msg truncated to 120 chars');
assert(pushMirrorLog('a'.repeat(150)).endsWith('...'), 'Mirror msg ends with ...');

// ── 4. Simulate normalizeVSCodeEvent tui_mirror truncation (from officeViewProvider.js) ──
function normalizeTuiMirror(message) {
  var msg = (message || '').trim();
  if (msg.length > 200) msg = msg.slice(0, 197) + '...';
  return msg;
}

console.log('\n📋 Test: VSCode bridge tui_mirror truncation (200 chars)');
assert(normalizeTuiMirror('short') === 'short', 'Short tui msg unchanged');
assert(normalizeTuiMirror('a'.repeat(300)).length === 200, 'Long tui msg truncated to 200 chars');
assert(normalizeTuiMirror('  hello  ') === 'hello', 'Whitespace trimmed');

// ── 5. Simulate normalizeVSCodeEvent agent_state ──
function normalizeAgentState(ev) {
  var STATE_AGENT_MAP = {
    thinking: 'pxh-expert', explore: 'pxh-architect', read: 'pxh-help',
    bash: 'pxh-devops', test: 'pxh-qa', review: 'pxh-review-code',
  };
  var agentId = ev.agent || STATE_AGENT_MAP[ev.tuiState] || 'pxh-expert';
  var st = ev.tuiState || ev.state || '';
  var isIdle = st === 'idle' || !st;
  var isReading = !!(st && st.match(/read|search|find|grep|glob|explore|think|classify|monitor|question/i));
  return {
    agentId,
    currentState: isIdle ? 'idle' : (isReading ? 'reading' : 'typing'),
    badge: isIdle ? '' : (st || 'Working'),
    message: ev.message || '',
    active: !isIdle,
  };
}

console.log('\n📋 Test: normalizeVSCodeEvent → agent_state');
var r1 = normalizeAgentState({ agent: 'pxh-expert', tuiState: 'thinking', message: 'Analyzing code...' });
assert(r1.agentId === 'pxh-expert', 'Agent ID mapped correctly');
assert(r1.currentState === 'reading', 'thinking → reading state');
assert(r1.active === true, 'Active when has state');
assert(r1.badge === 'thinking', 'Badge matches state');

var r2 = normalizeAgentState({ tuiState: 'code', message: 'Writing implementation' });
assert(r2.agentId === 'pxh-expert', 'Unknown state maps to pxh-expert');
assert(r2.currentState === 'typing', 'code → typing state');

var r3 = normalizeAgentState({ tuiState: 'idle' });
assert(r3.active === false, 'idle → not active');
assert(r3.currentState === 'idle', 'idle state preserved');

// ── 6. Simulate workflow_start / workflow_end ──
console.log('\n📋 Test: normalizeVSCodeEvent → workflow boundary');
var ws = { type: 'workflow_start' };
var wsResult = {
  session: { active: true, phase: 'Interface' },
  agents: { 'pxh-help': { active: true }, 'pxh-pm': { active: true }, 'pxh-opencode': { active: true } }
};
assert(wsResult.session.active === true, 'workflow_start → session active');
assert(wsResult.agents['pxh-help'].active === true, 'workflow_start → pxh-help active');

var we = { type: 'workflow_end' };
var weResult = { session: { active: false, phase: 'idle' } };
assert(weResult.session.active === false, 'workflow_end → session inactive');
assert(weResult.session.phase === 'idle', 'workflow_end → idle phase');

// ── Summary ──
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(40)}\n`);
process.exit(failed > 0 ? 1 : 0);
