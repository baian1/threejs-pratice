import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

const stats = new Stats();
document.body.appendChild(stats.dom);

function loadData(urls: string[]) {
  async function loadFile(url: string): any {
    const req = await fetch(url);
    return req.text();
  }

  type settingSType = {
    xllcorner: number;
    yllcorner: number;
    min: number;
    max: number;
    data: (number | undefined)[][];
  };
  function parseData(text: string): settingSType {
    const data: settingSType["data"] = [];
    const settings: settingSType = {
      data,
      xllcorner: 0,
      yllcorner: 0,
      min: 0,
      max: 0,
    };
    let max = 0;
    let min = 0;
    // split into lines
    text.split("\n").forEach((line) => {
      // split the line by whitespace
      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        // only 2 parts, must be a key/value pair
        settings[parts[0]] = parseFloat(parts[1]);
      } else if (parts.length > 2) {
        // more than 2 parts, must be data
        const values = parts.map((v) => {
          const value = parseFloat(v);
          if (value === settings.NODATA_value) {
            return undefined;
          }
          max = Math.max(max === undefined ? value : max, value);
          min = Math.min(min === undefined ? value : min, value);
          return value;
        });
        data.push(values);
      }
    });
    settings.max = max;
    settings.min = min;
    return settings;
  }

  const promises = urls.map((url) => loadFile(url).then(parseData));
  return Promise.all<settingSType>(promises);
}

async function main() {
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
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
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

  const fileInfos = [
    {
      name: "men",
      hueRange: [0.7, 0.3],
      url:
        "https://threejsfundamentals.org/threejs/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc",
    },
    {
      name: "women",
      hueRange: [0.9, 1.1],
      url:
        "https://threejsfundamentals.org/threejs/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc",
    },
  ];
  const data = await loadData(fileInfos.map((v) => v.url)).then((files) => {
    const newFileInfos: {
      name: string;
      hueRange: number[];
      file: typeof files[number];
    }[] = [];
    files.forEach((file, index) => {
      newFileInfos.push({
        file,
        name: fileInfos[index].name,
        hueRange: fileInfos[index].hueRange,
      });
    });

    function mapValues(
      data: (undefined | number)[][],
      fn: (
        base: number | undefined,
        rowNdx: number,
        colNdx: number
      ) => number | undefined
    ) {
      return data.map((row, rowNdx) => {
        return row.map((value, colNdx) => {
          return fn(value, rowNdx, colNdx);
        });
      });
    }
    function makeDiffFile(
      baseFile: typeof files[number],
      otherFile: typeof files[number],
      compareFn: (a: number, b: number) => number
    ) {
      let min: number;
      let max: number;
      const baseData = baseFile.data;
      const otherData = otherFile.data;
      const data = mapValues(baseData, (base, rowNdx, colNdx) => {
        const other = otherData[rowNdx][colNdx];
        if (base === undefined || other === undefined) {
          return undefined;
        }
        const value = compareFn(base, other);
        min = Math.min(min === undefined ? value : min, value);
        max = Math.max(max === undefined ? value : max, value);
        return value;
      });
      // make a copy of baseFile and replace min, max, and data
      // with the new data
      return { ...baseFile, min, max, data };
    }
    function amountGreaterThan(a: number, b: number) {
      return Math.max(a - b, 0);
    }

    newFileInfos.push({
      name: ">50%men",
      hueRange: [0.6, 1.1],
      file: makeDiffFile(files[0], files[1], (men, women) => {
        return amountGreaterThan(men, women);
      }),
    });
    newFileInfos.push({
      name: ">50% women",
      hueRange: [0.0, 0.4],
      file: makeDiffFile(files[1], files[0], (women, men) => {
        return amountGreaterThan(women, men);
      }),
    });

    return newFileInfos;
  });

  const meshs = data.map((v) => {
    return makeBoxes(v.file, v.name, v.hueRange);
  });

  function makeBoxes(
    file: {
      data: (number | undefined)[][];
      min: number;
      max: number;
      xllcorner: number;
      yllcorner: number;
    },
    name: string,
    hueRange: number[]
  ) {
    const { data } = file;
    const { min, max } = file;
    const range = max - min;
    const geometries: THREE.BoxGeometry[] = [];

    // these helpers will make it easy to position the boxes
    // We can rotate the lon helper on its Y axis to the longitude
    const lonHelper = new THREE.Object3D();
    scene.add(lonHelper);
    // We rotate the latHelper on its X axis to the latitude
    const latHelper = new THREE.Object3D();
    lonHelper.add(latHelper);
    // The position helper moves the object to the edge of the sphere
    const positionHelper = new THREE.Object3D();
    positionHelper.position.z = 1;
    latHelper.add(positionHelper);

    // Used to move the center of the box so it scales from the position Z axis
    const originHelper = new THREE.Object3D();
    originHelper.position.z = 0.5;
    positionHelper.add(originHelper);

    const lonFudge = Math.PI * 0.5;
    const latFudge = Math.PI * -0.135;
    data.forEach((row, latNdx) => {
      row.forEach((value, lonNdx) => {
        // if (latNdx > 50 || lonNdx > 50) {
        //   return;
        // }
        if (value === undefined) {
          return;
        }
        // make one box geometry
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;

        const geometry = new THREE.BoxBufferGeometry(
          boxWidth,
          boxHeight,
          boxDepth
        );
        // make it so it scales away from the positive Z axis

        // adjust the helpers to point to the latitude and longitude
        lonHelper.rotation.y =
          THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
        latHelper.rotation.x =
          THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

        // use the world matrix of the position helper to
        // position this mesh.
        const amount = (value - min) / range;
        positionHelper.scale.set(
          0.005,
          0.005,
          THREE.MathUtils.lerp(0.01, 0.5, amount)
        );
        originHelper.updateWorldMatrix(true, false);
        geometry.applyMatrix4(originHelper.matrixWorld);

        //添加颜色
        // compute a color
        const color = new THREE.Color();
        const hue = THREE.MathUtils.lerp(hueRange[0], hueRange[1], amount);
        const saturation = 1;
        const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
        color.setHSL(hue, saturation, lightness);
        // get the colors as an array of values from 0 to 255
        const rgb = color.toArray().map((v) => v * 255);

        // make an array to store colors for each vertex
        const numVerts = geometry.getAttribute("position").count;
        const itemSize = 3; // r, g, b
        const colors = new Uint8Array(itemSize * numVerts);

        // copy the color into the colors array for each vertex
        colors.forEach((v, ndx) => {
          colors[ndx] = rgb[ndx % 3];
        });

        const normalized = true;
        const colorAttrib = new THREE.BufferAttribute(
          colors,
          itemSize,
          normalized
        );
        geometry.setAttribute("color", colorAttrib);

        geometries.push(geometry);
      });
    });

    // const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
    //   geometries
    // );
    const mergedGeometry = new THREE.BufferGeometry();
    const length = geometries.length;
    mergedGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(length * 72), 3)
    );
    mergedGeometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(new Float32Array(length * 72), 3)
    );
    mergedGeometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array(length * 48), 2)
    );
    mergedGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Uint8Array(length * 72), 3)
    );
    const indices: number[] = [];
    geometries.forEach((v, index) => {
      const vIndices = v.getIndex();
      if (vIndices) {
        indices.push(...vIndices.toJSON().array.map((v) => v + 24 * index));
      }
      mergedGeometry.merge(v, index * 24);
    });
    mergedGeometry.setIndex(
      // indices
      new THREE.BufferAttribute(new Uint32Array(indices, 0, indices.length), 1)
    );
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
    });
    const mesh = new THREE.Mesh(mergedGeometry, material);

    return mesh;
  }

  scene.add(meshs[0]);
  render();
  //----------------------
  const gui = new GUI();
  const folderLocal = gui.addFolder("Local Clipping");
  const propsLocal = {
    show: "man",
  };
  const selector = ["man", "woman", ">man50%", ">woman50%"];
  folderLocal.add(propsLocal, "show", selector).onChange((v: string) => {
    meshs.forEach((mesh) => {
      scene.remove(mesh);
    });
    scene.add(meshs[selector.indexOf(v)]);

    render();
  });
}

main();
