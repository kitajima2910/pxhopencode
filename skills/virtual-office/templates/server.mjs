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
let watcherWorkflowActive = false

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
          console.log(`[Office] First activity detected: ${tuiState} — triggering workflow_start`)
          emit({ type: 'workflow_start', message: 'User prompt submitted' })
          watcherWorkflowActive = true
        }

        // Determine event type: Mirror → tui_mirror, others → agent_state
        if (explicitAgent === 'pxh-opencode' && tuiState === 'Mirror' && customMsg) {
          emit({ type: 'tui_mirror', agent: 'pxh-opencode', message: customMsg })
        } else if (tuiState === 'idle') {
          if (watcherWorkflowActive) {
            watcherWorkflowActive = false
            emit({ type: 'workflow_end', message: 'Processing complete' })
          }
        } else {
          const agent = explicitAgent || STATE_MAP[tuiState] || 'pxh-expert'
          emit({ type: 'agent_state', agent, tuiState, message: customMsg || `${tuiState}...` })
        }

        prevState = tuiState === 'idle' ? 'idle' : tuiState

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

      // ── Explicit workflow_start ──
      if (st.state === 'workflow_start') {
        if (!watcherWorkflowActive) {
          watcherWorkflowActive = true
          console.log(`[Office] workflow:start from state file`)
          emit({ type: 'workflow_start', message: st.message || 'Workflow started' })
        }
        prevState = st.state
        return
      }

      // ── Explicit workflow_end ──
      if (st.state === 'workflow_end') {
        if (watcherWorkflowActive) {
          watcherWorkflowActive = false
          console.log(`[Office] workflow:end from state file`)
          emit({ type: 'workflow_end', message: st.message || 'Workflow ended' })
        }
        prevState = 'idle'
        runtime.session.end({ message: st.message || 'Workflow ended' })
        return
      }

      // ── pxh-opencode mirror (check BEFORE generic non-idle to avoid misclassification) ──
      if (st.agent === 'pxh-opencode' && st.state === 'Mirror' && st.message) {
        emit({ type: 'tui_mirror', agent: 'pxh-opencode', message: st.message })
        return
      }

      // ── Non-idle state transition (agent activity) ──
      if (st.state && st.state !== 'idle' && st.state !== prevState) {
        // First activity after idle → emit workflow_start
        if (prevState === null || prevState === 'idle' || !prevState) {
          watcherWorkflowActive = true
          console.log(`[Office] State file: first activity ${st.state}`)
          emit({ type: 'workflow_start', message: 'User prompt submitted' })
        }

        const agent = st.agent || STATE_MAP[st.state] || 'pxh-expert'
        emit({
          type: 'agent_state',
          agent,
          tuiState: st.state,
          message: st.message || `${st.state}...`,
        })
        prevState = st.state
        return
      }

      // ── Idle state → end workflow if active ──
      if (!st.state || st.state === 'idle') {
        if (prevState && prevState !== 'idle' && watcherWorkflowActive) {
          watcherWorkflowActive = false
          emit({ type: 'workflow_end', message: 'Processing complete' })
        }
        prevState = 'idle'
        return
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
  runtime.stop()
  server.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
