# Nguồn Asset Miễn phí

## Auto-download mapping (script: `_shared/scripts/download-games-assets.ps1`)

Script tự động chọn asset theo `AssetType` + `GameStyle`. Ưu tiên: Kenney → OpenGameArt → procedural fallback.

| GameStyle | 2D (Kenney) | 3D (Kenney) | 2.5D (Kenney) |
|-----------|-------------|-------------|---------------|
| **platformer** | new-platformer-pack | platformer-kit | — |
| **rpg** | tiny-dungeon | fantasy-kit | isometric-buildings-pack |
| **shooter** | top-down-shooter | fps-kit | isometric-tactical-pack |
| **racing** | racing-pack | racing-kit | — |
| **puzzle** | puzzle-pack | — | — |
| **horror** | halloween-pack | horror-kit | — |
| **shmup** (space) | space-shooter-redux | — | — |
| **strategy** | strategy-pack | — | isometric-forest-pack |
| **adventure** | adventure-pack | — | — |

## 2D Sprites & Tilesets
- Kenney `https://kenney.nl/assets` — CC0
- OpenGameArt `https://opengameart.org` — CC0/CC-BY/GPL
- Itch.io `https://itch.io/game-assets/free`
- Sprite Database `https://spritedatabase.net`
- Lospec Palette `https://lospec.com/palette-list`

## 2.5D / Isometric Tiles
- Kenney Isometric `https://kenney.nl/assets?q=isometric`
- OpenGameArt Isometric `https://opengameart.org/art-search?keys=isometric`
- CrusenDho `https://crusen-dho.en.lo4d.com`

## 3D Models (GLB/GLTF)
- Sketchfab `https://sketchfab.com/3d-models?features=downloadable&sort=-free` — CC0/CC-BY
- Quaternius `https://quaternius.com` — CC0
- Poly Pizza `https://poly.pizza` — CC0
- AmbientCG `https://ambientcg.com` — PBR textures, CC0
- Mixamo `https://mixamo.com` — animations, free (Adobe account)

## Audio & SFX
- Freesound `https://freesound.org` — CC0/CC-BY
- Kenney Audio `https://kenney.nl/assets?q=audio` — CC0
- Pixabay Music `https://pixabay.com/music`
- Zapsplat `https://zapsplat.com`
- Mixkit `https://mixkit.co/free-sound-effects`
- jsfxr `https://sfxr.me` — 8-bit SFX generator
- Chiptone `https://sb.bitsnbites.eu` — chiptune generator
- BFXR `https://www.bfxr.net` — retro SFX
- MusicGen (Meta) `https://huggingface.co/spaces/facebook/MusicGen`

## BGM gợi ý
| Thể loại game | Nguồn gợi ý |
|--------------|------------|
| Platformer/Action | Kenney "Platformer Audio", Pixabay "Electronic" |
| RPG/Adventure | Freesound "Fantasy", Mixkit "Cinematic" |
| Puzzle/Casual | Pixabay "Lo-fi", Mixkit "Relax" |
| Horror | Freesound "Horror", Zapsplat "Dark" |
| Racing/Sports | Pixabay "Rock", Mixkit "Sport" |
| Shmup/Arcade | jsfxr/BFXR sinh 8-bit SFX tự động |
| Strategy | Mixkit "Cinematic", Pixabay "Corporate" |

## Fonts
- Google Fonts `https://fonts.google.com`
- Kenney Fonts `https://kenney.nl/assets/kenney-fonts`

## Khi không có asset phù hợp
Procedural fallback trong `templates/placeholders.ts`:
- **2D**: Canvas `fillRect` + `strokeRect` tạo sprite hình học
- **3D**: Three.js `CapsuleGeometry` + `SphereGeometry` tạo nhân vật
- **SFX**: Web Audio API sinh shoot/jump/hurt/coin/die tự động
- **BGM**: Melody loop 8 note (C D E F G F E D) — 8 giây loop
