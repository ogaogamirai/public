// 3D Commons: 円錐の切り口（円・楕円・放物線・双曲線）

function classify(angle) {
  if (angle < 40) return "楕円（0°では円）";
  if (angle < 50) return "放物線";
  return "双曲線";
}

export default {
  id: "cone-sections",
  category: "math",
  categoryLabel: "📐 数C・空間図形",
  title: "円錐の切り口",
  description: "円錐を平面で切る角度を変えると、円・楕円・放物線・双曲線が現れます。円錐の半頂角を45°に固定し、切断面の角度を動かして分類の境界を観察します。",
  formula: "x^2+z^2=y^2,\\qquad y=h+x\\tan\\theta",

  legend: [
    { color: "#0284c7", label: "円錐" },
    { color: "#e11d48", label: "切断面と交線" },
    { color: "#d97706", label: "円錐の半頂角 45°" }
  ],

  views: {
    overview: { name: "🔄 全体", pos: [18, 13, 22], target: [0, 1.5, 0], default: true },
    front: { name: "📐 正面", pos: [0, 7, 26], target: [0, 1.5, 0] },
    cut: { name: "⭕ 切断面", pos: [14, 9, 14], target: [0, 2.5, 0] }
  },

  parameters: {
    angle: { label: "切断角 θ（度）", min: 0, max: 75, step: 1, value: 30 }
  },

  init(THREE, scene, state) {
    state.coneHeight = 10;
    state.coneRadius = 10;
    state.cutHeight = 3;

    state.group = new THREE.Group();
    scene.add(state.group);

    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      roughness: 0.35,
      metalness: 0.05
    });
    const coneEdgeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.24
    });

    state.upperCone = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 64, 1, true),
      coneMaterial
    );
    state.upperCone.position.y = state.coneHeight / 2;
    state.group.add(state.upperCone);

    state.lowerCone = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 64, 1, true),
      coneMaterial
    );
    state.lowerCone.rotation.z = Math.PI;
    state.lowerCone.position.y = -state.coneHeight / 2;
    state.group.add(state.lowerCone);

    state.upperEdges = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 32, 1, true),
      coneEdgeMaterial
    );
    state.upperEdges.position.y = state.coneHeight / 2;
    state.group.add(state.upperEdges);

    state.lowerEdges = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 32, 1, true),
      coneEdgeMaterial
    );
    state.lowerEdges.rotation.z = Math.PI;
    state.lowerEdges.position.y = -state.coneHeight / 2;
    state.group.add(state.lowerEdges);

    const axisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -11, 0),
      new THREE.Vector3(0, 11, 0)
    ]);
    state.axis = new THREE.Line(
      axisGeometry,
      new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.45, gapSize: 0.25 })
    );
    state.axis.computeLineDistances();
    scene.add(state.axis);

    state.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(17, 17),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    state.plane.position.y = state.cutHeight;
    state.plane.rotation.x = Math.PI / 2;
    scene.add(state.plane);

    state.planeEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(state.plane.geometry),
      new THREE.LineBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.6 })
    );
    state.planeEdge.position.copy(state.plane.position);
    state.planeEdge.rotation.copy(state.plane.rotation);
    scene.add(state.planeEdge);

    state.curve = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 3 })
    );
    scene.add(state.curve);

    state.cutDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe11d48 })
    );
    scene.add(state.cutDot);

    this.updateCut(THREE, state);
  },

  updateCut(THREE, state) {
    const angle = state.params.angle;
    const theta = angle * Math.PI / 180;
    const slope = Math.tan(theta);
    const h = state.cutHeight;
    const points = [];
    const samples = 500;
    let minDistance = Infinity;
    let nearest = new THREE.Vector3();

    // On the cone x²+z²=y² and the plane y=h+x tan(theta):
    // z²=(h+x tan(theta))²-x².
    for (let branch = 0; branch < 2; branch++) {
      let branchStarted = false;
      for (let i = 0; i <= samples; i++) {
        const x = -12 + (i / samples) * 24;
        const y = h + slope * x;
        const zSquared = y * y - x * x;
        const valid = zSquared >= 0 && Math.abs(y) <= state.coneHeight;
        if (!valid) {
          if (branchStarted) points.push(null);
          branchStarted = false;
          continue;
        }
        const z = (branch === 0 ? 1 : -1) * Math.sqrt(zSquared);
        const point = new THREE.Vector3(x, y, z);
        points.push(point);
        branchStarted = true;
        const distance = point.length();
        if (distance < minDistance) {
          minDistance = distance;
          nearest = point;
        }
      }
    }

    const geometries = [];
    let current = [];
    for (const point of points) {
      if (point) current.push(point);
      else if (current.length > 1) {
        geometries.push(current);
        current = [];
      }
    }
    if (current.length > 1) geometries.push(current);

    // A Line cannot contain disconnected branches, so join each branch with
    // a transparent gap encoded by separate line objects.
    if (!state.curveParts) state.curveParts = [];
    while (state.curveParts.length < geometries.length) {
      const part = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 3 })
      );
      state.group.add(part);
      state.curveParts.push(part);
    }
    state.curveParts.forEach((part, index) => {
      part.visible = Boolean(geometries[index]);
      if (geometries[index]) {
        part.geometry.setFromPoints(geometries[index]);
      }
    });
    state.curve.visible = false;

    // Match the analytic plane y = h + x tan(theta) used by the curve.
    state.plane.rotation.set(Math.PI / 2, 0, theta);
    state.planeEdge.rotation.copy(state.plane.rotation);
    state.cutDot.position.copy(nearest);
    state.currentType = classify(angle);
    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      katex.render(
        `\\theta=${angle}^\\circ\\quad\\text{分類：${state.currentType}}`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state) {
    this.updateCut(THREE, state);
  },

  update(_THREE, state) {
    // Geometry is intentionally static between slider changes.
    state.planeEdge.rotation.copy(state.plane.rotation);
  }
};
