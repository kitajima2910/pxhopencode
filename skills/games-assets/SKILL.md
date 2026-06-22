---
name: games-assets
description: Free game assets + auto-download. 2D sprites, 3D models, 2.5D tiles, sounds, fonts. Animation-ready — idle/run/jump/attack/hurt/death states.
---

# games-assets — Free Game Assets & Auto-Download

Skill này cung cấp nguồn assets free hợp pháp và script tự động download, setup animation states cho game 2D/2.5D/3D.

## Nguồn Asset Miễn phí

### 🟦 2D Sprites & Tilesets

| Nguồn | URL | Loại | License |
|-------|-----|------|---------|
| **Kenney** | `https://kenney.nl/assets` | Sprites, UI, tiles, audio | CC0 (public domain) |
| **OpenGameArt** | `https://opengameart.org` | Sprites, tilesets, backgrounds | CC0 / CC-BY / GPL |
| **Itch.io Game Assets** | `https://itch.io/game-assets/free` | Sprites, spritesheets, UI | Miễn phí |
| **Sprite Database** | `https://spritedatabase.net` | Game sprite sheets | Fair use |
| **Lospec Palette** | `https://lospec.com/palette-list` | Color palettes | Miễn phí |

### 🟧 2.5D / Isometric Tiles

| Nguồn | URL | Loại |
|-------|-----|------|
| **Kenney Isometric** | `https://kenney.nl/assets?q=isometric` | Isometric tiles, buildings |
| **OpenGameArt Isometric** | `https://opengameart.org/art-search?keys=isometric` | Tile sets, objects |
| **CrusenDho** | `https://crusen-dho.en.lo4d.com` | Isometric RPG tiles |

### 🟥 3D Models (GLB/GLTF)

| Nguồn | URL | Loại | License |
|-------|-----|------|---------|
| **Sketchfab** | `https://sketchfab.com/3d-models?features=downloadable&sort=-free` | GLTF/GLB models | CC0 / CC-BY |
| **Quaternius** | `https://quaternius.com` | Low-poly characters, vehicles, buildings | CC0 (public domain) |
| **Poly Pizza** | `https://poly.pizza` | Low-poly GLB models | CC0 |
| **Google Poly** | `https://poly.pizza` | GLTF models | CC0 |
| **AmbientCG** | `https://ambientcg.com` | PBR textures | CC0 |
| **Mixamo** | `https://mixamo.com` | 3D character animations (FBX/GLB) | Free (Adobe account) |

### 🔊 Audio & SFX

| Nguồn | URL | Loại | License |
|-------|-----|------|---------|
| **Freesound** | `https://freesound.org` | SFX, ambient, music | CC0 / CC-BY |
| **Kenney Audio** | `https://kenney.nl/assets?q=audio` | SFX, BGM packs | CC0 |
| **Pixabay Music** | `https://pixabay.com/music` | BGM, SFX | Miễn phí |
| **Zapsplat** | `https://zapsplat.com` | SFX, UI sounds | Miễn phí (attribute) |
| **Mixkit** | `https://mixkit.co/free-sound-effects` | SFX, music loops | Miễn phí |
| **OpenGameArt Audio** | `https://opengameart.org/art-search?keys=&field_art_type_tid%5B%5D=13` | SFX, BGM | CC0 / CC-BY |
| **jsfxr** | `https://sfxr.me` | Tạo SFX 8-bit ngay trong browser | — |
| **Chiptone** | `https://sb.bitsnbites.eu` | Tạo SFX chiptune online | — |
| **BFXR** | `https://www.bfxr.net` | Tạo SFX retro (download) | — |
| **MusicGen (Meta)** | `https://huggingface.co/spaces/facebook/MusicGen` | AI sinh nhạc | Research |

### BGM nên dùng

| Thể loại game | Loại nhạc | Nguồn gợi ý |
|--------------|-----------|------------|
| Platformer / Action | Energetic electronic, 8-bit chiptune | Kenney "Platformer Audio", Pixabay "Electronic" |
| RPG / Adventure | Orchestral, ambient, fantasy | Freesound "Fantasy", Mixkit "Cinematic" |
| Puzzle / Casual | Relaxing, lo-fi, acoustic | Pixabay "Lo-fi", Mixkit "Relax" |
| Horror | Dark ambient, drone, suspense | Freesound "Horror", Zapsplat "Dark" |
| Racing / Sports | Rock, EDM, high-tempo | Pixabay "Rock", Mixkit "Sport" |

### 🖌 Fonts

| Nguồn | URL |
|-------|-----|
| **Google Fonts** | `https://fonts.google.com` |
| **Kenney Fonts** | `https://kenney.nl/assets/kenney-fonts` |

---

## Script Tự động Tải xuống

Khi vibe code game, agent phải chạy script này để download assets **trước khi code**.

```powershell
# games-assets — Chạy đầu phiên vibe code game
$assetType = "2d"   # 2d | 3d | 2.5d
$gameStyle = "platformer" # platformer | rpg | shooter | puzzle | casual

# === Helper: Tải file với retry và timeout ===
function Invoke-AssetDownload {
  param([string]$Url, [string]$OutFile)
  $outDir = Split-Path $OutFile -Parent
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
  if (Test-Path $OutFile) { Write-Output "  ✓ $OutFile (cached)"; return $true }
  for ($i = 0; $i -lt 3; $i++) {
    try {
      Invoke-WebRequest -Uri $Url -OutFile $OutFile -TimeoutSec 30 -ErrorAction Stop
      Write-Output "  ✓ $OutFile"; return $true
    } catch { Write-Warning "  ✗ Retry $($i+1)/3: $Url" }
    Start-Sleep -Seconds 2
  }
  Write-Warning "  ✗ Failed after 3 retries: $Url"
  return $false
}

# === Helper: Lấy download URL thật từ Kenney asset page ===
function Get-KenneyDownloadUrl {
  param([string]$AssetName)
  $pageUrl = "https://kenney.nl/assets/$AssetName"
  try {
    $html = Invoke-WebRequest -Uri $pageUrl -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    $pattern = "id='donate-text' href='(.+?)'"
    $match = [regex]::Match($html.Content, $pattern)
    if ($match.Success) { return $match.Groups[1].Value }
  } catch { }
  return $null
}

# === Helper: Tải Kenney asset ZIP và extract ===
function Install-KenneyAsset {
  param([string]$AssetName, [string]$OutDir = "assets")
  $zipUrl = Get-KenneyDownloadUrl $AssetName
  if (-not $zipUrl) { Write-Warning "  ✗ Cannot resolve download URL for $AssetName"; return $false }
  $zipFile = "$OutDir/$AssetName.zip"
  $ok = Invoke-AssetDownload -Url $zipUrl -OutFile $zipFile
  if (-not $ok) { return $false }
  try {
    Expand-Archive -Path $zipFile -DestinationPath "$OutDir/$AssetName/" -Force
    Remove-Item $zipFile
    Write-Output "  ✓ Extracted to $OutDir/$AssetName/"
    return $true
  } catch { Write-Warning "  ✗ Extract failed: $zipFile"; return $false }
}

# ===================================================================
# 2D: Sprite sheets từ Kenney (CC0) — download ZIP rồi map file
# ===================================================================
if ($assetType -eq "2d") {
  # Platformer assets — chứa spritesheet player, tiles, icons
  $kenneyAsset = switch ($gameStyle) {
    "platformer" { "new-platformer-pack" }
    "rpg"        { "tiny-dungeon" }
    "shooter"    { "desert-shooter-pack" }
    default      { "new-platformer-pack" }
  }
  Install-KenneyAsset -AssetName $kenneyAsset -OutDir "assets"

  # Audio — Impact/SFX pack từ Kenney
  Install-KenneyAsset -AssetName "impact-sfx" -OutDir "assets/audio"

  # Map extracted files → game-expected paths (agent tự điều chỉnh)
  Write-Output "  ℹ️  Map files from assets/$kenneyAsset/ to game code (player.png, enemy.png, tiles.png)"
  Write-Output "  ℹ️  Audio in assets/audio/impact-sfx/ — map .wav/.mp3 to code"
}

# ===================================================================
# 3D: GLB models từ Poly Pizza (CC0) + Kenney 3D Kit
# ===================================================================
if ($assetType -eq "3d") {
  Install-KenneyAsset -AssetName "platformer-kit" -OutDir "assets"

  $query = if ($gameStyle -eq "rpg") { "character" } else { "player" }
  $apiUrl = "https://api.poly.pizza/v0.1/models?q=$query&limit=1"
  try {
    $response = Invoke-RestMethod -Uri $apiUrl -TimeoutSec 15 -ErrorAction Stop
    $modelUrl = $response.results[0].url
    Invoke-AssetDownload -Url $modelUrl -OutFile "assets/player.glb"
  } catch {
    Write-Warning "Poly Pizza API fail — dùng Kenney 3D model"
  }
}

# ===================================================================
# 2.5D: Isometric tiles từ Kenney
# ===================================================================
if ($assetType -eq "2.5d") {
  Install-KenneyAsset -AssetName "isometric-forest-pack" -OutDir "assets"
  Install-KenneyAsset -AssetName "isometric-buildings-pack" -OutDir "assets"
  Write-Output "  ℹ️  Map tiles from extracted dirs to game code"
}

Write-Output "`n✅ Asset download complete — adjust game code to match extracted file names"
```

> **Fallback khi không internet**: Dùng procedural generation — vẽ shape bằng code, sinh âm thanh bằng Web Audio API (xem `games/core/SKILL.md` và `game-h5-2d.md`).

---

## Animation States Chuẩn

Mọi entity (player, enemy, NPC) phải có các state sau: idle, run, jump, attack, hurt, die.

### 2D Sprite Sheet Format

```
player.png (spritesheet)
├── idle:    frames 0-3   (đứng yên, hít thở)
├── run:     frames 4-9   (chạy, 6 frame)
├── jump:    frames 10-12 (nhảy lên, trên không, rơi xuống)
├── attack:  frames 13-17 (tấn công, 5 frame)
├── hurt:    frames 18-19 (bị đau, 2 frame)
└── die:     frames 20-23 (chết, 4 frame)
```

Xem: `templates/animation-config.ts`

### 3D Animation States

3D model GLB đã có sẵn animations từ Mixamo / Sketchfab:

| State | Animation Clip | Looping |
|-------|---------------|---------|
| idle | `Idle` | Yes |
| run | `Running` / `Walk` | Yes |
| jump | `Jump` | No |
| attack | `Punch` / `Slash` | No |
| hurt | `Hit` / `Hurt` | No |
| die | `Death` / `Dying` | No |

Xem: `templates/animation-controller.ts`

---

## Entity State Machine (không lỗi)
Xem: `templates/entity-fsm.ts`

---

## Tự động tải Audio + Tạo âm thanh

### SoundManager hoàn chỉnh (load + fallback)
Xem: `templates/sound-manager.ts`

### Gắn SoundManager vào game loop
Xem: `templates/sound-integration.ts`

### Audio mapping theo Entity State
Xem: `templates/sfx-map.ts`

---

## Xử lý khi không có assets thật

Khi không thể download (mất mạng, URL die), dùng **procedural fallback**:
Xem: `templates/placeholders.ts`
