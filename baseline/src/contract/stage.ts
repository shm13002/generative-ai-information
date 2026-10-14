/** Brim stage contract v1 — TypeScript mirror of src/contract/spec.js (keep in sync; tests check the schema). */
export type ContractVersion = 1;
export type Status = 'working' | 'ready' | 'needs-you' | 'error' | 'offline';
type B<T extends string, P> = { id: string; type: T } & P;
export type Block =
  | B<'answer', { text: string; detail?: string; sources?: string[] }>
  | B<'list', { label?: string; columns: string[]; rows: string[][]; highlight?: number }>
  | B<'number', { label?: string; value: string; delta?: string; up?: boolean; series?: number[]; source?: string }>
  | B<'brief', { title?: string; bullets: string[]; people?: { name: string; role?: string; note?: string }[] }>
  | B<'note', { label?: string; text: string }>
  | B<'todo', { label?: string; items: { id: string; title: string; detail?: string; action?: string; done?: boolean }[] }>
  | B<'agenda', { label?: string; items: { id?: string; time: string; title: string; meta?: string; state?: '' | 'done' | 'next' | 'conflict' | 'moved' | 'new' }[] }>
  | B<'person', { name: string; role?: string; org?: string; note?: string; facts?: { label: string; value: string }[] }>
  | B<'created', { kind: string; title: string; detail?: string; href?: string }>
  | B<'progress', { steps: { text: string; state: 'pending' | 'active' | 'done' | 'failed' }[] }>
  | B<'connect', { provider: string; label?: string; state: 'idle' | 'connecting' | 'connected' | 'error'; error?: string }>
  | B<'email', { to: string[]; subject: string; body: string; state?: 'draft' | 'sending' | 'sent' | 'error' }>
  | B<'approval', { action: string; title: string; detail?: string; risk?: 'low' | 'medium' | 'high'; scope?: 'once' | 'this-recipient' | 'this-action-kind';
      choices: ('allow-once' | 'allow-recipient' | 'allow-kind' | 'edit' | 'deny')[]; state?: 'pending' | 'approved' | 'denied' | 'expired'; expiresAt?: string }>
  | B<'undo', { label: string; token: string; ttlMs: number }>
  | B<'error', { kind: 'network' | 'auth' | 'permission' | 'tool' | 'rate-limit' | 'timeout' | 'invalid-output'; title: string; detail?: string; retry?: boolean; fix?: string }>
  | B<'offline', { since?: string; queued?: number; detail?: string }>
  | B<'history', { items: { cardId: string; title: string; at: string; status?: Status; receipt?: string }[] }>
  | B<'permission', { capability: 'microphone' | 'accessibility' | 'screen-recording' | 'calendar' | 'contacts' | 'automation' | 'notifications'; why: string; state?: 'unknown' | 'granted' | 'denied' }>
  | B<'source', { label?: string; items: { title: string; origin: string; trust?: 'first-party' | 'external' | 'untrusted' }[] }>;
export type BlockType = Block['type'];
export interface Card { v: ContractVersion; id: string; rev: number; utterance: string; status: Status; pinned?: boolean;
  step?: string; say?: string; receipt?: string; title?: string; blocks?: Block[]; createdAt?: string }
export type StageMessage =
  | { v: 1; op: 'upsert'; card: Card }
  | { v: 1; op: 'patch'; id: string; rev: number; set?: Partial<Omit<Card, 'v' | 'id' | 'rev' | 'blocks'>>; blocks?: Block[] }
  | { v: 1; op: 'remove'; id: string; receipt?: string };
export type StageAction =
  | { kind: 'dismiss'; cardId: string }
  | { kind: 'approve' | 'deny' | 'edit'; cardId: string; blockId: string; choice?: string }
  | { kind: 'undo'; token: string }
  | { kind: 'retry' | 'open' | 'done' | 'primary' | 'connect' | 'recall'; cardId: string; blockId?: string; itemId?: string };
export const LIMITS = { id: 100, utterance: 600, step: 120, say: 400, receipt: 80, blocks: 12, cardChars: 64000 } as const;
