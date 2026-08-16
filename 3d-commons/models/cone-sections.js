// 3D Commons: 円錐の切り口（円・楕円・放物線・双曲線）

function classify(angle) {
  const boundary = 45;
  const tolerance = 0.5;
  if (angle < boundary - tolerance) return "楕円（0°では円）";
  if (Math.abs(angle - boundary) <= tolerance) return "放物線";
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
    // ConeGeometry's apex is on local +y. Flip the upper cone so its
    // apex is at y=0 and its base is at y=coneHeight.
    state.upperCone.rotation.z = Math.PI;
    state.upperCone.position.y = state.coneHeight / 2;
    state.group.add(state.upperCone);

    state.lowerCone = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 64, 1, true),
      coneMaterial
    );
    state.lowerCone.position.y = -state.coneHeight / 2;
    state.group.add(state.lowerCone);

    state.upperEdges = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 32, 1, true),
      coneEdgeMaterial
    );
    state.upperEdges.rotation.z = Math.PI;
    state.upperEdges.position.y = state.coneHeight / 2;
    state.group.add(state.upperEdges);

    state.lowerEdges = new THREE.Mesh(
      new THREE.ConeGeometry(state.coneRadius, state.coneHeight, 32, 1, true),
      coneEdgeMaterial
    );
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
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    scene.add(state.plane);

    state.planeEdge = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.6 })
    );
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
    const branchSegments = [[], []];
    const branchPoints = [[], []];
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
          if (branchStarted) {
            const segment = branchPoints[branch];
            if (segment.length > 1) branchSegments[branch].push(segment);
            branchPoints[branch] = [];
          }
          branchStarted = false;
          continue;
        }
        const z = (branch === 0 ? 1 : -1) * Math.sqrt(zSquared);
        const point = new THREE.Vector3(x, y, z);
        branchPoints[branch].push(point);
        branchStarted = true;
        const distance = point.length();
        if (distance < minDistance) {
          minDistance = distance;
          nearest = point;
        }
      }
      if (branchPoints[branch].length > 1) {
        branchSegments[branch].push(branchPoints[branch]);
      }
      branchPoints[branch] = [];
    }

    // For an ellipse, the two z branches are the two halves of one closed
    // curve. Join them in reverse order so the line follows the perimeter
    // instead of drawing two disconnected arcs.
    const geometries = [];
    const curveType = classify(angle);
    if (
      curveType.startsWith("楕円") &&
      branchSegments[0].length === 1 &&
      branchSegments[1].length === 1
    ) {
      const loop = [
        ...branchSegments[0][0],
        ...branchSegments[1][0].slice().reverse()
      ];
      loop.push(loop[0].clone());
      geometries.push(loop);
    } else {
      for (const segments of branchSegments) {
        geometries.push(...segments);
      }
    }

    // A Line cannot contain disconnected branches, so keep each branch in a
    // separate line object. The ellipse is closed explicitly above.
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

    // Build the cutting plane directly from y = h + x tan(theta).
    // This removes any ambiguity from Euler rotation order.
    // The curve can reach radius 10 at the cone base. Keep the plane large
    // enough that the red intersection never visually leaves the amber plane.
    const half = 11;
    const planeVertices = [
      -half, h - slope * half, -half,
       half, h + slope * half, -half,
       half, h + slope * half,  half,
      -half, h - slope * half,  half
    ];
    const planeGeometry = new THREE.BufferGeometry();
    planeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(planeVertices, 3));
    planeGeometry.setIndex([0, 1, 2, 0, 2, 3]);
    planeGeometry.computeVertexNormals();
    state.plane.geometry.dispose();
    state.plane.geometry = planeGeometry;
    state.planeEdge.geometry.dispose();
    state.planeEdge.geometry = new THREE.EdgesGeometry(planeGeometry);
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
