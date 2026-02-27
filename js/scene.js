import * as THREE from 'three';

export class SceneSetup {
  constructor() {
    this.scene1 = new THREE.Scene();

    // Création des caméras pour les deux joueurs
    this.camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Création des rendus
    this.renderer1 = new THREE.WebGLRenderer();
    this.renderer1.autoClear = false;  // Ne pas effacer le rendu précédent

    // Paramétrage des rendus
    this.renderer1.setSize(window.innerWidth, window.innerHeight);

    // Attacher les rendus aux conteneurs HTML respectifs
    document.getElementById('player1-container').appendChild(this.renderer1.domElement);

    // Création du sol
    const groundGeometry = new THREE.PlaneGeometry(20, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x007700 });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;

    // Ajouter le sol aux deux scènes
    this.scene1.add(this.ground);

    // Ajout des murs
    this.createWall(0, 5, -10, 0, this.scene1); // Top pour la scène 1
    this.createWall(0, 5, 10, 0, this.scene1);  // Bottom pour la scène 1
    this.createWall(-10, 5, 0, Math.PI / 2, this.scene1); // Left
    this.createWall(10, 5, 0, Math.PI / 2, this.scene1);  // Right

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene1.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 10, 5);
    this.scene1.add(pointLight);

    // Positionnement des caméras
    this.camera1.position.set(-7, 5, 15);  // Vue pour le joueur 1
    this.camera2.position.set(7, 5, 15);   // Vue pour le joueur 2

    // Orientation des caméras
    this.camera1.lookAt(0, 5, 0);
    this.camera2.lookAt(0, 5, 0);

    // Écouter les changements de taille de la fenêtre pour ajuster les rendus
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  // Méthode pour créer un mur
  createWall(x, y, z, rotationY = 0, scene) {
    const wallGeometry = new THREE.BoxGeometry(20, 1, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    scene.add(wall);
  }

  // Méthode pour ajuster la taille et l'aspect des caméras et des rendus
  onWindowResize() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight;

    // Ajuster les caméras
    this.camera1.aspect = width / height;
    this.camera2.aspect = width / height;
    this.camera1.updateProjectionMatrix();
    this.camera2.updateProjectionMatrix();

    // Ajuster la taille des rendus
    this.renderer1.setSize(width, height);
  }

  // Méthode pour rendre la scène
  render() {
    this.renderer1.clear();

    // Rendu pour le joueur 1 (côté gauche)
    this.renderer1.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    
    this.renderer1.render(this.scene1, this.camera1);

    // Rendu pour le joueur 2 (côté droit)
    
    this.renderer1.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    this.renderer1.render(this.scene1, this.camera2);
  }
}
