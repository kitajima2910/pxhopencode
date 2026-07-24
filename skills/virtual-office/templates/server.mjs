#!/usr/bin/env node

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRuntime } from './agent-runtime.mjs'
import { workflowStartSequence } from './hook-provider.mjs'
import { emit } from './emit-event.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = process.env.PXH_ROOT || path.resolve(__dirname, '..', '..', '..')
const PORT = process.env.PORT || 2910

// ─── Agent Runtime ─────────────────────────────────────────────
const runtime = createRuntime({ root: ROOT })

// ─── HTTP API only — no SSE, no static file serving ─
// VSCode extension uses postMessage bridge instead.

let prevState = null

// Periodic flush for batched updates
const flushInterval = setInterval(() => {
  runtime.flush()
}, 250)

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')

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

  // ── POST /emit: Raw events → runtime ──────────────────────────
  if (url.pathname === '/emit' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try {
        const event = JSON.parse(body)

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
          runtime.ingest(event)
          emit(event)
        }

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

  // ── GET /status: Server health ────────────────────────────────
  if (url.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      port: PORT,
      mode: 'VSCode Extension',
      runtime: {
        sessionActive: runtime.session.isActive,
        activeAgents: runtime.stateStore.getActiveAgentIds().length,
        events: runtime.eventStore.size,
      },
    }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found')
})

// ─── State file watcher ────────────────────────────────────────
const STATE_FILE = process.env.PXH_STATE || path.join(ROOT, '_shared', 'opencode-state.json')
const EVENTS_FILE = process.env.PXH_EVENTS || path.join(ROOT, '_shared', 'office-events.log')

try { fs.writeFileSync(EVENTS_FILE, ''); } catch {}
try { fs.writeFileSync(STATE_FILE, JSON.stringify({ state: 'idle' })); } catch {}

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
        prevState = 'idle'
      }

      if (st.state === 'workflow_start') {
        const seq = workflowStartSequence()
        for (const evt of seq) {
          runtime.ingest(evt)
        }
        console.log(`[Office] workflow:start from state file`)
      } else if (st.state === 'workflow_end') {
        runtime.session.end({ message: st.message || 'Workflow ended' })
        console.log(`[Office] workflow:end from state file`)
      }
    } catch {}
  })
} catch {}

// ─── Start Server ────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[PXH Office] API server on port ${PORT} (VSCode Extension mode)`)
})

// ─── Graceful Shutdown ──────────────────────────────────────────

function shutdown() {
  clearInterval(flushInterval)
  runtime.stop()
  server.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
