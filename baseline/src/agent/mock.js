// Mock agent: turns an utterance into a stream of v1 stage messages with realistic pacing. No network, no API key.
import { guessSkeleton } from '../shared/skeleton.js';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0;
const FIXTURES = {
  todo: { title: 'What needs you', status: 'needs-you', say: 'Three things. Halden is the big one.', blocks: [{ id: 'ny', type: 'todo', label: 'Needs you', items: [
    { id: 'a', title: 'Halden Labs may not renew', detail: 'Champion left · renews in 9 days', action: 'Open' },
    { id: 'b', title: 'Jonas wants to move Thursday 2 PM', detail: 'Slack · 1h', action: 'Reply' },
    { id: 'c', title: 'Approve Q4 contractor invoice', detail: 'Ramp · $4,200', action: 'Review' }] }] },
  number: { title: 'Halden Labs', status: 'ready', say: 'Forty-eight thousand a year, up 18 percent.', blocks: [{ id: 'arr', type: 'number', label: 'Annual value', value: '$48,000', delta: '+18% YoY', up: true, source: 'Billing', series: [22, 25, 27, 31, 33, 36, 41, 44, 48] }] },
  agenda: { title: 'Today', status: 'ready', say: 'Four meetings. The 2 PM overlaps.', blocks: [{ id: 'ag', type: 'agenda', label: 'Tuesday', items: [
    { id: 'm1', time: '9:30', title: 'Standup', state: 'done' }, { id: 'm2', time: '11:00', title: 'Design review', meta: 'Room 3', state: 'next' },
    { id: 'm3', time: '14:00', title: 'Halden renewal call', meta: 'Mira Okafor', state: 'conflict' }, { id: 'm4', time: '14:00', title: 'Hiring sync', state: 'conflict' }] }] },
  email: { title: 'Offer to Halden', status: 'needs-you', blocks: [{ id: 'em', type: 'email', to: ['Mira Okafor'], subject: 'Two more years together', body: 'Hi Mira, thanks for the candid note. For a two-year renewal we can do 10% off, $43,200 a year. Free Thursday at 10 to walk through it? — Sam' },
    { id: 'ap', type: 'approval', action: 'email.send', title: 'Send this to Mira Okafor?', detail: 'External recipient · first email in this thread', risk: 'medium', choices: ['allow-once', 'allow-recipient', 'edit', 'deny'] }] },
  person: { title: 'Mira Okafor', status: 'ready', blocks: [{ id: 'pp', type: 'person', name: 'Mira Okafor', role: 'VP Finance', org: 'Halden Labs', note: 'Joined in August. You haven’t met.', facts: [{ label: 'Before', value: 'Finance, Northbeam' }, { label: 'Decides', value: 'This renewal' }, { label: 'Met', value: 'Never' }] }] },
  answer: { title: 'Answer', status: 'ready', blocks: [{ id: 'an', type: 'answer', text: 'I can do that once you connect a data source. This is the offline mock agent.', sources: ['Mock'] }] },
};
FIXTURES.list = { title: 'Open deals', status: 'ready', blocks: [{ id: 'ls', type: 'list', label: 'Pipeline', columns: ['Deal', 'Stage', 'Value'], rows: [['Halden Labs', 'Renewal', '$48K'], ['Orchard', 'Proposal', '$22K'], ['Kestrel', 'Discovery', '$9K']], highlight: 0 }] };
FIXTURES.brief = { title: 'Halden prep', status: 'ready', blocks: [{ id: 'br', type: 'brief', bullets: ['$48K a year, renews in 9 days', 'Asked about a 2-year discount', 'Champion Leo left in September'], people: [{ name: 'Mira Okafor', role: 'VP Finance', note: 'new decision maker' }] }] };
export async function* runMock(utterance, { pace = 1 } = {}) {
  const id = `c${Date.now().toString(36)}${n++}`; const kind = guessSkeleton(utterance); const fx = FIXTURES[kind] || FIXTURES.answer;
  yield { v: 1, op: 'upsert', card: { v: 1, id, rev: 0, utterance, status: 'working', step: 'Checking mail, calendar, billing', blocks: [] } };
  await sleep(700 * pace);
  yield { v: 1, op: 'patch', id, rev: 1, set: { step: 'Reading 3 threads' } };
  await sleep(600 * pace);
  yield { v: 1, op: 'patch', id, rev: 2, set: { status: fx.status, title: fx.title, say: fx.say, step: undefined }, blocks: fx.blocks };
}
