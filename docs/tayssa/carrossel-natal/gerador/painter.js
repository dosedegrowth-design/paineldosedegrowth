// Pinta os fundos de Natal em aquarela (SVG), sem texto. Determinístico por semente.
(function () {
  const W = 1080, H = 1350;
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f = (n) => n.toFixed(1);

  const ORN = {
    vinho: ['#b0506a', '#6c1529', '#3a0713'],
    rose: ['#fff0f5', '#f4a6c0', '#d47896'],
    ouro: ['#fdf5e0', '#e6c993', '#b48f52'],
  };

  function defs(dark) {
    let g = '';
    for (const [k, [l, m, d]] of Object.entries(ORN)) {
      g += `<radialGradient id="g-${k}" cx="50%" cy="50%" r="58%" fx="34%" fy="30%">
        <stop offset="0" stop-color="${l}"/><stop offset=".5" stop-color="${m}"/><stop offset="1" stop-color="${d}"/></radialGradient>`;
    }
    return `<defs>${g}
      <linearGradient id="g-cap" x1="0" x2="1"><stop offset="0" stop-color="#b48f52"/><stop offset=".45" stop-color="#fbeec9"/><stop offset="1" stop-color="#a7834a"/></linearGradient>
      <filter id="wc" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="4" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation="1.1" result="b"/>
        <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9" result="gr"/>
        <feColorMatrix in="gr" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.45" result="ga"/>
        <feComposite in="b" in2="ga" operator="in"/>
      </filter>
      <filter id="wcn" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="2" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation=".45"/>
      </filter>
      <filter id="wash" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="11" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation="10"/>
      </filter>
      <filter id="orb" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="6" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="paper" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="21" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 ${dark ? '1' : '.29'}  0 0 0 0 ${dark ? '.9' : '.05'}  0 0 0 0 ${dark ? '.85' : '.12'}  ${dark ? '.08' : '.10'} 0 0 0 -.02"/>
      </filter>
      <filter id="fibra" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".006 .012" numOctaves="3" seed="33" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 ${dark ? '.9' : '.42'}  0 0 0 0 ${dark ? '.6' : '.1'}  0 0 0 0 ${dark ? '.5' : '.2'}  ${dark ? '.06' : '.045'} 0 0 0 -.02"/>
      </filter>
    </defs>`;
  }

  // ---------- peças ----------
  function wash(r, x, y, rx, ry, color, op) {
    return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${color}" opacity="${op}" filter="url(#wash)"/>`;
  }

  function branch(r, x, y, ang, len, s = 1, dark = false) {
    const greens = dark
      ? ['#2c5a44', '#3a6e53', '#4a8262', '#5b9873', '#6fae86']
      : ['#1f4636', '#2a5843', '#376a51', '#467d5f', '#5a9370'];
    const bend = (r() - 0.5) * len * 0.18;
    const px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
    const pt = (t) => [
      x + Math.cos(ang) * len * t + px * bend * Math.sin(Math.PI * t),
      y + Math.sin(ang) * len * t + py * bend * Math.sin(Math.PI * t),
    ];
    let under = '', needles = '';
    // véu de aquarela embaixo do galho
    const [mx, my] = pt(0.5);
    under += `<ellipse cx="${f(mx)}" cy="${f(my)}" rx="${f(len * 0.55)}" ry="${f(26 * s)}" transform="rotate(${f((ang * 180) / Math.PI)} ${f(mx)} ${f(my)})" fill="${greens[3]}" opacity="${dark ? 0.22 : 0.16}" filter="url(#wc)"/>`;
    // haste
    const [ex, ey] = pt(1), [qx, qy] = pt(0.5);
    needles += `<path d="M${f(x)} ${f(y)} Q${f(qx + px * bend * 0.3)} ${f(qy + py * bend * 0.3)} ${f(ex)} ${f(ey)}" stroke="#5a3a2c" stroke-width="${f(3.2 * s)}" fill="none" opacity=".55" stroke-linecap="round"/>`;
    const N = Math.max(8, Math.round((len / 5.2) * s));
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < N; i++) {
        const t = (i + r() * 0.6) / N;
        const [cx, cy] = pt(t);
        const nl = (16 + r() * 18) * s * (1 - 0.45 * t) * (pass ? 0.8 : 1);
        for (const side of [-1, 1]) {
          const a = ang + side * (0.55 + r() * 0.5);
          const tx = cx + Math.cos(a) * nl, ty = cy + Math.sin(a) * nl;
          const cxm = cx + Math.cos(a - side * 0.15) * nl * 0.5, cym = cy + Math.sin(a - side * 0.15) * nl * 0.5;
          const col = greens[Math.floor(r() * greens.length)];
          needles += `<path d="M${f(cx)} ${f(cy)} Q${f(cxm)} ${f(cym)} ${f(tx)} ${f(ty)}" stroke="${col}" stroke-width="${f((2.2 + r() * 2) * s)}" opacity="${f(0.45 + r() * 0.45)}" fill="none" stroke-linecap="round"/>`;
        }
      }
    }
    return `<g>${under}<g filter="url(#wcn)">${needles}</g></g>`;
  }

  function ornament(r, x, y, rad, kind, thread = 0) {
    const [, m, d] = ORN[kind];
    let s = '';
    if (thread) s += `<line x1="${f(x)}" y1="${f(y - rad - thread)}" x2="${f(x)}" y2="${f(y - rad)}" stroke="#c9a96a" stroke-width="1.6" opacity=".9"/>`;
    s += `<rect x="${f(x - rad * 0.22)}" y="${f(y - rad - rad * 0.2)}" width="${f(rad * 0.44)}" height="${f(rad * 0.26)}" rx="${f(rad * 0.05)}" fill="url(#g-cap)"/>`;
    s += `<g filter="url(#orb)"><circle cx="${f(x)}" cy="${f(y)}" r="${f(rad)}" fill="url(#g-${kind})" opacity=".93"/>
      <circle cx="${f(x)}" cy="${f(y)}" r="${f(rad * 0.93)}" fill="none" stroke="${d}" stroke-width="${f(rad * 0.12)}" opacity=".35" filter="url(#blur3)"/></g>`;
    s += `<ellipse cx="${f(x - rad * 0.34)}" cy="${f(y - rad * 0.38)}" rx="${f(rad * 0.26)}" ry="${f(rad * 0.16)}" fill="#fff" opacity=".6" transform="rotate(-30 ${f(x - rad * 0.34)} ${f(y - rad * 0.38)})" filter="url(#blur3)"/>`;
    s += `<circle cx="${f(x - rad * 0.4)}" cy="${f(y - rad * 0.42)}" r="${f(rad * 0.07)}" fill="#fff" opacity=".85"/>`;
    // reflexo dourado leve
    s += `<path d="M${f(x - rad * 0.8)} ${f(y + rad * 0.15)} Q${f(x)} ${f(y + rad * 0.5)} ${f(x + rad * 0.8)} ${f(y + rad * 0.15)}" stroke="${kind === 'ouro' ? '#fff6dc' : '#e6c993'}" stroke-width="${f(rad * 0.06)}" fill="none" opacity=".55"/>`;
    void m;
    return s;
  }

  function sparkle(x, y, s, op = 1, col = '#e6c993') {
    return `<path d="M${f(x)} ${f(y - s)} Q${f(x)} ${f(y)} ${f(x + s * 0.72)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)} Q${f(x)} ${f(y)} ${f(x - s * 0.72)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)}Z" fill="${col}" opacity="${op}" filter="url(#glow)"/>`;
  }
  function dust(r, x0, y0, x1, y1, n, dark) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      const big = r() < 0.18;
      if (big) s += sparkle(x, y, 7 + r() * 12, 0.75 + r() * 0.25);
      else s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 2.6)}" fill="${dark ? '#f3dca8' : '#d9b979'}" opacity="${f(0.35 + r() * 0.5)}"/>`;
    }
    return s;
  }

  // cacho de canto: galhos saindo do canto + bolas penduradas
  function corner(r, which, size = 1, dark = false) {
    const cx = which.includes('right') ? W + 20 : -20;
    const cy = which.includes('bottom') ? H + 20 : -20;
    const dirX = which.includes('right') ? -1 : 1;
    const dirY = which.includes('bottom') ? -1 : 1;
    const base = Math.atan2(dirY, dirX);
    let s = wash(r, cx + dirX * 170 * size, cy + dirY * 150 * size, 260 * size, 190 * size, '#f4a6c0', dark ? 0.12 : 0.3);
    const brs = [
      [base - 0.55, 330], [base + 0.55, 320], [base - 0.15, 380], [base + 0.2, 300], [base, 250],
    ];
    for (const [a, l] of brs) s += branch(r, cx, cy, a + (r() - 0.5) * 0.12, l * size, size, dark);
    // bolas
    const kinds = ['vinho', 'rose', 'ouro'];
    const spots = [[0.42, 0.0, 34], [0.3, 0.9, 26], [0.62, 0.48, 22]];
    spots.forEach(([d, off, rad], i) => {
      const a = base + (off - 0.45) * 0.9;
      const x = cx + Math.cos(a) * 330 * size * d * 1.25, y = cy + Math.sin(a) * 330 * size * d * 1.25;
      const hang = which.includes('top') ? 40 + i * 25 : 0;
      s += ornament(r, x, y + hang, rad * size * 1.25, kinds[i % 3], which.includes('top') ? hang + 10 : 0);
    });
    s += dust(r, Math.min(cx, cx + dirX * 420 * size), Math.min(cy, cy + dirY * 420 * size), Math.max(cx, cx + dirX * 420 * size), Math.max(cy, cy + dirY * 420 * size), 26, dark);
    return s;
  }

  function tree(r, cx, topY, baseY, w, dark = false) {
    let s = '';
    const h = baseY - topY;
    s += wash(r, cx, topY + h * 0.62, w * 0.5, h * 0.45, '#7fae8c', 0.12);
    s += wash(r, cx, baseY + 10, w * 0.6, 60, '#f4a6c0', 0.35);
    // tronco
    s += `<rect x="${f(cx - 16)}" y="${f(baseY - 40)}" width="32" height="90" fill="#6d4a37" opacity=".7" filter="url(#wc)"/>`;
    const L = 11;
    const tiers = [];
    for (let k = L - 1; k >= 0; k--) {
      const t = (k + 1) / L;
      const y = topY + h * (0.06 + 0.9 * (k / (L - 1)));
      const half = (w / 2) * (0.18 + 0.82 * t);
      tiers.push([y, half]);
      for (const side of [-1, 1]) {
        const n = 3 + Math.round(t * 2);
        for (let j = 0; j < n; j++) {
          const a = side > 0 ? 0.42 + r() * 0.35 - j * 0.1 : Math.PI - (0.42 + r() * 0.35 - j * 0.1);
          const len = half * (0.75 + r() * 0.35) * (1 - j * 0.15);
          s += branch(r, cx + side * 4, y - j * 10, a, len, 0.85 + t * 0.35, dark);
        }
      }
      s += branch(r, cx, y - 20, Math.PI / 2 + (r() - 0.5) * 0.4, 50 + t * 30, 0.9, dark);
    }
    // bolas dentro do triângulo
    const kinds = ['vinho', 'rose', 'ouro', 'vinho', 'ouro', 'rose'];
    let placed = [];
    for (let i = 0; i < 40 && placed.length < 13; i++) {
      const t = 0.18 + r() * 0.8;
      const y = topY + h * t;
      const half = (w / 2) * (0.18 + 0.82 * t) * 0.78;
      const x = cx + (r() * 2 - 1) * half;
      const rad = 15 + r() * 14 + t * 6;
      if (placed.some(([px, py, pr]) => Math.hypot(px - x, py - y) < pr + rad + 18)) continue;
      placed.push([x, y, rad]);
    }
    placed.forEach(([x, y, rad], i) => (s += ornament(r, x, y, rad, kinds[i % kinds.length])));
    // festão dourado
    for (let g = 0; g < 4; g++) {
      const t0 = 0.22 + g * 0.19;
      const y0 = topY + h * t0, half0 = (w / 2) * (0.18 + 0.82 * t0) * 0.85;
      const y1 = y0 + h * 0.11, half1 = half0 * 1.15;
      s += `<path d="M${f(cx - half0)} ${f(y0)} Q${f(cx)} ${f(y1 + 30)} ${f(cx + half1)} ${f(y1)}" stroke="#e6c993" stroke-width="3" fill="none" opacity=".6" stroke-dasharray="2 9" stroke-linecap="round"/>`;
    }
    // estrela
    s += `<g filter="url(#glow)">${sparkle(cx, topY - 6, 46, 1, '#e6c993')}${sparkle(cx, topY - 6, 22, 1, '#fff4d6')}</g>`;
    s += dust(r, cx - w * 0.7, topY - 80, cx + w * 0.7, baseY, 40, dark);
    return s;
  }

  function paperBase(r, dark) {
    let s = `<rect width="${W}" height="${H}" fill="${dark ? '#4a0d1f' : '#fbf0f3'}"/>`;
    if (dark) {
      s += `<radialGradient id="vig" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#7a1a31"/><stop offset=".55" stop-color="#560f24"/><stop offset="1" stop-color="#2e0612"/></radialGradient>`;
      s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
      s += wash(r, 540, 520, 420, 300, '#8a2340', 0.35);
    } else {
      s += wash(r, 900, 180, 300, 200, '#f4a6c0', 0.07);
      s += wash(r, 160, 1180, 300, 200, '#e6c993', 0.08);
    }
    s += `<rect width="${W}" height="${H}" filter="url(#fibra)"/>`;
    s += `<rect width="${W}" height="${H}" filter="url(#paper)"/>`;
    return s;
  }

  window.paint = function (cfg) {
    const r = rng(cfg.seed || 1);
    const dark = !!cfg.dark;
    let s = defs(dark) + paperBase(r, dark);
    for (const it of cfg.items || []) {
      if (it.t === 'tree') s += tree(r, it.x, it.top, it.base, it.w, dark);
      if (it.t === 'corner') s += corner(r, it.at, it.size || 1, dark);
      if (it.t === 'dust') s += dust(r, it.x0, it.y0, it.x1, it.y1, it.n, dark);
      if (it.t === 'ornament') s += ornament(r, it.x, it.y, it.r, it.kind, it.thread || 0);
      if (it.t === 'branch') s += branch(r, it.x, it.y, it.a, it.len, it.s || 1, dark);
      if (it.t === 'wash') s += wash(r, it.x, it.y, it.rx, it.ry, it.c, it.op);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
  };
})();
