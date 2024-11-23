import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';
import { AmmoPhysics } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/physics/AmmoPhysics.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Physics setup
const physics = await AmmoPhysics();
physics.addScene(scene);

// Dynamic Skybox (day to night transition)
const updateSky = () => {
  const hour = new Date().getHours();
  const colors = hour >= 18 || hour <= 6 ? 0x001133 : 0x87ceeb; // Night or day
  scene.background = new THREE.Color(colors);
};
updateSky();
setInterval(updateSky, 1000);

// Ground
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(new THREE.BoxGeometry(50, 1, 50), groundMaterial);
ground.receiveShadow = true;
scene.add(physics.addMesh(ground));

// Particle System (Interactive Fireflies)
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 800;
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 50;
  particlePositions[i * 3 + 1] = Math.random() * 10 + 5;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  particleColors[i * 3] = Math.random();
  particleColors[i * 3 + 1] = Math.random();
  particleColors[i * 3 + 2] = Math.random();
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
const particleMaterial = new THREE.PointsMaterial({ size: 0.3, vertexColors: true });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 30, 20);
scene.add(directionalLight);

// Imported Models (Multiple)
const loader = new GLTFLoader();
loader.load('path/to/model1.glb', (gltf) => {
  const model1 = gltf.scene;
  model1.scale.set(2, 2, 2);
  model1.position.set(-10, 1, 0);
  scene.add(physics.addMesh(model1));
});
loader.load('path/to/model2.glb', (gltf) => {
  const model2 = gltf.scene;
  model2.scale.set(3, 3, 3);
  model2.position.set(10, 1, -10);
  scene.add(physics.addMesh(model2));
});

// Interactive Physics Objects
const objects = [];
for (let i = 0; i < 10; i++) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
  );
  box.position.set(
    Math.random() * 20 - 10,
    Math.random() * 10 + 5,
    Math.random() * 20 - 10
  );
  box.castShadow = true;
  scene.add(physics.addMesh(box));
  objects.push(box);
}

// Raycaster for Interactions
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    selectedObject.material.color.set(0xff0000); // Change color
    physics.applyImpulse(selectedObject, { x: 0, y: 10, z: 0 }); // Add physics impulse
  }
});

// Scroll-based Animation
let scrollPercent = 0;
window.addEventListener('scroll', () => {
  scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
});
const scrollAnimateObjects = () => {
  objects.forEach((obj, index) => {
    obj.position.y += Math.sin(scrollPercent * Math.PI * 2 + index) * 0.1;
  });
};

// Animation Loop
const clock = new THREE.Clock();
const animate = () => {
  const delta = clock.getDelta();
  physics.update(delta);

  // Update particles
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= delta * 0.5; // Gravity effect
    if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = Math.random() * 10 + 5;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  scrollAnimateObjects();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

