import * as THREE from 'three';

export class Control {
    constructor(paddle1, paddle2) {
      this.paddle1 = paddle1;
      this.paddle2 = paddle2;
      this.keys = {};
  
      window.addEventListener('keydown', (e) => (this.keys[e.key] = true));
      window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
    }
  
    update() {
      if (this.keys['ArrowUp']) this.paddle1.move(-0.1);
      if (this.keys['ArrowDown']) this.paddle1.move(0.1);
      if (this.keys['w']) this.paddle2.move(-0.1);
      if (this.keys['s']) this.paddle2.move(0.1);
    }
  }
  