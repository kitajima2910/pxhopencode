param(
  [string]$WorkspaceRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$memoryDir = Join-Path $WorkspaceRoot ".memory"
$initJson = Join-Path $WorkspaceRoot "runtime\memory\init.json"

# Check if .memory/ already exists
if (Test-Path $memoryDir) {
  $idx = Join-Path $memoryDir "index.json"
  if (Test-Path $idx) {
    Write-Output "⏭️ .memory/ exists, skip init"
    exit 0
  }
}

# Validate init.json exists
if (-not (Test-Path $initJson)) {
  Write-Error "❌ init.json not found at $initJson"
  exit 1
}

# Read init.json as raw text (keep exact JSON formatting)
$initRaw = Get-Content $initJson -Raw
$init = $initRaw | ConvertFrom-Json
$now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$projectName = Split-Path $WorkspaceRoot -Leaf

# Detect project metadata
$fw = $null
$lang = $null
$rt = $null
$bt = @()
$tf = $null
$li = $null
$dt = @()

if (Test-Path (Join-Path $WorkspaceRoot "package.json")) {
  $lang = "TypeScript"; $rt = "node"; $bt = @("npm")
  $pj = Get-Content (Join-Path $WorkspaceRoot "package.json") -Raw | ConvertFrom-Json
  if ($pj.scripts.lint) { $li = "eslint" }
  if ($pj.scripts.test) { $tf = if ($pj.devDependencies.vitest) { "vitest" } elseif ($pj.devDependencies.jest) { "jest" } else { "node:test" } }
  if ($pj.dependencies.next) { $fw = "nextjs"; $dt = @("vercel") }
  elseif ($pj.dependencies.react) { $fw = "react"; $dt = @("vercel") }
  elseif ($pj.dependencies.phaser) { $fw = "phaser"; $dt = @("vercel","itchio") }
  elseif ($pj.dependencies.three) { $fw = "threejs"; $dt = @("vercel") }
  elseif ($pj.name -eq "pxhopencode") { $fw = "opencode"; $dt = @("opencode") }
} elseif (Test-Path (Join-Path $WorkspaceRoot "Cargo.toml")) {
  $lang = "Rust"; $rt = "rust"; $li = "clippy"; $tf = "cargo test"; $bt = @("cargo")
} elseif (Test-Path (Join-Path $WorkspaceRoot "pyproject.toml")) {
  $lang = "Python"; $rt = "python"; $li = "ruff"; $tf = "pytest"; $bt = @("pip")
}

# Detect folder structure
$fs = @()
foreach ($d in @("src","agents","runtime","workflows","skills","_shared","components","pages","api","lib","hooks","styles","server","public","docs","tests","e2e")) {
  if (Test-Path (Join-Path $WorkspaceRoot $d)) { $fs += "$d/" }
}

$projectId = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($WorkspaceRoot.ToUpper()))

# Helper: write JSON file with proper formatting
function Write-JsonFile {
  param($Path, $Content)
  $Content | Set-Content -Path $Path -Encoding UTF8 -NoNewline
}

# Build custom JSON strings for index.json and project.json
$fwList = if ($fw) { "`"$fw`"" } else { "" }
$indexJson = @"
{"version":"1.0","project_id":"$projectId","project_name":"$projectName","created":"$now","updated":"$now","memory_count":0,"confidence":{},"tags":[],"frameworks":[$fwList]}
"@
$indexJson = $indexJson -replace '"frameworks":[""]', '"frameworks":[]'
$indexJson = $indexJson -replace '"frameworks":[,]', '"frameworks":[]'

$projectConfidence = if ($fw -or $lang) { 70 } else { 0 }
$fStr = if ($fw) { "`"$fw`"" } else { "null" }
$lStr = if ($lang) { "`"$lang`"" } else { "null" }
$rStr = if ($rt) { "`"$rt`"" } else { "null" }
$pmStr = "null"  # default, we export from pj if needed
$btStr = if ($bt.Count -gt 0) { '["' + ($bt -join '","') + '"]' } else { "[]" }
$dtStr = if ($dt.Count -gt 0) { '["' + ($dt -join '","') + '"]' } else { "[]" }
$tfStr = if ($tf) { "`"$tf`"" } else { "null" }
$liStr = if ($li) { "`"$li`"" } else { "null" }
$fsStr = if ($fs.Count -gt 0) { '["' + ($fs -join '","') + '"]' } else { "[]" }

$projectJson = @"
{"version":"1.0","created":"$now","updated":"$now","confidence":$projectConfidence,"framework":$fStr,"language":$lStr,"runtime":$rStr,"package_manager":$pmStr,"build_tools":$btStr,"ui_library":null,"testing_framework":$tfStr,"linter":$liStr,"formatter":null,"game_engine":null,"deployment_target":$dtStr,"folder_structure":$fsStr,"conventions":{}}
"@
$projectJson = $projectJson -replace '"build_tools":\[""\]', '"build_tools":[]'
$projectJson = $projectJson -replace '"build_tools":\[,', '"build_tools":['

# Create .memory/ directory
New-Item -ItemType Directory -Force -Path $memoryDir | Out-Null

# Write all 13 files
$count = 0
$pm = $init.files.PSObject.Properties
foreach ($entry in $pm) {
  $name = $entry.Name
  $path = Join-Path $memoryDir $name

  if ($name -eq "index.json") {
    Write-JsonFile $path $indexJson
  } elseif ($name -eq "project.json") {
    Write-JsonFile $path $projectJson
  } else {
    # Other files: write raw JSON string directly from init.json
    $raw = $entry.Value | ConvertTo-Json -Depth 10 -Compress
    # Fix empty arrays: PS converts [] to {} in some cases
    $raw = $raw -replace '"confidence":\s*\{\}', '"confidence":{}'
    $raw = $raw -replace '"bugs":\s*\{\}', '"bugs":[]'
    $raw = $raw -replace '"decisions":\s*\{\}', '"decisions":[]'
    $raw = $raw -replace '"snapshots":\s*\{\}', '"snapshots":[]'
    $raw = $raw -replace '"entries":\s*\{\}', '"entries":[]'
    $raw = $raw -replace '"workflows":\s*\{\}', '"workflows":[]'
    $raw = $raw -replace '"optimizations":\s*\{\}', '"optimizations":[]'
    $raw = $raw -replace '"repeated_instructions":\s*\{\}', '"repeated_instructions":[]'
    $raw = $raw -replace '"optimized_templates":\s*\{\}', '"optimized_templates":[]'
    $raw = $raw -replace '"common_patterns":\s*\{\}', '"common_patterns":[]'
    $raw = $raw -replace '"preferences":\s*\{\}', '"preferences":{}'
    $raw = $raw -replace '"habits":\s*\{\}', '"habits":[]'
    $raw = $raw -replace '"folder_organization":\s*\{\}', '"folder_organization":[]'
    $raw = $raw -replace '"stores":\s*\{\}', '"stores":[]'
    $raw = $raw -replace '"error_handling":\s*\{\}', '"error_handling":[]'
    $raw = $raw -replace '"logging":\s*\{\}', '"logging":[]'
    $raw = $raw -replace '"api_wrappers":\s*\{\}', '"api_wrappers":[]'
    $raw = $raw -replace '"state_management":\s*\{\}', '"state_management":[]'
    $raw = $raw -replace '"modules":\s*\{\}', '"modules":[]'
    $raw = $raw -replace '"services":\s*\{\}', '"services":[]'
    $raw = $raw -replace '"dependencies":\s*\{\}', '"dependencies":[]'
    $raw = $raw -replace '"coding_philosophy":\s*\{\}', '"coding_philosophy":[]'
    $raw = $raw -replace '"profile":\s*\{\}', '"profile":[]'
    $raw = $raw -replace '"build_tools":\s*\{\}', '"build_tools":[]'
    $raw = $raw -replace '"deployment_target":\s*\{\}', '"deployment_target":[]'
    $raw = $raw -replace '"folder_structure":\s*\{\}', '"folder_structure":[]'
    $raw = $raw -replace '"naming":\s*\{\}', '"naming":{}'
    $raw = $raw -replace '"imports":\s*\{\}', '"imports":{}'
    $raw = $raw -replace '"flows":\s*\{\}', '"flows":{}'
    $raw = $raw -replace '"tiers":\s*\{\}', '"tiers":[]'
    $raw = $raw -replace '"boundaries":\s*\{\}', '"boundaries":[]'
    $raw = $raw -replace '"tags":\s*\{\}', '"tags":[]'
    $raw = $raw -replace '"data":\s*\{\}', '"data":[]'
    $raw = $raw -replace '"event":\s*\{\}', '"event":[]'
    $raw = $raw -replace '"state":\s*\{\}', '"state":[]'
    $raw = $raw -replace '"api":\s*\{\}', '"api":[]'
    Write-JsonFile $path $raw
  }
  $count++
}

Write-Output "✅ .memory/ initialized: $count files created"
exit 0
