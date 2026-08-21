// 2D Commons: 方形波をつくる足し算（部分和）— フーリエ教材 G1/G5 対応

function squareTarget(t) {
  // 周期 2π の方形波: (0,π) で +1、(π,2π) で -1
  const p = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return p < Math.PI ? 1 : -1;
}

export default {
  id: "fourier-partials",
  category: "math",
  categoryLabel: "📐 数学・フーリエへの道",
  title: "足すほど段差になる — フーリエ部分和",
  description: "$\\frac{4}{\\pi}\\left(\\sin t+\\frac{1}{3}\\sin 3t+\\frac{1}{5}\\sin 5t+\\cdots\\right)$。奇数倍のサインを $N$ 本足すと、ゆるい山が方形波に近づきます。スライダーで $N$ を動かして確かめてください。",
  formula: "s_N(t)=\\frac{4}{\\pi}\\sum_{\\substack{k=1\\\\ k:\\mathrm{odd}}}^{N}\\frac{\\sin kt}{k}",
  legend: [
    { color: "#c45c26", label: "部分和 $s_N(t)$" },
    { color: "#b9b4a8", label: "目指す方形波" }
  ],
  views: {
    std: { name: "標準", params: { n: 5 }, default: true },
    one: { name: "N = 1（サインだけ）", params: { n: 1 } },
    many: { name: "N = 21（もう段差）", params: { n: 21 } }
  },
  parameters: {
    n: { label: "部品の本数 N（奇数）", min: 1, max: 31, step: 2, value: 5 }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    this.updateStatus(state);
  },

  updateStatus(state) {
    const n = state.params.n;
    window.setModelStatus(`N = ${n}　／　足しているのは奇数倍のサイン ${Math.ceil(n / 2)} 本`);
  },

  draw(ctx, plot, state) {
    const n = state.params.n;

    // 目指す方形波（薄いグレー）
    ctx.beginPath();
    ctx.strokeStyle = "#b9b4a8";
    ctx.lineWidth = 1.4;
    let prevY = null;
    for (let i = 0; i <= 600; i++) {
      const t = plot.xMin + (i / 600) * (plot.xMax - plot.xMin);
      const y = squareTarget(t);
      const [px, py] = plot.toScreen(t, y);
      if (prevY === null || Math.abs(y - prevY) > 1e-9) {
        if (prevY !== null) ctx.lineTo(px, py); // 段差を縦線として描く
        else ctx.moveTo(px, py);
        prevY = y;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // 部分和
    ctx.beginPath();
    ctx.strokeStyle = "#c45c26";
    ctx.lineWidth = 2.4;
    for (let i = 0; i <= 900; i++) {
      const t = plot.xMin + (i / 900) * (plot.xMax - plot.xMin);
      let y = 0;
      for (let k = 1; k <= n; k += 2) {
        y += Math.sin(k * t) / k;
      }
      y *= 4 / Math.PI;
      const [px, py] = plot.toScreen(t, y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // ラベル
    ctx.fillStyle = "#8a8578";
    ctx.font = "12px Plus Jakarta Sans, sans-serif";
    ctx.fillText("s_N", plot.pad.l + 8, plot.pad.t + 18);
  }
};
