#!/usr/bin/env node

/**
 * OpenCode Adapter — converts raw OpenCode events into normalized AgentEvent format.
 * Virtual Office rendering layer must NOT know about OpenCode protocol.
 * This adapter is the single source of truth for event normalization.
 */

// Agent definitions — canonical source shared with runtime
const AGENTS = {
  'pxh-help':        { tier: 'T1', role: 'Help Desk',      color: '#58a6ff' },
  'pxh-pm':          { tier: 'T2', role: 'CEO PXH',        color: '#d29922' },
  'pxh-architect':   { tier: 'T3', role: 'Architect',      color: '#bc8cff' },
  'pxh-expert':      { tier: 'T3', role: 'Developer',      color: '#3fb950' },
  'pxh-fix-bugs':    { tier: 'T3', role: 'Bug Hunter',     color: '#f85149' },
  'pxh-qa':          { tier: 'T3', role: 'QA Engineer',    color: '#3fb950' },
  'pxh-review-code': { tier: 'T3', role: 'Reviewer',       color: '#d29922' },
  'pxh-devops':      { tier: 'T3', role: 'DevOps',         color: '#58a6ff' },
  'pxh-ui-ux':       { tier: 'T3', role: 'UI/UX Designer', color: '#f85149' },
  'pxh-save-history':{ tier: 'T4', role: 'Historian',      color: '#bc8cff' },
  'pxh-opencode':    { tier: 'T3', role: 'PXHOpenCode',    color: '#00e5ff' },
}

const AGENT_ROLES = {
  'pxh-help':   { badge: 'Interface',     tierLabel: 'T1 Interface' },
  'pxh-pm':     { badge: 'Orchestration', tierLabel: 'T2 Orchestration' },
  'pxh-architect': { badge: 'Design',    tierLabel: 'T3 Design' },
  'pxh-expert': { badge: 'Code',          tierLabel: 'T3 Code' },
  'pxh-fix-bugs': { badge: 'Debug',       tierLabel: 'T3 Debug' },
  'pxh-qa':     { badge: 'Test',          tierLabel: 'T3 Test' },
  'pxh-review-code': { badge: 'Review',   tierLabel: 'T3 Review' },
  'pxh-devops': { badge: 'Build',         tierLabel: 'T3 Build' },
  'pxh-save-history': { badge: 'Infrastructure', tierLabel: 'T4 Infrastructure' },
  'pxh-ui-ux':  { badge: 'Design',        tierLabel: 'T3 Design' },
  'pxh-office': { badge: 'Virtual Office', tierLabel: 'Virtual' },
  'pxh-opencode': { badge: 'Synced',      tierLabel: 'TUI Mirror' },
}

// Maps raw TUI states to agents
const STATE_AGENT_MAP = {
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

// Signal relationships between agents (who sends to whom)
const SIGNAL_MAP = {
  'pxh-help':          ['pxh-pm'],
  'pxh-pm':            ['pxh-architect','pxh-expert','pxh-fix-bugs','pxh-qa','pxh-review-code','pxh-devops','pxh-ui-ux'],
  'pxh-architect':     ['pxh-pm'],
  'pxh-expert':        ['pxh-pm'],
  'pxh-fix-bugs':      ['pxh-expert','pxh-qa','pxh-pm'],
  'pxh-qa':            ['pxh-expert','pxh-pm'],
  'pxh-review-code':   ['pxh-expert','pxh-pm'],
  'pxh-devops':        ['pxh-architect','pxh-pm'],
  'pxh-ui-ux':         ['pxh-expert'],
  'pxh-save-history':  ['pxh-pm'],
}

/**
 * Normalize a raw event from any source into an AgentEvent.
 *
 * Input: raw OpenCode event (from /emit, /state, file watcher, bridge, etc.)
 * Output: normalized AgentEvent | null (null = unrecognized, skip)
 *
 * AgentEvent format:
 * {
 *   type: "agent.state.changed" | "session.started" | "session.ended" |
 *         "signal.sent" | "agent.idle" | "tui.mirror",
 *   agentId: string,
 *   data: { ... } — type-specific payload
 *   timestamp: number
 * }
 */
export function normalize(openCodeEvent) {
  if (!openCodeEvent || !openCodeEvent.type) return null

  const now = Date.now()
  const ts = typeof openCodeEvent.ts === 'string'
    ? new Date(openCodeEvent.ts).getTime()
    : (openCodeEvent.ts || now)

  switch (openCodeEvent.type) {

    // ─── Workflow lifecycle ───────────────────────────────────────
    case 'workflow_start':
      return {
        type: 'session.started',
        data: {
          message: openCodeEvent.message || 'User prompt submitted',
        },
        timestamp: ts,
      }

    case 'workflow_end':
      return {
        type: 'session.ended',
        data: {
          message: openCodeEvent.message || 'Processing complete',
        },
        timestamp: ts,
      }

    // ─── Agent state change (from /emit, /state, bridge, watchers) ─
    case 'agent_state': {
      const agentId = openCodeEvent.agent
        || STATE_AGENT_MAP[openCodeEvent.tuiState]
        || 'pxh-expert'

      if (!AGENTS[agentId]) return null

      const state = openCodeEvent.tuiState || openCodeEvent.state || ''
      const isIdle = state === 'idle' || !state

      return {
        type: isIdle ? 'agent.idle' : 'agent.state.changed',
        agentId,
        data: {
          state: isIdle ? 'idle' : state,
          badge: isIdle ? '' : (AGENT_ROLES[agentId]?.badge || state),
          message: openCodeEvent.message || '',
          tier: AGENTS[agentId].tier,
          color: AGENTS[agentId].color,
        },
        timestamp: ts,
      }
    }

    // ─── Contract / signal between agents ─────────────────────────
    case 'contract': {
      const from = openCodeEvent.from
      const to = openCodeEvent.to
      if (!from || !to) return null
      if (!AGENTS[from] && !AGENTS[to]) return null

      return {
        type: 'signal.sent',
        agentId: from,
        data: {
          from,
          to,
          message: openCodeEvent.message || `${from} → ${to}`,
        },
        timestamp: ts,
      }
    }

    // ─── TUI mirror (OpenCode terminal output) ────────────────────
    case 'tui_mirror': {
      const line = (openCodeEvent.message || openCodeEvent.line || '').trim()
      if (!line) return null

      return {
        type: 'tui.mirror',
        agentId: 'pxh-opencode',
        data: {
          line,
          truncated: line.length > 80,
        },
        timestamp: ts,
      }
    }

    // ─── Phase change ─────────────────────────────────────────────
    case 'phase_change':
      return {
        type: 'session.phase',
        data: {
          phase: openCodeEvent.phase || '',
          workflow: openCodeEvent.workflow || '',
          retry: openCodeEvent.retry || '0/3',
        },
        timestamp: ts,
      }

    // ─── Task lifecycle ───────────────────────────────────────────
    case 'task_start':
    case 'task_end': {
      const agentId = openCodeEvent.to || openCodeEvent.from || openCodeEvent.agent
      if (!agentId || !AGENTS[agentId]) return null

      return {
        type: openCodeEvent.type === 'task_start' ? 'agent.state.changed' : 'agent.idle',
        agentId,
        data: {
          state: openCodeEvent.type === 'task_start' ? 'working' : 'idle',
          badge: openCodeEvent.type === 'task_start'
            ? (AGENT_ROLES[agentId]?.badge || 'Working')
            : '',
          message: openCodeEvent.message || (openCodeEvent.type === 'task_end'
            ? (openCodeEvent.status === 'fail' ? 'Failed' : 'Done')
            : 'Working...'),
          tier: AGENTS[agentId].tier,
          color: AGENTS[agentId].color,
        },
        timestamp: ts,
      }
    }

    // ─── Agent status (heartbeat / metadata) ──────────────────────
    case 'agent_status':
    case 'connected':
    case 'agent_connected':
      // These are infrastructure events, not rendered
      return null

    default:
      // Unknown event type — pass through as generic
      return {
        type: 'unknown',
        agentId: openCodeEvent.agent || openCodeEvent.from || null,
        data: {
          rawType: openCodeEvent.type,
          message: openCodeEvent.message || '',
        },
        timestamp: ts,
      }
  }
}

/**
 * Emit normalized events for workflow start — triggers T1 + T2 + PXHOpenCode.
 * Used by both server and adapter clients when they detect first activity.
 */
export function workflowStartSequence() {
  const now = Date.now()
  return [
    {
      type: 'session.started',
      data: { message: 'User prompt submitted' },
      timestamp: now,
    },
    {
      type: 'agent.state.changed',
      agentId: 'pxh-help',
      data: { state: 'Interface', badge: 'Interface', message: 'Validate & classify input', tier: 'T1', color: '#58a6ff' },
      timestamp: now,
    },
    {
      type: 'agent.state.changed',
      agentId: 'pxh-pm',
      data: { state: 'Orchestration', badge: 'Orchestration', message: 'Route & enforce policy', tier: 'T2', color: '#d29922' },
      timestamp: now,
    },
    {
      type: 'agent.state.changed',
      agentId: 'pxh-opencode',
      data: { state: 'Synced', badge: 'Synced', message: 'Initializing session...', tier: 'T3', color: '#00e5ff' },
      timestamp: now,
    },
    {
      type: 'signal.sent',
      agentId: 'pxh-help',
      data: { from: 'pxh-help', to: 'pxh-pm', message: 'pxh-help → pxh-pm' },
      timestamp: now,
    },
  ]
}

/**
 * Get signal targets for an agent.
 */
export function getSignals(agentId) {
  return SIGNAL_MAP[agentId] || []
}

/**
 * Get agent metadata.
 */
export function getAgentMeta(agentId) {
  return AGENTS[agentId] || null
}

/**
 * Get agent role info.
 */
export function getAgentRole(agentId) {
  return AGENT_ROLES[agentId] || null
}

/**
 * Map a raw TUI state string to an agent ID.
 */
export function mapStateToAgent(tuiState) {
  return STATE_AGENT_MAP[tuiState] || 'pxh-expert'
}

export { AGENTS, AGENT_ROLES, SIGNAL_MAP, STATE_AGENT_MAP }
