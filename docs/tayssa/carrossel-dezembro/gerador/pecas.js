// Peças de colagem montadas no navegador: papel rasgado, fita, rabiscos.
(function () {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // contorno rasgado: lados em "rasgo" (t, r, b, l) ganham serrilhado fino
  function rasgado(w, h, lados, seed, amp) {
    const r = rng(seed);
    const pts = [];
    const lado = (x0, y0, x1, y1, on, nx, ny) => {
      const len = Math.hypot(x1 - x0, y1 - y0);
      const n = on ? Math.max(8, Math.round(len / 7)) : 1;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        let x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        if (on && i > 0) { const d = (r() * 0.85 + 0.15) * amp; x += nx * d; y += ny * d; }
        pts.push([x, y]);
      }
    };
    lado(0, 0, w, 0, lados.includes('t'), 0, 1);
    lado(w, 0, w, h, lados.includes('r'), -1, 0);
    lado(w, h, 0, h, lados.includes('b'), 0, -1);
    lado(0, h, 0, 0, lados.includes('l'), 1, 0);
    return 'polygon(' + pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',') + ')';
  }
  window.montarPecas = function () {
    document.querySelectorAll('[data-rasgo]').forEach((el, i) => {
      const { width: w, height: h } = el.getBoundingClientRect();
      const rot = el.closest('[data-rot]');
      const W = el.offsetWidth, H = el.offsetHeight;
      el.style.clipPath = rasgado(W, H, el.dataset.rasgo, +(el.dataset.seed || i + 7), +(el.dataset.amp || 7));
      void w; void h; void rot;
    });
  };
})();
