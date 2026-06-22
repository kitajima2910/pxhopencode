# Build Pipeline Scripts

## Lint + TypeCheck
```powershell
$isNode = Test-Path "package.json"
$isRust = Test-Path "Cargo.toml"
$isPython = Test-Path "pyproject.toml" -or (Test-Path "requirements.txt")

if ($isNode) {
  npm run lint 2>$null; if ($?) { Write-Output "✅ Lint pass" } else { Write-Warning "⚠️  No lint script, skip" }
  npx tsc --noEmit 2>$null; if ($?) { Write-Output "✅ TypeCheck pass" } else { Write-Warning "⚠️  tsc fail or not configured" }
} elseif ($isRust) {
  cargo clippy; if ($?) { Write-Output "✅ Clippy pass" } else { exit 1 }
  cargo check; if ($?) { Write-Output "✅ Cargo check pass" } else { exit 1 }
} elseif ($isPython) {
  ruff check . 2>$null; if ($?) { Write-Output "✅ Ruff pass" } else { Write-Warning "⚠️  No ruff or lint fail, skip" }
}
```

## Test Suite
```powershell
if ($isNode) {
  npm test; if ($?) { Write-Output "✅ Tests pass" } else { Write-Warning "⚠️  Tests fail"; exit 1 }
} elseif ($isRust) {
  cargo test; if ($?) { Write-Output "✅ Tests pass" } else { exit 1 }
} elseif ($isPython) {
  pytest 2>$null; if ($?) { Write-Output "✅ Tests pass" } else { Write-Warning "⚠️  No pytest or test fail" }
}
```

## Build
```powershell
if ($isNode) {
  npm run build; if ($?) {
    $outDir = if (Test-Path ".next") { ".next" } elseif (Test-Path "dist") { "dist" } else { "build" }
    if (Test-Path $outDir) {
      $size = (Get-ChildItem -Path $outDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
      Write-Output "✅ Build success (${size:N1}MB)"
    } else { Write-Output "✅ Build success" }
  } else { exit 1 }
} elseif ($isRust) {
  cargo build --release; if ($?) {
    $size = (Get-ChildItem -Path "target/release" -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Output "✅ Build success (${size:N1}MB)"
  } else { exit 1 }
} elseif ($isPython) {
  python -m build 2>$null; if ($?) { Write-Output "✅ Build success" } else { Write-Warning "⚠️  Build not configured, skip" }
}
```
