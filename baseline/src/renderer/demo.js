// Scripted end-to-end scenario (original story). Plays without any API key.
import { wait, M } from './motion.js';
import { Sound } from './sound.js';
export async function runDemo(stage, ui, { speed = 1 } = {}) {
  const W = (ms) => wait(ms * speed);
  const C = (o) => ({ v: 1, rev: 0, id: 'd1', utterance: 'What needs me today?', ...o });
  const userSays = async (text, ms = 1500) => {
    Sound.play('listen-on'); stage.setPhase('listening'); if (stage.size === 'rest') stage.bar('', {}); ui.sub(text, 'user');
    const t0 = performance.now(); const tick = setInterval(() => { const k = (performance.now() - t0) / 120; stage.setLevel(0.35 + 0.55 * Math.abs(Math.sin(k) * Math.sin(k * 0.37 + 1))); }, 80);
    if (stage.size !== 'open') await stage.liveCaption(text, ms); else await W(ms); clearInterval(tick); stage.setLevel(0); Sound.play('listen-off'); stage.setPhase('thinking');
  };
  const brimSays = async (text, ms = 1600) => { stage.setPhase('speaking'); ui.sub(text, 'brim'); const t0 = performance.now();
    const tick = setInterval(() => stage.setLevel(0.25 + 0.4 * Math.abs(Math.sin((performance.now() - t0) / 90))), 80); await W(ms); clearInterval(tick); stage.setPhase('idle'); };
  const press = async (label) => { const b = [...document.querySelectorAll('.shape button')].find((x) => x.textContent === label); if (b) { b.classList.add('pressed'); await W(160); b.classList.remove('pressed'); } };
  ui.sub('');
  await W(600);
  // 1. alert drops out of the notch
  Sound.play('needs-you'); stage.setPhase('idle'); stage.bar('Halden Labs may not renew', { tone: 'alert', sub: 'Needs you', drop: true });
  await W(2400); stage.rest(); await W(900);
  // 2. wake + ask
  Sound.play('wake'); await W(350);
  await userSays('Hey Brim, what needs me today?', 1500);
  // 3. skeleton -> fill
  stage.open(C({ status: 'working', step: 'Checking mail, calendar, billing' })); stage.setPhase('thinking');
  await W(700); Sound.play('tick', { gain: .7 }); stage.update(C({ rev: 1, status: 'working', step: 'Reading 3 threads' }), { sound: false });
  await W(800);
  const todo = { id: 'ny', type: 'todo', label: 'Needs you', items: [
    { id: 'a', title: 'Halden Labs may not renew', detail: 'Champion left · renews in 9 days', action: 'Open' },
    { id: 'b', title: 'Jonas wants to move Thursday 2 PM', detail: 'Slack · 1h', action: 'Reply' },
    { id: 'c', title: 'Approve Q4 contractor invoice', detail: 'Ramp · $4,200', action: 'Review' }] };
  stage.update(C({ rev: 2, status: 'needs-you', title: 'What needs you', blocks: [todo] }));
  await brimSays('Three things. Halden is the big one.', 1900);
  // 4. reshape in place: number + shortened list
  await userSays('How much is Halden worth?', 1100);
  stage.update(C({ rev: 3, status: 'working', title: 'Halden Labs', step: 'Checking billing', blocks: [todo] }), { sound: false }); await W(500);
  const num = { id: 'arr', type: 'number', label: 'Annual value', value: '$48,000', delta: '+18% YoY', up: true, source: 'Billing', series: [22, 25, 27, 31, 33, 36, 41, 44, 48] };
  stage.update(C({ rev: 4, status: 'needs-you', title: 'Halden Labs', blocks: [num, { ...todo, items: todo.items.slice(0, 1) }] }));
  await brimSays('Forty-eight thousand a year, up eighteen percent.', 2000);
  // 5. draft -> edit in place -> approval
  await userSays('Draft Mira a two-year offer at 8%.', 1500);
  stage.update(C({ rev: 5, id: 'd2', status: 'working', utterance: 'Draft Mira a two-year offer', title: 'Offer to Halden', step: 'Drafting', blocks: [] }));
  await W(700);
  const body8 = 'Hi Mira, thanks for the candid note. For a two-year renewal we can do 8% off, $44,160 a year. Free Thursday at 10 to walk through it? — Sam';
  const email = { id: 'em', type: 'email', to: ['Mira Okafor'], subject: 'Two more years together', body: body8 };
  stage.update(C({ rev: 6, id: 'd2', status: 'ready', pinned: true, utterance: 'Draft Mira a two-year offer', title: 'Offer to Halden', step: 'Draft ready', blocks: [email] }));
  await W(2600);
  await userSays('Make it ten.', 700);
  stage.update(C({ rev: 7, id: 'd2', status: 'ready', pinned: true, utterance: 'Draft', title: 'Offer to Halden', step: 'Updated: 10%', blocks: [{ ...email, body: body8.replace('8% off, $44,160', '10% off, $43,200') }] }));
  await W(1200);
  stage.update(C({ rev: 8, id: 'd2', status: 'needs-you', utterance: 'Draft', title: 'Offer to Halden', step: 'Ready to send', blocks: [{ ...email, body: body8.replace('8% off, $44,160', '10% off, $43,200') },
    { id: 'ap', type: 'approval', action: 'email.send', title: 'Send this to Mira Okafor?', detail: 'External recipient · first email in thread', risk: 'medium', choices: ['allow-once', 'allow-recipient', 'edit', 'deny'] }] }));
  await brimSays('Want me to send it?', 1300);
  await W(500); await press('Allow once'); Sound.play('approve'); await W(350);
  // 6. collapse -> receipt with undo window
  await stage.collapse('Sent to Mira · 10% for two years', { undo: { token: 'u1', ttlMs: 3600 } });
  ui.sub('Sent. You’re on for Thursday at ten.', 'brim'); await W(3900);
  // 7. background jobs count
  stage.setJobs(2); stage.setPhase('thinking'); stage.bar('Booking Thursday 10:00 · preparing order form', {}); await W(2200); stage.setJobs(0); stage.setPhase('idle'); stage.rest(); ui.sub(''); await W(1000);
  // 8. later: good news drops in, card opens, auto-dismisses
  Sound.play('needs-you'); stage.bar('Halden signed · 2 years', { tone: 'alert', sub: 'Renewed at 10% off', drop: true }); await W(1800);
  stage.open({ v: 1, id: 'd3', rev: 0, utterance: 'order form', status: 'ready', title: 'Order form', step: 'Countersigned by Mira Okafor', blocks: [
    { id: 'cr', type: 'created', kind: 'Contract', title: 'Halden Labs — Order form', detail: '2 years · $43,200/yr' },
    { id: 'pg', type: 'progress', steps: [{ text: 'Signed by Mira Okafor', state: 'done' }, { text: 'Countersigned', state: 'done' }, { text: 'Invoice scheduled for Nov 1', state: 'done' }] }] });
  Sound.play('ready'); ui.sub('Halden just signed. Two years.', 'brim');
  await W(3600); await stage.collapse(null); ui.sub(''); await W(1200);
}
