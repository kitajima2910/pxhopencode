#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function resolveOpenCodeRoot() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "runtime", "bin"))) return cwd;
  return join(cwd, ".opencode");
}

const OC_ROOT = resolveOpenCodeRoot();

function err(s) { return "\x1b[31m" + s + "\x1b[0m"; }
function ok(s) { return "\x1b[32m" + s + "\x1b[0m"; }
function dim(s) { return "\x1b[2m" + s + "\x1b[0m"; }
function cyan(s) { return "\x1b[36m" + s + "\x1b[0m"; }
function yell(s) { return "\x1b[33m" + s + "\x1b[0m"; }

const phasesConfig = JSON.parse(readFileSync(join(OC_ROOT, "_shared", "phases.json"), "utf-8"));
const PIPEFILE = join(process.cwd(), ".pipeline-state.json");
const PHASES = phasesConfig.phases;
const AGENTS = phasesConfig.agents;

function readPipe() {
  try { return JSON.parse(readFileSync(PIPEFILE, "utf-8")); } catch { return []; }
}
function writePipe(d) { writeFileSync(PIPEFILE, JSON.stringify(d, null, 2) + "\n"); }

function cmdStatus() {
  const pipe = readPipe();
  console.log(dim("\n  -- Pipeline Status --"));
  if (pipe.length === 0) { console.log("  " + yell("No pipeline active")); return; }
  for (const step of pipe) {
    const icon = step.status === "pass" ? ok("OK") : step.status === "fail" ? err("XX") : dim("--");
    const agent = step.agent ? dim(" -> " + step.agent) : "";
    console.log("  " + icon + " " + cyan(step.phase.padEnd(12)) + agent);
  }
  const cur = pipe.find(s => s.status !== "pass");
  if (cur) console.log(dim("\n  Current: ") + yell(cur.phase) + dim(" -> ") + cyan(AGENTS[cur.phase] || "?"));
  else console.log(dim("\n  ") + ok("All phases complete!"));
}

function cmdStartPhase(phase) {
  if (!PHASES.includes(phase)) { console.log(err("Invalid phase: " + phase)); process.exit(1); }
  const pipe = readPipe();
  const existing = pipe.find(s => s.phase === phase);
  if (existing && existing.status === "pass") { console.log(err("Phase already done: " + phase)); return; }
  if (!existing) pipe.push({ phase, agent: AGENTS[phase] || "?", status: null });
  else { existing.status = null; existing.agent = AGENTS[phase]; }
  writePipe(pipe);
  console.log(ok("Started: ") + cyan(phase) + dim(" -> ") + (AGENTS[phase] || "?"));
}

function cmdCompletePhase(phase, status) {
  if (!PHASES.includes(phase)) { console.log(err("Invalid phase")); process.exit(1); }
  const pipe = readPipe();
  const s = pipe.find(x => x.phase === phase);
  if (!s) { console.log(err("Phase not started: " + phase)); return; }
  s.status = status;
  writePipe(pipe);
  console.log(ok("Completed: ") + cyan(phase) + dim(" -> ") + status);
}

function cmdReset() {
  writePipe([]);
  console.log(ok("Pipeline reset"));
}

function cmdWatch() {
  let last = "";
  setInterval(() => {
    const pipe = readPipe();
    const cur = JSON.stringify(pipe);
    if (cur !== last) {
      last = cur;
      console.clear();
      cmdStatus();
    }
  }, 2000);
  console.log(dim("Watching pipeline (Ctrl+C to stop)..."));
}

const args = process.argv.slice(2);
const cmd = args[0] || "status";

if (cmd === "status") cmdStatus();
else if (cmd === "start" && args[1]) cmdStartPhase(args[1]);
else if (cmd === "pass" && args[1]) cmdCompletePhase(args[1], "pass");
else if (cmd === "fail" && args[1]) cmdCompletePhase(args[1], "fail");
else if (cmd === "reset") cmdReset();
else if (cmd === "watch") cmdWatch();
else {
  console.log(dim("Usage:"));
  console.log("  pipeline status            " + dim("Current pipeline state"));
  console.log("  pipeline start <phase>     " + dim("Start a phase"));
  console.log("  pipeline pass <phase>      " + dim("Mark phase passed"));
  console.log("  pipeline fail <phase>      " + dim("Mark phase failed"));
  console.log("  pipeline reset             " + dim("Clear pipeline"));
  console.log("  pipeline watch             " + dim("Live watch pipeline changes"));
}
