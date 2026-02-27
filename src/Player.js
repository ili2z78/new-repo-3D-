import * as THREE from 'three';

export class Player {
    constructor(id, color, labyrinth) {
        this.id = id;
        this.color = color;
        this.labyrinth = labyrinth;
        this.speed = 6;
        this.rotSpeed = 3.0;
        this.keys = {};

        // Player model (Sleek robot design)
        this.mesh = new THREE.Group();
        
        // Body (Floating base)
        const bodyGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            roughness: 0.1, 
            metalness: 0.8,
            emissive: this.color,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        body.castShadow = true;
        this.mesh.add(body);

        // Head (Spherical visor)
        const headGeo = new THREE.SphereGeometry(0.18, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0, 
            metalness: 1 
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.8;
        head.castShadow = true;
        this.mesh.add(head);

        // Visor light
        const visorGeo = new THREE.BoxGeometry(0.2, 0.05, 0.1);
        const visorMat = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            emissive: this.color, 
            emissiveIntensity: 2 
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.82, 0.12);
        this.mesh.add(visor);

        // Floating hands
        const handGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const handMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        this.handL = new THREE.Mesh(handGeo, handMat);
        this.handL.position.set(-0.3, 0.6, 0.1);
        this.handR = new THREE.Mesh(handGeo, handMat);
        this.handR.position.set(0.3, 0.6, 0.1);
        this.mesh.add(this.handL, this.handR);

        // Thruster light (underneath)
        const lightGeo = new THREE.CylinderGeometry(0.08, 0, 0.1, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
        const thruster = new THREE.Mesh(lightGeo, lightMat);
        thruster.position.y = 0.35;
        this.mesh.add(thruster);

        this.mesh.position.set(1.0, 0, 1.0); // Parfaitement centré dans la cellule (1,1)
        this.bobbing = 0;
        this.velocity = new THREE.Vector3();

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    isColliding(x, z) {
        const radius = 0.15; // Rayon réduit pour éviter les micro-blocages
        // Check 4 points around the player
        return this.labyrinth.isWall(x - radius, z - radius) ||
               this.labyrinth.isWall(x + radius, z - radius) ||
               this.labyrinth.isWall(x - radius, z + radius) ||
               this.labyrinth.isWall(x + radius, z + radius);
    }

    update(delta) {
        let moveForward = false;
        let moveBackward = false;
        let strafeLeft = false;
        let strafeRight = false;
        let rotateLeft = false;
        let rotateRight = false;

        // Separate Controls:
        // Letters (ZQSD/WASD) for MOVEMENT
        if (this.keys['KeyW'] || this.keys['KeyZ']) moveForward = true;
        if (this.keys['KeyS']) moveBackward = true;
        if (this.keys['KeyA'] || this.keys['KeyQ']) strafeLeft = true;
        if (this.keys['KeyD']) strafeRight = true;

        // Arrows for ROTATION (Camera/Player orientation)
        if (this.keys['ArrowLeft']) rotateLeft = true;
        if (this.keys['ArrowRight']) rotateRight = true;

        // Apply Rotation
        if (rotateLeft) this.mesh.rotation.y += this.rotSpeed * delta;
        if (rotateRight) this.mesh.rotation.y -= this.rotSpeed * delta;

        // Movement Direction Vector
        const moveDir = new THREE.Vector3(0, 0, 0);
        if (moveForward) moveDir.z -= 1;
        if (moveBackward) moveDir.z += 1;
        if (strafeLeft) moveDir.x -= 1;
        if (strafeRight) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize();
            // Rotate movement vector relative to player's orientation
            moveDir.applyQuaternion(this.mesh.quaternion);
            
            const moveStep = moveDir.multiplyScalar(this.speed * delta);
            const nextX = this.mesh.position.x + moveStep.x;
            const nextZ = this.mesh.position.z + moveStep.z;

            // Collision logic with sliding
            if (!this.isColliding(nextX, nextZ)) {
                this.mesh.position.x = nextX;
                this.mesh.position.z = nextZ;
            } else {
                if (!this.isColliding(nextX, this.mesh.position.z)) {
                    this.mesh.position.x = nextX;
                } else if (!this.isColliding(this.mesh.position.x, nextZ)) {
                    this.mesh.position.z = nextZ;
                }
            }
        }

        // Idle & Move Animation
        this.bobbing += delta * 5;
        const bob = Math.sin(this.bobbing) * 0.05;
        const isMoving = moveForward || moveBackward || strafeLeft || strafeRight;

        if (this.mesh.children[0]) this.mesh.children[0].position.y = 0.5 + bob;
        if (this.mesh.children[1]) this.mesh.children[1].position.y = 0.8 + bob;
        if (this.mesh.children[2]) this.mesh.children[2].position.y = 0.82 + bob;

        const handBob = Math.sin(this.bobbing * 2) * (isMoving ? 0.1 : 0.02);
        if (this.handL) {
            this.handL.position.y = 0.6 + handBob;
            this.handL.position.z = 0.1 + (isMoving ? Math.cos(this.bobbing * 2) * 0.1 : 0);
        }
        if (this.handR) {
            this.handR.position.y = 0.6 - handBob;
            this.handR.position.z = 0.1 - (isMoving ? Math.cos(this.bobbing * 2) * 0.1 : 0);
        }
    }
}
