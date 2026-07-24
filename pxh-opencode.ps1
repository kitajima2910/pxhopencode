# PXHOpenCode wrapper - runs opencode (Virtual Office handles mirroring via extension)
# Usage: .\pxh-opencode.ps1 "your prompt"
param([string]$Prompt)

$ROOT = Split-Path -Parent $PSCommandPath
$SERVER = Join-Path $ROOT "skills\virtual-office\templates\server.mjs"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " PXHOpenCode" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

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

if (-not $Prompt) {
  $Prompt = Read-Host "Enter your prompt"
}

Write-Host "Running: opencode '$Prompt'" -ForegroundColor Cyan
Write-Host "Virtual Office is available in VS Code sidebar (PXH Virtual Office extension)"
Write-Host ""

opencode $Prompt
