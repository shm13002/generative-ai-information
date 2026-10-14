// Stage store: applies stream messages, keeps history (recall dismissed cards), and undo tokens. Pure, no DOM.
export function createStore({ now = () => Date.now(), historyMax = 50 } = {}) {
  const cards = new Map(); const history = []; const undo = new Map(); const listeners = new Set();
  const emit = (e) => listeners.forEach((f) => f(e));
  function apply(m) {
    if (m.op === 'upsert') {
      const prev = cards.get(m.card.id);
      if (prev && prev.rev > m.card.rev) return false; // stale
      cards.set(m.card.id, m.card); emit({ type: 'card', card: m.card }); return true;
    }
    if (m.op === 'patch') {
      const c = cards.get(m.id); if (!c || m.rev <= c.rev) return false;
      let blocks = c.blocks || [];
      if (m.blocks) { const byId = new Map(blocks.map((b) => [b.id, b])); for (const b of m.blocks) byId.set(b.id, b); blocks = [...byId.values()]; }
      const next = { ...c, ...(m.set || {}), rev: m.rev, blocks }; cards.set(c.id, next); emit({ type: 'card', card: next }); return true;
    }
    if (m.op === 'remove') {
      const c = cards.get(m.id); if (!c) return false; cards.delete(m.id);
      history.unshift({ cardId: c.id, title: c.title || c.utterance, at: new Date(now()).toISOString(), status: c.status, receipt: m.receipt, card: c });
      history.length = Math.min(history.length, historyMax);
      emit({ type: 'remove', id: m.id, receipt: m.receipt }); return true;
    }
    return false;
  }
  function recall(cardId) { const h = history.find((x) => x.cardId === cardId); if (!h) return null; cards.set(cardId, { ...h.card, rev: h.card.rev + 1 }); emit({ type: 'card', card: cards.get(cardId) }); return cards.get(cardId); }
  function registerUndo(token, ttlMs, revert) { undo.set(token, { expires: now() + ttlMs, revert }); }
  function runUndo(token) { const u = undo.get(token); undo.delete(token); if (!u || now() > u.expires) return false; u.revert(); return true; }
  return { apply, recall, registerUndo, runUndo, cards, history, on: (f) => (listeners.add(f), () => listeners.delete(f)) };
}
