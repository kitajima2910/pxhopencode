param(
  [string]$AssetType = "2d",
  [string]$GameStyle = "platformer",
  [string]$OutDir = "assets"
)

function Invoke-AssetDownload {
  param([string]$Url, [string]$OutFile)
  $outDir = Split-Path $OutFile -Parent
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
  if (Test-Path $OutFile) { Write-Output "  ✓ $OutFile (cached)"; return $true }
  for ($i = 0; $i -lt 3; $i++) {
    try {
      Invoke-WebRequest -Uri $Url -OutFile $OutFile -TimeoutSec 30 -ErrorAction Stop
      return $true
    } catch {
      if ($i -lt 2) { Start-Sleep -Seconds 2 }
    }
  }
  return $false
}

function Install-KenneyAsset {
  param([string]$AssetName, [string]$DestDir = "assets")
  $pageUrl = "https://kenney.nl/assets/$AssetName"
  try {
    $html = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing -TimeoutSec 15
    $m = [regex]::Match($html.Content, "id='donate-text' href='(.+?)'")
    if (-not $m.Success) { return $false }
    $zipFile = "$DestDir/$AssetName.zip"
    if (Invoke-AssetDownload -Url $m.Groups[1].Value -OutFile $zipFile) {
      Expand-Archive -Path $zipFile -DestinationPath "$DestDir/$AssetName/" -Force
      Remove-Item $zipFile
      return $true
    }
  } catch { }
  return $false
}

function Install-OpenGameArtAsset {
  param([string]$Url, [string]$DestDir = "assets")
  Write-Output "  ℹ Downloading from OpenGameArt: $Url"
  $fileName = Split-Path $Url -Leaf
  $outFile = "$DestDir/$fileName"
  if (Invoke-AssetDownload -Url $Url -OutFile $outFile) {
    if ($fileName -match '\.zip$') {
      $subDir = $fileName -replace '\.zip$', ''
      Expand-Archive -Path $outFile -DestinationPath "$DestDir/$subDir/" -Force
      Remove-Item $outFile
    }
    return $true
  }
  return $false
}

function Get-AssetNameForStyle {
  param([string]$Type, [string]$Style)
  $MAPPING = @{
    "2d" = @{
      "platformer" = @{
        primary = "new-platformer-pack"
        fallback = @("platformer-pack", "platformer-pack-redux")
        openGameArt = @("https://opengameart.org/sites/default/files/Platformer%20Pack.zip")
      }
      "rpg" = @{
        primary = "tiny-dungeon"
        fallback = @("tiny-dungeon-2", "rpg-urban-modern")
        openGameArt = @()
      }
      "shooter" = @{
        primary = "top-down-shooter"
        fallback = @("top-down-shooter-redux")
        openGameArt = @()
      }
      "racing" = @{
        primary = "racing-pack"
        fallback = @("motorcycle-parts")
        openGameArt = @()
      }
      "puzzle" = @{
        primary = "puzzle-pack"
        fallback = @("board-game-pack")
        openGameArt = @()
      }
      "horror" = @{
        primary = "halloween-pack"
        fallback = @("zombie-pack")
        openGameArt = @("https://opengameart.org/sites/default/files/Dungeon%20Tileset%20v1.zip")
      }
      "shmup" = @{
        primary = "space-shooter-redux"
        fallback = @("space-shooter-extension")
        openGameArt = @()
      }
      "strategy" = @{
        primary = "strategy-pack"
        fallback = @("isometric-buildings-pack")
        openGameArt = @()
      }
      "adventure" = @{
        primary = "adventure-pack"
        fallback = @("fantasy-pack")
        openGameArt = @()
      }
    }
    "3d" = @{
      "platformer" = @{
        primary = "platformer-kit"
        fallback = @("prototype-kit")
        openGameArt = @()
      }
      "shooter" = @{
        primary = "fps-kit"
        fallback = @("weapon-pack")
        openGameArt = @()
      }
      "racing" = @{
        primary = "racing-kit"
        fallback = @("car-kit")
        openGameArt = @()
      }
      "rpg" = @{
        primary = "fantasy-kit"
        fallback = @("character-kit")
        openGameArt = @()
      }
      "horror" = @{
        primary = "horror-kit"
        fallback = @()
        openGameArt = @()
      }
    }
    "2.5d" = @{
      "strategy" = @{
        primary = "isometric-forest-pack"
        fallback = @("isometric-buildings-pack")
        openGameArt = @()
      }
      "rpg" = @{
        primary = "isometric-buildings-pack"
        fallback = @("isometric-forest-pack")
        openGameArt = @()
      }
      "shooter" = @{
        primary = "isometric-tactical-pack"
        fallback = @()
        openGameArt = @()
      }
    }
  }
  if ($MAPPING.ContainsKey($Type) -and $MAPPING[$Type].ContainsKey($Style)) {
    return $MAPPING[$Type][$Style]
  }
  $default = $MAPPING[$Type].Keys | Select-Object -First 1
  if ($default) { return $MAPPING[$Type][$default] }
  return $null
}

# === MAIN ===
Write-Output ""
Write-Output "╔══════════════════════════════════════════╗"
Write-Output "║  pxhopencode — Game Assets Downloader   ║"
Write-Output "╚══════════════════════════════════════════╝"
Write-Output ""
Write-Output "Type: $AssetType | Style: $GameStyle | Output: $OutDir"
Write-Output ""

$assets = Get-AssetNameForStyle -Type $AssetType -Style $GameStyle
if (-not $assets) {
  Write-Output "❌ Unknown type/style combination: $AssetType / $GameStyle"
  Write-Output "   Valid types: 2d, 3d, 2.5d"
  exit 1
}

$downloaded = $false

# Try primary
if ($assets.primary) {
  Write-Output "→ Primary: Kenney '$($assets.primary)'"
  if (Install-KenneyAsset -AssetName $assets.primary -DestDir $OutDir) {
    Write-Output "  ✓ Downloaded $($assets.primary) from Kenney"
    $downloaded = $true
  } else {
    Write-Output "  ✗ Kenney $($assets.primary) failed"
  }
}

# Try fallback if primary failed
if (-not $downloaded -and $assets.fallback.Count -gt 0) {
  foreach ($fb in $assets.fallback) {
    Write-Output "→ Fallback: Kenney '$fb'"
    if (Install-KenneyAsset -AssetName $fb -DestDir $OutDir) {
      Write-Output "  ✓ Downloaded $fb from Kenney"
      $downloaded = $true
      break
    } else {
      Write-Output "  ✗ Kenney $fb failed"
    }
  }
}

# Try OpenGameArt if Kenney failed
if (-not $downloaded -and $assets.openGameArt.Count -gt 0) {
  foreach ($oga in $assets.openGameArt) {
    Write-Output "→ Fallback: OpenGameArt (direct URL)"
    if (Install-OpenGameArtAsset -Url $oga -DestDir $OutDir) {
      Write-Output "  ✓ Downloaded from OpenGameArt"
      $downloaded = $true
      break
    } else {
      Write-Output "  ✗ OpenGameArt download failed"
    }
  }
}

# Always download SFX (independent of style)
Write-Output ""
Write-Output "→ SFX pack"
if (Install-KenneyAsset -AssetName "impact-sfx" -DestDir "$OutDir/audio") {
  Write-Output "  ✓ SFX downloaded"
}

# Summary
Write-Output ""
if ($downloaded) {
  Write-Output "✅ Assets ready for $AssetType/$GameStyle"
  Write-Output "   Map extracted files in game code."
  Write-Output "   If sprites don't match, use procedural fallback in placeholders.ts"
} else {
  Write-Output "⚠ Auto-download failed for $AssetType/$GameStyle"
  Write-Output "  Manual alternatives:"
  Write-Output "  - Kenney: https://kenney.nl/assets"
  Write-Output "  - OpenGameArt: https://opengameart.org"
  Write-Output "  - Poly Pizza: https://poly.pizza (3D)"
  Write-Output "  - Quaternius: https://quaternius.com (3D)"
  Write-Output ""
  Write-Output "  Or use procedural generation via:"
  Write-Output "  - skills/games-assets/templates/placeholders.ts"
  Write-Output "  - skills/games-assets/templates/sound-manager.ts"
}
Write-Output ""
