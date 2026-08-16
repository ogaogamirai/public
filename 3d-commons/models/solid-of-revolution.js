// 3D Commons: 回転体（放物線を回してできる回転体）

export default {
  id: "solid-of-revolution",
  category: "math",
  categoryLabel: "📐 数III・積分と回転体",
  title: "回転体",
  description: "平面の曲線 $y=x^2$ を $y$ 軸のまわりに回すと、立体が生まれます。スライダーで回す範囲を変え、曲線・断面・立体の対応を観察します。",
  formula: "V=2\\pi\\int_0^R x\\cdot x^2\\,dx",
  legend: [
    { color: "#0284c7", label: "回転してできた立体" },
    { color: "#e11d48", label: "母線 $y=x^2$" },
    { color: "#d97706", label: "回転軸 $y$" },
    { color: "#16a34a", label: "断面（半径 $x$ の円）" }
  ],
  views: {
    solid: { name: "🔄 立体", pos: [13, 11, 16], target: [0, 4, 0], default: true },
    profile: { name: "📐 母線を見る", pos: [13, 6, 0], target: [0, 4, 0] },
    top: { name: "⭕ 上から", pos: [0, 20, 0], target: [0, 4, 0] }
  },
  parameters: {
    radius: { label: "回す範囲 R", min: 1, max: 4, step: 0.1, value: 3 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);
    state.surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      roughness: 0.28,
      metalness: 0.08
    });
    state.profileMaterial = new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 3 });
    state.axisMaterial = new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.4, gapSize: 0.25 });
    state.surface = new THREE.Mesh(new THREE.BufferGeometry(), state.surfaceMaterial);
    state.group.add(state.surface);
    state.profile = new THREE.Line(new THREE.BufferGeometry(), state.profileMaterial);
    state.group.add(state.profile);
    state.crossSection = new THREE.Mesh(
      new THREE.CircleGeometry(1, 64),
      new THREE.MeshBasicMaterial({
        color: 0x16a34a, transparent: true, opacity: 0.32, side: THREE.DoubleSide
      })
    );
    state.crossSection.rotation.x = Math.PI / 2;
    state.group.add(state.crossSection);
    state.crossSectionEdge = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x16a34a })
    );
    state.group.add(state.crossSectionEdge);
    state.crossRadius = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0x16a34a, dashSize: 0.25, gapSize: 0.18 })
    );
    state.group.add(state.crossRadius);
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 18, 0)
    ]);
    state.axis = new THREE.Line(axisGeo, state.axisMaterial);
    state.axis.computeLineDistances();
    scene.add(state.axis);
    this.updateSolid(THREE, state);
  },

  updateSolid(THREE, state) {
    const R = state.params.radius;
    const radial = 64;
    const steps = 36;
    const vertices = [];
    const indices = [];
    for (let j = 0; j <= steps; j++) {
      const x = (j / steps) * R;
      const y = x * x;
      for (let i = 0; i <= radial; i++) {
        const angle = (i / radial) * Math.PI * 2;
        vertices.push(x * Math.cos(angle), y, x * Math.sin(angle));
      }
    }
    for (let j = 0; j < steps; j++) {
      for (let i = 0; i < radial; i++) {
        const row = radial + 1;
        const a = j * row + i;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    state.surface.geometry.dispose();
    state.surface.geometry = geometry;

    const profilePoints = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * R;
      profilePoints.push(new THREE.Vector3(x, x * x, 0));
    }
    state.profile.geometry.setFromPoints(profilePoints);

    const sliceX = R * 0.65;
    const sliceY = sliceX * sliceX;
    state.crossSection.scale.set(sliceX, sliceX, 1);
    state.crossSection.position.set(0, sliceY, 0);
    const circlePoints = [];
    for (let i = 0; i <= radial; i++) {
      const angle = (i / radial) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3(sliceX * Math.cos(angle), sliceY, sliceX * Math.sin(angle)));
    }
    state.crossSectionEdge.geometry.setFromPoints(circlePoints);
    state.crossRadius.geometry.setFromPoints([
      new THREE.Vector3(0, sliceY, 0),
      new THREE.Vector3(sliceX, sliceY, 0)
    ]);
    state.crossRadius.computeLineDistances();

    const volume = Math.PI * Math.pow(R, 4) / 2;
    const shellAtSlice = 2 * Math.PI * sliceX * sliceX * sliceX;
    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      katex.render(
        `V=2\\pi\\int_0^R x^3\\,dx=${volume.toFixed(2)}\\quad(R=${R.toFixed(1)},\\;x=${sliceX.toFixed(1)}\\Rightarrow 2\\pi x^3=${shellAtSlice.toFixed(1)})`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state) {
    this.updateSolid(THREE, state);
  }
};
