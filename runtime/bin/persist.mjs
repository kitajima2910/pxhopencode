#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const CMD = process.argv[2];
const ARG = process.argv[3];

function resolveOpenCodeRoot() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "runtime", "bin"))) return cwd;
  return join(cwd, ".opencode");
}

const OC_ROOT = resolveOpenCodeRoot();
const WS_ROOT = process.cwd();

function readJSON(p) {
  try {
    const raw = readFileSync(p, "utf-8");
    return JSON.parse(raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw);
  } catch { return null; }
}

function writeJSON(p, data) {
  const d = dirname(p);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

const PIPEFILE = join(WS_ROOT, ".pipeline-state.json");
const MEMORY_ROOT = join(OC_ROOT, ".memory");

switch (CMD) {
  // ── Pipeline ───────────────────────────────────────────────
  case "pipe": {
    const status = ARG; // start | pass | fail
    const phase = process.argv[4];
    if (!phase) { console.error("Usage: persist.mjs pipe <status> <phase>"); process.exit(1); }
    let pipe = readJSON(PIPEFILE) || [];
    const existing = pipe.findIndex(p => p.phase === phase);
    const entry = { phase, status, agent: process.argv[5] || "", ts: new Date().toISOString() };
    if (existing >= 0) pipe[existing] = entry;
    else pipe.push(entry);
    writeJSON(PIPEFILE, pipe);
    console.log(`[PIPE] ${phase}: ${status}`);
    break;
  }

  // ── Memory reflection ──────────────────────────────────────
  case "reflect": {
    const category = ARG; // patterns | decisions | bugs | stats | ...
    const key = process.argv[4];
    const val = process.argv[5];
    if (!category || !key) { console.error("Usage: persist.mjs reflect <category> <key> [val]"); process.exit(1); }
    const file = join(MEMORY_ROOT, category + ".json");
    let data = readJSON(file) || {};
    if (val !== undefined) data[key] = val;
    else delete data[key];
    ensureDir(file);
    writeJSON(file, data);
    console.log(`[REFLECT] ${category}.json ${key}=${val ?? "(removed)"}`);
    break;
  }

  // ── Append to array in memory ─────────────────────────────
  case "append": {
    const cat = ARG;
    const entryRaw = process.argv[4];
    if (!cat || !entryRaw) { console.error("Usage: persist.mjs append <category> <json_entry>"); process.exit(1); }
    const f = join(MEMORY_ROOT, cat + ".json");
    let d = readJSON(f) || { entries: [] };
    if (!d.entries) d.entries = [];
    try { d.entries.push(JSON.parse(entryRaw)); } catch { d.entries.push(entryRaw); }
    ensureDir(f);
    writeJSON(f, d);
    console.log(`[APPEND] ${cat}.json +1 entry`);
    break;
  }

  // ── Prompt log ─────────────────────────────────────────────
  case "log": {
    const content = process.argv.slice(3).join(" ");
    if (!content) { console.error("Usage: persist.mjs log <content>"); process.exit(1); }
    const logFile = join(WS_ROOT, "__prompt-log__.md");
    writeFileSync(logFile, content + "\n");
    console.log("[LOG] __prompt-log__.md written");
    break;
  }

  // ── Status ─────────────────────────────────────────────────
  case "status": {
    console.log("\n  Memory root:", MEMORY_ROOT);
  console.log("  Pipeline:", existsSync(PIPEFILE) ? readJSON(PIPEFILE)?.length + " entries" : "none");
  console.log("  Prompt log:", existsSync(join(WS_ROOT, "__prompt-log__.md")) ? "exists" : "none");
    break;
  }

  default:
    console.log(`Usage: persist.mjs <pipe|reflect|append|log|status> [args...]`);
    console.log(`  pipe <start|pass|fail> <phase> [agent]      — Track pipeline phase`);
    console.log(`  reflect <category> <key> [val]              — Set memory key-value`);
    console.log(`  append <category> <json_entry>              — Append to memory array`);
    console.log(`  log <content>                               — Write prompt log`);
    console.log(`  status                                      — Show persistence status`);
}

function ensureDir(p) {
  const d = dirname(p);
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}
