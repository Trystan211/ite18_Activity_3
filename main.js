import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

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

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Interactive Objects
const objects = [];
const createSphere = (x, y, z, color) => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color })
  );
  sphere.position.set(x, y, z);
  sphere.castShadow = true;
  objects.push(sphere);
  scene.add(sphere);
};

for (let i = 0; i < 10; i++) {
  createSphere(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5, 0x44aa88);
}

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onPointerMove = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

const onPointerClick = () => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    selectedObject.material.color.set(0xff0000); // Change color on click
  }
};

// Particles
const particleCount = 500;
const particleGeometry = new THREE.BufferGeometry();
const positions = [];
for (let i = 0; i < particleCount; i++) {
  positions.push(Math.random() * 20 - 10, Math.random() * 5 + 1, Math.random() * 20 - 10);
}
particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Scroll-Based Animation
let scrollY = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY / window.innerHeight; // Normalize scroll
  camera.position.y = 2 + scrollY * 5; // Adjust camera height based on scroll
});

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation Loop
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animate particles
  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 1] += Math.sin(elapsedTime + positions[i]) * 0.005;
  }
  particleGeometry.attributes.position.needsUpdate = true;

  // Raycaster highlight
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(objects);
  objects.forEach((obj) => obj.material.emissive && obj.material.emissive.set(0x000000));
  if (intersects.length > 0) {
    intersects[0].object.material.emissive = new THREE.Color(0x4444ff); // Highlight color
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Event Listeners
window.addEventListener("mousemove", onPointerMove);
window.addEventListener("click", onPointerClick);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
