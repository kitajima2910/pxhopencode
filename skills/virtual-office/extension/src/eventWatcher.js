const fs = require("fs");
const path = require("path");

function startWatcher(workspaceRoot, onEvent) {
  const sharedDir = path.join(workspaceRoot, "_shared");
  const eventsFile = path.join(sharedDir, "office-events.log");
  const stateFile = path.join(sharedDir, "opencode-state.json");

  let eventsSize = 0;
  let prevState = null;
  const watchers = [];

  try { fs.mkdirSync(sharedDir, { recursive: true }); } catch {}

  try {
    if (fs.existsSync(eventsFile)) {
      eventsSize = fs.statSync(eventsFile).size;
    }
  } catch {}

  function readNewEvents() {
    try {
      if (!fs.existsSync(eventsFile)) return;
      const stats = fs.statSync(eventsFile);
      if (stats.size < eventsSize) eventsSize = 0;
      if (stats.size <= eventsSize) return;
      const fd = fs.openSync(eventsFile, "r");
      const buf = Buffer.alloc(stats.size - eventsSize);
      fs.readSync(fd, buf, 0, buf.length, eventsSize);
      fs.closeSync(fd);
      eventsSize = stats.size;
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
      if (st.state && st.state !== prevState) {
        prevState = st.state;
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
      }
    } catch {}
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

  readNewEvents();
  readState();

  const pollTimer = setInterval(() => {
    readNewEvents();
    readState();
  }, 500);

  return {
    dispose() {
      clearInterval(pollTimer);
      watchers.forEach((w) => { try { w.close(); } catch {} });
    },
  };
}

module.exports = { startWatcher };
