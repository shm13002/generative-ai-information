// Spring presets (re-implementation). springEasing() samples a damped spring into CSS linear().
export const SPRINGS = { arrive: { stiffness: 120, damping: 17, ms: 700 }, morph: { stiffness: 210, damping: 26, ms: 560 } };
export const TIMING = {"revealMs": 300, "staggerMs": 60, "tapMs": 150, "phraseMs": 150, "phraseFadeMs": 260, "countMs": 750, "rowDrawMs": 110, "ruleDrawMs": 380, "growMs": 520, "ghostOutMs": 160, "panelContentFadeMs": 240, "panelContentDelayMs": 90, "islandResizeMs": 220, "hoverInMs": 160, "hoverOutMs": 320, "spinnerS": 0.9, "dotsPulseS": 1.4, "meterBarMs": 90};
export const EASING = {"ease": "cubic-bezier(.4,0,.2,1)", "out": "cubic-bezier(.2,.7,.2,1)", "in": "cubic-bezier(.5,0,.75,0)"};
export function springEasing(stiffness, damping, ms, samples = 48) {
  const w0 = Math.sqrt(stiffness), z = damping / (2 * w0), wd = w0 * Math.sqrt(Math.max(0, 1 - z * z));
  const x = t => z < 1 ? 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)) : 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  return 'linear(' + Array.from({ length: samples + 1 }, (_, i) => i === samples ? 1 : +x(i / samples * ms / 1000).toFixed(4)).join(', ') + ')';
}
