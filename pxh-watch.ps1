# PXHOpenCode Watchdog - captrure ALL opencode sessions output for PXHOpenCode mirror
# Usage: Start-Process powershell -ArgumentList "-File pxh-watch.ps1" -WindowStyle Hidden
# Or: .\pxh-watch.ps1
param([int]$Port = 2910)

$EMIT_URL = "http://localhost:$Port/emit"
$STATE_FILE = "$PSScriptRoot\_shared\opencode-state.json"
$ACTIVITY_FILE = "$PSScriptRoot\_shared\opencode-activity.log"
$POLL_MS = 150

Write-Host "PXHOpenCode Watchdog started - watching for ANY opencode session activity..." -ForegroundColor Cyan
Write-Host "  Port: $Port"
Write-Host "  State file: $STATE_FILE"
Write-Host "  Activity log: $ACTIVITY_FILE"
Write-Host ""

# Ensure activity log exists
if (-not (Test-Path $ACTIVITY_FILE)) {
  New-Item -ItemType File -Path $ACTIVITY_FILE -Force | Out-Null
}

$lastState = $null
$lastActivityPos = (Get-Item $ACTIVITY_FILE -ErrorAction SilentlyContinue).Length

function Send-Mirror($lineText) {
  if ([string]::IsNullOrWhiteSpace($lineText)) { return }
  $body = @{ type='tui_mirror'; agent='pxh-opencode'; message=$lineText } | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Uri $EMIT_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 1 | Out-Null
  } catch {}
}

function Read-ActivityLog {
  if (-not (Test-Path $ACTIVITY_FILE)) { return @() }
  try {
    $stream = [System.IO.File]::Open($ACTIVITY_FILE, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    $len = $stream.Length
    if ($len -lt $script:lastActivityPos) { $script:lastActivityPos = 0 }
    if ($len -le $script:lastActivityPos) { $stream.Close(); return @() }
    $stream.Seek($script:lastActivityPos, [System.IO.SeekOrigin]::Begin) | Out-Null
    $buf = New-Object byte[] ($len - $script:lastActivityPos)
    $read = $stream.Read($buf, 0, $buf.Length)
    $script:lastActivityPos = $stream.Position
    $stream.Close()
    $text = [System.Text.Encoding]::UTF8.GetString($buf, 0, $read)
    return $text -split '\r?\n' | Where-Object { $_ -and $_.Trim().Length -gt 0 }
  } catch { return @() }
}

function Watch-TempOutputs {
  # Watch for opencode temp output files
  $tempFiles = Get-ChildItem "$env:TEMP\opencode-out*.txt" -ErrorAction SilentlyContinue
  foreach ($f in $tempFiles) {
    $key = "pos_$($f.Name)"
    $lastPos = Get-Variable -Name $key -ValueOnly -ErrorAction SilentlyContinue
    if (-not $lastPos) { $lastPos = 0; Set-Variable -Name $key -Value 0 -Scope Script }
    try {
      $stream = [System.IO.File]::Open($f.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
      $len = $stream.Length
      if ($len -lt $lastPos) { $lastPos = 0; Set-Variable -Name $key -Value 0 -Scope Script }
      if ($len -gt $lastPos) {
        $stream.Seek($lastPos, [System.IO.SeekOrigin]::Begin) | Out-Null
        $buf = New-Object byte[] ($len - $lastPos)
        $read = $stream.Read($buf, 0, $buf.Length)
        $newPos = $stream.Position
        $text = [System.Text.Encoding]::UTF8.GetString($buf, 0, $read)
        $lines = $text -split '\r?\n' | Where-Object { $_.Trim().Length -gt 0 }
        foreach ($l in $lines) {
          $clean = $l -replace '\e\[[0-9;]*[a-zA-Z]','' -replace '\e\][0-9;]*[a-zA-Z]','' -replace '^\s+|\s+$',''
          if ($clean.Length -gt 0) { Send-Mirror $clean }
        }
        Set-Variable -Name $key -Value $newPos -Scope Script
      }
      $stream.Close()
    } catch {}
  }
}

Write-Host "Watching... Press Ctrl+C to stop" -ForegroundColor Yellow
while ($true) {
  Start-Sleep -Milliseconds $POLL_MS

  # 1. Watch activity log (any process can write lines here)
  $activityLines = Read-ActivityLog
  foreach ($line in $activityLines) { Send-Mirror $line }

  # 2. Watch state file for agent state changes
  try {
    if (Test-Path $STATE_FILE) {
      $st = Get-Content $STATE_FILE -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
      if ($st.state -and $st.state -ne $lastState) {
        if ($st.agent -eq 'pxh-opencode' -or $st.state -eq 'Mirror') {
          Send-Mirror $st.message
        }
        $lastState = $st.state
      }
    }
  } catch {}

  # 3. Watch temp output files from opencode sessions
  Watch-TempOutputs
}
