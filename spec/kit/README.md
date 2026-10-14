# Jarvis-style GenUI starter kit (original re-implementation)

Built Oct 13, 2026 for Shahzeb Makhdoom. Numbers (sizes, timings, limits, field names) were read from the public
Agently for Mac v0.1.38 release bundle and the promo videos; **all code, sounds and example data here are our own**.
No Agently source is copied.

| Path | What |
|---|---|
| design-tokens.json, tokens.css | colors, type, sizes, island geometry, springs as CSS linear() |
| motion-presets.css, spring.js | m-arrive / m-fade / m-grow / m-draw / m-ghost / m-spin / m-pulse; spring sampler (48 samples) |
| schema/stage-card.schema.json, stage-action.schema.json, stage.ts | contract: card, 13 blocks, actions, limits |
| examples/*.json | one card per block type (+ todo-needsyou.json for the 2nd todo shape) |
| skeleton-rules.json | keyword → skeleton routes (first match wins, else answer) |
| demo.html | single-file demo: notch island (rest/bar/open), alert from notch, voice meter, skeleton → card, reshape, approval, collapse → receipt, 3-job count, droplet effect. `demo.html?gallery` = all 13 blocks |
| sounds/*.wav + sound-design.md | ORIGINAL synthesized placeholder cues |
| mcp.json, components.json.example | Claude Code MCP config (shadcn MCP for @rare-ui, Magic UI, 21st.dev Magic, Playwright) |
| storyboard-template.md | beat sheet for promo videos |
| claude-prompt.md | build prompt for Claude |

Quick start: open `demo.html` in Chrome (timeline runs ~20 s; reload to replay).
Validate a card: `npx ajv-cli validate -s schema/stage-card.schema.json -d examples/todo.json --spec=draft2020`.
RareUI license: MIT + Commons Clause + Attribution (visible link to rareui.com; no reselling components).
