import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
function main() {
  const canvas = document.querySelector("#c") as HTMLCanvasElement;
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 60;
  const aspect = 2;
  const near = 0.1;
  const far = 10;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2.5;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.2;
  controls.maxDistance = 4;
  controls.update();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("black");

  {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://threejsfundamentals.org/threejs/resources/images/world.jpg",
      render
    );
    const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    scene.add(new THREE.Mesh(geometry, material));
  }

  function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }
  let renderRequested = false;
  function render() {
    renderRequested = false;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    controls.update();
    renderer.render(scene, camera);
  }

  render();
  function requestRenderIfNotRequested() {
    if (!renderRequested) {
      renderRequested = true;
      requestAnimationFrame(render);
    }
  }

  controls.addEventListener("change", requestRenderIfNotRequested);
  window.addEventListener("resize", requestRenderIfNotRequested);
}

main();
