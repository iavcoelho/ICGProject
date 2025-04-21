import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class SpaceModule {
  model: THREE.Group<THREE.Object3DEventMap> | null = null;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls | null = null; // Initialize as null
  private loader = new GLTFLoader(); // Create a single loader instance

  firstPersonCamera: THREE.PerspectiveCamera;
  thirdPersonCamera: THREE.PerspectiveCamera;

  isFirstPerson: boolean = true;

  constructor(
    fov: number,
    aspectRatio: number,
    near: number,
    far: number,
    rendererDomElement: HTMLCanvasElement,
    scene: THREE.Scene,
  ) {
    this.firstPersonCamera = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      near,
      far,
    );

    this.thirdPersonCamera = new THREE.PerspectiveCamera(
      fov,
      aspectRatio,
      near,
      far,
    );

    this.camera = this.thirdPersonCamera;
    this.camera.position.set(0, 0, 5); // Adjust initial camera position

    this.controls = new OrbitControls(
      this.thirdPersonCamera,
      rendererDomElement,
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.loadModel(scene);
  }

  private loadModel(scene: THREE.Scene) {
    this.loader.load(
      "./models/zarya.glb",
      (gltf) => {
        this.model = gltf.scene;
        this.model.position.z = 5;
        console.log("The zarya model has been loaded");
        // You might want to perform initial model adjustments here
        scene.add(this.model);
        this.model.rotateX(Math.PI);
        this.centerCameraOnModel();
      },
      undefined,
      function (error) {
        console.error(
          "An error happened while loading the zarya model: ",
          error,
        );
      },
    );
  }

  switchCamera() {
    this.camera = this.isFirstPerson
      ? this.firstPersonCamera
      : this.thirdPersonCamera;
    this.isFirstPerson = !this.isFirstPerson;
  }

  private centerCameraOnModel() {
    if (!this.model) return;
    const boundingBox = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Set the OrbitControls target to the center of the model
    this.controls?.target.copy(center);

    // Optionally, adjust the camera's initial position to view the centered model
    const size = boundingBox.getSize(new THREE.Vector3()).length();
    this.thirdPersonCamera.position
      .copy(center)
      .add(new THREE.Vector3(0, 0, size * 1.5)); // Adjust the multiplier as needed
    this.thirdPersonCamera.lookAt(center);
    this.firstPersonCamera.lookAt(center);

    this.firstPersonCamera.position
      .copy(center)
      .add(new THREE.Vector3(0, 0, -5)); // Adjust the multiplier as needed
    this.firstPersonCamera.rotateX(Math.PI);

    this.controls?.update(); // Important to update controls after changing target and position
  }

  // Methods to control the model
  setModelPosition(x: number, y: number, z: number) {
    if (this.model) {
      this.model.position.set(x, y, z);
    }
  }

  updateControls() {
    this.controls?.update();
  }

  resizeCamera(width: number, height: number) {
    this.firstPersonCamera.aspect = width / height;
    this.thirdPersonCamera.aspect = width / height;
    this.firstPersonCamera.updateProjectionMatrix();
    this.thirdPersonCamera.updateProjectionMatrix();
  }
}

export default SpaceModule;
