import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set(5, 10, 5);
spotlight.castShadow = true;
scene.add(spotlight);

// Particle System (Snow)
const particleCount = 500;
const particlesGeometry = new THREE.BufferGeometry();
const particlesPositions = [];
const particlesSpeeds = [];

for (let i = 0; i < particleCount; i++) {
  particlesPositions.push((Math.random() - 0.5) * 20); // x
  particlesPositions.push(Math.random() * 10 + 5); // y
  particlesPositions.push((Math.random() - 0.5) * 20); // z
  particlesSpeeds.push(Math.random() * 0.02 + 0.01); // Falling speed
}

particlesGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(particlesPositions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Physics World Setup
const physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0, -9.82, 0); // Gravity pointing down

// Create a floor body
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({ mass: 0 }); // Static body
floorBody.addShape(floorShape);
floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate to horizontal
physicsWorld.addBody(floorBody);

// Falling spheres
const sphereBodies = [];
const sphereMeshes = [];

for (let i = 0; i < 10; i++) {
  const radius = 0.5;

  // Physics sphere
  const sphereShape = new CANNON.Sphere(radius);
  const sphereBody = new CANNON.Body({ mass: 1 });
  sphereBody.addShape(sphereShape);
  sphereBody.position.set(Math.random() * 10 - 5, 5, Math.random() * 10 - 5);
  sphereBodies.push(sphereBody);
  physicsWorld.addBody(sphereBody);

  // Three.js sphere
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x44aa88 })
  );
  sphereMesh.castShadow = true;
  sphereMeshes.push(sphereMesh);
  scene.add(sphereMesh);
}

// Scroll-Based Animation
let scrollProgress = 0;

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const maxScrollHeight = document.body.scrollHeight - window.innerHeight;
  scrollProgress = scrollY / maxScrollHeight; // Progress from 0 to 1
});

// Camera Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation Loop
const clock = new THREE.Clock();
const animate = () => {
  const delta = clock.getDelta();

  // Update physics world
  physicsWorld.step(1 / 60, delta, 3);
  sphereBodies.forEach((body, idx) => {
    const mesh = sphereMeshes[idx];
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  // Animate particles
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= particlesSpeeds[i]; // Move down in y-axis
    if (positions[i * 3 + 1] < -1) {
      positions[i * 3 + 1] = Math.random() * 10 + 5; // Reset position
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;

  // Camera scroll-based animation
  camera.position.y = 2 + scrollProgress * 5; // Move upward with scroll
  camera.lookAt(0, 0, 0);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
