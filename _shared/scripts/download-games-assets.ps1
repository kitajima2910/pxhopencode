param([string]$AssetType="2d", [string]$GameStyle="platformer")

function Invoke-AssetDownload { param([string]$Url, [string]$OutFile)
  $outDir = Split-Path $OutFile -Parent
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
  if (Test-Path $OutFile) { Write-Output "  ✓ $OutFile (cached)"; return $true }
  for ($i = 0; $i -lt 3; $i++) {
    try { Invoke-WebRequest -Uri $Url -OutFile $OutFile -TimeoutSec 30 -ErrorAction Stop; return $true }
    catch { Start-Sleep -Seconds 2 }
  }
  return $false
}

function Install-KenneyAsset { param([string]$AssetName, [string]$OutDir = "assets")
  $pageUrl = "https://kenney.nl/assets/$AssetName"
  try {
    $html = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing -TimeoutSec 15
    $m = [regex]::Match($html.Content, "id='donate-text' href='(.+?)'")
    if (-not $m.Success) { return $false }
    $zipFile = "$OutDir/$AssetName.zip"
    Invoke-AssetDownload -Url $m.Groups[1].Value -OutFile $zipFile
    Expand-Archive -Path $zipFile -DestinationPath "$OutDir/$AssetName/" -Force
    Remove-Item $zipFile; return $true
  } catch { return $false }
}

switch ($AssetType) {
  "2d"   { Install-KenneyAsset -AssetName @{platformer="new-platformer-pack";rpg="tiny-dungeon"}[$GameStyle] -OutDir "assets"
           Install-KenneyAsset -AssetName "impact-sfx" -OutDir "assets/audio" }
  "3d"   { Install-KenneyAsset -AssetName "platformer-kit" -OutDir "assets" }
  "2.5d" { Install-KenneyAsset -AssetName "isometric-forest-pack" -OutDir "assets"
           Install-KenneyAsset -AssetName "isometric-buildings-pack" -OutDir "assets" }
}
Write-Output "✅ Assets downloaded. Map extracted files in game code."
