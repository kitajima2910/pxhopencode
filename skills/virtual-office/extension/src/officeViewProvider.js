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

    html = html.replace(
      "mode:location.protocol==='http:'||location.protocol==='https:'?'sse':'demo'",
      "mode:'vscode'"
    );

    html = html.replace(
      /function connectSSE\(\)\{[^}]*connectSSE,3000\)\}\)\}/,
      "function connectSSE(){}"
    );

    html = html.replace(
      /if\(state\.mode==='sse'\)\{[^}]*\}else\{[^}]*\}/,
      "addLog('Extension \u2014 VS Code sidebar','#58a6ff')"
    );

    const vscodeScript = `
<script>
(function() {
  window.addEventListener('message', function(e) {
    try {
      var ev = e.data;
      if (!ev || !ev.type) return;
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
        return;
      }
      if (typeof processEvent === 'function') processEvent(ev);
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
