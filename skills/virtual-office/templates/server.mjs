#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { emit } from './emit-event.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..', '..')
const EVENTS_FILE = process.env.PXH_EVENTS || path.join(ROOT, '_shared', 'office-events.log')
const PORT = process.env.PORT || 2910
const NO_BRIDGE = process.argv.includes('--no-bridge')

let clients = []
let lastEventsSize = 0
// Workflow lifecycle tracking
let workflowActive = false
let workflowStartTime = null

function readNewEvents() {
  try {
    if (!fs.existsSync(EVENTS_FILE)) return []
    const stats = fs.statSync(EVENTS_FILE)
    if (stats.size < lastEventsSize) lastEventsSize = 0
    if (stats.size <= lastEventsSize) return []
    const fd = fs.openSync(EVENTS_FILE, 'r')
    const buf = Buffer.alloc(stats.size - lastEventsSize)
    fs.readSync(fd, buf, 0, buf.length, lastEventsSize)
    fs.closeSync(fd)
    lastEventsSize = stats.size
    return buf.toString().split('\n').filter(Boolean).map(l => JSON.parse(l))
  } catch { return [] }
}

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach(res => {
    try { res.write(msg) } catch {}
  })
}

// Bridge: auto-detect workspace activity → broadcast to SSE
let bridgeActive = false
try {
  const { startBridge } = await import('./office-bridge.mjs')
  if (!NO_BRIDGE) {
    startBridge({ root: ROOT, onEvent: broadcast })
    bridgeActive = true
  }
} catch { bridgeActive = false }

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`)
    clients.push(res)
    req.on('close', () => {
      clients = clients.filter(c => c !== res)
    })
    return
  }

  if (url.pathname === '/state' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const { state: tuiState, agent: explicitAgent, message: customMsg } = JSON.parse(body || '{}')
        if(!tuiState) throw new Error('Missing "state" field')
        // Map TUI state to agent
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
          workflow_start: 'pxh-opencode',
        }
        const agent = explicitAgent || STATE_MAP[tuiState] || 'pxh-expert'
        // Auto-trigger T1+T2+PXHOpenCode on first activity (workflow:start)
        if((prevState === null || prevState === 'idle' || !prevState) && tuiState && tuiState !== 'idle'){
          console.log(`[Office] First activity detected: ${tuiState} — triggering T1+T2+PXHOpenCode`)
          if (!workflowActive) {
            workflowActive = true
            workflowStartTime = new Date()
            broadcast({ type: 'workflow_start', message: 'User prompt submitted', ts: workflowStartTime.toISOString() })
          }
          broadcast({ type: 'agent_state', agent: 'pxh-help', tuiState: 'Interface', message: '🔍 Validate & classify input' })
          broadcast({ type: 'agent_state', agent: 'pxh-pm', tuiState: 'Orchestration', message: '📋 Route & enforce policy' })
          broadcast({ type: 'agent_state', agent: 'pxh-opencode', tuiState: 'Synced', message: 'Thinking: initializing OpenCode session...' })
          prevState = tuiState
        }
        const event = {
          type: 'agent_state',
          agent, tuiState,
          message: customMsg || `${tuiState}...`,
        }
        console.log(`[Office] State: ${tuiState} → agent: ${agent}`)
        emit(event)
        // Also direct broadcast for instant update
        broadcast(event)
        if(tuiState === 'idle') {
          prevState = 'idle'
          if (workflowActive) {
            workflowActive = false
            broadcast({ type: 'workflow_end', message: 'Processing complete', ts: new Date().toISOString() })
            console.log(`[Office] workflow:end — Processing complete`)
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status:'ok', agent, state: tuiState }))
      } catch(e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  if (url.pathname === '/emit' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const event = JSON.parse(body)

        // Handle workflow lifecycle events
        if (event.type === 'workflow_start') {
          workflowActive = true
          workflowStartTime = new Date(event.ts || Date.now())
          console.log(`[Office] workflow:start — User submitted prompt`)
          // Broadcast immediately to all SSE clients
          broadcast({
            type: 'workflow_start',
            message: event.message || 'Workflow started',
            ts: workflowStartTime.toISOString(),
          })
          // Also auto-trigger T1+T2
          broadcast({ type: 'agent_state', agent: 'pxh-help', tuiState: 'Interface', message: '🔍 Validate & classify input' })
          broadcast({ type: 'agent_state', agent: 'pxh-pm', tuiState: 'Orchestration', message: '📋 Route & enforce policy' })
          // PXHOpenCode active
          broadcast({ type: 'agent_state', agent: 'pxh-opencode', tuiState: 'Synced', message: 'Thinking: initializing OpenCode session...' })
          console.log(`[Office] T1+T2 auto-triggered, PXHOpenCode activated`)
          prevState = 'Interface' // Mark as active so subsequent /state calls don't re-trigger
        } else if (event.type === 'workflow_end') {
          workflowActive = false
          workflowStartTime = null
          console.log(`[Office] workflow:end — Session finished`)
          broadcast({
            type: 'workflow_end',
            message: event.message || 'Workflow ended',
            ts: new Date().toISOString(),
          })
          prevState = 'idle'
        }

        const result = emit(event)
        broadcast(event)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  if (url.pathname === '/simulate' && req.method === 'POST') {
    // Deprecated: simulation mode removed per event-driven architecture
    // Use real event stream via /emit or /state instead
    res.writeHead(410, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error:'simulate deprecated. Use /emit or /state for real events only.' }))
    return
  }

  if (url.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      clients: clients.length,
      eventsFile: EVENTS_FILE,
      eventsFileExists: fs.existsSync(EVENTS_FILE),
      mode: 'SSE',
      bridge: bridgeActive,
    }))
    return
  }

  let filePath = url.pathname === '/' ? '/office.html' : url.pathname
  filePath = path.resolve(__dirname, '.' + filePath.replace(/\\/g,'/'))
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return }

  try {
    const ext = path.extname(filePath)
    const content = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(content)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
})

try {
  fs.watchFile(EVENTS_FILE, { interval: 100 }, () => {
    const events = readNewEvents()
    events.forEach(e => broadcast(e))
  })
} catch {}

// Watch state file for real-time opencode state sync (polling for Windows compat)
const STATE_FILE = process.env.PXH_STATE || path.join(ROOT, '_shared', 'opencode-state.json')
// Clear stale state from previous session — office starts fresh
try { fs.writeFileSync(EVENTS_FILE, ''); } catch {}
try { fs.writeFileSync(STATE_FILE, JSON.stringify({ state: 'idle' })); } catch {}
let prevState = null
let prevAgent = null
try {
  fs.watchFile(STATE_FILE, { interval: 200 }, () => {
    try {
      if(!fs.existsSync(STATE_FILE)) return
      const raw = fs.readFileSync(STATE_FILE, 'utf-8')
      const st = JSON.parse(raw)
      if(st.state && st.state !== 'idle' && st.state !== prevState){
        // Detect initial activity: T1+T2+PXHOpenCode sit at desk immediately
        if(prevState === null || prevState === 'idle' || !prevState){
          console.log(`[Office] State file: first activity ${st.state} — triggering T1+T2+PXHOpenCode`)
          if (!workflowActive) {
            workflowActive = true
            workflowStartTime = new Date()
            broadcast({ type: 'workflow_start', message: 'User prompt submitted', ts: workflowStartTime.toISOString() })
          }
          broadcast({ type: 'agent_state', agent: 'pxh-help', tuiState: 'Interface', message: '🔍 Validate & classify input' })
          broadcast({ type: 'agent_state', agent: 'pxh-pm', tuiState: 'Orchestration', message: '📋 Route & enforce policy' })
          broadcast({ type: 'agent_state', agent: 'pxh-opencode', tuiState: 'Synced', message: 'Thinking: initializing OpenCode session...' })
        }
        broadcast({
          type: 'agent_state',
          agent: st.agent || 'pxh-expert',
          tuiState: st.state,
          message: st.message || `${st.state}...`,
        })
        prevState = st.state
        prevAgent = st.agent
      } else if(st.agent === 'pxh-opencode' && st.state === 'Mirror' && st.message){
        // Mirror: always broadcast each line for PXHOpenCode
        broadcast({ type: 'tui_mirror', agent: 'pxh-opencode', message: st.message })
      } else if(!st.state || st.state === 'idle'){
        if (prevState !== 'idle' && workflowActive) {
          workflowActive = false
          broadcast({ type: 'workflow_end', message: 'Processing complete', ts: new Date().toISOString() })
          console.log(`[Office] workflow:end — processing complete (state file idle)`)
        }
        prevState = 'idle'
        prevAgent = null
      }
      // Handle workflow_start / workflow_end from state file
      if (st.state === 'workflow_start') {
        if (!workflowActive) {
          workflowActive = true
          workflowStartTime = new Date()
          broadcast({ type: 'workflow_start', message: st.message || 'Workflow started', ts: workflowStartTime.toISOString() })
          console.log(`[Office] workflow:start from state file`)
        }
      } else if (st.state === 'workflow_end') {
        if (workflowActive) {
          workflowActive = false
          broadcast({ type: 'workflow_end', message: st.message || 'Workflow ended', ts: new Date().toISOString() })
          console.log(`[Office] workflow:end from state file`)
        }
      }
    } catch {}
  })
} catch {}

server.listen(PORT, () => {
  console.log(`\n  \x1b[36m\u250C\u2500 Error404Labs - PXH2910 \u2500\u2510\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Web:  \x1b[1mhttp://localhost:${PORT}\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  SSE:  \x1b[1mhttp://localhost:${PORT}/events\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  POST: \x1b[1mhttp://localhost:${PORT}/emit\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Mode: \x1b[32mReal-time sync\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Bridge: \x1b[${bridgeActive ? '32m\u2713 Active' : '33m\u2717 Disabled'}\x1b[0m`)
  console.log(`  \x1b[36m\u251C\u2500\x1b[0m  Sim:  \x1b[1mhttp://localhost:${PORT}/simulate\x1b[0m (POST — mô phỏng pipeline TUI)`)
  console.log(`  \x1b[36m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\x1b[0m\n`)

  emit({ type: 'agent_status', from: 'pxh-office', message: 'Server started. Ready for real event stream.' })
})
