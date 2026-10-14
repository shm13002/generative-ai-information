// Deterministic states for screenshots and visual tests (?state=<name>).
import { wait } from './motion.js';
import { h, KIT } from './kit.js';
const C = (o) => ({ v: 1, id: 's', rev: 0, utterance: 'What needs me today?', status: 'ready', ...o });
const todo = { id: 'ny', type: 'todo', label: 'Needs you', items: [{ id: 'a', title: 'Halden Labs may not renew', detail: 'Champion left · renews in 9 days', action: 'Open' }, { id: 'b', title: 'Jonas wants to move Thursday 2 PM', detail: 'Slack · 1h', action: 'Reply' }, { id: 'c', title: 'Approve Q4 contractor invoice', detail: 'Ramp · $4,200', action: 'Review' }] };
export const SAMPLE = {
  answer: { id: 'x1', type: 'answer', text: 'Revenue is up 18% this quarter; one renewal is at risk.', detail: 'Halden renews in 9 days.', sources: ['Billing', 'CRM'] },
  list: { id: 'x2', type: 'list', label: 'Pipeline', columns: ['Deal', 'Stage', 'Value'], rows: [['Halden Labs', 'Renewal', '$48K'], ['Orchard', 'Proposal', '$22K'], ['Kestrel', 'Discovery', '$9K']], highlight: 0 },
  number: { id: 'x3', type: 'number', label: 'Annual value', value: '$48,000', delta: '+18% YoY', up: true, source: 'Billing', series: [22, 25, 27, 31, 33, 36, 41, 44, 48] },
  brief: { id: 'x4', type: 'brief', title: 'Halden prep', bullets: ['$48K a year, renews in 9 days', 'Asked about a 2-year discount'], people: [{ name: 'Mira Okafor', role: 'VP Finance', note: 'new decision maker' }] },
  note: { id: 'x5', type: 'note', label: 'Heads up', text: 'No call with Halden in 41 days.' },
  todo, agenda: { id: 'x6', type: 'agenda', label: 'Tuesday', items: [{ time: '9:30', title: 'Standup', state: 'done' }, { time: '11:00', title: 'Design review', meta: 'Room 3', state: 'next' }, { time: '14:00', title: 'Halden renewal call', meta: 'Mira Okafor', state: 'conflict' }] },
  person: { id: 'x7', type: 'person', name: 'Mira Okafor', role: 'VP Finance', org: 'Halden Labs', note: 'Joined in August. You haven’t met.', facts: [{ label: 'Before', value: 'Northbeam' }, { label: 'Decides', value: 'Renewal' }, { label: 'Met', value: 'Never' }] },
  created: { id: 'x8', type: 'created', kind: 'Doc', title: 'Q4 board update', detail: '6 slides · draft' },
  progress: { id: 'x9', type: 'progress', steps: [{ text: 'Read the contract', state: 'done' }, { text: 'Check discount policy', state: 'active' }, { text: 'Draft reply', state: 'pending' }] },
  connect: { id: 'y1', type: 'connect', provider: 'CRM', label: 'Connect your CRM to update deals', state: 'idle' },
  email: { id: 'y2', type: 'email', to: ['Mira Okafor'], subject: 'Two more years together', body: 'Hi Mira, for a two-year renewal we can do 10% off, $43,200 a year. Free Thursday at 10? — Sam' },
  approval: { id: 'y3', type: 'approval', action: 'email.send', title: 'Send this to Mira Okafor?', detail: 'External recipient · first email in thread', risk: 'medium', choices: ['allow-once', 'allow-recipient', 'edit', 'deny'] },
  undo: { id: 'y4', type: 'undo', label: 'Moved “Hiring sync” to 3 PM', token: 'u1', ttlMs: 10000 },
  error: { id: 'y5', type: 'error', kind: 'auth', title: 'Gmail needs you to sign in again', detail: 'Your token expired 2 h ago.', retry: true, fix: 'Reconnect' },
  offline: { id: 'y6', type: 'offline', queued: 2 },
  history: { id: 'y7', type: 'history', items: [{ cardId: 'h1', title: 'Offer to Halden', at: '2026-10-13T16:02:00Z', status: 'ready', receipt: 'Sent to Mira' }, { cardId: 'h2', title: 'Moved Hiring sync', at: '2026-10-13T15:40:00Z', status: 'ready', receipt: 'Moved · 3 PM' }, { cardId: 'h3', title: 'Invoice check', at: '2026-10-13T15:10:00Z', status: 'error', receipt: 'Failed · Ramp' }] },
  permission: { id: 'y8', type: 'permission', capability: 'microphone', why: 'So you can talk to Brim. Audio stays on this Mac until you speak.', state: 'unknown' },
  source: { id: 'y9', type: 'source', label: 'Read from', items: [{ title: 'Re: renewal terms', origin: 'Gmail', trust: 'external' }, { title: 'Halden account', origin: 'CRM', trust: 'first-party' }, { title: '“Ignore previous instructions…”', origin: 'Email body', trust: 'untrusted' }] },
};
const settle = () => wait(1600);
export const STATES = {
  rest: async () => wait(400),
  alert: async (s) => { s.bar('Halden Labs may not renew', { tone: 'alert', sub: 'Needs you', drop: true }); await settle(); },
  listening: async (s, ui) => { s.setPhase('listening'); s.bar('', {}); ui.sub('Hey Brim, what needs me today?', 'user'); await s.liveCaption('Hey Brim, what needs me today?', 300); const t = setInterval(() => s.setLevel(.8), 60); await wait(900); void t; },
  skeleton: async (s) => { s.open(C({ status: 'working', step: 'Checking mail, calendar, billing', blocks: [] })); s.setPhase('thinking'); await settle(); },
  todo: async (s, ui) => { s.open(C({ status: 'needs-you', title: 'What needs you', blocks: [todo] })); ui.sub('Three things. Halden is the big one.', 'brim'); await wait(2200); },
  reshape: async (s) => { s.open(C({ status: 'needs-you', title: 'Halden Labs', blocks: [SAMPLE.number, { ...todo, items: todo.items.slice(0, 1) }] })); await wait(2200); },
  approval: async (s) => { s.open(C({ status: 'needs-you', title: 'Offer to Halden', blocks: [SAMPLE.email, SAMPLE.approval] })); await wait(2600); },
  receipt: async (s) => { await s.collapse('Sent to Mira · 10% for two years', { undo: { token: 'u', ttlMs: 10000 } }); await wait(1400); },
  jobs: async (s) => { s.setJobs(3); s.setPhase('thinking'); s.bar('Booking Thursday 10:00 · preparing order form', {}); await settle(); },
  history: async (s) => { s.open(C({ title: 'History', step: '3 recent', pinned: true, blocks: [SAMPLE.history] })); await settle(); },
  error: async (s) => { s.setPhase('error'); s.open(C({ status: 'error', title: 'Couldn’t check your inbox', blocks: [SAMPLE.error] })); await settle(); },
  offline: async (s) => { s.setPhase('offline'); s.open(C({ status: 'offline', title: 'Offline', blocks: [SAMPLE.offline] })); await settle(); },
  permission: async (s) => { s.open(C({ status: 'needs-you', title: 'One permission first', blocks: [SAMPLE.permission] })); await settle(); },
  source: async (s) => { s.open(C({ title: 'Why I said that', blocks: [SAMPLE.answer, SAMPLE.source] })); await wait(2400); },
  gallery: async () => { document.body.classList.add('gallery'); const g = h('div', { class: 'galleryg' }); for (const [k, b] of Object.entries(SAMPLE)) g.append(h('div', { class: 'gcard' }, h('div', { class: 'lab' }, h('span', { text: k })), ...[KIT[b.type](b)].flat(Infinity).filter(Boolean))); document.body.append(g); await wait(300); },
};
