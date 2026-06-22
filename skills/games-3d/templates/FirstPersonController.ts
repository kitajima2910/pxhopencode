class FirstPersonController {
  private pitch = 0;
  private yaw = 0;
  private speed = 8;
  private sensitivity = 0.002;
  private isLocked = false;

  constructor(
    private camera: THREE.PerspectiveCamera,
    private domElement: HTMLElement
  ) {
    this.domElement.addEventListener("click", () => {
      this.domElement.requestPointerLock();
    });

    document.addEventListener("pointerlockchange", () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.isLocked) return;
      this.yaw -= e.movementX * this.sensitivity;
      this.pitch -= e.movementY * this.sensitivity;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    });
  }

  update(delta: number) {
    const qx = new THREE.Quaternion();
    const qy = new THREE.Quaternion();
    qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
    qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    this.camera.quaternion.copy(qx.multiply(qy));

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    const keys = this.getKeys();
    const velocity = new THREE.Vector3();
    if (keys.w) velocity.add(forward);
    if (keys.s) velocity.sub(forward);
    if (keys.a) velocity.sub(right);
    if (keys.d) velocity.add(right);
    velocity.normalize().multiplyScalar(this.speed * delta);

    this.camera.position.add(velocity);
  }

  private getKeys() {
    return {
      w: this.isKeyDown("KeyW"),
      a: this.isKeyDown("KeyA"),
      s: this.isKeyDown("KeyS"),
      d: this.isKeyDown("KeyD"),
    };
  }

  private isKeyDown(code: string): boolean {
    return false;
  }
}
