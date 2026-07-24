#!/usr/bin/env node

/**
 * Agent Runtime — Pixel Agents compatible state management layer.
 *
 * Architecture (mirroring Pixel Agents):
 *   Raw Events → HookProvider.normalizeEvent() → AgentRuntime → State Diffs → Renderer
 *
 * Design principles (from Pixel Agents):
 *   - Game state lives OUTSIDE any UI framework — updated imperatively
 *   - The runtime is provider-agnostic — works with any HookProvider
 *   - Renderer receives only typed ServerMessages, never raw events
 *   - Sub-agents are tracked separately linked to parent agents
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  AgentEventKind,
} from './messages.mjs'
import {
  AGENTS,
  getAgentMeta,
  getSignals,
  isReadingTool,
  normalizeEvent,
  workflowStartSequence,
} from './hook-provider.mjs'

const _MODULE_DIR = path.dirname(fileURLToPath(import.meta.url))

// ─── Constants ──────────────────────────────────────────────────
const WORK_IDLE_MS       = 8000
const CORE_IDLE_MS       = 20000
const GLOBAL_IDLE_MS     = 15000

const CORE_AGENTS = new Set(['pxh-help', 'pxh-pm'])

// ─── EventStore ─────────────────────────────────────────────────

class EventStore {
  constructor(filePath) {
    this._filePath = filePath || null
    this._events = []
    this._subscribers = []
  }

  append(event) {
    const entry = {
      id: this._events.length + 1,
      ...event,
      recordedAt: new Date().toISOString(),
    }
    this._events.push(entry)

    if (this._filePath) {
      try {
        fs.mkdirSync(path.dirname(this._filePath), { recursive: true })
        fs.appendFileSync(this._filePath, JSON.stringify(entry) + '\n')
      } catch {}
    }

    for (const fn of this._subscribers) {
      try { fn(entry) } catch {}
    }
  }

  subscribe(fn) {
    this._subscribers.push(fn)
    return () => {
      this._subscribers = this._subscribers.filter(f => f !== fn)
    }
  }

  getEvents(fromIndex = 0) {
    return this._events.slice(fromIndex)
  }

  get size() {
    return this._events.length
  }
}

// ─── AgentStateStore ────────────────────────────────────────────

class AgentStateStore {
  constructor() {
    this._states = {}
    this._subagents = {}   // parentToolId → { parentAgentId, label, status, agentId }
    this._onChange = null

    for (const id of Object.keys(AGENTS)) {
      this._states[id] = {
        agentId: id,
        currentState: 'idle',
        previousState: null,
        badge: '',
        message: '',
        active: false,
        atDesk: false,
        activeTool: null,
        awaitingInput: false,
        isReading: false,
        tier: AGENTS[id].tier,
        color: AGENTS[id].color,
        role: AGENTS[id].role,
      }
    }
  }

  onChange(fn) { this._onChange = fn }

  get(agentId) {
    return this._states[agentId] || null
  }

  getAll() {
    return { ...this._states }
  }

  getActiveAgentIds() {
    return Object.entries(this._states)
      .filter(([_, s]) => s.active)
      .map(([id]) => id)
  }

  /**
   * Get or create a sub-agent state.
   * Sub-agents are ephemeral spawned agents linked to a parent.
   */
  getOrCreateSubagent(parentAgentId, parentToolId, label) {
    const key = `${parentAgentId}:${parentToolId}`
    if (!this._subagents[key]) {
      this._subagents[key] = {
        agentId: `sub-${parentAgentId}-${parentToolId}`,
        parentAgentId,
        parentToolId,
        label: label || 'Sub-agent',
        status: 'running',
        createdAt: Date.now(),
      }
    }
    return this._subagents[key]
  }

  markSubagentDone(parentAgentId, parentToolId, reason) {
    const key = `${parentAgentId}:${parentToolId}`
    if (this._subagents[key]) {
      this._subagents[key].status = reason === 'completed' ? 'completed' : 'idle'
      this._subagents[key].completedAt = Date.now()
    }
  }

  getSubagents() {
    return { ...this._subagents }
  }

  update(agentId, patch) {
    const current = this._states[agentId]
    if (!current) return null

    const previous = { ...current }
    Object.assign(current, {
      previousState: current.currentState,
      ...patch,
    })

    const changed =
      previous.currentState !== current.currentState ||
      previous.active !== current.active ||
      previous.badge !== current.badge ||
      previous.message !== current.message ||
      previous.activeTool !== current.activeTool ||
      previous.awaitingInput !== current.awaitingInput

    if (changed && this._onChange) {
      try {
        this._onChange({
          agentId,
          previous: {
            currentState: previous.currentState,
            active: previous.active,
            badge: previous.badge,
            message: previous.message,
            activeTool: previous.activeTool,
          },
          current: {
            currentState: current.currentState,
            active: current.active,
            badge: current.badge,
            message: current.message,
            activeTool: current.activeTool,
          },
        })
      } catch {}
    }

    return current
  }

  snapshot() {
    return {
      agents: Object.fromEntries(
        Object.entries(this._states).map(([id, s]) => [id, { ...s }])
      ),
      subagents: { ...this._subagents },
      timestamp: Date.now(),
    }
  }

  diff(sessionState, changedAgentIds) {
    const agents = {}
    if (changedAgentIds) {
      for (const id of changedAgentIds) {
        const s = this._states[id]
        if (s) agents[id] = { ...s }
      }
    } else {
      // Include any non-idle agent
      for (const [id, s] of Object.entries(this._states)) {
        if (s.active || s.currentState !== 'idle') {
          agents[id] = { ...s }
        }
      }
    }

    // Only include subagents if there are any
    const subagents = Object.keys(this._subagents).length > 0
      ? { ...this._subagents }
      : undefined

    return {
      type: 'state.diff',
      session: sessionState ? { ...sessionState } : null,
      agents,
      subagents,
      timestamp: Date.now(),
    }
  }
}

// ─── SessionRouter ──────────────────────────────────────────────

class SessionRouter {
  constructor() {
    this._active = false
    this._phase = 'idle'
    this._workflow = '—'
    this._startTime = null
    this._sessionId = null
  }

  start(data) {
    this._active = true
    this._phase = 'Interface'
    this._workflow = '/vibe'
    this._startTime = data?.startTime || Date.now()
    this._sessionId = `session-${this._startTime}`
    return this.snapshot()
  }

  end(data) {
    this._active = false
    this._phase = 'idle'
    this._workflow = '—'
    const snap = this.snapshot()
    this._startTime = null
    return snap
  }

  setPhase(phase, workflow) {
    if (phase) this._phase = phase
    if (workflow) this._workflow = workflow
    return this.snapshot()
  }

  get isActive() { return this._active }
  get phase() { return this._phase }
  get workflow() { return this._workflow }

  snapshot() {
    return {
      active: this._active,
      phase: this._phase,
      workflow: this._workflow,
      startTime: this._startTime,
      sessionId: this._sessionId,
    }
  }
}

// ─── StateMachine ────────────────────────────────────────────────

class StateMachine {
  /**
   * Process a normalized AgentEvent and produce state transitions.
   * Returns: { agentPatches, sessionAction, signals, subagentEvents }
   */
  process(normalized) {
    const { event } = normalized
    if (!event || !event.kind) return { agentPatches: {}, sessionAction: null, signals: [], subagentEvents: [] }

    const patches = {}
    const signals = []
    const subagentEvents = []
    let sessionAction = null

    switch (event.kind) {

      case AgentEventKind.SESSION_START: {
        sessionAction = { action: 'start', data: event.data }
        // Activate T1 + T2 + PXHOpenCode
        patches['pxh-help'] = {
          currentState: 'typing', badge: 'Interface',
          message: '', active: true,
          atDesk: true, isReading: true,
        }
        patches['pxh-pm'] = {
          currentState: 'typing', badge: 'Orchestration',
          message: '', active: true,
          atDesk: true, isReading: true,
        }
        patches['pxh-opencode'] = {
          currentState: 'typing', badge: 'Synced',
          message: '', active: true,
          atDesk: true, isReading: true,
        }
        signals.push({ from: 'pxh-help', to: 'pxh-pm' })
        break
      }

      case AgentEventKind.SESSION_END: {
        sessionAction = { action: 'end', data: event.data }
        for (const id of Object.keys(AGENTS)) {
          patches[id] = {
            currentState: 'idle', badge: '', message: '',
            active: false, atDesk: false, activeTool: null,
            awaitingInput: false, isReading: false,
          }
        }
        break
      }

      case AgentEventKind.TOOL_START: {
        const { agentId, data } = event
        if (!agentId) break

        const animationState = data.isReading ? 'reading' : 'typing'

        patches[agentId] = {
          currentState: animationState,
          badge: data.badge || '',
          message: data.message || '',
          active: true,
          atDesk: true,
          activeTool: data.toolName || null,
          awaitingInput: false,
          isReading: data.isReading || false,
        }
        break
      }

      case AgentEventKind.TOOL_END: {
        const { agentId } = event
        if (!agentId) break
        patches[agentId] = {
          currentState: 'idle',
          badge: '',
          message: '',
          active: false,
          atDesk: false,
          activeTool: null,
          awaitingInput: false,
        }
        break
      }

      case AgentEventKind.TURN_END: {
        const { agentId, data } = event
        if (!agentId) break

        if (CORE_AGENTS.has(agentId)) break // T1/T2 don't leave individually

        patches[agentId] = {
          currentState: 'idle',
          badge: '',
          message: data?.message || '',
          active: false,
          atDesk: false,
          activeTool: null,
          awaitingInput: data?.awaitingInput || false,
        }
        break
      }

      case AgentEventKind.SUBAGENT_START: {
        const { agentId, data } = event
        if (!agentId) break

        // Parent agent is actively delegating
        patches[agentId] = {
          currentState: 'typing',
          badge: data.badge || 'Delegating',
          message: data.message || `Delegating to sub-agent`,
          active: true,
          atDesk: true,
          activeTool: 'task',
          isReading: false,
        }

        if (data.parentToolId) {
          subagentEvents.push({
            action: 'start',
            parentAgentId: agentId,
            parentToolId: data.parentToolId,
            label: data.message || 'Sub-agent',
          })
        }
        break
      }

      case AgentEventKind.SUBAGENT_END: {
        if (event.data?.parentToolId) {
          subagentEvents.push({
            action: 'end',
            parentAgentId: event.agentId,
            parentToolId: event.data.parentToolId,
            reason: event.data.reason || 'completed',
          })
        }
        break
      }

      case AgentEventKind.SUBAGENT_TURN_END: {
        // Sub-agent finished a turn but may continue working
        break
      }

      case AgentEventKind.SIGNAL: {
        const { from, to } = event.data || {}
        if (from && to) {
          signals.push({ from, to })
        }
        break
      }

      case AgentEventKind.HEARTBEAT:
        // No state change
        break
    }

    return { agentPatches: patches, sessionAction, signals, subagentEvents }
  }
}

// ─── AgentRuntime ───────────────────────────────────────────────

export class AgentRuntime {
  constructor(opts = {}) {
    const root = opts.root || process.cwd()
    const eventsPath = opts.eventsFile || path.join(root, '_shared', 'agent-events.log')

    this.eventStore   = new EventStore(eventsPath)
    this.stateStore   = new AgentStateStore()
    this.session      = new SessionRouter()
    this.stateMachine = new StateMachine()

    this._idleTimers  = {}
    this._globalTimer = null
    this._heartbeat   = null
    this._dirtyAgents = new Set()
    this._onDiff      = null
    this._onSignal    = null
    this._onSubagent  = null
    this._lastEventTime = 0

    this.stateStore.onChange((change) => {
      this._dirtyAgents.add(change.agentId)
    })
  }

  /**
   * Feed a raw event through the HookProvider → runtime pipeline.
   * @param {Object} rawEvent - Raw OpenCode event
   * @returns {Object|null} The normalized event, or null if ignored
   */
  ingest(rawEvent) {
    const normalized = normalizeEvent(rawEvent)
    if (!normalized) return null

    // Store both raw + normalized
    this.eventStore.append({ raw: rawEvent, normalized })

    const { agentPatches, sessionAction, signals, subagentEvents } =
      this.stateMachine.process(normalized)

    // Apply session changes
    if (sessionAction) {
      if (sessionAction.action === 'start') {
        this.session.start(normalized.event.data)
      } else if (sessionAction.action === 'end') {
        this.session.end(normalized.event.data)
      }
    }

    // Apply agent state patches
    for (const [agentId, patch] of Object.entries(agentPatches)) {
      this.stateStore.update(agentId, patch)
    }

    // Handle sub-agent events
    for (const subEvt of subagentEvents) {
      if (subEvt.action === 'start') {
        this.stateStore.getOrCreateSubagent(
          subEvt.parentAgentId,
          subEvt.parentToolId,
          subEvt.label
        )
        if (this._onSubagent) this._onSubagent(subEvt)
      } else if (subEvt.action === 'end') {
        this.stateStore.markSubagentDone(
          subEvt.parentAgentId,
          subEvt.parentToolId,
          subEvt.reason
        )
        if (this._onSubagent) this._onSubagent(subEvt)
      }
    }

    // Emit signals
    if (signals.length && this._onSignal) {
      for (const sig of signals) {
        this._onSignal(sig)
      }
    }

    // Manage idle timers
    this._lastEventTime = Date.now()
    this._startIdleTimers(normalized.event.kind, Object.keys(agentPatches))
    this._resetGlobalIdle()

    return normalized
  }

  /**
   * Subscribe to state diffs for the renderer.
   */
  onDiff(callback) { this._onDiff = callback }

  /**
   * Subscribe to signal events.
   */
  onSignal(callback) { this._onSignal = callback }

  /**
   * Subscribe to sub-agent events.
   */
  onSubagent(callback) { this._onSubagent = callback }

  /**
   * Flush pending state diffs to the renderer.
   */
  flush() {
    if (!this._onDiff) return

    const sessionSnap = this.session.snapshot()
    const dirty = this._dirtyAgents.size > 0
      ? [...this._dirtyAgents]
      : null

    if (dirty && dirty.length > 0) {
      const diff = this.stateStore.diff(sessionSnap, dirty)
      this._onDiff(diff)
      this._dirtyAgents.clear()
    }
  }

  /**
   * Get full snapshot for new renderer connections (replay).
   */
  getSnapshot() {
    return {
      type: 'state.snapshot',
      session: this.session.snapshot(),
      ...this.stateStore.snapshot(),
    }
  }

  startHeartbeat() {
    if (this._heartbeat) return
    this._heartbeat = setInterval(() => {
      if (Date.now() - this._lastEventTime > 30000) {
        if (this.session.isActive) {
          // Check if all agents are idle
          this._checkGlobalIdle()
        }
      }
    }, 5000)
  }

  stop() {
    if (this._heartbeat) {
      clearInterval(this._heartbeat)
      this._heartbeat = null
    }
    for (const t of Object.values(this._idleTimers)) {
      clearTimeout(t)
    }
    this._idleTimers = {}
    if (this._globalTimer) {
      clearTimeout(this._globalTimer)
      this._globalTimer = null
    }
  }

  // ─── Internal ──────────────────────────────────────────────────

  _startIdleTimers(eventKind, agentIds) {
    for (const agentId of agentIds) {
      const isCore = CORE_AGENTS.has(agentId)

      if (this._idleTimers[agentId]) {
        clearTimeout(this._idleTimers[agentId])
      }

      // Don't set idle timer for session lifecycle events
      if (eventKind === AgentEventKind.SESSION_START ||
          eventKind === AgentEventKind.SESSION_END ||
          eventKind === AgentEventKind.TURN_END) {
        continue
      }

      const delay = isCore ? CORE_IDLE_MS : WORK_IDLE_MS
      this._idleTimers[agentId] = setTimeout(() => {
        if (isCore) return

        this.stateStore.update(agentId, {
          currentState: 'idle',
          badge: '',
          message: '',
          active: false,
          atDesk: false,
          activeTool: null,
        })
        delete this._idleTimers[agentId]
      }, delay)
    }
  }

  _resetGlobalIdle() {
    if (this._globalTimer) {
      clearTimeout(this._globalTimer)
    }
    this._globalTimer = setTimeout(() => {
      this._checkGlobalIdle()
    }, GLOBAL_IDLE_MS)
  }

  _checkGlobalIdle() {
    const activeIds = this.stateStore.getActiveAgentIds()
    const stillActive = activeIds.filter(id => !CORE_AGENTS.has(id))

    if (stillActive.length === 0 && this.session.isActive) {
      this.session.end({ message: 'Processing complete' })
    }
  }
}

/**
 * Factory — creates and starts a runtime.
 */
export function createRuntime(opts = {}) {
  const runtime = new AgentRuntime(opts)
  runtime.startHeartbeat()
  return runtime
}
