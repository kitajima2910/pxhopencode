const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
      } else if (msg.command === "pxh_exec") {
        // Execute terminal command in workspace root
        const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (!wsRoot) {
          this._send({ type: "tui_mirror", agent: "pxh-opencode", message: "[error] No workspace folder open" });
          return;
        }
        const { exec } = require("child_process");
        const child = exec(msg.text, { cwd: wsRoot, maxBuffer: 1024 * 1024, timeout: 600000 });
        
        child.stdout.on("data", (data) => {
          const lines = data.toString().split("\n").filter(Boolean);
          lines.forEach((line) => {
            this._send({ type: "tui_mirror", agent: "pxh-opencode", message: line.trim() });
          });
        });
        
        child.stderr.on("data", (data) => {
          const lines = data.toString().split("\n").filter(Boolean);
          lines.forEach((line) => {
            this._send({ type: "tui_mirror", agent: "pxh-opencode", message: "[stderr] " + line.trim() });
          });
        });
        
        child.on("error", (err) => {
          this._send({ type: "tui_mirror", agent: "pxh-opencode", message: "[error] " + err.message });
          this._send({ type: "workflow_end", message: "Command failed" });
        });
        
        child.on("close", (code) => {
          this._send({ type: "tui_mirror", agent: "pxh-opencode", message: `[done] Exit code: ${code}` });
          this._send({ type: "workflow_end", message: `Command finished (exit: ${code})` });
        });
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

    // Nonce-based CSP: generate per-request nonce, inline JS files
    const nonce = crypto.randomBytes(16).toString('base64');
    const rendererStatePath = path.join(this._extensionUri.fsPath, 'media', 'renderer-state.js');
    const officeJsPath = path.join(this._extensionUri.fsPath, 'media', 'office.js');

    html = html.replace(/NONCE/g, nonce);
    html = html.replace('/* RENDERER_STATE */', fs.readFileSync(rendererStatePath, 'utf-8'));
    html = html.replace('/* OFFICE_JS */', fs.readFileSync(officeJsPath, 'utf-8'));

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
