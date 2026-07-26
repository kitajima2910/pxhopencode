---
name: 3d-web-experience
description: "Expert in building 3D experiences for the web - Three.js, React Three Fiber, Spline, WebGL, and interactive 3D scenes. Covers product configurators, 3D portfolios, immersive websites, and bringing depth to web experiences. Use when: 3D website, three.js, WebGL, react three fiber, 3D experience."
source: vibeship-spawner-skills (Apache 2.0)
---

# 3D Web Experience

**Khi dùng:** Task 3D web → load skill. Chọn stack theo decision tree.

## 3D Stack Selection

| Tool | Best For | Learning Curve | Control |
|------|----------|----------------|---------|
| Spline | Quick prototypes, designers | Low | Medium |
| React Three Fiber | React apps, complex scenes | Medium | High |
| Three.js vanilla | Max control, non-React | High | Maximum |
| Babylon.js | Games, heavy 3D | High | Maximum |

### Decision Tree
```
Need quick 3D element? → Spline
Using React? → React Three Fiber
Need max performance? → Three.js vanilla
Otherwise → Spline or R3F
```

## 3D Model Pipeline
| Format | Use Case | Size |
|--------|----------|------|
| GLB/GLTF | Standard web 3D | Smallest |
| FBX | From 3D software | Large |
| OBJ | Simple meshes | Medium |
| USDZ | Apple AR | Medium |

### Optimization Pipeline
1. Model in Blender → 2. Reduce poly (<100K) → 3. Bake textures → 4. Export GLB → 5. `gltf-transform optimize --compress draco --texture-compress webp` → 6. Test <5MB

### Loading in R3F
```jsx
import { useGLTF, useProgress, Html } from '@react-three/drei';
import { Suspense } from 'react';
function Loader() { const { progress } = useProgress(); return <Html center>{progress.toFixed(0)}%</Html>; }
export default function Scene() {
  return (<Canvas><Suspense fallback={<Loader />}><Model /></Suspense></Canvas>);
}
```

## Scroll-Driven 3D
| Method | Library | Pattern |
|--------|---------|---------|
| R3F Scroll | @react-three/drei | `ScrollControls pages={3}` + `useScroll().offset` |
| GSAP + Three | gsap/ScrollTrigger | `gsap.to(camera.position, {scrollTrigger: {trigger, scrub}})` |

## Anti-Patterns
| Anti-Pattern | Fix |
|-------------|------|
| 3D for 3D's sake | 3D should serve purpose (product viz=good, random shapes=bad) |
| Desktop-only 3D | Test mobile, reduce quality, provide static fallback |
| No loading state | Progress indicator, skeleton, load 3D after page interactive |
| Model too large | Draco compression, <5MB, lazy load |
| No fallback for low-end | Disable 3D on low-end devices, graceful degradation |

## Related
- Works well with: frontend, landing-page-design