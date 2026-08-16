// 3D Commons: 平面と法線ベクトル

export default {
  id: "plane-normal-vector",
  category: "math",
  categoryLabel: "📐 数C・空間ベクトル",
  title: "平面と法線ベクトル",
  description: "平面に垂直なベクトルを法線ベクトルといいます。平面の傾きを変えても、法線は常に平面と直角を保ちます。",
  formula: "\\boldsymbol{n}\\cdot(\\boldsymbol{r}-\\boldsymbol{r_0})=0",
  legend: [
    { color: "#0284c7", label: "平面" },
    { color: "#e11d48", label: "法線ベクトル $\\boldsymbol{n}$" },
    { color: "#d97706", label: "基準点 $\\boldsymbol{r_0}$" }
  ],
  views: {
    solid: { name: "🔄 斜めから", pos: [13, 11, 16], target: [0, 1, 0], default: true },
    front: { name: "正面", pos: [0, 5, 20], target: [0, 1, 0] },
    top: { name: "上から", pos: [0, 20, 0], target: [0, 1, 0] }
  },
  parameters: {
    tilt: { label: "平面の傾き（度）", min: -70, max: 70, step: 1, value: 30 },
    height: { label: "平面の高さ", min: -3, max: 5, step: 0.1, value: 1 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7, transparent: true, opacity: 0.28,
        side: THREE.DoubleSide, roughness: 0.35
      })
    );
    state.plane.rotation.x = -Math.PI / 2;
    state.group.add(state.plane);
    state.planeEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(state.plane.geometry),
      new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.55 })
    );
    state.group.add(state.planeEdge);
    state.point = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xd97706 })
    );
    state.group.add(state.point);
    state.normal = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), 4, 0xe11d48, 0.55, 0.3
    );
    state.group.add(state.normal);
    this.updatePlane(THREE, state);
  },

  updatePlane(THREE, state) {
    const theta = state.params.tilt * Math.PI / 180;
    const point = new THREE.Vector3(0, state.params.height, 0);
    const normal = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta)).normalize();
    state.plane.position.copy(point);
    state.plane.rotation.x = -Math.PI / 2 + theta;
    state.planeEdge.position.copy(point);
    state.planeEdge.rotation.copy(state.plane.rotation);
    state.point.position.copy(point);
    state.normal.position.copy(point);
    state.normal.setDirection(normal);
  },

  onParamChange(THREE, state) {
    this.updatePlane(THREE, state);
  }
};
