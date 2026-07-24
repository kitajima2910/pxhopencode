const fs = require("fs");
const path = require("path");

const EXT_MAP = [
  { re: /\.(ts|tsx|js|jsx|mjs|cjs)$/, agent: "pxh-expert", action: "Code" },
  { re: /\.(test|spec)\.(ts|js|tsx|jsx)$/, agent: "pxh-qa", action: "Test" },
  { re: /\.(css|scss|less)$/, agent: "pxh-ui-ux", action: "Style" },
  { re: /\.html$/, agent: "pxh-expert", action: "Code" },
  { re: /\.md$/, agent: "pxh-save-history", action: "Doc" },
  { re: /\.(json|yaml|yml|toml)$/, agent: "pxh-devops", action: "Config" },
  { re: /\.(ps1|sh|bat|cmd)$/, agent: "pxh-devops", action: "Script" },
  { re: /\.(py|rs|go|java|cpp|c|h|hpp)$/, agent: "pxh-expert", action: "Code" },
  { re: /\.(vue|svelte)$/, agent: "pxh-expert", action: "Code" },
];

const EXCLUDE_DIRS = new Set([
  "node_modules", ".git", ".svn", "dist", "build", ".next",
  ".opencode", "_shared", "__pycache__", ".venv", "venv",
  "target", "coverage", ".nyc_output",
]);

const AGENT_ROLES = {
  "pxh-help": { tuiState: "Interface", msg: "Validate & classify input" },
  "pxh-pm": { tuiState: "Orchestration", msg: "Route & enforce policy" },
  "pxh-architect": { tuiState: "Design", msg: "Design tech stack & schema" },
  "pxh-expert": { tuiState: "Code", msg: "Vibe code & production" },
  "pxh-fix-bugs": { tuiState: "Debug", msg: "Root cause -> fix bug" },
  "pxh-qa": { tuiState: "Test", msg: "Write & run tests" },
  "pxh-review-code": { tuiState: "Review", msg: "Security & perf audit" },
  "pxh-devops": { tuiState: "Build", msg: "Lint -> test -> build" },
  "pxh-save-history": { tuiState: "Infrastructure", msg: "Save state & checkpoint" },
  "pxh-ui-ux": { tuiState: "Design", msg: "Layout & responsive design" },
  "pxh-office": { tuiState: "Virtual Office", msg: "Virtual Office" },
};

const WORK_IDLE_MS = 8000;
const DEBOUNCE_MS = 300;
const FS_WATCH_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".scss", ".less", ".html", ".md",
  ".json", ".yaml", ".yml", ".toml",
  ".ps1", ".sh", ".bat", ".cmd",
  ".py", ".rs", ".go", ".java", ".cpp", ".c", ".h", ".hpp",
  ".vue", ".svelte",
]);

function startWatcher(workspaceRoot, onEvent) {
  const sharedDir = path.join(workspaceRoot, "_shared");
  const eventsFile = path.join(sharedDir, "office-events.log");
  const stateFile = path.join(sharedDir, "opencode-state.json");

  let eventsSize = 0;
  let prevState = null;
  const watchers = [];
  let disposed = false;

  try { fs.mkdirSync(sharedDir, { recursive: true }); } catch {}

  // Clear stale state from previous session — office starts fresh
  try { fs.writeFileSync(eventsFile, ""); } catch {}
  try { fs.writeFileSync(stateFile, JSON.stringify({ state: "idle" })); } catch {}
  const startedAt = Date.now(); // suppress workspace events during startup window

  function readNewEvents() {
    try {
      if (!fs.existsSync(eventsFile)) return;
      const stats = fs.statSync(eventsFile);
      if (stats.size < eventsSize) eventsSize = 0;
      if (stats.size <= eventsSize) return;
      const fd = fs.openSync(eventsFile, "r");
      const buf = Buffer.alloc(stats.size - eventsSize);
      fs.readSync(fd, buf, 0, buf.length, eventsSize);
      eventsSize = stats.size;
      if (isStartupGrace()) return; // skip replay during startup
      const lines = buf.toString().split("\n").filter(Boolean);
      lines.forEach((line) => {
        try {
          const event = JSON.parse(line);
          onEvent(event);
        } catch {}
      });
    } catch {}
  }

  function readState() {
    try {
      if (!fs.existsSync(stateFile)) return;
      const raw = fs.readFileSync(stateFile, "utf-8");
      const st = JSON.parse(raw);
      // On first stable poll after startup, record baseline without emitting events
      if (isStartupGrace()) {
        prevState = st.state || "idle";
        return;
      }
      if (st.state === "workflow_start") {
        if (!workflowActive) {
          workflowActive = true;
          onEvent({ type: "workflow_start", message: st.message || "Workflow started", ts: new Date().toISOString() });
        }
        return;
      }
      if (st.state === "workflow_end") {
        if (workflowActive) {
          workflowActive = false;
          onEvent({ type: "workflow_end", message: st.message || "Workflow ended", ts: new Date().toISOString() });
        }
        prevState = "idle";
        return;
      }
      if (st.state && st.state !== "idle" && st.state !== prevState) {
        prevState = st.state;
        if (!workflowActive) {
          workflowActive = true;
          onEvent({ type: "workflow_start", message: "User prompt submitted", ts: new Date().toISOString() });
        }
        const STATE_MAP = {
          thinking: "pxh-expert", explore: "pxh-architect", read: "pxh-help",
          deleg: "pxh-pm", "preparing edit": "pxh-expert", edit: "pxh-expert",
          write: "pxh-expert", bash: "pxh-devops", grep: "pxh-qa",
          glob: "pxh-qa", list: "pxh-qa", task: "pxh-pm",
          websearch: "pxh-help", webfetch: "pxh-help", lsp: "pxh-expert",
          skill: "pxh-expert", question: "pxh-pm", doom_loop: "pxh-fix-bugs",
          review: "pxh-review-code", test: "pxh-qa", build: "pxh-devops",
          design: "pxh-architect", save: "pxh-save-history",
          classify: "pxh-help", route: "pxh-pm",
          planning: "pxh-pm", plan: "pxh-pm", prepare: "pxh-expert",
          todos: "pxh-pm", todo: "pxh-pm", outline: "pxh-architect",
          fix: "pxh-fix-bugs", debug: "pxh-fix-bugs",
          deploy: "pxh-devops", polish: "pxh-ui-ux",
          monitoring: "pxh-pm",
        };
        const agent = st.agent || STATE_MAP[st.state] || "pxh-expert";
        activeAgents[agent] = true;
        resetAgentIdle(agent, 0);
        onEvent({
          type: "agent_state",
          agent,
          tuiState: st.state,
          message: st.message || `${st.state}...`,
        });
      } else if (
        st.agent === "pxh-opencode" &&
        st.state === "Mirror" &&
        st.message
      ) {
        onEvent({
          type: "tui_mirror",
          agent: "pxh-opencode",
          message: st.message,
        });
      } else if (!st.state || st.state === "idle") {
        if (prevState && prevState !== "idle" && workflowActive) {
          workflowActive = false;
          onEvent({ type: "workflow_end", message: "Processing complete", ts: new Date().toISOString() });
        }
        prevState = "idle";
        prevAgent = null;
      }
    } catch {}
  }

  function getRelative(filePath) {
    return path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
  }

  function isIgnored(filePath) {
    const rel = getRelative(filePath);
    const parts = rel.split("/");
    for (const p of parts) {
      if (EXCLUDE_DIRS.has(p)) return true;
    }
    return false;
  }

  function classifyFile(filePath) {
    if (isIgnored(filePath)) return null;
    const name = path.basename(filePath);
    for (const rule of EXT_MAP) {
      if (rule.re.test(name)) {
        return {
          agent: rule.agent,
          action: rule.action,
          file: getRelative(filePath),
        };
      }
    }
    return null;
  }

  const activeAgents = {};
  const idleTimers = {};
  let workspaceWatchTimer = null;
  const pendingFiles = [];
  let workflowActive = false;

  function resetAgentIdle(agent, delay) {
    const isCore = agent === "pxh-help" || agent === "pxh-pm";
    const timeout = isCore ? WORK_IDLE_MS + 12000 : WORK_IDLE_MS + (delay || 0);
    clearTimeout(idleTimers[agent]);
    idleTimers[agent] = setTimeout(() => {
      if (isCore) return;
      onEvent({ type: "agent_state", agent, tuiState: "idle", message: "" });
      delete activeAgents[agent];
      delete idleTimers[agent];
      const remaining = Object.keys(activeAgents).filter(a => a !== "pxh-help" && a !== "pxh-pm");
      if (remaining.length === 0 && workflowActive) {
        workflowActive = false;
        onEvent({ type: "workflow_end", message: "Processing complete", ts: new Date().toISOString() });
      }
    }, timeout);
  }

  function sendSignal(from, to) {
    onEvent({ type: "contract", from, to, message: `${from} -> ${to}` });
  }

  function activateAgent(agent, tuiState, message, delay) {
    if (!activeAgents[agent]) {
      if (agent === "pxh-help") sendSignal("pxh-help", "pxh-pm");
    }
    onEvent({ type: "agent_state", agent, tuiState, message });
    activeAgents[agent] = true;
    resetAgentIdle(agent, delay || 0);
  }

  function processFileChange(cls) {
    const role = AGENT_ROLES[cls.agent];
    const tuiState = role ? role.tuiState : cls.action;
    const message = `${cls.action}: ${cls.file}`;

    activateAgent("pxh-help", "Interface", "Validate & classify input");
    activateAgent("pxh-pm", "Orchestration", "Route & enforce policy");
    activateAgent(cls.agent, tuiState, message);
  }

  function processPendingBatch() {
    if (pendingFiles.length === 0) return;
    if (!workflowActive) {
      workflowActive = true;
      onEvent({ type: "workflow_start", message: "User prompt submitted", ts: new Date().toISOString() });
    }
    const seen = new Set();
    const batch = [];
    for (const c of pendingFiles.splice(0)) {
      if (!seen.has(c.file)) {
        seen.add(c.file);
        batch.push(c);
      }
    }
    batch.forEach((c, idx) => {
      setTimeout(() => processFileChange(c), idx * 400);
    });
  }

  function isStartupGrace() {
    return Date.now() - startedAt < 3000;
  }

  function onWorkspaceFileChange(filePath) {
    if (disposed) return;
    // Suppress file change events during startup window to avoid false
    // positives from OS/VS Code touching files during extension activation
    if (isStartupGrace()) return;
    const cls = classifyFile(filePath);
    if (!cls) return;
    pendingFiles.push(cls);
    clearTimeout(workspaceWatchTimer);
    workspaceWatchTimer = setTimeout(processPendingBatch, DEBOUNCE_MS);
  }

  function watchFileOrDir(filePath, onChange) {
    if (fs.existsSync(filePath)) {
      try {
        const w = fs.watch(filePath, onChange);
        watchers.push(w);
      } catch {}
    }
    try {
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir)) {
        const w = fs.watch(dir, (eventType, filename) => {
          if (filename === path.basename(filePath)) onChange();
        });
        watchers.push(w);
      }
    } catch {}
  }

  watchFileOrDir(eventsFile, readNewEvents);
  watchFileOrDir(stateFile, readState);

  function watchWorkspaceDirs(dir) {
    try {
      if (!fs.existsSync(dir)) return;
      const stat = fs.statSync(dir);
      if (!stat.isDirectory()) return;
      const base = path.basename(dir);
      if (EXCLUDE_DIRS.has(base)) return;
      try {
        const w = fs.watch(dir, { recursive: false }, (eventType, filename) => {
          if (!filename) return;
          const full = path.join(dir, filename);
          const ext = path.extname(filename).toLowerCase();
          if (FS_WATCH_EXTENSIONS.has(ext) && !isIgnored(full)) {
            onWorkspaceFileChange(full);
          }
          try {
            const st = fs.statSync(full);
            if (st.isDirectory() && !EXCLUDE_DIRS.has(path.basename(full))) {
              watchWorkspaceDirs(full);
            }
          } catch {}
        });
        watchers.push(w);
      } catch {}
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory() && !EXCLUDE_DIRS.has(e.name)) {
          watchWorkspaceDirs(path.join(dir, e.name));
        }
      }
    } catch {}
  }

  watchWorkspaceDirs(workspaceRoot);
  readNewEvents();
  readState();

  const pollTimer = setInterval(() => {
    if (disposed) return;
    readNewEvents();
    readState();
  }, 500);

  return {
    dispose() {
      disposed = true;
      clearInterval(pollTimer);
      clearTimeout(workspaceWatchTimer);
      Object.values(idleTimers).forEach(clearTimeout);
      watchers.forEach((w) => { try { w.close(); } catch {} });
    },
  };
}

module.exports = { startWatcher };
