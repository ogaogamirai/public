// 3D Commons: 立方体の平面切断

export default {
  id: "cube-plane-cut",
  category: "math",
  categoryLabel: "📐 数C・空間図形",
  title: "立方体の平面切断",
  description: "立方体を平面で切ると、切断面に多角形が現れます。水平面を垂直方向へ起こす角度 θ を0°から80°まで動かし、切断面の向きと位置関係を確認します。",
  formula: "y=h+z\\tan\\theta\\quad(0^\\circ\\leq\\theta<90^\\circ)",
  legend: [
    { color: "#0284c7", label: "立方体" },
    { color: "#e11d48", label: "切断面" },
    { color: "#d97706", label: "立方体の辺" }
  ],
  views: {
    solid: { name: "🔄 全体", pos: [12, 10, 15], target: [0, 1.5, 0], default: true },
    front: { name: "正面", pos: [0, 4, 20], target: [0, 1.5, 0] },
    top: { name: "上面", pos: [0, 20, 0], target: [0, 1.5, 0] }
  },
  parameters: {
    height: { label: "平面の高さ h", min: -1, max: 5, step: 0.1, value: 2 },
    angle: { label: "垂直方向への傾き θ", min: 0, max: 80, step: 5, value: 45 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.cube = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7, transparent: true, opacity: 0.18,
        side: THREE.DoubleSide, roughness: 0.3
      })
    );
    state.cube.position.y = 1.5;
    state.group.add(state.cube);
    state.edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(state.cube.geometry),
      new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2 })
    );
    state.edges.position.copy(state.cube.position);
    state.group.add(state.edges);
    state.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.MeshBasicMaterial({
        color: 0xe11d48, transparent: true, opacity: 0.28,
        side: THREE.DoubleSide, depthWrite: false
      })
    );
    state.plane.rotation.x = Math.PI / 2;
    state.group.add(state.plane);
    state.planeEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(state.plane.geometry),
      new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 2 })
    );
    state.group.add(state.planeEdge);
    state.horizontalGuide = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 3 })
    );
    state.angleGuide = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 3 })
    );
    state.group.add(state.horizontalGuide);
    state.group.add(state.angleGuide);
    this.updatePlane(THREE, state);
  },

  updatePlane(THREE, state) {
    const theta = state.params.angle * Math.PI / 180;
    const y = state.params.height;
    state.plane.position.set(0, y, 0);
    // PlaneGeometry starts in the XY plane. Rotate it to horizontal first,
    // then tilt around the x-axis so the slope is visibly vertical (y-z).
    state.plane.rotation.set(Math.PI / 2 - theta, 0, 0);
    state.planeEdge.position.copy(state.plane.position);
    state.planeEdge.rotation.copy(state.plane.rotation);
    const guideOrigin = new THREE.Vector3(-4.2, y, -3.2);
    state.horizontalGuide.geometry.setFromPoints([
      guideOrigin, new THREE.Vector3(-4.2, y, 0.2)
    ]);
    state.angleGuide.geometry.setFromPoints([
      guideOrigin,
      new THREE.Vector3(
        -4.2,
        y + 3.4 * Math.sin(theta),
        guideOrigin.z + 3.4 * Math.cos(theta)
      )
    ]);
  },

  onParamChange(THREE, state) {
    this.updatePlane(THREE, state);
  }
};
