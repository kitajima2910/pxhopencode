# PXHOpenCode wrapper - runs opencode with real-time Virtual Office bridge
# Usage: .\pxh-opencode.ps1 "your prompt"
param([string]$Prompt)

$ROOT = Split-Path -Parent $PSCommandPath
$SERVER = Join-Path $ROOT "skills\virtual-office\templates\server.mjs"
$WATCHDOG = Join-Path $ROOT "pxh-watch.ps1"
$STATE_FILE = "$ROOT\_shared\opencode-state.json"
$ACTIVITY_FILE = "$ROOT\_shared\opencode-activity.log"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " PXHOpenCode" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Ensure _shared dir exists
if (-not (Test-Path (Join-Path $ROOT "_shared"))) { New-Item -ItemType Directory -Path (Join-Path $ROOT "_shared") -Force | Out-Null }

# Start server if not already running
try {
  $null = Invoke-RestMethod -Uri "http://localhost:2910/status" -Method Get -TimeoutSec 1
  Write-Host "[OK] Virtual Office API server already running on :2910" -ForegroundColor Green
} catch {
  Write-Host "Starting Virtual Office API server..." -ForegroundColor Yellow
  Start-Process -FilePath "node" -ArgumentList $SERVER -NoNewWindow
  Start-Sleep -Seconds 2
  try {
    $null = Invoke-RestMethod -Uri "http://localhost:2910/status" -Method Get -TimeoutSec 1
    Write-Host "[OK] Server started on port 2910" -ForegroundColor Green
  } catch {
    Write-Host "[WARN] Server may not be ready - continuing anyway" -ForegroundColor Yellow
  }
}

# Start watchdog in background (uses Start-Process for proper context)
Write-Host "[OK] Starting Virtual Office watchdog..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$WATCHDOG`"" `
  -WindowStyle Hidden -WorkingDirectory $ROOT

if (-not $Prompt) {
  $Prompt = Read-Host "Enter your prompt"
}

# Write workflow_start to state file -> triggers event pipeline
@{ state='workflow_start'; message="User prompt: $Prompt" } | ConvertTo-Json -Compress |
  Out-File -FilePath $STATE_FILE -Encoding utf8 -Force

# Also write a line to activity log so watchdog picks it up
"[workflow_start] User prompt: $Prompt" | Out-File -FilePath $ACTIVITY_FILE -Encoding utf8 -Append

Write-Host "Running: opencode '$Prompt'" -ForegroundColor Cyan
Write-Host "Virtual Office PXHOpenCode terminal showing real-time agent activity"
Write-Host ""

# Run opencode WITHOUT piping (preserves interactivity)
opencode $Prompt

# Write workflow_end to state file
@{ state='workflow_end'; message='Processing complete' } | ConvertTo-Json -Compress |
  Out-File -FilePath $STATE_FILE -Encoding utf8 -Force
"[workflow_end] Processing complete" | Out-File -FilePath $ACTIVITY_FILE -Encoding utf8 -Append

Write-Host ""
Write-Host "[OK] Done! OpenCode session complete." -ForegroundColor Green

# Let watchdog finish flushing events, then kill it
Start-Sleep -Seconds 3
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -match 'pxh-watch' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
