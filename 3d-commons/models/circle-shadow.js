// 3D Commons: 円の影がサイン波を作る（フーリエ教材 G2 対応）
// 縦の影 = sin、横の影 = cos、両方を一つの立体で見る。

const R = 3.5;          // 円の半径
const W0 = 6.0;         // 波の始点 x
const L = 15.0;         // 波の長さ
const K = 2 * Math.PI / 6; // 空間角周波数（波長6）

function makeLabel(THREE, text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(4.2, 1.05, 1);
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
  title: "円の影がサイン波を作る",
  description: "等速で回る点を「縦だけ」見るとサイン波、「横だけ」見るとコサイン波になります。回転する点と、それが描く影を同時に観察しましょう。上から見れば、波はらせんとして見えます。",
  formula: "P=(R\\cos\\theta,\\ R\\sin\\theta)\\quad y(t)=A\\sin(\\omega t)",
  legend: [
    { color: "#c45c26", label: "縦の影 $y=A\\sin\\omega t$（サイン波）" },
    { color: "#2a6fad", label: "横の影 $x=A\\cos\\omega t$（コサイン波）" },
    { color: "#e11d48", label: "回る点 $P$" },
    { color: "#94a3b8", label: "接続線（影の対応）" }
  ],
  views: {
    front: { name: "🎬 正面（円とサイン波）", pos: [9, -1, 17], target: [9, 0.5, 0], default: true },
    top: { name: "🔄 真上から（コサインを見る）", pos: [9, 24, 0.01], target: [9, 0, 0] },
    overview: { name: "🌀 ななめ（らせん）", pos: [2, 11, 24], target: [9, 0, 0] }
  },
  parameters: {
    speed: { label: "回転の速さ ω", min: 0, max: 3, step: 0.05, value: 1 },
    helix: { label: "らせんを表示（0=非表示 / 1=表示）", min: 0, max: 1, step: 1, value: 0 }
  },

  init(THREE, scene, state) {
    state.theta = 0;

    // 円
    const circlePts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      circlePts.push(new THREE.Vector3(R * Math.cos(a), R * Math.sin(a), 0));
    }
    state.circle = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(circlePts),
      new THREE.LineBasicMaterial({ color: 0x8a8578 })
    );

    // 時間軸
    state.axis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(W0 - 1, 0, 0), new THREE.Vector3(W0 + L, 0, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0xc9c4b8 })
    );

    // 半径（中心→点P）
    state.radiusLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(R, 0, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x55524a })
    );

    // 点P
    state.pointP = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xe11d48 })
    );

    // 接続線（P → 波の先端）
    state.connector = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xb08968, dashSize: 0.28, gapSize: 0.2 })
    );

    // サイン波（縦の影）
    state.sineWave = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xc45c26 })
    );

    // コサイン波（横の影・床に沿って描く）
    state.cosWave = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x2a6fad, transparent: true, opacity: 0.75 })
    );

    // らせん（真実の軌道）
    state.helix = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.45 })
    );
    state.helix.visible = false;

    // ラベル
    state.labelSin = makeLabel(THREE, "縦の影 = sin", "#c45c26");
    state.labelSin.position.set(W0 + L * 0.62, R + 1.1, 0);
    state.labelCos = makeLabel(THREE, "横の影 = cos", "#2a6fad");
    state.labelCos.position.set(W0 + L * 0.62, -(R + 2.0), 0);
    state.labelP = makeLabel(THREE, "P", "#e11d48");
    state.labelP.scale.set(1.6, 0.4, 1);

    scene.add(
      state.circle, state.axis, state.radiusLine, state.pointP,
      state.connector, state.sineWave, state.cosWave, state.helix,
      state.labelSin, state.labelCos, state.labelP
    );
    this.refresh(THREE, state);
  },

  refresh(THREE, state) {
    const th = state.theta;
    const px = R * Math.cos(th);
    const py = R * Math.sin(th);

    state.pointP.position.set(px, py, 0);
    state.radiusLine.geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(px, py, 0)
    ]);
    state.labelP.position.set(px * 1.25, py * 1.25, 0);

    // 接続線
    const wStart = new THREE.Vector3(W0, py, 0);
    state.connector.geometry.setFromPoints([new THREE.Vector3(px, py, 0), wStart]);
    state.connector.computeLineDistances();

    // 波を再生成
    const n = 240;
    const sPts = [], cPts = [], hPts = [];
    const showHelix = state.params.helix > 0.5;
    for (let i = 0; i <= n; i++) {
      const u = (i / n) * L;
      const ang = th - u * K;
      const s = R * Math.sin(ang);
      const c = R * Math.cos(ang);
      sPts.push(new THREE.Vector3(W0 + u, s, 0));
      cPts.push(new THREE.Vector3(W0 + u, -(R + 1.4), c));
      if (showHelix) hPts.push(new THREE.Vector3(W0 + u, s, c));
    }
    state.sineWave.geometry.setFromPoints(sPts);
    state.cosWave.geometry.setFromPoints(cPts);
    state.helix.visible = showHelix;
    if (showHelix) state.helix.geometry.setFromPoints(hPts);

    if (window.setModelStatus) {
      const deg = ((th % (2 * Math.PI)) * 180 / Math.PI).toFixed(0);
      window.setModelStatus(`θ = ${deg}°　／　縦の影 y = ${Math.sin(th).toFixed(2)}　／　横の影 x = ${Math.cos(th).toFixed(2)}`);
    }
  },

  update(THREE, state, dt) {
    const speed = state.params.speed;
    if (speed > 0) {
      state.theta += speed * dt;
      this.refresh(THREE, state);
    }
  },

  onParamChange(THREE, state) {
    this.refresh(THREE, state);
  }
};
