// 3D Commons: 内積と正射影

export default {
  id: "dot-projection",
  category: "math",
  categoryLabel: "📐 数B・ベクトル",
  title: "内積と正射影",
  description: "ベクトル a をベクトル b の向きに正射影すると、内積が「どれだけ同じ方向を向いているか」を表す長さとして見えてきます。",
  formula: "\\operatorname{proj}_{\\boldsymbol b}\\boldsymbol a=\\frac{\\boldsymbol a\\cdot\\boldsymbol b}{|\\boldsymbol b|^2}\\boldsymbol b",
  legend: [
    { color: "#0284c7", label: "ベクトル $\\boldsymbol a$" },
    { color: "#e11d48", label: "ベクトル $\\boldsymbol b$" },
    { color: "#d97706", label: "$\\boldsymbol a$ の正射影" },
    { color: "#94a3b8", label: "$x$ 軸（横）・$y$ 軸（縦）" }
  ],
  views: {
    front: { name: "📐 xy平面（角度を見る）", pos: [0, 0, 22], target: [2, 2, 0], default: true },
    overview: { name: "🔄 全体", pos: [10, 9, 15], target: [2, 2, 0] },
    top: { name: "上から", pos: [0, 22, 0], target: [2, 2, 0] }
  },
  parameters: {
    angle: { label: "2本のベクトルの角度", min: 0, max: 180, step: 5, value: 45 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.origin = new THREE.Vector3(0, 0, 0);
    state.aLength = 6;
    state.bLength = 6;
    state.arrowA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), state.origin, 6, 0x0284c7, 0.55, 0.3);
    state.arrowB = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), state.origin, 6, 0xe11d48, 0.55, 0.3);
    state.arrowProjection = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), state.origin, 1, 0xd97706, 0.45, 0.25);
    state.axisX = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2, 0, 0), new THREE.Vector3(8, 0, 0)
      ]),
      new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.35, gapSize: 0.2 })
    );
    state.axisY = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, 8, 0)
      ]),
      new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.35, gapSize: 0.2 })
    );
    state.axisX.computeLineDistances();
    state.axisY.computeLineDistances();
    state.group.add(state.axisX, state.axisY, state.arrowA, state.arrowB, state.arrowProjection);
    state.dropLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.22, gapSize: 0.16 })
    );
    state.arc = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2 })
    );
    state.group.add(state.dropLine, state.arc);
    this.updateProjection(THREE, state);
  },

  updateProjection(THREE, state) {
    const theta = state.params.angle * Math.PI / 180;
    const a = new THREE.Vector3(state.aLength, 0, 0);
    const bDirection = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0).normalize();
    const b = bDirection.clone().multiplyScalar(state.bLength);
    const projectionLength = a.dot(bDirection);
    const projection = bDirection.clone().multiplyScalar(projectionLength);
    state.arrowA.setDirection(a.clone().normalize());
    state.arrowB.setDirection(bDirection);
    state.arrowProjection.setDirection(projectionLength >= 0 ? bDirection : bDirection.clone().multiplyScalar(-1));
    state.arrowProjection.setLength(Math.abs(projectionLength), 0.45, 0.25);
    state.dropLine.geometry.setFromPoints([a, projection]);
    state.dropLine.computeLineDistances();
    const arcPoints = [];
    const arcRadius = 1.6;
    for (let i = 0; i <= 24; i++) {
      const t = theta * (i / 24);
      arcPoints.push(new THREE.Vector3(arcRadius * Math.cos(t), arcRadius * Math.sin(t), 0));
    }
    state.arc.geometry.setFromPoints(arcPoints);
    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      katex.render(
        `\\theta=${state.params.angle}^\\circ\\quad\\boldsymbol a\\cdot\\boldsymbol b=${(state.bLength * projectionLength).toFixed(2)}\\quad\\text{正射影の長さ}=${Math.abs(projectionLength).toFixed(2)}`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state) {
    this.updateProjection(THREE, state);
  }
};
