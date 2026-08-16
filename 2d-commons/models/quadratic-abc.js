function f(a, b, c, x) {
  return a * x * x + b * x + c;
}

export default {
  id: "quadratic-abc",
  category: "math",
  categoryLabel: "数I・二次関数",
  title: "二次関数の係数 $a,b,c$",
  description: "$a$ は開き方と向き、$b$ は軸の左右、$c$ は $y$ 切片です。動かして頂点と軸がどう追従するかを見てください。",
  formula: "y = ax^2 + bx + c",
  legend: [
    { color: "#0284c7", label: "グラフ $y=ax^2+bx+c$" },
    { color: "#e11d48", label: "頂点" },
    { color: "#d97706", label: "軸 $x=-b/(2a)$" }
  ],
  views: {
    std: { name: "標準 $a=1$", params: { a: 1, b: 0, c: 0 }, default: true },
    shift: { name: "平行移動", params: { a: 1, b: -4, c: 1 } },
    down: { name: "上に凸", params: { a: -0.5, b: 2, c: 3 } }
  },
  parameters: {
    a: { label: "$a$（開き）", min: -2, max: 2, step: 0.1, value: 1 },
    b: { label: "$b$（一次）", min: -6, max: 6, step: 0.1, value: 0 },
    c: { label: "$c$（切片）", min: -6, max: 6, step: 0.1, value: 0 }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    this.updateStatus(state);
  },

  updateStatus(state) {
    const { a, b, c } = state.params;
    if (Math.abs(a) < 1e-9) {
      window.setModelStatus("$a=0$ のときは二次関数ではなく一次（または定数）です。");
      return;
    }
    const vx = -b / (2 * a);
    const vy = f(a, b, c, vx);
    const dir = a > 0 ? "下に凸" : "上に凸";
    window.setModelStatus(`頂点 $(${vx.toFixed(2)},\\ ${vy.toFixed(2)})$　／　${dir}`);
  },

  draw(ctx, plot, state) {
    const { a, b, c } = state.params;
    const n = Math.max(80, Math.floor(plot.innerW()));
    ctx.beginPath();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.4;
    let started = false;
    for (let i = 0; i <= n; i++) {
      const x = plot.xMin + (i / n) * (plot.xMax - plot.xMin);
      const y = f(a, b, c, x);
      const [px, py] = plot.toScreen(x, y);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const [zpx, zpy] = plot.toScreen(0, c);
    ctx.fillStyle = "#059669";
    ctx.beginPath();
    ctx.arc(zpx, zpy, 5, 0, Math.PI * 2);
    ctx.fill();

    if (Math.abs(a) < 1e-9) return;

    const vx = -b / (2 * a);
    const vy = f(a, b, c, vx);
    const [ax] = plot.toScreen(vx, 0);
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, plot.pad.t);
    ctx.lineTo(ax, plot.pad.t + plot.innerH());
    ctx.stroke();
    ctx.setLineDash([]);

    const [vpx, vpy] = plot.toScreen(vx, vy);
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(vpx, vpy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = "12px Plus Jakarta Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("頂点", vpx + 8, vpy - 8);
  }
};
