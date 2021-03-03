import * as THREE from "three";
import {
  animate,
  createOrbitControls,
  getcanvas,
  onWindowResize,
} from "../utils/init";
import image from "./hdr.png";

function createPlane() {
  const geometry = new THREE.PlaneGeometry(200, 200);
  const material = new THREE.MeshPhongMaterial({
    // wireframe: true,
    color: 0x555555,
  });

  const planeMesh = new THREE.Mesh(geometry, material);
  planeMesh.position.y = -50;
  planeMesh.rotation.x = -Math.PI * 0.5;

  planeMesh.receiveShadow = true;
  return planeMesh;
}

function createEnvScene() {
  const envScene = new THREE.Scene();

  const geometry = new THREE.BoxGeometry();
  geometry.deleteAttribute("uv");
  const roomMaterial = new THREE.MeshStandardMaterial({
    metalness: 0,
    side: THREE.BackSide,
  });
  const room = new THREE.Mesh(geometry, roomMaterial);
  room.scale.setScalar(10);
  envScene.add(room);

  const mainLight = new THREE.PointLight(0xffffff, 50, 0, 2);
  envScene.add(mainLight);

  const lightMaterial = new THREE.MeshLambertMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveIntensity: 10,
  });

  const light1 = new THREE.Mesh(geometry, lightMaterial);
  light1.material.color.setHex(0xff0000);
  light1.position.set(-5, 2, 0);
  light1.scale.set(0.1, 1, 1);
  envScene.add(light1);

  const light2 = new THREE.Mesh(geometry, lightMaterial.clone());
  (light2.material as THREE.MeshLambertMaterial).color.setHex(0x00ff00);
  light2.position.set(0, 5, 0);
  light2.scale.set(1, 0.1, 1);
  envScene.add(light2);

  const light3 = new THREE.Mesh(geometry, lightMaterial.clone());
  (light3.material as THREE.MeshLambertMaterial).color.setHex(0x0000ff);
  light3.position.set(2, 1, 5);
  light3.scale.set(1.5, 2, 0.1);
  envScene.add(light3);

  return envScene;
}

function main() {
  const canvas = getcanvas();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    logarithmicDepthBuffer: true,
  });
  // renderer.physicallyCorrectLights = true;
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 0, 120);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const geometry = new THREE.TorusKnotGeometry(18, 8, 150, 20);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
  });

  const torusMesh = new THREE.Mesh(geometry, material);
  torusMesh.castShadow = true;
  torusMesh.receiveShadow = true;
  scene.add(torusMesh);

  const pointLight = new THREE.PointLight(0xffffff, 1, 1000);
  pointLight.position.set(50, 50, 50);
  pointLight.castShadow = true;
  // scene.add(pointLight);

  const plane = createPlane();
  scene.add(plane);

  createOrbitControls(camera, renderer);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new THREE.TextureLoader().load(image, (texture) => {
    texture.encoding = THREE.sRGBEncoding;

    const pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
    torusMesh.material.envMap = pngCubeRenderTarget.texture;
    torusMesh.material.needsUpdate = true;
    // plane.material.map = pngCubeRenderTarget.texture;
    // plane.material.needsUpdate = true;

    scene.background = pngCubeRenderTarget.texture;
    texture.dispose();
  });

  function render() {
    renderer.render(scene, camera);
  }
  onWindowResize(renderer, camera);
  animate(render);
}

main();
