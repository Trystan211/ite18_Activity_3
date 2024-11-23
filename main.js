import * as THREE from "three";
import { AmmoPhysics } from "three/addons/physics/AmmoPhysics.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

// Camera Setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(10, 10, 15);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Dim ambient light
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x88aaff, 0.2); // Moonlight effect
moonLight.position.set(10, 20, -10);
moonLight.castShadow = true;
scene.add(moonLight);

// Physics
let physicsWorld;
Ammo().then((AmmoLib) => {
  AmmoLib = Ammo;
  physicsWorld = new AmmoPhysics(scene, AmmoLib);
});

// Floor
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x003300 }) // Dark green
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Particle System
const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const particles = [];
for (let i = 0; i < 100; i++) {
  const particle = new THREE.Mesh(particleGeometry, particleMaterial);
  particle.position.set(Math.random() * 50 - 25, Math.random() * 50, Math.random() * 50 - 25);
  scene.add(particle);
  particles.push(particle);
}

// Scroll-based Animation
let scrollSpeed = 0;
window.addEventListener("scroll", () => {
  scrollSpeed = window.scrollY * 0.01;
  camera.position.z = 15 + scrollSpeed; // Adjust camera position based on scroll
});

// Raycasting and Mouse Events
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const onMouseMove = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};
window.addEventListener("mousemove", onMouseMove);

// Update Physics and Objects
const clock = new THREE.Clock();
const animate = () => {
  const deltaTime = clock.getDelta();
  
  // Physics World Update
  if (physicsWorld) {
    physicsWorld.update(deltaTime);
  }
  
  // Update Particles
  particles.forEach((particle) => {
    particle.position.y -= 0.1; // Gravity effect
    if (particle.position.y < -25) particle.position.y = 25; // Reset particles
  });

  // Raycasting to detect mouse interaction
  raycaster.update(camera, mouse);
  
  // Render the scene
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Window Resize Event
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;



