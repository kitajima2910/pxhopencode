---
name: games-audio
description: Audio game — Web Audio API pool, spatial 3D, dynamic compression, format fallback. Không memory leak, tự động GC.
---

# games-audio — Audio System

## Audio Pool (tái sử dụng, không memory leak)
Pool tái sử dụng AudioBufferSourceNode, tự động release sau khi phát, auto-safe nếu onended không fire.
Xem: `templates/audio-pool.ts`

## Spatial Audio 3D
PannerNode với HRTF, inverse distance model, cập nhật listener và source position real-time.
Xem: `templates/spatial-audio.ts`

## Dynamic Compression (tránh distortion)
DynamicsCompressorNode, threshold -24, ratio 12, attack 3ms, release 250ms.
Xem: `templates/audio-compressor.ts`

## Format Fallback
Tự động detect format browser hỗ trợ (mp3/ogg/wav/aac), fallback về mp3.
Xem: `templates/format-fallback.ts`
