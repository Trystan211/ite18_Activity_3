import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Load Ammo.js
await Ammo();

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

// Ammo.js Physics World
const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
  new Ammo.btDefaultCollisionConfiguration(),
  new Ammo.btCollisionDispatcher(new Ammo.btDefaultCollisionConfiguration()),
  new Ammo.btDbvtBroadphase(),
  new Ammo.btSequentialImpulseConstraintSolver()
);
physicsWorld.setGravity(new Ammo.btVector3(0, -9.82, 0));

// Helper functions for Ammo.js
const createRigidBody = (mesh, shape, mass = 0) => {
  const transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
  const motionState = new Ammo.btDefaultMotionState(transform);

  const localInertia = new Ammo.btVector3(0, 0, 0);
  if (mass > 0) shape.calculateLocalInertia(mass, localInertia);

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  const body = new Ammo.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(body);

  return body;
};

// Ground
const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const groundShape = new Ammo.btBoxShape(new Ammo.btVector3(10, 0.5, 10));
createRigidBody(groundMesh, groundShape, 0);

// Falling Spheres
const sphereMeshes = [];
const sphereBodies = [];

for (let i = 0; i < 10; i++) {
  const radius = 0.5;

  // Three.js sphere
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x44aa88 })
  );
  sphereMesh.position.set(Math.random() * 5 - 2.5, 5 + i, Math.random() * 5 - 2.5);
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);
  sphereMeshes.push(sphereMesh);

  // Ammo.js sphere
  const sphereShape = new Ammo.btSphereShape(radius);
  const sphereBody = createRigidBody(sphereMesh, sphereShape, 1);
  sphereBodies.push(sphereBody);
}

// Particles (e.g., snow/dust)
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

  // Update Ammo.js physics world
  physicsWorld.stepSimulation(delta, 10);

  // Update sphere positions
  for (let i = 0; i < sphereMeshes.length; i++) {
    const body = sphereBodies[i];
    const sphereMesh = sphereMeshes[i];
    const transform = new Ammo.btTransform();
    body.getMotionState().getWorldTransform(transform);
    const origin = transform.getOrigin();
    const rotation = transform.getRotation();

    sphereMesh.position.set(origin.x(), origin.y(), origin.z());
    sphereMesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
  }

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
