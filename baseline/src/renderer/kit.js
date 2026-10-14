// Brim card kit: one renderer per block type. Text is always set with textContent (never innerHTML).
import { M, play, reduceMotion } from './motion.js';
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = String(v); else if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (k === 'style') Object.assign(el.style, v); else el.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const lab = (a, b) => h('div', { class: 'lab' }, h('span', { text: a || '' }), b ? h('span', { text: b }) : null);
const initials = (n = '') => n.split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
const P = (text, k, cls = '') => h('div', { class: cls, 'data-k': k, 'data-m': 'phrase', text });
export function sparkline(series = []) {
  if (series.length < 2) return null;
  const W = 400, H = 48, mn = Math.min(...series), mx = Math.max(...series), sc = (v) => H - 4 - ((v - mn) / (mx - mn || 1)) * (H - 8);
  const d = series.map((v, i) => `${i ? 'L' : 'M'}${((i / (series.length - 1)) * W).toFixed(1)},${sc(v).toFixed(1)}`).join(' ');
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'spark'); svg.setAttribute('preserveAspectRatio', 'none');
  const area = document.createElementNS(ns, 'path'); area.setAttribute('d', `${d} L${W},${H} L0,${H} Z`); area.setAttribute('class', 'area');
  const line = document.createElementNS(ns, 'path'); line.setAttribute('d', d); line.setAttribute('class', 'line'); line.setAttribute('pathLength', '1');
  svg.append(area, line); svg.dataset.m = 'draw'; svg.dataset.k = 'spark'; return svg;
}
export const KIT = {
  answer: (b) => [P(b.text, 'a', 'ans'), b.detail ? P(b.detail, 'd', 'muted') : null, b.sources?.length ? h('div', { class: 'tags', 'data-k': 'src', 'data-m': 'pop' }, b.sources.map((s) => h('span', { class: 'tag', text: s }))) : null],
  note: (b) => [lab(b.label || 'Note'), P(b.text, 't', 'ans')],
  number: (b) => [lab(b.label, b.source), h('div', { class: 'numrow' }, h('span', { class: 'big', 'data-k': 'v', 'data-m': 'count', text: b.value }), b.delta ? h('span', { class: `delta ${b.up === false ? 'down' : ''}`, 'data-k': 'dl', 'data-m': 'pop', text: b.delta }) : null), sparkline(b.series)],
  list: (b) => [lab(b.label, `${b.rows.length} rows`), h('table', null, h('tr', { 'data-k': 'hd', 'data-m': 'row' }, b.columns.map((c, i) => h('th', { class: i ? 'r' : '', text: c }))),
    b.rows.map((r, ri) => h('tr', { class: ri === b.highlight ? 'hi' : '', 'data-k': `r${ri}:${r[0]}`, 'data-m': 'row' }, r.map((c, i) => h('td', { class: i ? 'r' : '', text: c })))))],
  brief: (b) => [b.title ? P(b.title, 'tt', 'title') : null, h('ul', { class: 'bul' }, b.bullets.map((x, i) => h('li', { 'data-k': `b${i}`, 'data-m': 'phrase', text: x }))),
    (b.people || []).map((p) => h('div', { class: 'prow', 'data-k': `p:${p.name}`, 'data-m': 'row' }, h('span', { class: 'av', text: initials(p.name) }), h('div', null, h('b', { text: p.name }), h('div', { class: 'muted', text: [p.role, p.note].filter(Boolean).join(' · ') }))))],
  todo: (b, ctx) => [lab(b.label || 'Needs you', String(b.items.filter((x) => !x.done).length)), b.items.map((x, i) => h('div', { class: `trow ${x.done ? 'done' : ''}`, 'data-k': `t:${x.id}`, 'data-m': 'row' },
    h('span', { class: 'n', text: String(i + 1) }), h('div', { class: 'grow' }, h('div', { class: 'tt', text: x.title }), x.detail ? h('div', { class: 'muted', text: x.detail }) : null),
    x.done ? h('span', { class: 'tag ok', text: 'Done' }) : h('div', { class: 'acts' }, x.action ? h('button', { class: 'mini', text: x.action, onclick: () => ctx?.act({ kind: 'primary', blockId: b.id, itemId: x.id }) }) : null, h('button', { class: 'mini quiet', text: 'Done', 'aria-label': `Mark ${x.title} done`, onclick: () => ctx?.act({ kind: 'done', blockId: b.id, itemId: x.id }) }))))],
  agenda: (b) => [lab(b.label || 'Today'), b.items.map((x, i) => h('div', { class: `arow ${x.state || ''}`, 'data-k': `g:${x.id || i}:${x.time}`, 'data-m': 'row' }, h('span', { class: 'tm', text: x.time }), h('div', { class: 'grow' }, h('div', { class: 'tt', text: x.title }), x.meta ? h('div', { class: 'muted', text: x.meta }) : null),
    x.state ? h('span', { class: `tag ${x.state}`, text: { done: 'Done', next: 'Next', conflict: 'Overlaps', moved: 'Moved', new: 'New' }[x.state] }) : null))],
  person: (b) => [h('div', { class: 'prow big', 'data-k': 'hd', 'data-m': 'pop' }, h('span', { class: 'av lg', text: initials(b.name) }), h('div', null, h('div', { class: 'title', text: b.name }), h('div', { class: 'muted', text: [b.role, b.org].filter(Boolean).join(' · ') }))),
    b.note ? P(b.note, 'nt', 'ans') : null, b.facts?.length ? h('div', { class: 'facts' }, b.facts.map((f, i) => h('div', { 'data-k': `f${i}`, 'data-m': 'row' }, h('span', { class: 'muted', text: f.label }), h('b', { text: f.value })))) : null],
  created: (b) => [h('div', { class: 'prow', 'data-k': 'c', 'data-m': 'pop' }, h('span', { class: 'av sq ok', text: '✓' }), h('div', null, h('div', { class: 'tt', text: b.title }), h('div', { class: 'muted', text: [b.kind, b.detail].filter(Boolean).join(' · ') })))],
  progress: (b) => [h('div', { class: 'steps' }, b.steps.map((s, i) => h('div', { class: `step ${s.state}`, 'data-k': `s${i}:${s.state}`, 'data-m': 'row' }, h('i'), h('span', { text: s.text }))))],
  connect: (b, ctx) => [P(b.label || `Connect ${b.provider}`, 'l', 'ans'), h('div', { class: 'btns', 'data-k': `st:${b.state}`, 'data-m': 'pop' }, b.state === 'connected' ? h('span', { class: 'tag ok', text: 'Connected' }) : h('button', { class: 'btn primary', text: b.state === 'connecting' ? 'Connecting…' : 'Connect', disabled: b.state === 'connecting' ? '' : null, onclick: () => ctx?.act({ kind: 'connect', blockId: b.id }) })), b.error ? h('div', { class: 'err', text: b.error }) : null],
  email: (b, ctx) => [h('div', { class: 'mail' }, h('div', { class: 'muted', 'data-k': 'to', 'data-m': 'phrase', text: `To ${b.to.join(', ')}` }), h('div', { class: 'tt', 'data-k': 'sj', 'data-m': 'phrase', text: b.subject }), h('div', { class: 'body', 'data-k': 'bd', 'data-m': 'phrase', text: b.body })),
    b.state === 'sent' ? h('div', { class: 'tag ok', 'data-k': 'sent', 'data-m': 'pop', text: 'Sent' }) : null],
  approval: (b, ctx) => {
    const label = { 'allow-once': 'Allow once', 'allow-recipient': 'Always for this person', 'allow-kind': 'Always for this kind', edit: 'Edit', deny: 'Deny' };
    return [h('div', { class: `appr risk-${b.risk || 'medium'}`, role: 'alertdialog', 'aria-label': b.title, 'data-k': 'ap', 'data-m': 'drop' }, h('div', { class: 'tt', text: b.title }), b.detail ? h('div', { class: 'muted', text: b.detail }) : null,
      b.state && b.state !== 'pending' ? h('span', { class: `tag ${b.state === 'approved' ? 'ok' : ''}`, text: b.state }) :
      h('div', { class: 'btns' }, b.choices.map((c, i) => h('button', { class: `btn ${i === 0 ? 'primary' : ''}`, text: label[c], onclick: () => ctx?.act({ kind: c === 'deny' ? 'deny' : c === 'edit' ? 'edit' : 'approve', blockId: b.id, choice: c }) }))))];
  },
  undo: (b, ctx) => [h('div', { class: 'undo', 'data-k': 'u', 'data-m': 'pop' }, h('span', { text: b.label }), h('button', { class: 'mini', text: 'Undo', onclick: () => ctx?.act({ kind: 'undo', token: b.token }) }), h('i', { class: 'ttl', style: { animationDuration: `${b.ttlMs}ms` } }))],
  error: (b, ctx) => [h('div', { class: 'errcard', role: 'alert', 'data-k': 'e', 'data-m': 'pop' }, h('span', { class: 'dot fail' }), h('div', { class: 'grow' }, h('div', { class: 'tt', text: b.title }), b.detail ? h('div', { class: 'muted', text: b.detail }) : null),
    h('div', { class: 'acts' }, b.fix ? h('button', { class: 'mini', text: b.fix, onclick: () => ctx?.act({ kind: 'open', blockId: b.id }) }) : null, b.retry ? h('button', { class: 'mini', text: 'Try again', onclick: () => ctx?.act({ kind: 'retry', blockId: b.id }) }) : null))],
  offline: (b) => [h('div', { class: 'errcard', role: 'status', 'data-k': 'o', 'data-m': 'pop' }, h('span', { class: 'dot warn' }), h('div', { class: 'grow' }, h('div', { class: 'tt', text: 'You’re offline' }), h('div', { class: 'muted', text: b.detail || `${b.queued || 0} request(s) queued — they’ll run when you’re back.` })))],
  history: (b, ctx) => [lab('Recent', `${b.items.length}`), b.items.map((x) => h('button', { class: 'hrow', 'data-k': `h:${x.cardId}`, 'data-m': 'row', onclick: () => ctx?.act({ kind: 'recall', cardId: x.cardId }) }, h('span', { class: `dot ${x.status === 'error' ? 'fail' : 'ok'}` }), h('span', { class: 'grow tt', text: x.title }), h('span', { class: 'muted', text: x.receipt || x.at.slice(11, 16) })))],
  permission: (b, ctx) => [h('div', { class: 'prow', 'data-k': 'pm', 'data-m': 'pop' }, h('span', { class: 'av sq', text: '◎' }), h('div', { class: 'grow' }, h('div', { class: 'tt', text: `Allow ${b.capability.replace('-', ' ')}` }), h('div', { class: 'muted', text: b.why })),
    b.state === 'granted' ? h('span', { class: 'tag ok', text: 'Allowed' }) : h('button', { class: 'btn primary', text: 'Open Settings', onclick: () => ctx?.act({ kind: 'open', blockId: b.id }) }))],
  source: (b) => [lab(b.label || 'Sources'), b.items.map((x, i) => h('div', { class: 'srow', 'data-k': `sr${i}`, 'data-m': 'row' }, h('span', { class: `tag ${x.trust === 'untrusted' ? 'warn' : ''}`, text: x.origin }), h('span', { class: 'grow', text: x.title }), x.trust === 'untrusted' ? h('span', { class: 'muted', text: 'external · treated as data' }) : null))],
};
export function skeleton(kind) {
  const line = (w) => h('i', { style: { width: `${w}%` } });
  const lines = (ws) => h('div', { class: 'sk-lines' }, ws.map(line));
  if (kind === 'number') return [lines([28]), h('div', { class: 'sk-big' }), lines([100])];
  if (['todo', 'agenda', 'list'].includes(kind)) return [0, 1, 2, 3].map(() => h('div', { class: 'sk-row' }, h('i', { class: 'c' }), lines([68, 42])));
  if (kind === 'email') return [lines([38, 56, 100, 94, 97, 32])];
  if (kind === 'person') return [h('div', { class: 'sk-row' }, h('i', { class: 'c lg' }), lines([50, 32])), lines([92, 70])];
  return [lines([96, 86, 60])];
}
// --- reveals ---
function phraseSplit(text) { const parts = text.match(/[^,.;:!?—]+[,.;:!?—]*\s*/g) || [text]; return parts.flatMap((p) => { const w = p.split(/(?<=\s)/); const out = []; for (let i = 0; i < w.length; i += 4) out.push(w.slice(i, i + 4).join('')); return out; }); }
export function reveal(el, at, prevText) {
  const m = el.dataset.m; if (reduceMotion()) { play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: 'backwards' }); return at; }
  if (m === 'phrase') {
    const text = el.textContent; const keep = prevText && text.startsWith(prevText) ? prevText : '';
    el.textContent = keep; const ph = phraseSplit(text.slice(keep.length)); let t = at;
    for (const p of ph) { const s = document.createElement('span'); s.textContent = p; el.append(s); play(s, [{ opacity: 0, filter: 'blur(3px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: M.PHRASE_FADE_MS, delay: t, easing: M.OUT, fill: 'backwards' }); t += M.PHRASE_MS; }
    return Math.max(at + M.STAGGER_MS, at + (ph.length > 2 ? M.PHRASE_MS * 2 : M.PHRASE_MS));
  }
  if (m === 'count') {
    const to = el.textContent; const num = (s) => parseFloat(String(s).replace(/[^0-9.\-]/g, '')); const a = num(prevText ?? '0'), b = num(to);
    if (!isFinite(b)) { el.dataset.m = 'phrase'; return reveal(el, at); }
    const pre = to.match(/^[^0-9\-]*/)[0], suf = to.match(/[^0-9.,]*$/)[0], dec = (to.split('.')[1] || '').replace(/[^0-9]/g, '').length; const grp = to.includes(',');
    const fmt = (v) => grp ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
    const from = isFinite(a) ? a : 0; el.textContent = pre + fmt(from) + suf;
    setTimeout(() => { const t0 = performance.now(); const step = (n) => { const k = Math.min(1, (n - t0) / M.COUNT_MS), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + fmt(from + (b - from) * e) + suf; if (k < 1) requestAnimationFrame(step); else el.textContent = to; }; requestAnimationFrame(step); }, at);
    if (!prevText) play(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: at, fill: 'backwards' });
    return at + M.STAGGER_MS;
  }
  if (m === 'row') { play(el, [{ opacity: 0, transform: 'translateY(4px)', clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 380, delay: at, easing: M.OUT, fill: 'backwards' }); return at + M.ROW_MS; }
  if (m === 'draw') { const ln = el.querySelector('.line'), ar = el.querySelector('.area');
    if (ln) play(ln, [{ strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, strokeDasharray: 1 }], { duration: M.GROW_MS + 200, delay: at, easing: M.EASE, fill: 'backwards' });
    if (ar) play(ar, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: at + 300, fill: 'backwards' }); return at + M.STAGGER_MS; }
  if (m === 'drop') { play(el, [{ opacity: 0, transform: 'translateY(-14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: M.DROP_MS, delay: at, easing: M.DROP, fill: 'backwards' }); return at + M.STAGGER_MS * 2; }
  play(el, [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: at, easing: M.ARRIVE, fill: 'backwards' }); return at + M.STAGGER_MS;
}
