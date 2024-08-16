import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
const guiChange = {};
guiChange.count = 100000;
guiChange.size = 0.01;
guiChange.radius = 5;
guiChange.branch = 4;
guiChange.spin = 4;
guiChange.randomness = 0.2;
guiChange.power = 6;
guiChange.inside = "#ff6030";
guiChange.outside = "#1b3984";

let particleGeomtry = null;
let particleMaterial = null;
let particle = null;

const Galaxy = () => {
  if (particle !== null) {
    particleGeomtry.dispose();
    particleMaterial.dispose();
    scene.remove(particle);
  }

  particleGeomtry = new THREE.BufferGeometry();
  const positon = new Float32Array(guiChange.count * 3);
  const color = new Float32Array(guiChange.count * 3);

  //Create Radius:

  for (let i = 0; i < guiChange.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * guiChange.radius;
    const branch = ((i % guiChange.branch) / guiChange.branch) * Math.PI * 2;
    const spin = radius * guiChange.spin;
    const randomX =
      Math.pow(Math.random(), guiChange.power) * (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), guiChange.power) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), guiChange.power) * (Math.random() < 0.5 ? 1 : -1);

    positon[i3] = Math.cos(branch + spin) * radius + randomX;
    positon[i3 + 1] = randomY;
    positon[i3 + 2] = Math.sin(branch + spin) * radius + randomZ;

    //colour:
    const insideColour = new THREE.Color(guiChange.inside);
    const outsideColour = new THREE.Color(guiChange.outside);

    const mixed = insideColour.clone();
    mixed.lerp(outsideColour, radius / guiChange.radius);
    color[i3] = mixed.r;
    color[i3 + 1] = mixed.g;
    color[i3 + 2] = mixed.b;
  }
  particleGeomtry.setAttribute(
    "position",
    new THREE.BufferAttribute(positon, 3)
  );
  particleGeomtry.setAttribute("color", new THREE.BufferAttribute(color, 3));

  //use particle material:
  particleMaterial = new THREE.PointsMaterial({
    size: guiChange.size,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  //create Particle:
  particle = new THREE.Points(particleGeomtry, particleMaterial);

  scene.add(particle);
};
Galaxy();

gui
  .add(guiChange, "count")
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(Galaxy);
gui
  .add(guiChange, "size")
  .min(0.00001)
  .max(1)
  .step(0.0001)
  .onFinishChange(Galaxy);
gui.add(guiChange, "radius").min(0.1).max(20).step(0.1).onFinishChange(Galaxy);
gui.add(guiChange, "branch").min(2).max(12).step(1).onFinishChange(Galaxy);
gui.add(guiChange, "spin").min(-5).max(5).step(0.001).onFinishChange(Galaxy);
gui.add(guiChange, "power").min(2).max(12).step(1).onFinishChange(Galaxy);
gui
  .add(guiChange, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(Galaxy);
gui.addColor(guiChange, "inside").onFinishChange(Galaxy);
gui.addColor(guiChange, "outside").onFinishChange(Galaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

//star:
const startGeomtry = new THREE.BufferGeometry();
const StarPos = new Float32Array(guiChange.count * 3);

for (let i = 0; i < guiChange.count * 3; i++) {
  StarPos[i] =
    (Math.random() - 0.5) * camera.position.distanceTo(particle.position) * 50;
}
startGeomtry.setAttribute("position", new THREE.BufferAttribute(StarPos, 3));

const Points = new THREE.Points(
  startGeomtry,
  new THREE.PointsMaterial({ size: 0.001, sizeAttenuation: true })
);
scene.add(Points);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  Points.rotation.y = elapsedTime / 8;
  particle.rotation.y = elapsedTime / 8;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
