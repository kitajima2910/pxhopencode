# Hook opencode TUI -> webview real-time state sync
# Usage: .\hook-opencode.ps1 "your prompt here"
param([string]$Prompt)

$STATE_URL = "http://localhost:2910/state"
$STATE_FILE = "$PSScriptRoot\..\..\..\_shared\opencode-state.json"
$EMIT_URL = "http://localhost:2910/emit"
$MIRROR_URL = "http://localhost:2910/emit"

# Tool action patterns detected from TUI output (keyword)
$TOOL_RX = @{}
$TOOL_RX['planning']   = '(?:plan|planning|prepare|preparing|outline|outlining|todos|organize)'
$TOOL_RX['thinking']   = '(?:thinking|think|analyze|analyzing|reason|reasoning)'
$TOOL_RX['explore']    = '(?:explore|exploring|investigate)'
$TOOL_RX['read']       = '(?:read|reading|load|loading)'
$TOOL_RX['write']      = '(?:write|writing|create|creating|generate)'
$TOOL_RX['edit']       = '(?:edit|editing|modify|update|modifying|updating)'
$TOOL_RX['search']     = '(?:search|searching|find|grep|glob|lookup)'
$TOOL_RX['execute']    = '(?:execute|executing|run|running|bash|command|install|build)'
$TOOL_RX['delegating'] = '(?:delegate|delegating|subagent|assign|routing)'
$TOOL_RX['test']       = '(?:test|testing|verify|verifying)'
$TOOL_RX['review']     = '(?:review|reviewing|audit|inspect)'
$TOOL_RX['fix']        = '(?:fix|fixing|debug|debugging|patch|repair)'
$TOOL_RX['design']     = '(?:design|designing|ui|ux|layout|style)'
$TOOL_RX['save']       = '(?:save|saving|persist|persisting|checkpoint)'
$TOOL_RX['question']   = '(?:question|ask|asking|clarify)'
$TOOL_RX['build']      = '(?:build|building|compile|deploy|lint)'
$TOOL_RX['idle']       = '(?:idle|done|completed|finish|finished|waiting)'
$TOOL_RX['classify']   = '(?:classify|classifying|validate|parsing)'

# Map detected tool state -> agent for TUI output
$TOOL_AGENT_MAP = @{
  'planning'   = 'pxh-pm'
  'thinking'   = 'pxh-pm'
  'explore'    = 'pxh-architect'
  'read'       = 'pxh-expert'
  'write'      = 'pxh-expert'
  'edit'       = 'pxh-expert'
  'search'     = 'pxh-qa'
  'execute'    = 'pxh-devops'
  'delegating' = 'pxh-pm'
  'test'       = 'pxh-qa'
  'review'     = 'pxh-review-code'
  'fix'        = 'pxh-fix-bugs'
  'design'     = 'pxh-architect'
  'save'       = 'pxh-save-history'
  'question'   = 'pxh-pm'
  'build'      = 'pxh-devops'
  'classify'   = 'pxh-help'
}

# Tool state -> TUI display state mapping
$TOOL_STATE_MAP = @{
  'planning'   = 'Orchestration'
  'thinking'   = 'thinking'
  'explore'    = 'explore'
  'read'       = 'read'
  'write'      = 'Code'
  'edit'       = 'Code'
  'search'     = 'search'
  'execute'    = 'Build'
  'delegating' = 'delegating'
  'test'       = 'Test'
  'review'     = 'Review'
  'fix'        = 'Debug'
  'design'     = 'Design'
  'save'       = 'Infrastructure'
  'question'   = 'question'
  'build'      = 'Build'
  'classify'   = 'Interface'
}

# Agent name patterns - fallback when no tool detected
$AGENT_PATTERNS = @(
  @{ re='pxh-architect';  agent='pxh-architect';  state='Design';      msg='Designing architecture' }
  @{ re='pxh-expert';     agent='pxh-expert';     state='Code';        msg='Coding' }
  @{ re='pxh-fix-bugs';   agent='pxh-fix-bugs';   state='Debug';       msg='Fixing bugs' }
  @{ re='pxh-qa';         agent='pxh-qa';         state='Test';        msg='Running tests' }
  @{ re='pxh-review-code';agent='pxh-review-code';state='Review';      msg='Reviewing' }
  @{ re='pxh-devops';     agent='pxh-devops';     state='Build';       msg='Building' }
  @{ re='pxh-ui-ux';      agent='pxh-ui-ux';      state='Design';      msg='Designing UI' }
  @{ re='pxh-save-history';agent='pxh-save-history';state='Infrastructure';msg='Saving state' }
  @{ re='pxh-help';       agent='pxh-help';       state='Interface';   msg='Classifying' }
  @{ re='pxh-pm';         agent='pxh-pm';         state='Orchestration';msg='Routing' }
)

function Send-Agent($agent, $state, $msg) {
  $body = @{ state=$state; agent=$agent; message=$msg } | ConvertTo-Json -Compress
  try {
    [System.IO.File]::WriteAllText($STATE_FILE, $body)
    Invoke-RestMethod -Uri $STATE_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
  } catch {}
}

function Send-Mirror($lineText) {
  $body = @{ type='tui_mirror'; agent='pxh-opencode'; message=$lineText } | ConvertTo-Json -Compress
  try {
    [System.IO.File]::WriteAllText($STATE_FILE, (@{ state='Mirror'; agent='pxh-opencode'; message=$lineText } | ConvertTo-Json -Compress))
    Invoke-RestMethod -Uri $MIRROR_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null
  } catch {}
}

function Idle-All {
  foreach($p in $AGENT_PATTERNS) {
    $body = @{ state='idle'; agent=$p.agent; message='' } | ConvertTo-Json -Compress
    try { Invoke-RestMethod -Uri $EMIT_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null } catch {}
  }
}

function Clean-Line($raw) {
  $s = $raw -replace '\e\[[0-9;]*[a-zA-Z]','' -replace '\e\][0-9;]*[a-zA-Z]',''
  $s = $s -replace '^\s+|\s+$',''
  return $s
}

# Detect tool state from a cleaned TUI line
function Detect-Tool {
  param([string]$Line)
  foreach($entry in $TOOL_RX.GetEnumerator()) {
    if($Line -match $entry.Value) { return $entry.Key }
  }
  return $null
}

# Detect agent name from line
function Detect-Agent {
  param([string]$Line)
  foreach($p in $AGENT_PATTERNS) {
    if($Line -match $p.re) { return $p }
  }
  return $null
}

Write-Host "Hook active - watching TUI for agent states..." -ForegroundColor Cyan

if($Prompt) {
  Send-Agent 'pxh-help' 'Interface' "Classifying: $Prompt"
  Send-Agent 'pxh-pm' 'Orchestration' "Processing: $Prompt"
}

$proc = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -Command opencode '$Prompt'" -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\opencode-out.txt" -RedirectStandardError "$env:TEMP\opencode-err.txt"

if(-not $proc) {
  Write-Host "ERROR: opencode not found in PATH" -ForegroundColor Red
  exit 1
}

$activeAgents = @{}
$agentCooldown = @{}
$lastCheck = Get-Date
$outFile = "$env:TEMP\opencode-out.txt"
$errFile = "$env:TEMP\opencode-err.txt"
$lastOutPos = 0
$lastErrPos = 0

function Read-NewLines($filePath, [ref]$lastPos) {
  if(-not (Test-Path $filePath)) { return @() }
  try {
    $stream = [System.IO.File]::Open($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    $len = $stream.Length
    if($len -lt $lastPos.Value) { $lastPos.Value = 0 }
    if($len -le $lastPos.Value) { $stream.Close(); return @() }
    $stream.Seek($lastPos.Value, [System.IO.SeekOrigin]::Begin) | Out-Null
    $buf = New-Object byte[] ($len - $lastPos.Value)
    $read = $stream.Read($buf, 0, $buf.Length)
    $lastPos.Value = $stream.Position
    $stream.Close()
    $text = [System.Text.Encoding]::UTF8.GetString($buf, 0, $read)
    return $text -split '\r?\n' | Where-Object { $_ }
  } catch { return @() }
}

while(!$proc.HasExited) {
  Start-Sleep -Milliseconds 150

  $now = Get-Date
  $newLines = Read-NewLines $outFile ([ref]$lastOutPos)
  $newLines += Read-NewLines $errFile ([ref]$lastErrPos)

  if($newLines.Count -eq 0) { continue }
  $foundAny = $false

  foreach($raw in $newLines) {
    $clean = Clean-Line $raw
    if([string]::IsNullOrWhiteSpace($clean)) { continue }

    # Mirror EVERY line to PXHOpenCode
    Send-Mirror $clean

    # Step 1: Try to detect tool state from the line
    $detectedTool = Detect-Tool -Line $clean
    $detectedAgent = Detect-Agent -Line $clean

    $targetAgent = $null
    $targetState = $null
    $targetMsg = $null

    # Format actual TUI line for speech bubble (truncate to 50 chars)
    $lineMsg = $clean; if($lineMsg.Length -gt 50) { $lineMsg = $lineMsg.Substring(0,47) + '...' }

    if($detectedTool) {
      # Map tool -> agent using TOOL_AGENT_MAP
      $toolAgent = $TOOL_AGENT_MAP[$detectedTool]
      $toolState = $TOOL_STATE_MAP[$detectedTool]

      if($detectedAgent) {
        # Both tool AND agent detected
        $targetAgent = $detectedAgent.agent
        $targetState = $toolState
        $targetMsg = $lineMsg
      }
      elseif($toolAgent) {
        # Only tool detected: use mapped agent + actual line
        $targetAgent = $toolAgent
        $targetState = $toolState
        $targetMsg = $lineMsg
      }
    }

    # Step 2: Fallback - only agent detected, no tool
    if(-not $targetAgent -and $detectedAgent) {
      $targetAgent = $detectedAgent.agent
      $targetState = $detectedAgent.state
      $targetMsg = $lineMsg
    }

    # Step 3: Send if we have a target
    if($targetAgent -and $targetState) {
      if(-not $activeAgents[$targetAgent]) {
        Write-Host "  -> $targetAgent [$targetState]: $targetMsg" -ForegroundColor Green
        Send-Agent $targetAgent $targetState $targetMsg
        $agentCooldown[$targetAgent] = $now
      } elseif(($now - $agentCooldown[$targetAgent]).TotalMilliseconds -ge 800) {
        Send-Agent $targetAgent $targetState $targetMsg
        $agentCooldown[$targetAgent] = $now
      }
      $activeAgents[$targetAgent] = $now
      $foundAny = $true
    }
  }

  # Idle agents not seen for 60 seconds
  foreach($ag in $activeAgents.Keys.Clone()) {
    if(($now - $activeAgents[$ag]).TotalSeconds -gt 60) {
      Write-Host "  <- $ag done" -ForegroundColor DarkGray
      $body = @{ state='idle'; agent=$ag; message='' } | ConvertTo-Json -Compress
      try { Invoke-RestMethod -Uri $EMIT_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null } catch {}
      $activeAgents.Remove($ag)
    }
  }
}

$proc.WaitForExit()
Idle-All
Write-Host "Session ended" -ForegroundColor Green
