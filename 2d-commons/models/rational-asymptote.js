function rationalValue(a, p, q, x) {
  return a / (x - p) + q;
}

export default {
  id: "rational-asymptote",
  category: "math",
  categoryLabel: "数II・分数関数",
  title: "分数関数と漸近線",
  description: "分数関数（$a\\ne0$）$y=\\dfrac{a}{x-p}+q$ は、$x=p$ に近づくと上下へ発散し、$x=p$ と $y=q$ に限りなく近づきます。スライダーで「届かない境界」の位置を動かします。",
  formula: "y=\\frac{a}{x-p}+q",
  legend: [
    { color: "#0284c7", label: "分数関数 $y=\\dfrac{a}{x-p}+q$" },
    { color: "#e11d48", label: "垂直漸近線 $x=p$" },
    { color: "#d97706", label: "水平漸近線 $y=q$" }
  ],
  views: {
    standard: { name: "標準 $a=1,p=0,q=0$", params: { a: 1, p: 0, q: 0 }, default: true },
    shift: { name: "右上へ移動", params: { a: 2, p: 2, q: 1 } },
    flip: { name: "上下反転", params: { a: -1, p: 0, q: 0 } }
  },
  parameters: {
    a: { label: "倍率 $a$", min: -4, max: 4, step: 0.1, value: 1 },
    p: { label: "縦の境界 $p$", min: -4, max: 4, step: 0.1, value: 0 },
    q: { label: "横の境界 $q$", min: -4, max: 4, step: 0.1, value: 0 }
  },

  onParamChange(_plot, state) {
    this.updateStatus(state);
  },

  init(_plot, state) {
    this.updateStatus(state);
  },

  updateStatus(state) {
    const { a, p, q } = state.params;
    if (Math.abs(a) < 1e-9) {
      window.setModelStatus(
        `$a=0$ の退化ケース　／　$x=${p.toFixed(1)}$ は穴、水平線 $y=${q.toFixed(1)}$ に一致`
      );
      return;
    }
    window.setModelStatus(
      `$x=${p.toFixed(1)}$ では定義されない　／　漸近線 $x=${p.toFixed(1)}$, $y=${q.toFixed(1)}$`
    );
  },

  draw(ctx, plot, state) {
    const { a, p, q } = state.params;
    const n = Math.max(120, Math.floor(plot.innerW()));
    const top = plot.pad.t;
    const bottom = plot.pad.t + plot.innerH();
    const left = plot.pad.l;
    const right = plot.pad.l + plot.innerW();

    // Asymptotes are reference lines, not part of the function.
    const [pLeft] = plot.toScreen(p, 0);
    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#e11d48";
    ctx.beginPath();
    ctx.moveTo(pLeft, top);
    ctx.lineTo(pLeft, bottom);
    ctx.stroke();

    const [, qTop] = plot.toScreen(0, q);
    ctx.strokeStyle = "#d97706";
    ctx.beginPath();
    ctx.moveTo(left, qTop);
    ctx.lineTo(right, qTop);
    ctx.stroke();
    ctx.restore();

    // Draw the two branches separately; never connect across x = p.
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.4;
    for (const [start, end] of [
      [plot.xMin, Math.min(plot.xMax, p - 1e-4)],
      [Math.max(plot.xMin, p + 1e-4), plot.xMax]
    ]) {
      if (start >= end) continue;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= n; i++) {
        const x = start + (i / n) * (end - start);
        const y = rationalValue(a, p, q, x);
        const [px, py] = plot.toScreen(x, y);
        const visible = Number.isFinite(y) && py >= top - 2 && py <= bottom + 2;
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
  }
};
