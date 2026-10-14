// Single source of truth for Brim stage contract v1. scripts/build.js emits schema/stage.v1.schema.json from this.
export const CONTRACT_VERSION = 1;
export const LIMITS = { id: 100, utterance: 600, step: 120, say: 400, receipt: 80, blocks: 12, cardChars: 64000, items: 8, rows: 8, columns: 4, sources: 4 };
export const STATUSES = ['working', 'ready', 'needs-you', 'error', 'offline'];
const s = (max) => (max ? { type: 'string', maxLength: max } : { type: 'string' });
const arr = (items, max) => ({ type: 'array', items, ...(max ? { maxItems: max } : {}) });
const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const ID = { type: 'string', pattern: '^[A-Za-z0-9_-]{1,100}$' };
// Block catalogue: 13 core blocks + 6 baseline additions (gaps).
export const BLOCKS = {
  answer: obj({ text: s(2000), detail: s(1000), sources: arr(s(60), 4) }, ['text']),
  list: obj({ label: s(80), columns: arr(s(40), 4), rows: arr(arr(s(80), 4), 8), highlight: { type: 'integer', minimum: 0 } }, ['columns', 'rows']),
  number: obj({ label: s(80), value: s(40), delta: s(40), up: { type: 'boolean' }, series: arr({ type: 'number' }, 64), source: s(60) }, ['value']),
  brief: obj({ title: s(120), bullets: arr(s(300), 8), people: arr(obj({ name: s(80), role: s(80), note: s(200) }, ['name']), 6) }, ['bullets']),
  note: obj({ label: s(80), text: s(1000) }, ['text']),
  todo: obj({ label: s(80), items: arr(obj({ id: ID, title: s(200), detail: s(200), action: s(30), done: { type: 'boolean' } }, ['id', 'title']), 8) }, ['items']),
  agenda: obj({ label: s(80), items: arr(obj({ id: ID, time: s(20), title: s(200), meta: s(120), state: { enum: ['', 'done', 'next', 'conflict', 'moved', 'new'] } }, ['time', 'title']), 8) }, ['items']),
  person: obj({ name: s(80), role: s(80), org: s(80), note: s(300), facts: arr(obj({ label: s(40), value: s(80) }, ['label', 'value']), 6) }, ['name']),
  created: obj({ kind: s(40), title: s(200), detail: s(200), href: s(500) }, ['kind', 'title']),
  progress: obj({ steps: arr(obj({ text: s(120), state: { enum: ['pending', 'active', 'done', 'failed'] } }, ['text', 'state']), 10) }, ['steps']),
  connect: obj({ provider: s(40), label: s(120), state: { enum: ['idle', 'connecting', 'connected', 'error'] }, error: s(200) }, ['provider', 'state']),
  email: obj({ to: arr(s(200), 10), subject: s(200), body: s(8000), state: { enum: ['draft', 'sending', 'sent', 'error'] } }, ['to', 'subject', 'body']),
  approval: obj({ action: s(40), title: s(200), detail: s(400), risk: { enum: ['low', 'medium', 'high'] }, scope: { enum: ['once', 'this-recipient', 'this-action-kind'] }, choices: arr({ enum: ['allow-once', 'allow-recipient', 'allow-kind', 'edit', 'deny'] }, 5), state: { enum: ['pending', 'approved', 'denied', 'expired'] }, expiresAt: s(40) }, ['action', 'title', 'choices']),
  // --- baseline additions ---
  undo: obj({ label: s(120), token: ID, ttlMs: { type: 'integer', minimum: 1000, maximum: 60000 } }, ['label', 'token', 'ttlMs']),
  error: obj({ kind: { enum: ['network', 'auth', 'permission', 'tool', 'rate-limit', 'timeout', 'invalid-output'] }, title: s(120), detail: s(400), retry: { type: 'boolean' }, fix: s(120) }, ['kind', 'title']),
  offline: obj({ since: s(40), queued: { type: 'integer', minimum: 0 }, detail: s(200) }, []),
  history: obj({ items: arr(obj({ cardId: ID, title: s(120), at: s(40), status: { enum: STATUSES }, receipt: s(80) }, ['cardId', 'title', 'at']), 50) }, ['items']),
  permission: obj({ capability: { enum: ['microphone', 'accessibility', 'screen-recording', 'calendar', 'contacts', 'automation', 'notifications'] }, why: s(200), state: { enum: ['unknown', 'granted', 'denied'] } }, ['capability', 'why']),
  source: obj({ label: s(80), items: arr(obj({ title: s(200), origin: s(80), trust: { enum: ['first-party', 'external', 'untrusted'] } }, ['title', 'origin']), 8) }, ['items']),
};
export const CORE = ['answer', 'list', 'number', 'brief', 'note', 'todo', 'agenda', 'person', 'created', 'progress', 'connect', 'email', 'approval'];
export function buildSchema() {
  const blockSchemas = Object.entries(BLOCKS).map(([type, b]) => ({
    ...b, properties: { id: ID, type: { const: type }, ...b.properties }, required: ['id', 'type', ...b.required],
  }));
  const card = {
    type: 'object', additionalProperties: false,
    required: ['v', 'id', 'rev', 'utterance', 'status'],
    properties: {
      v: { const: CONTRACT_VERSION }, id: ID, rev: { type: 'integer', minimum: 0 },
      utterance: s(LIMITS.utterance), status: { enum: STATUSES }, pinned: { type: 'boolean' },
      step: s(LIMITS.step), say: s(LIMITS.say), receipt: s(LIMITS.receipt),
      title: s(120), blocks: { type: 'array', maxItems: LIMITS.blocks, items: { $ref: '#/$defs/block' } },
      createdAt: s(40),
    },
  };
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema', $id: 'https://example.invalid/brim/stage.v1.schema.json',
    title: 'Brim stage contract v1', $defs: { card, block: { oneOf: blockSchemas },
      message: { oneOf: [
        obj({ v: { const: 1 }, op: { const: 'upsert' }, card: { $ref: '#/$defs/card' } }, ['v', 'op', 'card']),
        obj({ v: { const: 1 }, op: { const: 'patch' }, id: ID, rev: { type: 'integer', minimum: 1 }, set: { type: 'object' }, blocks: { type: 'array', items: { $ref: '#/$defs/block' } } }, ['v', 'op', 'id', 'rev']),
        obj({ v: { const: 1 }, op: { const: 'remove' }, id: ID, receipt: s(80) }, ['v', 'op', 'id']),
      ] },
      action: { oneOf: [
        obj({ kind: { const: 'dismiss' }, cardId: ID }, ['kind', 'cardId']),
        obj({ kind: { enum: ['approve', 'deny', 'edit'] }, cardId: ID, blockId: ID, choice: { type: 'string' } }, ['kind', 'cardId', 'blockId']),
        obj({ kind: { enum: ['undo'] }, token: ID }, ['kind', 'token']),
        obj({ kind: { enum: ['retry', 'open', 'done', 'primary', 'connect', 'recall'] }, cardId: ID, blockId: ID, itemId: ID }, ['kind', 'cardId']),
      ] } },
    $ref: '#/$defs/card',
  };
}
