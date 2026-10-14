// Brim stage: the notch "island" shape, voice indicator, captions, and in-place card rendering (FLIP).
import { M, play, wait, reduceMotion } from './motion.js';
import { h, KIT, skeleton, reveal } from './kit.js';
import { Sound } from './sound.js';
import { guessSkeleton } from '../shared/skeleton.js';
const NOTCH_W = 190, NOTCH_H = 32, WING = 40, BAR_W = 420, OPEN_W = 460, R = { rest: 14, bar: 22, open: 26 };
export function createStage(root, { onAction = () => {}, notchWidth = NOTCH_W, notchHeight = NOTCH_H, floating = false } = {}) {
  if (floating) root.dataset.display = 'floating';
  const shape = h('div', { class: 'shape', role: 'region', 'aria-label': 'Brim assistant', 'aria-live': 'polite' });
  const orbC = h('canvas', { class: 'orb', width: 40, height: 40, 'aria-hidden': 'true' });
  const ind = h('div', { class: 'ind', 'aria-hidden': 'true' }, [0, 1, 2, 3, 4].map(() => h('i')));
  const top = h('div', { class: 'top', style: { height: `${notchHeight}px` } }, orbC, ind);
  const cap = h('div', { class: 'cap' }, h('div', { class: 'capline' }));
  const panel = h('div', { class: 'panel' });
  const inner = h('div', { class: 'inner', style: { width: `${OPEN_W}px` } }, top, cap, panel);
  shape.append(inner); root.append(shape);
  const restW = notchWidth + WING * 2;
  let size = 'rest', box = { w: restW, h: notchHeight }, card = null, phase = 'idle', level = 0, receiptTimer = null, holdTimer = null;
  const setBox = (w, hgt, s, easing, dur) => {
    const from = { w: shape.offsetWidth || box.w, h: shape.offsetHeight || box.h }; box = { w, h: hgt };
    shape.style.width = `${w}px`; shape.style.height = `${hgt}px`; shape.style.borderRadius = floating ? `${R[s] + 4}px` : `0 0 ${R[s]}px ${R[s]}px`;
    if (Math.abs(from.w - w) > .5 || Math.abs(from.h - hgt) > .5) play(shape, [{ width: `${from.w}px`, height: `${from.h}px` }, { width: `${w}px`, height: `${hgt}px` }], { duration: dur, easing });
    shape.dataset.size = s; size = s; root.dataset.size = s;
  };
  const contentH = () => notchHeight + (cap.hidden ? 0 : cap.offsetHeight) + (panel.hidden ? 0 : panel.scrollHeight) + (panel.hidden ? 0 : 14);
  function fit(target, kind) {
    const was = size; const w = target === 'rest' ? restW : target === 'bar' ? BAR_W : OPEN_W;
    const hh = target === 'rest' ? notchHeight : Math.min(innerHeight - 24, Math.max(notchHeight + 40, contentH()));
    const easing = was === 'rest' && target !== 'rest' ? (kind === 'drop' ? M.DROP : M.ARRIVE) : target === 'rest' ? M.MORPH : M.MORPH;
    const dur = easing === M.ARRIVE ? M.ARRIVE_MS : easing === M.DROP ? M.DROP_MS : M.MORPH_MS;
    setBox(w, hh, target, easing, dur);
  }
  // --- orb (original "ember" look: amber/coral currents in dark glass) ---
  const ctx = orbC.getContext('2d'); let tt = 0, lastT = performance.now();
  const SPEED = { idle: 0.15, listening: 0.8, thinking: 2.2, speaking: 1.2, error: 0, offline: 0 };
  function drawOrb(now) {
    const dt = (now - lastT) / 1000; lastT = now; tt += dt * (SPEED[phase] ?? .2) * (reduceMotion() ? 0.2 : 1);
    const W = 40, c = W / 2, r = 15 + level * 2.2; ctx.clearRect(0, 0, W, W);
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = '#120d08'; ctx.fillRect(0, 0, W, W);
    const muted = phase === 'error' || phase === 'offline';
    const cols = muted ? ['150,150,150', '110,110,110', '90,90,90'] : ['255,176,74', '255,110,80', '255,214,150'];
    cols.forEach((col, i) => { const a = tt * (1 + i * .45) + i * 2.1; const x = c + Math.cos(a) * r * .45, y = c + Math.sin(a * 1.3) * r * .45;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.1); g.addColorStop(0, `rgba(${col},${.85 - i * .15})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, W); });
    const hl = ctx.createRadialGradient(c - r * .35, c - r * .45, 0, c - r * .35, c - r * .45, r * .7); hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = hl; ctx.fillRect(0, 0, W, W);
    ctx.restore(); requestAnimationFrame(drawOrb);
  }
  requestAnimationFrame(drawOrb);
  function setPhase(p) { phase = p; root.dataset.phase = p; ind.dataset.mode = p === 'listening' || p === 'speaking' ? 'meter' : p === 'thinking' ? 'dots' : 'none'; if (p !== 'listening' && p !== 'speaking') setLevel(0); }
  function setLevel(l) { level = l; const bars = ind.children; for (let i = 0; i < bars.length; i++) { const k = [0.55, 0.85, 1, 0.8, 0.6][i]; bars[i].style.height = `${3 + Math.max(0, l * k * (0.7 + Math.random() * 0.6)) * 13}px`; } }
  const jobEl = h('span', { class: 'count', hidden: '' }); top.append(jobEl);
  function setJobs(n) { jobEl.textContent = String(n); const on = n > 1; if (on && jobEl.hidden) { jobEl.hidden = false; play(jobEl, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: M.ARRIVE }); } else if (!on) jobEl.hidden = true; ind.style.visibility = on ? 'hidden' : ''; }
  // --- caption ---
  function caption(text, { tone = '', sub = '' } = {}) {
    const line = cap.firstChild; cap.hidden = !text; line.dataset.tone = tone; line.replaceChildren(...[h('span', { class: 'ct', text: text || '' }), sub ? h('span', { class: 'cs', text: sub }) : null].filter(Boolean));
    if (text) play(line, [{ opacity: 0 }, { opacity: 1 }], { duration: M.FADE_MS, delay: 60, easing: M.EASE, fill: 'backwards' });
  }
  async function liveCaption(text, ms = 1400) { // word-by-word live transcription feel
    const words = text.split(' '); cap.hidden = false; const line = cap.firstChild; line.dataset.tone = 'user'; const span = h('span', { class: 'ct' }); line.replaceChildren(span);
    for (let i = 0; i < words.length; i++) { span.textContent = words.slice(0, i + 1).join(' '); await wait(ms / words.length); }
  }
  // --- cards ---
  const ctxFor = (c) => ({ act: (a) => onAction({ ...a, cardId: c.id }) });
  function renderCard(next, { sound = true } = {}) {
    const prev = card; card = next; clearTimeout(holdTimer);
    const rects = new Map(), texts = new Map();
    panel.querySelectorAll('[data-k]').forEach((el) => { const k = el.closest('[data-b]')?.dataset.b + '/' + el.dataset.k; rects.set(k, el.getBoundingClientRect()); texts.set(k, el.textContent); });
    const blockRects = new Map(); panel.querySelectorAll('[data-b]').forEach((el) => blockRects.set(el.dataset.b, el.getBoundingClientRect()));
    const oldNodes = [...panel.querySelectorAll('[data-b]')];
    const head = h('div', { class: 'ch' }, h('span', { class: `st ${next.status}` }), h('div', { class: 'grow' }, h('div', { class: 'title', 'data-k': 'title', text: next.title || next.utterance }), h('div', { class: 'muted', 'data-k': 'step', text: next.step || { ready: 'Done', 'needs-you': 'Needs you', error: 'Something went wrong', offline: 'Offline', working: 'Working…' }[next.status] })),
      h('button', { class: 'icon', 'aria-label': 'Dismiss', text: '×', onclick: () => onAction({ kind: 'dismiss', cardId: next.id }) }));
    head.dataset.b = '_head';
    let blocks = next.blocks || [];
    if (!blocks.length && next.status === 'working') blocks = [{ id: '_sk', type: '_sk', kind: guessSkeleton(next.utterance) }];
    const nodes = blocks.map((b) => { const el = h('div', { class: `blk b-${b.type}`, 'data-b': b.id }); el.append(...[b.type === '_sk' ? skeleton(b.kind) : (KIT[b.type]?.(b, ctxFor(next)) ?? [])].flat(Infinity).filter(Boolean)); if (b.type === '_sk') el.classList.add('sk'); return el; });
    // ghosts for removed blocks
    const keep = new Set(blocks.map((b) => b.id)); const pr = panel.getBoundingClientRect();
    const ghosts = oldNodes.filter((n) => n.dataset.b !== '_head' && !keep.has(n.dataset.b)).map((n) => { const r = blockRects.get(n.dataset.b); const g = n.cloneNode(true); Object.assign(g.style, { position: 'absolute', left: `${r.left - pr.left}px`, top: `${r.top - pr.top}px`, width: `${r.width}px`, pointerEvents: 'none' }); g.classList.add('ghost'); return g; });
    panel.replaceChildren(head, ...nodes, ...ghosts); panel.hidden = false;
    ghosts.forEach((g) => { const a = play(g, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(4px)' }], { duration: M.GHOST_MS, easing: M.IN, fill: 'forwards' }); setTimeout(() => g.remove(), M.GHOST_MS + 20); });
    let at = prev ? 40 : 160; let changed = false;
    for (const el of [head, ...nodes]) {
      const b = el.dataset.b; const old = blockRects.get(b);
      if (old) { const nr = el.getBoundingClientRect(); const dy = old.top - nr.top; if (Math.abs(dy) > .5) { play(el, [{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: M.MORPH_MS, easing: M.MORPH }); changed = true; } }
      const units = el.querySelectorAll('[data-k]');
      if (!units.length && !old) { play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: at, easing: M.OUT, fill: 'backwards' }); at += M.STAGGER_MS; }
      for (const u of units) { const k = b + '/' + u.dataset.k; if (texts.has(k) && texts.get(k) === u.textContent) continue; at = reveal(u, at, texts.get(k)); changed = true; }
    }
    requestAnimationFrame(() => fit('open'));
    if (sound) {
      if (!prev || prev.id !== next.id) Sound.play('appear');
      else if (prev.status !== next.status && next.status === 'needs-you') Sound.play('needs-you');
      else if (prev.status !== next.status && next.status === 'ready') Sound.play('ready');
      else if (prev.status !== next.status && next.status === 'error') Sound.play('error');
      else if (changed) Sound.play('reshape', { gain: .8 });
    }
    if (next.status === 'ready' && !next.pinned) holdTimer = setTimeout(() => collapse(next.receipt || null), M.READY_HOLD_MS);
  }
  async function collapse(receipt, { undo = null, tone = 'done' } = {}) {
    clearTimeout(holdTimer); clearTimeout(receiptTimer);
    if (card) { play(panel, [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }], { duration: 200, easing: M.IN, fill: 'forwards' }); }
    await wait(reduceMotion() ? 0 : 180); panel.replaceChildren(); panel.hidden = true; panel.getAnimations?.().forEach((a) => a.cancel()); card = null;
    if (receipt) {
      Sound.play(tone === 'failed' ? 'error' : 'sent');
      cap.hidden = false; const line = cap.firstChild; line.dataset.tone = tone;
      line.replaceChildren(...[h('span', { class: `rmark ${tone}`, text: tone === 'failed' ? '!' : '✓' }), h('span', { class: 'ct', text: receipt }), undo ? h('button', { class: 'mini', text: 'Undo', onclick: () => onAction({ kind: 'undo', token: undo.token }) }) : null].filter(Boolean));
      if (undo) line.append(h('i', { class: 'ttl', style: { animationDuration: `${undo.ttlMs}ms` } }));
      play(line, [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 80, easing: M.OUT, fill: 'backwards' });
      fit('bar'); setPhase('idle');
      receiptTimer = setTimeout(() => rest(), undo ? undo.ttlMs : tone === 'failed' ? 6000 : M.RECEIPT_MS);
    } else { Sound.play('dismiss'); rest(); }
  }
  function rest() { clearTimeout(receiptTimer); cap.hidden = true; panel.hidden = true; card = null; fit('rest'); }
  function bar(text, opts = {}) { panel.hidden = true; caption(text, opts); fit('bar', opts.drop ? 'drop' : undefined); }
  function open(c) { cap.hidden = true; renderCard(c); }
  cap.hidden = true; panel.hidden = true; fit('rest');
  return { root, shape, bar, open, update: renderCard, collapse, rest, setPhase, setLevel, setJobs, caption, liveCaption, get card() { return card; }, get size() { return size; } };
}
