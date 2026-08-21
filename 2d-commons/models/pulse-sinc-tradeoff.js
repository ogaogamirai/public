// 2D Commons: パルス幅とスペクトルのトレードオフ（フーリエ教材 G7/G8 対応）

function sinc(x) {
  return Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x;
}

export default {
  id: "pulse-sinc-tradeoff",
  category: "math",
  categoryLabel: "📐 数学・フーリエへの道",
  title: "短いパルスほど広くにじむ — sinc",
  description: "幅 $a$ の矩形パルスのフーリエ変換は $F(\\omega)=a\\,\\operatorname{sinc}(\\omega a/2)$。パルスを細くすると、スペクトルの山が横に広がります。左が時間域・右が周波数域（高さは正規化表示）。",
  formula: "F(\\omega)=a\\,\\operatorname{sinc}\\!\\left(\\frac{\\omega a}{2}\\right)",
  legend: [
    { color: "#2c5f4a", label: "時間域：矩形パルス" },
    { color: "#c45c26", label: "周波数域：$F(\\omega)$（正規化）" }
  ],
  views: {
    wide: { name: "幅広パルス", params: { a: 4 }, default: true },
    narrow: { name: "幅狭パルス", params: { a: 1 } }
  },
  parameters: {
    a: { label: "パルス幅 a", min: 0.5, max: 6, step: 0.05, value: 2 }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    this.updateStatus(state);
  },

  updateStatus(state) {
    const a = state.params.a;
    const zero = (2 * Math.PI / a).toFixed(2);
    window.setModelStatus(`F(0) = ${a.toFixed(2)}　／　最初のゼロ点 ω = 2π/a ≈ ${zero}　／　a が小さい ↔ 山は広い`);
  },

  draw(ctx, plot, state) {
    const a = state.params.a;
    const midY = plot.toScreen(0, 0)[1];
    const scale = 3; // 表示スケール（両パネル共通）

    // 中央の仕切り
    ctx.beginPath();
    ctx.strokeStyle = "#d9d4c8";
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1;
    const [dx] = plot.toScreen(-0.7, 0);
    ctx.moveTo(dx, plot.pad.t);
    ctx.lineTo(dx, plot.pad.t + plot.innerH());
    ctx.stroke();
    ctx.setLineDash([]);

    // 左パネル: 時間域の矩形（中心 -3.5）
    const tc = -3.5;
    ctx.beginPath();
    ctx.strokeStyle = "#2c5f4a";
    ctx.lineWidth = 2.2;
    const [x1] = plot.toScreen(tc - a / 2, 0);
    const [x2] = plot.toScreen(tc + a / 2, 0);
    const [yTop] = plot.toScreen(0, scale);
    const [, yBot] = plot.toScreen(0, -scale * 0.15);
    ctx.moveTo(x1, yBot); ctx.lineTo(x1, yTop); ctx.lineTo(x2, yTop); ctx.lineTo(x2, yBot);
    ctx.stroke();
    ctx.fillStyle = "rgba(44, 95, 74, 0.14)";
    ctx.fillRect(Math.min(x1, x2), yTop, Math.abs(x2 - x1), yBot - yTop);

    ctx.fillStyle = "#8a8578";
    ctx.font = "12px Plus Jakarta Sans, sans-serif";
    ctx.fillText("時間 f(t)", plot.pad.l + 8, plot.pad.t + 18);

    // 右パネル: 周波数域の sinc（正規化して高さ scale）
    const wMax = 6;
    ctx.beginPath();
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 2.4;
    let started = false;
    let prevSign = 1;
    for (let i = 0; i <= 700; i++) {
      const w = 0 + (i / 700) * wMax;
      const v = sinc((a * w) / 2); // F/F(0)
      const sgn = v >= 0 ? 1 : -1;
      if (prevSign > 0 && sgn < 0 && started) {
        // ゼロクロスで線をつなげない
        ctx.stroke();
        ctx.beginPath();
        started = false;
      }
      const [px, py] = plot.toScreen(w, v * scale);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
      prevSign = sgn;
    }
    ctx.stroke();

    // 最初のゼロ点
    const wz = (2 * Math.PI) / a;
    if (wz <= wMax) {
      const [zx, zy] = plot.toScreen(wz, 0);
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(zx, zy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e11d48";
      ctx.font = "11px Plus Jakarta Sans, sans-serif";
      ctx.fillText("ω=2π/a", zx - 24, zy + 16);
    }

    ctx.fillStyle = "#8a8578";
    ctx.fillText("周波数 |F(ω)|（正規化）", dx + 12, plot.pad.t + 18);
  }
};
