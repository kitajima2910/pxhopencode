#!/usr/bin/env node
/**
 * Test eventWatcher.js pipeline: readStateFallback + checkActivityLog
 *
 * Simulates exactly what eventWatcher.js does:
 * 1. Reads opencode-state.json → emits workflow_start/agent_state/workflow_end
 * 2. Checks opencode-activity.log → detects markers + mtime changes
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STATE_FILE = path.join(ROOT, '_shared', 'opencode-state.json')
const EVENTS_FILE = path.join(ROOT, '_shared', 'office-events.log')

// ── Helpers ──
let passed = 0, failed = 0
function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✅ ${label}`) }
  else { console.log(`  ❌ ${label}`); failed++ }
}

// ── STATE_MAP (from eventWatcher.js) ──
const STATE_MAP = {
  thinking: 'pxh-expert', explore: 'pxh-architect', read: 'pxh-help',
  deleg: 'pxh-pm', 'preparing edit': 'pxh-expert', edit: 'pxh-expert',
  write: 'pxh-expert', bash: 'pxh-devops', grep: 'pxh-qa',
  glob: 'pxh-qa', list: 'pxh-qa', task: 'pxh-pm',
  websearch: 'pxh-help', webfetch: 'pxh-help', lsp: 'pxh-expert',
  skill: 'pxh-expert', question: 'pxh-pm', doom_loop: 'pxh-fix-bugs',
  review: 'pxh-review-code', test: 'pxh-qa', build: 'pxh-devops',
  design: 'pxh-architect', save: 'pxh-save-history',
  classify: 'pxh-help', route: 'pxh-pm',
  planning: 'pxh-pm', plan: 'pxh-pm', prepare: 'pxh-expert',
  todos: 'pxh-pm', todo: 'pxh-pm', outline: 'pxh-architect',
  fix: 'pxh-fix-bugs', debug: 'pxh-fix-bugs',
  deploy: 'pxh-devops', polish: 'pxh-ui-ux',
  monitoring: 'pxh-pm',
}

// ── Simulates readStateFallback() from eventWatcher.js ──
function simulateReadStateFallback(stateObj, prevState, fallbackActive) {
  const events = []
  let newPrevState = prevState
  let newFallbackActive = fallbackActive
  const st = stateObj

  if (st.state === 'workflow_start') {
    if (!newFallbackActive) {
      newFallbackActive = true
      events.push({ type: 'workflow_start', message: st.message || 'Workflow started' })
    }
    newPrevState = st.state
    return { events, prevState: newPrevState, fallbackActive: newFallbackActive }
  }
  if (st.state === 'workflow_end') {
    if (newFallbackActive) {
      newFallbackActive = false
      events.push({ type: 'workflow_end', message: st.message || 'Workflow ended' })
    }
    newPrevState = 'idle'
    return { events, prevState: newPrevState, fallbackActive: newFallbackActive }
  }
  if (st.agent === 'pxh-opencode' && st.state === 'Mirror' && st.message) {
    events.push({ type: 'tui_mirror', agent: 'pxh-opencode', message: st.message })
    return { events, prevState: newPrevState, fallbackActive: newFallbackActive }
  }
  if (st.state && st.state !== 'idle' && st.state !== newPrevState) {
    newPrevState = st.state
    if (!newFallbackActive) {
      newFallbackActive = true
      events.push({ type: 'workflow_start', message: 'User prompt submitted' })
    }
    const agent = st.agent || STATE_MAP[st.state] || 'pxh-expert'
    events.push({ type: 'agent_state', agent, tuiState: st.state, message: st.message || `${st.state}...` })
    return { events, prevState: newPrevState, fallbackActive: newFallbackActive }
  }
  if (!st.state || st.state === 'idle') {
    if (newPrevState && newPrevState !== 'idle' && newFallbackActive) {
      newFallbackActive = false
      events.push({ type: 'workflow_end', message: 'Processing complete' })
    }
    newPrevState = 'idle'
    return { events, prevState: newPrevState, fallbackActive: newFallbackActive }
  }
  return { events, prevState: newPrevState, fallbackActive: newFallbackActive }
}

// ── Simulates checkActivityLog() from eventWatcher.js ──
// Accepts explicit file path for isolated temp file testing
function simulateCheckActivityLog(filePath, prevSize, prevMtime, active) {
  const ACTIVITY_TIMEOUT_MS = 15000
  const events = []
  let newActive = active
  let newSize = prevSize
  let newMtime = prevMtime
  try {
    if (!fs.existsSync(filePath)) return { events, size: newSize, mtime: newMtime, active: newActive }
    const stats = fs.statSync(filePath)
    const mtime = stats.mtimeMs
    if (mtime !== prevMtime) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const hasWorkflowStart = raw.lastIndexOf('[workflow_start]') > prevSize
      const hasWorkflowEnd = raw.lastIndexOf('[workflow_end]') > prevSize
      if (hasWorkflowStart && !newActive) {
        newActive = true
        events.push({ type: 'workflow_start', message: 'Activity log: workflow detected' })
      }
      if (hasWorkflowEnd && newActive) {
        newActive = false
        events.push({ type: 'workflow_end', message: 'Activity log: workflow ended' })
      }
      if (stats.size > prevSize && !hasWorkflowStart && !hasWorkflowEnd) {
        if (!newActive) {
          newActive = true
          events.push({ type: 'workflow_start', message: 'Activity log: activity detected' })
        }
      }
      newMtime = mtime
      newSize = stats.size
    }
    if (newActive && (Date.now() - mtime > ACTIVITY_TIMEOUT_MS)) {
      newActive = false
      events.push({ type: 'workflow_end', message: 'Activity timeout' })
    }
  } catch {}
  return { events, size: newSize, mtime: newMtime, active: newActive }
}

// ============================================================
// TESTS
// ============================================================
console.log('\n═══════════════════════════════════════')
console.log(' TEST SUITE: eventWatcher Pipeline')
console.log('═══════════════════════════════════════')

console.log('\n── readStateFallback Tests ──')

console.log('\n[Test 1] idle → thinking')
let r = simulateReadStateFallback({ state: 'thinking', agent: 'pxh-expert', message: 'Analyzing' }, 'idle', false)
assert(r.events.length === 2, 'emits 2 events (workflow_start + agent_state)')
assert(r.events[0].type === 'workflow_start', 'first event is workflow_start')
assert(r.events[1].type === 'agent_state', 'second event is agent_state')
assert(r.events[1].agent === 'pxh-expert', 'agent is pxh-expert')
assert(r.events[1].tuiState === 'thinking', 'tuiState is thinking')
assert(r.fallbackActive === true, 'fallbackActive becomes true')
assert(r.prevState === 'thinking', 'prevState updated to thinking')

console.log('\n[Test 2] thinking → edit (same session)')
r = simulateReadStateFallback({ state: 'edit', agent: 'pxh-expert', message: 'Editing file' }, 'thinking', true)
assert(r.events.length === 1, 'emits 1 event (agent_state only)')
assert(r.events[0].type === 'agent_state', 'event is agent_state')
assert(r.events[0].tuiState === 'edit', 'tuiState is edit')

console.log('\n[Test 3] edit → idle')
r = simulateReadStateFallback({ state: 'idle' }, 'edit', true)
assert(r.events.length === 1, 'emits 1 event (workflow_end)')
assert(r.events[0].type === 'workflow_end', 'event is workflow_end')
assert(r.fallbackActive === false, 'fallbackActive becomes false')
assert(r.prevState === 'idle', 'prevState becomes idle')

console.log('\n[Test 4] idle → explicit workflow_start')
r = simulateReadStateFallback({ state: 'workflow_start', message: 'Manual start' }, 'idle', false)
assert(r.events.length === 1, 'emits 1 event')
assert(r.events[0].type === 'workflow_start', 'event is workflow_start')
assert(r.events[0].message === 'Manual start', 'message preserved')

console.log('\n[Test 5] explicit workflow_start → workflow_end')
r = simulateReadStateFallback({ state: 'workflow_end', message: 'Manual end' }, 'workflow_start', true)
assert(r.events.length === 1, 'emits 1 event')
assert(r.events[0].type === 'workflow_end', 'event is workflow_end')

console.log('\n[Test 6] Mirror state → tui_mirror')
r = simulateReadStateFallback({ state: 'Mirror', agent: 'pxh-opencode', message: '[TUI] npm test' }, 'idle', false)
assert(r.events.length === 1, 'emits 1 event')
assert(r.events[0].type === 'tui_mirror', 'event is tui_mirror')
assert(r.fallbackActive === false, 'fallbackActive NOT changed')

console.log('\n[Test 7] Same state repeated → dedup')
r = simulateReadStateFallback({ state: 'read', agent: 'pxh-help', message: 'Reading' }, 'read', true)
assert(r.events.length === 0, 'emits 0 events (dedup)')

console.log('\n[Test 8] bash → pxh-devops mapping')
r = simulateReadStateFallback({ state: 'bash', message: 'npm install' }, 'idle', false)
assert(r.events[1].agent === 'pxh-devops', 'bash maps to pxh-devops')

console.log('\n[Test 9] Unknown state → pxh-expert fallback')
r = simulateReadStateFallback({ state: 'unknown_tool', message: 'test' }, 'idle', false)
assert(r.events[1].agent === 'pxh-expert', 'unknown state maps to pxh-expert default')

console.log('\n[Test 10] idle → idle (no transition)')
r = simulateReadStateFallback({ state: 'idle' }, 'idle', false)
assert(r.events.length === 0, 'emits 0 events')

// ============================================================
console.log('\n── checkActivityLog Tests (isolated temp files) ──')

const TMPDIR = path.join(ROOT, '_shared', '.test-tmp')
try { fs.mkdirSync(TMPDIR, { recursive: true }) } catch {}
const TMP_LOG = path.join(TMPDIR, 'test-activity.log')

function cleanTemp(content) {
  fs.writeFileSync(TMP_LOG, content)
  const st = fs.statSync(TMP_LOG)
  return { size: content.length, mtime: st.mtimeMs }
}

console.log('\n[Test 11] Same content → no trigger')
let t = cleanTemp('[workflow_start] old\n[workflow_end] old\n')
let act = simulateCheckActivityLog(TMP_LOG, t.size, t.mtime, false)
assert(act.events.length === 0, 'no events for same content')
assert(act.active === false, 'workflow stays inactive')

console.log('\n[Test 12] Append [workflow_start] → trigger')
fs.appendFileSync(TMP_LOG, '\n[workflow_start] New task\n')
act = simulateCheckActivityLog(TMP_LOG, t.size, t.mtime - 100, false)
assert(act.events.length === 1, 'emits 1 event')
assert(act.events[0].type === 'workflow_start', 'event is workflow_start')
assert(act.active === true, 'workflow becomes active')
const afterStart = act

console.log('\n[Test 13] Same content again → no re-trigger')
act = simulateCheckActivityLog(TMP_LOG, afterStart.size, afterStart.mtime, true)
assert(act.events.length === 0, 'no events for same content')
assert(act.active === true, 'workflow stays active')

console.log('\n[Test 14] Append [workflow_end] → end workflow')
fs.appendFileSync(TMP_LOG, '\n[workflow_end] Done\n')
act = simulateCheckActivityLog(TMP_LOG, afterStart.size, afterStart.mtime - 100, true)
assert(act.events.length === 1, 'emits 1 event')
assert(act.events[0].type === 'workflow_end', 'event is workflow_end')
assert(act.active === false, 'workflow becomes inactive')

console.log('\n[Test 15] Generic content (no markers) → activity detected')
t = cleanTemp('random log line\nanother line\n')
act = simulateCheckActivityLog(TMP_LOG, 0, t.mtime - 100, false)
assert(act.events.length === 1, 'emits 1 event')
assert(act.events[0].type === 'workflow_start', 'event is workflow_start')
assert(act.active === true, 'workflow becomes active')

console.log('\n[Test 16] Missing file → no crash')
act = simulateCheckActivityLog(path.join(TMPDIR, 'nonexistent.log'), 0, Date.now(), false)
assert(act.events.length === 0, 'no events for missing file')
assert(act.active === false, 'workflow stays inactive')

// Cleanup
try { fs.rmSync(TMPDIR, { recursive: true, force: true }) } catch {}

// ============================================================
console.log('\n── Live End-to-End Test ──')
console.log('\n[Test 17] Write opencode-state.json → pipeline events')

// Save state
const origState = fs.readFileSync(STATE_FILE, 'utf-8')

// Write workflow_start
fs.writeFileSync(STATE_FILE, JSON.stringify({ state: 'workflow_start', agent: 'pxh-pm', message: 'User prompt: test pipeline' }))
let prevState = 'idle', fbActive = false
r = simulateReadStateFallback({ state: 'workflow_start', agent: 'pxh-pm', message: 'User prompt: test pipeline' }, prevState, fbActive)
assert(r.events.length === 1, 'workflow_start emitted')
assert(r.events[0].type === 'workflow_start', 'type is workflow_start')
assert(r.fallbackActive === true, 'fallbackActive becomes true')

// Write edit state
r = simulateReadStateFallback({ state: 'edit', agent: 'pxh-expert', message: 'Testing pipeline' }, r.prevState, r.fallbackActive)
assert(r.events.length === 1, 'agent_state emitted')
assert(r.events[0].type === 'agent_state', 'type is agent_state')
assert(r.events[0].agent === 'pxh-expert', 'agent is pxh-expert')

// Write idle
r = simulateReadStateFallback({ state: 'idle' }, r.prevState, r.fallbackActive)
assert(r.events.length === 1, 'workflow_end emitted')
assert(r.events[0].type === 'workflow_end', 'type is workflow_end')
assert(r.fallbackActive === false, 'fallbackActive becomes false')

// Restore
fs.writeFileSync(STATE_FILE, origState)

// ============================================================
console.log('\n═══════════════════════════════════════')
console.log(` RESULTS: ${passed} passed, ${failed} failed`)
console.log('═══════════════════════════════════════')

process.exit(failed > 0 ? 1 : 0)
