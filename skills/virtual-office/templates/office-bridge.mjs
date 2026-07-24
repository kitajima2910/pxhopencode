#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'
import { normalizeEvent, getAgentRole } from './hook-provider.mjs'

const _MODULE_DIR = path.dirname(fileURLToPath(import.meta.url))
const MODULE_ROOT = path.resolve(_MODULE_DIR, '..', '..', '..')
const ROOT = process.env.PXH_ROOT || MODULE_ROOT
const EVENTS_FILE = process.env.PXH_EVENTS || path.join(ROOT, '_shared', 'office-events.log')
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:2910'
const BRIDGE_PORT = parseInt(process.env.BRIDGE_PORT || '2911', 10)
const DEBOUNCE_MS = 100
const HEARTBEAT_MS = 25000
const MAX_EVENTS_PER_MINUTE = 15

const AGENTS = {
  'pxh-help':        { tier: 'T1', color: '#00bcd4' },
  'pxh-pm':          { tier: 'T2', color: '#f1c40f' },
  'pxh-architect':   { tier: 'T3', color: '#9b59b6' },
  'pxh-expert':      { tier: 'T3', color: '#2ecc71' },
  'pxh-fix-bugs':    { tier: 'T3', color: '#e74c3c' },
  'pxh-qa':          { tier: 'T3', color: '#1abc9c' },
  'pxh-review-code': { tier: 'T3', color: '#f39c12' },
  'pxh-devops':      { tier: 'T3', color: '#3498db' },
  'pxh-ui-ux':       { tier: 'T3', color: '#e91e63' },
  'pxh-save-history':{ tier: 'T4', color: '#663399' },
  'pxh-office':      { tier: 'Virtual', color: '#8b949e' },
}

const EXT_MAP = [
  { re: /\.(ts|tsx|js|jsx)$/,          agent: 'pxh-expert',      action: 'Code',      tier_from: 'T2', tier_to: 'T3' },
  { re: /\.(test|spec)\.(ts|js)$/,      agent: 'pxh-qa',          action: 'Test',      tier_from: 'T3', tier_to: 'T3' },
  { re: /\.(css|scss|less)$/,           agent: 'pxh-ui-ux',       action: 'Style',     tier_from: 'T3', tier_to: 'T3' },
  { re: /\.html$/,                      agent: 'pxh-expert',      action: 'Code',      tier_from: 'T3', tier_to: 'T3' },
  { re: /\.md$/,                        agent: 'pxh-save-history',action: 'Doc',       tier_from: 'T3', tier_to: 'T4' },
  { re: /\.(json|yaml|yml)$/,           agent: 'pxh-devops',      action: 'Config',    tier_from: 'T3', tier_to: 'T3' },
  { re: /\.(ps1|sh|bat)$/,              agent: 'pxh-devops',      action: 'Script',    tier_from: 'T3', tier_to: 'T3' },
  { re: /agent.*\.md$/,                 agent: 'pxh-pm',          action: 'Agent',     tier_from: 'T2', tier_to: 'T2' },
  { re: /workflow.*\.md$/,              agent: 'pxh-pm',          action: 'Workflow',  tier_from: 'T2', tier_to: 'T2' },
  { re: /SKILL\.md$/,                   agent: 'pxh-expert',      action: 'Skill',     tier_from: 'T2', tier_to: 'T3' },
]

const WORKFLOWS = ['/web', '/game', '/ai', '/tool', '/vibe', '/debug', '/ui-ux']
const PHASES = ['Analyze', 'Design', 'Code', 'Test', 'Fix Bug', 'Review', 'Release', 'Save']
const PHASE_AGENTS = [null, 'pxh-architect', 'pxh-expert', 'pxh-qa', 'pxh-fix-bugs', 'pxh-review-code', 'pxh-devops', 'pxh-save-history']

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.svn', 'dist', 'build', '.next', '.opencode'])
const EXCLUDE_FILES = new Set(['office-events.log'])

const state = {
  pending: [],
  emitCount: 0,
  minuteStart: Date.now(),
  lastEmit: 0,
  phaseIndex: 0,
  workflowIndex: 0,
  directBroadcast: null,
  activeAgents: {},
  idleTimers: {},
  idleTimer: null,
}
const WORK_IDLE_MS = 8000

function startAgentIdle(agent, delay) {
  // T1 + T2 stay until global idle (don't leave individually)
  const isCore = agent === 'pxh-help' || agent === 'pxh-pm'
  const timeout = isCore ? WORK_IDLE_MS + 12000 : WORK_IDLE_MS + (delay||0)
  clearTimeout(state.idleTimers[agent])
  state.idleTimers[agent] = setTimeout(() => {
    if(isCore) return // T1/T2 only leave via global idle
    emit({ type: 'agent_state', agent, tuiState: 'idle', message: '' })
    delete state.activeAgents[agent]
    delete state.idleTimers[agent]
  }, timeout)
}

function resetGlobalIdle() {
  clearTimeout(state.idleTimer)
  state.idleTimer = setTimeout(() => {
    for (const ag of Object.keys(state.activeAgents)) {
      clearTimeout(state.idleTimers[ag])
      emit({ type: 'agent_state', agent: ag, tuiState: 'idle', message: '' })
      delete state.idleTimers[ag]
      delete state.activeAgents[ag]
    }
  }, WORK_IDLE_MS + 5000)
}

function getRelative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function isIgnored(filePath) {
  const rel = getRelative(filePath)
  const parts = rel.split('/')
  for (const p of parts) {
    if (EXCLUDE_DIRS.has(p)) return true
  }
  const base = path.basename(filePath)
  if (EXCLUDE_FILES.has(base)) return true
  if (base.endsWith('.log')) return true
  return false
}

function classifyFile(filePath) {
  if (isIgnored(filePath)) return null
  const name = path.basename(filePath)
  const rel = getRelative(filePath)

  for (const rule of EXT_MAP) {
    if (rule.re.test(name)) {
      return { agent: rule.agent, action: rule.action, file: rel, tier_from: rule.tier_from, tier_to: rule.tier_to }
    }
  }
  return null
}

function emitToLog(event) {
  const entry = { ts: new Date().toISOString(), ...event }
  try {
    fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true })
    fs.appendFileSync(EVENTS_FILE, JSON.stringify(entry) + '\n')
  } catch { }
  return entry
}

function emitToServer(event) {
  try {
    const data = JSON.stringify(event)
    const u = new URL(SERVER_URL + '/emit')
    const req = http.request(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    })
    req.on('error', () => { })
    req.write(data)
    req.end()
  } catch { }
}

function emit(event) {
  emitToLog(event)
  if (state.directBroadcast) {
    state.directBroadcast(event)
  } else {
    emitToServer(event)
  }
  state.lastEmit = Date.now()
  state.emitCount++
  resetGlobalIdle()
}

function canEmit() {
  const now = Date.now()
  if (now - state.minuteStart > 60000) {
    state.minuteStart = now
    state.emitCount = 0
  }
  return state.emitCount < MAX_EVENTS_PER_MINUTE
}

const WORKFLOW_PIPELINES = {
  Code:  ['pxh-help','pxh-pm','pxh-architect','__MAIN__','pxh-ui-ux','pxh-qa','pxh-review-code','pxh-devops','pxh-save-history'],
  Test:  ['__MAIN__'],
  Debug: ['__MAIN__'],
  Style: ['__MAIN__'],
  UI:    ['__MAIN__'],
  Doc:   ['__MAIN__'],
  Config:['__MAIN__'],
  Script:['__MAIN__'],
  Agent: ['__MAIN__'],
  Workflow:['__MAIN__'],
  Skill: ['__MAIN__'],
}
const AGENT_ROLES = {
  'pxh-help':   { tuiState: 'Interface',  msg: '' },
  'pxh-pm':     { tuiState: 'Orchestration', msg: '' },
  'pxh-architect': { tuiState: 'Design', msg: '' },
  'pxh-expert': { tuiState: 'Code',     msg: '' },
  'pxh-fix-bugs': { tuiState: 'Debug', msg: '' },
  'pxh-qa':     { tuiState: 'Test',   msg: '' },
  'pxh-review-code': { tuiState: 'Review', msg: '' },
  'pxh-devops': { tuiState: 'Build',   msg: '' },
  'pxh-save-history': { tuiState: 'Infrastructure', msg: '' },
  'pxh-ui-ux':  { tuiState: 'Design',      msg: '' },
  'pxh-office': { tuiState: 'Virtual Office', msg: '' },
}

// Signal connections: who sends dashed line to whom
const SIGNALS = {
  'pxh-help': ['pxh-pm'],
  'pxh-pm': ['pxh-architect','pxh-expert','pxh-fix-bugs','pxh-qa','pxh-review-code','pxh-devops','pxh-ui-ux'],
  'pxh-architect': ['pxh-pm'],
  'pxh-expert': ['pxh-pm'],
  'pxh-fix-bugs': ['pxh-expert','pxh-qa','pxh-pm'],
  'pxh-qa': ['pxh-expert','pxh-pm'],
  'pxh-review-code': ['pxh-expert','pxh-pm'],
  'pxh-devops': ['pxh-architect','pxh-pm'],
  'pxh-ui-ux': ['pxh-expert'],
  'pxh-save-history': ['pxh-pm'],
}

function createTaskSequence(cls) {
  const agents = WORKFLOW_PIPELINES[cls.action] || ['__MAIN__']
  const seq = []
  let prev = null
  agents.forEach(ag => {
    const name = ag === '__MAIN__' ? cls.agent : ag
    const role = AGENT_ROLES[name] || { tuiState: cls.action, msg: `${cls.action}...` }
    const msg = name === cls.agent ? `${cls.action}: ${cls.file}` : role.msg
    // Signal from previous agent to this one
    if(prev && SIGNALS[prev] && SIGNALS[prev].includes(name)){
      seq.push({ type: 'contract', from: prev, to: name })
    }
    seq.push({ type: 'agent_state', agent: name, tuiState: role.tuiState, message: msg })
    prev = name
  })
  // Signal from last agent to their targets
  const last = agents[agents.length-1]
  const lastName = last === '__MAIN__' ? cls.agent : last
  const targets = SIGNALS[lastName] || []
  targets.forEach(t => { seq.push({ type: 'contract', from: lastName, to: t }) })
  return seq
}

let watchTimer = null

function onFileChange(eventType, filePath) {
  if (!filePath) { return }
  const rel = getRelative(filePath)
  if (watchTimer) clearTimeout(watchTimer)
  watchTimer = setTimeout(processBatch, DEBOUNCE_MS)

  const c = classifyFile(filePath)
  if (!c) return

  const exist = state.pending.find(p => p.file === c.file)
  if (!exist) {
    state.pending.push(c)
  }
}

function processBatch() {
  if (state.pending.length === 0) return
  if (!canEmit()) return

  const batch = state.pending.splice(0, Math.min(5, state.pending.length))
  const activeNow = {}

  batch.forEach((c, idx) => {
    if (!state.activeAgents[c.agent]) {
      const seq = createTaskSequence(c)
      seq.forEach((evt, i) => {
        setTimeout(() => emit(evt), idx*600 + i*400)
      })
      // Track agents in pipeline with staggered idle (skip contract events)
      seq.filter(e=>e.type==='agent_state').forEach((evt, i) => {
        activeNow[evt.agent] = true
        startAgentIdle(evt.agent, i * 1500)
      })
    } else {
      setTimeout(() => {
        emit({ type: 'agent_state', agent: c.agent, tuiState: 'update', message: `${c.action}: ${c.file}` })
      }, idx*300)
      activeNow[c.agent] = true
      startAgentIdle(c.agent, 0)
    }
  })

  // Merge into activeAgents (don't replace — keep T1/T2 from prior batches)
  Object.assign(state.activeAgents, activeNow)
}

function startHeartbeat() {
  setInterval(() => {
    if (Date.now() - state.lastEmit > 30000) {
      emit({ type: 'agent_status', from: 'pxh-office', message: 'idle -- waiting for activity' })
    }
  }, HEARTBEAT_MS)
}

function startHttpServer() {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'POST' && req.url === '/emit') {
      let body = ''
      req.on('data', c => body += c)
      req.on('end', () => {
        try {
          const evt = JSON.parse(body)
          emit(evt)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status: 'ok' }))
        } catch (e) {
          res.writeHead(400)
          res.end(JSON.stringify({ error: e.message }))
        }
      })
      return
    }
    if (req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        mode: 'bridge', pending: state.pending.length,
        emitCount: state.emitCount, lastEmit: new Date(state.lastEmit).toISOString(),
      }))
      return
    }
    res.writeHead(404)
    res.end('Not found')
  })
  server.listen(BRIDGE_PORT, () => {
    console.log(`  \x1b[36m\u2502\x1b[0m  Bridge: \x1b[1mhttp://localhost:${BRIDGE_PORT}\x1b[0m (POST /emit)`)
  })
}

export function startBridge(opts = {}) {
  const rootDir = opts.root || ROOT
  const onEvent = opts.onEvent || null
  if (onEvent) state.directBroadcast = onEvent

  // Filesystem watch DISABLED — agents mirror real TUI events only (via /emit, state file).
  // Uncomment the block below to re-enable auto-detection from file changes.
  // const WATCH_EXT = new Set(['.ts','.tsx','.js','.jsx','.css','.md','.html','.json','.mjs'])
  // ... file watching code ...

  startHeartbeat()

  setTimeout(() => {
    emit({
      type: 'agent_status', from: 'pxh-office',
      message: `Bridge active — mirroring real TUI events only`,
    })
  }, 500)

  return { emit, watchers: [] }
}

if (process.argv[1] && (process.argv[1].endsWith('office-bridge.mjs') || process.argv[1].endsWith('office-bridge.js'))) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage:')
    console.log('  node office-bridge.mjs              Watch mode (default)')
    console.log('  node office-bridge.mjs --emit        Emit single event')
    console.log('  node office-bridge.mjs --type X --from Y --to Z --message "..."')
    process.exit(0)
  }

  if (!process.argv.includes('--emit')) {
    console.log(`\n  \x1b[36m\u250C\u2500 Office Bridge \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\x1b[0m`)
    console.log(`  \x1b[36m\u2502\x1b[0m  Workspace: \x1b[1m${ROOT}\x1b[0m`)
    console.log(`  \x1b[36m\u2502\x1b[0m  Events \u2192 \x1b[1m${SERVER_URL}/emit\x1b[0m`)
    console.log(`  \x1b[36m\u2502\x1b[0m  Status:  \x1b[32m\u2713 Running\x1b[0m`)
    console.log(`  \x1b[36m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\x1b[0m\n`)
    startBridge()
    startHttpServer()
  } else {
    const event = {}
    for (let i = 2; i < process.argv.length; i++) {
      const m = process.argv[i].match(/^--(\w+)$/)
      if (m) {
        const val = process.argv[i + 1] !== undefined && !process.argv[i + 1].startsWith('--')
          ? process.argv[i + 1] : true
        event[m[1]] = val
        if (typeof val !== 'boolean') i++
      }
    }
    if (!event.type) {
      console.error('Usage: node office-bridge.mjs --emit --type <type> [--from X] [--to Y] [--message "..."]')
      process.exit(1)
    }
    const result = emitToLog(event)
    console.log(JSON.stringify(result))
  }
}
