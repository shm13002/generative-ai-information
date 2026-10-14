// Bootstraps the Brim renderer: browser (index.html / brim.html) or Electron overlay. Modes: ?demo, ?state=<name>, interactive.
import { createStage } from './stage.js';
import { Sound } from './sound.js';
import { M, play, wait } from './motion.js';
import { h } from './kit.js';
import { runDemo } from './demo.js';
import { createStore } from '../shared/store.js';
import { runMock } from '../agent/mock.js';
import { STATES } from './states.js';
const q = new URLSearchParams(location.search);
const electron = !!globalThis.brim;
document.body.classList.add(electron ? 'electron' : 'desktop');
if (q.has('rec')) document.body.classList.add('recording');
if (q.get('theme') === 'light') document.documentElement.dataset.theme = 'light';
if (q.has('reduce')) globalThis.__brimReduce = true;
if (!electron) document.body.append(
  h('div', { class: 'menubar' }, h('b', { text: '' }), h('b', { text: 'Pages' }), h('span', { text: 'File' }), h('span', { text: 'Edit' }), h('span', { text: 'View' }), h('span', { class: 'r', text: 'Tue 9:41 AM' })),
  h('div', { class: 'app' }, h('div', { class: 'tb' }, h('i'), h('i'), h('i')), h('div', { class: 'doc' }, h('h1', { text: 'Q4 Customer Review' }), h('p', { text: 'Draft · October 2026' }), [90, 76, 84, 60, 70].map((w) => h('div', { class: 'ln', style: { width: `${w}%` } })))),
  h('div', { class: 'hw', 'aria-hidden': 'true' }));
const root = h('div', { id: 'brim', 'data-size': 'rest' }); document.body.append(root);
const sub = h('div', { class: 'sub', role: 'status' }, h('i', { class: 'who' }), h('span')); document.body.append(sub);
const ui = { sub(text, who = 'brim') { if (!text) { play(sub, [{ opacity: getComputedStyle(sub).opacity }, { opacity: 0 }], { duration: 200, fill: 'forwards' }); return; } sub.className = `sub ${who}`; sub.lastChild.textContent = text; play(sub, [{ opacity: 0, transform: 'translateX(-50%) translateY(6px)' }, { opacity: 1, transform: 'translateX(-50%)' }], { duration: 260, easing: M.OUT, fill: 'forwards' }); } };
const store = createStore();
let grants = [];
const floating = q.get('display') === 'floating' || !!globalThis.brim?.floating;
if (floating && !electron) document.querySelector('.hw')?.remove();
const stage = createStage(root, { onAction, floating });
store.on((e) => { if (e.type === 'card') { if (!stage.card || stage.card.id !== e.card.id) stage.open(e.card); else stage.update(e.card); if (e.card.say) ui.sub(e.card.say, 'brim'); } });
async function onAction(a) {
  globalThis.brim?.action?.(a);
  if (a.kind === 'dismiss') { store.apply({ v: 1, op: 'remove', id: a.cardId }); stage.collapse(null); ui.sub(''); }
  else if (a.kind === 'approve') { Sound.play('approve'); const c = stage.card; const token = `u${Date.now()}`; let reverted = false;
    store.registerUndo(token, M.UNDO_MS, () => { reverted = true; }); store.apply({ v: 1, op: 'remove', id: a.cardId, receipt: 'Sent · undo available' });
    await stage.collapse('Sent · you can undo for 10 s', { undo: { token, ttlMs: M.UNDO_MS } }); void c; void reverted;
    if (a.choice === 'allow-recipient') grants.push({ kind: 'email.send', scope: 'this-recipient' }); }
  else if (a.kind === 'undo') { if (store.runUndo(a.token)) { Sound.play('undo'); const last = store.history[0]; if (last) store.recall(last.cardId); else stage.caption('Undone', { tone: 'done' }); } }
  else if (a.kind === 'deny') { Sound.play('dismiss'); store.apply({ v: 1, op: 'remove', id: a.cardId, receipt: 'Not sent' }); stage.collapse('Not sent', { tone: 'done' }); }
  else if (a.kind === 'recall') { const c = store.recall(a.cardId); if (c) stage.open(c); }
  else if (a.kind === 'retry') ask(stage.card?.utterance || '');
}
async function ask(text) {
  if (!text.trim()) return; Sound.play('listen-off'); stage.setPhase('thinking'); ui.sub(text, 'user');
  if (!navigator.onLine) { stage.open({ v: 1, id: 'off', rev: 0, utterance: text, status: 'offline', title: 'Offline', blocks: [{ id: 'o', type: 'offline', queued: 1 }] }); Sound.play('error'); return; }
  if (globalThis.brim?.ask) await new Promise((done) => globalThis.brim.ask(text, (m) => store.apply(m), done));
  else for await (const m of runMock(text)) store.apply(m);
  stage.setPhase('idle');
}
function history() { const items = store.history.map((x) => ({ cardId: x.cardId, title: x.title, at: x.at, status: x.status, receipt: x.receipt })); stage.open({ v: 1, id: 'hist', rev: Date.now(), utterance: 'history', status: 'ready', pinned: true, title: 'History', step: `${items.length} recent`, blocks: [{ id: 'h', type: 'history', items }] }); }
// Voice input via Web Speech API where available (Chrome/Electron with mic permission); otherwise typed input.
function listen() {
  const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition; Sound.play('listen-on'); stage.setPhase('listening'); stage.bar('Listening…', {});
  if (!SR) { stage.caption('Voice not available here — type instead', { tone: 'done' }); stage.setPhase('idle'); input?.focus(); return; }
  const r = new SR(); r.interimResults = true; r.lang = 'en-US'; let final = '';
  r.onresult = (e) => { const t = [...e.results].map((x) => x[0].transcript).join(''); stage.caption(t, { tone: 'user' }); stage.setLevel(0.6); if (e.results[e.results.length - 1].isFinal) final = t; };
  r.onerror = () => { stage.setPhase('error'); Sound.play('error'); stage.caption('Microphone unavailable', { tone: 'failed' }); };
  r.onend = () => { stage.setLevel(0); if (final) ask(final); else { stage.setPhase('idle'); stage.rest(); } }; r.start();
}
let input = null;
function controls() {
  input = h('input', { type: 'text', placeholder: 'Ask Brim… (Enter)', 'aria-label': 'Ask Brim' });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { ask(input.value); input.value = ''; } });
  const vol = h('input', { type: 'range', min: 0, max: 100, value: 80, 'aria-label': 'Volume', oninput: (e) => Sound.setVolume(e.target.value / 100) });
  const mute = h('button', { text: 'Mute', onclick: () => { Sound.setMuted(!Sound.muted); mute.textContent = Sound.muted ? 'Unmute' : 'Mute'; } });
  document.body.append(h('div', { class: 'controls' }, h('button', { text: 'Talk', onclick: listen }), input, h('button', { text: 'History', onclick: history }), h('button', { text: 'Demo', onclick: () => runDemo(stage, ui) }), vol, mute));
}
window.addEventListener('keydown', (e) => { if (e.altKey && e.code === 'Space') { e.preventDefault(); listen(); } if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); history(); } if (e.key === 'Escape' && stage.card) onAction({ kind: 'dismiss', cardId: stage.card.id }); });
globalThis.brim?.onHotkey?.(() => listen());
if (electron) { let inside = false; window.addEventListener('mousemove', (e) => { const r = stage.shape.getBoundingClientRect(); const now = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; if (now !== inside) { inside = now; globalThis.brim.pointer(now); } }); }
(async () => {
  await Sound.init(globalThis.__BRIM_SOUND_BASE || './sounds/', globalThis.__BRIM_SOUNDS || null);
  if (q.has('mute')) Sound.setMuted(true);
  globalThis.__brim = { stage, store, Sound, ask, history, onAction };
  const st = q.get('state');
  if (st && STATES[st]) { await STATES[st](stage, ui); document.body.dataset.ready = '1'; return; }
  if (!q.has('rec') && !electron) controls();
  if (q.has('demo')) { if (q.has('rec')) { const f = h('div', { style: { position: 'fixed', inset: 0, background: '#fff', zIndex: 99 } }); document.body.append(f); await wait(400); Sound.t0 = performance.now(); f.remove(); }
    document.body.dataset.demo = 'running'; await runDemo(stage, ui); document.body.dataset.demo = 'done'; }
  document.body.dataset.ready = '1';
})();
