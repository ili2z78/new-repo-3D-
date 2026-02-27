import * as THREE from 'three';

export class Ball {
  constructor(scene, paddle, width = 20, height = 10) {
    // Paramètres de taille de la scène
    this.width = width;
    this.height = height;
    this.paddle = paddle;  // Paddle passé en paramètre

    // Création de la balle
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Position initiale de la balle
    this.mesh.position.set(0, 0.5, 0); // Positionnement au centre au début

    // Vitesse de la balle
    this.velocity = { x: 0.1, z: 0.1 };

    // Ajouter la balle à la scène
    scene.add(this.mesh);
  }

  update() {
    // Mise à jour de la position de la balle
    this.mesh.position.x += this.velocity.x;
    this.mesh.position.z += this.velocity.z;

    // Gestion des rebonds avec les murs
    if (Math.abs(this.mesh.position.z) > this.height / 2 - 0.5) {
      this.velocity.z *= -1;  // Inverser la direction sur l'axe Z
    }

    if (Math.abs(this.mesh.position.x) > this.width / 2 - 0.5) {
      this.velocity.x *= -1;  // Inverser la direction sur l'axe X
    }

    // Vérifier la collision avec le paddle
    this.checkPaddleCollision();
  }

  checkPaddleCollision() {
    // Récupérer la position du paddle (ajuster cette partie en fonction de ta logique)
    const paddlePosition = this.paddle.mesh.position;

    // Vérifier si la balle touche le paddle
    if (
      this.mesh.position.x >= paddlePosition.x - 10 && // La balle est dans la plage des paddles
      this.mesh.position.x <= paddlePosition.x + 10 &&
      this.mesh.position.y <= paddlePosition.y + 1 && // En dessous du paddle
      this.mesh.position.y >= paddlePosition.y - 1
    ) {
      // Si la balle touche derrière le paddle, on la ramène au centre
      if (this.mesh.position.z > paddlePosition.z) {
        this.mesh.position.set(0, 0.5, 0);  // Revenir au centre
        this.velocity.x = 0.1;  // Réinitialiser la vitesse
        this.velocity.z = 0.1;
      } else {
        // Rebondir et changer la direction de la balle selon l'angle du paddle
        this.velocity.z = -this.velocity.z; // Inverser la direction sur l'axe Z
        this.velocity.x += (this.mesh.position.x - paddlePosition.x) * 0.05; // Ajuster en fonction du contact
      }
    }
  }
}
