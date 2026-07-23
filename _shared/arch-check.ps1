# pxhopencode Architecture Validation
# Chạy: powershell.exe -ExecutionPolicy Bypass -File _shared\arch-check.ps1

$root = Split-Path -Parent $PSScriptRoot
$errors = @(); $warnings = @()

Write-Output "=== pxhopencode Architecture Check ==="

# 1. opencode.json valid JSON
try {
  $config = Get-Content "$root\opencode.json" -Raw | ConvertFrom-Json
  Write-Output "  PASS opencode.json: valid JSON"
} catch { $errors += "opencode.json invalid: $_" }

# 2. All agents in opencode.json have agent files
$agentNames = @()
foreach ($agent in $config.agent.PSObject.Properties) { $agentNames += $agent.Name }
foreach ($name in $agentNames) {
  $path = "$root\agents\$name.md"
  if (Test-Path $path) { Write-Output ("  PASS agent $name : file exists") }
  else { $errors += ("agent $name : missing agents/$name.md") }
}

# 3. All commands reference existing workflow files
foreach ($cmd in $config.command.PSObject.Properties) {
  $tmpl = $cmd.Value.template
  if ($tmpl) {
    if ($tmpl -match '^workflows/') {
      $path = "$root\$tmpl"
      if (Test-Path $path) { Write-Output "  PASS command $($cmd.Name): $tmpl exists" }
      else { $errors += "command $($cmd.Name): $tmpl not found" }
    } else {
      Write-Output "  PASS command $($cmd.Name): inline template (no file needed)"
    }
  }
}

# 4. All skills referenced in quickref exist
if (Test-Path "$root\_shared\skill-quickref.md") {
  $quickref = Get-Content "$root\_shared\skill-quickref.md" -Raw
  $skillRefs = [regex]::Matches($quickref, '`([\w-]+)`') | ForEach-Object { $_.Groups[1].Value }
  foreach ($s in $skillRefs) {
    $path = "$root\skills\$s\SKILL.md"
    if (Test-Path $path) { Write-Output ("  PASS skill $s : SKILL.md exists") }
    else { $warnings += ("skill $s : maybe missing (could be a reference)") }
  }
}

# 5. Pro Max flags check (anti-rationalization, red flags, verification)
# Only check SKILL.md in skills, all .md files in workflows and agents
$targets = @()
Get-ChildItem "$root\workflows" -Filter "*.md" | ForEach-Object { $targets += $_ }
Get-ChildItem "$root\agents" -Filter "*.md" | ForEach-Object { $targets += $_ }
Get-ChildItem "$root\skills" -Recurse -Filter "SKILL.md" | ForEach-Object { $targets += $_ }
foreach ($f in $targets) {
  $content = Get-Content $f.FullName -Raw
  $hasAnti = $content -match "Anti-Rationalization"
  $hasRed = $content -match "Red Flags"
  $hasVer = $content -match "## Verification"
  $rel = $f.FullName.Substring($root.Length + 1)
  if (-not ($hasAnti -and $hasRed -and $hasVer)) {
    $missing = @()
    if (-not $hasAnti) { $missing += "Anti-Rationalization" }
    if (-not $hasRed) { $missing += "Red Flags" }
    if (-not $hasVer) { $missing += "Verification" }
    $warnings += ("$rel : missing " + ($missing -join ', '))
  }
}

# 6. Contract format consistency
$contractFiles = @(
  "$root\runtime\contracts\README.md",
  "$root\runtime\layers\01-interface.md",
  "$root\runtime\layers\02-orchestration.md",
  "$root\runtime\layers\03-worker.md",
  "$root\runtime\layers\04-infrastructure.md"
)
foreach ($f in $contractFiles) {
  if (-not (Test-Path $f)) { $warnings += ("$f : missing") }
  else { Write-Output "  PASS contract file: $f" }
}

Write-Output ""
if ($errors.Count -eq 0) { Write-Output "ERRORS: none" }
else { Write-Output "ERRORS ($($errors.Count)):"; $errors | ForEach-Object { Write-Output "  ✗ $_" } }
if ($warnings.Count -eq 0) { Write-Output "WARNINGS: none" }
else { Write-Output "WARNINGS ($($warnings.Count)):"; $warnings | ForEach-Object { Write-Output "  ⚠ $_" } }

Write-Output "`n=== Done ==="
if ($errors.Count -eq 0) { exit 0 } else { exit 1 }
