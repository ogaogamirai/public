// 3D Commons: 双曲放物面（鞍型曲面）z = x² − y²

/** 数学座標 (x, y, z) → Three.js (x, z, y) — y 軸を高さにする */
function toThree(THREE, x, y, z) {
  return new THREE.Vector3(x, z, y);
}

export default {
  id: "saddle-surface",
  category: "math",
  categoryLabel: "📐 数C・空間図形",
  title: "双曲放物面（鞍型曲面）",
  description:
    "曲面 $z=x^2-y^2$ は、$y$ を固定した $x$ 方向の断面が上に開く放物線、$x$ を固定した $y$ 方向の断面が下に開く放物線になります。スライダーで表示範囲と断面位置を動かし、鞍型の形を観察します。",
  formula: "z=x^2-y^2",
  legend: [
    { color: "#0284c7", label: "双曲放物面 $z=x^2-y^2$" },
    { color: "#e11d48", label: "$y$ 固定の $x$ 断面（上に開く放物線）" },
    { color: "#059669", label: "$x$ 固定の $y$ 断面（下に開く放物線）" },
    { color: "#94a3b8", label: "座標軸 $x,y,z$" }
  ],
  views: {
    overview: { name: "🔄 全体", pos: [14, 9, 14], target: [0, 0, 0], default: true },
    xz: { name: "📐 $x$ 断面", pos: [0, 6, 18], target: [0, 0, 0] },
    yz: { name: "📐 $y$ 断面", pos: [18, 6, 0], target: [0, 0, 0] },
    top: { name: "⭕ 上から", pos: [0, 20, 0], target: [0, 0, 0] }
  },
  parameters: {
    span: { label: "表示範囲（半幅）", min: 1.2, max: 3.5, step: 0.1, value: 2.5 },
    sliceY: { label: "$y$ 固定断面の位置 $y_0$", min: -3.5, max: 3.5, step: 0.1, value: 1.2 },
    sliceX: { label: "$x$ 固定断面の位置 $x_0$", min: -3.5, max: 3.5, step: 0.1, value: -1.0 }
  },

  init(THREE, scene, state) {
    state.group = new THREE.Group();
    scene.add(state.group);

    state.surfaceMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      roughness: 0.32,
      metalness: 0.06
    });
    state.surface = new THREE.Mesh(new THREE.BufferGeometry(), state.surfaceMaterial);
    state.group.add(state.surface);

    state.surfaceWire = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.22 })
    );
    state.group.add(state.surfaceWire);

    state.xSectionMaterial = new THREE.LineBasicMaterial({ color: 0xe11d48, linewidth: 3 });
    state.ySectionMaterial = new THREE.LineBasicMaterial({ color: 0x059669, linewidth: 3 });
    state.xSection = new THREE.Line(new THREE.BufferGeometry(), state.xSectionMaterial);
    state.ySection = new THREE.Line(new THREE.BufferGeometry(), state.ySectionMaterial);
    state.group.add(state.xSection);
    state.group.add(state.ySection);

    state.xGuidePlane = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({
        color: 0xe11d48,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    state.yGuidePlane = new THREE.Mesh(
      new THREE.BufferGeometry(),
      new THREE.MeshBasicMaterial({
        color: 0x059669,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    state.group.add(state.xGuidePlane);
    state.group.add(state.yGuidePlane);

    state.axes = new THREE.Group();
    const axisLen = 5.5;
    const makeAxis = (dir, color) => {
      const pts = [new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(axisLen)];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color })
      );
      return line;
    };
    state.axes.add(makeAxis(new THREE.Vector3(1, 0, 0), 0xe11d48));
    state.axes.add(makeAxis(new THREE.Vector3(0, 0, 1), 0x059669));
    state.axes.add(makeAxis(new THREE.Vector3(0, 1, 0), 0x0284c7));
    scene.add(state.axes);

    this.updateSurface(THREE, state);
  },

  buildSurfaceGeometry(THREE, span) {
    const steps = 48;
    const vertices = [];
    const indices = [];
    for (let j = 0; j <= steps; j++) {
      const y = -span + (j / steps) * (2 * span);
      for (let i = 0; i <= steps; i++) {
        const x = -span + (i / steps) * (2 * span);
        const z = x * x - y * y;
        const p = toThree(THREE, x, y, z);
        vertices.push(p.x, p.y, p.z);
      }
    }
    for (let j = 0; j < steps; j++) {
      for (let i = 0; i < steps; i++) {
        const row = steps + 1;
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
    return geometry;
  },

  buildWireframeGeometry(THREE, span) {
    const steps = 12;
    const segments = [];
    for (let j = 0; j <= steps; j++) {
      const y = -span + (j / steps) * (2 * span);
      const row = [];
      for (let i = 0; i <= steps; i++) {
        const x = -span + (i / steps) * (2 * span);
        row.push(toThree(THREE, x, y, x * x - y * y));
      }
      segments.push(row);
    }
    for (let i = 0; i <= steps; i++) {
      const x = -span + (i / steps) * (2 * span);
      const col = [];
      for (let j = 0; j <= steps; j++) {
        const y = -span + (j / steps) * (2 * span);
        col.push(toThree(THREE, x, y, x * x - y * y));
      }
      segments.push(col);
    }
    const positions = [];
    for (const line of segments) {
      for (let k = 0; k < line.length - 1; k++) {
        positions.push(line[k].x, line[k].y, line[k].z, line[k + 1].x, line[k + 1].y, line[k + 1].z);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  },

  updateSurface(THREE, state) {
    const span = state.params.span;
    const y0 = Math.max(-span, Math.min(span, state.params.sliceY));
    const x0 = Math.max(-span, Math.min(span, state.params.sliceX));
    state.params.sliceY = y0;
    state.params.sliceX = x0;

    state.surface.geometry.dispose();
    state.surface.geometry = this.buildSurfaceGeometry(THREE, span);
    state.surfaceWire.geometry.dispose();
    state.surfaceWire.geometry = this.buildWireframeGeometry(THREE, span);

    const sectionSteps = 120;
    const xPoints = [];
    const yPoints = [];
    for (let i = 0; i <= sectionSteps; i++) {
      const t = -span + (i / sectionSteps) * (2 * span);
      const zAtX = t * t - y0 * y0;
      const zAtY = x0 * x0 - t * t;
      xPoints.push(toThree(THREE, t, y0, zAtX));
      yPoints.push(toThree(THREE, x0, t, zAtY));
    }
    state.xSection.geometry.setFromPoints(xPoints);
    state.ySection.geometry.setFromPoints(yPoints);

    const hMax = span * span;
    const guideHalf = span * 1.08;
    state.xGuidePlane.geometry.dispose();
    state.xGuidePlane.geometry = new THREE.BufferGeometry();
    const xPlaneVerts = new Float32Array([
      -guideHalf, -hMax, y0,
       guideHalf, -hMax, y0,
       guideHalf,  hMax, y0,
      -guideHalf,  hMax, y0
    ]);
    state.xGuidePlane.geometry.setAttribute("position", new THREE.BufferAttribute(xPlaneVerts, 3));
    state.xGuidePlane.geometry.setIndex([0, 1, 2, 0, 2, 3]);
    state.xGuidePlane.geometry.computeVertexNormals();

    state.yGuidePlane.geometry.dispose();
    state.yGuidePlane.geometry = new THREE.BufferGeometry();
    const yPlaneVerts = new Float32Array([
      x0, -hMax, -guideHalf,
      x0, -hMax,  guideHalf,
      x0,  hMax,  guideHalf,
      x0,  hMax, -guideHalf
    ]);
    state.yGuidePlane.geometry.setAttribute("position", new THREE.BufferAttribute(yPlaneVerts, 3));
    state.yGuidePlane.geometry.setIndex([0, 1, 2, 0, 2, 3]);
    state.yGuidePlane.geometry.computeVertexNormals();

    const readout = document.getElementById("model-formula");
    if (readout && window.katex) {
      katex.render(
        `z=x^2-y^2\\quad y=${y0.toFixed(1)}\\Rightarrow z=x^2-${(y0 * y0).toFixed(2)}\\;(\\uparrow),\\ x=${x0.toFixed(1)}\\Rightarrow z=${(x0 * x0).toFixed(2)}-y^2\\;(\\downarrow)`,
        readout,
        { displayMode: false, throwOnError: false }
      );
    }
  },

  onParamChange(THREE, state, key) {
    if (key === "span") {
      const span = state.params.span;
      state.params.sliceY = Math.max(-span, Math.min(span, state.params.sliceY));
      state.params.sliceX = Math.max(-span, Math.min(span, state.params.sliceX));
    }
    this.updateSurface(THREE, state);
  }
};
