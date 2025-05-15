import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import SpaceModule from "./space_module.ts";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

const scene = new THREE.Scene();
const light = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(light);
const loader = new GLTFLoader();
let shipVelocity = new THREE.Vector3(0, 0, 0);
let shipAngularVelocity = new THREE.Vector3(0, 0, 0);
const shipSpeed = 0.1;
const rotationSpeed = Math.PI / 180; // 1º/s
var clock = new THREE.Clock();

loader.load(
  "./models/ISS_stationary.glb",
  function (gltf) {
    scene.add(gltf.scene);
    gltf.scene.position.z = -21;
    gltf.scene.position.y = 0.7;
  },
  undefined,
  function (error) {
    console.error(error);
  },
);

const renderer = new THREE.WebGLRenderer();

let zarya = new SpaceModule(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
  renderer.domElement,
  scene,
);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

new EXRLoader().load("./skybox/skybox.exr", function (texture, textureData) {
  // memorial.exr is NPOT

  console.log(textureData);
  console.log(texture);
  // Important: Assign the texture to scene.background
  scene.background = texture;
  scene.backgroundIntensity = 0.35;

  // Optional: Set the texture's mapping for better skybox appearance
  texture.mapping = THREE.EquirectangularReflectionMapping;
});

function animate() {
  const delta = clock.getDelta();
  zarya.updateControls(); // Update OrbitControls
  zarya.updatePosition(shipVelocity, delta);
  zarya.updateRotation(shipAngularVelocity, delta);
  updateHud();
  renderer.render(scene, zarya.camera);
}

window.addEventListener("resize", () => {
  // Update sizes
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Update camera
  zarya.resizeCamera(width, height);

  // Update renderer
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

document.getElementById("translate-up-button")!.onclick = () => {
  shipVelocity.y += shipSpeed;
};

document.getElementById("translate-down-button")!.onclick = () => {
  shipVelocity.y -= shipSpeed;
};

document.getElementById("translate-left-button")!.onclick = () => {
  shipVelocity.x -= shipSpeed;
};

document.getElementById("translate-right-button")!.onclick = () => {
  shipVelocity.x += shipSpeed;
};

document.getElementById("translate-forward-button")!.onclick = () => {
  shipVelocity.z -= shipSpeed;
};

document.getElementById("translate-backward-button")!.onclick = () => {
  shipVelocity.z += shipSpeed;
};

document.getElementById("pitch-up-button")!.onclick = () => {
  shipAngularVelocity.x += rotationSpeed;
};

document.getElementById("pitch-down-button")!.onclick = () => {
  shipAngularVelocity.x -= rotationSpeed;
};

document.getElementById("roll-left-button")!.onclick = () => {
  shipAngularVelocity.z -= rotationSpeed;
};

document.getElementById("roll-right-button")!.onclick = () => {
  shipAngularVelocity.z += rotationSpeed;
};

document.getElementById("yaw-left-button")!.onclick = () => {
  shipAngularVelocity.y -= rotationSpeed;
};

document.getElementById("yaw-right-button")!.onclick = () => {
  shipAngularVelocity.y += rotationSpeed;
};

window.addEventListener("keyup", (event) => {
  if (event.key === "v") {
    zarya.switchCamera();
  }

  if (event.key === "w") {
    shipVelocity.y += shipSpeed;
  }

  if (event.key === "s") {
    shipVelocity.y += -shipSpeed;
  }

  if (event.key === "d") {
    shipVelocity.x += shipSpeed;
  }

  if (event.key === "a") {
    shipVelocity.x += -shipSpeed;
  }

  if (event.key === "q") {
    shipVelocity.z += shipSpeed;
  }

  if (event.key === "e") {
    shipVelocity.z += -shipSpeed;
  }

  if (event.key === "ArrowUp") {
    shipAngularVelocity.x += rotationSpeed;
  }

  if (event.key === "ArrowDown") {
    shipAngularVelocity.x += -rotationSpeed;
  }

  if (event.key === "ArrowRight") {
    shipAngularVelocity.y += rotationSpeed;
  }

  if (event.key === "ArrowLeft") {
    shipAngularVelocity.y -= rotationSpeed;
  }

  if (event.key === ".") {
    shipAngularVelocity.z += rotationSpeed;
  }

  if (event.key === ",") {
    shipAngularVelocity.z -= rotationSpeed;
  }
});

function updateHud() {
  document.getElementById("pitch_rate")!.innerText =
    `${shipAngularVelocity.x.toFixed(2)} °/s`;

  document.getElementById("yaw_rate")!.innerText =
    `${shipAngularVelocity.y.toFixed(2)} °/s`;

  document.getElementById("roll_rate")!.innerText =
    `${shipAngularVelocity.z.toFixed(2)} °/s`;

  document.getElementById("rate_rate")!.innerText =
    `${shipVelocity.length().toFixed(2)} m/s`;

  zarya.updateHud();
}

// -- space background ------------------------------------------------------
var stars = new Array(0);
for (var i = 0; i < 10000; i++) {
  let x = THREE.MathUtils.randFloatSpread(2000);
  let y = THREE.MathUtils.randFloatSpread(2000);
  let z = THREE.MathUtils.randFloatSpread(2000);

  if (x < 100 && x >= -100 && y < 100 && y >= -100 && z < 100 && z >= -100) {
    continue;
  }

  stars.push(x, y, z);
}
var starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(stars, 3),
);
var starsMaterial = new THREE.PointsMaterial({ color: 0xdddddd });
var starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);
