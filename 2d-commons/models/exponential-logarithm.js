function expValue(base, x) {
  return Math.pow(base, x);
}

export default {
  id: "exponential-logarithm",
  category: "math",
  categoryLabel: "数II・指数関数と対数関数",
  title: "指数関数と対数関数は逆関数",
  description: "指数関数 $y=a^x$ と対数関数 $y=\\log_a x$ は、直線 $y=x$ に関して対称な逆関数です。底 $a$ を動かし、増え方と対称性を確認します。",
  formula: "y=a^x \\quad\\Longleftrightarrow\\quad y=\\log_a x",
  legend: [
    { color: "#0284c7", label: "指数関数 $y=a^x$" },
    { color: "#e11d48", label: "対数関数 $y=\\log_a x$" },
    { color: "#94a3b8", label: "対称の軸 $y=x$" }
  ],
  views: {
    e: { name: "自然対数 $a=e$", params: { base: Math.E }, default: true },
    two: { name: "底 $2$", params: { base: 2 } },
    ten: { name: "常用対数 $10$", params: { base: 10 } }
  },
  parameters: {
    base: {
      label: "底 $a$（$a>1$）",
      min: 1.2,
      max: 10,
      step: 0.1,
      value: Math.E,
      formatValue(value) {
        return Math.abs(value - Math.E) < 0.005 ? "e≈2.718" : value.toFixed(1);
      }
    }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    this.updateStatus(state);
  },

  updateStatus(state) {
    const a = state.params.base;
    window.setModelStatus(
      `底 $a=${a.toFixed(1)}$　／　$y=a^x$ と $y=\\log_a x$ は $y=x$ に関して対称`
    );
  },

  draw(ctx, plot, state) {
    const a = state.params.base;
    const n = Math.max(100, Math.floor(plot.innerW()));

    // y = x: the reference line for inverse-function symmetry.
    ctx.beginPath();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    const [x1, y1] = plot.toScreen(plot.xMin, plot.xMin);
    const [x2, y2] = plot.toScreen(plot.xMax, plot.xMax);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // y = a^x. Clip by the visible plot range to avoid an artificial jump.
    ctx.beginPath();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.4;
    let started = false;
    for (let i = 0; i <= n; i++) {
      const x = plot.xMin + (i / n) * (plot.xMax - plot.xMin);
      const y = expValue(a, x);
      const [px, py] = plot.toScreen(x, y);
      const visible = Number.isFinite(y) && py >= plot.pad.t - 2 && py <= plot.pad.t + plot.innerH() + 2;
      if (visible) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();

    // y = log_a(x), whose domain is x > 0.
    ctx.beginPath();
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2.4;
    started = false;
    const logMin = Math.max(Number.EPSILON, plot.xMin);
    for (let i = 0; i <= n; i++) {
      const x = logMin + (i / n) * (plot.xMax - logMin);
      const y = Math.log(x) / Math.log(a);
      const [px, py] = plot.toScreen(x, y);
      const visible = Number.isFinite(y) && py >= plot.pad.t - 2 && py <= plot.pad.t + plot.innerH() + 2;
      if (visible) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
  }
};
