function f(a, b, c, x) {
  return a * x * x + b * x + c;
}

export default {
  id: "quadratic-discriminant",
  category: "math",
  categoryLabel: "数I・二次方程式",
  title: "二次方程式の解と判別式",
  description: "グラフと $x$ 軸の交点が解です。判別式 $D=b^2-4ac$ の符号が、交点の個数そのものです。",
  formula: "D = b^2 - 4ac",
  legend: [
    { color: "#0284c7", label: "グラフ $y=ax^2+bx+c$" },
    { color: "#e11d48", label: "実数解（$x$ 軸との交点）" },
    { color: "#94a3b8", label: "$x$ 軸" }
  ],
  views: {
    two: { name: "異なる2実数解", params: { a: 1, b: -3, c: 2 }, default: true },
    one: { name: "重解", params: { a: 1, b: 2, c: 1 } },
    none: { name: "実数解なし", params: { a: 1, b: 0, c: 2 } }
  },
  parameters: {
    a: { label: "$a$", min: -2, max: 2, step: 0.1, value: 1 },
    b: { label: "$b$", min: -6, max: 6, step: 0.1, value: -3 },
    c: { label: "$c$", min: -6, max: 6, step: 0.1, value: 2 }
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
      window.setModelStatus("$a=0$ では二次方程式になりません。");
      return;
    }
    const D = b * b - 4 * a * c;
    if (D > 1e-9) {
      const s = Math.sqrt(D);
      const x1 = (-b - s) / (2 * a);
      const x2 = (-b + s) / (2 * a);
      window.setModelStatus(`$D=${D.toFixed(2)}>0$　解 $x=${x1.toFixed(2)},\\ ${x2.toFixed(2)}$`);
    } else if (D >= -1e-9) {
      const x = -b / (2 * a);
      window.setModelStatus(`$D=0$　重解 $x=${x.toFixed(2)}$（接する）`);
    } else {
      window.setModelStatus(`$D=${D.toFixed(2)}<0$　実数解なし（$x$ 軸と交わらない）`);
    }
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

    if (Math.abs(a) < 1e-9) return;
    const D = b * b - 4 * a * c;
    const roots = [];
    if (D > 1e-9) {
      const s = Math.sqrt(D);
      roots.push((-b - s) / (2 * a), (-b + s) / (2 * a));
    } else if (D >= -1e-9) {
      roots.push(-b / (2 * a));
    }
    for (const x of roots) {
      const [px, py] = plot.toScreen(x, 0);
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.font = "12px Plus Jakarta Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`x=${x.toFixed(2)}`, px, py + 16);
    }
  }
};
