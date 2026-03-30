import * as THREE from 'three';

export class Player {
    constructor(id, color, labyrinth, type = 'ROBOT') {
        this.id = id;
        this.color = color;
        this.labyrinth = labyrinth;
        this.type = type;
        this.speed = 6;
        this.rotSpeed = 3.0;
        this.keys = {};

        this.mesh = new THREE.Group();
        this.createModel();

        this.mesh.position.set(1.0, 0, 1.0);
        this.bobbing = 0;
        this.velocity = new THREE.Vector3();

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    createModel() {
        switch(this.type) {
            case 'ROBOT':
                this.createRobotModel();
                break;
            case 'SPIKE':
                this.createSpikeModel();
                break;
            case 'ORB':
                this.createOrbModel();
                break;
            default:
                this.createRobotModel();
        }
    }

    createRobotModel() {
        // Corps (Base flottante)
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

        // Tête (Visière sphérique)
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

        // Lumière de la visière
        const visorGeo = new THREE.BoxGeometry(0.2, 0.05, 0.1);
        const visorMat = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            emissive: this.color, 
            emissiveIntensity: 2 
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.82, 0.12);
        this.mesh.add(visor);

        // Mains flottantes
        const handGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const handMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        this.handL = new THREE.Mesh(handGeo, handMat);
        this.handL.position.set(-0.3, 0.6, 0.1);
        this.handR = new THREE.Mesh(handGeo, handMat);
        this.handR.position.set(0.3, 0.6, 0.1);
        this.mesh.add(this.handL, this.handR);

        // Lumière du propulseur (en dessous)
        const lightGeo = new THREE.CylinderGeometry(0.08, 0, 0.1, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
        const thruster = new THREE.Mesh(lightGeo, lightMat);
        thruster.position.y = 0.35;
        this.mesh.add(thruster);
    }

    createSpikeModel() {
        const coreGeo = new THREE.OctahedronGeometry(0.25, 0);
        const coreMat = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            emissive: this.color, 
            emissiveIntensity: 0.5,
            flatShading: true 
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 0.6;
        this.mesh.add(core);

        // Pointes en orbite
        this.spikes = new THREE.Group();
        this.spikes.position.y = 0.6;
        const spikeGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1 });
        
        for(let i=0; i<8; i++) {
            const spike = new THREE.Mesh(spikeGeo, spikeMat);
            const angle = (i / 8) * Math.PI * 2;
            spike.position.set(Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4);
            spike.lookAt(0, 0.6, 0);
            spike.rotateX(Math.PI/2);
            this.spikes.add(spike);
        }
        this.mesh.add(this.spikes);
    }

    createOrbModel() {
        const innerGeo = new THREE.SphereGeometry(0.15, 32, 32);
        const innerMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, 
            emissive: 0xffffff, 
            emissiveIntensity: 2 
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.y = 0.6;
        this.mesh.add(inner);

        const outerGeo = new THREE.SphereGeometry(0.3, 32, 32);
        const outerMat = new THREE.MeshStandardMaterial({ 
            color: this.color, 
            transparent: true, 
            opacity: 0.3, 
            roughness: 0, 
            metalness: 1 
        });
        this.outerOrb = new THREE.Mesh(outerGeo, outerMat);
        this.outerOrb.position.y = 0.6;
        this.mesh.add(this.outerOrb);

        const ringGeo = new THREE.TorusGeometry(0.4, 0.02, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ color: this.color, emissive: this.color });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.ring.position.y = 0.6;
        this.ring.rotation.x = Math.PI/2;
        this.mesh.add(this.ring);
    }

    isColliding(x, z) {
        const radius = 0.15; // Rayon réduit pour éviter les micro-blocages
        // Vérifie 4 points autour du joueur
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

        // Contrôles séparés :
        const isMultiplayer = this.labyrinth.playerCount > 1;

        if (!isMultiplayer) {
            // MODE SOLO : ZQSD pour se déplacer, Flèches pour tourner
            if (this.keys['KeyW'] || this.keys['KeyZ']) moveForward = true;
            if (this.keys['KeyS']) moveBackward = true;
            if (this.keys['KeyA'] || this.keys['KeyQ']) strafeLeft = true;
            if (this.keys['KeyD']) strafeRight = true;
            if (this.keys['ArrowLeft']) rotateLeft = true;
            if (this.keys['ArrowRight']) rotateRight = true;
        } else if (this.id === 1) {
            // Joueur 1 (Multi) : WASD/ZQSD
            if (this.keys['KeyW'] || this.keys['KeyZ']) moveForward = true;
            if (this.keys['KeyS']) moveBackward = true;
            if (this.keys['KeyA'] || this.keys['KeyQ']) rotateLeft = true;
            if (this.keys['KeyD']) rotateRight = true;
            if (this.keys['KeyE']) strafeRight = true;
        } else {
            // Joueur 2 (Multi) : Flèches
            if (this.keys['ArrowUp']) moveForward = true;
            if (this.keys['ArrowDown']) moveBackward = true;
            if (this.keys['ArrowLeft']) rotateLeft = true;
            if (this.keys['ArrowRight']) rotateRight = true;
        }

        // Appliquer la rotation
        if (rotateLeft) this.mesh.rotation.y += this.rotSpeed * delta;
        if (rotateRight) this.mesh.rotation.y -= this.rotSpeed * delta;

        // Vecteur de direction du mouvement
        const moveDir = new THREE.Vector3(0, 0, 0);
        if (moveForward) moveDir.z -= 1;
        if (moveBackward) moveDir.z += 1;
        if (strafeLeft) moveDir.x -= 1;
        if (strafeRight) moveDir.x += 1;

        if (moveDir.length() > 0) {
            moveDir.normalize();
            // Faire pivoter le vecteur de mouvement par rapport à l'orientation du joueur
            moveDir.applyQuaternion(this.mesh.quaternion);
            
            const moveStep = moveDir.multiplyScalar(this.speed * delta);
            const nextX = this.mesh.position.x + moveStep.x;
            const nextZ = this.mesh.position.z + moveStep.z;

            // Logique de collision avec glissement
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

        // Animation d'attente et de mouvement
        this.bobbing += delta * 5;
        const bob = Math.sin(this.bobbing) * 0.05;
        const isMoving = moveForward || moveBackward || strafeLeft || strafeRight;

        if (this.type === 'ROBOT') {
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
        } else if (this.type === 'SPIKE') {
            if (this.spikes) {
                this.spikes.rotation.y += delta * 2;
                this.spikes.position.y = 0.6 + bob;
            }
            if (this.mesh.children[0]) {
                this.mesh.children[0].position.y = 0.6 + bob;
                this.mesh.children[0].rotation.x += delta;
                this.mesh.children[0].rotation.z += delta * 0.5;
            }
        } else if (this.type === 'ORB') {
            if (this.outerOrb) {
                this.outerOrb.position.y = 0.6 + bob;
                this.outerOrb.scale.setScalar(1 + Math.sin(this.bobbing * 2) * 0.05);
            }
            if (this.ring) {
                this.ring.position.y = 0.6 + bob;
                this.ring.rotation.z += delta * 3;
                this.ring.rotation.x = Math.PI/2 + Math.sin(this.bobbing) * 0.2;
            }
            if (this.mesh.children[0]) {
                this.mesh.children[0].position.y = 0.6 + bob;
            }
        }
    }
}
