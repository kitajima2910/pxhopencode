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
        const count = opts.count || 1
        const results = []
        const pipeline = [
          { type:'phase_change', phase:'Tiếp nhận', workflow:opts.workflow||'/vibe', from:'pxh-help', to:'pxh-pm', tier_from:'T0', tier_to:'T1', message:'✓ Prompt validated & classified' },
          { type:'phase_change', phase:'Điều phối', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-pm', tier_from:'T1', tier_to:'T2', message:'→ Route: workflow selected' },
          { type:'task_start', phase:'Thiết kế', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-architect', tier_from:'T2', tier_to:'T3', message:'→ Task{design} → pxh-architect' },
          { type:'task_end', status:'success', from:'pxh-architect', to:'pxh-pm', tier_from:'T3', tier_to:'T2', message:'✓ Schema + API designed' },
          { type:'task_start', phase:'Code', workflow:opts.workflow||'/vibe', from:'pxh-pm', to:'pxh-expert', tier_from:'T2', tier_to:'T3', message:'→ Task{code} → pxh-expert' },
          { type:'task_end', status:'success', from:'pxh-expert', to:'pxh-pm', tier_from:'T3', tier_to:'T2', message:'✓ Implementation done' },
          { type:'task_start', phase:'Kiểm thử', from:'pxh-pm', to:'pxh-qa', tier_from:'T2', tier_to:'T3', message:'→ Task{test} → pxh-qa' },
          { type:'task_end', status:'success', from:'pxh-qa', to:'pxh-pm', tier_from:'T3', tier_to:'T2', message:'✓ 12/12 tests pass' },
          { type:'task_start', phase:'Sửa lỗi', from:'pxh-pm', to:'pxh-fix-bugs', tier_from:'T2', tier_to:'T3', message:'→ Task{fix} → pxh-fix-bugs' },
          { type:'task_end', status:'success', from:'pxh-fix-bugs', to:'pxh-pm', tier_from:'T3', tier_to:'T2', message:'✓ 0 issues found' },
          { type:'task_start', phase:'Rà soát', from:'pxh-pm', to:'pxh-review-code', tier_from:'T2', tier_to:'T3', message:'→ Task{review} → pxh-review-code' },
          { type:'task_end', status:'success', from:'pxh-review-code', to:'pxh-pm', tier_from:'T3', tier_to:'T2', message:'✓ Security + perf OK' },
          { type:'task_start', phase:'Phát hành', from:'pxh-pm', to:'pxh-devops', tier_from:'T2', tier_to:'T3', message:'→ Task{build} → pxh-devops' },
          { type:'task_end', status:'success', from:'pxh-devops', to:'pxh-pm', tier_from:'T3', tier_to:'T2', message:'✓ Build success' },
          { type:'task_end', status:'success', from:'pxh-save-history', to:'pxh-pm', tier_from:'T4', tier_to:'T2', message:'✓ Session checkpoint saved' },
        ]
        for(let i = 0; i < count; i++){
          for(const evt of pipeline){
            const entry = emit(evt)
            results.push(entry)
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status:'ok', pipeline: pipeline.length, cycles: count, emitted: results.length }))
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

server.listen(PORT, () => {
  console.log(`\n  \x1b[36m\u250C\u2500 V\u0103n Ph\xf2ng \u1ea2o Server \u2500\u2510\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Web:  \x1b[1mhttp://localhost:${PORT}\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  SSE:  \x1b[1mhttp://localhost:${PORT}/events\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  POST: \x1b[1mhttp://localhost:${PORT}/emit\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Mode: \x1b[32mReal-time sync\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Bridge: \x1b[${bridgeActive ? '32m\u2713 Active' : '33m\u2717 Disabled'}\x1b[0m`)
  console.log(`  \x1b[36m\u251C\u2500\x1b[0m  Sim:  \x1b[1mhttp://localhost:${PORT}/simulate\x1b[0m (POST — mô phỏng pipeline TUI)`)
  console.log(`  \x1b[36m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\x1b[0m\n`)

  emit({ type: 'agent_status', from: 'pxh-office', message: `Server + Bridge started. Watching ${bridgeActive ? 'workspace activity' : 'for events...'}` })
})
