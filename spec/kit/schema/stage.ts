// Clean TypeScript re-implementation of the observed stage contract.
export type Status = 'working' | 'ready' | 'needs-you' | 'error';
type Base<T extends string> = { id: string; type: T };
export type Block =
  | Base<'answer'> & { text: string; detail?: string; sources?: string[] }
  | Base<'list'> & { label?: string; columns: string[]; rows: string[][]; highlight?: number; action?: { label: string; ask: string } }
  | Base<'number'> & { label?: string; value: string; delta?: string; up?: boolean; series?: { v: number }[]; source?: string }
  | Base<'brief'> & { title?: string; label?: string; bullets: string[]; people?: { name: string; role?: string; note?: string }[]; sources?: string[] }
  | Base<'note'> & { label?: string; text: string; missing?: unknown }
  | Base<'todo'> & { label?: string; total?: number; items: TodoItem[] }
  | Base<'agenda'> & { label?: string; items: { id?: string; time: string; title: string; meta?: string; state?: '' | 'done' | 'next' | 'conflict' | 'moved' | 'new' }[] }
  | Base<'person'> & { name: string; role?: string; org?: string; note?: string; facts?: { l: string; v: string }[] }
  | Base<'created'> & { kind: string; title: string; detail?: string; path?: string }
  | Base<'progress'> & { steps: { text: string; state: 'done' | 'active' | 'pending' | 'failed' }[] }
  | Base<'connect'> & { provider: string; label?: string; state?: '' | 'idle' | 'connecting' | 'connected' | 'error'; error?: string }
  | Base<'email'> & { to: string; subject: string; body: string; state?: string; error?: string }
  | Base<'approval'> & { kind: string; title: string; detail?: string; state?: string; error?: string };
/** kit.js: any item with a string `title` => numbered Needs-you list; otherwise people rows. */
export type TodoItem =
  | { id: string; title: string; detail?: string; action?: string }
  | { id?: string; text: string; who?: string; org?: string; source?: string; person?: boolean; age?: string; unit?: string; state?: '' | 'done' | 'failed'; replyable?: boolean };
export interface StageCard { id: string; utterance: string; status: Status; pinned?: boolean; step?: string; say?: string; receipt?: string; screen?: { title?: string; blocks: Block[] } }
export type StageAction =
  | { kind: 'dismiss' } | { kind: 'open'; blockId?: string; itemId?: string }
  | { kind: 'connect' | 'send' | 'approve' | 'decline' | 'ask'; blockId: string }
  | { kind: 'reply' | 'done' | 'primary'; blockId: string; itemId: string };
export const LIMITS = { maxBlocks: 12, maxCardChars: 64_000, utterance: 600, step: 120, say: 400, receipt: 80, listRows: 6, listCols: 4, sources: 4 } as const;
