// Tool-action policy + prompt-injection hygiene. Every side-effecting tool goes through decide().
export const RISK = { 'email.send': 'medium', 'calendar.move': 'low', 'file.delete': 'high', 'payment.send': 'high', 'message.post': 'medium' };
export const UNDO_WINDOW_MS = { 'email.send': 10000, 'calendar.move': 15000, 'message.post': 10000 }; // send is delayed by this window
export function decide(action, grants, { initiatedByUser = false } = {}) {
  const risk = RISK[action.kind] ?? 'high';
  if (risk === 'high') return { mode: 'ask', risk, reason: 'high-risk actions always ask' };
  if (action.taintedBy?.length) return { mode: 'ask', risk, reason: 'request derived from untrusted content' };
  const g = grants.find((x) => x.kind === action.kind && (x.scope === 'this-action-kind' || (x.scope === 'this-recipient' && x.target === action.target)));
  if (g || initiatedByUser) return { mode: 'auto-with-undo', risk, undoMs: UNDO_WINDOW_MS[action.kind] ?? 0 };
  return { mode: 'ask', risk };
}
/** Wrap third-party text (emails, web pages, docs) so the model treats it as data, never as instructions. */
export function quarantine(text, origin) {
  const clean = String(text).replace(/<\/?untrusted[^>]*>/gi, '');
  return `<untrusted origin="${origin.replace(/"/g, '')}">\n${clean}\n</untrusted>`;
}
const SUSPECT = /(ignore (all|previous) instructions|you are now|system prompt|forward (this|all) (to|emails)|send .* to .*@)/i;
export function flagInjection(text) { return SUSPECT.test(text); }
