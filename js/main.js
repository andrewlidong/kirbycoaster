import * as THREE from '/node_modules/three/build/three.module.js';
import { Track } from './modules/Track.js';
import { Cart } from './modules/Cart.js';
import { Environment } from './modules/Environment.js';
import { UI } from './modules/UI.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30); // Adjusted initial camera position

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create UI controls
const controls = document.createElement('div');
controls.style.position = 'fixed';
controls.style.bottom = '20px';
controls.style.left = '50%';
controls.style.transform = 'translateX(-50%)';
controls.style.zIndex = '1000';
controls.style.display = 'flex';
controls.style.gap = '10px';

const startButton = document.createElement('button');
startButton.textContent = '🚂 Start';
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '18px';
startButton.style.borderRadius = '25px';
startButton.style.border = 'none';
startButton.style.backgroundColor = '#ffb7dd';
startButton.style.cursor = 'pointer';
startButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

const stopButton = document.createElement('button');
stopButton.textContent = '🛑 Stop';
stopButton.style.padding = '10px 20px';
stopButton.style.fontSize = '18px';
stopButton.style.borderRadius = '25px';
stopButton.style.border = 'none';
stopButton.style.backgroundColor = '#ff9999';
stopButton.style.cursor = 'pointer';
stopButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

controls.appendChild(startButton);
controls.appendChild(stopButton);
document.body.appendChild(controls);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(50, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
scene.add(sunLight);

// Create environment
const environment = new Environment(scene);

// Create track
const track = new Track(scene);

// Create cart
const cart = new Cart(scene, track);

// Create UI overlay
const ui = new UI(cart);

// Camera follow settings
const cameraOffset = new THREE.Vector3(0, 10, 25); // Adjusted camera offset
const cameraLookOffset = new THREE.Vector3(0, 2, -15); // Adjusted look offset
const cameraSmoothness = 0.03; // Made camera movement smoother
let lastCameraPosition = new THREE.Vector3();
let lastLookAtPosition = new THREE.Vector3();

// Cart control state
let isMoving = true;

// Button event listeners
startButton.addEventListener('click', () => {
    isMoving = true;
    cart.startMoving();
});

stopButton.addEventListener('click', () => {
    isMoving = false;
    cart.stopMoving();
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Update cart only if moving
    if (isMoving) {
        cart.update();
    }

    // Update environment
    environment.update(cart.getPosition());

    // Get cart position and validate it
    const cartPosition = cart.getPosition();
    if (!cartPosition || !isFinite(cartPosition.x) || !isFinite(cartPosition.y) || !isFinite(cartPosition.z)) {
        console.warn('Invalid cart position detected');
        return;
    }

    // Calculate target camera position with bounds
    const targetPosition = cartPosition.clone().add(cameraOffset);
    const lookAtPosition = cartPosition.clone().add(cameraLookOffset);

    // Validate camera movement
    const maxCameraMove = 2.0; // Maximum distance the camera can move in one frame
    if (lastCameraPosition.length() === 0) {
        lastCameraPosition.copy(targetPosition);
        lastLookAtPosition.copy(lookAtPosition);
    }

    // Limit camera movement speed
    const cameraMoveDistance = targetPosition.distanceTo(lastCameraPosition);
    if (cameraMoveDistance > maxCameraMove) {
        const moveDirection = targetPosition.clone().sub(lastCameraPosition).normalize();
        targetPosition.copy(lastCameraPosition).add(moveDirection.multiplyScalar(maxCameraMove));
    }

    // Smooth camera movement
    camera.position.lerp(targetPosition, cameraSmoothness);

    // Smooth look-at transition
    lastLookAtPosition.lerp(lookAtPosition, cameraSmoothness);
    camera.lookAt(lastLookAtPosition);

    // Store positions for next frame
    lastCameraPosition.copy(camera.position);

    // Keep camera within reasonable bounds
    camera.position.y = Math.max(8, Math.min(50, camera.position.y));

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (ui.sketch) {
        ui.sketch.windowResized();
    }
});

// Start animation
animate();