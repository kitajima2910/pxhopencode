// 2D: Tạo sprite từ canvas
function generatePlaceholderSprite(color: string, size = 32): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(2, 2, size - 4, size - 4);
  return canvas;
}

// 3D: Tạo model từ geometry
function createFallbackPlayer(): THREE.Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x2196F3 })
  );
  body.position.y = 1;
  group.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xFFCC80 })
  );
  head.position.y = 1.8;
  group.add(head);
  return group;
}

// Audio: Web Audio API synthesis (no files needed)
// Đã có SoundManager.generateSFX() và generateBGM() ở trên
