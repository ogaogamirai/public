// ==============================================================================
// 3D Commons Model Definition: Earth Seasons & Tilt (地軸の傾きと季節の公転)
// 明るく上品なライトテーマ最適化版 (天文学的完全固定地軸)
// ==============================================================================

export default {
  id: "earth-seasons",
  category: "geoscience",
  categoryLabel: "🌍 地学・天文学",
  title: "地球の地軸傾斜（23.4°）と四季のメカニズム",
  description: "自転軸が公転面に対して約23.4度「宇宙空間（北極星方向）に対して一定の向き」に傾いたまま公転するため、季節によって太陽の南中高度と昼夜の長さが変化します。",
  formula: "\\delta = 23.44^\\circ \\times \\sin\\left(\\frac{360^\\circ}{365} (N - 80)\\right)",
  
  legend: [
    { color: "#e11d48", label: "<strong>地軸（北極）</strong>: 宇宙空間に固定（ブレない自転軸）" },
    { color: "#059669", label: "<strong>赤道面</strong>: 自転基準面（23.4° 傾斜）" },
    { color: "#d97706", label: "<strong>太陽光線</strong>: 季節ごとの入射角" }
  ],

  views: {
    "3d": { name: "🔄 3D 宇宙全体", pos: [22, 16, 26], target: [0, 0, 0], default: true },
    "summer": { name: "☀️ 夏至 (北半球の夏: 6/21)", pos: [0, 6, -22], target: [0, 0, -14] },
    "winter": { name: "❄️ 冬至 (北半球の冬: 12/22)", pos: [0, 6, 22], target: [0, 0, 14] },
    "equinox": { name: "⚖️ 春分・秋分 (3/21・9/23)", pos: [22, 6, 0], target: [14, 0, 0] }
  },

  parameters: {
    dayOfYear: { label: "季節 / 年間日数 (1〜365日)", min: 1, max: 365, step: 1, value: 172 }, // 172 ~ 夏至 (6/21)
    axialTilt: { label: "地軸の傾き (度)", min: 0, max: 45, step: 0.5, value: 23.44 },
    orbitSpeed: { label: "公転シミュレーション速度", min: 0, max: 2, step: 0.1, value: 0.4 }
  },

  init(THREE, scene, state) {
    const ORBIT_R = 14.0;
    const EARTH_R = 2.2;
    state.ORBIT_R = ORBIT_R;
    state.EARTH_R = EARTH_R;

    // 1. Central Sun (Warm Amber Glow)
    const sunGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    state.sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(state.sun);

    const sunLight = new THREE.PointLight(0xffedd5, 2.8, 60);
    scene.add(sunLight);

    // 2. Orbit Ring
    const orbitPoints = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLine = new THREE.Line(orbitGeo, new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.4, gapSize: 0.2 }));
    orbitLine.computeLineDistances();
    scene.add(orbitLine);

    // 3. Earth Hierarchical Structure:
    state.earthOrbitGroup = new THREE.Group();
    scene.add(state.earthOrbitGroup);

    state.earthTiltGroup = new THREE.Group();
    state.earthOrbitGroup.add(state.earthTiltGroup);

    this.updateTilt(THREE, state);

    // 3A. Axis Line (North / South Pole)
    const axisPoints = [
      new THREE.Vector3(0, -EARTH_R * 1.6, 0),
      new THREE.Vector3(0, EARTH_R * 1.6, 0)
    ];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const axisLine = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 }));
    state.earthTiltGroup.add(axisLine);

    // North pole cone (Rose Red marker)
    const npDot = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 16), new THREE.MeshBasicMaterial({ color: 0xe11d48 }));
    npDot.position.set(0, EARTH_R * 1.6, 0);
    state.earthTiltGroup.add(npDot);

    // South pole cone (Blue marker)
    const spDot = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 16), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    spDot.position.set(0, -EARTH_R * 1.6, 0);
    spDot.rotation.x = Math.PI;
    state.earthTiltGroup.add(spDot);

    // 3B. Equator Ring (Emerald Green)
    const eqPoints = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      eqPoints.push(new THREE.Vector3(Math.cos(a) * EARTH_R * 1.04, 0, Math.sin(a) * EARTH_R * 1.04));
    }
    const eqGeo = new THREE.BufferGeometry().setFromPoints(eqPoints);
    const eqLine = new THREE.Line(eqGeo, new THREE.LineBasicMaterial({ color: 0x059669, linewidth: 2 }));
    state.earthTiltGroup.add(eqLine);

    // Tropic of Cancer & Capricorn Rings (latitude = axial tilt)
    const tropMat = new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.2, gapSize: 0.15 });
    state.tropNLine = new THREE.Line(new THREE.BufferGeometry(), tropMat);
    state.tropSLine = new THREE.Line(new THREE.BufferGeometry(), tropMat);
    state.earthTiltGroup.add(state.tropNLine);
    state.earthTiltGroup.add(state.tropSLine);
    this.updateTropics(THREE, state);

    // 3C. Pure Spin Group
    state.earthSpinGroup = new THREE.Group();
    state.earthTiltGroup.add(state.earthSpinGroup);

    // Earth Sphere (Ocean Blue)
    const earthGeo = new THREE.SphereGeometry(EARTH_R, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.6,
      metalness: 0.1
    });
    state.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    state.earthSpinGroup.add(state.earthMesh);

    // Lat/Long Grids on Earth (Sky Blue)
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(EARTH_R * 1.005, 18, 12));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.45 });
    state.earthSpinGroup.add(new THREE.LineSegments(wireGeo, wireMat));

    // 4. Sunlight Ray Beam (Warm Amber)
    state.sunBeamsGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    state.sunBeams = new THREE.Line(state.sunBeamsGeo, new THREE.LineDashedMaterial({ color: 0xd97706, dashSize: 0.4, gapSize: 0.2, transparent: true, opacity: 0.85 }));
    scene.add(state.sunBeams);
  },

  updateTilt(THREE, state) {
    const tiltDeg = state.params.axialTilt !== undefined ? state.params.axialTilt : 23.44;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    state.earthTiltGroup.rotation.set(tiltRad, 0, 0);
  },

  updateTropics(THREE, state) {
    const tiltDeg = state.params.axialTilt !== undefined ? state.params.axialTilt : 23.44;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    const earthR = state.EARTH_R * 1.02;
    const tropicR = Math.cos(tiltRad) * earthR;
    const tropicH = Math.sin(tiltRad) * earthR;
    const tropicN = [];
    const tropicS = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      tropicN.push(new THREE.Vector3(Math.cos(a) * tropicR, tropicH, Math.sin(a) * tropicR));
      tropicS.push(new THREE.Vector3(Math.cos(a) * tropicR, -tropicH, Math.sin(a) * tropicR));
    }
    state.tropNLine.geometry.setFromPoints(tropicN);
    state.tropSLine.geometry.setFromPoints(tropicS);
    state.tropNLine.computeLineDistances();
    state.tropSLine.computeLineDistances();
  },

  onParamChange(THREE, state, key, val) {
    if (key === "axialTilt") {
      this.updateTilt(THREE, state);
      this.updateTropics(THREE, state);
    }
  },

  update(THREE, state, dt, time) {
    const speed = state.params.orbitSpeed !== undefined ? state.params.orbitSpeed : 0.4;
    if (speed > 0) {
      state.params.dayOfYear = ((state.params.dayOfYear + dt * 18 * speed) % 365) || 1;
    }

    const day = state.params.dayOfYear;
    const angle = ((day - 80) / 365) * Math.PI * 2;
    const x = Math.cos(angle) * state.ORBIT_R;
    const z = -Math.sin(angle) * state.ORBIT_R;

    state.earthOrbitGroup.position.set(x, 0, z);

    // Pure daily spin (around local tilted Y axis)
    state.earthSpinGroup.rotation.y += dt * 2.0;

    // Update Sun Beam line
    state.sunBeamsGeo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)]);
    state.sunBeams.computeLineDistances();
  }
};
