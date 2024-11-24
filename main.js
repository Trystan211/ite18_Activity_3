import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x556677); // Darker background color for moody effect
scene.fog = new THREE.Fog(0x556677, 20, 100); // Soft fog with darker tone

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// White Floor for Snow
const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const snowFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  snowMaterial
);
snowFloor.rotation.x = -Math.PI / 2;
snowFloor.receiveShadow = true;
scene.add(snowFloor);

// Lights (Darker)
const ambientLight = new THREE.AmbientLight(0x555555, 0.6); // Dimmer ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Slightly darker directional light
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Trees
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

for (let i = 0; i < 20; i++) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 3, 16),
    trunkMaterial
  );
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 4, 8),
    treeMaterial
  );
  
  trunk.position.set(
    Math.random() * 80 - 40,
    1.5,
    Math.random() * 80 - 40
  );
  foliage.position.set(trunk.position.x, trunk.position.y + 3, trunk.position.z);

  trunk.castShadow = true;
  foliage.castShadow = true;

  scene.add(trunk);
  scene.add(foliage);
}

// Bushes
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
for (let i = 0; i < 30; i++) {
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(1, 8, 8),
    bushMaterial
  );
  bush.position.set(
    Math.random() * 80 - 40,
    0.5,
    Math.random() * 80 - 40
  );
  bush.castShadow = true;
  scene.add(bush);
}

// Rotating Raycasting Objects (Different Shapes & Materials)
const rotatingObjects = [];
const rotatingMaterial = new THREE.MeshStandardMaterial({ color: 0xff6347 });

for (let i = 0; i < 10; i++) {
  let rotatingObject;
  if (i % 3 === 0) {
    rotatingObject = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      rotatingMaterial
    );
  } else if (i % 3 === 1) {
    rotatingObject = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      rotatingMaterial
    );
  } else {
    rotatingObject = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 2, 16),
      rotatingMaterial
    );
  }

  rotatingObject.position.set(
    Math.random() * 50 - 25,
    Math.random() * 5 + 2,
    Math.random() * 50 - 25
  );
  rotatingObject.castShadow = true;
  rotatingObject.userData = { id: i }; // Assign a unique ID for each object

  rotatingObjects.push(rotatingObject);
  scene.add(rotatingObject);
}

// Particle System (Snow)
const particleCount = 1500; // Increased particles for denser snowfall
const particles = new THREE.BufferGeometry();
const positions = [];
const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.2,
  transparent: true,
  opacity: 0.8,
});

for (let i = 0; i < particleCount; i++) {
  positions.push(
    Math.random() * 100 - 50, // X
    Math.random() * 50 + 10, // Y
    Math.random() * 100 - 50 // Z
  );
}

particles.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(positions, 3)
);

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Click Event for Raycasting (Only change the clicked object)
window.addEventListener('click', (event) => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(rotatingObjects);

  rotatingObjects.forEach((obj) => {
    obj.material.color.set(0xff6347); // Reset color to default
    obj.scale.set(1, 1, 1); // Reset size to default
  });

  intersects.forEach((intersect) => {
    const object = intersect.object;
    object.material.color.set(0x00ff00); // Change color to green on click
    object.scale.set(1.5, 1.5, 1.5); // Increase size of clicked object
  });
});

// Mouse Move for Raycasting
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animation
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();

  // Rotate objects
  rotatingObjects.forEach((obj) => {
    obj.rotation.x += delta * 0.5;
    obj.rotation.y += delta * 0.3;
  });

  // Snowfall effect
  const positions = particleSystem.geometry.attributes.position.array;
  for (let i = 1; i < positions.length; i += 3) {
    positions[i] -= delta * 2; // Y-axis downward
    if (positions[i] < 0) positions[i] = 50 + Math.random() * 10;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

