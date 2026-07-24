/**
 * Message Protocol — Pixel Agents compatible message types.
 *
 * Mirroring the Pixel Agents architecture:
 * - AgentEvent: normalized events from HookProvider → AgentRuntime
 * - ServerMessage: server → renderer (state diffs)
 * - ClientMessage: renderer → server (commands)
 *
 * Design: provider-agnostic. The HookProvider (adapter) defines how raw
 * OpenCode events normalize to AgentEvent; the runtime translates to
 * ServerMessages for the renderer.
 */

// ── AgentEvent (HookProvider → AgentRuntime) ──────────────────

/**
 * AgentEvent is the normalized event format produced by a HookProvider.
 * All tool-specific details are abstracted — the renderer never sees raw
 * OpenCode/Claude/Gemini/etc event formats.
 */
export const AgentEventKind = Object.freeze({
  /** Agent started using a tool (edit_file, bash, read, glob, task, etc.) */
  TOOL_START: 'toolStart',
  /** Agent finished using a tool */
  TOOL_END: 'toolEnd',
  /** Agent finished its turn (response complete or waiting for input) */
  TURN_END: 'turnEnd',
  /** A sub-agent was spawned (e.g., Task tool) */
  SUBAGENT_START: 'subagentStart',
  /** A sub-agent completed its work */
  SUBAGENT_END: 'subagentEnd',
  /** A sub-agent finished its turn */
  SUBAGENT_TURN_END: 'subagentTurnEnd',
  /** A new session/workflow started */
  SESSION_START: 'sessionStart',
  /** Current session/workflow ended */
  SESSION_END: 'sessionEnd',
  /** Signal/contract between agents */
  SIGNAL: 'signal',
  /** Heartbeat — no state change */
  HEARTBEAT: 'heartbeat',
})

/**
 * @typedef {Object} AgentEvent
 * @property {string} kind       - One of AgentEventKind
 * @property {string} agentId    - Agent identifier
 * @property {string} sessionId  - Session identifier
 * @property {Object} [data]     - Event-specific payload
 * @property {number} timestamp  - Unix ms
 */

// ── ServerMessage (AgentRuntime → Renderer) ───────────────────

export const ServerMessageType = Object.freeze({
  /** Full state snapshot (sent on connect for replay) */
  SNAPSHOT: 'state.snapshot',
  /** Incremental state diff */
  DIFF: 'state.diff',
  /** Agent was created (appeared in a terminal) */
  AGENT_CREATED: 'agent.created',
  /** Agent was closed (terminal closed) */
  AGENT_CLOSED: 'agent.closed',
  /** Agent tool activity started */
  AGENT_TOOL_START: 'agent.toolStart',
  /** Agent tool activity ended */
  AGENT_TOOL_DONE: 'agent.toolDone',
  /** Agent turn ended */
  AGENT_TURN_END: 'agent.turnEnd',
  /** Sub-agent spawned */
  SUBAGENT_TOOL_START: 'subagent.toolStart',
  /** Sub-agent completed */
  SUBAGENT_TOOL_DONE: 'subagent.toolDone',
  /** Session lifecycle */
  SESSION_CHANGED: 'session.changed',
  /** Signal between agents */
  SIGNAL: 'signal',
  /** Connection established */
  CONNECTED: 'connected',
  /** Server heartbeat */
  HEARTBEAT: 'heartbeat',
})

// ── ClientMessage (Renderer → AgentRuntime) ───────────────────

export const ClientMessageType = Object.freeze({
  /** Webview is ready to receive messages */
  READY: 'webview.ready',
  /** Request full state replay */
  REPLAY: 'webview.replay',
  /** Clear all agents and events */
  CLEAR: 'webview.clear',
  /** Toggle sound */
  TOGGLE_SOUND: 'settings.toggleSound',
})

// ── Tool Classification (from HookProvider) ───────────────────

/**
 * Tool categories used to drive animations.
 * Mirrors Pixel Agents' readingTools / permissionExemptTools pattern.
 */
export const ToolCategory = Object.freeze({
  /** Reading/searching/exploring — agent appears to be reading */
  READING: 'reading',
  /** Writing/editing/creating — agent appears to be typing */
  WRITING: 'writing',
  /** Executing/running — agent appears to be building */
  EXECUTING: 'executing',
  /** Testing — agent appears to be testing */
  TESTING: 'testing',
  /** Reviewing/auditing — agent appears to be reviewing */
  REVIEWING: 'reviewing',
  /** Debugging/fixing — agent appears to be debugging */
  DEBUGGING: 'debugging',
  /** Designing/planning — agent appears to be designing */
  DESIGNING: 'designing',
  /** Delegating/spawning sub-agents */
  DELEGATING: 'delegating',
  /** Infrastructure/saving */
  INFRASTRUCTURE: 'infrastructure',
})

/**
 * Map tool names to their animation category.
 * OpenCode-specific tool mapping.
 */
export const TOOL_CATEGORIES = {
  // Reading tools
  read: ToolCategory.READING,
  grep: ToolCategory.READING,
  glob: ToolCategory.READING,
  list: ToolCategory.READING,
  webfetch: ToolCategory.READING,
  websearch: ToolCategory.READING,
  lsp: ToolCategory.READING,
  explore: ToolCategory.READING,

  // Writing tools
  edit: ToolCategory.WRITING,
  write: ToolCategory.WRITING,
  'preparing edit': ToolCategory.WRITING,

  // Executing tools
  bash: ToolCategory.EXECUTING,
  execute: ToolCategory.EXECUTING,
  build: ToolCategory.EXECUTING,
  deploy: ToolCategory.EXECUTING,

  // Testing
  test: ToolCategory.TESTING,

  // Reviewing
  review: ToolCategory.REVIEWING,

  // Debugging
  fix: ToolCategory.DEBUGGING,
  debug: ToolCategory.DEBUGGING,
  doom_loop: ToolCategory.DEBUGGING,

  // Designing
  design: ToolCategory.DESIGNING,
  plan: ToolCategory.DESIGNING,
  planning: ToolCategory.DESIGNING,
  outline: ToolCategory.DESIGNING,
  todo: ToolCategory.DESIGNING,
  todos: ToolCategory.DESIGNING,

  // Delegating
  task: ToolCategory.DELEGATING,
  deleg: ToolCategory.DELEGATING,
  route: ToolCategory.DELEGATING,

  // Infrastructure
  save: ToolCategory.INFRASTRUCTURE,
  skill: ToolCategory.INFRASTRUCTURE,
  prepare: ToolCategory.INFRASTRUCTURE,

  // Thinking
  thinking: ToolCategory.READING,
  question: ToolCategory.READING,
  classify: ToolCategory.READING,
  monitoring: ToolCategory.READING,
}

// ── Tool names that spawn sub-agents ──────────────────────────

export const SUBAGENT_TOOL_NAMES = new Set([
  'task',
  'deleg',
])

// ── Reading tools (drive "reading" animation instead of "typing") ──

export const READING_TOOLS = new Set([
  'read',
  'grep',
  'glob',
  'list',
  'webfetch',
  'websearch',
  'lsp',
  'explore',
  'thinking',
  'question',
  'classify',
  'monitoring',
])

// ── Agent state shape (used in state store) ───────────────────

/**
 * @typedef {Object} AgentState
 * @property {string} agentId
 * @property {string} currentState  - 'idle' | 'reading' | 'typing' | 'executing'
 * @property {string} previousState
 * @property {string} badge          - Display label (e.g., 'Code', 'Test')
 * @property {string} message        - Speech bubble text
 * @property {string} activeTool     - Currently active tool name
 * @property {boolean} active        - Is agent currently working
 * @property {boolean} atDesk        - Is agent at their desk
 * @property {boolean} awaitingInput - Is agent waiting for user input
 * @property {string} tier           - T1/T2/T3/T4/Virtual
 * @property {string} color          - Associated color
 * @property {string} role           - Agent role name
 */

// ── Session state shape ───────────────────────────────────────

/**
 * @typedef {Object} SessionState
 * @property {boolean} active
 * @property {string} phase
 * @property {string} workflow
 * @property {number} startTime
 * @property {string} sessionId
 */

// ── Sub-agent tracking ────────────────────────────────────────

/**
 * @typedef {Object} SubagentInfo
 * @property {string} parentAgentId
 * @property {string} parentToolId
 * @property {string} label
 * @property {string} status       - 'running' | 'completed' | 'idle'
 */
