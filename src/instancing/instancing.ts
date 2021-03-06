import {
  BoxBufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereBufferGeometry,
} from "three";
import { animate, init } from "../utils/init";

const { renderer, camera, scene } = init();

const geometry = new BoxBufferGeometry(1);
const material = new MeshPhongMaterial({});

const amount = 3;
const mesh = new InstancedMesh(geometry, material, Math.pow(amount, 3));
const matrix = new Matrix4();
const color = new Color();
let i = 0;
for (let x = 0; x < amount; x++) {
  for (let y = 0; y < amount; y++) {
    for (let z = 0; z < amount; z++) {
      matrix.setPosition(
        (-amount / 2 + x) * 1,
        (-amount / 2 + y) * 1,
        (-amount / 2 + z) * 1
      );
      color.setRGB(x / amount, y / amount, z / amount);
      mesh.setMatrixAt(i, matrix.clone());
      mesh.setColorAt(i, color);
      i++;
    }
  }
}

// mesh.instanceMatrix.needsUpdate = true;

const plane = new PlaneGeometry(100, 100);
const mm = new MeshPhongMaterial({ color: 0xffffff, side: DoubleSide });
const mesh2 = new Mesh(plane, mm);
// scene.add(mesh2);

scene.add(mesh);

function render() {
  renderer.render(scene, camera);
}
animate(render);
