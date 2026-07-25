const fs = require("fs");
const path = require("path");
const os = require("os");

function startWatcher(workspaceRoot, onEvent) {
  const sharedDir = path.join(workspaceRoot, "_shared");
  const eventsFile = path.join(sharedDir, "office-events.log");
  const stateFile = path.join(sharedDir, "opencode-state.json");
  const activityFile = path.join(sharedDir, "opencode-activity.log");

  let eventsSize = 0;
  let prevState = null;
  let prevActivitySize = 0;
  let lastActivityMtime = 0;
  let activityWorkflowActive = false;
  const watchers = [];
  let disposed = false;

  // Activity detection: how long without file changes before considering idle
  const ACTIVITY_TIMEOUT_MS = 15000;

  try { fs.mkdirSync(sharedDir, { recursive: true }); } catch {}

  // Clear stale state from previous session — office starts fresh
  try { fs.writeFileSync(eventsFile, ""); } catch {}
  try { fs.writeFileSync(stateFile, JSON.stringify({ state: "idle" })); } catch {}
  const startedAt = Date.now(); // suppress workspace events during startup window

  let lastEventsActivity = 0;

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
      if (lines.length) lastEventsActivity = Date.now();
      lines.forEach((line) => {
        try {
          const event = JSON.parse(line);
          onEvent(event);
        } catch {}
      });
    } catch {}
  }

  // ── Fallback: read state file directly when server.mjs isn't running ──
  // Server.mjs writes events to office-events.log when active.
  // If events log hasn't had activity in 3s, fall back to direct state file read.
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
  }
  let fallbackWorkflowActive = false;

  function readStateFallback() {
    // Skip if server.mjs events log was recently active
    if (Date.now() - lastEventsActivity < 3000) return;
    try {
      if (!fs.existsSync(stateFile)) return;
      const raw = fs.readFileSync(stateFile, "utf-8");
      const st = JSON.parse(raw);
      if (isStartupGrace()) {
        prevState = st.state || "idle";
        return;
      }

      if (st.state === "workflow_start") {
        if (!fallbackWorkflowActive) {
          fallbackWorkflowActive = true;
          onEvent({ type: "workflow_start", message: st.message || "Workflow started", ts: new Date().toISOString() });
        }
        prevState = st.state;
        return;
      }

      if (st.state === "workflow_end") {
        if (fallbackWorkflowActive) {
          fallbackWorkflowActive = false;
          onEvent({ type: "workflow_end", message: st.message || "Workflow ended", ts: new Date().toISOString() });
        }
        prevState = "idle";
        return;
      }

      // ── pxh-opencode mirror (check BEFORE generic non-idle) ──
      if (st.agent === "pxh-opencode" && st.state === "Mirror" && st.message) {
        onEvent({ type: "tui_mirror", agent: "pxh-opencode", message: st.message });
        return;
      }

      if (st.state && st.state !== "idle" && st.state !== prevState) {
        prevState = st.state;
        if (!fallbackWorkflowActive) {
          fallbackWorkflowActive = true;
          onEvent({ type: "workflow_start", message: "User prompt submitted", ts: new Date().toISOString() });
        }
        const agent = st.agent || STATE_MAP[st.state] || "pxh-expert";
        onEvent({ type: "agent_state", agent, tuiState: st.state, message: st.message || `${st.state}...` });
        return;
      }

      if (!st.state || st.state === "idle") {
        if (prevState && prevState !== "idle" && fallbackWorkflowActive) {
          fallbackWorkflowActive = false;
          onEvent({ type: "workflow_end", message: "Processing complete", ts: new Date().toISOString() });
        }
        prevState = "idle";
        return;
      }
    } catch {}
  }

  // ── Activity log watcher: detect ANY new content in opencode-activity.log ──
  // This is a separate fallback that detects opencode activity by monitoring
  // the activity log file for any changes (timestamps, new lines, etc.)
  function checkActivityLog() {
    try {
      if (!fs.existsSync(activityFile)) return;
      if (isStartupGrace()) {
        // On first poll, just record mtime without firing events
        const stats = fs.statSync(activityFile);
        lastActivityMtime = stats.mtimeMs;
        prevActivitySize = stats.size;
        return;
      }
      const stats = fs.statSync(activityFile);
      const mtime = stats.mtimeMs;

      if (mtime !== lastActivityMtime) {
        // File was modified — read new content to find workflow markers
        const raw = fs.readFileSync(activityFile, "utf-8");

        // Detect workflow markers in the activity log (delta-based: only check new content)
        const hasWorkflowStart = raw.lastIndexOf("[workflow_start]") > prevActivitySize;
        const hasWorkflowEnd = raw.lastIndexOf("[workflow_end]") > prevActivitySize;

        // If we see a NEW workflow_start marker → activate
        if (hasWorkflowStart && !activityWorkflowActive) {
          activityWorkflowActive = true;
          onEvent({ type: "workflow_start", message: "Activity log: workflow detected", ts: new Date().toISOString() });
        }

        // If we see a NEW workflow_end marker → deactivate
        if (hasWorkflowEnd && activityWorkflowActive) {
          activityWorkflowActive = false;
          onEvent({ type: "workflow_end", message: "Activity log: workflow ended", ts: new Date().toISOString() });
        }

        // If file grew but no explicit markers → consider generic activity (retroactive activate)
        if (stats.size > prevActivitySize && !hasWorkflowStart && !hasWorkflowEnd) {
          if (!activityWorkflowActive) {
            activityWorkflowActive = true;
            onEvent({ type: "workflow_start", message: "Activity log: activity detected", ts: new Date().toISOString() });
          }
        }

        lastActivityMtime = mtime;
        prevActivitySize = stats.size;
      }

      // Check for timeout: if file hasn't changed for ACTIVITY_TIMEOUT_MS → end session
      if (activityWorkflowActive && (Date.now() - mtime > ACTIVITY_TIMEOUT_MS)) {
        activityWorkflowActive = false;
        onEvent({ type: "workflow_end", message: "Activity timeout: no activity for " + (ACTIVITY_TIMEOUT_MS/1000) + "s", ts: new Date().toISOString() });
      }
    } catch {}
  }

  // ── OpenCode temp file detector ──
  // OpenCode creates temp output files (opencode-out*.txt) in the system TEMP dir
  // during prompt processing. Check if any exist and are recently modified.
  function checkOpenCodeTempFiles() {
    if (activityWorkflowActive) return; // Already active, no need to check
    try {
      const tempDir = os.tmpdir();
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      let hasRecentActivity = false;

      for (const name of files) {
        if (name.indexOf("opencode-out") === 0 && name.endsWith(".txt")) {
          const fp = path.join(tempDir, name);
          try {
            const st = fs.statSync(fp);
            if (now - st.mtimeMs < ACTIVITY_TIMEOUT_MS) {
              hasRecentActivity = true;
              break;
            }
          } catch {}
        }
      }

      if (hasRecentActivity && !activityWorkflowActive) {
        activityWorkflowActive = true;
        onEvent({ type: "workflow_start", message: "Temp file: opencode session active", ts: new Date().toISOString() });
      }
    } catch {}
  }

  function isStartupGrace() {
    return Date.now() - startedAt < 3000;
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
  watchFileOrDir(stateFile, readStateFallback);
  watchFileOrDir(activityFile, checkActivityLog);

  readNewEvents();
  readStateFallback();
  checkActivityLog();

  const pollTimer = setInterval(() => {
    if (disposed) return;
    readNewEvents();
    readStateFallback();
    checkActivityLog();
    checkOpenCodeTempFiles();
  }, 500);

  return {
    dispose() {
      disposed = true;
      clearInterval(pollTimer);
      watchers.forEach((w) => { try { w.close(); } catch {} });
    },
  };
}

module.exports = { startWatcher };
