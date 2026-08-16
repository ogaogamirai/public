// 3D Commons: 空間ベクトルが張る平行六面体

export default {
  id: "parallelepiped",
  category: "math",
  categoryLabel: "📐 数C・空間ベクトル",
  title: "空間ベクトルが張る平行六面体",
  description: "3本のベクトルを辺として平行六面体を作ります。辺の傾きを変えると形は変わりますが、今回のせん断では体積が保たれることを観察します。",
  formula: "V=|\\boldsymbol a\\cdot(\\boldsymbol b\\times\\boldsymbol c)|",
  legend: [
    { color: "#0284c7", label: "ベクトル $\\boldsymbol a$" },
    { color: "#e11d48", label: "ベクトル $\\boldsymbol b$" },
    { color: "#d97706", label: "ベクトル $\\boldsymbol c$" }
  ],
  views: {
    overview: { name: "🔄 全体", pos: [12, 10, 16], target: [2, 2, 1], default: true },
    front: { name: "正面", pos: [0, 5, 22], target: [2, 2, 1] },
    top: { name: "上から", pos: [0, 22, 0], target: [2, 2, 1] }
  },
  parameters: {
    shear: { label: "辺 b の傾き", min: -3, max: 3, step: 0.1, value: 1.5 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.a = new THREE.Vector3(5, 0, 0);
    state.c = new THREE.Vector3(0, 0, 3);
    state.surface = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7, transparent: true, opacity: 0.23,
        side: THREE.DoubleSide, roughness: 0.3
      })
    );
    state.base = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({
        color: 0xd97706, transparent: true, opacity: 0.28, side: THREE.DoubleSide
      })
    );
    state.edges = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 2 })
    );
    state.arrowA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 5, 0x0284c7, 0.5, 0.28);
    state.arrowB = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 4, 0xe11d48, 0.5, 0.28);
    state.arrowC = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 3, 0xd97706, 0.5, 0.28);
    state.group.add(state.surface, state.base, state.edges, state.arrowA, state.arrowB, state.arrowC);
    this.updateShape(THREE, state);
  },

  updateShape(THREE, state) {
    const b = new THREE.Vector3(state.params.shear, 4, 0);
    const o = new THREE.Vector3(0, 0, 0);
    const a = state.a;
    const c = state.c;
    const ab = a.clone().add(b);
    const ac = a.clone().add(c);
    const bc = b.clone().add(c);
    const abc = a.clone().add(b).add(c);
    const vertices = [
      o, a, b, c, ab, ac, bc, abc
    ];
    const faces = [
      0, 1, 4, 0, 4, 2,
      0, 3, 5, 0, 5, 1,
      0, 2, 6, 0, 6, 3,
      7, 5, 3, 7, 3, 6,
      7, 6, 2, 7, 2, 4,
      7, 4, 1, 7, 1, 5
    ];
    const positions = [];
    vertices.forEach((v) => positions.push(v.x, v.y, v.z));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(faces);
    geometry.computeVertexNormals();
    state.surface.geometry.dispose();
    state.surface.geometry = geometry;
    const baseGeometry = new THREE.BufferGeometry();
    baseGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
      o.x, o.y, o.z, a.x, a.y, a.z, ab.x, ab.y, ab.z,
      o.x, o.y, o.z, ab.x, ab.y, ab.z, b.x, b.y, b.z
    ], 3));
    baseGeometry.computeVertexNormals();
    state.base.geometry.dispose();
    state.base.geometry = baseGeometry;

    const edgePairs = [
      [o, a], [o, b], [o, c], [a, ab], [a, ac],
      [b, ab], [b, bc], [c, ac], [c, bc],
      [ab, abc], [ac, abc], [bc, abc]
    ];
    const edgePositions = [];
    edgePairs.forEach(([p, q]) => edgePositions.push(p.x, p.y, p.z, q.x, q.y, q.z));
    state.edges.geometry.dispose();
    state.edges.geometry = new THREE.BufferGeometry().setAttribute(
      "position", new THREE.Float32BufferAttribute(edgePositions, 3)
    );
    state.arrowA.setDirection(a.clone().normalize());
    state.arrowA.setLength(a.length(), 0.5, 0.28);
    state.arrowB.setDirection(b.clone().normalize());
    state.arrowB.setLength(b.length(), 0.5, 0.28);
    state.arrowC.setDirection(c.clone().normalize());
    state.arrowC.setLength(c.length(), 0.5, 0.28);
    const volume = Math.abs(a.dot(new THREE.Vector3().crossVectors(b, c)));
    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      katex.render(
        `V=|\\boldsymbol a\\cdot(\\boldsymbol b\\times\\boldsymbol c)|=${volume.toFixed(1)}`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state) {
    this.updateShape(THREE, state);
  }
};
