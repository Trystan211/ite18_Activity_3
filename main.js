import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); // Darker background color

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(20, 20, 30); // Increased the camera position to see the bigger scene

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ground (Snowy floor)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100), // Increased ground size
  new THREE.MeshStandardMaterial({ color: 0xffffff }) // White floor for snow
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog
scene.fog = new THREE.Fog(0x222222, 10, 100); // Increased fog range to match the bigger scene

// Lights
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4);
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

// Spotlights to enhance the atmosphere
const spotlight1 = new THREE.SpotLight(0xffffff, 0.3);
spotlight1.position.set(20, 30, 20);
spotlight1.castShadow = true;
scene.add(spotlight1);

const spotlight2 = new THREE.SpotLight(0xffffff, 0.3);
spotlight2.position.set(-20, 30, -20);
spotlight2.castShadow = true;
scene.add(spotlight2);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const rotatingObjects = []; // To store objects for raycasting interactions

// Event listener for mouse click
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(rotatingObjects);

  // Reset all objects to default color and size before applying changes to the clicked one
  rotatingObjects.forEach((obj) => {
    if (!intersects.find((intersect) => intersect.object === obj)) {
      obj.material.color.set(0xff6347); // Default color
      obj.scale.set(1, 1, 1); // Default size
    }
  });

  // If there's an intersection, change color and size of the clicked object
  if (intersects.length > 0) {
    const object = intersects[0].object;
    object.material.color.set(0x00ff00); // Change color to green
    object.scale.set(1.5, 1.5, 1.5); // Increase size of clicked object
  }
});

// Create objects for raycasting
const createRotatingObject = (x, z) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x, 0.5, z);
  object.castShadow = true;
  object.receiveShadow = true;
  rotatingObjects.push(object);
  scene.add(object);
};

// Add objects to the scene
for (let i = 0; i < 10; i++) { // Increased the number of raycastable objects
  const x = Math.random() * 80 - 40;
  const z = Math.random() * 80 - 40;
  createRotatingObject(x, z);
}

// Particles
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 2000; // Increased particle count
const particles = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particles[i * 3] = Math.random() * 80 - 40; // x position
  particles[i * 3 + 1] = Math.random() * 10 + 5; // y position
  particles[i * 3 + 2] = Math.random() * 80 - 40; // z position
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xeeeeee, 
  size: 0.2, 
  blending: THREE.AdditiveBlending, 
  transparent: true
});

const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particlesMesh);

// Trees (Cone-shaped)
const createTree = (x, z) => {
  const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, 2, z);
  trunk.castShadow = true;
  trunk.receiveShadow = true;

  const coneGeometry = new THREE.ConeGeometry(2, 5, 8); // Cone-shaped tree
  const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.set(x, 6, z);
  cone.castShadow = true;
  cone.receiveShadow = true;

  scene.add(trunk);
  scene.add(cone);
};

// Add trees (more trees added)
for (let i = 0; i < 20; i++) { // Increased the number of trees
  const x = Math.random() * 80 - 40;
  const z = Math.random() * 80 - 40;
  createTree(x, z);
}

// Bushes (Smaller bushes added)
const createBush = (x, z) => {
  const bushGeometry = new THREE.SphereGeometry(1, 8, 8);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
  const bush = new THREE.Mesh(bushGeometry, bushMaterial);
  bush.position.set(x, 0.5, z);
  bush.castShadow = true;
  bush.receiveShadow = true;

  scene.add(bush);
};

// Add bushes (more bushes added)
for (let i = 0; i < 15; i++) { // Increased the number of bushes
  const x = Math.random() * 80 - 40;
  const z = Math.random() * 80 - 40;
  createBush(x, z);
}

// Animation loop
let controls;
function animate() {
  requestAnimationFrame(animate);

  // Rotate raycastable objects
  rotatingObjects.forEach((obj) => {
    obj.rotation.x += 0.01;
    obj.rotation.y += 0.01;
  });

  // Particles animation
  particlesMesh.rotation.y += 0.001;

  renderer.render(scene, camera);
}

controls = new OrbitControls(camera, renderer.domElement);
controls.update();

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});


