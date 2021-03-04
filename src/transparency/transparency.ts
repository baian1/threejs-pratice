import {
  BoxBufferGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import {
  animate,
  createOrbitControls,
  getcanvas,
  onWindowResize,
} from "../utils/init";

const canvas = getcanvas();
const renderer = new WebGLRenderer({ canvas });

const camera = new PerspectiveCamera(50, 1, 1, 100);
camera.position.set(0, 0, 20);

onWindowResize(renderer, camera);
createOrbitControls(camera, renderer);

const scene = new Scene();

function render() {
  renderer.render(scene, camera);
}
animate(render);

function addLight(...pos: [number, number, number]) {
  const color = 0xffffff;
  const intensity = 1;
  const light = new DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  light.position.set(...pos);
  scene.add(light);
}
//对向的光，照亮cube表面
addLight(-1, 2, 4);
addLight(1, -1, -2);

const geometry = new BoxBufferGeometry(1, 1, 1);
function makeInstance(color: Color, ...position: [number, number, number]) {
  const material = new MeshPhongMaterial({
    color,
    opacity: 0.5,
    transparent: true,
  });
  const cube = new Mesh(geometry, material);
  scene.add(cube);

  cube.position.set(...position);
  return cube;
}

function hsl(h: number, s: number, l: number) {
  return new Color().setHSL(h, s, l);
}

const d = 0.8;
makeInstance(hsl(0 / 8, 1, 0.5), -d, -d, -d);
makeInstance(hsl(1 / 8, 1, 0.5), d, -d, -d);
makeInstance(hsl(2 / 8, 1, 0.5), -d, d, -d);
makeInstance(hsl(3 / 8, 1, 0.5), d, d, -d);
makeInstance(hsl(4 / 8, 1, 0.5), -d, -d, d);
makeInstance(hsl(5 / 8, 1, 0.5), d, -d, d);
makeInstance(hsl(6 / 8, 1, 0.5), -d, d, d);
makeInstance(hsl(7 / 8, 1, 0.5), d, d, d);
