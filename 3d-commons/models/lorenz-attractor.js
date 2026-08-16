// ==============================================================================
// 3D Commons Model Definition: Lorenz Attractor (ローレンツ・カオス軌道)
// ==============================================================================

export default {
  id: "lorenz-attractor",
  category: "physics",
  categoryLabel: "⚛️ 物理・カオス",
  title: "ローレンツ・アトラクター（決定論的カオス）",
  description: "大気対流の簡約モデルから発見された「カオスの蝶」。初期値のわずかな違いが未来の予測不能性を生み出します（バタフライ効果）。",
  formula: "\\begin{cases} \\dot{x} = \\sigma (y - x) \\\\ \\dot{y} = x (\\rho - z) - y \\\\ \\dot{z} = xy - \\beta z \\end{cases}",
  
  legend: [
    { color: "#38bdf8", label: "<strong>軌道 1</strong>: 初期値 $(0.1, 0, 0)$" },
    { color: "#f43f5e", label: "<strong>軌道 2</strong>: 初期値 $(0.1001, 0, 0)$（わずかな差）" }
  ],

  views: {
    "3d": { name: "🔄 3D 斜め (全体)", pos: [55, 30, 65], target: [0, 0, 25], default: true },
    "side": { name: "🦋 正面 (蝶の羽)", pos: [0, -85, 25], target: [0, 0, 25] },
    "top": { name: "🌀 上から (渦)", pos: [0, 0, 95], target: [0, 0, 25] }
  },

  parameters: {
    rho: { label: "レイリー数 (ρ)", min: 10, max: 40, step: 1, value: 28 },
    sigma: { label: "プラントル数 (σ)", min: 5, max: 20, step: 0.5, value: 10 },
    beta: { label: "幾何パラメータ (β)", min: 1, max: 4, step: 0.1, value: 2.66 }
  },

  init(THREE, scene, state) {
    state.MAX_POINTS = 3000;
    
    // Trajectory 1
    state.points1 = [];
    state.geo1 = new THREE.BufferGeometry();
    const pos1 = new Float32Array(state.MAX_POINTS * 3);
    state.geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    state.line1 = new THREE.Line(state.geo1, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2, transparent: true, opacity: 0.85 }));
    scene.add(state.line1);

    // Trajectory 2 (Slightly perturbed)
    state.points2 = [];
    state.geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(state.MAX_POINTS * 3);
    state.geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    state.line2 = new THREE.Line(state.geo2, new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2, transparent: true, opacity: 0.85 }));
    scene.add(state.line2);

    // Leader heads (Spheres)
    state.head1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    state.head2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    scene.add(state.head1);
    scene.add(state.head2);

    // Reset simulation state
    this.resetSimulation(state);
  },

  resetSimulation(state) {
    state.p1 = { x: 0.1, y: 0.0, z: 0.0 };
    state.p2 = { x: 0.1001, y: 0.0, z: 0.0 };
    state.points1 = [];
    state.points2 = [];
  },

  onParamChange(THREE, state, key, val) {
    this.resetSimulation(state);
  },

  update(THREE, state, dt, time) {
    const sigma = state.params.sigma || 10;
    const rho = state.params.rho || 28;
    const beta = state.params.beta || 8 / 3;
    const h = 0.01; // Step size

    // Run multiple sub-steps for smooth trajectory
    for (let step = 0; step < 4; step++) {
      // RK4 or Euler for p1
      const dx1 = sigma * (state.p1.y - state.p1.x);
      const dy1 = state.p1.x * (rho - state.p1.z) - state.p1.y;
      const dz1 = state.p1.x * state.p1.y - beta * state.p1.z;
      state.p1.x += dx1 * h;
      state.p1.y += dy1 * h;
      state.p1.z += dz1 * h;

      // for p2
      const dx2 = sigma * (state.p2.y - state.p2.x);
      const dy2 = state.p2.x * (rho - state.p2.z) - state.p2.y;
      const dz2 = state.p2.x * state.p2.y - beta * state.p2.z;
      state.p2.x += dx2 * h;
      state.p2.y += dy2 * h;
      state.p2.z += dz2 * h;

      state.points1.push(state.p1.x, state.p1.y, state.p1.z);
      state.points2.push(state.p2.x, state.p2.y, state.p2.z);

      if (state.points1.length > state.MAX_POINTS * 3) {
        state.points1.splice(0, 3);
        state.points2.splice(0, 3);
      }
    }

    // Update geometry buffers
    const arr1 = state.geo1.attributes.position.array;
    const arr2 = state.geo2.attributes.position.array;
    for (let i = 0; i < state.points1.length; i++) {
      arr1[i] = state.points1[i];
      arr2[i] = state.points2[i];
    }
    state.geo1.setDrawRange(0, state.points1.length / 3);
    state.geo2.setDrawRange(0, state.points2.length / 3);
    state.geo1.attributes.position.needsUpdate = true;
    state.geo2.attributes.position.needsUpdate = true;

    state.head1.position.set(state.p1.x, state.p1.y, state.p1.z);
    state.head2.position.set(state.p2.x, state.p2.y, state.p2.z);
  }
};
