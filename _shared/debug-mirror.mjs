#!/usr/bin/env node
/**
 * Direct test of server.mjs watcher logic.
 * Imports emit() and tests ALL conditions exactly as server.mjs does.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { emit } from '../skills/virtual-office/templates/emit-event.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EVENTS_FILE = path.join(ROOT, '_shared', 'office-events.log')

// Reset
fs.writeFileSync(EVENTS_FILE, '')

// Exact state tracking from server.mjs
let prevState = null
let watcherWorkflowActive = false

// Wait 3s for startup grace (simulated)
const startedAt = Date.now()
function isStartupGrace() { return Date.now() - startedAt < 100 } // 100ms for test

// STATE_MAP from server.mjs
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

// Exact server.mjs watcher logic
function processStateChange(raw) {
  const st = JSON.parse(raw)

  if (isStartupGrace()) {
    prevState = st.state || 'idle'
    console.log(`  [grace] set prevState=${prevState}`)
    return
  }

  // ── Explicit workflow_start ──
  if (st.state === 'workflow_start') {
    if (!watcherWorkflowActive) {
      watcherWorkflowActive = true
      emit({ type: 'workflow_start', message: st.message || 'Workflow started' })
      console.log(`  → emitted: workflow_start`)
    }
    prevState = st.state
    console.log(`  [workflow_start] prevState=${prevState}`)
    return
  }

  // ── Explicit workflow_end ──
  if (st.state === 'workflow_end') {
    if (watcherWorkflowActive) {
      watcherWorkflowActive = false
      emit({ type: 'workflow_end', message: st.message || 'Workflow ended' })
      console.log(`  → emitted: workflow_end`)
    }
    prevState = 'idle'
    console.log(`  [workflow_end] prevState=idle`)
    return
  }

  // ── pxh-opencode mirror (check BEFORE generic non-idle) ──
  console.log(`  [mirror check] agent=${st.agent} state=${st.state} message=${!!st.message}`)
  if (st.agent === 'pxh-opencode' && st.state === 'Mirror' && st.message) {
    emit({ type: 'tui_mirror', agent: 'pxh-opencode', message: st.message })
    console.log(`  ✅→ emitted: tui_mirror (agent_state for Mirror correctly bypassed!)`)
    return
  }
  console.log(`  [mirror check] NOT matched, falling through`)

  // ── Non-idle state transition ──
  if (st.state && st.state !== 'idle' && st.state !== prevState) {
    if (prevState === null || prevState === 'idle' || !prevState) {
      watcherWorkflowActive = true
      emit({ type: 'workflow_start', message: 'User prompt submitted' })
      console.log(`  → emitted: workflow_start (first activity)`)
    }
    const agent = st.agent || STATE_MAP[st.state] || 'pxh-expert'
    emit({ type: 'agent_state', agent, tuiState: st.state, message: st.message || `${st.state}...` })
    console.log(`  → emitted: agent_state agent=${agent} tuiState=${st.state}`)
    prevState = st.state
    console.log(`  [agent_state] prevState=${prevState}`)
    return
  }

  // ── Idle state → end workflow if active ──
  if (!st.state || st.state === 'idle') {
    if (prevState && prevState !== 'idle' && watcherWorkflowActive) {
      watcherWorkflowActive = false
      emit({ type: 'workflow_end', message: 'Processing complete' })
      console.log(`  → emitted: workflow_end (idle detected)`)
    }
    prevState = 'idle'
    console.log(`  [idle] prevState=idle`)
    return
  }

  console.log(`  [fallthrough] no condition matched! state=${st.state} prevState=${prevState}`)
}

function readLog() {
  return fs.readFileSync(EVENTS_FILE, 'utf-8').split('\n').filter(Boolean).map(l => JSON.parse(l))
}

// ====== TEST ======
console.log('\n═══════════════════════════════════════')
console.log(' TEST: idle → thinking')
console.log('═══════════════════════════════════════')
// Simulate startup grace first
isStartupGrace() // This runs during the 100ms grace
setTimeout(() => {
  processStateChange(JSON.stringify({ state: 'thinking', agent: 'pxh-expert', message: 'Analyzing' }))
  
  console.log('\n═══════════════════════════════════════')
  console.log(' TEST: thinking → Mirror (CRITICAL)')
  console.log('═══════════════════════════════════════')
  processStateChange(JSON.stringify({ state: 'Mirror', agent: 'pxh-opencode', message: '[TUI] npm test' }))
  
  console.log('\n═══════════════════════════════════════')
  console.log(' FINAL EVENTS LOG')
  console.log('═══════════════════════════════════════')
  const events = readLog()
  console.log(JSON.stringify(events, null, 2))
  
  const hasTuiMirror = events.some(e => e.type === 'tui_mirror')
  const hasAgentMirror = events.some(e => e.type === 'agent_state' && e.tuiState === 'Mirror')
  
  console.log(`\ntui_mirror found: ${hasTuiMirror ? '✅ YES' : '❌ NO'}`)
  console.log(`agent_state with Mirror: ${hasAgentMirror ? '❌ FOUND (BUG!)' : '✅ NOT found (correct)'}`)
  
  process.exit(hasTuiMirror && !hasAgentMirror ? 0 : 1)
}, 200)
