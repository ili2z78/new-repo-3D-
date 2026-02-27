import * as THREE from 'three';
import { SceneSetup } from './scene.js';
import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { Control } from './control.js';
console.log(THREE);


const sceneSetup = new SceneSetup();
const paddle1 = new Paddle(sceneSetup.scene1, -9, 0.5, 0);
const paddle2 = new Paddle(sceneSetup.scene1, 9, 0.5, 0);
const ball = new Ball(sceneSetup.scene1, paddle1);
const controls = new Control(paddle1, paddle2);

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  ball.update();
  sceneSetup.render();
}

animate();
