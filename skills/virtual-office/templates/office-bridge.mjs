#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'

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
}
const WORK_IDLE_MS = 8000

function startIdleTimer(agent) {
  clearTimeout(state.idleTimers[agent])
  state.idleTimers[agent] = setTimeout(() => {
    emit({ type: 'agent_state', agent, tuiState: 'idle', message: '' })
    delete state.activeAgents[agent]
    delete state.idleTimers[agent]
  }, WORK_IDLE_MS)
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
  Code:  ['pxh-help','pxh-pm','pxh-architect','__MAIN__','pxh-qa','pxh-fix-bugs','pxh-review-code','pxh-devops','pxh-save-history'],
  Test:  ['pxh-qa','pxh-fix-bugs','pxh-review-code','pxh-save-history'],
  Debug: ['pxh-help','pxh-pm','pxh-fix-bugs','pxh-ui-ux','pxh-qa','pxh-review-code','pxh-devops','pxh-save-history'],
  Style: ['pxh-ui-ux'],
  UI:    ['pxh-ui-ux','pxh-review-code'],
  Doc:   ['pxh-save-history'],
  Config:['pxh-devops','pxh-pm'],
  Script:['pxh-devops'],
  Agent: ['pxh-pm'],
  Workflow:['pxh-pm','pxh-architect'],
  Skill: ['pxh-expert','pxh-pm'],
}
const AGENT_ROLES = {
  'pxh-help':   { tuiState: 'explore',   msg: '🔍 Classifying request...' },
  'pxh-pm':     { tuiState: 'delegating', msg: '📋 Routing workflow...' },
  'pxh-architect': { tuiState: 'explore', msg: '🏗️ Designing architecture...' },
  'pxh-qa':     { tuiState: 'testing',   msg: '🧪 Running tests...' },
  'pxh-fix-bugs': { tuiState: 'explore', msg: '🐛 Hunting bugs...' },
  'pxh-review-code': { tuiState: 'review', msg: '🔍 Reviewing code...' },
  'pxh-devops': { tuiState: 'execute',   msg: '⚙️ Building & deploying...' },
  'pxh-save-history': { tuiState: 'write', msg: '💾 Saving checkpoint...' },
  'pxh-ui-ux':  { tuiState: 'edit',      msg: '🎨 Designing interface...' },
  'pxh-expert': { tuiState: 'write',     msg: '✍️ Coding...' },
}

function createTaskSequence(cls) {
  const agents = WORKFLOW_PIPELINES[cls.action] || ['pxh-help','pxh-pm','__MAIN__']
  const seq = []
  agents.forEach(ag => {
    const name = ag === '__MAIN__' ? cls.agent : ag
    const role = AGENT_ROLES[name] || { tuiState: cls.action, msg: `${cls.action}...` }
    const msg = name === cls.agent ? `${cls.action}: ${cls.file}` : role.msg
    seq.push({ type: 'agent_state', agent: name, tuiState: role.tuiState, message: msg })
  })
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
      // Track all agents in the pipeline
      seq.forEach(evt => {
        activeNow[evt.agent] = true
      })
    } else {
      setTimeout(() => {
        emit({ type: 'agent_state', agent: c.agent, tuiState: 'update', message: `${c.action}: ${c.file}` })
      }, idx*300)
      activeNow[c.agent] = true
    }
  })

  // Start/reset idle timers for all active agents
  for (const ag of Object.keys(activeNow)) {
    startIdleTimer(ag)
  }
  state.activeAgents = activeNow
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

  const WATCH_EXT = new Set(['.ts','.tsx','.js','.jsx','.css','.md','.html','.json','.mjs'])
  const watchDirs = [
    rootDir, path.join(rootDir, 'skills'),
    path.join(rootDir, 'workflows'), path.join(rootDir, 'agents'),
    path.join(rootDir, '_shared'),
  ].filter(d => { try { return fs.statSync(d).isDirectory() } catch { return false } })

  // Use fs.watch for instant OS-level file change notifications
  const watchers = []
  let watchTimer = null

  watchDirs.forEach(dir => {
    try {
      const w = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if(!filename) return
        const ext = path.extname(filename).toLowerCase()
        if(!WATCH_EXT.has(ext)) return
        const full = path.join(dir, filename)
        // Skip ignored dirs
        const rel = path.relative(ROOT, full).replace(/\\/g, '/')
        const parts = rel.split('/')
        for(const p of parts){ if(EXCLUDE_DIRS.has(p)) return }
        if(isIgnored(full)) return

        // Instant debounce: batch rapid changes within 200ms
        clearTimeout(watchTimer)
        watchTimer = setTimeout(() => onFileChange('change', full), 100)
      })
      watchers.push(w)
    } catch {}
  })

  // Fallback polling every 5s for dirs where fs.watch fails
  let pollState = {}
  let pollReady = false
  const scanDirs = watchDirs
  function pollSnapshot(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for(const e of entries){
        const full = path.join(dir, e.name)
        if(e.name === '.' || e.name === '..') continue
        if(EXCLUDE_DIRS.has(e.name)) continue
        if(e.isDirectory()) pollSnapshot(full)
        else if(e.isFile() && WATCH_EXT.has(path.extname(e.name).toLowerCase())){
          const rel = path.relative(ROOT, full)
          try {
            const mtime = fs.statSync(full).mtimeMs
            if(pollReady && pollState[rel] !== mtime) onFileChange('change', full)
            pollState[rel] = mtime
          } catch {}
        }
      }
    } catch {}
  }
  for(const d of scanDirs) pollSnapshot(d)
  pollReady = true
  setInterval(() => { for(const d of scanDirs) pollSnapshot(d) }, 1000)

  startHeartbeat()

  setTimeout(() => {
    emit({
      type: 'agent_status', from: 'pxh-office',
      message: `Bridge watching ${watchDirs.length} dirs (fs.watch + poll fallback)`,
    })
  }, 500)

  return { emit, watchers }
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
