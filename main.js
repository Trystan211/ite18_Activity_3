import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); // Darker background color

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ground (Snowy floor)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xffffff }) // White floor for snow
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog
scene.fog = new THREE.Fog(0x222222, 10, 50);

// Lights
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4);
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

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
for (let i = 0; i < 5; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;
  createRotatingObject(x, z);
}

// Particles
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 1000;
const particles = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  particles[i * 3] = Math.random() * 40 - 20; // x position
  particles[i * 3 + 1] = Math.random() * 10 + 5; // y position
  particles[i * 3 + 2] = Math.random() * 40 - 20; // z position
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xeeeeee, 
  size: 0.2, 
  blending: THREE.AdditiveBlending, 
  transparent: true,
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Animation
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update rotating objects
  rotatingObjects.forEach((object) => {
    object.rotation.x += 0.01;
    object.rotation.y += 0.01;
  });

  // Update particles (simulate some movement)
  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= 0.1;
    if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 10; // Reset position to create a snowfall effect
  }
  particleGeometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
