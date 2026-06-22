function createBillboard(element: HTMLElement, target: THREE.Object3D, camera: THREE.Camera) {
  const vector = target.position.clone().add(new THREE.Vector3(0, 2, 0));
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
  element.style.display = vector.z < 1 ? "block" : "none";
}

function drawCrosshair(ctx: CanvasRenderingContext2D) {
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const size = 10;
  const gap = 4;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - size, cy); ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + size, cy);
  ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + size);
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
  ctx.fill();
}
