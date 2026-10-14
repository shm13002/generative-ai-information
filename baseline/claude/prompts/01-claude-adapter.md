# M1 — Real agent via Claude Agent SDK
Implement `src/agent/claude-adapter.js`: use `query`, `tool`, `createSdkMcpServer` from `@anthropic-ai/claude-agent-sdk` (verify current
signatures with context7). Register one in-process tool `show_card` whose input schema is `buildSchema().$defs.card`; each call yields
`{v:1, op:'upsert', card}`. Stream partial progress with `patch` (rev must increase). Enable with `BRIM_AGENT=claude` + `ANTHROPIC_API_KEY`.
Add a test with a fake SDK (dependency-inject `query`) — no network in tests. Add a per-request cost/latency record (tokens in/out, ms to first card).
Done when: smoke passes with mock; with a key, "what needs me today?" produces a valid needs-you card.
