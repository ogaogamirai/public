// ==============================================================================
// 3D Commons Model: レムニスケート曲線（連珠形）
// 参考: https://manabitimes.jp/math/3992 , https://manabitimes.jp/math/898
// ==============================================================================

/** 数学座標 (x, y) を XZ 平面（Y-up）へ: math x → Three x, math y → Three z */
function toThree(THREE, x, y, yLift = 0) {
  return new THREE.Vector3(x, yLift, y);
}

function polarPoint(a, theta) {
  const cos2 = Math.cos(2 * theta);
  if (cos2 < -1e-10) return null;
  const r = a * Math.sqrt(Math.max(0, cos2));
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
    r,
    theta
  };
}

function distanceProduct(a, x, y) {
  const half = a / Math.SQRT2;
  const d1 = Math.hypot(x + half, y);
  const d2 = Math.hypot(x - half, y);
  return d1 * d2;
}

function buildLobePoints(THREE, a, thetaStart, thetaEnd, segments) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = thetaStart + ((thetaEnd - thetaStart) * i) / segments;
    const p = polarPoint(a, theta);
    if (p) points.push(toThree(THREE, p.x, p.y));
  }
  return points;
}

export default {
  id: "lemniscate",
  category: "math",
  categoryLabel: "📐 数学・極座標",
  title: "レムニスケート曲線（連珠形）",
  description:
    "極方程式 $r^2=a^2\\cos 2\\theta$（直交座標では $(x^2+y^2)^2=a^2(x^2-y^2)$）で表される ∞ 形の曲線です。焦点 $(\\pm a/\\sqrt{2},0)$ からの距離の積が一定になる性質と、面積 $S=a^2$ を観察します。出典: manabitimes.jp/math/3992 , math/898",
  formula: "r^2=a^2\\cos 2\\theta,\\quad (x^2+y^2)^2=a^2(x^2-y^2)",

  legend: [
    { color: "#0284c7", label: "レムニスケート曲線" },
    { color: "#d97706", label: "焦点 $F_1,F_2\\,(\\pm a/\\sqrt{2},0)$" },
    { color: "#e11d48", label: "動点 $P$ と距離線 $|PF_1|,|PF_2|$" },
    { color: "#94a3b8", label: "数学 $x$ 軸（Three.js $x$）・数学 $y$ 軸（Three.js $z$）" }
  ],

  views: {
    overview: { name: "🔄 斜め", pos: [10, 7, 10], target: [0, 0, 0], default: true },
    top: { name: "⭕ 上から", pos: [0, 14, 0], target: [0, 0, 0] },
    front: { name: "📐 正面 ($y$)", pos: [0, 0, 14], target: [0, 0, 0] },
    side: { name: "↔️ 側面 ($x$)", pos: [14, 0, 0], target: [0, 0, 0] }
  },

  parameters: {
    a: { label: "スケール $a$", min: 1.5, max: 5, step: 0.1, value: 3 },
    theta: { label: "極角 $\\theta$（度）", min: 0, max: 360, step: 1, value: 20 }
  },

  init(THREE, scene, state) {
    state.readoutDirty = true;
    state.group = new THREE.Group();
    scene.add(state.group);

    const grid = new THREE.GridHelper(14, 28, 0xcbd5e1, 0xe2e8f0);
    scene.add(grid);

    const axisMat = new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.35, gapSize: 0.2 });
    state.axisX = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([toThree(THREE, -7, 0), toThree(THREE, 7, 0)]),
      axisMat
    );
    state.axisY = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([toThree(THREE, 0, -7), toThree(THREE, 0, 7)]),
      axisMat.clone()
    );
    state.axisX.computeLineDistances();
    state.axisY.computeLineDistances();
    scene.add(state.axisX, state.axisY);

    state.fill = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    state.group.add(state.fill);

    state.curveParts = [
      new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 })
      ),
      new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 })
      )
    ];
    state.curveParts.forEach((part) => state.group.add(part));

    const focusGeo = new THREE.SphereGeometry(0.16, 20, 20);
    const focusMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.35 });
    state.focus1 = new THREE.Mesh(focusGeo, focusMat);
    state.focus2 = new THREE.Mesh(focusGeo, focusMat.clone());
    state.group.add(state.focus1, state.focus2);

    state.point = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.15, metalness: 0.5 })
    );
    state.group.add(state.point);

    const lineMat = new THREE.LineDashedMaterial({
      color: 0xe11d48,
      dashSize: 0.25,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.9
    });
    state.seg1 = new THREE.Line(new THREE.BufferGeometry(), lineMat);
    state.seg2 = new THREE.Line(new THREE.BufferGeometry(), lineMat.clone());
    state.group.add(state.seg1, state.seg2);

    state.origin = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x64748b })
    );
    state.group.add(state.origin);

    this.rebuildGeometry(THREE, state);
  },

  rebuildGeometry(THREE, state) {
    const a = state.params.a;
    const segments = 320;
    const quarter = Math.PI / 4;
    const lobe1 = buildLobePoints(THREE, a, -quarter, quarter, segments);
    const lobe2 = buildLobePoints(THREE, a, Math.PI - quarter, Math.PI + quarter, segments);

    state.curveParts[0].geometry.setFromPoints(lobe1);
    state.curveParts[1].geometry.setFromPoints(lobe2);

    const half = a / Math.SQRT2;
    state.focus1.position.copy(toThree(THREE, -half, 0, 0.02));
    state.focus2.position.copy(toThree(THREE, half, 0, 0.02));
    state.origin.position.copy(toThree(THREE, 0, 0, 0.02));

    const shape = new THREE.Shape();
    if (lobe1.length > 1 && lobe2.length > 1) {
      shape.moveTo(lobe1[0].x, lobe1[0].z);
      for (let i = 1; i < lobe1.length; i++) shape.lineTo(lobe1[i].x, lobe1[i].z);
      for (let i = lobe2.length - 1; i >= 0; i--) shape.lineTo(lobe2[i].x, lobe2[i].z);
      shape.closePath();
    }
    const fillGeo = new THREE.ShapeGeometry(shape);
    state.fill.geometry.dispose();
    state.fill.geometry = fillGeo;
    state.fill.rotation.x = Math.PI / 2;
    state.fill.position.y = 0.01;

    this.updatePoint(THREE, state);
  },

  updatePoint(THREE, state) {
    const a = state.params.a;
    const thetaDeg = state.params.theta;
    const theta = (thetaDeg * Math.PI) / 180;
    const p = polarPoint(a, theta);
    const half = a / Math.SQRT2;
    const f1 = toThree(THREE, -half, 0, 0.03);
    const f2 = toThree(THREE, half, 0, 0.03);
    const targetProduct = (a * a) / 2;

    if (!p || p.r < 1e-6) {
      state.point.visible = false;
      state.seg1.visible = false;
      state.seg2.visible = false;
      state.currentDist1 = 0;
      state.currentDist2 = 0;
      state.currentProduct = 0;
      state.currentR = 0;
      state.currentThetaDeg = thetaDeg;
      state.onCurve = false;
    } else {
      const pos = toThree(THREE, p.x, p.y, 0.05);
      state.point.visible = true;
      state.point.position.copy(pos);
      state.seg1.visible = true;
      state.seg2.visible = true;
      state.seg1.geometry.setFromPoints([f1, pos]);
      state.seg2.geometry.setFromPoints([f2, pos]);
      state.seg1.computeLineDistances();
      state.seg2.computeLineDistances();
      state.currentDist1 = Math.hypot(p.x + half, p.y);
      state.currentDist2 = Math.hypot(p.x - half, p.y);
      state.currentProduct = distanceProduct(a, p.x, p.y);
      state.currentR = p.r;
      state.currentThetaDeg = thetaDeg;
      state.onCurve = true;
    }

    state.targetProduct = targetProduct;
    state.areaS = a * a;

    const readout = document.getElementById("model-formula");
    if (readout && window.katex && state.readoutDirty) {
      const rText = state.onCurve ? state.currentR.toFixed(3) : "\\text{—}";
      const prod = state.onCurve ? state.currentProduct.toFixed(3) : "\\text{—}";
      const offCurveNote = state.onCurve
        ? ""
        : "\\;(\\cos 2\\theta<0\\text{ のため曲線上に点なし})";

      katex.render(
        `r^2=a^2\\cos 2\\theta,\\;(x^2+y^2)^2=a^2(x^2-y^2)\\quad` +
          `\\theta=${state.currentThetaDeg}^\\circ,\\;r=${rText}\\quad` +
          `|PF_1|\\cdot|PF_2|=${prod}\\;(=\\tfrac{a^2}{2}=${targetProduct.toFixed(2)})\\quad S=a^2=${state.areaS.toFixed(2)}${offCurveNote}`,
        readout,
        { displayMode: false, throwOnError: false }
      );
      state.readoutDirty = false;
    }
  },

  onParamChange(THREE, state, key) {
    state.readoutDirty = true;
    if (key === "a") {
      this.rebuildGeometry(THREE, state);
    } else {
      this.updatePoint(THREE, state);
    }
  },

  update(THREE, state, dt) {
    if (!state.point) return;
    let next = state.params.theta + dt * 18;
    if (next >= 360) next -= 360;
    state.params.theta = next;
    this.updatePoint(THREE, state);
  }
};
