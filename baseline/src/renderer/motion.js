// Brim motion: springs sampled into CSS linear(), WAAPI helpers, reduced-motion aware.
export const reduceMotion = () => !!(globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || globalThis.__brimReduce === true;
export function spring(stiffness, damping, ms, n = 40) {
  const w0 = Math.sqrt(stiffness), z = damping / (2 * Math.sqrt(stiffness)), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * (ms / 1000);
    let x;
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); x = 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
    else x = 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    pts.push(+x.toFixed(4));
  }
  pts[n] = 1; return `linear(${pts.join(',')})`;
}
// Brim's own feel: a touch bouncier on arrival, crisp on morph.
export const M = {
  ARRIVE: spring(140, 15, 760), ARRIVE_MS: 760,
  MORPH: spring(230, 27, 520), MORPH_MS: 520,
  DROP: spring(180, 14, 680), DROP_MS: 680,
  OUT: 'cubic-bezier(.16,.84,.3,1)', IN: 'cubic-bezier(.55,0,.8,.2)', EASE: 'cubic-bezier(.33,0,.15,1)',
  FADE_MS: 220, STAGGER_MS: 55, PHRASE_MS: 140, PHRASE_FADE_MS: 280, COUNT_MS: 820, ROW_MS: 95, GROW_MS: 560, GHOST_MS: 170,
  RECEIPT_MS: 3400, READY_HOLD_MS: 9000, UNDO_MS: 10000,
};
export function play(el, frames, opts) {
  if (!el || !el.animate) return null;
  if (reduceMotion()) { const last = frames[frames.length - 1]; const o = { ...opts, duration: Math.min(120, opts.duration || 0), delay: 0, easing: 'linear' };
    if (frames.some((f) => 'opacity' in f)) return el.animate([{ opacity: frames[0].opacity ?? 1 }, { opacity: last.opacity ?? 1 }], o); return null; }
  return el.animate(frames, opts);
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
