#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RX_PREFIX = ".opencode";

function err(s) { return "\x1b[31m" + s + "\x1b[0m"; }
function ok(s) { return "\x1b[32m" + s + "\x1b[0m"; }
function dim(s) { return "\x1b[2m" + s + "\x1b[0m"; }

async function main() {
  const type = process.argv[2] || "all";
  const target = (() => {
    for (const p of [".opencode/runtime/engine", "runtime/engine"]) if (existsSync(p)) return p;
    return null;
  })();
  if (!target) { console.log(err("Engine not found")); process.exit(1); }

  const engine = join(target, "src", "index.ts");
  if (!existsSync(engine)) {
    console.log(dim("Engine source at " + engine + " — run tests for validation"));
  }

  let passed = 0, failed = 0;

  if (type === "all" || type === "contracts") {
    console.log(dim("\n  -- Contracts --"));
    try {
      const raw = readFileSync(join(target, "src", "types.ts"), "utf-8");
      const hasTypes = raw.includes("RequestContract") && raw.includes("TaskContract");
      console.log("  " + (hasTypes ? ok("OK") : err("FAIL")) + " Types defined");
      if (hasTypes) passed++; else failed++;

      const contracts = ["request", "task", "result", "response", "event", "state"];
      for (const c of contracts) {
        const cp = join(target, "src", "contracts", c + ".ts");
        const ok2 = existsSync(cp) && readFileSync(cp, "utf-8").includes("Schema");
        console.log("  " + (ok2 ? ok("OK") : err("FAIL")) + " contract/" + c);
        if (ok2) passed++; else failed++;
      }
    } catch { console.log(err("  Engine read error")); failed++; }
  }

  if (type === "all" || type === "pipeline") {
    console.log(dim("\n  -- Pipeline --"));
    const pp = join(target, "src", "pipeline.ts");
    if (existsSync(pp)) {
      const raw = readFileSync(pp, "utf-8");
      const has10 = raw.includes("10 phases") || (raw.match(/phase/g) || []).length > 5;
      console.log("  " + (has10 ? ok("OK") : err("FAIL")) + " pipeline.ts");
      if (has10) passed++; else failed++;
    } else { console.log(err("  MISSING pipeline.ts")); failed++; }
  }

  if (type === "all" || type === "router") {
    console.log(dim("\n  -- Router --"));
    const rp = join(target, "src", "router.ts");
    if (existsSync(rp)) {
      const raw = readFileSync(rp, "utf-8");
      const hasRoute = raw.includes("function route");
      console.log("  " + (hasRoute ? ok("OK") : err("FAIL")) + " router.ts");
      if (hasRoute) passed++; else failed++;
    } else { console.log(err("  MISSING router.ts")); failed++; }
  }

  if (type === "all" || type === "memory") {
    console.log(dim("\n  -- Memory --"));
    const mp = join(target, "src", "memory.ts");
    if (existsSync(mp)) {
      const raw = readFileSync(mp, "utf-8");
      const hasIO = raw.includes("readMemory") || raw.includes("writeMemory");
      console.log("  " + (hasIO ? ok("OK") : err("FAIL")) + " memory.ts");
      if (hasIO) passed++; else failed++;
    } else { console.log(err("  MISSING memory.ts")); failed++; }
  }

  console.log(dim("\n  -- Summary --"));
  const total = passed + failed;
  if (failed === 0) console.log("  " + ok("ALL " + passed + "/" + total + " PASSED"));
  else console.log("  " + err(passed + "/" + total + " PASSED, " + failed + " FAILED"));
  process.exit(failed > 0 ? 1 : 0);
}

main();
