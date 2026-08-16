// ==============================================================================
// 3D Commons Model Definition: Lorenz Attractor (ローレンツ・カオス軌道)
// 明るく上品なライトテーマ最適化版 (RK4 高精度数値解析)
// ==============================================================================

export default {
  id: "lorenz-attractor",
  category: "physics",
  categoryLabel: "⚛️ 物理・カオス理論",
  title: "ローレンツ・アトラクター（決定論的カオス）",
  description: "大気対流の微分方程式から現れる「カオスの蝶」。初期値のわずかな差（0.0001）が時間とともに全く異なる軌道を描くバタフライ効果の真実。",
  formula: "\\begin{cases} \\dot{x} = \\sigma (y - x) \\\\ \\dot{y} = x (\\rho - z) - y \\\\ \\dot{z} = xy - \\beta z \\end{cases}",
  
  legend: [
    { color: "#0284c7", label: "<strong>軌道 1</strong>: 初期値 $(0.1, 0, 0)$" },
    { color: "#e11d48", label: "<strong>軌道 2</strong>: 初期値 $(0.1001, 0, 0)$（わずか $10^{-4}$ の差）" }
  ],

  views: {
    "3d": { name: "🔄 3D 斜め (全体)", pos: [55, 30, 65], target: [0, 0, 25], default: true },
    "side": { name: "🦋 正面 (蝶の羽)", pos: [0, -85, 25], target: [0, 0, 25] },
    "top": { name: "🌀 上から (渦)", pos: [0, 0, 95], target: [0, 0, 25] }
  },

  parameters: {
    rho: { label: "レイリー数 (ρ)", min: 10, max: 40, step: 1, value: 28 },
    sigma: { label: "プラントル数 (σ)", min: 5, max: 20, step: 0.5, value: 10 },
    beta: { label: "幾何パラメータ (β)", min: 1, max: 4, step: 0.01, value: 8 / 3 }
  },

  init(THREE, scene, state) {
    state.MAX_POINTS = 3500;
    
    // Faint Reference Grid at bottom
    const baseGrid = new THREE.GridHelper(80, 20, 0xcbd5e1, 0xe2e8f0);
    baseGrid.position.set(0, 0, 0);
    scene.add(baseGrid);

    // Trajectory 1 (Sapphire Blue)
    state.points1 = [];
    state.geo1 = new THREE.BufferGeometry();
    const pos1 = new Float32Array(state.MAX_POINTS * 3);
    state.geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
    state.line1 = new THREE.Line(state.geo1, new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2, transparent: true, opacity: 0.85 }));
    scene.add(state.line1);

    // Trajectory 2 (Rose Red)
    state.points2 = [];
    state.geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(state.MAX_POINTS * 3);
    state.geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    state.line2 = new THREE.Line(state.geo2, new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 2, transparent: true, opacity: 0.85 }));
    scene.add(state.line2);

    // Leader Heads
    state.head1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 }));
    state.head2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.2 }));
    scene.add(state.head1);
    scene.add(state.head2);

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

  // 4th Order Runge-Kutta (RK4) Integrator
  rk4Step(p, sigma, rho, beta, h) {
    const f = (x, y, z) => ({
      dx: sigma * (y - x),
      dy: x * (rho - z) - y,
      dz: x * y - beta * z
    });

    const k1 = f(p.x, p.y, p.z);
    const k2 = f(p.x + 0.5 * h * k1.dx, p.y + 0.5 * h * k1.dy, p.z + 0.5 * h * k1.dz);
    const k3 = f(p.x + 0.5 * h * k2.dx, p.y + 0.5 * h * k2.dy, p.z + 0.5 * h * k2.dz);
    const k4 = f(p.x + h * k3.dx, p.y + h * k3.dy, p.z + h * k3.dz);

    p.x += (h / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
    p.y += (h / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy);
    p.z += (h / 6) * (k1.dz + 2 * k2.dz + 2 * k3.dz + k4.dz);
  },

  update(THREE, state, dt, time) {
    const sigma = state.params.sigma || 10;
    const rho = state.params.rho || 28;
    const beta = state.params.beta || (8 / 3);
    const h = 0.01;

    for (let step = 0; step < 4; step++) {
      this.rk4Step(state.p1, sigma, rho, beta, h);
      this.rk4Step(state.p2, sigma, rho, beta, h);

      state.points1.push(state.p1.x, state.p1.y, state.p1.z);
      state.points2.push(state.p2.x, state.p2.y, state.p2.z);

      if (state.points1.length > state.MAX_POINTS * 3) {
        state.points1.splice(0, 3);
        state.points2.splice(0, 3);
      }
    }

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
