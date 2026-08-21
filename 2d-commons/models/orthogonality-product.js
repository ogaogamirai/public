// 2D Commons: 直交性 — 掛けて一周積分すると消える（フーリエ教材 G4 対応）

function trapezoid(f, a, b, n = 2000) {
  const h = (b - a) / n;
  let s = (f(a) + f(b)) / 2;
  for (let i = 1; i < n; i++) s += f(a + i * h);
  return s * h;
}

export default {
  id: "orthogonality-product",
  category: "math",
  categoryLabel: "📐 数学・フーリエへの道",
  title: "直交性 — 掛けて一周足すと消える",
  description: "$\\sin(mt)$ と $\\sin(nt)$ を掛けた曲線は、$m\\neq n$ ならプラスの面積とマイナスの面積が同じで、一周の合計が $0$。同じ番号 $m=n$ のときだけ $\\pi$ が残ります。スライダーで確かめてください。",
  formula: "\\int_0^{2\\pi}\\sin(mt)\\sin(nt)\\,dt=\\pi\\,\\delta_{mn}",
  legend: [
    { color: "#c45c26", label: "積 $\\sin(mt)\\sin(nt)$（面積が測る対象）" },
    { color: "#0284c7", label: "$\\sin(mt)$" },
    { color: "#059669", label: "$\\sin(nt)$" }
  ],
  views: {
    diff: { name: "m≠n（打ち消す）", params: { m: 1, n: 3 }, default: true },
    same: { name: "m=n（残る）", params: { m: 3, n: 3 } }
  },
  parameters: {
    m: { label: "m", min: 1, max: 8, step: 1, value: 1 },
    n: { label: "n", min: 1, max: 8, step: 1, value: 3 }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    this.updateStatus(state);
  },

  updateStatus(state) {
    const { m, n } = state.params;
    const val = trapezoid((t) => Math.sin(m * t) * Math.sin(n * t), 0, 2 * Math.PI);
    const theory = m === n ? "\\pi \\approx 3.14159" : "0";
    window.setModelStatus(
      `一周の面積 ≈ ${val.toFixed(5)}　／　理論値 ${theory}${m === n ? "" : "（打ち消し合う）"}`
    );
  },

  draw(ctx, plot, state) {
    const { m, n } = state.params;
    const f = (t) => Math.sin(m * t);
    const g = (t) => Math.sin(n * t);

    // sin(mt), sin(nt)
    for (const [fn, color] of [[f, "#0284c7"], [g, "#059669"]]) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.65;
      for (let i = 0; i <= 600; i++) {
        const t = plot.xMin + (i / 600) * (plot.xMax - plot.xMin);
        const [px, py] = plot.toScreen(t, fn(t));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 積と符号つき面積
    const prod = (t) => f(t) * g(t);
    const steps = 900;
    let seg = [];
    const flushSeg = () => {
      if (seg.length < 2) { seg = []; return; }
      const sign = seg[0][1] >= 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(seg[0][0], plot.toScreen(0, 0)[1]);
      for (const [px, py] of seg) ctx.lineTo(px, py);
      ctx.lineTo(seg[seg.length - 1][0], plot.toScreen(0, 0)[1]);
      ctx.closePath();
      ctx.fillStyle = sign > 0
        ? "rgba(194, 92, 38, 0.30)"
        : "rgba(42, 111, 173, 0.28)";
      ctx.fill();
      seg = [];
    };

    ctx.beginPath();
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 2.4;
    let prevSign = null;
    for (let i = 0; i <= steps; i++) {
      const t = plot.xMin + (i / steps) * (plot.xMax - plot.xMin);
      const y = prod(t);
      const [px, py] = plot.toScreen(t, y);
      const sgn = y >= 0 ? 1 : -1;
      if (prevSign !== null && sgn !== prevSign) flushSeg();
      seg.push([px, py]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      prevSign = sgn;
    }
    ctx.stroke();
    flushSeg();

    // 凡例テキスト
    ctx.fillStyle = "#8a8578";
    ctx.font = "12px Plus Jakarta Sans, sans-serif";
    ctx.fillText("橙=プラスの面積 / 青=マイナスの面積", plot.pad.l + 8, plot.pad.t + 18);
  }
};
