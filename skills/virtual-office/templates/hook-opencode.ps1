# Hook opencode TUI → webview real-time state sync
# Usage: .\hook-opencode.ps1 "your prompt here"
# Or:    .\hook-opencode.ps1 -Prompt "build a todo app"
param([string]$Prompt)

$STATE_URL = "http://localhost:2910/state"
$STATE_FILE = "$PSScriptRoot\..\..\..\_shared\opencode-state.json"

$STATE_MAP = @{
  'Read'     = @{ state='read';     agent='pxh-help' }
  'Write'    = @{ state='write';    agent='pxh-expert' }
  'Edit'     = @{ state='edit';     agent='pxh-expert' }
  'Bash'     = @{ state='bash';     agent='pxh-devops' }
  'Grep'     = @{ state='grep';     agent='pxh-qa' }
  'Glob'     = @{ state='glob';     agent='pxh-qa' }
  'Task'     = @{ state='task';     agent='pxh-pm' }
  'WebFetch' = @{ state='webfetch'; agent='pxh-help' }
  'WebSearch'= @{ state='websearch';agent='pxh-help' }
  'Skill'    = @{ state='skill';    agent='pxh-expert' }
  'TodoWrite'= @{ state='planning'; agent='pxh-pm' }
  'thinking' = @{ state='thinking'; agent='pxh-expert' }
}

function Send-State($state, $agent, $msg) {
  $body = @{ state=$state; agent=$agent; message=$msg } | ConvertTo-Json -Compress
  try { Invoke-RestMethod -Uri $STATE_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null } catch {}
}

function Finish-All {
  Send-State 'done' 'pxh-pm' 'Hoàn thành tất cả tasks'
  $finish = @{ type='agent_status'; from='pxh-office'; message='🏁 OpenCode session kết thúc' } | ConvertTo-Json
  try { Invoke-RestMethod -Uri "http://localhost:2910/emit" -Method Post -Body $finish -ContentType "application/json" -TimeoutSec 2 | Out-Null } catch {}
}

Write-Host "🔌 Hook active — watching TUI states..." -ForegroundColor Cyan

if($Prompt) {
  Send-State 'thinking' 'pxh-expert' "Processing: $Prompt"
  Send-State 'route' 'pxh-pm' "Routing prompt..."
}

# Run opencode and capture output line by line
$proc = Start-Process -FilePath "opencode" -ArgumentList $Prompt -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\opencode-out.txt" -RedirectStandardError "$env:TEMP\opencode-err.txt"

$lastState = ''
while(!$proc.HasExited) {
  Start-Sleep -Milliseconds 200
  if(Test-Path "$env:TEMP\opencode-out.txt") {
    $lines = Get-Content "$env:TEMP\opencode-out.txt" -Tail 5 -ErrorAction SilentlyContinue
    foreach($line in $lines) {
      foreach($key in $STATE_MAP.Keys) {
        if($line -match $key -and $lastState -ne $key) {
          $info = $STATE_MAP[$key]
          Send-State $info.state $info.agent "$key — $line".Substring(0, [Math]::Min(80, $line.Length))
          $lastState = $key
        }
      }
    }
  }
}

$proc.WaitForExit()
Finish-All
Write-Host "✅ Session kết thúc" -ForegroundColor Green
