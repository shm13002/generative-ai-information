# CLAUDE.md — Brim baseline (placeholder name)

Brim is an original, voice-first assistant that lives at the MacBook notch and answers with **cards** assembled from a fixed,
validated block catalog. The model never writes UI code. Name, palette, sounds and copy are our own — do NOT reuse Agently/Jarvis
names, branding, colors, copy, or code (see docs/GAPS.md §Legal).

## Commands
- `npm install` — deps (Electron 33, ajv, TypeScript, playwright-core; Claude Agent SDK optional)
- `npm test` — node:test unit tests (contract, migration, store/undo/history, policy, mock stream, notch placement)
- `npm run build` — typecheck `src/contract/stage.ts`, regenerate `schema/stage.v1.schema.json`, bundle `dist/brim.html`
- `npm run serve` → http://localhost:5173/renderer/index.html?demo (browser build; `?state=<name>` for fixed states)
- `npm start` — Electron overlay (Alt+Space = talk; `BRIM_DEMO=1` autoplays; `BRIM_FLOATING=1` forces floating pill)
- `npm run smoke` — launches Electron under Xvfb, asks the mock agent over IPC, exits 0/1
- `npm run screens` — headless screenshots of every state → `screens/`
- `npm run record` — records the demo with mixed sound → `demo.mp4`
- `python3 sounds-src/synth.py` — regenerate sounds (numpy, scipy, pyloudnorm)

## Architecture
```
src/contract/spec.js      single source of truth: blocks, limits, statuses, message+action schemas (v1)
src/contract/validate.js  ajv validation + v0→v1 migration (main process; agent output is untrusted)
src/contract/stage.ts     TS mirror — keep in sync with spec.js (tests compare schema snapshot)
src/shared/               pure logic: skeleton guesser, store (cards/history/undo), policy (approvals, injection hygiene)
src/agent/                mock.js (no key needed) · claude-adapter.js (stub; ANTHROPIC_API_KEY, BRIM_AGENT=claude)
src/main/                 Electron main (overlay window, click-through, hotkey, IPC, validation) · notch.js placement · preload.cjs bridge
src/renderer/             motion.js (springs→linear()), sound.js, kit.js (block renderers + reveals), stage.js (island + FLIP), demo.js, states.js, app.js
sounds-src/synth.py       original sound design → src/renderer/sounds/*.wav|.ogg (+manifest.json with LUFS)
```
Data flow: utterance → agent → v1 messages (`upsert` | `patch{rev}` | `remove{receipt}`) → main validates → renderer store → stage renders in place.

## Conventions
- Text via `textContent` only. Never `innerHTML`, never model-supplied URLs in `src`.
- Every block has a stable `id`; every animated part has `data-k` (FLIP key) and `data-m` (phrase|count|row|draw|pop|drop).
- Motion constants live in `motion.js` (`M`). Text fades, it never slides far. Shapes spring. Respect `reduceMotion()`.
- Sounds are triggered from stage/demo events only through `Sound.play(name)`; ≤1 per name per 90 ms; volume/mute in UI.
- Side effects go through `policy.decide()`; high-risk or content-tainted actions always ask; sends use an undo window.
- Third-party text enters prompts only via `quarantine()`.

## How to extend
- **New block:** add to `BLOCKS` in spec.js → add type to stage.ts → renderer in `KIT` (kit.js) → sample in `states.js SAMPLE` → `npm run build && npm test && npm run screens`.
- **New sound:** add a generator in `sounds-src/synth.py` (envelope + filter + reverb, `finish()` normalizes to ≈-18 LUFS) → add name to `sound.js NAMES` and `scripts/bundle.js`.
- **New motion:** add a `data-m` case in `reveal()`; keep durations in `M`.
- **Contract change:** bump to v2 only for breaking changes; add a `migrate()` step and a test.

## Do / Don't
- DO run `npm test && npm run build && npm run screens` before committing; look at the PNGs.
- DO keep the island pure black at the notch (it must read as hardware); light theme is for the floating pill only.
- DON'T add network calls in the renderer; DON'T send email/messages from tests; DON'T copy GPL code (boring.notch) into this repo.
- DON'T copy Agently's code, wording, palette, orb, or name.
