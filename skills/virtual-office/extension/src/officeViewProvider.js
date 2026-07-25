const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

class OfficeViewProvider {
  constructor(extensionUri, context) {
    this._extensionUri = extensionUri;
    this._context = context;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.command === "log") {
        console.log("[PXH Office]", msg.text);
      }
    });

    if (this._pendingEvents) {
      this._pendingEvents.forEach((e) => this._send(e));
      this._pendingEvents = null;
    }
  }

  broadcast(event) {
    if (this._view) {
      this._send(event);
    } else {
      if (!this._pendingEvents) this._pendingEvents = [];
      this._pendingEvents.push(event);
    }
  }

  clearLogs() {
    if (this._view) {
      this._send({ type: "clear" });
    }
  }

  refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtml();
    }
  }

  _send(data) {
    try {
      this._view.webview.postMessage(data);
    } catch {}
  }

  _getHtml() {
    const templatePath = path.join(
      this._extensionUri.fsPath,
      "media",
      "office.html"
    );

    let html;
    try {
      html = fs.readFileSync(templatePath, "utf-8");
    } catch {
      return this._fallbackHtml();
    }

    // Inline renderer-state.js (VSCode webview uses data URL, can't resolve external scripts)
    let rendererStateJs = null;

    // Try 1: from extension media dir (always included in packaged extension)
    const mediaPath = path.join(
      this._extensionUri.fsPath,
      "media", "renderer-state.js"
    );
    try {
      rendererStateJs = fs.readFileSync(mediaPath, "utf-8");
    } catch {
      // Try 2: from extension templates dir (development mode)
      try {
        const tmplPath = path.join(
          this._extensionUri.fsPath,
          "..", "templates", "renderer-state.js"
        );
        if (fs.existsSync(tmplPath)) {
          rendererStateJs = fs.readFileSync(tmplPath, "utf-8");
        }
      } catch {
        // Try 3: from workspace root (standalone installed extension)
        try {
          const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
          if (wsRoot) {
            const altPath = path.join(wsRoot, 'skills', 'virtual-office', 'templates', 'renderer-state.js');
            if (fs.existsSync(altPath)) {
              rendererStateJs = fs.readFileSync(altPath, 'utf-8');
            }
          }
        } catch {}
      }
    }

    // Always replace the script src tag (empty fallback prevents 403 in webview)
    // Escape </script> to prevent HTML parser from breaking on it inside JSDoc comments
    if (rendererStateJs) {
      rendererStateJs = rendererStateJs.replace(/<\/script>/gi, '<\\/script>');
    }
    html = html.replace(
      '<script src="renderer-state.js"></script>',
      '<script>' + (rendererStateJs || '') + '</script>'
    );

    // Ensure StateStore is always defined — inject stub if file not found
    if (!rendererStateJs) {
      const stateStoreStub = `/** StateStore stub — file not found, using fallback */
const StateStore = (function() {
  var M = {};
  var _agents = {}, _session = { active: false, phase: 'idle', workflow: '—', startTime: null };
  var _listeners = [], _signalListeners = [];
  var _connected = false;
  M.connect = function() { _connected = true; };
  M.disconnect = function() { _connected = false; };
  M.isConnected = function() { return _connected; };
  M.onChange = function(fn) { _listeners.push(fn); };
  M.onSignal = function(fn) { _signalListeners.push(fn); };
  M.getAgent = function(id) { return _agents[id] || null; };
  M.getAllAgents = function() { return _agents; };
  M.getSession = function() { return Object.assign({}, _session); };
  M._applySnapshot = function(s) {
    if(s.agents) { for(var k in s.agents) { _agents[k] = Object.assign({}, s.agents[k]); } }
    if(s.session) { Object.assign(_session, s.session); }
    for(var i=0;i<_listeners.length;i++){try{_listeners[i]({type:'snapshot',session:_session,agents:_agents})}catch(e){}}
  };
  M._applyDiff = function(d) {
    if(d.session) { Object.assign(_session, d.session); }
    if(d.agents) { var ca=[]; for(var k in d.agents) { _agents[k] = Object.assign({}, d.agents[k]); ca.push(k); } }
    for(var i=0;i<_listeners.length;i++){try{_listeners[i]({type:'diff',session:_session,agents:_agents,changedAgents:ca||[]})}catch(e){}}
  };
  if(typeof module !== 'undefined' && module.exports) { module.exports = M; }
  return M;
})();\n`;
      html = html.replace(
        '<script></script>',
        '<script>\n' + stateStoreStub + '\n</script>'
      );
    }

    // Set mode to 'vscode' bypassing SSE
    html = html.replace(
      "mode:location.protocol==='http:'||location.protocol==='https:'?'sse':'demo'",
      "mode:'vscode'"
    );

    // Replace SSE connection with VSCode postMessage bridge
    html = html.replace(
      /function connectToRuntime\(\)\{[\s\S]*?StateStore\.onSignal\(applySignal\)\s*\}/,
      "function connectToRuntime(){addLog('Extension — VS Code sidebar','#58a6ff');StateStore.onSignal(applySignal)}"
    );

    // Inject VSCode postMessage → StateStore bridge
    const vscodeScript = `
<script>
(function() {
  // Agent metadata for normalizing raw VSCode events
  var STATE_AGENT_MAP = {
    thinking: 'pxh-expert', explore: 'pxh-architect', read: 'pxh-help',
    deleg: 'pxh-pm', edit: 'pxh-expert', write: 'pxh-expert',
    bash: 'pxh-devops', grep: 'pxh-qa', glob: 'pxh-qa',
    list: 'pxh-qa', task: 'pxh-pm', websearch: 'pxh-help',
    webfetch: 'pxh-help', lsp: 'pxh-expert', skill: 'pxh-expert',
    question: 'pxh-pm', doom_loop: 'pxh-fix-bugs',
    review: 'pxh-review-code', test: 'pxh-qa', build: 'pxh-devops',
    design: 'pxh-architect', save: 'pxh-save-history',
    classify: 'pxh-help', route: 'pxh-pm',
    planning: 'pxh-pm', plan: 'pxh-pm', prepare: 'pxh-expert',
    todos: 'pxh-pm', todo: 'pxh-pm', outline: 'pxh-architect',
    fix: 'pxh-fix-bugs', debug: 'pxh-fix-bugs',
    deploy: 'pxh-devops', polish: 'pxh-ui-ux',
    monitoring: 'pxh-pm',
  };

  function normalizeVSCodeEvent(ev) {
    if (ev.type === 'clear') {
      if (typeof chars !== 'undefined' && chars) {
        Object.keys(chars).forEach(function(k) {
          var ch = chars[k];
          if (ch && typeof ch === 'object') {
            ch.state = 'idle'; ch.w = false; ch.tsm = ''; ch.ts = '';
            ch._msgs = []; ch._monitorLog = [];
            if (ch.ti) { clearInterval(ch.ti); ch.ti = null; }
          }
        });
        if (typeof contracts !== 'undefined') contracts.length = 0;
        if (typeof doneNotifs !== 'undefined') doneNotifs.length = 0;
        if (typeof sysLogs !== 'undefined') sysLogs.length = 0;
      }
      return null;
    }

    if (ev.type === 'workflow_start') {
      return {
        session: { active: true, phase: 'Interface', workflow: '/vibe', startTime: Date.now() },
        agents: {
          'pxh-help': { currentState: 'typing', badge: 'Interface', message: '', active: true, color: '#58a6ff' },
          'pxh-pm': { currentState: 'typing', badge: 'Orchestration', message: '', active: true, color: '#d29922' },
          'pxh-opencode': { currentState: 'typing', badge: 'Synced', message: '', active: true, color: '#00e5ff' },
        },
        changedAgents: ['pxh-help','pxh-pm','pxh-opencode']
      };
    }

    if (ev.type === 'workflow_end') {
      // Reset all agents
      var allAgents = {};
      var allIds = Object.keys(typeof AGENTS !== 'undefined' ? AGENTS : {});
      if (!allIds.length) allIds = ['pxh-help','pxh-pm','pxh-architect','pxh-expert','pxh-fix-bugs','pxh-qa','pxh-review-code','pxh-devops','pxh-ui-ux','pxh-save-history','pxh-opencode'];
      for (var i=0;i<allIds.length;i++) {
        allAgents[allIds[i]] = { currentState: 'idle', badge: '', message: '', active: false };
      }
      return {
        session: { active: false, phase: 'idle', workflow: '—' },
        agents: allAgents,
        changedAgents: allIds
      };
    }

    if (ev.type === 'agent_state') {
      var agentId = ev.agent || STATE_AGENT_MAP[ev.tuiState] || 'pxh-expert';
      var st = ev.tuiState || ev.state || '';
      var isIdle = st === 'idle' || !st;
      var isReading = !!(st && st.match(/read|search|find|grep|glob|explore|think|classify|monitor|question/i));
      return {
        agents: {
          [agentId]: {
            currentState: isIdle ? 'idle' : (isReading ? 'reading' : 'typing'),
            badge: isIdle ? '' : (st || 'Working'),
            message: ev.message || '',
            active: !isIdle,
            activeTool: isIdle ? null : st,
            isReading: !isIdle && isReading,
            color: '#888'
          }
        },
        changedAgents: [agentId]
      };
    }

    if (ev.type === 'tui_mirror') {
      var msg = (ev.message || ev.line || '').trim();
      if (msg.length > 200) msg = msg.slice(0, 197) + '...';
      return {
        agents: {
          'pxh-opencode': {
            currentState: 'typing',
            badge: 'Synced',
            message: msg,
            active: true,
            color: '#00e5ff'
          }
        },
        changedAgents: ['pxh-opencode']
      };
    }

    if (ev.type === 'contract' && ev.from && ev.to) {
      if (typeof applySignal === 'function') {
        applySignal({ from: ev.from, to: ev.to });
      }
      return null;
    }

    return null;
  }

  var _vscodeApi = acquireVsCodeApi();

  window.addEventListener('message', function(e) {
    try {
      var ev = e.data;
      if (!ev || !ev.type) return;

      var diff = normalizeVSCodeEvent(ev);
      if (diff && typeof applyStateDiff === 'function') {
        applyStateDiff(diff);
      }
    } catch(ex) {}
  });
})();
</script>
`;

    html = html.replace("</body>", vscodeScript + "\n</body>");

    return html;
  }

  _fallbackHtml() {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); padding: 20px; text-align: center; }
  h2 { color: var(--vscode-textLink-foreground); }
</style>
</head>
<body>
  <h2>PXH Virtual Office</h2>
  <p>office.html not found in extension media/ directory.</p>
</body>
</html>`;
  }
}

module.exports = { OfficeViewProvider };
