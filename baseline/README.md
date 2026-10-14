# Brim — baseline (placeholder name)

An original voice-first notch assistant baseline: a black island that springs out of the MacBook notch, listens, shows a skeleton instantly,
fills it phrase by phrase, reshapes in place, asks before acting, collapses into a receipt with Undo, and plays its own sounds.

**Try it without installing anything:** open `dist/brim.html` in Chrome / Edge / Safari. Click **Demo**, or type a request ("what needs me today?",
"how much is Halden worth?", "draft a reply to Mira"). Press Alt+Space to talk (Web Speech API, Chrome), ⌘/Ctrl+Y for history, and Esc to dismiss.
**Watch it:** `demo.mp4` (35 s, 1280×800, with sound).

```bash
npm install
npm test            # 14 unit tests
npm run build       # typecheck + schema + dist/brim.html
npm run serve       # http://localhost:5173/renderer/index.html?demo
npm start           # Electron overlay at the notch (Alt+Space). BRIM_DEMO=1 to autoplay.
npm run smoke       # headless Electron check (Xvfb on Linux)
npm run screens     # PNGs of every state in screens/
npm run record      # re-record demo.mp4 (needs ffmpeg)
```
Real model: `BRIM_AGENT=claude ANTHROPIC_API_KEY=... npm start`. This path is a stub; see claude/prompts/01-claude-adapter.md.

Docs: `CLAUDE.md` (for Claude Code), `docs/GAPS.md` (gap analysis), `docs/SOUND.md`, `claude/` (prompts, .mcp.json, REPOS.md), `Brim-Baseline-Spec.pdf`.
