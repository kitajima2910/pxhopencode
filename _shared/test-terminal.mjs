#!/usr/bin/env node
/**
 * Test the terminal output parsing and routing logic
 * that was extracted from officeViewProvider.js
 */

// Copy of ROUTE_RULES from officeViewProvider.js
const ROUTE_RULES = [
  { re: /error|fail|exception|crash|bug|fatal|traceback|stack trace/i, agent: 'pxh-fix-bugs', tuiState: 'fix' },
  { re: /test|assert|expect|describe|it\(|suite|pass|fail|coverage|assertion/i, agent: 'pxh-qa', tuiState: 'test' },
  { re: /build|compile|bundle|webpack|vite|babel|tsc|esbuild|rollup/i, agent: 'pxh-devops', tuiState: 'build' },
  { re: /install|npm|yarn|pnpm|pip|brew|apt|docker|deploy/i, agent: 'pxh-devops', tuiState: 'deploy' },
  { re: /design|ui|ux|layout|style|css|tailwind|figma/i, agent: 'pxh-ui-ux', tuiState: 'design' },
  { re: /review|audit|inspect|lint|eslint|prettier/i, agent: 'pxh-review-code', tuiState: 'review' },
  { re: /commit|save|history|git log|checkpoint|archive/i, agent: 'pxh-save-history', tuiState: 'save' },
  { re: /architect|design pattern|structure|outline|plan/i, agent: 'pxh-architect', tuiState: 'design' },
  { re: /route|delegate|assign|task|sprint|backlog|project/i, agent: 'pxh-pm', tuiState: 'route' },
  { re: /help|support|how to|guide|documentation|docs/i, agent: 'pxh-help', tuiState: 'read' },
]

function routeLog(line) {
  for (const rule of ROUTE_RULES) {
    if (rule.re.test(line)) {
      return { type: 'agent_state', agent: rule.agent, tuiState: rule.tuiState, message: line }
    }
  }
  return null
}

function processTerminalOutput(data) {
  const clean = data.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
                    .replace(/\x1B\][0-9;]*[a-zA-Z]/g, '')
                    .replace(/\x1B[^\x1B]*[\x40-\x7E]/g, '')

  const lines = clean.split('\n')
  const results = []

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r/g, '').trim()
    if (!line) continue

    // Check for prefix override
    const prefixMatch = line.match(/^\[agent:([^\]]+)\]\s*(.*)/)
    if (prefixMatch) {
      results.push({
        source: 'prefix',
        route: { type: 'agent_state', agent: prefixMatch[1], tuiState: 'working', message: prefixMatch[2] || line }
      })
      continue
    }

    // Heuristic routing
    const route = routeLog(line)
    
    // Always mirror to pxh-opencode
    results.push({
      source: 'mirror',
      route: { type: 'tui_mirror', agent: 'pxh-opencode', message: line }
    })

    if (route) {
      results.push({
        source: 'heuristic',
        route
      })
    }
  }

  return results
}

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✅ ${label}`) }
  else { failed++; console.log(`  ❌ ${label}`) }
}

console.log('\n═══════════════════════════════════════')
console.log(' TEST 1: General echo (should mirror)')
console.log('═══════════════════════════════════════')
const r1 = processTerminalOutput('Hello World\n')
assert(r1.length === 1, '1 event generated')
assert(r1[0].source === 'mirror', 'Source is mirror')
assert(r1[0].route.type === 'tui_mirror', 'Type is tui_mirror')
assert(r1[0].route.agent === 'pxh-opencode', 'Agent is pxh-opencode')
assert(r1[0].route.message === 'Hello World', 'Message preserved')

console.log('\n═══════════════════════════════════════')
console.log(' TEST 2: npm test (should route to qa)')
console.log('═══════════════════════════════════════')
const r2 = processTerminalOutput('npm test -- --coverage\n')
assert(r2.length === 2, '2 events: mirror + heuristic')
assert(r2[0].source === 'mirror', 'First is mirror')
assert(r2[1].source === 'heuristic', 'Second is heuristic')
assert(r2[1].route.agent === 'pxh-qa', 'Routes to pxh-qa')
assert(r2[1].route.tuiState === 'test', 'tuiState is test')

console.log('\n═══════════════════════════════════════')
console.log(' TEST 3: Build error (should route to fix-bugs)')
console.log('═══════════════════════════════════════')
const r3 = processTerminalOutput('ERROR in ./src/app.ts\nModule build failed\n')
assert(r3.length === 4, '4 events: 2 mirror + 2 heuristic')
assert(r3[1].route.agent === 'pxh-fix-bugs', 'ERROR routes to pxh-fix-bugs')
assert(r3[3].route.agent === 'pxh-fix-bugs', 'failed routes to pxh-fix-bugs')

console.log('\n═══════════════════════════════════════')
console.log(' TEST 4: Prefix override [agent:xxx]')
console.log('═══════════════════════════════════════')
const r4 = processTerminalOutput('[agent:pxh-devops] npm install\n')
assert(r4.length === 1, '1 event (prefix bypasses heuristic)')
assert(r4[0].source === 'prefix', 'Source is prefix')
assert(r4[0].route.agent === 'pxh-devops', 'Routes to pxh-devops')
assert(r4[0].route.tuiState === 'working', 'tuiState is working')

console.log('\n═══════════════════════════════════════')
console.log(' TEST 5: ANSI escape stripping')
console.log('═══════════════════════════════════════')
const r5 = processTerminalOutput('\x1B[32mPASS\x1B[0m tests\x1B[K\n')
assert(r5.length === 2, '2 events (ANSI stripped)')
assert(r5[1].route.agent === 'pxh-qa', 'PASS routes to pxh-qa')
assert(r5[1].route.message === 'PASS tests', 'ANSI codes stripped')

console.log('\n═══════════════════════════════════════')
console.log(' TEST 6: Multiple lines')
console.log('═══════════════════════════════════════')
const r6 = processTerminalOutput('line1\nnpm build\nline3\n')
assert(r6.length === 4, '4 events: mirror+heuristic for build line, 2 mirror for others')
const buildEvent = r6.find(r => r.source === 'heuristic')
assert(buildEvent.route.agent === 'pxh-devops', 'build routes to pxh-devops')

console.log('\n═══════════════════════════════════════')
console.log(' TEST 7: Empty/whitespace lines (should skip)')
console.log('═══════════════════════════════════════')
const r7 = processTerminalOutput('\n  \n\r\n\n')
assert(r7.length === 0, 'No events for empty lines')

console.log('\n═══════════════════════════════════════')
console.log(` RESULTS: ${passed} passed, ${failed} failed`)
console.log('═══════════════════════════════════════')

process.exit(failed > 0 ? 1 : 0)
