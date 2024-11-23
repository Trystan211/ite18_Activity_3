import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x111122, 5, 20); // Add fog for atmospheric effect

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(4, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Low ambient light
scene.add(ambientLight);

const redLight = new THREE.PointLight(0xff0000, 0.3, 10); // Red light
redLight.position.set(4, 5, -2);
scene.add(redLight);

const greenLight = new THREE.PointLight(0x00ff00, 0.2, 10); // Green light
greenLight.position.set(-4, 0, 2);
scene.add(greenLight);

const orangeLight = new THREE.PointLight(0xffa500, 0.2, 10); // Orange light
orangeLight.position.set(3, 1, -4);
scene.add(orangeLight);

// Add GUI for light controls
const gui = new GUI();
const redLightFolder = gui.addFolder('Red Light');
redLightFolder.add(redLight, 'intensity', 0, 1, 0.01);
redLightFolder.add(redLight.position, 'x', -10, 10, 0.1);
redLightFolder.add(redLight.position, 'y', -10, 10, 0.1);
redLightFolder.add(redLight.position, 'z', -10, 10, 0.1);

const greenLightFolder = gui.addFolder('Green Light');
greenLightFolder.add(greenLight, 'intensity', 0, 1, 0.01);
greenLightFolder.add(greenLight.position, 'x', -10, 10, 0.1);
greenLightFolder.add(greenLight.position, 'y', -10, 10, 0.1);
greenLightFolder.add(greenLight.position, 'z', -10, 10, 0.1);

// Ground (grass)
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// House
const houseGeometry = new THREE.BoxGeometry(3, 3, 3);
const houseMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const house = new THREE.Mesh(houseGeometry, houseMaterial);
house.position.y = 1.5;
scene.add(house);

// Roof
const roofGeometry = new THREE.ConeGeometry(2.8, 1, 4);
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.set(0, 4, 0);
roof.rotation.y = Math.PI / 4;
scene.add(roof);

// Door
const doorGeometry = new THREE.PlaneGeometry(1.5, 2.5);
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 1.25, 1.51);
scene.add(door);

// Tombstones
const tombstoneGeometry = new THREE.BoxGeometry(0.5, 1, 0.1);
const tombstoneMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

for (let i = 0; i < 20; i++) {
  const tombstone = new THREE.Mesh(tombstoneGeometry, tombstoneMaterial);
  tombstone.position.set(
    (Math.random() - 0.5) * 10,
    0.5,
    (Math.random() - 0.5) * 10
  );
  tombstone.rotation.y = Math.random() * Math.PI;
  scene.add(tombstone);
}

// Add trees (green spheres)
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
for (let i = 0; i < 3; i++) {
  const treeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
  const treeTop = new THREE.Mesh(new THREE.SphereGeometry(0.5), treeMaterial);
  
  treeBase.position.set(i - 1, 0.5, 1);
  treeTop.position.set(i - 1, 1.5, 1);

  scene.add(treeBase, treeTop);
}

// Animation loop
function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
