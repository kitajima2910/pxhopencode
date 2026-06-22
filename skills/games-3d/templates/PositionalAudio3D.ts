class PositionalAudio3D {
  private ctx: AudioContext;
  private listener: AudioListener;

  constructor() {
    this.ctx = new AudioContext();
    this.listener = this.ctx.listener;
  }

  updateListener(camera: THREE.PerspectiveCamera) {
    const pos = camera.position;
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    this.listener.positionX.value = pos.x;
    this.listener.positionY.value = pos.y;
    this.listener.positionZ.value = pos.z;
    this.listener.forwardX.value = dir.x;
    this.listener.forwardY.value = dir.y;
    this.listener.forwardZ.value = dir.z;
  }

  playAt(url: string, position: THREE.Vector3, volume: number = 1) {
    const panner = this.ctx.createPanner();
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.distanceModel = "inverse";
    panner.refDistance = 10;
    panner.maxDistance = 100;

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    gain.gain.value = volume;

    source.connect(panner).connect(gain).connect(this.ctx.destination);
  }
}
