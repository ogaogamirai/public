function f(a, b, c, x) {
  return a * x * x + b * x + c;
}

export default {
  id: "inequality-region",
  category: "math",
  categoryLabel: "数I・二次不等式",
  title: "不等式が表す領域",
  description: "境界のグラフは等式、塗りは不等式の「こちら側」です。以上と以下を切り替えて、境界が残ることを確認してください。",
  formula: "y \\ge ax^2 + bx + c",
  legend: [
    { color: "#7dd3fc", label: "領域（不等式が成り立つ側）" },
    { color: "#0284c7", label: "境界（等式）" }
  ],
  views: {
    ge: { name: "上側 $y\\ge f(x)$", side: 1, default: true },
    le: { name: "下側 $y\\le f(x)$", side: -1 }
  },
  parameters: {
    a: { label: "$a$", min: -2, max: 2, step: 0.1, value: 0.5 },
    b: { label: "$b$", min: -6, max: 6, step: 0.1, value: 0 },
    c: { label: "$c$", min: -6, max: 6, step: 0.1, value: -1 }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    if (state.params.side == null) state.params.side = 1;
    this.updateStatus(state);
  },

  updateStatus(state) {
    const ge = (state.params.side ?? 1) >= 0;
    window.setModelStatus(ge
      ? "塗りは曲線の上側。境界の曲線上も含む（$\\ge$）。"
      : "塗りは曲線の下側。境界の曲線上も含む（$\\le$）。");
    const formulaEl = document.getElementById("model-formula");
    if (formulaEl && window.katex) {
      try {
        katex.render(ge ? "y \\ge ax^2 + bx + c" : "y \\le ax^2 + bx + c", formulaEl, {
          displayMode: false, throwOnError: false
        });
      } catch { /* keep previous */ }
    }
  },

  draw(ctx, plot, state) {
    const { a, b, c } = state.params;
    const side = state.params.side ?? 1;
    const n = Math.max(80, Math.floor(plot.innerW()));
    const top = plot.pad.t;
    const bot = plot.pad.t + plot.innerH();

    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const x = plot.xMin + (i / n) * (plot.xMax - plot.xMin);
      const y = f(a, b, c, x);
      const [px, py] = plot.toScreen(x, y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    if (side >= 0) {
      const [pe] = plot.toScreen(plot.xMax, 0);
      const [ps] = plot.toScreen(plot.xMin, 0);
      ctx.lineTo(pe, top);
      ctx.lineTo(ps, top);
    } else {
      const [pe] = plot.toScreen(plot.xMax, 0);
      const [ps] = plot.toScreen(plot.xMin, 0);
      ctx.lineTo(pe, bot);
      ctx.lineTo(ps, bot);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(14, 165, 233, 0.22)";
    ctx.fill();

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
  }
};
