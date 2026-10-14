// Validates and migrates stage messages. Runs in the main process (never trust the agent's output).
import Ajv2020 from 'ajv/dist/2020.js';
import { buildSchema, LIMITS, CONTRACT_VERSION } from './spec.js';
const ajv = new Ajv2020({ allErrors: true, strict: false });
const schema = buildSchema();
ajv.addSchema(schema, 'stage');
const vCard = ajv.getSchema('stage#/$defs/card');
const vMsg = ajv.getSchema('stage#/$defs/message');
const vAction = ajv.getSchema('stage#/$defs/action');
const fmt = (v) => (v.errors || []).slice(0, 5).map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
/** Upgrade older payloads. v0 = unversioned cards using `screen.blocks`. Unknown future versions are rejected. */
export function migrate(card) {
  if (!card || typeof card !== 'object') return card;
  if (card.v === undefined) {
    const { screen, ...rest } = card;
    return { v: 1, rev: 0, ...rest, title: screen?.title ?? rest.title, blocks: screen?.blocks ?? rest.blocks ?? [] };
  }
  return card;
}
export function validateCard(input) {
  const card = migrate(input);
  if (card?.v > CONTRACT_VERSION) return { ok: false, error: `unsupported contract version ${card.v}` };
  if (JSON.stringify(card).length > LIMITS.cardChars) return { ok: false, error: 'card too large' };
  return vCard(card) ? { ok: true, card } : { ok: false, error: fmt(vCard) };
}
export function validateMessage(m) {
  if (m?.op === 'upsert' && m.card) m = { ...m, card: migrate(m.card) };
  if (m?.op === 'upsert' && JSON.stringify(m.card).length > LIMITS.cardChars) return { ok: false, error: 'card too large' };
  return vMsg(m) ? { ok: true, msg: m } : { ok: false, error: fmt(vMsg) };
}
export function validateAction(a) { return vAction(a) ? { ok: true } : { ok: false, error: fmt(vAction) }; }
