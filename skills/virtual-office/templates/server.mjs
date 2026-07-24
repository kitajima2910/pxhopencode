#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRuntime } from './agent-runtime.mjs'
import { workflowStartSequence } from './hook-provider.mjs'
import { AgentEventKind } from './messages.mjs'
import { emit } from './emit-event.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = process.env.PXH_ROOT || path.resolve(__dirname, '..', '..', '..')
const PORT = process.env.PORT || 2910
const NO_BRIDGE = process.argv.includes('--no-bridge')

// ─── Agent Runtime ─────────────────────────────────────────────
const runtime = createRuntime({ root: ROOT })

// ─── SSE Clients ────────────────────────────────────────────────
let clients = []

function broadcast(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach(res => {
    try { res.write(msg) } catch {}
  })
}

// Bridge: auto-detect workspace activity → push to runtime
let bridgeActive = false
try {
  const { startBridge } = await import('./office-bridge.mjs')
  if (!NO_BRIDGE) {
    startBridge({
      root: ROOT,
      onEvent: (rawEvent) => {
        runtime.ingest(rawEvent)
      },
    })
    bridgeActive = true
  }
} catch { bridgeActive = false }

// ─── State Diff Flush ──────────────────────────────────────────
// Runtime produces diffs; broadcast them to SSE clients at interval
let prevState = null
let workflowActive = false

runtime.onDiff((diff) => {
  // Track workflow lifecycle for backwards compat
  if (diff.session) {
    if (diff.session.active && !workflowActive) {
      workflowActive = true
      broadcast({ type: 'workflow_start', message: 'User prompt submitted', ts: new Date().toISOString() })
    } else if (!diff.session.active && workflowActive) {
      workflowActive = false
      broadcast({ type: 'workflow_end', message: 'Processing complete', ts: new Date().toISOString() })
    }
  }
  broadcast(diff)
})

runtime.onSignal((signal) => {
  broadcast({ type: 'contract', from: signal.from, to: signal.to, message: `${signal.from} → ${signal.to}` })
})

// Periodic flush for batched updates
const flushInterval = setInterval(() => {
  runtime.flush()
}, 250)

// ─── HTTP Server ────────────────────────────────────────────────

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

  // ── SSE: State diffs + replay ─────────────────────────────────
  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    // Send full snapshot on connect for replay
    const snapshot = runtime.getSnapshot()
    res.write(`data: ${JSON.stringify(snapshot)}\n\n`)

    // Confirm connection
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\n\n`)

    clients.push(res)
    req.on('close', () => {
      clients = clients.filter(c => c !== res)
    })
    return
  }

  // ── POST /state: TUI state file → runtime ─────────────────────
  if (url.pathname === '/state' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const { state: tuiState, agent: explicitAgent, message: customMsg } = JSON.parse(body || '{}')
        if (!tuiState) throw new Error('Missing "state" field')

        // Handle workflow lifecycle detection
        if ((prevState === null || prevState === 'idle' || !prevState) && tuiState && tuiState !== 'idle') {
          console.log(`[Office] First activity detected: ${tuiState} — triggering T1+T2+PXHOpenCode`)
          const seq = workflowStartSequence()
          for (const evt of seq) {
            runtime.ingest(evt)
          }
        }

        // Feed through adapter + runtime
        const rawEvent = {
          type: 'agent_state',
          agent: explicitAgent || undefined,
          tuiState,
          message: customMsg || `${tuiState}...`,
        }
        runtime.ingest(rawEvent)

        if (tuiState === 'idle') {
          prevState = 'idle'
          runtime.session.end({ message: 'Processing complete' })
        } else {
          prevState = tuiState
        }

        // Flush immediately for instant updates
        runtime.flush()

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', state: tuiState }))
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  // ── POST /emit: Raw events → adapter → runtime ────────────────
  if (url.pathname === '/emit' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const event = JSON.parse(body)

        // Handle workflow lifecycle (compat)
        if (event.type === 'workflow_start') {
          console.log(`[Office] workflow:start — User submitted prompt`)
          const seq = workflowStartSequence()
          for (const evt of seq) {
            runtime.ingest(evt)
          }
          emit({ type: 'workflow_start', message: event.message || 'Workflow started' })
          runtime.flush()
        } else if (event.type === 'workflow_end') {
          console.log(`[Office] workflow:end — Session finished`)
          runtime.session.end({ message: event.message || 'Workflow ended' })
          emit({ type: 'workflow_end' })
          runtime.flush()
        } else {
          // Feed through adapter → runtime
          runtime.ingest(event)
          emit(event)
        }

        // Flush immediately for instant updates
        runtime.flush()

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok' }))
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  // ── POST /simulate: Deprecated ────────────────────────────────
  if (url.pathname === '/simulate' && req.method === 'POST') {
    res.writeHead(410, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'simulate deprecated. Use /emit or /state for real events only.' }))
    return
  }

  // ── GET /status: Server health ────────────────────────────────
  if (url.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      clients: clients.length,
      mode: 'SSE',
      bridge: bridgeActive,
      runtime: {
        sessionActive: runtime.session.isActive,
        activeAgents: runtime.stateStore.getActiveAgentIds().length,
        events: runtime.eventStore.size,
      },
    }))
    return
  }

  // ── Static file serving ───────────────────────────────────────
  let filePath = url.pathname === '/' ? '/office.html' : url.pathname
  filePath = path.resolve(__dirname, '.' + filePath.replace(/\\/g, '/'))
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

// ─── State file watcher (compat) ────────────────────────────────
const STATE_FILE = process.env.PXH_STATE || path.join(ROOT, '_shared', 'opencode-state.json')
const EVENTS_FILE = process.env.PXH_EVENTS || path.join(ROOT, '_shared', 'office-events.log')

if (!NO_BRIDGE) {
  try { fs.writeFileSync(EVENTS_FILE, ''); } catch {}
  try { fs.writeFileSync(STATE_FILE, JSON.stringify({ state: 'idle' })); } catch {}
}

const startedAt = Date.now()
function isStartupGrace() { return Date.now() - startedAt < 3000 }

try {
  fs.watchFile(STATE_FILE, { interval: 200 }, () => {
    try {
      if (!fs.existsSync(STATE_FILE)) return
      const raw = fs.readFileSync(STATE_FILE, 'utf-8')
      const st = JSON.parse(raw)

      if (isStartupGrace()) {
        prevState = st.state || 'idle'
        return
      }

      if (st.state && st.state !== 'idle' && st.state !== prevState) {
        if (prevState === null || prevState === 'idle' || !prevState) {
          console.log(`[Office] State file: first activity ${st.state}`)
          const seq = workflowStartSequence()
          for (const evt of seq) {
            runtime.ingest(evt)
          }
        }

        const rawEvent = {
          type: 'agent_state',
          agent: st.agent || undefined,
          tuiState: st.state,
          message: st.message || `${st.state}...`,
        }
        runtime.ingest(rawEvent)
        prevState = st.state
      } else if (st.agent === 'pxh-opencode' && st.state === 'Mirror' && st.message) {
        runtime.ingest({ type: 'tui_mirror', agent: 'pxh-opencode', message: st.message })
      } else if (!st.state || st.state === 'idle') {
        if (prevState !== 'idle' && workflowActive) {
          runtime.session.end({ message: 'Processing complete' })
        }
        prevState = 'idle'
      }

      if (st.state === 'workflow_start' && !workflowActive) {
        const seq = workflowStartSequence()
        for (const evt of seq) {
          runtime.ingest(evt)
        }
        console.log(`[Office] workflow:start from state file`)
      } else if (st.state === 'workflow_end' && workflowActive) {
        runtime.session.end({ message: st.message || 'Workflow ended' })
        console.log(`[Office] workflow:end from state file`)
      }
    } catch {}
  })
} catch {}

// ─── Start Server ────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n  \x1b[36m\u250C\u2500 Error404Labs - PXH2910 \u2500\u2510\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Web:  \x1b[1mhttp://localhost:${PORT}\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  SSE:  \x1b[1mhttp://localhost:${PORT}/events\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  POST: \x1b[1mhttp://localhost:${PORT}/emit\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Mode: \x1b[32mReal-time sync\x1b[0m`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Arch: \x1b[35mPixel Agents\x1b[0m (adapter → runtime → renderer)`)
  console.log(`  \x1b[36m\u2502\x1b[0m  Bridge: \x1b[${bridgeActive ? '32m\u2713 Active' : '33m\u2717 Disabled'}\x1b[0m`)
  console.log(`  \x1b[36m\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\x1b[0m\n`)

  if (!NO_BRIDGE) {
    emit({ type: 'agent_status', from: 'pxh-office', message: 'Server started. Pixel Agents architecture active.' })
  }
})

// ─── Graceful Shutdown ──────────────────────────────────────────

function shutdown() {
  clearInterval(flushInterval)
  runtime.stop()
  clients.forEach(c => { try { c.end() } catch {} })
  server.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
