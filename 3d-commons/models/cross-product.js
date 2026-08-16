// 3D Commons: ベクトルの外積と面積・向き
// Three.js y-up: +x 右, +y 上, +z 手前

const A_LEN = 5;
const B_LEN = 4;
const EPS = 1e-8;

function makeLabel(THREE, text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(3.4, 0.85, 1);
  sprite.userData.labelCanvas = canvas;
  sprite.userData.labelContext = context;
  sprite.userData.labelTexture = texture;
  sprite.userData.labelColor = color;
  setLabel(sprite, text);
  return sprite;
}

function setLabel(sprite, text) {
  const canvas = sprite.userData.labelCanvas;
  const context = sprite.userData.labelContext;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "bold 42px Arial, sans-serif";
  context.fillStyle = sprite.userData.labelColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  sprite.userData.labelTexture.needsUpdate = true;
}

function computeVectors(THREE, state) {
  const theta = state.params.angle * Math.PI / 180;
  const phi = state.params.bTilt * Math.PI / 180;
  const a = new THREE.Vector3(A_LEN, 0, 0);
  const b = new THREE.Vector3(
    B_LEN * Math.cos(phi) * Math.cos(theta),
    B_LEN * Math.sin(phi),
    B_LEN * Math.cos(phi) * Math.sin(theta)
  );
  const n = new THREE.Vector3().crossVectors(a, b);
  const aLen = a.length();
  const bLen = b.length();
  const nLen = n.length();
  const sinTheta = aLen > EPS && bLen > EPS ? nLen / (aLen * bLen) : 0;
  return { a, b, n, aLen, bLen, nLen, sinTheta };
}

export default {
  id: "cross-product",
  category: "math",
  categoryLabel: "📐 数C・空間ベクトル",
  title: "ベクトルの外積と面積・向き",
  description: "原点から出る $\\boldsymbol a,\\boldsymbol b$ が張る平行四辺形の面積は $|\\boldsymbol a\\times\\boldsymbol b|$ です。外積 $\\boldsymbol n=\\boldsymbol a\\times\\boldsymbol b$ はその面に垂直で、右手の法則（人差し指→$\\boldsymbol a$、中指→$\\boldsymbol b$、親指→$\\boldsymbol n$）で向きが決まります。座標は Three.js の y-up（$+x$ 右・$+y$ 上・$+z$ 手前）です。",
  formula: "|\\boldsymbol{a}\\times\\boldsymbol{b}|=|\\boldsymbol{a}||\\boldsymbol{b}|\\sin\\theta",
  legend: [
    { color: "#0284c7", label: "ベクトル $\\boldsymbol a=(a_x,a_y,a_z)$" },
    { color: "#e11d48", label: "ベクトル $\\boldsymbol b=(b_x,b_y,b_z)$" },
    { color: "#059669", label: "外積 $\\boldsymbol n=\\boldsymbol a\\times\\boldsymbol b$（面に垂直）" },
    { color: "#7c3aed", label: "平行四辺形（面積 $|\\boldsymbol a\\times\\boldsymbol b|$）" },
    { color: "#94a3b8", label: "$x$ 軸・$y$ 軸・$z$ 軸（y-up）" }
  ],
  views: {
    overview: { name: "🔄 全体", pos: [11, 9, 14], target: [2.5, 1, 1], default: true },
    plane: { name: "📐 面を正面から", pos: [0, 2, 18], target: [2.5, 1, 1] },
    top: { name: "上から（xz平面）", pos: [0, 20, 0], target: [2.5, 0, 1] }
  },
  parameters: {
    angle: { label: "水平角 $\\theta$（xz 平面で $+x$ から）", min: 0, max: 180, step: 5, value: 55 },
    bTilt: { label: "仰角 $\\varphi$（$+y$ 方向への傾き）", min: -70, max: 70, step: 5, value: 35 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.origin = new THREE.Vector3(0, 0, 0);

    const axisMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.35, gapSize: 0.2 });
    state.axisX = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(9, 0, 0)
      ]),
      axisMat
    );
    state.axisY = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, 7, 0)
      ]),
      axisMat
    );
    state.axisZ = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -1.5), new THREE.Vector3(0, 0, 7)
      ]),
      axisMat
    );
    state.axisX.computeLineDistances();
    state.axisY.computeLineDistances();
    state.axisZ.computeLineDistances();

    state.parallelogram = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({
        color: 0x7c3aed, transparent: true, opacity: 0.28,
        side: THREE.DoubleSide, roughness: 0.35
      })
    );
    state.paraEdge = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.7 })
    );
    state.arrowA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), state.origin, A_LEN, 0x0284c7, 0.55, 0.3);
    state.arrowB = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), state.origin, B_LEN, 0xe11d48, 0.55, 0.3);
    state.arrowN = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), state.origin, 1, 0x059669, 0.55, 0.3);
    state.labelA = makeLabel(THREE, "a", "#0284c7");
    state.labelB = makeLabel(THREE, "b", "#e11d48");
    state.labelN = makeLabel(THREE, "n=a×b", "#059669");
    state.labelX = makeLabel(THREE, "+x", "#94a3b8");
    state.labelY = makeLabel(THREE, "+y", "#94a3b8");
    state.labelZ = makeLabel(THREE, "+z", "#94a3b8");

    state.group.add(
      state.axisX, state.axisY, state.axisZ,
      state.parallelogram, state.paraEdge,
      state.arrowA, state.arrowB, state.arrowN,
      state.labelA, state.labelB, state.labelN,
      state.labelX, state.labelY, state.labelZ
    );
    this.updateCrossProduct(THREE, state);
  },

  updateCrossProduct(THREE, state) {
    const { a, b, n, aLen, bLen, nLen, sinTheta } = computeVectors(THREE, state);
    const o = state.origin;
    const ab = a.clone().add(b);

    state.arrowA.setDirection(aLen > EPS ? a.clone().normalize() : new THREE.Vector3(1, 0, 0));
    state.arrowA.setLength(aLen, 0.55, 0.3);
    state.arrowB.setDirection(bLen > EPS ? b.clone().normalize() : new THREE.Vector3(0, 1, 0));
    state.arrowB.setLength(bLen, 0.55, 0.3);

    if (nLen > EPS) {
      const nDir = n.clone().normalize();
      state.arrowN.setDirection(nDir);
      state.arrowN.setLength(nLen, 0.55, 0.3);
      state.arrowN.visible = true;
      state.labelN.visible = true;
      state.labelN.position.copy(nDir.clone().multiplyScalar(nLen * 0.55 + 0.6));
    } else {
      state.arrowN.setDirection(new THREE.Vector3(0, 1, 0));
      state.arrowN.setLength(0.001, 0.55, 0.3);
      state.arrowN.visible = false;
      state.labelN.visible = false;
    }

    const paraPositions = [
      o.x, o.y, o.z, a.x, a.y, a.z, ab.x, ab.y, ab.z,
      o.x, o.y, o.z, ab.x, ab.y, ab.z, b.x, b.y, b.z
    ];
    state.parallelogram.geometry.dispose();
    const paraGeo = new THREE.BufferGeometry();
    paraGeo.setAttribute("position", new THREE.Float32BufferAttribute(paraPositions, 3));
    paraGeo.computeVertexNormals();
    state.parallelogram.geometry = paraGeo;
    state.parallelogram.visible = nLen > EPS;

    const edgePositions = [
      o.x, o.y, o.z, a.x, a.y, a.z,
      a.x, a.y, a.z, ab.x, ab.y, ab.z,
      ab.x, ab.y, ab.z, b.x, b.y, b.z,
      b.x, b.y, b.z, o.x, o.y, o.z
    ];
    state.paraEdge.geometry.dispose();
    state.paraEdge.geometry = new THREE.BufferGeometry().setAttribute(
      "position", new THREE.Float32BufferAttribute(edgePositions, 3)
    );
    state.paraEdge.visible = nLen > EPS;

    state.labelA.position.copy(a).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.45, 0));
    state.labelB.position.copy(b).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.45, 0));
    state.labelX.position.set(8.5, -0.35, 0);
    state.labelY.position.set(-0.35, 6.5, 0);
    state.labelZ.position.set(0, -0.35, 6.5);

    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      const ax = a.x.toFixed(2);
      const ay = a.y.toFixed(2);
      const az = a.z.toFixed(2);
      const bx = b.x.toFixed(2);
      const by = b.y.toFixed(2);
      const bz = b.z.toFixed(2);
      const nx = n.x.toFixed(2);
      const ny = n.y.toFixed(2);
      const nz = n.z.toFixed(2);
      const area = nLen.toFixed(2);
      const sinStr = sinTheta.toFixed(3);
      const degenerate = nLen <= EPS;
      const rhs = degenerate
        ? `|\\boldsymbol a||\\boldsymbol b|\\sin\\theta=${aLen.toFixed(0)}\\times${bLen.toFixed(0)}\\times 0=0\\ \\text{（平行・退化）}`
        : `|\\boldsymbol a||\\boldsymbol b|\\sin\\theta=${aLen.toFixed(0)}\\times${bLen.toFixed(0)}\\times${sinStr}=${area}`;
      katex.render(
        `\\boldsymbol a=(${ax},${ay},${az}),\\ \\boldsymbol b=(${bx},${by},${bz}),\\ \\boldsymbol n=(${nx},${ny},${nz})\\quad |\\boldsymbol a\\times\\boldsymbol b|=${area}\\quad ${rhs}`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state) {
    this.updateCrossProduct(THREE, state);
  }
};
