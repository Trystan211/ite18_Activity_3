import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022);  // Darker background for the scene

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Snow particles
const snowGeometry = new THREE.BufferGeometry();
const snowCount = 1000;
const snowPositions = [];
for (let i = 0; i < snowCount; i++) {
  snowPositions.push(Math.random() * 40 - 20, Math.random() * 10 + 5, Math.random() * 40 - 20);
}
snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.2,
  transparent: true,
});
const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

// Snow movement (falling downwards)
const snowVelocity = [];
for (let i = 0; i < snowCount; i++) {
  snowVelocity.push(0, -Math.random() * 0.05 - 0.1, 0);  // Falling downwards
}

// Handle Snow animation
function animateSnow() {
  const positions = snow.geometry.attributes.position.array;
  for (let i = 0; i < snowCount; i++) {
    positions[i * 3 + 1] += snowVelocity[i * 3 + 1];
    if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 10;  // Reset snowflake position if it falls below ground
  }
  snow.geometry.attributes.position.needsUpdate = true;
}

// Ground (White floor for snow)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 70),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog
scene.fog = new THREE.Fog(0x000022, 10, 50);

// Lights
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4); // Moonlight
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);  // Soft ambient light
scene.add(ambientLight);

// Trees (Increased count and made them cone-shaped)
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x003300 });
for (let i = 0; i < 30; i++) {  // Increased tree count to 40
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;
  
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 6, 16),
    treeMaterial
  );
  trunk.position.set(x, 3, z);
  trunk.castShadow = true;

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(2, 4, 16),  // Cone-shaped tree
    leafMaterial
  );
  foliage.position.set(x, 6, z);
  foliage.castShadow = true;

  scene.add(trunk);
  scene.add(foliage);
}

// Bushes (Increased count to 30)
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
for (let i = 0; i < 20; i++) {  // Increased bushes count to 30
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 16, 16),
    bushMaterial
  );
  bush.position.set(x, 0.75, z);
  bush.castShadow = true;

  scene.add(bush);
}

// Raycasting Objects (Increased count to 30)
const raycastingObjects = [];
const objectMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
for (let i = 0; i < 30; i++) {  // Increased raycasting objects to 30
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;
  const size = Math.random() * 2 + 1;
  
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    objectMaterial
  );
  object.position.set(x, size / 2, z);
  object.rotationSpeed = Math.random() * 0.02 + 0.01;  // Set rotation speed
  raycastingObjects.push(object);
  scene.add(object);
}

// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.update();
  const intersects = raycaster.intersectObjects(raycastingObjects);
  if (intersects.length > 0) {
    if (intersectedObject) {
      intersectedObject.material.color.set(0xff0000);  // Reset previous object to original color
    }
    intersectedObject = intersects[0].object;
    intersectedObject.material.color.set(0x00ff00);  // Change clicked object color
    intersectedObject.scale.set(1.5, 1.5, 1.5);  // Increase size of clicked object
  }
});

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  
  animateSnow();  // Animate snowflakes falling

  // Rotate raycasting objects
  raycastingObjects.forEach(object => {
    object.rotation.y += object.rotationSpeed;  // Rotate each object
  });

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
