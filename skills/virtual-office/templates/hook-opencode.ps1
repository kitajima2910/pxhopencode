# Hook opencode TUI → webview real-time state sync
# Usage: .\hook-opencode.ps1 "your prompt here"
param([string]$Prompt)

$STATE_URL = "http://localhost:2910/state"
$STATE_FILE = "$PSScriptRoot\..\..\..\_shared\opencode-state.json"
$EMIT_URL = "http://localhost:2910/emit"

# Agent name patterns to detect in TUI output
$AGENT_PATTERNS = @(
  @{ re='pxh-architect';  agent='pxh-architect';  state='Design';      msg='🏗️ Designing architecture' },
  @{ re='pxh-expert';     agent='pxh-expert';     state='Code';        msg='✍️ Coding' },
  @{ re='pxh-fix-bugs';   agent='pxh-fix-bugs';   state='Debug';       msg='🐛 Fixing bugs' },
  @{ re='pxh-qa';         agent='pxh-qa';         state='Test';        msg='🧪 Running tests' },
  @{ re='pxh-review-code';agent='pxh-review-code';state='Review';      msg='🔍 Reviewing' },
  @{ re='pxh-devops';     agent='pxh-devops';     state='Build';       msg='⚙️ Building' },
  @{ re='pxh-ui-ux';      agent='pxh-ui-ux';      state='Design';      msg='🎨 Designing UI' },
  @{ re='pxh-save-history';agent='pxh-save-history';state='Infrastructure';msg='💾 Saving state' },
  @{ re='pxh-help';       agent='pxh-help';       state='Interface';   msg='🔍 Classifying' },
  @{ re='pxh-pm';         agent='pxh-pm';         state='Orchestration';msg='📋 Routing' }
)

function Send-Agent($agent, $state, $msg) {
  $body = @{ state=$state; agent=$agent; message=$msg } | ConvertTo-Json -Compress
  try {
    # Write state file (server watches this)
    [System.IO.File]::WriteAllText($STATE_FILE, $body)
    # Also POST to /state endpoint
    Invoke-RestMethod -Uri $STATE_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
  } catch {}
}

function Idle-All {
  foreach($p in $AGENT_PATTERNS) {
    $body = @{ state='idle'; agent=$p.agent; message='' } | ConvertTo-Json -Compress
    try { Invoke-RestMethod -Uri $EMIT_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null } catch {}
  }
}

Write-Host "🔌 Hook active — watching TUI for agent mentions..." -ForegroundColor Cyan

if($Prompt) {
  Send-Agent 'pxh-help' 'Interface' "🔍 Classifying: $Prompt"
  Send-Agent 'pxh-pm' 'Orchestration' "📋 Processing: $Prompt"
}

$proc = Start-Process -FilePath "opencode" -ArgumentList $Prompt -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\opencode-out.txt" -RedirectStandardError "$env:TEMP\opencode-err.txt"

if(-not $proc) {
  Write-Host "❌ opencode not found in PATH" -ForegroundColor Red
  exit 1
}

$activeAgents = @{}
$agentCooldown = @{}  # per-agent cooldown in ms
$lastCheck = Get-Date

# Strip ANSI escape codes
function Clean-Line($raw) {
  $s = $raw -replace '\e\[[0-9;]*[a-zA-Z]','' -replace '\e\][0-9;]*[a-zA-Z]',''
  $s = $s -replace '^\s+|\s+$',''
  return $s
}

# Extract content after agent name mention for readable message
function Extract-Msg($line, $agentName) {
  $clean = Clean-Line $line
  # Try to get content after agent name: "...pxh-expert... ✍️ Editing src/foo.ts"
  $idx = $clean.IndexOf($agentName)
  if($idx -ge 0) {
    $after = $clean.Substring($idx + $agentName.Length).Trim()
    $after = $after -replace '^[:>\]]+\s*',''
    if($after.Length -gt 44) { $after = $after.Substring(0,41) + '...' }
    if($after.Length -gt 0) { return $after }
  }
  # Fallback: use last meaningful part of line
  $parts = $clean -split '\s{2,}'
  $last = $parts[-1].Trim()
  if($last.Length -gt 44) { $last = $last.Substring(0,41) + '...' }
  return $last
}

while(!$proc.HasExited) {
  Start-Sleep -Milliseconds 200
  if(-not (Test-Path "$env:TEMP\opencode-out.txt")) { continue }

  $lines = Get-Content "$env:TEMP\opencode-out.txt" -Tail 15 -ErrorAction SilentlyContinue
  $foundAny = $false
  $now = Get-Date

  foreach($line in $lines) {
    $clean = Clean-Line $line
    if([string]::IsNullOrWhiteSpace($clean)) { continue }

    foreach($p in $AGENT_PATTERNS) {
      if($clean -match $p.re) {
        # Extract real message from the actual TUI line
        $realMsg = Extract-Msg $line $p.agent
        $displayMsg = if($realMsg) { $realMsg } else { $p.msg }

        if(-not $activeAgents[$p.agent]) {
          Write-Host "  → $($p.agent): $displayMsg" -ForegroundColor Green
          Send-Agent $p.agent $p.state $displayMsg
          $agentCooldown[$p.agent] = $now
        } elseif(($now - $agentCooldown[$p.agent]).TotalMilliseconds -ge 2500) {
          Send-Agent $p.agent $p.state $displayMsg
          $agentCooldown[$p.agent] = $now
        }
        $activeAgents[$p.agent] = $now
        $foundAny = $true
      }
    }
  }

  # Idle agents not seen for 60 seconds (agent stays while TUI is working on it)
  foreach($ag in $activeAgents.Keys.Clone()) {
    if(($now - $activeAgents[$ag]).TotalSeconds -gt 60) {
      Write-Host "  ← $ag done" -ForegroundColor DarkGray
      $body = @{ state='idle'; agent=$ag; message='' } | ConvertTo-Json -Compress
      try { Invoke-RestMethod -Uri $EMIT_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null } catch {}
      $activeAgents.Remove($ag)
    }
  }
}

$proc.WaitForExit()
Idle-All
Write-Host "✅ Session kết thúc" -ForegroundColor Green
