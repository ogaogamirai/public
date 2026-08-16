// ==============================================================================
// 3D Commons Model Definition: Euler Spiral (オイラーの螺旋と複素正弦波)
// 明るく上品なライトテーマ最適化版 (完全修正版)
// ==============================================================================

export default {
  id: "euler-spiral",
  category: "math",
  categoryLabel: "📐 数学・複素関数",
  title: "複素正弦波とオイラーの螺旋",
  description: "複素平面上の回転 $e^{it}$ は、3次元空間では美しい螺旋（ヘリックス）です。見る角度によって「真円」や「サイン波」「コサイン波」へと姿を変えます。",
  formula: "e^{it} = \\cos(t) + i\\sin(t)",
  
  legend: [
    { color: "#d97706", label: "<strong>X 軸</strong>: 時間 / 空間 $t$" },
    { color: "#e11d48", label: "<strong>Y 軸</strong>: 実部 $\\text{Re} = \\cos(t)$" },
    { color: "#0284c7", label: "<strong>Z 軸</strong>: 虚部 $\\text{Im} = \\sin(t)$" }
  ],

  views: {
    "3d": { name: "🔄 3D 螺旋 (全貌)", pos: [14, 12, 18], target: [0, 0, 0], default: true },
    "circle": { name: "⭕ 正面：複素平面 (円)", pos: [-30, 0, 0], target: [0, 0, 0] },
    "sin": { name: "〰️ 横：虚部 (sin波)", pos: [0, 30, 0], target: [0, 0, 0] },
    "cos": { name: "🌊 上：実部 (cos波)", pos: [0, 0, 30], target: [0, 0, 0] }
  },

  parameters: {
    turns: { label: "周期数 (Turns)", min: 1, max: 6, step: 0.5, value: 3.5 },
    speed: { label: "位相速度", min: 0, max: 2, step: 0.1, value: 1.0 }
  },

  init(THREE, scene, state) {
    const LENGTH = 24;
    const RADIUS = 3.0;
    state.LENGTH = LENGTH;
    state.RADIUS = RADIUS;

    class HelixCurve extends THREE.Curve {
      getPoint(u) {
        const t = (u - 0.5) * LENGTH;
        const angle = (u - 0.5) * state.params.turns * Math.PI * 2;
        return new THREE.Vector3(t, Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS);
      }
    }
    state.HelixCurve = HelixCurve;

    // 1. Central Helix Tube
    const helixPath = new HelixCurve();
    state.helixPath = helixPath;
    const tubeGeo = new THREE.TubeGeometry(helixPath, 300, 0.14, 16, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.5
    });
    state.helixMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(state.helixMesh);

    // 2. Projections
    // Cos Line (Rose Pink on X-Y plane)
    state.cosGeo = new THREE.BufferGeometry();
    state.cosLine = new THREE.Line(state.cosGeo, new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 3, transparent: true, opacity: 0.85 }));
    scene.add(state.cosLine);

    // Sin Line (Sapphire Blue on X-Z plane)
    state.sinGeo = new THREE.BufferGeometry();
    state.sinLine = new THREE.Line(state.sinGeo, new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3, transparent: true, opacity: 0.85 }));
    scene.add(state.sinLine);

    // Complex Circle Line (Amber Gold on Y-Z plane)
    const circlePoints = [];
    for (let i = 0; i <= 100; i++) {
      const a = (i / 100) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3(-LENGTH / 2, Math.cos(a) * RADIUS, Math.sin(a) * RADIUS));
    }
    const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
    const circleLine = new THREE.Line(circleGeo, new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 3, transparent: true, opacity: 0.9 }));
    scene.add(circleLine);

    // Time Axis
    const axisPoints = [
      new THREE.Vector3(-LENGTH / 2 - 1, 0, 0),
      new THREE.Vector3(LENGTH / 2 + 1, 0, 0)
    ];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const axisMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.5, gapSize: 0.25 });
    const timeAxis = new THREE.Line(axisGeo, axisMat);
    timeAxis.computeLineDistances();
    scene.add(timeAxis);

    // Clean Grids for Light Background
    const gridXY = new THREE.GridHelper(LENGTH, 24, 0xcbd5e1, 0xe2e8f0);
    gridXY.position.set(0, 0, -RADIUS * 1.6);
    gridXY.rotation.x = Math.PI / 2;
    scene.add(gridXY);

    const gridXZ = new THREE.GridHelper(LENGTH, 24, 0xcbd5e1, 0xe2e8f0);
    gridXZ.position.set(0, -RADIUS * 1.6, 0);
    scene.add(gridXZ);

    // Traveling Photon / Phasor Dot
    state.dot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.8 }));
    scene.add(state.dot);

    // Phasor line from axis to point
    state.phasorGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    state.phasorLine = new THREE.Line(state.phasorGeo, new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 3 }));
    scene.add(state.phasorLine);

    // Projection Connecting Leader Lines
    state.leaderYGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    state.leaderZGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const leaderMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.3, gapSize: 0.2, transparent: true, opacity: 0.7 });
    state.leaderY = new THREE.Line(state.leaderYGeo, leaderMat);
    state.leaderZ = new THREE.Line(state.leaderZGeo, leaderMat);
    scene.add(state.leaderY);
    scene.add(state.leaderZ);

    // Shadow dots on projections
    state.shadowCosDot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe11d48 }));
    state.shadowSinDot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    state.circleDot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshBasicMaterial({ color: 0xd97706 }));
    scene.add(state.shadowCosDot);
    scene.add(state.shadowSinDot);
    scene.add(state.circleDot);

    this.updateCurve(THREE, state);
  },

  updateCurve(THREE, state) {
    const LENGTH = state.LENGTH;
    const RADIUS = state.RADIUS;
    state.helixPath = new state.HelixCurve();
    state.helixMesh.geometry.dispose();
    state.helixMesh.geometry = new THREE.TubeGeometry(state.helixPath, 300, 0.14, 16, false);

    const cosPoints = [];
    const sinPoints = [];
    for (let i = 0; i <= 300; i++) {
      const u = i / 300;
      const t = (u - 0.5) * LENGTH;
      const angle = (u - 0.5) * state.params.turns * Math.PI * 2;
      cosPoints.push(new THREE.Vector3(t, Math.cos(angle) * RADIUS, -RADIUS * 1.6));
      sinPoints.push(new THREE.Vector3(t, -RADIUS * 1.6, Math.sin(angle) * RADIUS));
    }
    state.cosGeo.setFromPoints(cosPoints);
    state.sinGeo.setFromPoints(sinPoints);
  },

  onParamChange(THREE, state, key, val) {
    if (key === "turns") {
      this.updateCurve(THREE, state);
    }
  },

  update(THREE, state, dt, time) {
    if (!state.helixPath) return;
    const speed = state.params.speed !== undefined ? state.params.speed : 1.0;
    state.animTime = (state.animTime || 0) + dt * 0.2 * speed;
    const u = (state.animTime % 1.0);
    const curPos = state.helixPath.getPoint(u);
    state.dot.position.copy(curPos);

    const axisPos = new THREE.Vector3(curPos.x, 0, 0);
    state.phasorGeo.setFromPoints([axisPos, curPos]);

    const projCos = new THREE.Vector3(curPos.x, curPos.y, -state.RADIUS * 1.6);
    const projSin = new THREE.Vector3(curPos.x, -state.RADIUS * 1.6, curPos.z);
    const projCircle = new THREE.Vector3(-state.LENGTH / 2, curPos.y, curPos.z);

    state.shadowCosDot.position.copy(projCos);
    state.shadowSinDot.position.copy(projSin);
    state.circleDot.position.copy(projCircle);

    state.leaderYGeo.setFromPoints([curPos, projCos]);
    state.leaderZGeo.setFromPoints([curPos, projSin]);
    state.leaderY.computeLineDistances();
    state.leaderZ.computeLineDistances();
  }
};
