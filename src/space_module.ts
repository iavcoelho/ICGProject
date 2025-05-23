import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class SpaceModule {
  private model: THREE.Group<THREE.Object3DEventMap> | null = null;
  camera: THREE.PerspectiveCamera;
  private controls: OrbitControls | null = null; // Initialize as null
  private loader = new GLTFLoader(); // Create a single loader instance

  private firstPersonCamera: THREE.PerspectiveCamera;
  private thirdPersonCamera: THREE.PerspectiveCamera;
  private shipVelocity = new THREE.Vector3();

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

    this.camera = this.firstPersonCamera;
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
        this.model.position.x = Math.random() * 40 - 20;
        this.model.position.y = Math.random() * 40 - 20;
        this.model.position.z = Math.random() * 100 + 50;
        console.log("The zarya model has been loaded");
        // You might want to perform initial model adjustments here
        scene.add(this.model);
        this.model.rotateX(Math.random() * 0.4 - 0.2);
        this.model.rotateY(Math.random() * 0.4 - 0.2 + Math.PI);
        this.model.rotateZ(Math.random() * 0.4 - 0.2);
        this.centerCameraOnModel();
        this.model.add(this.firstPersonCamera);
        this.firstPersonCamera.rotateX(Math.PI);
        this.firstPersonCamera.position.set(0, 0.2, 2);
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

    this.controls?.update(); // Important to update controls after changing target and position
  }

  updatePosition(vec: THREE.Vector3, delta: number) {
    if (!this.model) return;
    const delta_vec = this.shipVelocity.copy(vec).multiplyScalar(delta);
    this.model.position.add(delta_vec);
    this.thirdPersonCamera.position.add(delta_vec);
    this.controls?.target.add(delta_vec);
  }

  updateRotation(vec: THREE.Vector3, delta: number) {
    if (!this.model) return;
    this.model.rotateX(vec.x * delta);
    this.model.rotateY(vec.y * delta);
    this.model.rotateZ(vec.z * delta);
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

  updateHud() {
    if (!this.model) return;
    let pitch = (this.model.rotation.x * 180) / Math.PI;
    pitch = (pitch - 180 + 360) % 360;
    if (pitch > 180) pitch -= 360;
    pitch = Math.max(-90, Math.min(90, pitch));
    document.getElementById("pitch_error")!.innerText = `${pitch.toFixed(1)} °`;
    document.getElementById("yaw_error")!.innerText = `${(
      (this.model.rotation.y * 180) /
      Math.PI
    ).toFixed(1)} °`;
    document.getElementById("roll_error")!.innerText = `${(
      (this.model.rotation.z * 180) /
      Math.PI
    ).toFixed(1)} °`;

    document.getElementById("x_distance")!.innerText = `${(
      this.model.position.x - 0.01
    ).toFixed(2)} m`;

    document.getElementById("y_distance")!.innerText = `${(
      this.model.position.y - 0.21
    ).toFixed(2)} m`;

    document.getElementById("z_distance")!.innerText = `${(
      this.model.position.z - 2.1
    ).toFixed(2)} m`;

    document.getElementById("range_rate")!.innerText = `${this.model.position
      .distanceTo(new THREE.Vector3(0.01, 0.15, 2.1))
      .toFixed(2)} m`;
  }
}

export default SpaceModule;
