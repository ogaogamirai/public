// 3D Commons: ねじれの位置

export default {
  id: "skew-lines",
  category: "math",
  categoryLabel: "📐 数C・空間図形",
  title: "ねじれの位置",
  description: "2本の直線が平行でも同一平面上で交わってもいないとき、ねじれの位置にあります。$L_1$ は平面 $y=0$ 上、$L_2$ は平面 $y=1$ 上にあり、方向ベクトル $\\boldsymbol d_1=(1,0,0)$ と $\\boldsymbol d_2=(\\cos\\phi,0,\\sin\\phi)$ は平行ではないので交点はありません。オレンジの公垂線 $\\overline{PQ}$ は両直線に垂直で、$y$ 方向の差 $|PQ|=1$ が最短距離です（$z$ の $+2$ は $L_2$ の位置をずらすだけで距離には影響しません）。",
  formula: "L_1:(t,0,0),\\ \\boldsymbol d_1=(1,0,0);\\quad L_2:(s\\cos\\phi,1,s\\sin\\phi+2),\\ \\boldsymbol d_2=(\\cos\\phi,0,\\sin\\phi)",
  legend: [
    { color: "#0284c7", label: "直線 $L_1$（$y=0$ 上）" },
    { color: "#e11d48", label: "直線 $L_2$（$y=1$ 上）" },
    { color: "#d97706", label: "公垂線 $\\overline{PQ}$（最短距離 $=1$）" },
    { color: "#16a34a", label: "公垂線の足 $P\\in L_1,\\ Q\\in L_2$" }
  ],
  views: {
    overview: { name: "🔄 全体", pos: [13, 9, 16], target: [0, 0.5, 1], default: true },
    front: { name: "正面", pos: [0, 4, 22], target: [0, 0.5, 1] },
    side: { name: "横から", pos: [22, 4, 0], target: [0, 0.5, 1] }
  },
  parameters: {
    angle: { label: "直線 L₂ の向き φ", min: 15, max: 75, step: 5, value: 45 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.line1 = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 4 })
    );
    state.line2 = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 4 })
    );
    state.connector = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.25, gapSize: 0.18 })
    );
    state.arrow1 = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 3, 0x0284c7, 0.45, 0.25
    );
    state.arrow2 = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 2), 3, 0xe11d48, 0.45, 0.25
    );
    const footMat = new THREE.MeshBasicMaterial({ color: 0x16a34a });
    state.footP = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), footMat);
    state.footQ = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), footMat.clone());
    state.group.add(state.line1, state.line2, state.connector, state.arrow1, state.arrow2, state.footP, state.footQ);
    this.updateLines(THREE, state);
  },

  updateLines(THREE, state) {
    const phi = state.params.angle * Math.PI / 180;
    const d = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi)).normalize();
    const p1 = new THREE.Vector3(-8, 0, 0);
    const p2 = new THREE.Vector3(8, 0, 0);
    const q1 = new THREE.Vector3(-6 * d.x, 1, 2 - 6 * d.z);
    const q2 = new THREE.Vector3(6 * d.x, 1, 2 + 6 * d.z);
    state.line1.geometry.setFromPoints([p1, p2]);
    state.line2.geometry.setFromPoints([q1, q2]);
    const x = -2 / Math.tan(phi);
    const closestOnL2 = new THREE.Vector3(x, 1, 0);
    const closestOnL1 = new THREE.Vector3(x, 0, 0);
    state.connector.geometry.setFromPoints([closestOnL1, closestOnL2]);
    state.connector.computeLineDistances();
    state.footP.position.copy(closestOnL1);
    state.footQ.position.copy(closestOnL2);
    state.arrow1.position.set(0, 0, 0);
    state.arrow1.setDirection(new THREE.Vector3(1, 0, 0));
    state.arrow2.position.set(0, 1, 2);
    state.arrow2.setDirection(d);
    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      const deg = state.params.angle;
      const xFoot = (-2 / Math.tan(phi)).toFixed(2);
      katex.render(
        `\\phi=${deg}^\\circ,\\ P(${xFoot},0,0),\\ Q(${xFoot},1,0),\\ |\\overrightarrow{PQ}|=1\\ (\\boldsymbol d_1\\perp\\overrightarrow{PQ}\\perp\\boldsymbol d_2)`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state) {
    this.updateLines(THREE, state);
  }
};
