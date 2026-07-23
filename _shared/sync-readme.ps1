# pxhopencode README Sync
# Chạy sau mỗi lần CRUD agent/workflow/skill/template để đồng bộ badge + section headers.
# powershell.exe -ExecutionPolicy Bypass -File _shared\sync-readme.ps1

$root = Split-Path -Parent $PSScriptRoot
$readme = "$root\README.md"
$content = Get-Content $readme -Raw

# --- Counts ---
$agentCount   = (Get-ChildItem "$root\agents" -Filter "*.md").Count
$workflowCount = (Get-ChildItem "$root\workflows" -Filter "*.md").Count
$config = Get-Content "$root\opencode.json" -Raw | ConvertFrom-Json
$commandCount = $config.command.PSObject.Properties.Name.Count
$skillCount   = (Get-ChildItem "$root\skills" -Recurse -Filter "SKILL.md").Count

# Count ALL template files across project (skills/*/templates/ + _shared/templates/)
$templateCount = 0
Get-ChildItem "$root" -Recurse -Directory -Filter "templates" | ForEach-Object {
  $templateCount += (Get-ChildItem $_.FullName -Recurse -File).Count
}

$commitCount = (git -C $root log --oneline).Count

Write-Output "=== README Sync ==="
Write-Output "  Agents: $agentCount | Workflows: $workflowCount | Commands: $commandCount | Skills: $skillCount | Templates: $templateCount | Commits: $commitCount"

# --- Update badge line ---
$badgePattern = '<b>v\d+</b> &nbsp;·&nbsp; \d+ commits[^<]*'
$version = (Get-Content "$root\README.md" | Select-String '<b>v(\d+)</b>').Matches[0].Groups[1].Value
$newBadge = "<b>v${version}</b> &nbsp;·&nbsp; ${commitCount} commits &nbsp;·&nbsp; ${agentCount} AI agents &nbsp;·&nbsp; 4-tier runtime &nbsp;·&nbsp; ${workflowCount} workflows &nbsp;·&nbsp; ${skillCount} skills &nbsp;·&nbsp; ${templateCount} templates"
if ($content -match $badgePattern) {
  $content = $content -replace $badgePattern, $newBadge
  Write-Output "  BADGE updated"
} else { Write-Output "  WARNING badge pattern not found" }

# --- Update section headers ---
$content = $content -replace '^## \d+ Agents$', "## ${agentCount} Agents"
$content = $content -replace '^## \d+ Workflows · \d+ Commands$', "## ${workflowCount} Workflows · ${commandCount} Commands"
$content = $content -replace '^## \d+ Skills$', "## ${skillCount} Skills"

# --- Update Skills reference counts ---
$content = $content -replace '\(Web \d+, Game \d+, AI \d+, Tool \d+[^)]*\)', "(Web 8, Game 11, AI 5, Tool 5, Chuyên biệt 1)"

# --- Update Verify badge (if present in changelog) ---
$content = $content -replace 'v\d+ · \d+ commits', "v${version} · ${commitCount} commits"

Set-Content $readme $content -NoNewline
Write-Output "=== README synced ==="
