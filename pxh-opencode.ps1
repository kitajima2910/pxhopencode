# PXHOpenCode wrapper — runs opencode + mirrors ALL TUI output to Virtual Office
# Usage: .\pxh-opencode.ps1 "your prompt"
param([string]$Prompt)

$ROOT = Split-Path -Parent $PSCommandPath
$HOOK = Join-Path $ROOT "skills\virtual-office\templates\hook-opencode.ps1"
$SERVER = Join-Path $ROOT "skills\virtual-office\templates\server.mjs"

Write-Host @"
  ============================================
   PXHOpenCode TUI Mirror Wrapper
  ============================================
"@ -ForegroundColor Cyan

# Start server if not already running
try {
  $null = Invoke-RestMethod -Uri "http://localhost:2910/status" -Method Get -TimeoutSec 1
  Write-Host "  [OK] Virtual Office server already running on :2910" -ForegroundColor Green
} catch {
  Write-Host "  Starting Virtual Office server..." -ForegroundColor Yellow
  Start-Process -FilePath "node" -ArgumentList $SERVER -NoNewWindow
  Start-Sleep -Seconds 2
  try {
    $null = Invoke-RestMethod -Uri "http://localhost:2910/status" -Method Get -TimeoutSec 1
    Write-Host "  [OK] Server started on http://localhost:2910" -ForegroundColor Green
  } catch {
    Write-Host "  [WARN] Server may not be ready — continuing anyway" -ForegroundColor Yellow
  }
}

if(-not $Prompt) {
  $Prompt = Read-Host "Enter your prompt"
}

Write-Host "  Running: opencode `"$Prompt`"" -ForegroundColor Cyan
Write-Host "  Mirroring ALL TUI output to PXHOpenCode terminal"
Write-Host "  Open http://localhost:2910 to watch"
Write-Host ""

& $HOOK -Prompt $Prompt
