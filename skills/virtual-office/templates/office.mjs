#!/usr/bin/env node

import fs from 'fs'

const B = {}
B.RESET = '\x1b[0m'
B.BOLD = '\x1b[1m'
B.DIM = '\x1b[2m'
B.CYAN = '\x1b[36m'
B.GREEN = '\x1b[32m'
B.YELLOW = '\x1b[33m'
B.RED = '\x1b[31m'
B.BLUE = '\x1b[34m'
B.MAGENTA = '\x1b[35m'
B.WHITE = '\x1b[37m'
B.CLR = '\x1b[2J\x1b[H'
B.HIDE = '\x1b[?25l'
B.SHOW = '\x1b[?25h'

const SYM = { OK: '\u2713', FAIL: '\u2717', RUN: '\u23F3', ARROW: '\u2192', ARROW_D: '\u2193' }

const TIERS = {
  T1: { label: 'T1 \u2014 Giao di\u1ec7n', color: B.CYAN, role: 'Interface', agent: 'pxh-help' },
  T2: { label: 'T2 \u2014 \u0110i\u1ec1u ph\u1ed1i', color: B.YELLOW, role: 'Orchestration', agent: 'pxh-pm' },
  T3: { label: 'T3 \u2014 Nh\u00e2n c\u00f4ng', color: B.GREEN, role: 'Workers', agent: null },
  T4: { label: 'T4 \u2014 H\u1ea1 t\u1ea7ng', color: B.MAGENTA, role: 'Infrastructure', agent: 'pxh-save-history' },
}

const AGENTS = {
  'pxh-help':        { label: 'HELP', face: '\u25CB',  tier: 'T1' },
  'pxh-pm':          { label: 'CEO',  face: '\u2605',  tier: 'T2' },
  'pxh-architect':   { label: 'ARCH', face: '\u25B3',  tier: 'T3' },
  'pxh-expert':      { label: 'CODE', face: '\u2665',  tier: 'T3' },
  'pxh-fix-bugs':    { label: 'FIX',  face: '\u2692',  tier: 'T3' },
  'pxh-qa':          { label: 'QA',   face: '\u2714',  tier: 'T3' },
  'pxh-review-code': { label: 'RVW',  face: '\u2606',  tier: 'T3' },
  'pxh-devops':      { label: 'DEVOPS', face: '\u2699',  tier: 'T3' },
  'pxh-ui-ux':       { label: 'UIUX', face: '\u25A1',  tier: 'T3' },
  'pxh-save-history':{ label: 'SAVE', face: '\u25C8',  tier: 'T4' },
}

const T3_AGENTS = [
  'pxh-architect', 'pxh-expert', 'pxh-fix-bugs', 'pxh-qa',
  'pxh-review-code', 'pxh-devops', 'pxh-ui-ux'
]
const T3_COLS = 4

const EVENTS_FILE = process.env.PXH_EVENTS || (
  fs.existsSync('_shared/office-events.log')
    ? '_shared/office-events.log'
    : '.opencode/_shared/office-events.log'
)
let lastEventsSize = 0
let eventSourceMode = false

let state = {
  workflow: '\u2014', phase: '\u2014', session_id: '\u2014',
  retry: '0/3', status: 'idle',
  active_agent: null, active_tier: null,
  logs: [], start_time: Date.now(),
  sim_tick: 0,
  contract_anim: { from: null, to: null, frame: 0, active: false }
}

let log_lines = []
const MAX_LOG = 5

function add_log(msg) {
  const t = new Date()
  const ts = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`
  log_lines.unshift(`  ${B.DIM}${ts}${B.RESET}  ${msg}`)
  if (log_lines.length > MAX_LOG) log_lines.length = MAX_LOG
}

function agent_card_html(name, active) {
  const a = AGENTS[name]
  if (!a) return { face: '?', label: '??', lines: ['  ??  '] }
  const ic = active ? `${B.BOLD}${a.face}${B.RESET}` : `${B.DIM}${a.face}${B.RESET}`
  const lb = active ? `${B.BOLD}${a.label}${B.RESET}` : `${B.DIM}${a.label}${B.RESET}`
  const border = active ? `${B.BOLD}` : `${B.DIM}`
  const lines = [
    `${border}\u250C${'\u2500\u2500\u2500\u2500'}\u2510${B.RESET}`,
    `${border}\u2502 ${ic} ${B.RESET}${' '.repeat(2)}${border}\u2502${B.RESET}`,
    `${border}\u2502 ${lb}${' '.repeat(Math.max(0, 6 - a.label.length))}${border}\u2502${B.RESET}`,
    `${border}\u2514${'\u2500\u2500\u2500\u2500'}\u2518${B.RESET}`,
  ]
  return { face: a.face, label: a.label, lines }
}

function tier_content(tierKey, w) {
  const lines = []
  const inner_w = w - 4

  const actual = tierKey === 'T3' ? T3_AGENTS : [TIERS[tierKey].agent]
  const active = state.active_agent

  const rows = []
  for (let i = 0; i < actual.length; i += T3_COLS) {
    rows.push(actual.slice(i, i + T3_COLS))
  }

  for (const row of rows) {
    const cards = row.map(name => agent_card_html(name, name === active))
    const max_h = Math.max(...cards.map(c => c.lines.length))
    for (let r = 0; r < max_h; r++) {
      let buf = ''
      for (const card of cards) {
        buf += (r < card.lines.length ? card.lines[r] : ' '.repeat(7)) + '  '
      }
      const suffix = tierKey === 'T3' && r === 1 && row === rows[0]
        ? `${B.BOLD}${B.DIM}\u2502${B.RESET} ${tier_extra(tierKey, inner_w - buf.length - 4)}`
        : ''
      lines.push(`  ${buf}${suffix}`)
    }
  }

  if (lines.length === 0 && tierKey !== 'T3') {
    const name = TIERS[tierKey].agent
    const card = agent_card_html(name, name === active)
    for (const l of card.lines) lines.push(`  ${l}`)
  }

  if (tierKey === 'T3' && state.active_agent && state.status === 'running') {
    const pct = Math.min(100, Math.floor(((Date.now() - state.start_time) / 500) % 120))
    const filled = Math.round((pct / 100) * (inner_w - 10))
    const empty = inner_w - 10 - filled
    const pb = `${B.DIM}\u2502${B.RESET} ${B.GREEN}${'\u2588'.repeat(filled)}${B.DIM}${'\u2591'.repeat(Math.max(0, empty))}${B.RESET}${' '.repeat(1)}`
    lines.push(`  ${pb}`)
  }

  const extra = tier_extra(tierKey, inner_w)
  if (extra) {
    const has_content = lines.length > 0
    if (has_content) {
    }
  }

  return lines
}

function tier_extra(tierKey, max_w) {
  if (tierKey === 'T1' && state.active_tier === 'T1') {
    return `${B.DIM}${SYM.ARROW} Request \u2192 T2${B.RESET}`
  }
  if (tierKey === 'T2') {
    return `${B.DIM}Retry: ${state.retry} ${B.RESET}`
  }
  if (tierKey === 'T4') {
    return `${B.DIM}Session: ${state.session_id}${B.RESET}`
  }
  return ''
}

function box(title, body_lines, color, w) {
  const top = `${color}\u250C ${B.BOLD}${title}${B.RESET} ${color}${'\u2500'.repeat(Math.max(2, w - title.length - 4))}\u2510${B.RESET}`
  const sep = `${color}\u2502${B.RESET}`
  const bot = `${color}\u2514${'\u2500'.repeat(w - 1)}\u2518${B.RESET}`
  const res = [top]
  for (const b of body_lines) {
    const pad = w - b.length - 3
    res.push(`${sep} ${b}${pad > 0 ? ' '.repeat(pad) : ''}${sep}`)
  }
  res.push(bot)
  return res
}

function read_status() {
  try {
    const p = process.env.PXH_STATUS || '.opencode/STATUS.md'
    if (!fs.existsSync(p)) return false
    const raw = fs.readFileSync(p, 'utf-8')
    const m = (re) => { const x = raw.match(re); return x ? x[1].trim() : null }
    const wf = m(/Workflow:\s*(\S+)/)
    const ph = m(/Phase:\s*(\S+)/)
    const sid = m(/Session ID:\s*(\S+)/)
    const rt = m(/Retry:\s*(\S+)/)
    const aa = m(/Active Agent:\s*(\S+)/)
    if (wf) state.workflow = wf
    if (ph) state.phase = ph
    if (sid) state.session_id = sid
    if (rt) state.retry = rt
    if (aa) { state.active_agent = aa; for (const [k, v] of Object.entries(AGENTS)) { if (k === aa || k.includes(aa)) { state.active_tier = v.tier; break } } }
    return true
  } catch { return false }
}

function tierColor(tier) {
  return { T1: B.CYAN, T2: B.YELLOW, T3: B.GREEN, T4: B.MAGENTA }[tier] || B.DIM
}

function processEvent(event) {
  const msg = event.message || `${event.type} event`
  const tc = tierColor(event.tier_from || event.tier_to)

  if (event.type === 'task_start' || event.type === 'phase_change') {
    state.active_agent = event.to || event.from || state.active_agent
    if (event.phase) state.phase = event.phase
    if (event.workflow) state.workflow = event.workflow
    if (event.retry) state.retry = event.retry

    if (event.tier_from && event.tier_to) {
      state.contract_anim = { from: event.tier_from, to: event.tier_to, frame: 0, active: true }
    }

    for (const [k, v] of Object.entries(AGENTS)) {
      if (k === state.active_agent) { state.active_tier = v.tier; break }
    }
    state.status = 'running'
    add_log(`${tc}${msg}${B.RESET}`)
  }
  else if (event.type === 'task_end' || event.type === 'phase_end') {
    if (event.status === 'fail') {
      add_log(`${B.RED}${msg}${B.RESET}`)
    } else {
      add_log(`${B.GREEN}${msg}${B.RESET}`)
    }
    state.contract_anim.active = false
  }
  else if (event.type === 'contract') {
    if (event.tier_from && event.tier_to) {
      state.contract_anim = { from: event.tier_from, to: event.tier_to, frame: 0, active: true }
      setTimeout(() => { state.contract_anim.active = false }, 1500)
    }
    add_log(`${tc}${msg}${B.RESET}`)
  }
  else if (event.type === 'agent_status') {
    add_log(`${tc}${msg}${B.RESET}`)
  }
  else {
    add_log(`${B.DIM}${msg}${B.RESET}`)
  }
}

function readEvents() {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      eventSourceMode = true
      const stats = fs.statSync(EVENTS_FILE)
      if (stats.size < lastEventsSize) lastEventsSize = 0
      if (stats.size > lastEventsSize) {
        const fd = fs.openSync(EVENTS_FILE, 'r')
        const buf = Buffer.alloc(stats.size - lastEventsSize)
        fs.readSync(fd, buf, 0, buf.length, lastEventsSize)
        fs.closeSync(fd)
        lastEventsSize = stats.size
        const lines = buf.toString().split('\n').filter(Boolean)
        for (const line of lines) {
          try { processEvent(JSON.parse(line)) } catch {}
        }
        return true
      }
    }
  } catch {}
  return false
}

function simulate() {
  const phases = [
    { phase: '\u01a0\u1edbng l\u01b0\u1ee3ng', agent: null, tier: null },
    { phase: 'Ph\u00e2n t\u00edch', agent: null, tier: null },
    { phase: 'Thi\u1ebft k\u1ebf', agent: 'pxh-architect', tier: 'T3' },
    { phase: 'Code', agent: 'pxh-expert', tier: 'T3' },
    { phase: 'Ki\u1ec3m tra', agent: 'pxh-qa', tier: 'T3' },
    { phase: 'S\u1eeda l\u1ed7i', agent: 'pxh-fix-bugs', tier: 'T3' },
    { phase: 'R\u00e0 so\u00e1t', agent: 'pxh-review-code', tier: 'T3' },
    { phase: 'Ph\u00e1t h\u00e0nh', agent: 'pxh-devops', tier: 'T3' },
    { phase: 'L\u01b0u tr\u1eef', agent: 'pxh-save-history', tier: 'T4' },
  ]
  const workflows = ['/web', '/game', '/ai', '/tool', '/vibe']
  const tick = state.sim_tick % (phases.length + 8)
  if (tick < phases.length) {
    const p = phases[tick]
    state.phase = p.phase
    state.active_agent = p.agent
    state.active_tier = p.tier
    state.workflow = workflows[tick % workflows.length]
    state.status = 'running'
    const msgs = [
      `[T1] ${B.CYAN}pxh-help${B.RESET} ${SYM.OK} Validate input`,
      `[T2] ${B.YELLOW}pxh-pm${B.RESET} ${SYM.ARROW} Route: ${workflows[tick % workflows.length]}`,
      `[T3] ${B.GREEN}pxh-architect${B.RESET} ${SYM.OK} Schema designed`,
      `[T3] ${B.GREEN}pxh-expert${B.RESET} ${SYM.OK} src/game.ts generated`,
      `[T3] ${B.GREEN}pxh-qa${B.RESET} ${SYM.OK} Tests pass (87%)`,
      `[T3] ${B.RED}pxh-fix-bugs${B.RESET} ${SYM.FAIL} Bug: null ref in update()`,
      `[T3] ${B.YELLOW}pxh-review-code${B.RESET} ${SYM.OK} 0 critical issues`,
      `[T4] ${B.MAGENTA}pxh-save-history${B.RESET} ${SYM.OK} Session saved`,
      `[T1] ${B.CYAN}pxh-help${B.RESET} ${SYM.OK} Response sent`,
    ]
    if (tick < msgs.length) add_log(`${msgs[tick]}`)
  } else {
    state.status = 'idle'
    state.active_agent = null
    state.active_tier = null
  }
  state.sim_tick++
}

function render() {
  const w = 74
  read_status() || readEvents() || simulate()

  const content_lines = []

  content_lines.push('')
  content_lines.push(`  ${B.CYAN}${B.BOLD}\u2560\u2550 V\u0103n Ph\u00f2ng \u1ea2o \u2014 pxhopencode Runtime v44 \u2550\u2563${B.RESET}`)
  content_lines.push(`  ${B.DIM}\u2551   H\u1ec7 th\u1ed1ng 4 t\u1ea7ng \u00b7 Visualize real-time agents \u00b7 Contract flow${B.RESET}`)
  content_lines.push('')

  for (const [tierKey, tier] of Object.entries(TIERS)) {
    const c = tier.color
    const body = tier_content(tierKey, w)
    const title = `${c}${B.BOLD}${tier.label}${B.RESET}${B.DIM} \u2014 ${tier.role}${B.RESET}`
    const b = box(title, body, c, w)
    for (const l of b) content_lines.push(`  ${l}`)

    if (tierKey !== 'T4') {
      content_lines.push(`  ${B.DIM}${' '.repeat(4)}${SYM.ARROW_D}${B.RESET}`)
      content_lines.push('')
    }
  }

  const now = new Date()
  const elapsed_ms = now - state.start_time
  const e = (n) => String(Math.floor(n)).padStart(2,'0')
  const elapsed = `${e(elapsed_ms / 3600000)}:${e((elapsed_ms % 3600000) / 60000)}:${e((elapsed_ms % 60000) / 1000)}`

  const status_items = [
    `${B.BOLD}Tr\u1ea1ng th\u00e1i${B.RESET}`,
    `${B.DIM}Workflow:${B.RESET} ${B.CYAN}${state.workflow}${B.RESET}`,
    `${B.DIM}Phase:${B.RESET} ${B.YELLOW}${state.phase}${B.RESET}`,
    `${B.DIM}Elapsed:${B.RESET} ${elapsed}`,
    state.active_agent ? `${B.DIM}Agent:${B.RESET} ${B.GREEN}${state.active_agent}${B.RESET}` : null,
  ].filter(Boolean)

  content_lines.push(`  ${B.BOLD}\u2550${'\u2550'.repeat(w - 2)}${B.RESET}`)
  content_lines.push(`  ${status_items.join(` ${B.DIM}\u00B7${B.RESET} `)}`)
  content_lines.push('')
  content_lines.push(`  ${B.BOLD}Ho\u1ea1t \u0111\u1ed9ng${B.RESET}`)
  for (const l of log_lines) content_lines.push(l)

  content_lines.push('')
  content_lines.push(`  ${B.DIM}\u2550${'\u2550'.repeat(w - 2)}${B.RESET}`)
  const src = eventSourceMode ? `${B.GREEN}${SYM.OK} Real events${B.RESET}` : `${B.YELLOW}${SYM.RUN} Demo mode${B.RESET}`
  content_lines.push(`  ${B.DIM}Ctrl+C \u0111\u1ec3 tho\u00e1t \u00b7 ${src}${B.RESET}`)

  const out = `${B.CLR}${B.HIDE}${content_lines.join('\n')}${B.RESET}`
  process.stdout.write(out)
}

function cleanup() {
  process.stdout.write(`${B.SHOW}${B.RESET}\n${B.GREEN}${SYM.OK}${B.RESET} V\u0103n Ph\u00f2ng \u1ea2o \u0111\u00e3 \u0111\u00f3ng.\n`)
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

add_log(`${B.CYAN}${B.BOLD}V\u0103n Ph\u00f2ng \u1ea2o kh\u1edfi \u0111\u1ed9ng${B.RESET}`)
state.start_time = Date.now()
render()
setInterval(render, 1000)

try {
  fs.watch(EVENTS_FILE, () => {
    readEvents()
  })
} catch {} // fs.watch may fail if file doesn't exist yet
