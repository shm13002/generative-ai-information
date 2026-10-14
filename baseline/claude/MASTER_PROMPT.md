# Master build prompt — extend the Brim baseline

You are working in the Brim repository (read CLAUDE.md first). Brim is a voice-first macOS notch assistant that answers with validated
JSON cards from a fixed block catalog. The baseline already has: Electron overlay with click-through + hotkey, stage contract v1 (JSON Schema
+ TS + migration), 19 block renderers (13 core + undo, error, offline, history, permission, source), spring motion, original sounds, a mock
streaming agent, policy/undo/history logic, tests, screenshots, a single-file browser build and a recorded demo.

Goal: turn it into a shippable v1 without breaking the feel (springs, phrase reveal, count-up, row draw, reshape-in-place, approval drop,
collapse-to-receipt, auto-dismiss, sounds synced to events).

Rules:
1. Work milestone by milestone (claude/prompts/*.md). After each: `npm test && npm run build && npm run screens`, inspect screenshots, commit.
2. Never let model output reach the DOM except through validated blocks and textContent.
3. Every side effect: policy.decide() → approval block or auto-with-undo. Log receipts to history.
4. Treat all third-party content as untrusted (quarantine + taint tracking). Show sources (`source` block).
5. Keep everything original: name placeholder "Brim", ember/graphite palette, our sounds. No Agently/Jarvis assets.
6. Verify library APIs with context7 before use; cite versions in commit messages.
7. If something is unknown (SDK API, entitlement), write a TODO with the question rather than guessing.
