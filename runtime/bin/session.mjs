#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

function resolveOpenCodeRoot() {
  const cwd = process.cwd();
  if (existsSync(join(cwd, "runtime", "bin"))) return cwd;
  return join(cwd, ".opencode");
}

function readStdin() {
  try { return readFileSync(0, "utf-8").trim(); } catch { return ""; }
}

function usage() {
  console.error("Usage: session.mjs prepare <prompt> | session.mjs prepare --stdin");
  process.exit(1);
}

async function prepare() {
  const fromStdin = process.argv[3] === "--stdin";
  const input = (fromStdin ? readStdin() : process.argv.slice(3).join(" ")).trim();
  if (!input) usage();

  const workspace = process.cwd();
  const ocRoot = resolveOpenCodeRoot();
  const memoryRoot = join(ocRoot, ".memory");
  if (!existsSync(join(memoryRoot, "index.json"))) {
    console.error("[BLOCKED] Memory is not initialized. Run the pxhopencode start script first.");
    process.exit(1);
  }

  const compilerEntry = join(ocRoot, "prompt-compiler", "dist", "index.js");
  if (!existsSync(compilerEntry)) {
    console.error("[BLOCKED] Prompt compiler is missing. Run the pxhopencode start script first.");
    process.exit(1);
  }
  const { Pipeline } = await import(pathToFileURL(compilerEntry).href);
  const result = new Pipeline({ backend: "opencode" }).compile(input);
  const prompt = result.prompt.trim();

  writeFileSync(join(workspace, "__prompt-log__.md"), prompt + "\n", "utf-8");
  const stateFile = join(workspace, ".pipeline-state.json");
  if (!existsSync(stateFile)) writeFileSync(stateFile, "[]\n", "utf-8");

  const contextFile = join(ocRoot, ".context.json");
  let context = { prompts: [], session_id: null, updated: null };
  try { context = JSON.parse(readFileSync(contextFile, "utf-8")); } catch { /* create below */ }
  if (!Array.isArray(context.prompts)) context.prompts = [];
  if (!context.prompts.some(entry => entry.text === input)) {
    context.prompts.push({ text: input, timestamp: new Date().toISOString() });
    context.prompts = context.prompts.slice(-10);
  }
  context.session_id ||= "sess_" + Date.now().toString(36);
  context.updated = new Date().toISOString();
  mkdirSync(ocRoot, { recursive: true });
  writeFileSync(contextFile, JSON.stringify(context, null, 2) + "\n", "utf-8");

  console.log(JSON.stringify({
    prompt,
    ir: result.ir,
    metrics: result.metrics,
    memory_root: memoryRoot,
  }, null, 2));
}

if (process.argv[2] === "prepare") prepare().catch(error => {
  console.error("[BLOCKED] " + (error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
else usage();
