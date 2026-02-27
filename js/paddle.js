import * as THREE from 'three';



export class Paddle {
  constructor(scene, x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 0.5, 3);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    scene.add(this.mesh);
  }

  move(deltaZ) {
    this.mesh.position.z += deltaZ;
  }
}
