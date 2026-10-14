import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateCard, validateMessage, validateAction, migrate } from '../src/contract/validate.js';
import { BLOCKS, CORE, buildSchema } from '../src/contract/spec.js';
const base = { v: 1, id: 'c1', rev: 0, utterance: 'x', status: 'ready' };
test('committed schema matches spec.js (run npm run build after edits)', () => {
  assert.deepEqual(JSON.parse(readFileSync('schema/stage.v1.schema.json', 'utf8')), JSON.parse(JSON.stringify(buildSchema())));
});
test('all 13 core blocks + 6 baseline blocks exist', () => { for (const k of CORE) assert.ok(BLOCKS[k], k); assert.equal(Object.keys(BLOCKS).length, 19); });
test('valid card passes, unknown block type fails', () => {
  assert.ok(validateCard({ ...base, blocks: [{ id: 'a', type: 'answer', text: 'hi' }] }).ok);
  assert.equal(validateCard({ ...base, blocks: [{ id: 'a', type: 'html', html: '<b>' }] }).ok, false);
});
test('limits enforced: 12 blocks, receipt 80, id pattern', () => {
  const blocks = Array.from({ length: 13 }, (_, i) => ({ id: `b${i}`, type: 'note', text: 'x' }));
  assert.equal(validateCard({ ...base, blocks }).ok, false);
  assert.equal(validateCard({ ...base, receipt: 'x'.repeat(81) }).ok, false);
  assert.equal(validateCard({ ...base, id: 'bad id!' }).ok, false);
  assert.equal(validateCard({ ...base, extra: 1 }).ok, false);
});
test('v0 payloads migrate to v1; future versions rejected', () => {
  const m = migrate({ id: 'c', utterance: 'u', status: 'ready', screen: { title: 'T', blocks: [{ id: 'n', type: 'note', text: 't' }] } });
  assert.equal(m.v, 1); assert.equal(m.title, 'T'); assert.ok(validateCard(m).ok);
  assert.equal(validateCard({ ...base, v: 2 }).ok, false);
});
test('stream messages and actions validate', () => {
  assert.ok(validateMessage({ v: 1, op: 'upsert', card: base }).ok);
  assert.ok(validateMessage({ v: 1, op: 'patch', id: 'c1', rev: 1, set: { step: 'x' } }).ok);
  assert.ok(validateMessage({ v: 1, op: 'remove', id: 'c1', receipt: 'Sent' }).ok);
  assert.equal(validateMessage({ v: 1, op: 'eval', code: '1' }).ok, false);
  assert.ok(validateAction({ kind: 'undo', token: 't1' }).ok);
  assert.equal(validateAction({ kind: 'approve', cardId: 'c1' }).ok, false);
});
test('every gallery sample block validates', async () => {
  globalThis.document = undefined;
  const src = readFileSync('src/renderer/states.js', 'utf8');
  const m = src.match(/export const SAMPLE = (\{[\s\S]*?\n\});/); assert.ok(m);
  const todo = { id: 'ny', type: 'todo', label: 'Needs you', items: [{ id: 'a', title: 't' }] };
  const SAMPLE = Function('todo', `return (${m[1]})`)(todo);
  for (const [k, b] of Object.entries(SAMPLE)) assert.ok(validateCard({ ...base, blocks: [b] }).ok, `${k}: ${validateCard({ ...base, blocks: [b] }).error}`);
});
