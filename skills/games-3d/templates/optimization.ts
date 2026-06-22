const bulletPool: THREE.Mesh[] = [];
function getBullet(): THREE.Mesh {
  return bulletPool.pop() || new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 4, 4),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
}
function returnBullet(bullet: THREE.Mesh) {
  scene.remove(bullet);
  bulletPool.push(bullet);
}

const lod = new THREE.LOD();
lod.addLevel(highPolyMesh, 0);
lod.addLevel(mediumPolyMesh, 20);
lod.addLevel(lowPolyMesh, 50);
scene.add(lod);

renderer.frustumCulling = true;

const merged = BufferGeometryUtils.mergeGeometries([
  rock1.geometry, rock2.geometry, rock3.geometry
]);
const mergedMesh = new THREE.Mesh(merged, rockMaterial);
