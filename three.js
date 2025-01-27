import * as THREE from "three";

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load("gradient.png", function (texture) {
  scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

function createGradientMaterial(startColor, endColor) {
  const vertexShader = `
    varying float vUv;
    void main() {
      vUv = (position.y + 10.0) / 20.0; // Normalize y position for gradient
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = `
    varying float vUv;
    uniform vec3 startColor;
    uniform vec3 endColor;
    void main() {
      gl_FragColor = vec4(mix(startColor, endColor, vUv), 1.0);
    }
  `;
  return new THREE.ShaderMaterial({
    uniforms: {
      startColor: { value: new THREE.Color(startColor) },
      endColor: { value: new THREE.Color(endColor) },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });
}
function create3DCircularEllipse(
  xRadius,
  yRadius,
  rotation,
  offsetX,
  offsetY,
  zOffset,
  startColor,
  endColor,
  thickness
) {
  const ellipse = new THREE.EllipseCurve(
    0,
    0,
    xRadius,
    yRadius,
    0,
    Math.PI * 2,
    false,
    rotation
  );

  const points = ellipse.getPoints(400);

  // Map points to 3D by introducing a sine wave on the Z-axis for circular effect
  const curve = new THREE.CatmullRomCurve3(
    points.map((p, index) => {
      const angle = (index / points.length) * Math.PI * 2;
      const z = Math.sin(angle) * (xRadius + yRadius) * 0.05; // Adjust depth here
      return new THREE.Vector3(p.x, p.y, z);
    })
  );

  // Create tube geometry with consistent thickness
  const geometry = new THREE.TubeGeometry(curve, 400, thickness, 20, true);
  const material = createGradientMaterial(startColor, endColor);
  const mesh = new THREE.Mesh(geometry, material);

  // Set position and rotation
  mesh.position.set(offsetX, offsetY, zOffset);
  mesh.rotation.z = rotation; // Apply rotation on Z-axis
  return mesh;
}

const ellipsesData = [
  {
    xRadius: 30,
    yRadius: 50,
    rotation: Math.PI / 5,
    offsetX: 0,
    offsetY: 0,
    zOffset: 0,
    startColor: 0xf5fe74,
    endColor: 0xfea3bc,
    thickness: 0.3,
  },
  {
    xRadius: 30,
    yRadius: 50,
    rotation: 2 * (Math.PI / 5),
    offsetX: 0,
    offsetY: 0,
    zOffset: 0,
    startColor: 0xfea3bc,
    endColor: 0xffc3b5,
    thickness: 0.3,
  },
  {
    xRadius: 30,
    yRadius: 50,
    rotation: 3 * (Math.PI / 5),
    offsetX: 0,
    offsetY: 0,
    zOffset: 0,
    startColor: 0xd8f77c,
    endColor: 0xe0b5ff,
    thickness: 0.3,
  },
  {
    xRadius: 30,
    yRadius: 50,
    rotation: 4 * (Math.PI / 5),
    offsetX: 0,
    offsetY: 0,
    zOffset: 0,
    startColor: 0xbfade8,
    endColor: 0xa2c7e2,
    thickness: 0.3,
  },
  {
    xRadius: 30,
    yRadius: 50,
    rotation: 5 * (Math.PI / 5),
    offsetX: 0,
    offsetY: 0,
    zOffset: 0,
    startColor: 0xa2c7e2,
    endColor: 0xc3fbd0,
    thickness: 0.3,
  },
];

const ellipses = ellipsesData.map((ellipseData) => {
  const ellipse = create3DCircularEllipse(
    ellipseData.xRadius,
    ellipseData.yRadius,
    ellipseData.rotation,
    ellipseData.offsetX,
    ellipseData.offsetY,
    ellipseData.zOffset,
    ellipseData.startColor,
    ellipseData.endColor,
    ellipseData.thickness
  );
  scene.add(ellipse);
  return ellipse;
});

camera.position.z = 50;

const initialRotations = ellipses.map((ellipse) => ({
  rotationX: ellipse.rotation.x,
  rotationY: ellipse.rotation.y,
  rotationZ: ellipse.rotation.z,
}));

let lastMouseMoveTime = 0; // Time when the mouse was last moved
let mouseMoved = false; // Flag to detect if mouse is interacting
let resetSpeed = 0.008; // Speed at which the rotation returns to initial state
let inactivityDelay = 300; // Delay before starting to reset after inactivity
let delayDuration = 5000; // Time to keep movement even after mouse stops
let motionStartTime = 0; // Time when the mouse stopped moving

document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  lastMouseMoveTime = Date.now();
  motionStartTime = Date.now();
  mouseMoved = true;
});

function animate() {
  requestAnimationFrame(animate);
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.1;
  camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  ellipses.forEach((ellipse, index) => {
    const rotationSpeed = (index + 1) * 0.005;
    if (mouseMoved || Date.now() - motionStartTime < delayDuration) {
      ellipse.rotation.z += mouseX * rotationSpeed;
      ellipse.rotation.x += mouseY * rotationSpeed;
    }
    if (Date.now() - lastMouseMoveTime > inactivityDelay) {
      ellipse.rotation.x +=
        (initialRotations[index].rotationX - ellipse.rotation.x) * resetSpeed;
      ellipse.rotation.y +=
        (initialRotations[index].rotationY - ellipse.rotation.y) * resetSpeed;
      ellipse.rotation.z +=
        (initialRotations[index].rotationZ - ellipse.rotation.z) * resetSpeed;
    }
  });
  if (mouseMoved) {
    mouseMoved = false;
  }
  renderer.render(scene, camera);
}
animate();
