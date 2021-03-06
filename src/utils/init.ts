import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

export function onWindowResize(
  renderer: THREE.Renderer,
  camera: THREE.PerspectiveCamera
): void {
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }
  resize();
  window.addEventListener("resize", resize);
}

const stats = Stats();
document.body.appendChild(stats.dom);
export function animate(render: () => void): void {
  loop();

  function loop() {
    requestAnimationFrame(loop);
    stats.begin();
    render();
    stats.end();
  }
}

export function getcanvas(): HTMLCanvasElement {
  const canvasEle = document.querySelector("canvas");
  if (canvasEle === null) {
    throw new Error("获取canvas失败");
  }
  return canvasEle;
}

export function createOrbitControls(
  camera: THREE.Camera,
  renderer: THREE.Renderer
): void {
  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.minDistance = 1;
  // controls.maxDistance = 20;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function init() {
  const canvas = getcanvas();
  const renderer = new WebGLRenderer({ canvas, logarithmicDepthBuffer: true });
  const camera = new PerspectiveCamera();
  camera.position.set(0, 0, 100);
  createOrbitControls(camera, renderer);

  onWindowResize(renderer, camera);

  const scene = new Scene();
  const light1 = new DirectionalLight(0xffffff, 1);
  light1.position.set(10, 10, 10);
  scene.add(light1);
  const light2 = new DirectionalLight(0xffffff, 1);
  light2.position.set(-10, -10, -10);
  scene.add(light2);
  return {
    renderer,
    camera,
    scene,
  };
}
