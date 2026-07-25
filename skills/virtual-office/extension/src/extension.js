const vscode = require("vscode");
const path = require("path");
const { OfficeViewProvider } = require("./officeViewProvider");

let eventWatcher = null;
let serverProcess = null;

function activate(context) {
  const provider = new OfficeViewProvider(context.extensionUri, context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("pxh-office.officeView", provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pxh-office.open", () => {
      vscode.commands.executeCommand("pxh-office.officeView.focus");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pxh-office.emitEvent", async () => {
      const agent = await vscode.window.showQuickPick(
        [
          "pxh-help", "pxh-pm", "pxh-architect", "pxh-expert",
          "pxh-fix-bugs", "pxh-qa", "pxh-review-code",
          "pxh-devops", "pxh-ui-ux", "pxh-save-history",
        ],
        { placeHolder: "Select agent" }
      );
      if (!agent) return;

      const states = [
        "thinking", "code", "test", "build", "review", "fix",
        "design", "idle", "Interface", "Orchestration",
      ];
      const state = await vscode.window.showQuickPick(states, {
        placeHolder: "Select state",
      });
      if (!state) return;

      const message = await vscode.window.showInputBox({
        placeHolder: "Message (optional)",
      });

      provider.broadcast({
        type: "agent_state",
        agent,
        tuiState: state,
        message: message || `${state}...`,
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pxh-office.clearEvents", () => {
      provider.clearLogs();
      vscode.window.showInformationMessage("PXH Office: Events cleared");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("pxh-office.refresh", () => {
      provider.refresh();
    })
  );

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (workspaceRoot) {
    const { startWatcher } = require("./eventWatcher");
    eventWatcher = startWatcher(workspaceRoot, (event) => {
      provider.broadcast(event);
    });
    context.subscriptions.push(
      new vscode.Disposable(() => {
        if (eventWatcher) eventWatcher.dispose();
      })
    );

    startServer(context, workspaceRoot);
  }
}

function startServer(context, workspaceRoot) {
  try {
    const serverScript = path.join(
      context.extensionUri.fsPath,
      "..", "templates", "server.mjs"
    );
    if (!require("fs").existsSync(serverScript)) return;

    // Kill stale server + bridge processes from previous sessions
    const { execSync } = require("child_process");
    function killPort(port) {
      try {
        execSync(`netstat -ano | findstr ":${port} " | findstr "LISTENING"`, { encoding: "utf-8" })
          .split("\n").filter(Boolean).forEach(line => {
            const pid = line.trim().split(/\s+/).pop();
            if (pid) { try { execSync(`taskkill /F /PID ${pid}`); } catch {} }
          });
      } catch {}
    }
    killPort(2910);
    killPort(2911);

    const { spawn } = require("child_process");
    serverProcess = spawn("node", [serverScript, "--no-bridge"], {
      cwd: workspaceRoot,
      stdio: "ignore",
      windowsHide: true,
    });

    serverProcess.on("error", () => {
      serverProcess = null;
    });

    serverProcess.on("exit", () => {
      serverProcess = null;
    });

    context.subscriptions.push(
      new vscode.Disposable(() => {
        if (serverProcess) {
          try { serverProcess.kill(); } catch {}
          serverProcess = null;
        }
      })
    );
  } catch (e) { console.error("[PXH Office] startServer error:", e.message); }
}

function deactivate() {
  if (eventWatcher) {
    eventWatcher.dispose();
  }
  if (serverProcess) {
    try { serverProcess.kill(); } catch {}
    serverProcess = null;
  }
}

module.exports = { activate, deactivate };
