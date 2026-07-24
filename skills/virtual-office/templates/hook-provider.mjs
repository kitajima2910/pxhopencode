#!/usr/bin/env node

/**
 * OpenCode HookProvider — implements the Pixel Agents HookProvider pattern.
 *
 * This is the SINGLE integration boundary for OpenCode events.
 * Adding a new AI tool = one new HookProvider implementation.
 * The runtime and renderer never know about OpenCode-specific event formats.
 *
 * Pixel Agents reference: core/src/provider.ts (HookProvider interface)
 */

import {
  AgentEventKind,
  TOOL_CATEGORIES,
  READING_TOOLS,
  SUBAGENT_TOOL_NAMES,
} from './messages.mjs'

// ─── Agent Registry ─────────────────────────────────────────────

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
  'pxh-help':          { badge: 'Interface',      tierLabel: 'T1 Interface' },
  'pxh-pm':            { badge: 'Orchestration',  tierLabel: 'T2 Orchestration' },
  'pxh-architect':     { badge: 'Design',         tierLabel: 'T3 Design' },
  'pxh-expert':        { badge: 'Code',           tierLabel: 'T3 Code' },
  'pxh-fix-bugs':      { badge: 'Debug',          tierLabel: 'T3 Debug' },
  'pxh-qa':            { badge: 'Test',           tierLabel: 'T3 Test' },
  'pxh-review-code':   { badge: 'Review',         tierLabel: 'T3 Review' },
  'pxh-devops':        { badge: 'Build',          tierLabel: 'T3 Build' },
  'pxh-save-history':  { badge: 'Infrastructure', tierLabel: 'T4 Infrastructure' },
  'pxh-ui-ux':         { badge: 'Design',         tierLabel: 'T3 Design' },
  'pxh-office':        { badge: 'Virtual Office', tierLabel: 'Virtual' },
  'pxh-opencode':      { badge: 'Synced',         tierLabel: 'TUI Mirror' },
}

// Raw TUI state → agent mapping
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

// Signal relationships between agents
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

// ─── HookProvider Implementation ────────────────────────────────

/**
 * Normalize a raw OpenCode event into a Pixel-Agents-compatible AgentEvent.
 *
 * This is the core HookProvider contract method — mirroring
 * HookProvider.normalizeHookEvent() from Pixel Agents.
 *
 * @param {Object} raw - Raw event from any OpenCode source (/emit, /state, file watcher, bridge)
 * @returns {{ sessionId: string, event: Object } | null}
 */
export function normalizeEvent(raw) {
  if (!raw || !raw.type) return null

  const now = Date.now()
  const ts = typeof raw.ts === 'string' ? new Date(raw.ts).getTime() : (raw.ts || now)
  const sessionId = raw.sessionId || `session-${ts}`

  let event = null

  switch (raw.type) {

    // ─── Session lifecycle ──────────────────────────────────────
    case 'workflow_start':
      event = {
        kind: AgentEventKind.SESSION_START,
        data: { message: raw.message || 'User prompt submitted' },
      }
      break

    case 'workflow_end':
      event = {
        kind: AgentEventKind.SESSION_END,
        data: { message: raw.message || 'Processing complete' },
      }
      break

    // ─── Agent state change (tool activity) ─────────────────────
    case 'agent_state': {
      const agentId = raw.agent || STATE_AGENT_MAP[raw.tuiState] || 'pxh-expert'
      if (!AGENTS[agentId]) return null

      const toolName = raw.tuiState || raw.state || ''
      const isIdle = toolName === 'idle' || !toolName
      const isDelegating = SUBAGENT_TOOL_NAMES.has(toolName)

      if (isIdle) {
        event = {
          kind: AgentEventKind.TURN_END,
          data: {
            state: 'idle',
            badge: '',
            message: raw.message || '',
            toolName: null,
            awaitingInput: false,
          },
        }
      } else if (isDelegating) {
        event = {
          kind: AgentEventKind.TOOL_START,
          data: {
            toolName,
            category: TOOL_CATEGORIES[toolName] || 'executing',
            badge: AGENT_ROLES[agentId]?.badge || toolName,
            message: raw.message || `${toolName}...`,
            tier: AGENTS[agentId].tier,
            color: AGENTS[agentId].color,
          },
        }
      } else {
        const category = getToolCategory(toolName)
        const isReading = isReadingTool(toolName)

        event = {
          kind: AgentEventKind.TOOL_START,
          data: {
            toolName,
            category,
            badge: AGENT_ROLES[agentId]?.badge || toolName,
            message: raw.message || `${toolName}...`,
            tier: AGENTS[agentId].tier,
            color: AGENTS[agentId].color,
            isReading,
          },
        }
      }
      event.agentId = agentId
      break
    }

    // ─── Signal / contract between agents ───────────────────────
    case 'contract': {
      const from = raw.from
      const to = raw.to
      if (!from || !to) return null

      event = {
        kind: AgentEventKind.SIGNAL,
        agentId: from,
        data: { from, to, message: raw.message || `${from} → ${to}` },
      }
      break
    }

    // ─── TUI mirror (OpenCode terminal output) ──────────────────
    case 'tui_mirror': {
      const line = (raw.message || raw.line || '').trim()
      if (!line) return null

      const toolName = detectToolFromLine(line)
      const category = getToolCategory(toolName)

      event = {
        kind: AgentEventKind.TOOL_START,
        agentId: 'pxh-opencode',
        data: {
          toolName: 'tui_mirror',
          category,
          badge: 'Synced',
          message: line.slice(0, 80),
          tier: 'T3',
          color: '#00e5ff',
          isReading: category === 'reading',
          rawLine: line,
        },
      }
      break
    }

    // ─── Task start / end (sub-agent awareness) ─────────────────
    case 'task_start': {
      const agentId = raw.to || raw.from || raw.agent
      if (!agentId || !AGENTS[agentId]) return null

      // If the task tool is used, it may spawn a sub-agent
      const isDelegating = raw.tool === 'task' || raw.phase === 'delegating'

      event = {
        kind: isDelegating ? AgentEventKind.SUBAGENT_START : AgentEventKind.TOOL_START,
        agentId,
        data: {
          toolName: raw.tool || raw.phase || 'working',
          category: isDelegating ? 'delegating' : getToolCategory(raw.tool || raw.phase),
          badge: AGENT_ROLES[agentId]?.badge || 'Working',
          message: raw.message || 'Working...',
          tier: AGENTS[agentId].tier,
          color: AGENTS[agentId].color,
          parentToolId: isDelegating ? (raw.parentToolId || raw.target) : undefined,
        },
      }
      break
    }

    case 'task_end': {
      const agentId = raw.to || raw.from || raw.agent
      if (!agentId || !AGENTS[agentId]) return null

      event = {
        kind: AgentEventKind.TURN_END,
        agentId,
        data: {
          state: 'idle',
          badge: '',
          message: raw.status === 'fail' ? 'Failed' : 'Done',
          toolName: null,
        },
      }
      break
    }

    // ─── Phase change ───────────────────────────────────────────
    case 'phase_change':
      event = {
        kind: AgentEventKind.TOOL_START,
        agentId: raw.agent || 'pxh-pm',
        data: {
          toolName: raw.phase || '',
          category: getToolCategory(raw.phase),
          badge: raw.phase || '',
          message: raw.message || `${raw.phase}...`,
          workflow: raw.workflow,
          retry: raw.retry,
        },
      }
      break

    // ─── Infrastructure events (not rendered) ────────────────────
    case 'agent_status':
    case 'connected':
      event = {
        kind: AgentEventKind.HEARTBEAT,
        agentId: raw.from || 'pxh-office',
        data: { message: raw.message || '' },
      }
      break

    default:
      // Unknown event — pass through as tool start for generic handling
      event = {
        kind: AgentEventKind.TOOL_START,
        agentId: raw.agent || raw.from || null,
        data: {
          toolName: raw.type || 'unknown',
          category: 'reading',
          badge: '',
          message: raw.message || '',
          rawType: raw.type,
        },
      }
  }

  if (!event || !event.kind) return null

  return {
    sessionId,
    event: {
      ...event,
      timestamp: ts,
    },
  }
}

/**
 * Generate workflow start sequence — mirrors the Pixel Agents pattern
 * where the HookProvider defines startup events.
 */
export function workflowStartSequence() {
  const now = Date.now()
  return [
    {
      sessionId: `session-${now}`,
      event: {
        kind: AgentEventKind.SESSION_START,
        data: { message: 'User prompt submitted' },
        timestamp: now,
      },
    },
    {
      sessionId: `session-${now}`,
      event: {
        kind: AgentEventKind.TOOL_START,
        agentId: 'pxh-help',
        data: {
          toolName: 'classify',
          category: 'reading',
          badge: 'Interface',
          message: '',
          tier: 'T1',
          color: '#58a6ff',
          isReading: true,
        },
        timestamp: now,
      },
    },
    {
      sessionId: `session-${now}`,
      event: {
        kind: AgentEventKind.SIGNAL,
        agentId: 'pxh-help',
        data: { from: 'pxh-help', to: 'pxh-pm', message: 'pxh-help → pxh-pm' },
        timestamp: now,
      },
    },
    {
      sessionId: `session-${now}`,
      event: {
        kind: AgentEventKind.TOOL_START,
        agentId: 'pxh-pm',
        data: {
          toolName: 'route',
          category: 'delegating',
          badge: 'Orchestration',
          message: '',
          tier: 'T2',
          color: '#d29922',
        },
        timestamp: now,
      },
    },
    {
      sessionId: `session-${now}`,
      event: {
        kind: AgentEventKind.TOOL_START,
        agentId: 'pxh-opencode',
        data: {
          toolName: 'tui_mirror',
          category: 'reading',
          badge: 'Synced',
          message: '',
          tier: 'T3',
          color: '#00e5ff',
          isReading: true,
        },
        timestamp: now,
      },
    },
  ]
}

// ─── HookProvider Utility Methods ───────────────────────────────

/**
 * Format tool status for display — mirrors HookProvider.formatToolStatus()
 * @param {string} toolName
 * @param {*} [input]
 * @returns {string}
 */
export function formatToolStatus(toolName, input) {
  if (!toolName) return ''

  const labels = {
    read: 'Reading', grep: 'Searching', glob: 'Finding', list: 'Listing',
    edit: 'Editing', write: 'Writing', 'preparing edit': 'Preparing',
    bash: 'Running', task: 'Delegating', test: 'Testing',
    review: 'Reviewing', fix: 'Debugging', design: 'Designing',
    plan: 'Planning', build: 'Building', save: 'Saving',
    classify: 'Classifying', route: 'Routing', thinking: 'Thinking',
    explore: 'Exploring', webfetch: 'Fetching', websearch: 'Searching',
    skill: 'Loading skill', deploy: 'Deploying', polish: 'Polishing',
    doom_loop: 'Fixing loop', prepare: 'Preparing', outline: 'Outlining',
    monitoring: 'Monitoring',
  }

  let label = labels[toolName] || toolName

  if (input && typeof input === 'string') {
    const truncated = input.length > 30 ? input.slice(0, 27) + '...' : input
    label += `: ${truncated}`
  }

  return label
}

/**
 * Get tool animation category.
 * @param {string} toolName
 * @returns {string} - 'reading' | 'writing' | 'executing' | ...
 */
export function getToolCategory(toolName) {
  return TOOL_CATEGORIES[toolName] || 'executing'
}

/**
 * Check if a tool is a reading tool (drives "reading" animation).
 * @param {string} toolName
 * @returns {boolean}
 */
export function isReadingTool(toolName) {
  return READING_TOOLS.has(toolName)
}

/**
 * Check if a tool spawns sub-agents.
 * @param {string} toolName
 * @returns {boolean}
 */
export function isSubagentTool(toolName) {
  return SUBAGENT_TOOL_NAMES.has(toolName.toLowerCase())
}

/**
 * Get signal targets for an agent.
 * @param {string} agentId
 * @returns {string[]}
 */
export function getSignals(agentId) {
  return SIGNAL_MAP[agentId] || []
}

/**
 * Get agent metadata.
 * @param {string} agentId
 * @returns {Object|null}
 */
export function getAgentMeta(agentId) {
  return AGENTS[agentId] || null
}

/**
 * Get agent role info.
 * @param {string} agentId
 * @returns {Object|null}
 */
export function getAgentRole(agentId) {
  return AGENT_ROLES[agentId] || null
}

/**
 * Map a raw TUI state string to an agent ID.
 * @param {string} tuiState
 * @returns {string}
 */
export function mapStateToAgent(tuiState) {
  return STATE_AGENT_MAP[tuiState] || 'pxh-expert'
}

// ─── Internal ───────────────────────────────────────────────────

/**
 * Heuristic tool detection from a TUI output line.
 * @param {string} line
 * @returns {string|null}
 */
function detectToolFromLine(line) {
  const patterns = [
    [/read|reading|load|loading/i, 'read'],
    [/write|writing|create|creating|generate/i, 'write'],
    [/edit|editing|modify|updating/i, 'edit'],
    [/search|searching|find|grep|glob|lookup/i, 'grep'],
    [/execute|executing|run|running|bash|command|install/i, 'bash'],
    [/test|testing|verify|verifying/i, 'test'],
    [/review|reviewing|audit|inspect/i, 'review'],
    [/fix|fixing|debug|debugging|patch|repair/i, 'fix'],
    [/design|designing|ui|ux|layout|style/i, 'design'],
    [/plan|planning|outline|todos|organize/i, 'plan'],
    [/delegate|delegating|subagent|assign|routing/i, 'task'],
    [/save|saving|persist|checkpoint/i, 'save'],
    [/classify|classifying|validate|parsing/i, 'classify'],
    [/think|thinking|analyze|reason/i, 'thinking'],
    [/build|building|compile|deploy|lint/i, 'build'],
  ]

  for (const [re, tool] of patterns) {
    if (re.test(line)) return tool
  }
  return null
}

export { AGENTS, AGENT_ROLES, SIGNAL_MAP, STATE_AGENT_MAP }
