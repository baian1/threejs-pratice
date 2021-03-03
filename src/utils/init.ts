import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
