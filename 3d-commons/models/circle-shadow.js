// 3D Commons: 円の影がサイン波・コサイン波を作る（フーリエ教材 G2 対応）
// 正面ビューで両方の波を見る: sin は右、cos は下。
// らせん（真の軌道）は視点切替に連動して表示。

const R = 3.0;            // 円の半径
const W0 = 4.6;           // 波の始点 x
const L = 13.0;           // 波の長さ
const K = 2 * Math.PI / 6;// 空間角周波数（波長6）
const D = 5.4;            // cos 波の中心線（y = -D）

function makeLabel(THREE, text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(3.6, 0.9, 1);
  sprite.userData.labelCanvas = canvas;
  sprite.userData.labelContext = context;
  sprite.userData.labelTexture = texture;
  sprite.userData.labelColor = color;
  setLabel(sprite, text);
  return sprite;
}

function setLabel(sprite, text) {
  const canvas = sprite.userData.labelCanvas;
  const context = sprite.userData.labelContext;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "bold 40px Arial, sans-serif";
  context.fillStyle = sprite.userData.labelColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  sprite.userData.labelTexture.needsUpdate = true;
}

export default {
  id: "circle-shadow",
  category: "math",
  categoryLabel: "📐 数学・フーリエへの道",
  title: "円の影がサイン波・コサイン波を作る",
  description: "回る点の縦の影が右のサイン波、横の影が下のコサイン波。二つの波は同じ回転から生まれ、位相が $90^\\circ$ ずれているだけです。",
  formula: "y=A\\sin\\omega t,\\quad x=A\\cos\\omega t",
  legend: [
    { color: "#c45c26", label: "縦の影 $A\\sin\\omega t$" },
    { color: "#2a6fad", label: "横の影 $A\\cos\\omega t$" },
    { color: "#e11d48", label: "回る点 $P$" },
    { color: "#7c3aed", label: "らせん（真の軌道）" }
  ],
  views: {
    front: { name: "🎬 正面（sin 右・cos 下）", pos: [8.7, -1.2, 15.5], target: [8.7, -1.4, 0], params: { showHelix: 0 }, default: true },
    top: { name: "🔄 真上から（らせん＝cos）", pos: [8.7, 21, 0.01], target: [8.7, 0, 0], params: { showHelix: 1 } },
    overview: { name: "🌀 ななめ（らせん）", pos: [1, 10, 22], target: [8, -0.5, 0], params: { showHelix: 1 } }
  },
  parameters: {
    speed: { label: "回転の速さ ω", min: 0, max: 3, step: 0.05, value: 1 },
    showHelix: { label: "らせん表示", min: 0, max: 1, step: 1, value: 1 }
  },

  init(THREE, scene, state) {
    state.theta = 0;

    // 円（x-y 平面）
    const circlePts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      circlePts.push(new THREE.Vector3(R * Math.cos(a), R * Math.sin(a), 0));
    }
    state.circle = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(circlePts),
      new THREE.LineBasicMaterial({ color: 0x8a8578 })
    );

    // 直径（横の影のレール）
    state.diameter = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-R, 0, 0), new THREE.Vector3(R, 0, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0xb9b4a8 })
    );

    // sin 行の中心線 / cos 行の中心線
    state.axisSin = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(W0 - 1, 0, 0), new THREE.Vector3(W0 + L, 0, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0xd9d4c8 })
    );
    state.axisCos = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(W0 - 1, -D, 0), new THREE.Vector3(W0 + L, -D, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0xd9d4c8 })
    );

    // 半径（中心→P）
    state.radiusLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(R, 0, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x55524a })
    );

    // 点 P
    state.pointP = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xe11d48 })
    );

    // 影の足（横の影：直径上の点）
    state.pointF = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 20, 12),
      new THREE.MeshBasicMaterial({ color: 0x2a6fad })
    );

    // 接続線（P→sin波、P→F、F→cos波）
    state.connSin = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xb08968, dashSize: 0.26, gapSize: 0.18 })
    );
    state.connDrop = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0x2a6fad, dashSize: 0.26, gapSize: 0.18 })
    );
    state.connCos = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0x2a6fad, dashSize: 0.26, gapSize: 0.18 })
    );

    // 波本体
    state.sineWave = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xc45c26 })
    );
    state.cosWave = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x2a6fad })
    );
    state.helix = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.5 })
    );
    state.helix.visible = false;

    // ラベル
    state.labelSin = makeLabel(THREE, "縦の影 = sin", "#c45c26");
    state.labelSin.position.set(W0 + L * 0.72, R + 1.0, 0);
    state.labelCos = makeLabel(THREE, "横の影 = cos", "#2a6fad");
    state.labelCos.position.set(W0 + L * 0.72, -D - R - 1.0, 0);
    state.labelP = makeLabel(THREE, "P", "#e11d48");
    state.labelP.scale.set(1.5, 0.38, 1);

    scene.add(
      state.circle, state.diameter, state.axisSin, state.axisCos,
      state.radiusLine, state.pointP, state.pointF,
      state.connSin, state.connDrop, state.connCos,
      state.sineWave, state.cosWave, state.helix,
      state.labelSin, state.labelCos, state.labelP
    );
    this.refresh(THREE, state);
  },

  refresh(THREE, state) {
    const th = state.theta;
    const px = R * Math.cos(th);
    const py = R * Math.sin(th);

    // 点 P と半径
    state.pointP.position.set(px, py, 0);
    state.radiusLine.geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(px, py, 0)
    ]);
    state.labelP.position.set(px * 1.3, py * 1.3, 0);

    // 横の影の足（直径上）
    state.pointF.position.set(px, 0, 0);

    // sin への接続（水平）
    state.connSin.geometry.setFromPoints([
      new THREE.Vector3(px, py, 0), new THREE.Vector3(W0, py, 0)
    ]);
    // P→足（垂直）
    state.connDrop.geometry.setFromPoints([
      new THREE.Vector3(px, py, 0), new THREE.Vector3(px, 0, 0)
    ]);
    // 足→45°ミター線→cos波の先端
    // （F の x 座標 = R·cosθ を、下のコソ波行の高さへ翻訳する）
    const gY = -D + px;              // cos行中心から R·cosθ だけ上げた高さ
    const gX = D;                    // 右下45°で必ず x=D の縦線上に着地する
    state.connCos.geometry.setFromPoints([
      new THREE.Vector3(px, 0, 0),
      new THREE.Vector3(gX, gY, 0),
      new THREE.Vector3(W0, gY, 0)
    ]);
    state.connSin.computeLineDistances();
    state.connDrop.computeLineDistances();
    state.connCos.computeLineDistances();

    // 波を再生成
    const n = 240;
    const sPts = [], cPts = [], hPts = [];
    const showHelix = state.params.showHelix > 0.5;
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * L;
      const ang = th - u * K;
      sPts.push(new THREE.Vector3(W0 + u, R * Math.sin(ang), 0));
      cPts.push(new THREE.Vector3(W0 + u, -D + R * Math.cos(ang), 0));
      hPts.push(new THREE.Vector3(W0 + u, R * Math.sin(ang), R * Math.cos(ang)));
    }
    state.sineWave.geometry.setFromPoints(sPts);
    state.cosWave.geometry.setFromPoints(cPts);
    state.helix.visible = showHelix;
    if (showHelix) state.helix.geometry.setFromPoints(hPts);

    if (window.setModelStatus) {
      const deg = ((th % (2 * Math.PI)) * 180 / Math.PI).toFixed(0);
      window.setModelStatus(`θ = ${deg}°　／　sin = ${Math.sin(th).toFixed(2)}　／　cos = ${Math.cos(th).toFixed(2)}`);
    }
  },

  update(THREE, state, dt) {
    const speed = state.params.speed;
    if (speed > 0 && !state.paused) {
      state.theta += speed * dt;
      this.refresh(THREE, state);
    }
  },

  onParamChange(THREE, state) {
    this.refresh(THREE, state);
  }
};
