# Marble Racing 3D — Implementation

## Stack
- **Renderer**: Three.js (WebGL)
- **Physics**: Cannon-es (3D physics engine)
- **Testing**: Vitest + `three-test-helper.ts` (headless)

## Setup

```bash
npm install three cannon-es
npm install -D vitest @types/three
```

## 1. Physics World (Cannon-es)

```typescript
import * as CANNON from "cannon-es";

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;
world.allowSleep = true;

// Contact material
const ballMat = new CANNON.Material("ball");
const groundMat = new CANNON.Material("ground");
const contact = new CANNON.ContactMaterial(ballMat, groundMat, {
  friction: 0.3,
  restitution: 0.2,
});
world.addContactMaterial(contact);

// Fixed timestep 60 Hz
const fixedStep = 1 / 60;
let accumulator = 0;

function fixedUpdate(dt: number) {
  accumulator += dt;
  if (accumulator > 0.1) accumulator = 0.1; // clamp
  while (accumulator >= fixedStep) {
    world.step(fixedStep);
    accumulator -= fixedStep;
  }
}
```

## 2. Ball

```typescript
class MarbleBall {
  body: CANNON.Body;
  mesh: THREE.Mesh;
  private maxSpeed = 15;

  constructor(scene: THREE.Scene, world: CANNON.World, pos: THREE.Vector3) {
    const radius = 0.5;

    // Physics body
    this.body = new CANNON.Body({ mass: 1 });
    this.body.addShape(new CANNON.Sphere(radius));
    this.body.position.set(pos.x, pos.y, pos.z);
    this.body.linearDamping = 0.05;
    this.body.angularDamping = 0.1;
    this.body.material = ballMat;
    world.addBody(this.body);

    // Visual mesh
    const geo = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      roughness: 0.3,
      metalness: 0.5,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
  }

  applyForce(input: { x: number; z: number }, cameraForward: THREE.Vector3) {
    const force = new THREE.Vector3(input.x, 0, input.z);
    force.normalize().multiplyScalar(8);

    // Camera-relative direction
    const dir = new THREE.Vector3();
    dir.copy(cameraForward);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0));

    const worldForce = new CANNON.Vec3();
    worldForce.x = dir.x * force.z + right.x * force.x;
    worldForce.z = dir.z * force.z + right.z * force.x;

    // Clamp speed
    const speed = this.body.velocity.length();
    if (speed < this.maxSpeed) {
      this.body.applyForce(worldForce, this.body.position);
    }
  }

  sync() {
    this.mesh.position.copy(this.body.position as any);
    this.mesh.quaternion.copy(this.body.quaternion as any);
  }

  isFallen(thresholdY = -5) {
    return this.body.position.y < thresholdY;
  }

  reset(pos: THREE.Vector3) {
    this.body.position.set(pos.x, pos.y, pos.z);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }
}
```

## 3. Track (Spline-based)

```typescript
class RaceTrack {
  curve: THREE.CatmullRomCurve3;
  mesh: THREE.Group;
  checkpoints: THREE.Vector3[] = [];

  constructor(scene: THREE.Scene, points: THREE.Vector3[]) {
    this.curve = new THREE.CatmullRomCurve3(points);
    this.mesh = new THREE.Group();
    this.buildTrack(scene);
  }

  private buildTrack(scene: THREE.Scene) {
    const segments = 200;
    const trackWidth = 4;
    const wallHeight = 1.5;

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const pos = this.curve.getPoint(t);
      const tangent = this.curve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Floor segment
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(trackWidth, this.curve.getLength() / segments),
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 })
      );
      floor.position.copy(pos);
      floor.lookAt(pos.clone().add(tangent));
      floor.receiveShadow = true;
      this.mesh.add(floor);

      // Walls (left + right)
      for (const side of [-1, 1]) {
        const wallPos = pos.clone().add(normal.clone().multiplyScalar(side * (trackWidth / 2 + 0.15)));
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, wallHeight, this.curve.getLength() / segments),
          new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        wall.position.copy(wallPos);
        wall.position.y += wallHeight / 2;
        wall.lookAt(wallPos.clone().add(tangent));
        wall.castShadow = true;
        this.mesh.add(wall);
      }
    }

    // Barrier (invisible) — for physics collision
    // Dùng height field hoặc box stack dọc track
    this.addPhysicsBarriers(world);

    scene.add(this.mesh);
  }

  private addPhysicsBarriers(world: CANNON.World) {
    // Sinh CANNON.Box dọc track làm barrier
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const pos = this.curve.getPoint(t);
      for (const side of [-1, 1]) {
        const barrier = new CANNON.Body({ mass: 0 });
        barrier.addShape(new CANNON.Box(new CANNON.Vec3(0.2, 1, 2)));
        const normal = new CANNON.Vec3();
        const tangent = this.curve.getTangent(t);
        normal.set(-tangent.z, 0, tangent.x).scale(side);
        barrier.position.set(pos.x + normal.x * 2.2, 1, pos.z + normal.z * 2.2);
        world.addBody(barrier);
      }
    }
  }

  getPoint(t: number) {
    return this.curve.getPoint(t);
  }

  getProgress(position: THREE.Vector3) {
    // Find closest point on curve
    let minDist = Infinity;
    let bestT = 0;
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const p = this.curve.getPoint(t);
      const dist = position.distanceTo(p);
      if (dist < minDist) { minDist = dist; bestT = t; }
    }
    return bestT;
  }
}
```

## 4. Camera Follow

```typescript
class RacingCamera {
  camera: THREE.PerspectiveCamera;
  private offset = new THREE.Vector3(0, 3, 6);

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 100);
  }

  follow(target: THREE.Vector3, velocity: THREE.Vector3, dt: number) {
    const forward = velocity.clone().normalize();
    if (forward.length() < 0.01) forward.set(0, 0, -1);

    // Look-ahead: camera ở phía sau ball + hướng theo vận tốc
    const desired = target.clone()
      .add(new THREE.Vector3(0, 3, 0))
      .sub(forward.clone().multiplyScalar(6));

    this.camera.position.lerp(desired, 1 - Math.pow(0.01, dt));
    this.camera.lookAt(target);
  }

  reset(pos: THREE.Vector3) {
    this.camera.position.set(pos.x, pos.y + 3, pos.z + 6);
    this.camera.lookAt(pos);
  }
}
```

## 5. Checkpoint & Timer

```typescript
class RaceManager {
  checkpoints: THREE.Vector3[] = [];
  currentCP = 0;
  startTime = 0;
  elapsed = 0;
  finished = false;

  constructor(track: RaceTrack) {
    // Place 5 checkpoints along track
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      this.checkpoints.push(track.getPoint(t));
    }
  }

  start() {
    this.startTime = performance.now();
    this.currentCP = 0;
    this.finished = false;
  }

  update(ballPos: THREE.Vector3) {
    if (this.finished) return;
    this.elapsed = (performance.now() - this.startTime) / 1000;

    // Check checkpoint
    const cp = this.checkpoints[this.currentCP];
    if (cp && ballPos.distanceTo(cp) < 2) {
      this.currentCP++;
      return "checkpoint";
    }

    // Check finish
    if (this.currentCP >= this.checkpoints.length) {
      this.finished = true;
      return "finish";
    }

    return null;
  }

  formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 100) % 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  }
}
```

## 6. Game Loop Integration

```typescript
import * as THREE from "three";
import * as CANNON from "cannon-es";

class MarbleRacingGame {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: RacingCamera;
  world: CANNON.World;
  ball: MarbleBall;
  track: RaceTrack;
  manager: RaceManager;
  input = { x: 0, z: 0 };
  clock = new THREE.Clock();
  accumulator = 0;
  fixedStep = 1 / 60;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.camera = new RacingCamera(canvas.width / canvas.height);
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    this.scene.add(ambient, sun);

    // Track
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 0),
      new THREE.Vector3(20, 1, 5),
      new THREE.Vector3(20, 2, 15),
      new THREE.Vector3(10, 1, 20),
      new THREE.Vector3(0, 0, 20),
    ];
    this.track = new RaceTrack(this.scene, points);

    // Ball at start
    const start = points[0].clone().add(new THREE.Vector3(0, 1, 0));
    this.ball = new MarbleBall(this.scene, this.world, start);

    // Race manager
    this.manager = new RaceManager(this.track);
    this.manager.start();

    this.setupInput();
    this.animate();
  }

  private setupInput() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp": case "w": this.input.z = 1; break;
        case "ArrowDown": case "s": this.input.z = -1; break;
        case "ArrowLeft": case "a": this.input.x = -1; break;
        case "ArrowRight": case "d": this.input.x = 1; break;
        case "r": this.ball.reset(this.track.getPoint(0).clone().add(new THREE.Vector3(0, 1, 0))); break;
      }
    });
    document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowUp": case "w": if (this.input.z === 1) this.input.z = 0; break;
        case "ArrowDown": case "s": if (this.input.z === -1) this.input.z = 0; break;
        case "ArrowLeft": case "a": if (this.input.x === -1) this.input.x = 0; break;
        case "ArrowRight": case "d": if (this.input.x === 1) this.input.x = 0; break;
      }
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    // Physics
    this.accumulator += dt;
    while (this.accumulator >= this.fixedStep) {
      const camForward = new THREE.Vector3();
      this.camera.camera.getWorldDirection(camForward);
      this.ball.applyForce(this.input, camForward);
      this.world.step(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    // Sync
    this.ball.sync();

    // Check fall
    if (this.ball.isFallen()) {
      const cp = this.manager.checkpoints[Math.max(0, this.manager.currentCP - 1)];
      this.ball.reset(cp ? cp.clone().add(new THREE.Vector3(0, 1, 0)) : this.track.getPoint(0).clone().add(new THREE.Vector3(0, 1, 0)));
      this.camera.reset(this.ball.mesh.position);
    }

    // Race events
    const event = this.manager.update(this.ball.mesh.position);
    if (event === "checkpoint") { /* play sfx */ }
    if (event === "finish") { /* victory */ }

    // Camera
    this.camera.follow(this.ball.mesh.position, this.ball.body.velocity as any, dt);

    // Render
    this.renderer.render(this.scene, this.camera.camera);
  }
}
```

## 7. Country Theming

```typescript
interface CountryTheme {
  name: string;
  trackColor: number;
  wallColor: number;
  skyColor: number;
  ballColor: number;
  decorations: () => THREE.Object3D[];
}

const themes: Record<string, CountryTheme> = {
  vietnam: {
    name: "Việt Nam",
    trackColor: 0xcc0000,
    wallColor: 0xffcc00,
    skyColor: 0x87CEEB,
    ballColor: 0xff4444,
    decorations: () => [/* flag, nón lá models */],
  },
  japan: {
    name: "Nhật Bản",
    trackColor: 0xffffff,
    wallColor: 0xcc0000,
    skyColor: 0xf0e6d3,
    ballColor: 0xff6666,
    decorations: () => [/* lantern, cherry blossom */],
  },
  france: {
    name: "Pháp",
    trackColor: 0x002395,
    wallColor: 0xffffff,
    skyColor: 0xb0c4de,
    ballColor: 0x0055a4,
    decorations: () => [/* eiffel tower mini */],
  },
};

function applyTheme(scene: THREE.Scene, theme: CountryTheme) {
  scene.background = new THREE.Color(theme.skyColor);
  // Apply to track materials, ball color, etc.
}
```

## 8. Headless Test (Vitest)

```typescript
// test/marble-racing.test.ts
import { describe, it, expect } from "vitest";
import { createHeadlessRenderer, advanceFrames } from "../test-helper";

describe("Marble Racing Physics", () => {
  it("ball accelerates with force", () => {
    // Khởi tạo game headless
    // Apply force forward
    // Check velocity > 0
  });

  it("ball resets on fall", () => {
    // Đặt ball ở Y = -10
    // Check reset position = checkpoint
  });

  it("checkpoint triggers at correct position", () => {
    // Đặt ball gần checkpoint
    // Check event = "checkpoint"
  });

  it("lap timer increments correctly", () => {
    // Start timer
    // Advance 1s
    // Check elapsed ≈ 1.0
  });
});
```

## References
- Design: `game-design-h5-marble-racing.md`
- 3D base implementation: `game-h5-3d.md`
- Headless testing: `skills/games-testing/templates/three-test-helper.ts`
- Performance optimization: `skills/games-optimization/SKILL.md`
