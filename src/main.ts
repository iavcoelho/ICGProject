import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import SpaceModule from "./space_module.ts";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

const scene = new THREE.Scene();
const light = new THREE.AmbientLight(0x777777); // soft white light
scene.add(light);
const loader = new GLTFLoader();

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
  zarya.updateControls(); // Update OrbitControls
  zarya.updatePosition(new THREE.Vector3(0, 0, 0));
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

window.addEventListener("keydown", (event) => {
  if (event.key === "v") {
    zarya.switchCamera();
  }
});

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
