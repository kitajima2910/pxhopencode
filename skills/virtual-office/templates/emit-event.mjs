#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const ROOT = process.env.PXH_ROOT || process.cwd()
const EVENTS_FILE = process.env.PXH_EVENTS || path.join(ROOT, '_shared', 'office-events.log')

export function emit(event) {
  const entry = {
    ts: new Date().toISOString(),
    ...event,
  }
  const line = JSON.stringify(entry) + '\n'
  try {
    fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true })
    fs.appendFileSync(EVENTS_FILE, line)
  } catch (e) {
    console.error('[office-events] write error:', e.message)
  }
  return entry
}

export function clearEvents() {
  try {
    fs.writeFileSync(EVENTS_FILE, '')
  } catch (e) {
    console.error('[office-events] clear error:', e.message)
  }
}

if (process.argv[1] && (process.argv[1].endsWith('emit-event.mjs') || process.argv[1].endsWith('emit-event.js'))) {
  const args = {}
  for (let i = 2; i < process.argv.length; i++) {
    const m = process.argv[i].match(/^--(\w+)$/)
    if (m) {
      args[m[1]] = process.argv[i + 1] !== undefined && !process.argv[i + 1].startsWith('--')
        ? process.argv[i + 1] : true
      if (typeof args[m[1]] !== 'boolean') i++
    }
  }
  if (args.clear) {
    clearEvents()
    console.log(JSON.stringify({ status: 'cleared' }))
  } else if (args.type) {
    const result = emit(args)
    console.log(JSON.stringify(result))
  } else {
    console.error('Usage: node emit-event.mjs --type <event_type> [--from X] [--to Y] [--message "..."]')
    console.error('       node emit-event.mjs --clear')
    process.exit(1)
  }
}
