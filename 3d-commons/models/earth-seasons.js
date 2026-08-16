// ==============================================================================
// 3D Commons Model Definition: Earth Seasons & Tilt (地軸の傾きと季節の公転)
// ==============================================================================

export default {
  id: "earth-seasons",
  category: "geoscience",
  categoryLabel: "🌍 地学・天文学",
  title: "地球の地軸傾斜（23.4°）と四季のメカニズム",
  description: "地球の自転軸が公転面に対して約23.4度傾いているため、公転に伴って太陽の南中高度と昼夜の長さが変化し、四季が生み出されます。",
  formula: "\\delta = 23.44^\\circ \\times \\sin\\left(\\frac{360^\\circ}{365} (N + 284)\\right)",
  
  legend: [
    { color: "#fbbf24", label: "<strong>太陽光線</strong>: 平行光束（黄）" },
    { color: "#38bdf8", label: "<strong>地軸（自転軸）</strong>: 23.4° 傾斜（北極・南極）" },
    { color: "#34d399", label: "<strong>赤道面</strong>: 自転基準面" }
  ],

  views: {
    "3d": { name: "🔄 3D 宇宙視点", pos: [22, 14, 26], target: [0, 0, 0], default: true },
    "solstice_summer": { name: "☀️ 夏至 (北半球)", pos: [0, 10, 32], target: [0, 0, 0] },
    "equinox": { name: "⚖️ 春分・秋分", pos: [32, 0, 0], target: [0, 0, 0] },
    "solstice_winter": { name: "❄️ 冬至 (北半球)", pos: [0, -10, -32], target: [0, 0, 0] }
  },

  parameters: {
    dayOfYear: { label: "季節 / 年間日数 (1〜365日)", min: 1, max: 365, step: 1, value: 172 }, // 172 ~ 夏至 (6/21)
    axialTilt: { label: "地軸の傾き (度)", min: 0, max: 45, step: 0.5, value: 23.44 },
    orbitSpeed: { label: "公転アニメーション速度", min: 0, max: 2, step: 0.1, value: 0.5 }
  },

  init(THREE, scene, state) {
    const ORBIT_R = 14.0;
    const EARTH_R = 2.2;
    state.ORBIT_R = ORBIT_R;
    state.EARTH_R = EARTH_R;

    // 1. Central Sun
    const sunGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    state.sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(state.sun);

    // Sun Glow
    const sunLight = new THREE.PointLight(0xffedd5, 2.5, 60);
    scene.add(sunLight);

    // 2. Orbit Ring
    const orbitPoints = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLine = new THREE.Line(orbitGeo, new THREE.LineDashedMaterial({ color: 0x475569, dashSize: 0.4, gapSize: 0.2 }));
    orbitLine.computeLineDistances();
    scene.add(orbitLine);

    // 3. Earth Group (Moves along orbit)
    state.earthGroup = new THREE.Group();
    scene.add(state.earthGroup);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(EARTH_R, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.8,
      metalness: 0.1
    });
    state.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    state.earthGroup.add(state.earthMesh);

    // Continents wire/segments
    const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(EARTH_R * 1.01, 16, 12));
    const wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
    state.earthMesh.add(new THREE.LineSegments(wireGeo, wireMat));

    // Equator Ring
    const eqPoints = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      eqPoints.push(new THREE.Vector3(Math.cos(a) * EARTH_R * 1.05, 0, Math.sin(a) * EARTH_R * 1.05));
    }
    const eqGeo = new THREE.BufferGeometry().setFromPoints(eqPoints);
    const eqLine = new THREE.Line(eqGeo, new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 }));
    state.earthMesh.add(eqLine);

    // Axis of Rotation (North / South Pole line)
    const axisPoints = [
      new THREE.Vector3(0, -EARTH_R * 1.6, 0),
      new THREE.Vector3(0, EARTH_R * 1.6, 0)
    ];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const axisLine = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 }));
    state.earthMesh.add(axisLine);

    // North pole marker
    const npDot = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 16), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
    npDot.position.set(0, EARTH_R * 1.6, 0);
    state.earthMesh.add(npDot);

    // Sunlight ray beams from Sun to Earth
    state.sunBeamsGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    state.sunBeams = new THREE.Line(state.sunBeamsGeo, new THREE.LineDashedMaterial({ color: 0xfbbf24, dashSize: 0.3, gapSize: 0.15, transparent: true, opacity: 0.7 }));
    scene.add(state.sunBeams);

    this.updateTilt(THREE, state);
  },

  updateTilt(THREE, state) {
    const tiltDeg = state.params.axialTilt !== undefined ? state.params.axialTilt : 23.44;
    const tiltRad = (tiltDeg * Math.PI) / 180;
    // Keep tilt pointing in fixed celestial direction (Z axis tilt)
    state.earthMesh.rotation.z = tiltRad;
  },

  onParamChange(THREE, state, key, val) {
    if (key === "axialTilt") {
      this.updateTilt(THREE, state);
    }
  },

  update(THREE, state, dt, time) {
    const speed = state.params.orbitSpeed !== undefined ? state.params.orbitSpeed : 0.5;
    if (speed > 0) {
      state.params.dayOfYear = ((state.params.dayOfYear + dt * 15 * speed) % 365) || 1;
    }

    const day = state.params.dayOfYear;
    // 0 rad is Vernal Equinox (March 21 ~ day 80)
    const orbitAngle = ((day - 80) / 365) * Math.PI * 2;
    const x = Math.cos(orbitAngle) * state.ORBIT_R;
    const z = Math.sin(orbitAngle) * state.ORBIT_R;

    state.earthGroup.position.set(x, 0, z);

    // Daily spin (rotation around tilted axis)
    state.earthMesh.rotation.y += dt * 1.5;

    // Update Sun Beam line
    state.sunBeamsGeo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)]);
    state.sunBeams.computeLineDistances();
  }
};
