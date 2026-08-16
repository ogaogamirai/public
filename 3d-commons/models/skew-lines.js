// 3D Commons: ねじれの位置

export default {
  id: "skew-lines",
  category: "math",
  categoryLabel: "📐 数C・空間図形",
  title: "ねじれの位置",
  description: "2本の直線が平行でも交わってもいないとき、それらはねじれの位置にあります。視点を回しても交点が現れないことを確認します。",
  formula: "L_1:(t,0,0),\\qquad L_2:(s\\cos\\phi,1,s\\sin\\phi+2)",
  legend: [
    { color: "#0284c7", label: "直線 $L_1$" },
    { color: "#e11d48", label: "直線 $L_2$" },
    { color: "#d97706", label: "2直線をつなぐ垂直線分" }
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
    state.group.add(state.line1, state.line2, state.connector);
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
  },

  onParamChange(THREE, state) {
    this.updateLines(THREE, state);
  }
};
