import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

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

// Load the Fox Model
const loader = new GLTFLoader();
let foxMixer = null;  // Animation mixer for the fox
let fox = null;  // Reference to the fox object

loader.load(
  './lowpoly_fox.glb', // Replace with the path to your fox model
  (gltf) => {
    fox = gltf.scene;
    fox.scale.set(0.5, 0.5, 0.5);  // Adjust size if needed
    fox.position.set(0, 0, 0);  // Initial position
    scene.add(fox);

    // Handle animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      foxMixer = new THREE.AnimationMixer(fox);
      const action = foxMixer.clipAction(gltf.animations[0]); // Assuming the first animation is walking
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the fox model:', error);
  }
);

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
for (let i = 0; i < 40; i++) {  // Increased tree count to 250
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

// Bushes (Increased count to 150)
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
for (let i = 0; i < 30; i++) {  // Increased bushes count to 150
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
for (let i = 0; i < 10; i++) {  // Increased raycasting objects to 30
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;
  const size = Math.random() * 2 + 1;
  
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    objectMaterial
  );
  object.position.set(x, size / 2, z);
  raycastingObjects.push(object);
  scene.add(object);
}

// Raycasting Setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

window.addEventListener('click', (event) => {
  // Update mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with the raycasting objects
  const intersects = raycaster.intersectObjects(raycastingObjects);

  if (intersects.length > 0) {
    // If there is a previously selected object, reset it
    if (intersectedObject) {
      intersectedObject.material.color.set(0xff0000); // Reset the color
      intersectedObject.scale.set(1, 1, 1); // Reset the scale
    }

    // Set the new intersected object and change color and size
    intersectedObject = intersects[0].object;
    intersectedObject.material.color.set(0x00ff00); // New color
    intersectedObject.scale.set(1.5, 1.5, 1.5); // Increase size
  } else if (intersectedObject) {
    // If no object is intersected, reset the previously intersected object
    intersectedObject.material.color.set(0xff0000);
    intersectedObject.scale.set(1, 1, 1);
    intersectedObject = null;
  }
});

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation
const clock = new THREE.Clock();

const animate = () => {
  const delta = clock.getDelta(); // Time elapsed since the last frame

  // Update fox animation if the fox is loaded
  if (foxMixer) {
    foxMixer.update(delta); // Update fox animation
  }

  animateSnow();  // Animate snowflakes falling

  // Rotate all raycasting objects
  raycastingObjects.forEach(object => {
    object.rotation.y += 0.01; // Rotation
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

