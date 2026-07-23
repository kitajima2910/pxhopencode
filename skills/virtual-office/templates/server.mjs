#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { emit } from './emit-event.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..', '..')
const EVENTS_FILE = process.env.PXH_EVENTS || path.join(ROOT, '_shared', 'office-events.log')
const PORT = process.env.PORT || 3000
const NO_BRIDGE = process.argv.includes('--no-bridge')

let clients = []
let lastEventsSize = 0

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
        }
        const agent = explicitAgent || STATE_MAP[tuiState] || 'pxh-expert'
        const event = {
          type: 'agent_state',
          agent, tuiState,
          message: customMsg || `${tuiState}...`,
        }
        emit(event)
        // Also direct broadcast for instant update
        broadcast(event)
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
        const result = emit(event)
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
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const opts = body ? JSON.parse(body) : {}
        const count = Math.max(1, parseInt(opts.count) || 1)
        const batch = opts.batch || false
        const pipeline = [
          { type:'phase_change', phase:'Tiếp nhận', workflow:opts.workflow||'/vibe', from:'pxh-help', to:'pxh-pm', tier_from:'T0', tier_to:'T1', message:'→ Prompt received at help desk' },
          { type:'phase_change', phase:'Điều phối', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-pm', tier_from:'T1', tier_to:'T2', message:'→ CEO - PXH routing tasks...' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-help', to:'pxh-pm', tier_from:'T1', tier_to:'T2', message:'→ Điều phối & quản lý task' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-help', tier_from:'T2', tier_to:'T1', message:'→ Validate & classify input' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-architect', tier_from:'T2', tier_to:'T3', message:'→ Thiết kế architecture' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-expert', tier_from:'T2', tier_to:'T3', message:'→ Viết code implementation' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-qa', tier_from:'T2', tier_to:'T3', message:'→ Viết & chạy tests' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-fix-bugs', tier_from:'T2', tier_to:'T3', message:'→ Debug & fix issues' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-review-code', tier_from:'T2', tier_to:'T3', message:'→ Review code quality' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-devops', tier_from:'T2', tier_to:'T3', message:'→ Build & deploy' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-ui-ux', tier_from:'T2', tier_to:'T3', message:'→ Thiết kế UI/UX' },
          { type:'task_start', phase:'Làm việc', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-save-history', tier_from:'T2', tier_to:'T4', message:'→ Lưu trữ session & logs' },
        ]
        if(batch){
          // Batch mode: all agents start together, then all finish together
          const starts = pipeline.filter(e => e.type === 'task_start')
          emit({ type:'phase_change', phase:'Bắt đầu', workflow:opts.workflow||'/vibe', from:'pxh-help', to:'pxh-pm', tier_from:'T0', tier_to:'T1', message:'→ All agents: bắt đầu làm việc!' })
          let delay = 400
          // All task_start staggered by 200ms
          starts.forEach((evt, i) => {
            setTimeout(() => emit(evt), delay + i * 200)
          })
          delay += starts.length * 200 + 3000
          // Auto-generate task_end for each agent
          starts.forEach((evt, i) => {
            setTimeout(() => emit({
              type: 'task_end', status: 'success',
              from: evt.to, to: 'pxh-pm',
              tier_from: evt.tier_to, tier_to: 'T2',
              message: `✓ ${evt.to} hoàn thành`,
            }), delay + i * 150)
          })
          delay += starts.length * 150 + 500
          // Final phase: all done
          setTimeout(() => emit({
            type: 'agent_status', from: 'pxh-office',
            message: '🏁 Tất cả agents đã hoàn thành!',
          }), delay)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status:'ok', batch: true, agents: starts.length, emitted: starts.length * 2 + 2 }))
        } else if(count > 1){
          const results = []
          for(let i = 0; i < count; i++){
            for(const evt of pipeline) results.push(emit(evt))
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status:'ok', pipeline: pipeline.length, cycles: count, emitted: results.length }))
        } else {
          let delay = 0
          pipeline.forEach(evt => {
            setTimeout(() => emit(evt), delay)
            delay += 800
          })
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ status:'ok', pipeline: pipeline.length, cycles: 1, emitted: pipeline.length, staged: true }))
        }
      } catch(e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
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
  filePath = path.join(__dirname, filePath)

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
  fs.watchFile(EVENTS_FILE, { interval: 200 }, () => {
    const events = readNewEvents()
    events.forEach(e => broadcast(e))
  })
} catch {}

// Watch state file for real-time opencode state sync
const STATE_FILE = process.env.PXH_STATE || path.join(ROOT, '_shared', 'opencode-state.json')
let stateWatcher = null
try {
  if(fs.existsSync(STATE_FILE) || true){
    stateWatcher = fs.watch(path.dirname(STATE_FILE), (eventType, filename) => {
      if(filename !== 'opencode-state.json') return
      try {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8')
        const st = JSON.parse(raw)
        if(st.state){
          const event = {
            type: 'agent_state',
            agent: st.agent || 'pxh-expert',
            tuiState: st.state,
            message: st.message || `${st.state}...`,
          }
          broadcast(event)
        }
      } catch {}
    })
  }
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

  emit({ type: 'agent_status', from: 'pxh-office', message: `Server + Bridge started. Watching ${bridgeActive ? 'workspace activity' : 'for events...'}` })
})
