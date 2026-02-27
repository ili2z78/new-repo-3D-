import * as THREE from 'three';
import { Labyrinth } from './Labyrinth.js';
import { Player } from './Player.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111118);
        // Clearer fog
        this.scene.fog = new THREE.Fog(0x111118, 5, 30);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Simple tone mapping to avoid "brouillé"
        this.renderer.toneMapping = THREE.NoToneMapping;
        document.getElementById('container').appendChild(this.renderer.domElement);

        this.labyrinthWidth = 21;
        this.labyrinthHeight = 21;
        this.labyrinth = new Labyrinth(this.labyrinthWidth, this.labyrinthHeight);
        this.labyrinth.generate();

        this.players = [];
        this.cameras = [];
        this.currentCameraView = 'third-person';

        this.initLights();
        this.initEnvironment();

        this.isGameOver = false;
        this.isGameStarted = false;
        this.startTime = 0;

        document.getElementById('btn-solo').addEventListener('click', () => this.start(1));
        document.getElementById('btn-multi').addEventListener('click', () => this.start(2));
        
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));

        this.animate();
    }

    start(playerCount) {
        const size = parseInt(document.getElementById('maze-size').value);
        
        // Reset state
        this.isGameOver = false;
        this.players = [];
        this.cameras = [];
        
        // Clear scene
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }

        this.labyrinthWidth = size;
        this.labyrinthHeight = size;
        this.labyrinth = new Labyrinth(this.labyrinthWidth, this.labyrinthHeight);
        this.labyrinth.generate();
        
        this.initLights();
        this.initEnvironment();

        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('ui').style.display = 'block';
        
        this.addPlayer(1, 0x00ff00);
        if (playerCount > 1) {
            this.addPlayer(2, 0x0000ff);
        }

        this.isGameStarted = true;
        this.startTime = Date.now();
    }

    initLights() {
        // More bright ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        // Directional light instead of point light for clearer shadows
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(20, 40, 20);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
    }

    createProceduralTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        if (type === 'floor') {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, 512, 512);
            
            // Grid lines
            ctx.strokeStyle = '#1a1a2f';
            ctx.lineWidth = 2;
            for (let i = 0; i < 512; i += 64) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
            }
            
            // Glowing circuits
            ctx.strokeStyle = '#00ffff33';
            ctx.lineWidth = 1;
            for(let i=0; i<10; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random()*512, Math.random()*512);
                ctx.lineTo(Math.random()*512, Math.random()*512);
                ctx.stroke();
            }
        } else if (type === 'wall') {
            const grad = ctx.createLinearGradient(0, 0, 0, 512);
            grad.addColorStop(0, '#1a1a2a');
            grad.addColorStop(0.5, '#0f0f1a');
            grad.addColorStop(1, '#1a1a2a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);
            
            // Tech patterns
            ctx.strokeStyle = '#333344';
            ctx.lineWidth = 4;
            ctx.strokeRect(40, 40, 432, 432);
            ctx.strokeRect(100, 0, 312, 512);
            
            // Glowing strips
            ctx.fillStyle = '#00ccff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ccff';
            ctx.fillRect(250, 100, 12, 312);
        } else if (type === 'ceiling') {
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 150; i++) {
                ctx.fillStyle = `rgba(150,200,255,${Math.random()})`;
                ctx.beginPath();
                ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    initEnvironment() {
        const floorTexture = this.createProceduralTexture('floor');
        floorTexture.repeat.set(this.labyrinthWidth, this.labyrinthHeight);
        
        const wallTexture = this.createProceduralTexture('wall');
        const ceilingTexture = this.createProceduralTexture('ceiling');
        ceilingTexture.repeat.set(this.labyrinthWidth / 4, this.labyrinthHeight / 4);

        const floorGeo = new THREE.PlaneGeometry(this.labyrinthWidth + 20, this.labyrinthHeight + 20);
        const floorMat = new THREE.MeshStandardMaterial({ 
            map: floorTexture,
            roughness: 0.1,
            metalness: 0.8
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(this.labyrinthWidth / 2 - 0.5, 0, this.labyrinthHeight / 2 - 0.5);
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Walls
        const wallGeo = new THREE.BoxGeometry(1, 2, 1);
        const wallMat = new THREE.MeshStandardMaterial({ 
            map: wallTexture,
            roughness: 0.2,
            metalness: 0.5,
            emissive: 0x002244,
            emissiveIntensity: 0.5
        });
        
        for (let y = 0; y < this.labyrinthHeight; y++) {
            for (let x = 0; x < this.labyrinthWidth; x++) {
                if (this.labyrinth.grid[y][x] === 1) {
                    const wall = new THREE.Mesh(wallGeo, wallMat);
                    wall.position.set(x, 0.75, y);
                    wall.castShadow = true;
                    wall.receiveShadow = true;
                    this.scene.add(wall);
                }
            }
        }

        // Markers
        this.addMarker(0, 1, 0x00ff00); // Start
        this.addMarker(this.labyrinthWidth - 1, this.labyrinthHeight - 2, 0xff0000); // End
    }

    addMarker(x, z, color) {
        const geo = new THREE.TorusGeometry(0.4, 0.05, 16, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        const marker = new THREE.Mesh(geo, mat);
        marker.rotation.x = Math.PI / 2;
        marker.position.set(x, 0.1, z);
        this.scene.add(marker);

        const beamGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(x, 1, z);
        this.scene.add(beam);
        
        const light = new THREE.PointLight(color, 5, 10);
        light.position.set(x, 1, z);
        this.scene.add(light);
    }

    addPlayer(id, color) {
        const player = new Player(id, color, this.labyrinth);
        this.players.push(player);
        this.scene.add(player.mesh);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.cameras.push(camera);
    }

    onKeyDown(e) {
        if (e.code === 'KeyC') {
            const views = ['third-person', 'first-person', 'top'];
            const currentIndex = views.indexOf(this.currentCameraView);
            this.currentCameraView = views[(currentIndex + 1) % views.length];
        }
        if (e.code === 'KeyR' && this.isGameOver) {
            this.reset();
        }
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.cameras.forEach(cam => {
            cam.aspect = (window.innerWidth / (this.players.length > 1 ? 2 : 1)) / window.innerHeight;
            cam.updateProjectionMatrix();
        });
    }

    update() {
        if (this.isGameOver || !this.isGameStarted) return;

        const delta = 0.016; // Approx 60fps
        this.players.forEach((player, index) => {
            player.update(delta);
            this.updateCamera(index);

            // Check win condition
            if (player.mesh.position.x > this.labyrinthWidth - 1) {
                this.victory(player);
            }
        });

        // Update Timer
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('timer').innerText = `Temps: ${elapsed}s`;
    }

    updateCamera(index) {
        const player = this.players[index];
        const camera = this.cameras[index];

        if (this.currentCameraView === 'first-person') {
            camera.position.copy(player.mesh.position);
            camera.position.y = 0.8; // Eye level
            
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(player.mesh.quaternion);
            camera.lookAt(player.mesh.position.clone().add(forward));
        } else if (this.currentCameraView === 'third-person') {
            // Better 3rd person: Higher and further back
            const offset = new THREE.Vector3(0, 3, 5); 
            offset.applyQuaternion(player.mesh.quaternion);
            
            const targetPos = player.mesh.position.clone().add(offset);
            camera.position.lerp(targetPos, 0.1); // Smooth follow
            camera.lookAt(player.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0)));
        } else {
            // Better Top view: Higher
            camera.position.set(this.labyrinthWidth / 2, this.labyrinthWidth * 1.5, this.labyrinthHeight / 2);
            camera.lookAt(this.labyrinthWidth / 2, 0, this.labyrinthHeight / 2);
        }
    }

    victory(player) {
        this.isGameOver = true;
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        
        const div = document.createElement('div');
        div.className = 'victory-screen';
        div.innerHTML = `
            <h1>Victoire !</h1>
            <p>Joueur ${player.id} a gagné en ${elapsed} secondes.</p>
            <button onclick="location.reload()">Rejouer</button>
        `;
        document.body.appendChild(div);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();

        if (this.players.length === 1) {
            this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            this.renderer.render(this.scene, this.cameras[0]);
        } else {
            // Split screen
            const w = window.innerWidth / 2;
            const h = window.innerHeight;

            this.renderer.setViewport(0, 0, w, h);
            this.renderer.setScissor(0, 0, w, h);
            this.renderer.setScissorTest(true);
            this.renderer.render(this.scene, this.cameras[0]);

            this.renderer.setViewport(w, 0, w, h);
            this.renderer.setScissor(w, 0, w, h);
            this.renderer.setScissorTest(true);
            this.renderer.render(this.scene, this.cameras[1]);
        }
    }
}
