// Procedural ink shapes: torn paper edges, the ink splash that reveals DHAILSM,
// and the diagonal ink band behind the versus screen. Seeded so they render the same every load.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth random walk sampled at `count` points, mixed with fine tearing jitter. */
function roughLine(count, seed, { slow = 1, fast = 1 } = {}) {
  const r = rng(seed);
  const knots = Array.from({ length: Math.ceil(count / 12) + 2 }, () => r() * 2 - 1);
  const out = [];
  for (let i = 0; i < count; i++) {
    const f = i / 12;
    const k = Math.floor(f);
    const t = f - k;
    const s = t * t * (3 - 2 * t);
    const base = knots[k] * (1 - s) + knots[k + 1] * s;
    out.push(base * slow + (r() * 2 - 1) * 0.35 * fast + (r() < 0.08 ? (r() - 0.5) * 1.4 * fast : 0));
  }
  return out;
}

const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** Torn edge mask: filled below a jagged line in a 1000×100 box. */
export function tornMask(seed) {
  const n = 140;
  const line = roughLine(n + 1, seed, { slow: 1, fast: 1 });
  const pts = line.map((v, i) => `${((i / n) * 1000).toFixed(1)},${(50 + v * 22).toFixed(1)}`);
  const d = `M0,100 L${pts.join(' L')} L1000,100 Z`;
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="${d}" fill="#000"/></svg>`);
}

/** Ink splash: a wobbling blob with flung arms and droplets, in a 200×200 box. */
export function splashMask(seed, { radius = 56, arms = 8, drops = 12 } = {}) {
  const r = rng(seed);
  const waves = [2, 3, 5, 7].map((k) => ({ k, a: (r() * 0.08 + 0.02) / (k / 2), p: r() * Math.PI * 2 }));
  const spikes = Array.from({ length: arms }, () => ({ at: r() * Math.PI * 2, len: 10 + r() * 26, w: 0.035 + r() * 0.06 }));
  const steps = 220;
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    let rad = radius;
    for (const w of waves) rad += radius * w.a * Math.sin(w.k * th + w.p);
    for (const s of spikes) {
      let d = Math.abs(th - s.at);
      d = Math.min(d, Math.PI * 2 - d);
      rad += s.len * Math.exp(-((d / s.w) ** 2));
    }
    rad += (r() - 0.5) * 2.2;
    pts.push(`${(100 + Math.cos(th) * rad).toFixed(2)},${(100 + Math.sin(th) * rad).toFixed(2)}`);
  }
  let circles = '';
  for (let i = 0; i < drops; i++) {
    const th = r() * Math.PI * 2;
    const dist = radius + 14 + r() * 26;
    const cr = 1.2 + r() * 3.6;
    circles += `<circle cx="${(100 + Math.cos(th) * dist).toFixed(2)}" cy="${(100 + Math.sin(th) * dist).toFixed(2)}" r="${cr.toFixed(2)}"/>`;
  }
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="#000"><path d="M${pts.join(' L')} Z"/>${circles}</g></svg>`,
  );
}

/** Diagonal ink band (bottom-left to top-right) with torn edges, for a 1000×1000 box. */
export function inkBandPath(seed) {
  const n = 90;
  const top = roughLine(n + 1, seed, { slow: 1.4, fast: 1 });
  const bottom = roughLine(n + 1, seed + 7, { slow: 1.4, fast: 1 });
  const edge = (y0, y1, line, scale) =>
    line.map((v, i) => {
      const x = -20 + (i / n) * 1040;
      const y = y0 + (y1 - y0) * (i / n) + v * scale;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  const a = edge(700, 170, top, 14);
  const b = edge(470, 1000, bottom, 14).reverse();
  return `M${a.join(' L')} L${b.join(' L')} Z`;
}
